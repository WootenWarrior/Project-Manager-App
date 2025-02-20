import { Task } from "./index";
import { Button } from "./index";
import { FaPlus } from "react-icons/fa6";
import '../styles/Stage.css';
import { StageProps } from "../utils/Interfaces";

const Stage: React.FC<StageProps> = ({stageName, taskList, showTaskMenu, stageID}) => {
    const handleTaskSelect = (id: string) => {
        console.log(id);
    }

    return (
        <div className="stage" id={stageName}>
            <div className="tasks">
                {taskList.map((task) => (
                    <Task key={task.taskID}
                        taskID={task.taskID}
                        stageID={stageID}
                        name={task.name} 
                        completed={task.completed}
                        onclick={() => handleTaskSelect(String(task.taskID))}
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