import { useNavigate } from "react-router-dom"
import { Button } from "../components";
import "../styles/Landing.css"

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
                        backgroundcolor="transparent">
                    </Button>
                    <Button
                        text="SIGN-UP"
                        onclick={goToSignup}
                        classname="default-button"
                        textcolor="white"
                        backgroundcolor="black">
                    </Button>
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
        </div>
    )
  }
  
  export default Landing