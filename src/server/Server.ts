import express, { Request, Response } from "express";
import cors from "cors";
import { generateToken, verifyToken } from "./JwtSession";
import { readFileSync } from 'fs';
import admin from 'firebase-admin';
import { createRequire } from "module";
import { getServerOrigin } from "./GetServerOrigin";

const serverOrigin = getServerOrigin();

const MAX_PROJECTS = 10;
interface projectData {
    title: string,
    description: string,
    imageURL: string,
    createdAt: Date,
}

const require = createRequire(import.meta.url);
const serviceAccount = require("./ServiceAccount.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});
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



const createProject = async (email: string, projectData: projectData) => {
    try {
        const project = db.collection(`users/${email}/projects`);
        const projects = await project.get();
        if (projects.size > MAX_PROJECTS) {
            throw new Error(`Maximum project limit ${MAX_PROJECTS} reached.`);
        }

        const doc = await project.add(projectData);

        console.log(`User: ${email}, created project: ${doc.id}`);
        return doc.id;
    } catch (error) {
        throw new Error("Failed to create project.");
    }
}

app.get("/", (req, res) => {
    console.log(req.body);
    res.send("/");
});

app.post("/api/create", async (req: Request, res: Response) => {
    try {
        const data = req.body;
        const uid = data.uid;

        const user = await admin.auth().getUser(uid);
        const email = user.email;

        if (!email){
            res.status(401).json({ message: "Error matching user id to email." });
            return;
        }

        const projectData: projectData = {
            title: data.projectData?.title || "",
            description: data.projectData?.description || "",
            imageURL: data.projectData?.imageURL || "",
            createdAt: new Date(Date.now()),
        };
        
        const projectId = await createProject(email, projectData);

        res.status(200).json({ message: "Project created.", projectId: projectId });
    } catch (error) {
        console.log("Error when creating project: ", error);
        res.status(500).json({ error: "An error occurred during project creation." });
    }
});

app.post("/api/login", async (req: Request, res: Response) => {
    try {
        const { email } = req.body;

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
        const { uid } = req.query;
        if (!uid) {
            res.status(400).json({ error: "User ID is required", query: uid });
        }

        const userId = String(uid);
        const user = await admin.auth().getUser(userId);
        const email = user.email;

        const projectsRef = db.collection(`users/${email}/projects`);
        const projectsSnapshot = await projectsRef.get();
        const projects = projectsSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                timeCreated: data.timeCreated || null,
                description: data.description || null,
                name: data.name || null,
                imageurl: data.imageurl || null,
            };
        });
        
        res.status(200).json({ projects });
    } catch (error) {
        res.status(500).json({ error: "Failed to load dashboard data." });
    }
});

app.post("/api/project", async (req: Request, res: Response) => {
    try {
        const usersCollection = admin.firestore().collection("users");
        const { projectId, uid } = req.body;
        if (!projectId) {
            res.status(404).json({ error: "Project id not set." });
            return;
        }
        if (!uid) {
            res.status(403).json({ error: "User id not found in session." });
            return;
        }

        const user = await admin.auth().getUser(uid);
        const email = user.email;
        if (!email) {
            res.status(403).json({ error: "Failed to get user email." });
            return;
        }

        const doc = await usersCollection.doc(email).collection("projects").doc(projectId).get();
        if (!doc.exists) {
            res.status(403).json({ error: "You do not own this project." });
            return;
        }

        const projectData = doc.data();
        res.status(200).json({ message: "Project retrieved successfully.", projectData });
    } catch (error) {
        res.status(500).json({ error: "Failed to load project data." });
    }
});


app.post("/api/protected", (req: Request, res: Response) => {
    try {
        const { uid, token } = req.body;

        const verifiedToken = verifyToken(token);
        if(!verifiedToken){
            res.status(401).json({ message: "Token verification failed." });
            return;
        }
        res.status(200).json({ verified: true, uid: uid });
    } catch (error) {
        res.status(401).json({ message: "Unexpected error: ", error });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${config["server-connection"],PORT}`);
});