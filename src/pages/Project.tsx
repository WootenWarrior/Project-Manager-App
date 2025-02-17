import { useParams } from "react-router-dom";
import "../styles/ProjectEditor.css";
import { useEffect, useState } from "react";
import { URL } from "../utils/BackendURL";
import { Stage, Button, Input, HiddenMenu } from "../components/index";
import { TaskProps } from "../components/Task";
import { StageProps } from "../components/Stage";
import { FaPlus } from "react-icons/fa6";
import { DndContext } from '@dnd-kit/core';


function Project() {
    const { projectID } = useParams();
    const [stages, setStages] = useState<StageProps[]>([]);
    const [taskMenuActive, setTaskMenuActive] = useState(false);
    const [stageMenuActive, setStageMenuActive] = useState(false);
    const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
    const [selectedStageId, setSelectedStageId] = useState<string | null>(null);
    const [taskName, setTaskName] = useState("");
    const [stageName, setStageName] = useState("");

    // TEMP BUG FIXES
    console.log(selectedTaskId);


    // MENU TOGGLES

    const showTaskMenu = (taskId: string) => {
        setTaskMenuActive(true);
        setSelectedTaskId(taskId)
    }
    const hideTaskMenu = () => {
        setTaskMenuActive(false);
        setSelectedTaskId(null);
    }

    const showStageMenu = () => {
        setStageMenuActive(true);
        console.log("Shown");
    }
    const hideStageMenu = () => {
        setStageMenuActive(false);
    }


    // API CALL FUNCTIONS

    const addStage = async () => {
        const stageID = `stage-${Date.now()}`;
        const newStage: StageProps = {
            stageID: stageID,
            stageName: stageName,
            taskList: [],
            showTaskMenu: showTaskMenu
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
            console.log("Error with selected stage ID")
            return;
        }
        setSelectedStageId(stageID);

        const newTaskId = `task-${Date.now()}`;
        const newTask: TaskProps = {
            taskID: newTaskId,
            stageID: stageID,
            name: taskName,
            completed: false,
        };

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

        setTaskMenuActive(false);
    }
    
    // FRONTEND INPUT CHANGES

    const handleTaskNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTaskName(e.target.value);
    }
    const handleStageNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setStageName(e.target.value);
    }


    // ONLOAD

    useEffect(() => {
        const token = sessionStorage.getItem("token") || localStorage.getItem("token");
        const loadProjectData = async () => {
            try {
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
                console.log(data);

                const projectData = data.projectData

                if (projectData.stages) {
                    const stages: StageProps[] = Object.entries(
                        projectData.stages as Record<string, StageProps>
                    ).map(
                        ([stageID, stageData]) => ({
                        stageName: stageID,
                        stageID: stageData.stageName,
                        taskList: stageData.taskList as TaskProps[], 
                        showTaskMenu: showTaskMenu
                    }));
    
                    setStages(stages);
                }
            } catch (error) {
                console.log(error);
            }
        }
        loadProjectData();
    }, []);

    return (
        <div className="project">
            <div className="panels">
                <div className="toolbar">
                    <h2>Toolbar</h2>
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
                <HiddenMenu classname="hidden-stage-menu"
                    visible={stageMenuActive} 
                    close={hideStageMenu} 
                    create={() => addStage()}>
                    <h1>Create new stage</h1>
                    <Input
                        textcolor="black"
                        width="100%"
                        onchange={handleStageNameChange}
                        visible={true}
                    />
                </HiddenMenu>
                <HiddenMenu classname="hidden-task-menu"
                    visible={taskMenuActive} 
                    close={hideTaskMenu} 
                    create={() => addTaskToStage(selectedStageId)}>
                    <h1>Create new task</h1>
                    <Input
                        textcolor="black"
                        width="100%"
                        onchange={handleTaskNameChange}
                        visible={true}
                    />
                </HiddenMenu>
            </div>
        </div>
    )
}

export default Project;