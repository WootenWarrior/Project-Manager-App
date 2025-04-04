import express, { Request, Response } from "express";
import cors from "cors";
import { generateToken, verifyToken } from "./JwtSession";
import { readFileSync } from 'fs';
import admin from 'firebase-admin';
import { getServerOrigin, getServiceAccountOrigin, getStaticFilePath } from "./ServerUtils";
import path from 'path';
import { fileURLToPath } from 'url';
import { projectData, stageData, taskData } from "./ServerUtils";
import fs from 'fs';
import multer from "multer";
import axios from "axios";
import { JwtPayload } from "jsonwebtoken";
import { rateLimit } from 'express-rate-limit';



// Server setup-----------------------------------------------------------------|

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
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.VITE_APP_STORAGE_BUCKET,
});

const MAX_PROJECTS = 10;
const MAX_FILE_NUM = 10;
const db = admin.firestore();
const configPath = './src/server/serverconfig.json';
const config = JSON.parse(readFileSync(configPath, 'utf8'));

const PORT = 3000;
const app = express();
app.use(express.json());
app.use(cors({
    origin: [serverOrigin],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
}));
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 3,
    message: "Too many login attempts. Try again later.",
});
app.use("/api/login", loginLimiter);


// Static serving-----------------------------------------------------------------|

const filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(filename);
const static_path = getStaticFilePath();
app.use(express.static(path.join(__dirname, static_path)));


// Bucket-----------------------------------------------------------------------|

const MAX_FILE_SIZE = 2 * 1024 * 1024;
const bucket = admin.storage().bucket();
const upload = multer({ storage: multer.memoryStorage() });


// FUNCTIONS-------------------------------------------------------------------|

const createProject = async (email: string, projectData: projectData) => {
    try {
        const project = db.collection(`users/${email}/projects`);
        const projectsSnapshot = await project.get();
        const projects = projectsSnapshot.docs;
        if (projects.length > MAX_PROJECTS) {
            throw new Error(`Maximum project limit ${MAX_PROJECTS} reached.`);
        }

        const doc = await project.add(projectData);

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

        return taskData.taskID;
    } catch (error) {
        let errormessage = "Failed to create task.";
        if (error instanceof Error) {
            errormessage = error.message;
        }
        throw new Error(errormessage);
    }
}

const deleteAllStages = async (email: string, projectID: string) => {
    try {
        const stages = db.collection(`users/${email}/projects/${projectID}/stages`);
        const snapshot = await stages.get();
        for (const stageDoc of snapshot.docs) {
            await deleteAllTasks(email, projectID, stageDoc.id);
            await deleteAllAttachments(email, projectID, stageDoc.id);
            await stageDoc.ref.delete();
        }
    } catch (error) {
        let errormessage = "Failed to delete stages.";
        if (error instanceof Error) {
            errormessage = error.message;
        }
        throw new Error(errormessage);
    }
}

const deleteAllTasks = async (email: string, projectID: string, stageID: string) => {
    try {
        const tasks = db.collection(`users/${email}/projects/${projectID}/stages/${stageID}/tasks`);
        const snapshot = await tasks.get();
        for (const taskDoc of snapshot.docs) {
            await taskDoc.ref.delete();
        }
    } catch (error) {
        let errormessage = "Failed to delete tasks.";
        if (error instanceof Error) {
            errormessage = error.message;
        }
        throw new Error(errormessage);
    }
}

const deleteAllAttachments = async (email: string, projectID: string, stageID: string) => {
    try {
        const attachments = db.collection(`users/${email}/projects/${projectID}/stages/${stageID}/attachments`);
        const snapshot = await attachments.get();
        for (const attachmentsDoc of snapshot.docs) {
            await attachmentsDoc.ref.delete();
        }

        const folderPath = `userUploads/${email}/${projectID}/${stageID}`;
        const [files] = await bucket.getFiles({ prefix: folderPath });
        if (!files || files.length <= 0) {
            return;
        }
        for (const file of files) {
            await file.delete();
        }
    } catch (error) {
        let errormessage = "Failed to delete tasks.";
        if (error instanceof Error) {
            errormessage = error.message;
        }
        throw new Error(errormessage);
    }
}

const getUrgentTask = async (email: string) => {
    try {
        let urgentTask = null;
        let minRemainingTime = Infinity;

        const usersCollection = admin.firestore().collection("users");
        const projectsSnapshot = await usersCollection.doc(email)
            .collection("projects")
            .get();
        for (const projectDoc of projectsSnapshot.docs) {
            const projectID = projectDoc.id;
            const projectName = projectDoc.data().title;

            const stagesSnapshot = await usersCollection
                .doc(email)
                .collection("projects")
                .doc(projectID)
                .collection("stages")
                .get();
            if (!stagesSnapshot) {
                throw new Error(`Problem with fetching stages from project: ${projectID}.`);
            }

            for (const stageDoc of stagesSnapshot.docs) {
                const stageID = stageDoc.id;
                const tasksSnapshot = await usersCollection
                    .doc(email)
                    .collection("projects")
                    .doc(projectID)
                    .collection("stages")
                    .doc(stageID)
                    .collection("tasks")
                    .get();
                if (!tasksSnapshot) {
                    throw new Error(`Problem with fetching tasks from stage: ${stageDoc.id}.`);
                }
        
                tasksSnapshot.forEach(taskDoc => {
                    const task = taskDoc.data();
                    const endDateTime = new Date(`${task.endDate}T${task.endTime}:00`).getTime();
                    const currentTime = Date.now();
                    const remainingTime = endDateTime - currentTime;

                    if (remainingTime > 0 && remainingTime < minRemainingTime) {
                        minRemainingTime = remainingTime;
                        urgentTask = { 
                            id: taskDoc.id, 
                            remainingTime: remainingTime, 
                            name: task.name,
                            projectName
                        };
                    }
                });
            }
        }

        if (urgentTask) {
            return urgentTask;
        } else {
            return null;
        }
    } catch (error) {
        throw new Error("Failed to get urgent task.");
    }
}


// ROUTES

// FILES----------------------------------------------------------------------------|
app.post("/api/file", upload.single('file'), async (req: Request, res: Response) => {
    const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg", "application/pdf", "text/plain",];
    try {
        const { token, projectID, stageID, attachmentData } = req.body;
        const file = req.file;
        if (file?.mimetype && !ALLOWED_TYPES.includes(file.mimetype)) {
            res.status(400).json({ error: 'Invalid file type.' });
            return;
        }
        if (!file) {
            res.status(400).json({ error: 'No file uploaded.' });
            return;
        }
        if (file.size > MAX_FILE_SIZE) {
            res.status(400).json({ error: 'File size exceeds the 2MB limit.' });
            return;
        }

        if (!projectID || typeof projectID !== "string") {
            res.status(400).json({ error: "Project ID not provided or invalid." });
            return;
        }
        if (!token || typeof token !== "string") {
            res.status(400).json({ error: "Token not provided or invalid." });
            return;
        }
        const verifiedToken = verifyToken(token);
        if(!verifiedToken) {
            res.status(401).json({ error: "Token verification failed." });
            return;
        }
        const uid = verifiedToken.userId;
        const user = await admin.auth().getUser(uid);
        const email = user.email;
        if (!email) {
            res.status(403).json({ error: "Failed to get user email." });
            return;
        }
        
        const ID = "attachment-" + Date.now();

        const folderPath = `userUploads/${email}/${projectID}/${stageID}`;
        const [files] = await bucket.getFiles({ prefix: folderPath });
        if (files.length > MAX_FILE_NUM) {
            res.status(403).json({ error: "User has max files uploaded.", maxFiles: MAX_FILE_NUM });
            return;
        }

        const isExistingFile = files.some((userFile) => ID === userFile.name);
        if (isExistingFile) {
            res.status(403).json({ error: "File already exists." });
            return;
        }

        const destination = `${folderPath}/${ID}`;
        const fileUpload = bucket.file(destination);
        await fileUpload.save(file.buffer, {
            metadata: { contentType: file.mimetype },
            public: true,
        });
        await fileUpload.makePublic();
        const url = admin.storage().bucket().file(destination).publicUrl();

        let parsedAttachmentData = JSON.parse(attachmentData);
        parsedAttachmentData.attachment = url;
        const attachments = db.collection(`users/${email}/projects/${projectID}/stages/${stageID}/attachments`);
        await attachments.doc(ID).set(parsedAttachmentData);

        res.status(200).json({ message: 'File uploaded successfully.', 
            url, mimetype: file.mimetype, attachmentID: ID });
    } catch (error) {
        res.status(500).json({ error: "Unexpected error when creating file." });
    }
});

app.put("/api/file", async (req: Request, res: Response) => {
    try {
        const { token, projectID, sourceID, destID, attachmentData } = req.body;
        if (!token) {
            res.status(400).json({ error: "Token not provided or invalid." });
            return;
        }
        const verifiedToken = verifyToken(token);
        if(!verifiedToken) {
            res.status(401).json({ error: "Token verification failed." });
            return;
        }
        const uid = verifiedToken.userId;
        const user = await admin.auth().getUser(uid);
        const email = user.email;
        if (!email) {
            res.status(403).json({ error: "Failed to get user email." });
            return;
        }

        const attachmentID = attachmentData.attachmentID;
        if (!attachmentID) {
            res.status(400).json({ error: "Attachment ID not provided or invalid." });
            return;
        }

        const attachments = db.collection(`users/${email}/projects/${projectID}/stages/${sourceID}/attachments`);
        const attachmentRef = attachments.doc(attachmentID);
        const attachmentSnapshot = await attachmentRef.get();
        if (attachmentSnapshot.exists) {
            await attachmentRef.delete();
        }

        const newAttachments = db.collection(`users/${email}/projects/${projectID}/stages/${destID}/attachments`);
        const newAttachment = newAttachments.doc(attachmentID);
        await newAttachment.set({ ...attachmentData  }, { merge: true });

        res.status(200).json({ message: "Successfully updated attachment." });
    } catch (error) {
        res.status(500).json({ error: "Unexpected error when updating file." });
    }   
});

app.delete("/api/file", async (req: Request, res: Response) => {
    try {
        const { token, projectID, stageID, attachmentID } = req.body;
        if (!projectID || typeof projectID !== "string") {
            res.status(400).json({ error: "Project ID not provided or invalid." });
            return;
        }
        if (!token || typeof token !== "string") {
            res.status(400).json({ error: "Token not provided or invalid." });
            return;
        }
        const verifiedToken = verifyToken(token);
        if(!verifiedToken) {
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

        const folderPath = `userUploads/${email}/${projectID}/${stageID}/${attachmentID}`;
        const file = bucket.file(folderPath);
        const [exists] = await file.exists();
        if (!exists) {
            res.status(404).json({ error: "File not found." });
            return;
        }
        const deletedFile = await file.delete();
        if (!deletedFile) {
            res.status(403).json({ error: "Failed to delete attachment data." });
            return;
        }

        const attachments = db.collection(`users/${email}/projects/${projectID}/stages/${stageID}/attachments`);
        const attachmentSnapshot = await attachments.doc(attachmentID).get();
        if (!attachmentSnapshot.exists) {
            res.status(404).json({ error: "Attachment data not found." });
            return;
        }
        const deletedAttachment = await attachmentSnapshot.ref.delete();
        if (!deletedAttachment) {
            res.status(403).json({ error: "Failed to delete attachment data." });
            return;
        }

        res.status(200).json({ message: 'File deleted successfully.' });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete file." });
    }
});


// PROJECT----------------------------------------------------------------------------|
app.get("/api/project", async (req: Request, res: Response) => {
    try {
        const usersCollection = admin.firestore().collection("users");
        const { projectID, token } = req.query;
        if (!projectID || typeof projectID !== "string") {
            res.status(400).json({ error: "Project ID not provided or invalid." });
            return;
        }
        if (!token || typeof token !== "string") {
            res.status(400).json({ error: "Token not provided or invalid." });
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

                const attachmentsSnapshot = await usersCollection
                    .doc(email)
                    .collection("projects")
                    .doc(projectID)
                    .collection("stages")
                    .doc(stageDoc.id)
                    .collection("attachments")
                    .get();
                const attachments = attachmentsSnapshot.docs.map(attachmentDoc => ({
                    id: attachmentDoc.id,
                    ...attachmentDoc.data()
                }));

                return {
                    id: stageDoc.id,
                    ...stageData,
                    taskList: tasks,
                    attachmentList: attachments,
                };
            })
        );

        projectData = { ...projectData, stages };

        res.status(200).json({ message: "Project retrieved successfully.", projectData });
    } catch (error) {
        res.status(500).json({ error: "Failed to load project data." });
    }
});

app.post("/api/project", async (req: Request, res: Response) => {
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
            theme: data.projectData?.theme
        };
        
        const projectId = await createProject(email, projectData);

        res.status(200).json({ message: "Project created.", projectId: projectId });
    } catch (error) {
        res.status(500).json({ error: "An error occurred during project creation." });
    }
});

app.put("/api/project", async (req: Request, res: Response) => {
    try {
        const { token, projectID, projectData } = req.body;
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

        const projects = db.collection(`users/${email}/projects`);
        const projectRef = projects.doc(projectID);
        if (!projectRef) {
            res.status(404).json({ error: "Project not found." });
            return;
        }
        await projectRef.set({...projectData}, { merge: true });
    } catch (error) {
        res.status(500).json({ error: "An error occurred during project updating." });
    }
});

app.delete("/api/project", async (req: Request, res: Response) => {
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
        
        await deleteAllStages(email, projectID);
        await projectRef.delete();

        res.status(200).json({ message: "Project deleted successfully." });
    } catch (error) {
        res.status(500).json({ error: "An error occurred during project deletion." });
    }
});


// STAGE----------------------------------------------------------------------------|
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

        res.status(200).json({ message: "Stage added succesfully.", docid });
    } catch (error) {
        res.status(500).json({ error: "An error occurred during stage creation." });
    }
});

app.put("/api/stage", async (req: Request, res: Response) => {
    try {
        const { token, projectID, stageID, stageData } = req.body;
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

        const stages = db.collection(`users/${email}/projects/${projectID}/stages`);
        const stageRef = stages.doc(stageID);
        await stageRef.set({...stageData, stageName: stageData.name}, { merge: true });

        res.status(200).json({ message: "Successfully updated stage.", stageID });
    } catch (error) {
        res.status(500).json({ error: "An error occurred trying to update stage." });
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
        
        await deleteAllTasks(email, projectID, stageID);
        await deleteAllAttachments(email, projectID, stageID);
        await stageRef.delete();
        res.status(200).json({ message: "Stage deleted successfully." });
    } catch (error) {
        res.status(500).json({ error: "An error occurred during stage deletion." });
    }
});


// TASK----------------------------------------------------------------------------|
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
        res.status(200).json({ message: "Stage added succesfully.", docid });
    } catch (error) {
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

        res.status(200).json({ message: "Task deleted successfully." });
    } catch (error) {
        res.status(500).json({ error: "An error occurred during task deletion." });
    }
});


// USER SIGNUP/LOGIN----------------------------------------------------------------------------|

app.post("/api/login", async (req: Request, res: Response) => {
    try {
        const { email, password, time } = req.body; 
        const response = await axios.post(
            `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.VITE_APP_API_KEY}`,
            { email, password, returnSecureToken: false }
        );

        if (response.status !== 200) {
            res.status(500).json({ error: "Incorrect password." });
        }
        const userRecord = await admin.auth().getUserByEmail(email);
        const uid = userRecord.uid;

        let token;
        if (time) {
            token = generateToken({ userId: uid, email: email }, "24h");
        }
        else {
            token = generateToken({ userId: uid, email: email }, "1h");
        }

        res.status(200).json({ uid, token });
    } catch (error) {
        res.status(500).json({ error: "An error occurred during login." });
    }
});

// DASHBOARD----------------------------------------------------------------------------|
app.get("/api/dashboard", async (req: Request, res: Response) => {
    try {
        const token = String(req.query.token);
        
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

        const projectsRef = db.collection(`users/${email}/projects`);
        const projectsSnapshot = await projectsRef.get();
        const projects = projectsSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                createdAt: data.createdAt,
                description: data.description,
                name: data.title,
                theme: data.theme
            };
        });

        const urgentTask = await getUrgentTask(email);
        
        res.status(200).json({ projects, urgentTask });
    } catch (error) {
        res.status(500).json({ error: "Failed to load dashboard data." });
    }
});


// PROTECTED----------------------------------------------------------------------------|
app.get("/api/protected", async (req: Request, res: Response) => {
    try {
        const token = String(req.query.token);
        const userID = String(req.query.uid);

        const verifiedToken = verifyToken(token);
        if(!verifiedToken){
            res.status(401).json({ message: "Token verification failed." });
            return;
        }
        const uid = verifiedToken.userId;
        if (uid !== userID) {
            res.status(401).json({ message: "User ID." });
            return;
        }
        const user = await admin.auth().getUser(uid);
        if(!user){
            res.status(401).json({ message: "Invalid session user ID." });
            return;
        }

        res.status(200).json({ verified: true });
    } catch (error) {
        res.status(500).json({ message: "Unexpected error when verifying token." });
    }
});


// THEMES----------------------------------------------------------------------------|
app.put("/api/theme", async (req: Request, res: Response) => {
    try {
        const { projectID, token, theme } = req.body;


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
        const email = user.email;
        if (!email) {
            res.status(403).json({ message: "Failed to get user email." });
            return;
        }

        const usersCollection = admin.firestore().collection("users");
        const projectRef = usersCollection
            .doc(email)
            .collection("projects")
            .doc(projectID);
        await projectRef.update({
            theme: theme
        });

        res.status(200).json({ message: "Theme updated successfully." });
    } catch (error) {
        res.status(500).json({ message: "Unexpected error when updating theme." });
    }
});

app.get("/api/theme", async (req: Request, res: Response) => {
    try {
        const token = String(req.query.token);
        const projectID = String(req.query.projectID);

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
        const email = user.email;
        if (!email) {
            res.status(403).json({ message: "Failed to get user email." });
            return;
        }

        const usersCollection = admin.firestore().collection("users");
        const projectRef = usersCollection
            .doc(email)
            .collection("projects")
            .doc(projectID);
        const projectSnapshot = await projectRef.get();

        if (!projectSnapshot.exists) {
            res.status(401).json({ message: "Failed to get project." });
            return;
        }

        const projectData = projectSnapshot.data();
        if (!projectData) {
            res.status(401).json({ message: "Failed to get project data." });
            return;
        }

        res.status(200).json({ theme: projectData.theme });
    } catch (error) {
        res.status(500).json({ message: "Unexpected error when getting theme." });
    }
});

// TEST----------------------------------------------------------------------------|
app.delete('/api/user', async (req, res) => {
    try {
        const { email, password } = req.body;
        const adminPassword = process.env.VITE_APP_ADMIN_PASSWORD;
        if (!password || adminPassword !== password) {
            res.status(401).json({ message: 'Invalid admin password.' });
            return;
        }
        
        const user = await admin.auth().getUserByEmail(email);
        const uid = user.uid;
        await admin.auth().deleteUser(uid);
        res.status(200).json({ message: 'User deleted successfully.' });
    } catch (error) {
        res.status(404).json({ message: "Unexpected error when deleting user." });
    }
});

app.post("/api/signup", async (req: Request, res: Response) => {
    try {
        const { email } = req.body;
        const userRecord = await admin.auth().getUserByEmail(email);
        await admin.auth().updateUser(userRecord.uid, { disabled: true });
        res.status(200).json({ message: "Account disabled successfully." });
    }
    catch {
        res.status(500).json({ error: "Account not disabled successfully." });
    }
});

app.post("/api/activate", async (req: Request, res: Response) => {
    try {
        const { email } = req.body;
        const user = await admin.auth().getUserByEmail(email);
        const uid = user.uid;

        const payload: JwtPayload = {
            uid,
            email
        }
        
        const token = generateToken(payload, "24h");
        await admin.auth().updateUser(uid, { disabled: false });

        res.status(200).json({ message: "Account activated successfully.", token });
    } catch (error) {
        res.status(500).json({ error: "Problem when trying to activate account. Link may be invalid." });
    }
});

app.get("/api/mobile-restrict", async (req: Request, res: Response) => {
    try {
        const token = String(req.query.token);
        const userAgent = String(req.query.userAgent);

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

        if(!userAgent){
            res.status(401).json({ message: "Invalid user agent." });
            return;
        }

        const isMobile = /mobile|android|iphone|ipad/i.test(userAgent);
        if (isMobile) {
            res.status(403).json({ verified: false, uid });
            return;
        }
        res.status(200).json({ verified: true, uid });
    }
    catch (error) {
        res.status(500).json({ message: "Unexpected error when verifying token." });
    }
});

// CATCH-ALL----------------------------------------------------------------------------|

app.get('*', (_req, res) => {
    try {
        const filePath = path.join(__dirname, static_path, 'index.html');
        if (!fs.existsSync(filePath)) {
            throw new Error(`File not found: ${filePath}`);
        }
        res.sendFile(path.join(__dirname, static_path, 'index.html'));
    } catch (error) {
        res.status(404).json({ message: "Unexpected error when loading page." });
    }
});


// SERVER 

app.listen(PORT, () => {
    console.log(`Server is running on port ${config["server-connection"],PORT}`);
});