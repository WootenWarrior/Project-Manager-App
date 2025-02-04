import { Task, TaskProps } from "./Task";
import { useState } from "react";

interface StageProps {
    taskList: TaskProps[]
}

const Stage: React.FC<StageProps> = ({taskList}) => {
    const [tasks, setTasks] = useState<TaskProps[]>(taskList);
    const handleTaskSelect = (taskID:string):void => {
        
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
        </div>
    )
}

export default Stage;