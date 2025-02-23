import { useNavigate } from "react-router-dom"
import { Button } from "../components";
import "../styles/pages/Landing.css"


function Landing() {
    const navigate = useNavigate();

    const goToLogin = () => {
        navigate("/Login");
    }
    const goToSignup = () => {
        navigate("/Signup");
    }

    return (
        <div className="landing-page">
            <div className="navbar">
                <div className="logo">Stageflow</div>
                <div className="menu">
                    <Button 
                        text="LOGIN"
                        onclick={goToLogin} 
                        classname="default-button"
                        textcolor="black"
                        backgroundcolor="transparent"
                    />
                    <Button
                        text="SIGN-UP"
                        onclick={goToSignup}
                        classname="default-button"
                        textcolor="white"
                        backgroundcolor="black"
                    />
                </div>
            </div>
            <div className="landing-visuals">
                <div className="text">
                    <p>THE POWER OF <br/> STORYBOARDING, <br/>
                    TAILORED FOR YOU.</p>
                </div>
                <div className="gif">

                </div>
            </div>
            <div className="about-section">
                <div className="panel">
                    <div className="gif">
                        
                    </div>
                    <div className="text">
                        <p>QUICKLY EDIT TASKS <br/>
                        AND SET TODOS.</p>
                    </div>
                </div>
                <div className="panel">
                    <div className="text">
                        <p>KEEP TRACK OF TASKS <br/>
                        AND SET NOTIFICATIONS.</p>
                    </div>
                    <div className="gif">

                    </div>
                </div>
                <div className="panel">
                    <div className="gif">

                    </div>
                    <div className="text">
                        <p>ARRANGE STAGES AND <br/>
                        CUSTOMISE EACH PROJECT. </p>
                    </div>
                </div>
            </div>
            <div className="footer">
                
            </div>
        </div>
    )
  }
  
  export default Landing