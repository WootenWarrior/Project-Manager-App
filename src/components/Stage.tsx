import { Task, TaskProps } from "./Task";
import { useState } from "react";
import Button from "./Button";

interface StageProps {
    taskList: TaskProps[]
}

const Stage: React.FC<StageProps> = ({taskList}) => {
    const [tasks, setTasks] = useState<TaskProps[]>(taskList);

    const addTask = () => {
        setTasks((tasks) => ({
            ...tasks,

        }))
    }

    const handleTaskSelect = (id: string) => {
        console.log(id);
    }
    
    return (
        <div className="stage">
            <div className="tasks">
                {tasks.map((task) => (
                    <Task key={task.id}
                        id={task.id}
                        name={task.name} 
                        completed={task.completed}
                        onclick={() => handleTaskSelect(String(task.id))}
                    />
                ))} 
            </div>
            <Button onclick={addTask}/>
        </div>
    )
}

export default Stage;