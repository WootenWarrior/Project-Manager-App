import { useState } from "react";
import Button from "./Button";

export interface TaskProps {
    id: number;
    name: string;
    completed: boolean;
    onclick?: () => void;
}

export const Task: React.FC<TaskProps> = ({name, completed, onclick}) => {
    const [isCompleted, setCompleted] = useState<boolean>(completed);
    return (
        <Button classname="task" 
            onclick={onclick}>
            <h2>{name}</h2>
        </Button>
    )
}