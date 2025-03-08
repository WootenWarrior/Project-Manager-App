import { useNavigate } from "react-router-dom"
import { Button } from "../components";
import "../styles/pages/Landing.css";
import logo from "../assets/Logo-white.png";


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
                <img className="logo" src={logo} alt="logo"/>
                <div className="menu">
                    <Button 
                        text="LOGIN"
                        onclick={goToLogin} 
                        classname="default-button"
                    />
                    <Button
                        text="SIGN-UP"
                        onclick={goToSignup}
                        classname="default-button"
                    />
                </div>
            </div>
            <div className="about-section">
                <div className="panel">
                    <div className="text">
                        <p>THE POWER OF <br/> STORYBOARDING, <br/>
                        TAILORED FOR YOU.</p>
                    </div>
                    <div className="item">
                </div>

                </div>
                <div className="panel">
                    <div className="item">
                        
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
                    <div className="item">

                    </div>
                </div>

                <div className="panel">
                    <div className="item">

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