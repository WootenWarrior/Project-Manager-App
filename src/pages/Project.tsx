import { useNavigate, useParams } from "react-router-dom";
import "../styles/pages/Project.css";
import { useEffect, useState } from "react";
import { URL } from "../utils/BackendURL";
import { Stage, Button, Input, HiddenMenu, 
    TimeInput, DateInput, Textbox, ThemeChanger,
    BackgroundWaves
} from "../components/index";
import { TaskProps, StageProps } from "../utils/Interfaces";
import { FaPlus, FaRegTrashCan, FaX } from "react-icons/fa6";
import { FaArrowCircleLeft } from "react-icons/fa";
import { DndContext, DragEndEvent, useSensor, useSensors, PointerSensor } from "@dnd-kit/core";
import { Loading } from "./index";
import { IoColorPalette } from "react-icons/io5";
import { TiTick } from "react-icons/ti";



function Project() {
    const MAX_FILE_SIZE = 2 * 1024 * 1024;
    const navigate = useNavigate();
    const { projectID } = useParams();
    const [projectTitle, setProjectTitle] = useState<string | null>("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [stages, setStages] = useState<StageProps[]>([]);
    const [themeMenuActive, setThemeMenuActive] = useState(false);
    const [taskMenuActive, setTaskMenuActive] = useState(false);
    const [stageMenuActive, setStageMenuActive] = useState(false);
    const [taskEditActive, setTaskEditActive] = useState(false);
    const [stageEditActive, setStageEditActive] = useState(false);
    const [attachmentMenuActive, setAttachmentMenuActive] = useState(false);
    const [attachmentEditActive, setAttachmentEditActive] = useState(false);
    const [confirmTaskMenuActive, setConfirmTaskMenuActive] = useState(false);
    const [confirmStageMenuActive, setConfirmStageMenuActive] = useState(false);
    const [completeMenuActive, setCompleteMenuActive] = useState(false);
    const [_restoreMenuActive, setRestoreMenuActive] = useState(false);
    const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
    const [selectedStageId, setSelectedStageId] = useState<string | null>(null);
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
    const [updatedTask, setUpdatedTask] = useState<{
        name: string,
        status: boolean,
        description: string,
        color: string
    }>({ name: "", status: false, description: "", color: "" });
    const [updatedStage, setUpdatedStage] = useState<{
        name: string
        color: string
    }>({ name: "", color: "" });
    const sensors = useSensors(useSensor(PointerSensor, {
        activationConstraint: {
            delay: 100,
            tolerance: 5,
        },
    }));

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
        

        setUpdatedTask(({ status, name, description, color }));
    }

    const hideTaskEdit = () => {
        setTaskEditActive(false);
        setSelectedTaskId(null);
        setSelectedStageId(null);
        setUpdatedTask({ 
            status: false, 
            name: "", 
            description: "", 
            color: ""
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
        setAttachmentMenuActive(false);
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
            showAttachmentMenu
        };

        try {
            const token = sessionStorage.getItem("token") || localStorage.getItem("token");
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

        try {
            const token = sessionStorage.getItem("token") || localStorage.getItem("token");
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
            const token = sessionStorage.getItem("token") || localStorage.getItem("token");
            const res = await fetch(`${URL}/api/project?projectID=${projectID}&token=${token}`);

            if(!res.ok){
                const errorData = await res.text();
                console.log(errorData);
                return;
            }

            const data = await res.json();

            const projectData = data.projectData;
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

        try {
            const token = sessionStorage.getItem("token") || localStorage.getItem("token");
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
            const token = sessionStorage.getItem("token") || localStorage.getItem("token");
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
            const token = sessionStorage.getItem("token") || localStorage.getItem("token");
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
            console.log(updatedStage);
            const token = sessionStorage.getItem("token") || localStorage.getItem("token");
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

        setUploading(true);
        
        try {
            const token = sessionStorage.getItem("token") || localStorage.getItem("token");
            const formData = new FormData();
            formData.append("file", selectedFile);
            formData.append("projectID", projectID);
            formData.append("stageID", selectedStageId);
            formData.append("token", token || "");
            const res = await fetch(`${URL}/api/file`, {
                method: "PUT",
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

            setMessage("File uploaded successfully.");
        } catch (error) {
            console.error("Error uploading file:", error);
        }
        finally {
            setUploading(false);
            setTimeout(() => setMessage(""), 5000);
        }
    };
    
    // FRONTEND INPUT CHANGES

    const handleTaskNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTaskName(e.target.value);
    }
    const handleStageNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setStageName(e.target.value);
    }
    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFilterText(e.target.value);
    };
    const handleTaskDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setTaskDescription(e.target.value);
    };
    const handleStartTimeChange = (time: string) => {
        setTaskStart((prev) => ({
            ...prev,
            time: time,
        }));
    };
    const handleStartDateChange = (date: string) => {
        setTaskStart((prev) => ({
            ...prev,
            date: date,
        }));
    };
    const handleEndTimeChange = (time: string) => {
        setTaskEnd((prev) => ({
            ...prev,
            time: time,
        }));
    };
    const handleEndDateChange = (date: string) => {
        setTaskEnd((prev) => ({
            ...prev,
            date: date,
        }));
    };
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
    const handleTaskColorUpdate = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUpdatedTask((prev) => ({
            ...prev,
            description: e.target.value,
        }));
    }
    const handleStageNameUpdate = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUpdatedStage((prev) => ({
            ...prev,
            name: e.target.value,
        }));
    }
    const handleStageColorUpdate = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUpdatedTask((prev) => ({
            ...prev,
            description: e.target.value,
        }));
    }
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    }

    useEffect(() => {
        loadProjectData();
    }, []);

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over, delta } = event;
        if (!over) return;
    
        const taskId = active.id as string;
        const newStageID = over.id as string;
        let draggedTask: TaskProps | null = null;
        let oldStageID: string | null = null;

        const updatedStages = stages.map((stage) => {
            let newTaskList = stage.taskList.map((task: TaskProps) => {
                if (task.taskID === taskId) {
                    const taskRect = document.getElementById(task.taskID)?.getBoundingClientRect();
                    const currentStageRect = document.getElementById(stage.stageID)?.getBoundingClientRect();
                    const newStageRect = document.getElementById(newStageID)?.getBoundingClientRect();
                    if (!taskRect || !currentStageRect || !newStageRect) return task;
        
                    const taskWidth = taskRect.width;
                    const taskHeight = taskRect.height;
        
                    let newX = task.x + delta.x;
                    let newY = task.y + delta.y;

                    newX = Math.max(0, Math.min(newX, newStageRect.width - taskWidth));
                    newY = Math.max(0, Math.min(newY, newStageRect.height - taskHeight));
                    draggedTask = { ...task, stageID: newStageID, x: newX, y: newY };
                    oldStageID = stage.stageID;
                    return draggedTask;
                }

                return task;
            });

            newTaskList = newTaskList.filter((task) => task !== draggedTask);
                
            if (stage.stageID === newStageID && draggedTask !== null) {
                newTaskList = [...newTaskList, draggedTask];
            }

            return { ...stage, taskList: newTaskList };
        });

        setStages(updatedStages);
        

        if (draggedTask) {
            try {
                const token = sessionStorage.getItem("token") || localStorage.getItem("token");
                const res = await fetch(`${URL}/api/task`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ 
                        token, 
                        projectID, 
                        sourceID: oldStageID, 
                        destID: newStageID,
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

    console.log(handleStageColorUpdate, handleTaskColorUpdate, attachmentEditActive, setAttachmentEditActive)

    return (
        <div className="project">
            <BackgroundWaves bottom={true} top={true} 
                color1="var(--themecolor1)"
                color2="var(--themecolor2)"
                color3="var(--themecolor3)"
            />
            <div className="project-title">{projectTitle}</div>
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
                    <DndContext onDragEnd={handleDragEnd} sensors={sensors}>
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
                create={() => addTaskToStage(selectedStageId)}>
                <h1>Create new task</h1>
                <Input
                    textcolor="black"
                    width="100%"
                    onchange={handleTaskNameChange}
                    visible={true}
                    placeholder="Enter task title..."
                />
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
                <div className="completed-tasks-container">
                    {stages.flatMap(stage => 
                        stage.taskList
                            .filter(task => task.completed)
                            .map(task => (
                                <span key={task.taskID} className="completed-task"
                                    onClick={() => {
                                        setCompleteTaskSelected(task.taskID);
                                        setRestoreMenuActive(true)
                                    }}>
                                    <p className="task-name">{task.name}</p>
                                    {
                                    task.description? 
                                        <p className="task-description">{task.description}</p> :
                                        <p>No description</p>
                                    }
                                    <p className="ID">{task.taskID}</p>
                                </span>
                            ))
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
            </HiddenMenu>
            <HiddenMenu visible={attachmentMenuActive}
                classname="create-attachment-menu"
                close={() => setAttachmentMenuActive(false)}
                create={() => {
                    uploadFile();
                    hideAttachmentMenu();
                }}
                createButtonText="Upload">
                    <div className="create-attachment">
                        <div className="attachment-display">
                            
                        </div>
                        <div className="details">
                            <p>Upload new file: </p>
                            <p>Files must be less than 2MB</p>
                            <p>Files must be either an image or a pdf / txt file</p>
                            {uploading && <p>Uploading...</p>}
                            {message && <p>{message}</p>}
                        </div>
                        <input type="file" onChange={handleFileChange} />
                    </div>
            </HiddenMenu>
            <ThemeChanger isvisible={themeMenuActive} 
                closeMenu={() => setThemeMenuActive(false)}
                projectID={projectID}
            />
        </div>
    )
}

export default Project;