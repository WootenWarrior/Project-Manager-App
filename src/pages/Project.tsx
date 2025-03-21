import { useNavigate, useParams } from "react-router-dom";
import "../styles/pages/Project.css";
import { useEffect, useState } from "react";
import { URL } from "../utils/BackendURL";
import { Stage, Button, Input, HiddenMenu, TimeInput, DateInput, Textbox, ThemeChanger } from "../components/index";
import { TaskProps, StageProps } from "../utils/Interfaces";
import { FaPlus } from "react-icons/fa6";
import { FaArrowCircleLeft } from "react-icons/fa";
import { DndContext, DragEndEvent, useSensor, useSensors, PointerSensor } from "@dnd-kit/core";
import { Loading } from "./index";
import { IoColorPalette } from "react-icons/io5";
import { TiTick } from "react-icons/ti";



function Project() {
    const navigate = useNavigate();
    const { projectID } = useParams();
    const [projectTitle, setProjectTitle] = useState<string | null>("");
    const [loading, setLoading] = useState(false);
    const [stages, setStages] = useState<StageProps[]>([]);
    const [themeMenuActive, setThemeMenuActive] = useState(false);
    const [taskMenuActive, setTaskMenuActive] = useState(false);
    const [stageMenuActive, setStageMenuActive] = useState(false);
    const [taskEditActive, setTaskEditActive] = useState(false);
    const [stageEditActive, setStageEditActive] = useState(false);
    const [completeMenuActive, setCompleteMenuActive] = useState(false);
    const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
    const [selectedStageId, setSelectedStageId] = useState<string | null>(null);
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
            showTaskMenu: showTaskMenu,
            showTaskEdit: showTaskEdit,
            showStageEdit: showStageEdit
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
            const taskAddon = taskNum? taskNum + 1 : "";
            newTaskName = "Task" + taskAddon;
        }
        console.log(newTaskName);

        const newTaskId = `task-${Date.now()}`;
        const newTask: TaskProps = {
            taskID: newTaskId,
            stageID: stageID,
            name: taskName,
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
                    stageName: stageData.stageName,
                    stageID: stageData.stageID,
                    taskList: stageData.taskList,
                    showTaskMenu: showTaskMenu,
                    showTaskEdit: showTaskEdit,
                    showStageEdit: showStageEdit
                }));

                setStages(stages);
            }
        } catch (error) {
            console.log(error);
        }
        setLoading(false);
    }

    const deleteStage = async (stageID: string | null) => {
        if (!stageID) {
            console.log("No stage ID set to delete.");
            return;
        }

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

        const token = sessionStorage.getItem("token") || localStorage.getItem("token");
        const res = await fetch(`${URL}/api/task`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ projectID, stageID, taskID, token }),
        });

        if(!res.ok){
            const errorData = await res.text();
            console.log(errorData);
            return;
        }

        const data = await res.json();
        console.log(data);
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

        const newTask = {
            ...task,
            completed: updatedTask.status,
            name: updatedTask.name,
            description: updatedTask.description
        };

        console.log(newTask.completed)

        setStages((prevStages) =>
            prevStages.map((stage) =>
                stage.stageID === stageID
                    ? {
                          ...stage,
                          taskList: stage.taskList.map((task) =>
                              task.taskID === taskID ? { 
                                ...task,
                                completed: updatedTask.status,
                                name: updatedTask.name,
                                description: updatedTask.description 
                            } : task
                          ),
                      }
                    : stage
            )
        );

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
    }

    const updateStage = async (taskID: string | null) => {
        if (!taskID) {
            console.log("No selected task ID set.")
            return;
        }
    }

    
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


    useEffect(() => {
        loadProjectData();
    }, []);

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over, delta } = event;
        if (!over) return;
    
        const taskId = active.id as string;
        let draggedTask: TaskProps | null = null;
        let oldStageID: string | null = null;

        stages.map((stage) => {
            let newTaskList = stage.taskList.map((task: TaskProps) => {
                if (task.taskID === taskId) {
                    console.log("here");
                    const taskRect = document.getElementById(task.taskID)?.getBoundingClientRect();
                    const stageRect = document.getElementById(stage.stageID)?.getBoundingClientRect();
                    if (!stageRect) return;
                    if (!taskRect) return;
                    console.log(stageRect);
                    console.log(taskRect);

                    const taskWidth = taskRect.width;
                    const taskHeight = taskRect.height;

                    let newX = task.x + delta.x;
                    let newY = task.y + delta.y;

                    newX = Math.max(0, Math.min(newX, stageRect.width - taskWidth));
                    newY = Math.max(0, Math.min(newY, stageRect.height - taskHeight));

                    console.log(`Task moved to ${task.x + delta.x}, ${task.y + delta.y}`);
                    draggedTask = { 
                        ...task, 
                        x: newX, 
                        y: newY 
                    };
                    oldStageID = stage.stageID;
                    return false;
                }
                return true;
            });
            return { ...stage, taskList: newTaskList };
        });
        

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

                loadProjectData(); //slow for frontend
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

    return (
        <div className="project">
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
                            textcolor="black"
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
                                    showTaskMenu={showTaskMenu}
                                    showTaskEdit={showTaskEdit}
                                    showStageEdit={showStageEdit}
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
                visible={taskEditActive}
                close={hideTaskEdit}
                create={() => {
                    updateTask(selectedStageId, selectedTaskId);
                    hideTaskEdit();
                }}
                closeButtonText="Cancel"
                createButtonText="Update">
                <h1>Edit task</h1>
                <div className="edit-options">
                    <div className="left">
                        <div className="toggle-complete">
                            <label className="switch">
                                <input 
                                    type="checkbox" 
                                    checked={updatedTask.status} 
                                    onChange={(e) => {
                                        setUpdatedTask(prev => {
                                            const newTask = { ...prev, status: e.target.checked };
                                            updateTask(selectedStageId, selectedTaskId);
                                            return newTask;
                                        });
                                    }} 
                                />
                                <span className="slider round"></span>
                            </label>
                            <p>{updatedTask.status? "COMPLETE" : "INCOMPLETE"}</p>
                        </div>
                        <Input placeholder="Set a new task title..."
                            visible={true} 
                            onchange={handleTaskNameUpdate}
                            value={updatedTask.name}/>
                        <Textbox classname="project-textbox" 
                            placeholder="Enter description..."
                            value={updatedTask.description}
                            onchange={handleTaskDescriptionUpdate}/>
                    </div>
                    <div className="right">
                        <Button onclick={() => deleteTask(selectedStageId, selectedTaskId)}
                            text="Delete Task"
                            classname="default-button"
                        />
                    </div>
                </div>
            </HiddenMenu>
            <HiddenMenu classname="hidden-stage-edit"
                visible={stageEditActive}
                close={hideStageEdit}
                create={() => updateStage(selectedTaskId)}
                closeButtonText="x"
                createButtonText="Update">
                <h1>Edit stage</h1>
                <Input placeholder="Set a new stage title..."
                    value={updatedStage.name}
                    visible={true}
                    onchange={handleStageNameUpdate}
                />
                <Button onclick={() => deleteStage(selectedStageId)}
                    text="Delete Stage"
                    classname="default-button"
                />
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
                                <span key={task.taskID} className="completed-task">
                                    <p className="task-name">{task.name}</p>
                                    {task.description && <p className="task-description">{task.description}</p>}
                                </span>
                            ))
                        )
                    }
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