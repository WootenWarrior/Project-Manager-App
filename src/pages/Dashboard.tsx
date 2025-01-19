import "../styles/Dashboard.css"
import Image from '../assets/react.svg';
import { useState, useEffect } from "react";
import { Button, Option, Input, Textbox } from "../components";
import { FaPlus } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";


function Dashboard() {
    const navigate = useNavigate();
    const [options, setOptions] = useState<{id: number}[]>([]);
    const [error, setError] = useState("");
    const [menuActive, setMenuActive] = useState(false);
    const [projectData, setProjectData] = useState({
        title: '',
        description: '',
        imageUrl: '',
        createdAt: Date.now()
    });

    const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) : void => {
        const { name, value } = event.target;
        setProjectData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleDescriptionChange = (event: React.ChangeEvent<HTMLTextAreaElement>) : void => {
        const { name, value } = event.target;
        setProjectData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const showMenu = () => {
        setMenuActive(true);
    }
    const hideMenu = () => {
        setMenuActive(false);
    }
    
    const createProject = async () => {
        try {
            const uid = localStorage.getItem("user");

            projectData.createdAt = Date.now();

            const res = await fetch("/api/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ uid: uid, projectData: projectData }),
            });

            if(!res.ok){
                const errorData = await res.text();
                setError(errorData);
                console.log('Error:', errorData);
                return;
            }

            const data = await res.json();
            console.log(data);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        const setupDashboard = async () => {
            try {
                const uid = localStorage.getItem("user");
                const res = await fetch(`/api/dashboard?uid=${uid}`);

                if(!res.ok){
                    const errorData = await res.text();
                    console.log('Unexpected error when fetching user dashboard data: ', errorData);
                    navigate("/login");
                    return;
                }

                const data = await res.json();
                console.log(data);

                const projects = data.projects;
                if (projects && Array.isArray(projects)) {
                    const formattedOptions = projects.map((project: any) => ({
                        id: project.id,
                        ...project,
                    }));
                    setOptions(formattedOptions);
                }
                else {
                    console.log("Problem with fetched projects.")
                }
            } catch (error) {
                console.log('Unexpected error: ', error);
                navigate("/login");
                return;
            }
        }
        setupDashboard();
    }, []);

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
                    textcolor="black"
                    width="100%"
                    onchange={handleTitleChange}
                    visible={true}/>
                    <Textbox
                    classname="default-textbox"
                    textcolor="black"
                    backgroundcolour="transparent"
                    placeholder="Enter project description..."
                    width="100%"
                    height="40%"
                    onchange={handleDescriptionChange}/>
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