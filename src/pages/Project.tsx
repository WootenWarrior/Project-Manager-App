import { useParams } from "react-router-dom";
import "../styles/ProjectEditor.css";
import { useEffect } from "react";
import { URL } from "../utils/BackendURL";

function Project() {
    const { projectId } = useParams();

    useEffect(() => {
        const token = sessionStorage.getItem("token") || localStorage.getItem("token");
        const loadProjectData = async () => {
            try {
                const res = await fetch(`${URL}/api/project`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ projectId, token }),
                });

                if(!res.ok){
                    const errorData = await res.text();
                    console.log(errorData);
                    return;
                }

                const data = await res.json();
                console.log(data);
            } catch (error) {
                console.log("Error fetching project data...");
            }
        }
        loadProjectData();
    });



    return (
        <div className="project">
            <div className="navbar">
                
            </div>
            <div className="panels">
                <div className="toolbar">
                    <h2>Toolbar</h2>
                </div>
                <div className="project-creation-window">

                </div>
            </div>
        </div>
    )
}

export default Project;