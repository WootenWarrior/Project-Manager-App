import "../styles/pages/Dashboard.css"
import { useState, useEffect } from "react";
import { Button, Option, Input, Textbox } from "../components";
import { FaPlus, FaRegTrashCan } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import { handleLogout } from "../utils/Logout";
import { URL } from "../utils/BackendURL";
import { OptionProps, ProjectProps } from "../utils/Interfaces";
import HiddenMenu from "../components/HiddenMenu";
import Loading from "./Loading";
import Template1 from "../assets/Template1.png";
import Placeholder from "../assets/Placeholder.png";
import { FiLogOut } from "react-icons/fi";
import { MdArrowBackIos } from "react-icons/md";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/components/Toast.css";



function Dashboard() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [options, setOptions] = useState<OptionProps[]>([]);
    const [menuActive, setMenuActive] = useState(false);
    const [isBlank, _setIsBlank] = useState(true);
    const [deleteMenuActive, setDeleteMenuActive] = useState(false);
    const [taskDetailsActive, setTaskDetailsActive] = useState(false);
    const [projectName, setProjectName] = useState("");
    const [projectData, setProjectData] = useState<ProjectProps>({
        title: '',
        description: '',
        theme: ''
    });
    const [upcomingTask, setUpcomingTask] = useState<{
        id: string,
        remainingTime: number,
        name: string,
        projectName: string
    }>({
        id: "",
        remainingTime: 0,
        name: "",
        projectName: ""
    })

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

    const handleProjectNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        setProjectName(value);
    }

    const handleProjectSelect = (projectId: string): void => {
        navigate(`/Project/${projectId}`);
    }

    const showToastError = (message: string) => {
        toast.error(message, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: false,
            draggable: true,
        });
    };

    const showToastSuccess = (message: string) => {
        toast.success(message, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: false,
            draggable: true,
        });
    }

    const formatRemainingTime = (remainingTime: number) => {
        const totalSeconds = Math.floor(remainingTime / 1000);
        const days = Math.floor(totalSeconds / (60 * 60 * 24));
        const hours = Math.floor((totalSeconds % (60 * 60 * 24)) / (60 * 60));
        const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
    
        return `Days: ${days} Time: ${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
    };
    
    const createProject = async () => {
        if (projectData.title === "") {
            showToastError("Project title required.");
            return;
        }
        try {
            const token = sessionStorage.getItem("token") || localStorage.getItem("token");

            const res = await fetch(`${URL}/api/project`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, projectData }),
            });

            if(!res.ok){
                const errorData = await res.text();
                showToastError("Unexpected error occured, please try again.");
                console.log(errorData);
                return;
            }

            const data = await res.json();

            navigate(`/Project/${data.projectId}`);
        } catch (error) {
            console.log(error);
            showToastError("Unexpected error occured, please try again.");
            setMenuActive(false);
            return;
        }
    };

    const createTemplate = async () => {
        if (projectData.title === "") {
            showToastError("Project title required.");
            setMenuActive(false);
            return;
        }
        try {
            const token = sessionStorage.getItem("token") || localStorage.getItem("token");

            const res = await fetch(`${URL}/api/project`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, projectData }),
            });

            if(!res.ok){
                const errorData = await res.text();
                showToastError("Unexpected error occured, please try again.");
                console.log(errorData);
                return;
            }

            const data = await res.json();

            navigate(`/Project/${data.projectId}`);
        } catch (error) {
            console.log(error);
            showToastError("Unexpected error occured, please try again.");
            setMenuActive(false);
            return;
        }
    };

    const deleteProject = async () => {
        if (!projectName) {
            showToastError("No project name set.");
            setDeleteMenuActive(false);
            return;
        }

        console.log(options);
        const project = options.find((option) => {
            if (option.title) {
                const isFound = option.title.toLowerCase() === projectName.toLowerCase();
                if (isFound) {
                    return option;
                }
            }
        });
        if (!project) {
            showToastError("Project not found.");
            return;
        }
        const projectID = project.id;

        try {
            const token = sessionStorage.getItem("token") || localStorage.getItem("token");

            const res = await fetch(`${URL}/api/project`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, projectID })
            });

            if(!res.ok){
                const errorData = await res.text();
                showToastError("Unexpected error occured, please try again.");
                console.log(errorData);
                return;
            }

            loadDashboard();
            showToastSuccess(`Project "${projectName}" has been deleted.`);
            setDeleteMenuActive(false);
        } catch (error) {
            console.log(error);
            showToastError("Unexpected error occured, please try again.");
            setDeleteMenuActive(false);
            return;
        }
    }


    const loadDashboard = async () => {
        setLoading(true);
        try {
            const token = sessionStorage.getItem("token") || localStorage.getItem("token");
            if (!token) {
                console.log("No token in session.");
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
                const mappedOptions = data.projects.map((project: any) => {
                    return {
                        id: project.id,
                        title: project.name,
                        description: project.description,
                        time: new Date(project.createdAt).toLocaleString(),
                        backgroundColor: project.theme.background,
                    }
                });
                setOptions(mappedOptions);
            }
            else {
                showToastError("Problem with fetched projects. Please refresh.");
                console.log("Problem with fetched projects.");
                return;
            }

            const upcomingTask = data.urgentTask;
            if (upcomingTask) {
                setUpcomingTask(upcomingTask);
                setTaskDetailsActive(true);
            }
            else {
                setUpcomingTask({
                    id: "",
                    remainingTime: 0,
                    name: "",
                    projectName: ""
                });
                setTaskDetailsActive(false);
            }
        } catch (error) {
            console.log('Unexpected error: ', error);
            handleLogout(navigate);
            return;
        }
        setLoading(false);
    }

    useEffect(() => {
        loadDashboard();
    }, []);

    return(
        <div className="dashboard">
            <div className="dashboard-page">
                <div className="project-list">
                    <div className="toolbar">
                        <div className="navigation">
                            <Button onclick={() => handleLogout(navigate)}
                                classname="default-button"
                                text="Logout"
                                altIcon={<FiLogOut />}
                            />
                            <Button onclick={() => navigate("/")}
                                classname="default-button"
                                text="Back to home"
                                beforeicon={<MdArrowBackIos />}
                            />
                        </div>
                        <div className="title-section">
                            <h1>DASHBOARD</h1>
                            <div className="buttons">
                                <Button
                                    beforeicon={<FaPlus/>}
                                    text="Create project"
                                    classname="default-button"
                                    onclick={() => setMenuActive(true)}
                                />
                                <Button
                                    beforeicon={<FaRegTrashCan/>}
                                    text="Delete project"
                                    classname="default-button"
                                    onclick={() => setDeleteMenuActive(true)}
                                />
                            </div>
                        </div>
                        <div className="upcoming-task">
                            <h3>Upcoming task:</h3>
                            <div className="task-details">
                                {taskDetailsActive?
                                    <>
                                        <p><b style={{ color: "red" }}>{upcomingTask.name? upcomingTask.name : ""}</b></p>
                                        <p>{upcomingTask.remainingTime? formatRemainingTime(upcomingTask.remainingTime) : ""}</p>
                                        <p>From project: <b>{upcomingTask.projectName? upcomingTask.projectName : ""}</b></p>
                                    </> 
                                    :
                                    <p><b>No upcoming tasks.</b></p>
                                }
                            </div>
                        </div>
                    </div>
                    <h2>MY PROJECTS:</h2>
                    <div className="projects">
                        {options.length === 0 && loading && <Loading background="transparent"/>}
                        {options
                            .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
                            .map((option) => (
                            <Option key={option.id}
                                title={option.title}
                                id={option.id}
                                time={option.time}
                                width="200px"
                                height="200px"
                                description={option.description}
                                onclick={() => handleProjectSelect(String(option.id))}
                                backgroundColor={option.backgroundColor}
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
                close={() => setMenuActive(false)} 
                create={createProject}
                closeButtonText="Back"
            >
                {isBlank?
                <div className="blank-option">
                    <h1>Create blank project</h1>
                    <Input
                        textcolor="black"
                        width="100%"
                        onchange={handleTitleChange}
                        visible={true}
                        placeholder="Enter project name..."
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
                    </div>
                    :
                    <div className="template-options">
                        <h1>Create project from template</h1>
                        <img src={Template1} alt={Placeholder} onClick={createTemplate}
                        width={400} height={200}/>
                    </div>
                }
            </HiddenMenu>
            <HiddenMenu classname="dashboard-hidden-menu"
                visible={deleteMenuActive} 
                close={() => setDeleteMenuActive(false)} 
                create={deleteProject}
                createButtonText="Delete"
                closeButtonText="Back"
            >
                <div className="form">
                    <h1>Delete project</h1>
                    <Input
                        textcolor="black"
                        width="100%"
                        onchange={handleProjectNameChange}
                        visible={true}
                        placeholder="Enter project name..."
                    />
                </div>
            </HiddenMenu>
            <ToastContainer toastClassName="default-toast"/>
        </div>
    )
}

export default Dashboard;