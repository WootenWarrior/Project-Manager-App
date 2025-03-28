import { AttachmentProps } from "../utils/Interfaces";
import "../styles/components/Attachment.css";
import { useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import { FaPaperclip } from "react-icons/fa6";

const Attachment: React.FC<AttachmentProps> = ({attachmentID, stageID, name, x, y, onclick}) => {
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: attachmentID
    });

    const style = {
        left: `${x}px`,
        top: `${y}px`,
        transform: transform
          ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
          : undefined,
        transition: transform ? "transform 20ms ease" : undefined,
        zIndex: 1000,
    };

    const handleSelect = () => {
        if (!onclick) {
            console.log("No onclick method set.");
            return;
        }
        onclick(String(stageID), String(attachmentID));
    }

    return(
        <div style={style}
            className={`attachment ${isDragging ? "grabbing" : ""}`}
            {...attributes} {...listeners} ref={setNodeRef}
            onMouseDown={() => setIsDragging(true)}
            onMouseUp={() => setIsDragging(false)}
            id={attachmentID}
            onClick={() => handleSelect()}>
            <div className="attachment-container">
                <FaPaperclip/>
                <p>{name}</p>
            </div>
        </div>
    )
}

export default Attachment;