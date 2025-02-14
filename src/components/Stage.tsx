import { Task } from "./index";
import { useState } from "react";
import { Button } from "./index";
import { TaskProps } from "../components/Task";
import { FaPlus } from "react-icons/fa6";

export interface StageProps {
    stageID: string;
    stageName: string;
    taskList: TaskProps[];
    showMenu: (stageID:string) => void;
}

const Stage: React.FC<StageProps> = ({stageName, taskList, showMenu}) => {
    const [tasks, setTasks] = useState<TaskProps[]>(taskList);

    const handleTaskSelect = (id: string) => {
        console.log(id);
    }

    const addTask = () => {
        const newTask: TaskProps = {
            taskID: String(Date.now()),
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
                        name={task.name} 
                        completed={task.completed}
                        onclick={() => handleTaskSelect(String(task.taskID))}
                    />
                ))}
            </div>
            <Button classname="default-button" 
                onclick={() => showMenu}
                text="Add Task"
                beforeicon={<FaPlus/>}
            />
        </div>
    )
}

export default Stage;