import express, { Request, Response } from "express";
import cors from "cors";
import { generateToken, verifyToken } from "./JwtSession";
import { readFileSync } from 'fs';
import admin from 'firebase-admin';
import { getServerOrigin, getServiceAccountOrigin, getStaticFilePath } from "./ServerUtils";
import path from 'path';
import { fileURLToPath } from 'url';
import { projectData, stageData, taskData } from "./ServerUtils";


// SETUP    

const serverOrigin = getServerOrigin();
const serviceAccountPath = getServiceAccountOrigin();
let serviceAccount;
try {
    const serviceAccountData = readFileSync(serviceAccountPath, 'utf8');
    serviceAccount = JSON.parse(serviceAccountData);
} catch (error) {
    console.error('Failed to load service account: ', error);
    process.exit(1);
}
admin.initializeApp({credential: admin.credential.cert(serviceAccount)},);

const MAX_PROJECTS = 10;
const db = admin.firestore();
const configPath = './src/server/serverconfig.json';
const config = JSON.parse(readFileSync(configPath, 'utf8'));

const PORT = 3000;
const app = express();

app.use(express.json());
app.use(cors({
    origin: serverOrigin,
    methods: ["GET", "POST", "PUT", "DELETE"],
}));

const filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(filename);
const static_path = getStaticFilePath();
app.use(express.static(path.join(__dirname, static_path)));


// FUNCTIONS

const createProject = async (email: string, projectData: projectData) => {
    try {
        const project = db.collection(`users/${email}/projects`);
        const projectsSnapshot = await project.get();
        const projects = projectsSnapshot.docs;
        if (projects.length > MAX_PROJECTS) {
            throw new Error(`Maximum project limit ${MAX_PROJECTS} reached.`);
        }

        const doc = await project.add(projectData);

        console.log(`User: ${email}, created project: ${doc.id}`);
        return doc.id;
    } catch (error) {
        let errormessage = "Failed to create project.";
        if (error instanceof Error) {
            errormessage = error.message;
        }
        throw new Error(errormessage);
    }
}

const createStage = async (email: string, stageData: stageData, projectID: string) => {
    try {
        const stages = db.collection(`users/${email}/projects/${projectID}/stages`);
        await stages.doc(stageData.stageID).set(stageData);

        console.log(`User: ${email}, created stage: ${stageData.stageID}`);
        return stageData.stageID;
    } catch (error) {
        let errormessage = "Failed to create stage.";
        if (error instanceof Error) {
            errormessage = error.message;
        }
        throw new Error(errormessage);
    }
}

const createTask = async (email: string, taskData: taskData, projectID: string, stageID: string) => {
    try {
        const tasks = db.collection(`users/${email}/projects/${projectID}/stages/${stageID}/tasks`);
        await tasks.doc(taskData.taskID).set(taskData);

        console.log(`User: ${email}, created task: ${taskData.taskID}`);
        return taskData.taskID;
    } catch (error) {
        let errormessage = "Failed to create task.";
        if (error instanceof Error) {
            errormessage = error.message;
        }
        throw new Error(errormessage);
    }
}


// ROUTES

app.post("/api/project", async (req: Request, res: Response) => {
    try {
        const usersCollection = admin.firestore().collection("users");
        const { projectID, token } = req.body;
        if (!projectID) {
            res.status(404).json({ error: "Project id not set." });
            return;
        }
        const verifiedToken = verifyToken(token);
        if(!verifiedToken){
            res.status(401).json({ message: "Token verification failed." });
            return;
        }

        const uid = verifiedToken.userId;
        const user = await admin.auth().getUser(uid);
        const email = user.email;
        if (!email) {
            res.status(403).json({ error: "Failed to get user email." });
            return;
        }

        const projectDoc = await usersCollection
            .doc(email)
            .collection("projects")
            .doc(projectID)
            .get();
        if (!projectDoc.exists) {
            res.status(403).json({ error: "You do not own this project." });
            return;
        }
        let projectData = projectDoc.data();

        const stagesSnapshot = await usersCollection
            .doc(email)
            .collection("projects")
            .doc(projectID)
            .collection("stages")
            .get();
        if (!stagesSnapshot) {
            res.status(403).json({ error: `Problem with fetching stages from project: ${projectID}.` });
            return;
        }

        const stages = await Promise.all(
            stagesSnapshot.docs.map(async (stageDoc) => {
                const stageData = stageDoc.data();
                const tasksSnapshot = await usersCollection
                    .doc(email)
                    .collection("projects")
                    .doc(projectID)
                    .collection("stages")
                    .doc(stageDoc.id)
                    .collection("tasks")
                    .get();
                const tasks = tasksSnapshot.docs.map(taskDoc => ({
                    id: taskDoc.id,
                    ...taskDoc.data()
                }));
                return {
                    id: stageDoc.id,
                    ...stageData,
                    taskList: tasks,
                };
            })
        );

        projectData = { ...projectData, stages };

        res.status(200).json({ message: "Project retrieved successfully.", projectData });
    } catch (error) {
        res.status(500).json({ error: "Failed to load project data." });
    }
});

app.put("/api/project", async (req: Request, res: Response) => {
    try {
        const data = req.body;
        const token = data.token;
        const verifiedToken = verifyToken(token);
        if(!verifiedToken){
            res.status(401).json({ message: "Token verification failed." });
            return;
        }

        const uid = verifiedToken.userId;
        const user = await admin.auth().getUser(uid);
        const email = user.email;
        if (!email){
            res.status(401).json({ message: "Error matching user id to email." });
            return;
        }


        const projectData: projectData = {
            title: data.projectData?.title,
            description: data.projectData?.description,
            createdAt: new Date(Date.now()),
            theme: data.projectData?.theme || "default"
        };
        
        const projectId = await createProject(email, projectData);

        res.status(200).json({ message: "Project created.", projectId: projectId });
    } catch (error) {
        console.log("Error when creating project: ", error);
        res.status(500).json({ error: "An error occurred during project creation." });
    }
});

app.delete("/api/project", async (req: Request, res: Response)=> {
    try {
        const { token, projectID } = req.body;
        const verifiedToken = verifyToken(token);
        if (!verifiedToken) {
            res.status(401).json({ message: "Token verification failed." });
            return;
        }
        const uid = verifiedToken.userId;
        const user = await admin.auth().getUser(uid);
        const email = user.email;
        if (!email) {
            res.status(403).json({ message: "Failed to get user email." });
            return;
        }

        const projectRef = db.collection(`users/${email}/projects`).doc(projectID);
        const projectDoc = await projectRef.get();
        if (!projectDoc.exists) {
            res.status(404).json({ error: "Project not found." });
            return;
        }

        await projectRef.delete();
        console.log(`User: ${email}, deleted project: ${projectID}`);
        res.status(200).json({ message: "Project deleted successfully." });
    } catch (error) {
        console.log("An error occurred during project deletion: ", error);
        res.status(500).json({ error: "An error occurred during project deletion." });
    }
});

app.post("/api/stage", async (req: Request, res: Response) => {
    try {
        const data = req.body;
        const token = data.token;
        const verifiedToken = verifyToken(token);
        if(!verifiedToken){
            res.status(401).json({ message: "Token verification failed." });
            return;
        }

        const uid = verifiedToken.userId;
        const user = await admin.auth().getUser(uid);
        const email = user.email;
        if (!email){
            res.status(401).json({ message: "Error matching user id to email." });
            return;
        }

        const stage = data.newStage;
        const projectID = data.projectID;

        if (!stage) {
            res.status(401).json({ message: "Missing stage data." });
            return;
        }
        if (!projectID) {
            res.status(401).json({ message: "Missing project ID." });
            return;
        }

        const docid = createStage(email, stage, projectID);
        console.log(`Stage ${docid} added succesfully.`)

        res.status(200).json({ message: "Stage added succesfully.", docid });
    } catch (error) {
        console.log("Error when creating stage: ", error);
        res.status(500).json({ error: "An error occurred during stage creation." });
    }
});

app.delete("/api/stage", async (req: Request, res: Response)=> {
    try {
        const { projectID, stageID, token } = req.body;
        const verifiedToken = verifyToken(token);
        if (!verifiedToken) {
            res.status(401).json({ message: "Token verification failed." });
            return;
        }
        const uid = verifiedToken.userId;
        const user = await admin.auth().getUser(uid);
        const email = user.email;
        if (!email) {
            res.status(403).json({ message: "Failed to get user email." });
            return;
        }

        const stageRef = db.collection(`users/${email}/projects/${projectID}/stages`).doc(stageID);
        const stageDoc = await stageRef.get();
        if (!stageDoc.exists) {
            res.status(404).json({ error: "Stage not found." });
            return;
        }
        
        await stageRef.delete();
        console.log(`User: ${email}, deleted stage: ${stageID}`);
        res.status(200).json({ message: "Stage deleted successfully." });
    } catch (error) {
        console.log("An error occurred during stage deletion: ", error);
        res.status(500).json({ error: "An error occurred during stage deletion." });
    }
});

app.post("/api/task", async (req: Request, res: Response) => {
    try {
        const data = req.body;
        const token = data.token;
        const verifiedToken = verifyToken(token);
        if(!verifiedToken){
            res.status(401).json({ message: "Token verification failed." });
            return;
        }

        const uid = verifiedToken.userId;
        const user = await admin.auth().getUser(uid);
        const email = user.email;
        if (!email){
            res.status(401).json({ message: "Error matching user id to email." });
            return;
        }

        const task = data.newTask;
        const stageID = data.stageID;
        const projectID = data.projectID;
        if (!task) {
            res.status(401).json({ message: "Missing task data." });
            return;
        }
        if (!stageID) {
            res.status(401).json({ message: "Missing stage ID." });
            return;
        }
        if (!projectID) {
            res.status(401).json({ message: "Missing project ID." });
            return;
        }

        const docid = createTask(email, task, projectID, stageID);
        console.log(`Task ${docid} added succesfully.`);
        res.status(200).json({ message: "Stage added succesfully.", docid });
    } catch (error) {
        console.log("Error when creating task: ", error);
        res.status(500).json({ error: "An error occurred during task creation." });
    }
});

app.put("/api/task", async (req: Request, res: Response) =>{
    try {
        const { token, projectID, sourceID, destID, task } = req.body;
        const verifiedToken = verifyToken(token);
        if(!verifiedToken) {
            res.status(401).json({ message: "Token verification failed." });
            return;
        }

        const uid = verifiedToken.userId;
        const user = await admin.auth().getUser(uid);
        const email = user.email;
        if (!email) {
            res.status(401).json({ message: "Error matching user id to email." });
            return;
        }

        if (!task) {
            res.status(401).json({ message: "No task set." });
            return;
        }
        if (task.id) {
            delete task.id;
        }
        const taskRef = db.collection(`users/${email}/projects/${projectID}/stages/${sourceID}/tasks`).doc(task.taskID);
        const taskDoc = await taskRef.get();
        if (!taskDoc.exists) {
            res.status(404).json({ error: "Task not found." });
            return;
        }
        
        await taskRef.delete();

        createTask(email, task, projectID, destID);
        res.status(200).json({ message: "Successfully updated task." });
    }
    catch (error) {
        res.status(500).json({ message: "Error updating task.", error });
    }
});

app.delete("/api/task", async (req: Request, res: Response)=> {
    try {
        const { projectID, stageID, taskID, token } = req.body;
        const verifiedToken = verifyToken(token);
        if (!verifiedToken) {
            res.status(401).json({ message: "Token verification failed." });
            return;
        }
        const uid = verifiedToken.userId;
        const user = await admin.auth().getUser(uid);
        const email = user.email;
        if (!email) {
            res.status(403).json({ message: "Failed to get user email." });
            return;
        }

        const taskRef = db.collection(`users/${email}/projects/${projectID}/stages/${stageID}/tasks`).doc(taskID);
        const taskDoc = await taskRef.get();
        if (!taskDoc.exists) {
            res.status(404).json({ error: "Task not found." });
            return;
        }
        
        await taskRef.delete();
        console.log(`User: ${email}, deleted task: ${taskID}`);
        res.status(200).json({ message: "Task deleted successfully." });
    } catch (error) {
        console.log("An error occurred during task deletion: ", error);
        res.status(500).json({ error: "An error occurred during task deletion." });
    }
});

app.post("/api/login", async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body; 
        console.log(password);
        const userRecord = await admin.auth().getUserByEmail(email);
        const uid = userRecord.uid;

        //session valid for 1 hour
        const token = generateToken({ userId: uid, email: email }, "1h");
        res.status(200).json({ uid, token });
    } catch (error) {
        console.log("Error when logging in: ", error);
        res.status(500).json({ error: "An error occurred during login." });
    }
});


app.get("/api/dashboard", async (req: Request, res: Response) => {
    try {
        const token = String(req.query.token);
        
        const verifiedToken = verifyToken(token);
        if(!verifiedToken){
            res.status(401).json({ message: "Token verification failed." });
            return;
        }

        const uid = verifiedToken.userId;
        const user = await admin.auth().getUser(uid);
        const email = user.email;
        if (!email){
            res.status(401).json({ message: "Error matching user id to email." });
            return;
        }

        const projectsRef = db.collection(`users/${email}/projects`);
        const projectsSnapshot = await projectsRef.get();
        const projects = projectsSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                createdAt: data.createdAt,
                description: data.description,
                name: data.title,
                imageurl: data.imageURL,
            };
        });
        
        res.status(200).json({ projects });
    } catch (error) {
        res.status(500).json({ error: "Failed to load dashboard data." });
    }
});


app.post("/api/protected", async (req: Request, res: Response) => {
    try {
        const { token } = req.body;

        const verifiedToken = verifyToken(token);
        if(!verifiedToken){
            res.status(401).json({ message: "Token verification failed." });
            return;
        }
        const uid = verifiedToken.userId;
        const user = await admin.auth().getUser(uid);
        if(!user){
            res.status(401).json({ message: "Invalid session user ID." });
            return;
        }

        res.status(200).json({ verified: true, uid });
    } catch (error) {
        res.status(500).json({ message: "Unexpected error: ", error });
    }
});


// Catch-all route

app.get('*', (_req, res) => {
    try {
        res.sendFile(path.join(__dirname, static_path, 'index.html'));
    } catch (error) {
        res.status(404).json({ message: "Unexpected error: ", error });
    }
});


// SERVER ENTRY

app.listen(PORT, () => {
    console.log(`Server is running on port ${config["server-connection"],PORT}`);
});