import { useState } from "react";
import Button from "./Button";
import { useDraggable } from "@dnd-kit/core";
import '../styles/components/Task.css';
import { TaskProps } from "../utils/Interfaces";
import { FaGripLines } from "react-icons/fa";
import { FaX } from "react-icons/fa6";

const Task: React.FC<TaskProps> = ({stageID, taskID, name, completed, onclick, 
    startDate, startTime, endDate, endTime, x, y}) => {
    const [isCompleted, setCompleted] = useState<boolean>(completed);
    const [completedText, setCompletedText] = useState<string>("Incomplete");
    const { attributes, listeners, setNodeRef, transform} = useDraggable({id: taskID,});

    const style = {
        left: `${x}px`,
        top: `${y}px`,
        transform: transform
          ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
          : undefined,
        transition: transform ? "transform 20ms ease" : undefined,
        zIndex: transform ? 1000 : "auto",
    };

    const formattedDeadline = (() => {
        if (endDate && endTime) {
            const dateTimeString = `${endDate}T${endTime}:00`;
            const deadlineDate = new Date(dateTimeString);
            return deadlineDate.toLocaleString();
        }
        return "No deadline set";
    })();

    const formattedStartDate = (() => {
        if (startDate && startTime) {
            const dateTimeString = `${startDate}T${startTime}:00`;
            const start = new Date(dateTimeString);
            return start.toLocaleString();
        }
        return "No start date set";
    })();

    const calculateRemainingTime = () => {
        if (!formattedDeadline) { 
            return "No deadline set";
        } 
        const deadlineDate = new Date(formattedDeadline);

        const now = new Date();
        const timeDifference = deadlineDate.getTime() - now.getTime();

        if (timeDifference <= 0) {
            return "Task is overdue";
        }

        const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));

        return `${days}d ${hours}h ${minutes}m`;
    };

    const handleSelect = () => {
        if (!onclick) {
            console.log("No onclick method set.");
            return;
        }
        onclick(String(stageID), String(taskID));
    }

    const handleToggle = () => {
        setCompleted((completed) => !completed);
    };

    return (
        <div ref={setNodeRef} style={style} className="task">
            <div className="task-toolbar">
                <Button classname="select-button" 
                    onclick={() => handleSelect()}
                    text={name}>
                </Button>
                <div className="drag-handle" {...listeners} {...attributes}>
                    <FaGripLines/>
                </div>
            </div>
            <div className="task-body">
                <Button classname="toggle-button"
                    text="Unfinished"
                    onclick={handleToggle}
                    beforeicon={<FaX/>}>
                </Button>
                <span>Start: {formattedStartDate}</span>
                <span>Deadline: {formattedDeadline}</span>
                <span>Remaining time: {calculateRemainingTime()}</span>
            </div>
        </div>
    )
}

export default Task;