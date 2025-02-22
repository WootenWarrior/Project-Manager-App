import { useState } from "react";
import Button from "./Button";
import { useDraggable } from "@dnd-kit/core";
import '../styles/Task.css';
import { TaskProps } from "../utils/Interfaces";

const Task: React.FC<TaskProps> = ({taskID, name, completed, onclick, startDate, deadline}) => {
    const [isCompleted, setCompleted] = useState<boolean>(completed);
    const { attributes, listeners, setNodeRef, transform} = useDraggable({id: taskID,});

    const style = {
        transform: transform
          ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
          : undefined,
        transition: transform ? "transform 20ms ease" : undefined,
    };

    const formattedStartDate = String(startDate);
    const formattedDeadline = String(deadline);
    const timeLeft = String(startDate);

    const handleSelect = () => {
        if (!onclick) {
            console.log("No onclick method set.");
            return;
        }
        onclick(String(taskID));
    }

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCompleted(e.target.checked);
    };

    return (
        <div ref={setNodeRef} style={style} className="task">
            <div className="task-toolbar">
                <Button classname="select-button" 
                    onclick={() => handleSelect()}
                    text={name}>
                </Button>
                <div className="drag-handle" {...listeners} {...attributes}>
                    <span><b>::</b></span>
                </div>
            </div>
            <div className="task-body">
                <input type="checkbox"
                    checked={isCompleted}
                    onChange={handleCheckboxChange}>
                </input>
                <span>Start: {formattedStartDate}</span>
                <span>Deadline: {formattedDeadline}</span>
                <span>Remaining time: {timeLeft}</span>
            </div>
        </div>
    )
}

export default Task;