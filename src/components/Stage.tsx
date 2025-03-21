import { Task } from "./index";
import { Button } from "./index";
import { FaPlus } from "react-icons/fa6";
import '../styles/components/Stage.css';
import { StageProps } from "../utils/Interfaces";
import { useDroppable } from "@dnd-kit/core";

const Stage: React.FC<StageProps> = ({stageName, taskList, showTaskMenu, 
    stageID, showTaskEdit, filterText, showStageEdit}) => {

    const { setNodeRef } = useDroppable({
        id: stageID,
    });

    const filteredTasks = taskList.filter(task =>
        task.name.toLowerCase().includes((filterText || "").toLowerCase())
    );

    return (
        <div className="stage" id={stageID} ref={setNodeRef}>
            <div className="title-section">
                <span className="title" onClick={() => showStageEdit(stageID)}>{stageName}</span>
                <div className="button-container">
                    <Button classname="default-button" 
                        onclick={() => showTaskMenu(stageID)}
                        text="Add Task"
                        beforeicon={<FaPlus/>}
                    />
                </div>
            </div>
            <div className="tasks">
                {filteredTasks.map((task) => (
                    <Task
                        key={task.taskID}
                        {...task}
                        onclick={showTaskEdit}
                    />
                ))}
            </div>
        </div>
    )
}

export default Stage;