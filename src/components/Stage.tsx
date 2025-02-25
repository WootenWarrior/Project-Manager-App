import { Task } from "./index";
import { Button } from "./index";
import { FaPlus } from "react-icons/fa6";
import '../styles/components/Stage.css';
import { StageProps } from "../utils/Interfaces";

const Stage: React.FC<StageProps> = ({stageName, taskList, showTaskMenu, stageID, showTaskEdit, filterText, showStageEdit}) => {
    const filteredTasks = taskList.filter(task =>
        task.name.toLowerCase().includes((filterText || "").toLowerCase())
    );

    return (
        <div className="stage" id={stageName}>
            <span className="title" onClick={() => showStageEdit(stageID)}>{stageName}</span>
            <div className="tasks">
            {filteredTasks.map((task) => (
                <Task
                    key={task.taskID}
                    taskID={task.taskID}
                    stageID={stageID}
                    name={task.name}
                    completed={task.completed}
                    startDate={task.startDate}
                    startTime={task.startTime}
                    endDate={task.endDate}
                    endTime={task.endTime}
                    onclick={showTaskEdit}
                />
            ))}
            </div>
            <Button classname="default-button" 
                onclick={() => showTaskMenu(stageID)}
                text="Add Task"
                beforeicon={<FaPlus/>}
            />
        </div>
    )
}

export default Stage;