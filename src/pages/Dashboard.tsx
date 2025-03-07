import "../styles/pages/Dashboard.css"
import { useState, useEffect } from "react";
import { Button, Option, Input, Textbox } from "../components";
import { FaPlus } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import { handleLogout } from "../utils/Logout";
import { URL } from "../utils/BackendURL";
import { OptionProps } from "../utils/Interfaces";
import HiddenMenu from "../components/HiddenMenu";

function Dashboard() {
    const navigate = useNavigate();
    const [options, setOptions] = useState<OptionProps[]>([]);
    const [error, setError] = useState("");
    const [menuActive, setMenuActive] = useState(false);
    const [projectData, setProjectData] = useState<{
        title: string;
        description: string;
        image: File | null;
        theme: string;
    }>({
        title: '',
        description: '',
        image: null,
        theme: "default"
    });

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) : void => {
        const { value } = e.target;
        setProjectData((prevData) => ({
            ...prevData,
            title: value,
        }));
    };

    const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) : void => {
        const { value } = e.target;
        setProjectData((prevData) => ({
            ...prevData,
            description: value,
        }));
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith("image/")) {
                setError("Invalid image file.");
                return;
            }
            setProjectData((prevData) => ({
                ...prevData,
                image: file,
            }));
        }
    }

    const handleProjectSelect = (projectId: string): void => {
        navigate(`/Project/${projectId}`);
    }

    const showMenu = () => {
        setMenuActive(true);
    }
    const hideMenu = () => {
        setMenuActive(false);
    }
    
    const createProject = async () => {
        try {
            const token = sessionStorage.getItem("token") || localStorage.getItem("token");

            if (!token) {
                setError("Missing session uid or token.")
                return;
            }

            if (projectData.title === "") {
                setError("Project title required.");
                return;
            }

            const res = await fetch(`${URL}/api/project`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, projectData }),
            });

            if(!res.ok){
                const errorData = await res.text();
                setError(errorData);
                console.log(errorData);
                return;
            }

            const data = await res.json();
            console.log(data);

            navigate(`/Project/${data.projectId}`);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        const setupDashboard = async () => {
            try {
                const token = sessionStorage.getItem("token") || localStorage.getItem("token");
                if (!token) {
                    console.log("Error: No token in session.")
                    handleLogout(navigate);
                    return;
                }

                const res = await fetch(`${URL}/api/dashboard?token=${token}`);

                if(!res.ok){
                    const errorData = await res.text();
                    console.log('Unexpected error when fetching user dashboard data: ', errorData);
                    handleLogout(navigate);
                    return;
                }

                const data = await res.json();
                const projects = data.projects;

                if (projects && Array.isArray(projects)) {
                    const mappedOptions = data.projects.map((project: any) => ({
                        id: project.id || "",
                        title: project.name || "",
                        description: project.description|| "",
                        imageUrl: project.imageURL|| "",
                        time: new Date(project.createdAt).toLocaleString() || "",
                        theme: project.theme || "default"
                    }));
                    setOptions(mappedOptions);
                }
                else {
                    console.log("Problem with fetched projects.")
                }
            } catch (error) {
                console.log('Unexpected error: ', error);
                handleLogout(navigate);
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
                        onclick={showMenu}
                    />
                    {error && <p style={{ color: "red" }}>{error}</p>}
                    <div className="projects">
                        {options.map((option) => (
                            <Option key={option.id}
                                title={option.title}
                                id={option.id}
                                url={option.url}
                                width="200px"
                                height="200px"
                                description={option.description}
                                onclick={() => handleProjectSelect(String(option.id))}
                            />
                        ))}
                    </div>
                </div>
                <div className="project-info">
                    <h1>Project</h1>
                </div>
            </div>
            <HiddenMenu classname="dashboard-hidden-menu"
                visible={menuActive} 
                close={hideMenu} 
                create={createProject}
            >
                <h1>Create new project</h1>
                <Input
                    textcolor="black"
                    width="100%"
                    onchange={handleTitleChange}
                    visible={true}
                />
                <Textbox
                    classname="default-textbox"
                    textcolor="black"
                    backgroundcolour="transparent"
                    placeholder="Enter project description..."
                    width="100%"
                    height="40%"
                    onchange={handleDescriptionChange}
                />
                <div className="image-upload">
                    <label htmlFor="project-image">Upload Project Image:</label>
                    <input
                        type="file"
                        id="project-image"
                        accept="image/*"
                        onChange={handleImageUpload}
                    />
                </div>
            </HiddenMenu>
        </span>
    )
}

export default Dashboard;