import { useState } from "react";
import Button from "./Button";

export interface TaskProps {
    taskID: string;
    name: string;
    completed: boolean;
    onclick?: (id:string) => void;
}

const Task: React.FC<TaskProps> = ({taskID, name, completed, onclick}) => {
    const [isCompleted, setCompleted] = useState<boolean>(completed);
    console.log(isCompleted,setCompleted);

    const handleSelect = () => {
        if (!onclick) {
            return;
        }
        onclick(String(taskID));
    }

    return (
        <Button classname="default-button" 
            onclick={handleSelect}
            text={name}>
        </Button>
    )
}

export default Task;