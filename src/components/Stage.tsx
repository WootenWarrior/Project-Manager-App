import { Task } from "./index";
import { useState } from "react";
import { Button } from "./index";
import { TaskProps } from "../components/Task";
import { FaPlus } from "react-icons/fa6";
import '../styles/Stage.css';

export interface StageProps {
    stageID: string;
    stageName: string;
    taskList: TaskProps[];
    showTaskMenu: (stageID:string) => void;
}

const Stage: React.FC<StageProps> = ({stageName, taskList, showTaskMenu, stageID}) => {
    const [tasks, setTasks] = useState<TaskProps[]>(taskList);

    const handleTaskSelect = (id: string) => {
        console.log(id);
    }

    const addTask = () => {
        const newTask: TaskProps = {
            taskID: String(Date.now()),
            stageID: stageID,
            name: "New Task",
            completed: false,
            onclick: () => handleTaskSelect
        };
        setTasks((prevTasks) => [...prevTasks, newTask]);
    }

    return (
        <div className="stage" id={stageName}>
            <div className="tasks">
                {tasks.map((task) => (
                    <Task taskID={task.taskID}
                        stageID={stageID}
                        name={task.name} 
                        completed={task.completed}
                        onclick={() => handleTaskSelect(String(task.taskID))}
                    />
                ))}
            </div>
            <Button classname="default-button" 
                onclick={() => showTaskMenu(stageID)}
                text="Add Task"
                beforeicon={<FaPlus/>}
            />
        </div>
    )
}

export default Stage;