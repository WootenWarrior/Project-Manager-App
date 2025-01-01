import "../styles/Dashboard.css"
import Image from '../assets/react.svg';
import { useState } from "react";
import { Button, Option, Input, Textbox } from "../components";
import { FaPlus } from "react-icons/fa6";
import { CreateProject } from "../Firebase";


function Dashboard() {
    const [options, setOptions] = useState<{id: number}[]>([]);
    const [error, setError] = useState("");
    const [menuActive, setMenuActive] = useState(false);
    const MAX_PROJECTS = 10;

    const showMenu = () => {
        setMenuActive(true);
    }
    const hideMenu = () => {
        setMenuActive(false);
    }
    
    const createProject = () => {
        if(options.length >= MAX_PROJECTS){
            setError("Too many projects! Please delete one to make more.")
        }
        else{
            //CreateProject()
            const newOption = {id: Date.now()}
            setOptions([...options, newOption])
        }
    };

    return(
        <span className="dashboard">
            <div className="dashboard-page">
                <div className="project-list">
                    <h1>Dashboard</h1>
                    <Button
                        beforeicon={<FaPlus/>}
                        text="Create project"
                        classname="default-button"
                        onclick={showMenu}/>
                    {error && <p style={{ color: "red" }}>{error}</p>}
                    <div className="projects">
                        {options.map((option) => (
                        <Option key={option.id}
                            imageUrl={Image}
                            width="200px"
                            height="200px"
                            description="i am a project"/>))}
                    </div>
                </div>
                <div className="project-info">
                    <h1>Project</h1>
                </div>
            </div>
            <div className={`create_project_menu ${menuActive ? 'active' : ''}`}>
                <form className="inputs">
                    <h1>Create new project</h1>
                    <Input
                    textcolor="black"/>
                    <Textbox
                    classname="default-textbox"
                    textcolor="black"
                    backgroundcolour="transparent"
                    placeholder="Enter project description..."/>
                </form>
                <div className="buttons">
                    <Button
                        classname="default-button"
                        text="cancel"
                        onclick={hideMenu}/>
                    <Button
                        classname="default-button"
                        text="Create"
                        backgroundcolor="black"
                        textcolor="white"
                        onclick={createProject}/>
                </div>
            </div>
        </span>
    )
}

export default Dashboard;