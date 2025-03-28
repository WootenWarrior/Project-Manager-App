import { useNavigate, useParams } from "react-router-dom";
import "../styles/pages/Project.css";
import { useEffect, useState } from "react";
import { URL } from "../utils/BackendURL";
import { Stage, Button, Input, HiddenMenu, 
    TimeInput, DateInput, Textbox, ThemeChanger,
    BackgroundWaves
} from "../components/index";
import { TaskProps, StageProps, AttachmentProps } from "../utils/Interfaces";
import { FaPlus, FaRegTrashCan, FaX } from "react-icons/fa6";
import { FaArrowCircleLeft, FaSave } from "react-icons/fa";
import { DndContext, DragEndEvent, DragStartEvent, useSensor, useSensors, PointerSensor } from "@dnd-kit/core";
import { Loading } from "./index";
import { IoColorPalette } from "react-icons/io5";
import { TiTick } from "react-icons/ti";



function Project() {
    const MAX_FILE_SIZE = 2 * 1024 * 1024;
    const navigate = useNavigate();
    const { projectID } = useParams();
    const [projectTitle, setProjectTitle] = useState("");
    const token = sessionStorage.getItem("token") || localStorage.getItem("token");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [uploading, setUploading] = useState(false);
    const [_draggingActive, _setDraggingActive] = useState(false);
    const [_selecting, _setSelecting] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [stages, setStages] = useState<StageProps[]>([]);
    const [themeMenuActive, setThemeMenuActive] = useState(false);
    const [taskMenuActive, setTaskMenuActive] = useState(false);
    const [stageMenuActive, setStageMenuActive] = useState(false);
    const [taskEditActive, setTaskEditActive] = useState(false);
    const [stageEditActive, setStageEditActive] = useState(false);
    const [attachmentMenuActive, setAttachmentMenuActive] = useState(false);
    const [attachmentEditActive, setAttachmentEditActive] = useState(false);
    const [_attachmentEditActive, _setAttachmentEditActive] = useState(false);
    const [confirmTaskMenuActive, setConfirmTaskMenuActive] = useState(false);
    const [confirmStageMenuActive, setConfirmStageMenuActive] = useState(false);
    const [completeMenuActive, setCompleteMenuActive] = useState(false);
    const [_restoreMenuActive, setRestoreMenuActive] = useState(false);
    const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
    const [selectedStageId, setSelectedStageId] = useState<string | null>(null);
    const [selectedAttachmentId, setSelectedAttachmentId] = useState<string | null>(null);
    const [_completeTaskSelected, setCompleteTaskSelected] = useState<string | null>(null);
    const [taskStart, setTaskStart] = useState<{ date: string; time: string }>({
        date: new Date().toISOString().split("T")[0],
        time: new Date().toTimeString().slice(0, 5),
    });
    const [taskEnd, setTaskEnd] = useState<{ date: string; time: string }>({
        date: (() => {
            const date = new Date();
            date.setDate(date.getDate() + 7);
            return date.toISOString().split("T")[0];
        })(),
        time: new Date().toTimeString().slice(0, 5),
    });
    const [taskName, setTaskName] = useState("");
    const [stageName, setStageName] = useState("");
    const [taskDescription, setTaskDescription] = useState("");
    const [filterText, setFilterText] = useState("");
    const [updatedProject, setUpdatedProject] = useState<{
        title: string
    }>({
        title: ""
    });
    const [updatedTask, setUpdatedTask] = useState<{
        name: string,
        status: boolean,
        description: string,
        color: string,
        stageName: string
    }>({ name: "", status: false, description: "", color: "", stageName });
    const [updatedStage, setUpdatedStage] = useState<{
        name: string
        color: string
    }>({ name: "", color: "" });
    const [updatedAttachment, setUpdatedAttachment] = useState<{
        name: string,
        newURL: string,
        mimeType: string
    }>({ name: "", newURL: "", mimeType: "" });
    const sensors = useSensors(useSensor(PointerSensor, {
        activationConstraint: { distance: 10 }
    }));
    const [draggingObjectData, setDraggingObjectData] = useState<{
        type: string | null,
        id: string | null
    }>({type: null, id: null});
    const completedTasks = stages.flatMap((stage) =>
        stage.taskList.filter((task) => task.completed)
    );

    if (!projectID) {
        console.log("No project ID set.");
        navigate("/Dashboard");
        return;
    }


    // MENU TOGGLES

    const showTaskMenu = (stageID: string) => {
        setSelectedStageId(stageID);
        setTaskMenuActive(true);
    }

    const showTaskEdit = (stageID: string, taskID: string) => {
        setSelectedTaskId(taskID);
        setSelectedStageId(stageID);
        setTaskEditActive(true);
        setSelectedFile(null);

        const stageObject = stages.find((stage) => stage.stageID === stageID);
        const task = stageObject?.taskList.find((task) => task.taskID === taskID) || null;

        const description = task?.description || "";
        const name = task?.name || "";
        const status = task?.completed || false;
        const color = task?.color || "";
        const stageName = stageObject?.stageName || "";
        
        setUpdatedTask(({ status, name, description, color, stageName }));
    }

    const hideTaskEdit = () => {
        setTaskEditActive(false);
        setSelectedTaskId(null);
        setSelectedStageId(null);
        setUpdatedTask({ 
            status: false, 
            name: "", 
            description: "", 
            color: "",
            stageName: ""
        });
    }

    const showStageEdit = (stageID: string) => {
        const stageObject = stages.find((stage) => stage.stageID === stageID);
        const name = stageObject?.stageName || "";
        const color = stageObject?.color || "";

        setUpdatedStage(({ name, color }));
        setSelectedStageId(stageID);
        setStageEditActive(true);
    }

    const hideStageEdit = () => {
        setSelectedStageId(null);
        setStageEditActive(false);
    }

    const showAttachmentMenu = (stageID: string) => {
        setSelectedStageId(stageID);
        setAttachmentMenuActive(true);
    }

    const hideAttachmentMenu = () => {
        setSelectedStageId(null);
        setSelectedAttachmentId(null);
        setAttachmentMenuActive(false);
    }

    const showAttachmentEdit = (stageID: string, attachmentID: string) => {
        setSelectedStageId(stageID);
        setSelectedAttachmentId(attachmentID);
        setAttachmentEditActive(true);

        const stageObject = stages.find((stage) => stage.stageID === stageID);
        const attachment = stageObject?.attachmentList.find((attachment) => attachment.attachmentID === attachmentID) || null;

        setUpdatedAttachment(({ name: attachment?.name || "", 
            newURL: attachment?.attachment || "" ,
            mimeType: attachment?.mimeType || ""
        }));
    }

    const hideAttachmentEdit = () => {
        setSelectedStageId(null);
        setSelectedAttachmentId(null);
        setAttachmentEditActive(false);
    }




    // API CALL FUNCTIONS

    const addStage = async () => {
        const stageID = `stage-${Date.now()}`;

        let stageTitle = stageName;
        if (stageTitle === "") {
            stageTitle = "Stage " + (stages.length + 1);
        }
        const newStage: StageProps = {
            stageID: stageID,
            stageName: stageTitle,
            taskList: [],
            attachmentList: [],
            showTaskMenu,
            showTaskEdit,
            showStageEdit,
            showAttachmentMenu,
            showAttachmentEdit
        };

        try {
            const res = await fetch(`${URL}/api/stage`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ newStage, token, projectID }),
            });

            if(!res.ok){
                const errorData = await res.text();
                console.log(errorData);
                return;
            }

            const data = await res.json();
            console.log(data);
        }
        catch (error) {
            console.log(error)
        }
        setStages((prevStages) => [...prevStages, newStage]);
        setStages((prevStages) => {
            const updatedStages = prevStages.map((stage) => {
                const newStageRect = document.getElementById(newStage.stageID)?.getBoundingClientRect();
                if (!newStageRect) return stage;
        
                const newStageWidth = newStageRect.width;
                const newStageHeight = newStageRect.height;
        
                const newTaskList = stage.taskList.map((task) => {
                    const taskRect = document.getElementById(task.taskID)?.getBoundingClientRect();
                    if (!taskRect) return task;
                    let newX = Math.max(0, Math.min(task.x, newStageWidth - taskRect.width));
                    let newY = Math.max(0, Math.min(task.y, newStageHeight - taskRect.height));
        
                    return { ...task, x: newX, y: newY };
                });
        
                return { ...stage, taskList: newTaskList };
            });
        
            return [...updatedStages];
        });
        setStageMenuActive(false);
    }

    const addTaskToStage = async (stageID: string | null) => {
        if (!stageID) {
            console.log("No selected stage ID set.")
            return;
        }

        let newTaskName = taskName;
        if (taskName === "") {
            let taskNum = stages.find((stage) => stage.stageID === stageID)?.taskList.length;
            const taskAddon = taskNum? taskNum + 1 : "1";
            newTaskName = "Task " + taskAddon;
        }

        const newTaskId = `task-${Date.now()}`;
        const newTask: TaskProps = {
            taskID: newTaskId,
            stageID: stageID,
            name: newTaskName,
            completed: false,
            dragging: false,
            startDate: taskStart.date,
            startTime: taskStart.time,
            endDate: taskEnd.date,
            endTime: taskEnd.time,
            description: taskDescription,
            x: 0,
            y: 0,
            nextTask: null,
            prevTask: null,
        };

        const titleRect = document.getElementById(stageID + "title-section")?.getBoundingClientRect();
        if (titleRect) {
            newTask.y = titleRect.height;
        }

        try {
            const res = await fetch(`${URL}/api/task`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ newTask, stageID, projectID, token }),
            });

            if(!res.ok){
                const errorData = await res.text();
                console.log(errorData);
                return;
            }

            const data = await res.json();
            console.log(data);

            setStages((prevStages) =>
                prevStages.map((stage) =>
                    stage.stageID === stageID
                        ? { ...stage, taskList: [...stage.taskList, newTask] }
                        : stage
                )  
            );
        } catch (error) {
            console.log(error);
        }
        setTaskName("");
        setTaskDescription("");
        setTaskStart({
            date: new Date().toISOString().split("T")[0],
            time: new Date().toTimeString().slice(0, 5)
        });
        setTaskEnd({
            date: (() => {
                const date = new Date();
                date.setDate(date.getDate() + 7);
                return date.toISOString().split("T")[0];
            })(),
            time: new Date().toTimeString().slice(0, 5)
        })
        setTaskMenuActive(false);
    }

    const loadProjectData = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${URL}/api/project?projectID=${projectID}&token=${token}`);

            if(!res.ok){
                const errorData = await res.text();
                console.log(errorData);
                return;
            }

            const data = await res.json();
            const projectData = data.projectData;
            setUpdatedProject(({ ...projectData }));
            setProjectTitle(projectData.title);
            

            if (projectData.stages) {
                const stages: StageProps[] = Object.entries(
                    projectData.stages as Record<string, StageProps>
                ).map(([stageNum, stageData]) => ({
                    key: stageNum,
                    ...stageData
                }));

                setStages(stages);
            }
        } catch (error) {
            console.log(error);
        }
        setLoading(false);
    }

    const deleteStage = async (stageID : string | null) => {
        if (!stageID) {
            console.log("No stage ID set to delete.");
            return;
        }

        setStages((prevStages) => prevStages.filter((stage) => stage.stageID !== stageID));

        try {
            const res = await fetch(`${URL}/api/stage`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ projectID, stageID, token }),
            });

            if(!res.ok){
                const errorData = await res.text();
                console.log(errorData);
                return;
            }

            const data = await res.json();
            console.log(data);
        } catch (error) {
            console.log(error);
        }
    }

    const deleteTask = async (stageID: string | null, taskID: string | null) => {
        if (!stageID) {
            console.log("No stage ID set to delete.");
            return;
        }
        if (!taskID) {
            console.log("No task ID set to delete.");
            return;
        }

        setStages((prevStages) =>
            prevStages.map((stage) => stage.stageID === stageID
                ? {...stage,
                    taskList: stage.taskList.filter((task) => task.taskID !== taskID)
                }
                : stage
            )
        );

        try {
            const res = await fetch(`${URL}/api/task`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ projectID, stageID, taskID, token }),
            });

            if (!res.ok) {
                const errorData = await res.text();
                console.log(errorData);
                return;
            }

            const data = await res.json();
            console.log(data);
        } catch (error) {
            console.log(error);
        }
    }

    const updateTask = async (stageID: string | null, taskID: string | null) => {
        if (!taskID) {
            console.log("No selected task ID set.")
            return;
        }
        if (!stageID) {
            console.log("No selected stage ID set.")
            return;
        }

        const stageWithTask = stages.find((stage) =>
            stage.stageID === stageID
        );

        const task = stageWithTask?.taskList.find((task) => task.taskID === taskID) || null;

        console.log(updatedTask.status);
        const newTask = {
            ...task,
            completed: updatedTask.status,
            name: updatedTask.name,
            description: updatedTask.description
        };

        setStages((prevStages) =>
            prevStages.map((stage) => stage.stageID === stageID
                ? {...stage,
                    taskList: stage.taskList.map((task) =>
                        task.taskID === taskID ? { 
                        ...task,
                        completed: updatedTask.status,
                        name: updatedTask.name,
                        description: updatedTask.description 
                    } : task)
                }
                : stage
            )
        );

        try {
            const res = await fetch(`${URL}/api/task`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    token, 
                    projectID, 
                    sourceID: stageID, 
                    destID: stageID,
                    task: newTask
                }),
            });

            if(!res.ok){
                const errorData = await res.text();
                console.log(errorData);
                return;
            }

            const data = await res.json();
            console.log(data);
        } catch (error) {
            console.log(error);
        }
    }

    const updateAttachment = async (stageID: string | null, attachmentID: string | null) => {
        if (!stageID) {
            console.log("No selected stage ID set.")
            return;
        }
        if (!attachmentID) {
            console.log("No selected attachment ID set.")
            return;
        }

        const stageWithAttachment = stages.find((stage) =>
            stage.stageID === stageID
        );

        const attachment = stageWithAttachment?.attachmentList.find((attachment) => attachment.attachmentID === attachmentID) || null;

        const newAttachment = {
            ...attachment,
            name: updatedAttachment.name,
        };

        setStages((prevStages) =>
            prevStages.map((stage) => stage.stageID === stageID
                ? {...stage,
                    attachmentList: stage.attachmentList.map((attachment) =>
                        attachment.attachmentID === attachmentID ? { 
                        ...attachment,
                        name: updatedAttachment.name,
                    } : attachment)
                }
                : stage
            )
        );

        try {
            const res = await fetch(`${URL}/api/file`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    token, 
                    projectID, 
                    sourceID: stageID, 
                    destID: stageID,
                    attachmentData: newAttachment
                }),
            });

            if(!res.ok){
                const errorData = await res.text();
                console.log(errorData);
                return;
            }

            const data = await res.json();
            console.log(data);
        } catch (error) {
            console.log(error);
        }
    }

    const updateStage = async (stageID: string | null) => {
        if (!stageID) {
            console.log("No selected stage ID set.")
            return;
        }

        setStages((prevStages) =>
            prevStages.map((stage) => stage.stageID === stageID
                ? {...stage,
                    stageName: updatedStage.name
                }
                : stage
            )
        );

        try {
            const res = await fetch(`${URL}/api/stage`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    token, 
                    projectID,
                    stageID,
                    stageData: updatedStage
                }),
            });

            if(!res.ok){
                const errorData = await res.text();
                console.log(errorData);
                return;
            }
    
            const data = await res.json();
            console.log(data);
        } catch (error) {
            console.log(error);
        }
    }

    const uploadFile = async () => {
        if (!selectedFile) return;
        if (!selectedStageId) return;

        if (selectedFile.size > MAX_FILE_SIZE) {
            console.log("File size exceeds the 2MB limit. Please choose a smaller file.");
            return;
        }

        const newAttachment: AttachmentProps = {
            attachmentID: `attachment-invalid-${Date.now()}`,
            stageID: selectedStageId,
            name: selectedFile.name,
            x: 0,
            y: 0,
            onclick: showAttachmentMenu,
            mimeType: selectedFile.type,
            attachment: ""
        }

        setUploading(true);
        
        try {
            const formData = new FormData();
            formData.append("file", selectedFile);
            formData.append("projectID", projectID);
            formData.append("stageID", selectedStageId);
            formData.append("attachmentData", JSON.stringify(newAttachment));
            formData.append("token", token || "");
            const res = await fetch(`${URL}/api/file`, {
                method: "POST",
                body: formData
            });


            if(!res.ok){
                const errorData = await res.text();
                console.log(errorData);
                return;
            }

            const data = await res.json();
            const fileURL = data.url;
            if(!fileURL){
                console.log("No file URL returned.");
                return;
            }
            newAttachment.attachmentID = "attachment-" + data.attachmentID;
            newAttachment.attachment = fileURL;

            setMessage("File uploaded successfully.");
        } catch (error) {
            console.error("Error uploading file:", error);
        }
        finally {
            setUploading(false);
            setTimeout(() => setMessage(""), 5000);
            setStages((prevStages) =>
                prevStages.map((stage) =>
                    stage.stageID === selectedStageId
                        ? { ...stage, attachmentList: [...stage.attachmentList, newAttachment] }
                        : stage
                )
            );
            hideAttachmentMenu();
        }
    }

    const updateProjectTitle = async () => {
        setProjectTitle(updatedProject.title);
        try {
            const res = await fetch(`${URL}/api/project`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    token, 
                    projectID,
                    projectData: updatedProject
                }),
            });

            if(!res.ok){
                const errorData = await res.text();
                console.log(errorData);
                return;
            }

            const data = await res.json();
            console.log(data);
        } catch (error) {
            console.log(error);
        }
    }

    const handleStageChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newStageID = e.target.value;
        if (!selectedTaskId) {
            console.log("No selected task ID set.")
            return;
        }
        if (!selectedStageId) {
            console.log("No selected stage ID set.")
            return;
        }

        let movedTask: TaskProps | null = null;

        const updatedStages = stages.map((stage) => {
            const newTaskList = stage.taskList.filter((task) => {
                if (task.taskID === selectedTaskId) {
                    movedTask = { ...task, stageID: newStageID, x: 0, y: 0 };
                    return false;
                }
                return true;
            });
            return { ...stage, taskList: newTaskList };
        });

        const finalUpdatedStages = updatedStages.map((stage) => {
            if (stage.stageID === newStageID && movedTask) {
                const taskRect = document.getElementById(movedTask.taskID)?.getBoundingClientRect();
                const newStageRect = document.getElementById(stage.stageID)?.getBoundingClientRect();
                const titleRect = document.getElementById(stage.stageID + "title-section")?.getBoundingClientRect();
                if (!taskRect || !newStageRect) return { ...stage, taskList: [...stage.taskList, movedTask] };;
        
                const taskWidth = taskRect.width;
                const taskHeight = taskRect.height;
                const newStageWidth = newStageRect.width;
                const newStageHeight = newStageRect.height;

                let newX = movedTask.x;
                let newY = movedTask.y;

                newX = Math.max(0, Math.min(newX, newStageWidth - taskWidth));
                if (titleRect) {
                    const titleBottom = titleRect.bottom - newStageRect.top;
                    newY = Math.max(titleBottom, Math.min(newY, newStageHeight - taskHeight));
                } else {
                    newY = Math.max(0, Math.min(newY, newStageHeight - taskHeight));
                }

                movedTask = { ...movedTask, x: newX, y: newY };
                return { ...stage, taskList: [...stage.taskList, movedTask] };
            }
            return stage;
        });

        setStages(finalUpdatedStages);

        try {
            const res = await fetch(`${URL}/api/task`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    token, 
                    projectID,
                    sourceID: selectedStageId,
                    destID: newStageID,
                    task: movedTask
                }),
            });

            if (!res.ok) {
                const errorData = await res.text();
                console.log(errorData);
                return;
            }

            const data = await res.json();
            console.log(data);
        } 
        catch (error) {
            console.log(error);
        } 
        finally {
            const newStageName = stages.find((stage) => stage.stageID === newStageID)?.stageName;
            if (newStageName) setUpdatedTask((prev) => ({ ...prev, stageName: newStageName }));
            setSelectedStageId(newStageID);
        }
    }
    
    // FRONTEND INPUT CHANGES

    const handleProjectNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUpdatedProject((prev) => ({
            ...prev,
            title: e.target.value
        }));
    }
    const handleTaskNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTaskName(e.target.value);
    }
    const handleStageNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setStageName(e.target.value);
    }
    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFilterText(e.target.value);
    }
    const handleTaskDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setTaskDescription(e.target.value);
    }
    const handleStartTimeChange = (time: string) => {
        setTaskStart((prev) => ({
            ...prev,
            time: time,
        }));
    }
    const handleStartDateChange = (date: string) => {
        setTaskStart((prev) => ({
            ...prev,
            date: date,
        }));
    }
    const handleEndTimeChange = (time: string) => {
        setTaskEnd((prev) => ({
            ...prev,
            time: time,
        }));
    }
    const handleEndDateChange = (date: string) => {
        setTaskEnd((prev) => ({
            ...prev,
            date: date,
        }));
    }
    const handleTaskNameUpdate = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUpdatedTask((prev) => ({
            ...prev,
            name: e.target.value,
        }));
    }
    const handleTaskDescriptionUpdate = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setUpdatedTask((prev) => ({
            ...prev,
            description: e.target.value,
        }));
    }
    /*
    const handleTaskColorUpdate = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUpdatedTask((prev) => ({
            ...prev,
            description: e.target.value,
        }));
    }
    const handleStageColorUpdate = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUpdatedTask((prev) => ({
            ...prev,
            description: e.target.value,
        }));
    }
    */
    const handleStageNameUpdate = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUpdatedStage((prev) => ({
            ...prev,
            name: e.target.value,
        }));
    }
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    }
    const handleAttachmentNameUpdate = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUpdatedAttachment((prev) => ({
            ...prev,
            name: e.target.value,
        }));
    }

    useEffect(() => {
        loadProjectData();
    }, []);

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        console.log("dragging");
    
        if (active.id.toString().startsWith("task-")) {
            setDraggingObjectData({ type: "task", id: String(active.id) });
        } 
        else if (active.id.toString().startsWith("attachment-")) {
            setDraggingObjectData({ type: "attachment", id: String(active.id) });
        } 
        else {
            console.log("Unknown drag object type", active);
        }
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over, delta } = event;
        if (!over) return;
        if (!draggingObjectData.type) return;

        let dragObjectID = active.id as string;
        let newStageID = over.id as string;
        let draggedTask: TaskProps | null = null;
        let draggedAttachment: AttachmentProps | null = null;
        let oldStageID: string | null = null;

        setStages((prevStages) =>
            prevStages.map((stage) => ({
                ...stage,
                taskList: stage.taskList.map((task) => ({ ...task, dragging: false })),
                attachmentList: stage.attachmentList.map((attachment) => ({ ...attachment, dragging: false })),
            }))
        );

        const updatedStages = stages.map((stage) => {
            if (draggingObjectData.type === "task") {
                console.log("here")
                let newTaskList = stage.taskList.map((task: TaskProps) => {
                    if (task.taskID === dragObjectID) {
                        const taskRect = document.getElementById(task.taskID)?.getBoundingClientRect();
                        const currentStageRect = document.getElementById(stage.stageID)?.getBoundingClientRect();
                        const titleRect = document.getElementById(stage.stageID + "title-section")?.getBoundingClientRect();
                        const newStageRect = document.getElementById(newStageID)?.getBoundingClientRect();
                        if (!taskRect || !currentStageRect || !newStageRect) return task;
            
                        const taskWidth = taskRect.width;
                        const taskHeight = taskRect.height;
                        const newStageWidth = newStageRect.width;
                        const newStageHeight = newStageRect.height;

                        let newX = task.x + delta.x;
                        let newY = task.y + delta.y;

                        newX = Math.max(0, Math.min(newX, newStageWidth - taskWidth));
                        if (titleRect) {
                            const titleBottom = titleRect.bottom - newStageRect.top;
                            newY = Math.max(titleBottom, Math.min(newY, newStageHeight - taskHeight));
                        } else {
                            newY = Math.max(0, Math.min(newY, newStageHeight - taskHeight));
                        }

                        draggedTask = { ...task, stageID: newStageID, x: newX, y: newY };
                        oldStageID = stage.stageID;
                    }

                    return task;
                });

                newTaskList = newTaskList.filter((task) => task.taskID !== draggedTask?.taskID);

                if (stage.stageID === oldStageID && draggedTask !== null) {
                    newTaskList = [...newTaskList, draggedTask];
                }

                return { ...stage, taskList: newTaskList };
            }

            if (draggingObjectData.type === "attachment") {
                let newAttachmentList = stage.attachmentList.map((attachment: AttachmentProps) => {
                    if (attachment.attachmentID === dragObjectID) {
                        const attachmentRect = document.getElementById(attachment.attachmentID)?.getBoundingClientRect();
                        const currentStageRect = document.getElementById(stage.stageID)?.getBoundingClientRect();
                        const titleRect = document.getElementById(stage.stageID + "title-section")?.getBoundingClientRect();
                        const newStageRect = document.getElementById(newStageID)?.getBoundingClientRect();
                        if (!attachmentRect || !currentStageRect || !newStageRect) return attachment;

                        const attachmentWidth = attachmentRect.width;
                        const attachmentHeight = attachmentRect.height;
                        const newStageWidth = newStageRect.width;
                        const newStageHeight = newStageRect.height;

                        let newX = attachment.x + delta.x;
                        let newY = attachment.y + delta.y;

                        newX = Math.max(0, Math.min(newX, newStageWidth - attachmentWidth));
                        if (titleRect) {
                            const titleBottom = titleRect.bottom - newStageRect.top;
                            console.log(titleRect.bottom)
                            newY = Math.max(titleBottom, Math.min(newY, newStageHeight - attachmentHeight));
                        } else {
                            newY = Math.max(0, Math.min(newY, newStageHeight - attachmentHeight));
                        }

                        draggedAttachment = { ...attachment, stageID: newStageID, x: newX, y: newY };
                        oldStageID = stage.stageID;
                    }

                    return attachment;
                });

                newAttachmentList = newAttachmentList.filter((attachment) => attachment.attachmentID !== draggedAttachment?.attachmentID);

                if (stage.stageID === oldStageID && draggedAttachment !== null) {
                    newAttachmentList = [...newAttachmentList, draggedAttachment];
                }
                return { ...stage, attachmentList: newAttachmentList };
            }

            return stage;
        });

        setStages(updatedStages);
        
        if (draggedTask) {
            try {
                const res = await fetch(`${URL}/api/task`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ 
                        token, 
                        projectID, 
                        sourceID: oldStageID, 
                        destID: oldStageID,
                        task: draggedTask 
                    }),
                });

                if (!res.ok) {
                    const errorData = await res.text();
                    console.log(errorData);
                    return;
                }
        
                const data = await res.json();
                console.log(data.message? data.message : "");
            } catch (error) {
                console.log(error);
            }
        }

        if (draggedAttachment) {
            try {
                console.log(draggedAttachment);
                console.log(oldStageID);
                const res = await fetch(`${URL}/api/file`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ 
                        token, 
                        projectID, 
                        sourceID: oldStageID, 
                        destID: oldStageID,
                        attachmentData: draggedAttachment
                    }),
                });

                if (!res.ok) {
                    const errorData = await res.text();
                    console.log(errorData);
                    return;
                }
        
                const data = await res.json();
                console.log(data.message? data.message : "");
            } catch (error) {
                console.log(error);
            }
        }

        setDraggingObjectData({ type: null, id: null });
    };

    /*
    const preventOverlap = (task: TaskProps, taskList: TaskProps[]) => {
        let newX = task.x;
        let newY = task.y;
    
        const isOverlappingX = (x: number) => {
            console.dir(taskList
                .filter(newtask => task.taskID !== newtask.taskID)
                .some(task => Math.abs(task.x - x) < taskSize.x
            ));
            return taskList
                .filter(newtask => task.taskID !== newtask.taskID)
                .some(task => Math.abs(task.x - x) < taskSize.x
            );
        };
        const isOverlappingY = (y: number) => {
            return taskList
                .filter(newtask => task.taskID !== newtask.taskID)
                .some(task => Math.abs(task.y - y) < taskSize.y
            );
        };
    
        console.log(`overlapping tasks with ${task.name}`)
    
        while (isOverlappingX(newX)) {
            newX += 10;
        }
        while (isOverlappingY(newY)) {
            newY += 10;
        }
    
        return { ...task, x: newX, y: newY };
    };*/

    return (
        <div className="project">
            <BackgroundWaves bottom={true} top={true} 
                color1="var(--themecolor1)"
                color2="var(--themecolor2)"
                color3="var(--themecolor3)"
            />
            <div className="project-title">
                <Input value={updatedProject.title ?? "Untitled"}
                    visible={true}
                    onchange={(e) => handleProjectNameChange(e)}/>
                {updatedProject.title !== projectTitle &&
                    <Button classname="default-button"
                        onclick={updateProjectTitle}
                        beforeicon={<FaSave />}
                        text="Save"
                    />
                }
            </div>
            <div className="panels">
                <div className="toolbar">
                    <Button classname="default-button"
                        beforeicon={<FaArrowCircleLeft/>}
                        onclick={() => navigate("/Dashboard")}
                    />
                    <div className="tools">
                        <Button onclick={() => setStageMenuActive(!stageMenuActive)} 
                            classname="default-button" 
                            text="Add Stage"
                            beforeicon={<FaPlus/>}
                        />
                        <Button classname="default-button"
                            onclick={() => setThemeMenuActive(!themeMenuActive)}
                            text="Change theme"
                            altIcon={<IoColorPalette/>}
                        />
                        <Button onclick={() => setCompleteMenuActive(!completeMenuActive)} 
                            classname="default-button" 
                            text="View Completed Tasks"
                            altIcon={<TiTick/>}
                        />
                        <Input
                            textcolor="var(--themecolor6)"
                            width="100%"
                            placeholder="Filter tasks..."
                            onchange={handleFilterChange}
                            visible={true}
                        />
                    </div>
                </div>
                <div className="project-creation-window">
                    {stages.length === 0 && loading && <Loading background="transparent"/>}
                    {stages.length === 0 && !loading && 
                        <div className="new-stage-button">
                            <Button classname="default-button" 
                            text="Create your first stage"
                            onclick={() => setStageMenuActive(true)}
                            beforeicon={<FaPlus/>}
                            />
                        </div>
                    }
                    <DndContext onDragEnd={handleDragEnd}
                        onDragStart={handleDragStart}
                        sensors={sensors}>
                        <div className="stages">
                            {stages.map((stage) => (
                                <Stage key={stage.stageID}
                                    stageID={stage.stageID}
                                    stageName={stage.stageName}
                                    taskList={stage.taskList} 
                                    attachmentList={stage.attachmentList}
                                    showTaskMenu={showTaskMenu}
                                    showTaskEdit={showTaskEdit}
                                    showStageEdit={showStageEdit}
                                    showAttachmentMenu={showAttachmentMenu}
                                    showAttachmentEdit={showAttachmentEdit}
                                    filterText={filterText}
                                />
                            ))}
                        </div>
                    </DndContext>
                </div>
            </div>
            <HiddenMenu classname="hidden-stage-create"
                visible={stageMenuActive} 
                close={() => {
                    setStageMenuActive(false);
                    setStageName("");
                }} 
                create={() => {
                    addStage();
                    setStageName("");
                }}>
                <h1>Create new stage</h1>
                <p>Enter stage name:</p>
                <Input
                    textcolor="black"
                    width="100%"
                    onchange={handleStageNameChange}
                    visible={true}
                    placeholder="Enter stage name..."
                />
            </HiddenMenu>
            <HiddenMenu classname="hidden-task-create"
                visible={taskMenuActive} 
                close={() => {
                    setTaskMenuActive(false); 
                    setTaskName("");
                    setSelectedStageId(null);
                }}
                create={() => addTaskToStage(selectedStageId)}
                createButtonText="Create Task">
                <h1>Create new task</h1>
                <div className="task-name">
                    <p>Enter task name:</p>
                    <Input textcolor="black"
                        width="100%"
                        onchange={handleTaskNameChange}
                        visible={true}
                        placeholder="Enter task title..."
                    />
                </div>
                <div className="task-timing-inputs">
                    <div className="block">
                        <DateInput text="Set start date: "
                            onDateChange={handleStartDateChange}
                            id="start-date"
                        />
                        <TimeInput text="Set start time: "
                            onTimeChange={handleStartTimeChange}
                            id="start-time"
                        />
                    </div>
                    <div className="block">
                        <DateInput text="Set end date: "
                            displayDate={taskEnd.date}
                            onDateChange={handleEndDateChange}
                            id="end-date"
                        />
                        <TimeInput text="Set end time: "
                            onTimeChange={handleEndTimeChange}
                            id="end-time"
                        />
                    </div>
                </div>
                <div className="description-update">
                    <Textbox text="Enter task description:  "
                        onchange={handleTaskDescriptionChange} 
                        placeholder="Task description... "
                        width="100%"
                        classname="task-description-container"
                    />
                </div>
            </HiddenMenu>
            <HiddenMenu classname="hidden-task-edit"
                visible={taskEditActive}>
                <div className="tools">
                    <Button onclick={() => setConfirmTaskMenuActive(true)}
                        text="Delete Task"
                        classname="default-button"
                        beforeicon={<FaRegTrashCan/>}
                    />
                    <Button onclick={() => {
                        hideTaskEdit();
                        updateTask(selectedStageId, selectedTaskId);
                    }}
                        text="Close"
                        classname="default-button"
                        beforeicon={<FaX/>}
                    />
                </div>
                <div className="edit-task-menu">
                    <h1>Edit task: {updatedTask.name}</h1>
                    <div className="edit-options">
                        <div className="edit-details">
                        <h2 className="subheader">Update task details</h2>
                            <div className="toggle-complete">
                                <label className="switch">
                                    <input 
                                        type="checkbox" 
                                        checked={updatedTask.status} 
                                        onChange={(e) => {
                                            setUpdatedTask(prev => {
                                                const newTask = { ...prev, status: e.target.checked };
                                                return newTask;
                                            });
                                            updateTask(selectedStageId, selectedTaskId);
                                        }} 
                                    />
                                    <span className="slider round"></span>
                                </label>
                                <p>{updatedTask.status? "COMPLETE" : "INCOMPLETE"}</p>
                            </div>
                            <p>Update task name: </p>
                            <Input placeholder="Set a new task title..."
                                visible={true} 
                                onchange={handleTaskNameUpdate}
                                value={updatedTask.name}/>
                            <p>Update task description: </p>
                            <Textbox classname="project-textbox" 
                                placeholder="Enter description..."
                                value={updatedTask.description}
                                onchange={handleTaskDescriptionUpdate}/>
                            <p>Move to different stage?</p>
                            <div className="select-container">
                                <select value={selectedStageId? selectedStageId : ""} onChange={handleStageChange}>
                                    {stages.map((stage) => (
                                        <option key={stage.stageID} 
                                            value={stage.stageID}>
                                                {stage.stageName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </HiddenMenu>
            <HiddenMenu classname="hidden-stage-edit"
                visible={stageEditActive}
                close={() => {
                    hideStageEdit();
                    updateStage(selectedStageId);
                }}
                closeButtonText="Back">
                <h1>Edit stage: {updatedStage.name}</h1>
                <div className="inputs">
                    <p>Update stage name: </p>
                    <Input placeholder="Set a new stage title..."
                        value={updatedStage.name}
                        visible={true}
                        onchange={handleStageNameUpdate}
                    />
                    <Button onclick={() => setConfirmStageMenuActive(true)}
                        text="Delete Stage"
                        classname="default-button"
                    />
                </div>
            </HiddenMenu>
            <HiddenMenu classname="hidden-complete-tasks"
                visible={completeMenuActive}
                close={() => setCompleteMenuActive(false)}
                closeButtonText="Close">
                {completedTasks.length <= 0 && <p>No completed tasks.</p>}
                <div className="completed-tasks-container">
                    {completedTasks.map(task => (
                            <span key={task.taskID} className="completed-task"
                                onClick={() => {
                                    setCompleteTaskSelected(task.taskID);
                                    setRestoreMenuActive(true)
                                }}>
                                <p className="task-name">{task.name}</p>
                                {
                                task.description? 
                                    <p className="task-description">
                                        {task.description}
                                    </p> :
                                    <p>No description</p>
                                }
                                <p className="ID">{task.taskID}</p>
                            </span>
                            )
                        )
                    }
                </div>
            </HiddenMenu>
            <HiddenMenu visible={confirmTaskMenuActive}
                classname="confirm-task-menu"
                close={() => setConfirmTaskMenuActive(false)}
                create={() => {
                    deleteTask(selectedStageId, selectedTaskId); 
                    setConfirmTaskMenuActive(false);
                    hideTaskEdit();
                }}
                createButtonText="Confirm"
                closeButtonText="Back"
            >
                <h1>Are you sure you want to delete this task?</h1>
            </HiddenMenu>
            <HiddenMenu visible={confirmStageMenuActive}
                classname="confirm-stage-menu"
                close={() => setConfirmStageMenuActive(false)}
                create={() => {
                    deleteStage(selectedStageId); 
                    setConfirmStageMenuActive(false);
                    hideStageEdit();
                }}
                createButtonText="Confirm"
                closeButtonText="Back"
            >
                <h1>Are you sure you want to delete this stage?</h1>
            </HiddenMenu>
            <HiddenMenu visible={attachmentMenuActive}
                classname="create-attachment-menu"
                close={() => {
                    setAttachmentMenuActive(false)
                    setSelectedFile(null);
                }}
                create={() => {
                    uploadFile();
                    setSelectedFile(null);
                    setAttachmentMenuActive(false);
                }}
                createButtonText="Upload">
                <div className="create-attachment">
                    <div className="details">
                        <h1>Upload new file: </h1>
                        <p>Files must be less than 2MB</p>
                        <p>Files must be either an image or a pdf / txt file</p>
                        {uploading && <p>Uploading...</p>}
                        {message && <p>{message}</p>}
                    </div>
                    <input type="file" onChange={handleFileChange}/>
                </div>
            </HiddenMenu>
            <HiddenMenu visible={attachmentEditActive}
                classname="edit-attachment-menu"
                close={() => {
                    updateAttachment(selectedStageId, selectedAttachmentId);
                    hideAttachmentEdit();
                }}>
                <h1>Edit attachment: {updatedAttachment.name}</h1>
                <Input placeholder="Set a new attachment name..."
                    value={updatedAttachment.name}
                    visible={true}
                    onchange={handleAttachmentNameUpdate}
                />
                {updatedAttachment.newURL && (
                    <div className="attachment-preview">
                        {updatedAttachment.mimeType.startsWith("image/") ? (
                            <img src={updatedAttachment.newURL} alt={updatedAttachment.name} className="attachment-image"/>
                        ) : updatedAttachment.mimeType === "application/pdf" ? (
                            <iframe src={updatedAttachment.newURL} className="attachment-pdf"></iframe>
                        ) : updatedAttachment.mimeType === "text/plain" ? (
                            <a href={updatedAttachment.newURL} download={updatedAttachment.name} className="attachment-link">
                                Download Text File
                            </a>
                        ) : (
                            <a href={updatedAttachment.newURL} download={updatedAttachment.name} className="attachment-link">
                                Download Attachment
                            </a>
                        )}
                    </div>
                )}
            </HiddenMenu>
            <ThemeChanger isvisible={themeMenuActive} 
                closeMenu={() => setThemeMenuActive(false)}
                projectID={projectID}
            />
        </div>
    )
}

export default Project;