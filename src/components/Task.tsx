import { useState } from "react";
import Button from "./Button";
import { useDraggable } from "@dnd-kit/core";
import '../styles/Task.css';

export interface TaskProps {
    taskID: string;
    stageID: string;
    name: string;
    completed: boolean;
    onclick?: (id:string) => void;
}

const Task: React.FC<TaskProps> = ({taskID, name, completed, onclick}) => {
    const [isCompleted, setCompleted] = useState<boolean>(completed);
    const { attributes, listeners, setNodeRef, transform} = useDraggable({id: taskID,});

    const style = {
        transform: transform
          ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
          : undefined,
        transition: transform ? "transform 200ms ease" : undefined,
    };

    const handleSelect = () => {
        if (!onclick) {
            return;
        }
        onclick(String(taskID));
    }

    const completeTask = () => {
        setCompleted(true);
    }

    // TEMP BUG FIXES
    console.log(completeTask);
    console.log(isCompleted);

    return (
        <div ref={setNodeRef} style={style} className="task">
            <div className="drag-handle" {...listeners} {...attributes}>
                <span>::</span>
            </div>
            <Button classname="default-button" 
                onclick={handleSelect}
                text={name}>
            </Button>
        </div>
    )
}

export default Task;