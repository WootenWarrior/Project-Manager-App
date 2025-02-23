import { useParams } from "react-router-dom";
import "../styles/pages/ProjectEditor.css";
import { useEffect, useState } from "react";
import { URL } from "../utils/BackendURL";
import { Stage, Button, Input, HiddenMenu, TimeInput, DateInput } from "../components/index";
import { TaskProps, StageProps } from "../utils/Interfaces";
import { FaPlus } from "react-icons/fa6";
import { DndContext } from '@dnd-kit/core';


function Project() {
    const { projectID } = useParams();
    const [stages, setStages] = useState<StageProps[]>([]);
    const [taskMenuActive, setTaskMenuActive] = useState(false);
    const [stageMenuActive, setStageMenuActive] = useState(false);
    const [taskEditActive, setTaskEditActive] = useState(false);
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

    const showStageMenu = () => {
        setStageMenuActive(true);
    }
    const hideStageMenu = () => {
        setStageMenuActive(false);
    }

    const showTaskEdit = (taskID: string) => {
        setSelectedTaskId(taskID);
        loadTaskData(taskID);
        setTaskEditActive(true);
    }
    const hideTaskEdit = () => {
        setTaskEditActive(false);
    }


    // API CALL FUNCTIONS

    const addStage = async () => {
        const stageID = `stage-${Date.now()}`;
        const newStage: StageProps = {
            stageID: stageID,
            stageName: stageName,
            taskList: [],
            showTaskMenu: showTaskMenu,
            showTaskEdit: showTaskEdit
        };

        try {
            const token = sessionStorage.getItem("token") || localStorage.getItem("token");
            const res = await fetch(`${URL}/api/new-stage`, {
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
            endTime: taskEnd.time
        };

        try {
            const token = sessionStorage.getItem("token") || localStorage.getItem("token");
            const res = await fetch(`${URL}/api/new-task`, {
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
            const res = await fetch(`${URL}/api/project`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ projectID, token }),
            });

            if(!res.ok){
                const errorData = await res.text();
                console.log(errorData);
                return;
            }

            const data = await res.json();

            const projectData = data.projectData

            console.log(projectData.stages);

            if (projectData.stages) {
                const stages: StageProps[] = Object.entries(
                    projectData.stages as Record<string, StageProps>
                ).map(
                    ([stageNum, stageData]) => ({
                    key: stageNum,
                    stageName: stageData.stageName,
                    stageID: stageData.stageID,
                    taskList: stageData.taskList,
                    showTaskMenu: showTaskMenu,
                    showTaskEdit: showTaskEdit
                }));

                setStages(stages);
            }
        } catch (error) {
            console.log(error);
        }
    }

    const updateTask = async (taskID: string | null) => {
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

    return (
        <div className="project">
            <div className="panels">
                <div className="toolbar">
                    <h2>Toolbar</h2>
                    <Input
                        textcolor="black"
                        width="100%"
                        placeholder="Filter tasks..."
                        onchange={handleFilterChange}
                        visible={true}
                    />
                </div>
                <div className="project-creation-window">
                    <DndContext>
                        <div className="stages">
                            {stages.map((stage) => (
                                <Stage key={stage.stageID}
                                    stageID={stage.stageID}
                                    stageName={stage.stageName}
                                    taskList={stage.taskList} 
                                    showTaskMenu={showTaskMenu}
                                    showTaskEdit={showTaskEdit}
                                    filterText={filterText}
                                />
                            ))}
                        </div>
                        <Button onclick={() => showStageMenu()} 
                            classname="default-button" 
                            text="Add Stage"
                            beforeicon={<FaPlus/>}
                        />
                    </DndContext>
                </div>
                <HiddenMenu classname="hidden-stage-create"
                    visible={stageMenuActive} 
                    close={hideStageMenu} 
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

                </HiddenMenu>
            </div>
        </div>
    )
}

export default Project;