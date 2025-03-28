import { Task } from "./index";
import { Button } from "./index";
import { FaPlus, FaUpload } from "react-icons/fa6";
import '../styles/components/Stage.css';
import { StageProps } from "../utils/Interfaces";
import { useDroppable } from "@dnd-kit/core";
import Attachment from "./Attachment";

const Stage: React.FC<StageProps> = ({attachmentList, stageName, taskList, showTaskMenu, 
    stageID, showTaskEdit, filterText, showStageEdit, showAttachmentMenu, showAttachmentEdit}) => {
    
    const { setNodeRef } = useDroppable({
        id: stageID,
    });

    const filteredTasks = taskList.filter(task =>
        task.name.toLowerCase().includes((filterText || "").toLowerCase())
    );

    return (
        <div className="stage" id={stageID} ref={setNodeRef}>
            <div className="title-section" id={stageID + "title-section"}>
                <span className="title" onClick={() => showStageEdit(stageID)}>{stageName}</span>
                <div className="button-container">
                    <Button classname="default-button" 
                        onclick={() => showTaskMenu(stageID)}
                        text="Add Task"
                        beforeicon={<FaPlus/>}
                    />
                    <Button classname="default-button" 
                        onclick={() => showAttachmentMenu(stageID)}
                        text="Add Attachment"
                        beforeicon={<FaUpload/>}
                    />
                </div>
            </div>
            <div className="tasks">
                {filteredTasks.map((task) => (
                    <Task key={task.taskID}
                        {...task}
                        onclick={showTaskEdit}
                    />
                ))}
                {attachmentList.map((attachment) => (
                    <Attachment key={attachment.attachmentID}
                        {...attachment}
                        onclick={showAttachmentEdit}
                    />
                ))}
            </div>
        </div>
    )
}

export default Stage;