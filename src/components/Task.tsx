import { useState, useEffect } from "react";
import { useDraggable } from "@dnd-kit/core";
import '../styles/components/Task.css';
import { TaskProps } from "../utils/Interfaces";

const Task: React.FC<TaskProps> = ({stageID, taskID, name, completed, onclick, 
    startDate, startTime, endDate, endTime, description, x, y, selecting, dragging}) => {
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: taskID
    });

    console.log(selecting, dragging);

    const style = {
        left: `${x}px`,
        top: `${y}px`,
        transform: transform
          ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
          : undefined,
        transition: transform ? "transform 20ms ease" : undefined,
        zIndex: 1000,
    };

    // Dates

    const dateOptions: Intl.DateTimeFormatOptions = {
        weekday: 'short',
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };

    const formattedDeadline = (() => {
        if (endDate && endTime) {
            const dateTimeString = `${endDate}T${endTime}:00`;
            const deadlineDate = new Date(dateTimeString);
            return deadlineDate.toLocaleString(undefined, dateOptions);
        }
        return "No deadline set";
    })();

    const formattedStartDate = (() => {
        if (startDate && startTime) {
            const dateTimeString = `${startDate}T${startTime}:00`;
            const start = new Date(dateTimeString);
            return start.toLocaleString(undefined, dateOptions);
        }
        return "No start date set";
    })();

    const calculateRemainingTime = () => {
        if (!endDate || !endTime) { 
            return "No deadline set"; 
        }
        const deadlineDate = new Date(`${endDate}T${endTime}:00`);

        if (isNaN(deadlineDate.getTime())) {
            console.log("Invalid deadline date");
            return "Invalid deadline";
        }

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
    const [remainingTime, setRemainingTime] = useState<string>(calculateRemainingTime());

    useEffect(() => {
        const interval = setInterval(() => {
            setRemainingTime(calculateRemainingTime());
        }, 60000);

        return () => clearInterval(interval);
    }, []);


    const handleSelect = () => {
        if (!onclick) {
            console.log("No onclick method set.");
            return;
        }
        console.log("clicked");
        onclick(String(stageID), String(taskID));
    }


    return (
        <div ref={setNodeRef} style={style} 
            className={`task ${isDragging ? "grabbing" : ""}`} 
            {...listeners} {...attributes}
            onMouseDown={() => setIsDragging(true)}
            onMouseUp={() => setIsDragging(false)}
            onClick={() => handleSelect()}
            id={taskID}>
            <div className="task-container">
                <div className="task-header">
                    <p>{name}</p>
                </div>
                <div className="task-body">
                    <p>Status: {completed ? "Completed" : "Incomplete"}</p>
                    <p>Start: {formattedStartDate}</p>
                    <p>Deadline: {formattedDeadline}</p>
                    <p>Remaining time: {remainingTime}</p>
                    <div className="description-container">
                        <p>Description: </p>
                        <p>{description? description : "No description set"}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Task;