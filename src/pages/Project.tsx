import { useParams } from "react-router-dom";
import "../styles/pages/Project.css";
import { useEffect, useState } from "react";
import { URL } from "../utils/BackendURL";
import { Stage, Button, Input, HiddenMenu, TimeInput, DateInput } from "../components/index";
import { TaskProps, StageProps } from "../utils/Interfaces";
import { FaPlus } from "react-icons/fa6";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import ThemeChanger from "../components/ThemeChanger";


function Project() {
    const { projectID } = useParams();
    const [stages, setStages] = useState<StageProps[]>([]);
    const [themeMenuActive, setThemeMenuActive] = useState(false);
    const [taskMenuActive, setTaskMenuActive] = useState(false);
    const [stageMenuActive, setStageMenuActive] = useState(false);
    const [taskEditActive, setTaskEditActive] = useState(false);
    const [stageEditActive, setStageEditActive] = useState(false);
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
    const [filterText, setFilterText] = useState("");


    // MENU TOGGLES

    const showTaskMenu = (stageID: string) => {
        setSelectedStageId(stageID);
        setTaskMenuActive(true);
    }
    const hideTaskMenu = () => {
        setTaskMenuActive(false);
        setSelectedStageId(null);
    }

    const showTaskEdit = (stageID: string, taskID: string) => {
        setSelectedTaskId(taskID);
        setSelectedStageId(stageID);
        loadTaskData(taskID);
        setTaskEditActive(true);
    }
    const hideTaskEdit = () => {
        setTaskEditActive(false);
        setSelectedTaskId(null);
        setSelectedStageId(null);
    }

    const showStageEdit = (stageID: string) => {
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
        const newStage: StageProps = {
            stageID: stageID,
            stageName: stageName,
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
            x: 0,
            y: 0
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

        setTaskMenuActive(false);
    }

    const loadProjectData = async () => {
        try {
            const token = sessionStorage.getItem("token") || localStorage.getItem("token");
            const res = await fetch(`${URL}/api/project?projectID=${projectID}&token=${token}`);

            if(!res.ok){
                const errorData = await res.text();
                console.log(errorData);
                return;
            }

            const data = await res.json();

            const projectData = data.projectData

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

    const updateTask = async (taskID: string | null) => {
        if (!taskID) {
            console.log("No selected task ID set.")
            return;
        }
    }

    const updateStage = async (taskID: string | null) => {
        if (!taskID) {
            console.log("No selected task ID set.")
            return;
        }
    }

    const loadTaskData = async (taskID: string | null) => {
        console.log(taskID);
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


    // Data Updates

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
            let newTaskList = stage.taskList.filter((task: TaskProps) => {
                if (task.taskID === taskId) {
                    draggedTask = { ...task, stageID: stage.stageID, x: task.x + delta.x, y: task.y + delta.y };
                    oldStageID = stage.stageID;
                    return false;
                }
                return true;
            });
    
            if (stage.stageID === newStageID && draggedTask) {
                newTaskList.push(draggedTask);
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
                    body: JSON.stringify({ token, 
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
                console.log(data);
                loadProjectData();
            } catch (error) {
                console.log(error);
            }
        }
    };

    return (
        <div className="project">
            <div className="panels">
                <div className="toolbar">
                    <h2>Toolbar</h2>
                    <Button onclick={() => setStageMenuActive(!stageMenuActive)} 
                        classname="default-button" 
                        text="Add Stage"
                        beforeicon={<FaPlus/>}
                    />
                    <Input
                        textcolor="black"
                        width="100%"
                        placeholder="Filter tasks..."
                        onchange={handleFilterChange}
                        visible={true}
                    />
                    <Button classname="default-button"
                        onclick={() => setThemeMenuActive(!themeMenuActive)}
                        text="Change theme"
                    />
                </div>
                <div className="project-creation-window">
                    <DndContext onDragEnd={handleDragEnd}>
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
                close={() => setStageMenuActive(false)} 
                create={() => addStage()}>
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
                close={hideTaskMenu} 
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
                        />
                        <TimeInput text="Set start time: "
                            onTimeChange={handleStartTimeChange}
                        />
                    </div>
                    <div className="block">
                        <DateInput text="Set end date: "
                            displayDate={taskEnd.date}
                            onDateChange={handleEndDateChange}
                        />
                        <TimeInput text="Set end time: "
                            onTimeChange={handleEndTimeChange}
                        />
                    </div>
                </div>
            </HiddenMenu>
            <HiddenMenu classname="hidden-task-edit"
                visible={taskEditActive}
                close={hideTaskEdit}
                create={() => updateTask(selectedTaskId)}
                closeButtonText="x"
                createButtonText="Update">
                <h1>Edit task</h1>
                <Button onclick={() => deleteTask(selectedStageId,selectedTaskId)}  /// CHANGE HERE
                    text="Delete Task"
                    classname="default-button"
                />
            </HiddenMenu>
            <HiddenMenu classname="hidden-stage-edit"
                visible={stageEditActive}
                close={hideStageEdit}
                create={() => updateStage(selectedTaskId)}
                closeButtonText="x"
                createButtonText="Update">
                <h1>Edit stage</h1>
                <Button onclick={() => deleteStage(selectedStageId)}
                    text="Delete Stage"
                    classname="default-button"
                />
            </HiddenMenu>
            <ThemeChanger visible={themeMenuActive} 
                closeMenu={() => setThemeMenuActive(false)}
            />
        </div>
    )
}

export default Project;