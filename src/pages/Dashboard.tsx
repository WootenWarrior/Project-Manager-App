import "../styles/Dashboard.css"
import { Button, Input } from "../components";
import { FaPlus } from "react-icons/fa6";


function Dashboard() {
    
    return(
        <div className="dashboard-page">
            <div className="project-list">
                <h1>Dashboard</h1>
                <Button
                    beforeicon={<FaPlus/>}
                    text="Create project"
                    classname="default-button"/>
                <div className="projects">hi</div>
            </div>
            <div className="project-description">
                <h1>Project</h1>
            </div>
        </div>
    )
}

export default Dashboard;