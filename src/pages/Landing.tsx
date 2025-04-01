import { useNavigate } from "react-router-dom"
import { BackgroundWaves, Button } from "../components";
import "../styles/pages/Landing.css";
import logo from "../assets/Logo-white.png";
import Example from "../assets/Example1.png";
import Example2 from "../assets/Example2.png";
import Example3 from "../assets/Example3.png";
import Example4 from "../assets/Example4.png";
import { FaUserPlus } from "react-icons/fa6";
import { LuLogIn } from "react-icons/lu";



function Landing() {
    const navigate = useNavigate();
    const isMobile  = navigator.userAgent.includes("Mobile");

    const handleLogin = async () => {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        if (!token) {
            navigate("/login") 
            return;
        }
        navigate("/Dashboard");
    }

    return (
        <div className="landing-page">
            <BackgroundWaves bottom={true} top={true} 
                color1="var(--color1)"
                color2="var(--color2)"
                color3="var(--color3)"
            />
            <div className="navbar">
                <img className="logo" src={logo} alt="logo" loading="lazy"/>
                <div className="menu">
                    <Button 
                        text="LOGIN"
                        onclick={() =>handleLogin()} 
                        classname="default-button"
                        altIcon={<LuLogIn />}
                    />
                    <Button
                        text="SIGN-UP"
                        onclick={() => navigate("/Signup")}
                        classname="default-button"
                        altIcon={<FaUserPlus/>}
                    />
                </div>
            </div>
            <div className="about-section">
                {isMobile && <div className="text">
                    <p>OPEN THE DESKTOP APP FOR <br/> FULL EXPERIENCE.</p>
                </div>}
                <div className="panel">
                    <div className="text">
                        <p>THE POWER OF <br/> STORYBOARDING, <br/>
                        TAILORED FOR YOU.</p>
                    </div>
                    <div className="item">
                    <img src={Example} alt="IMG" loading="lazy"/>
                    </div>

                </div>
                <div className="panel">
                    <div className="item">
                    <img src={Example2} alt="IMG" loading="lazy"/>
                    </div>
                    <div className="text">
                        <p>QUICKLY EDIT TASKS <br/>
                        AND SET TODOS.</p>
                    </div>
                </div>

                <div className="panel">
                    <div className="text">
                        <p>KEEP TRACK OF UPCOMING <br/>
                        TASKS ACROSS ALL YOUR PROJECTS. </p>
                    </div>
                    <div className="item">
                    <img src={Example3} alt="IMG" loading="lazy"/>
                    </div>
                </div>

                <div className="panel">
                    <div className="item">
                    <img src={Example4} alt="IMG" loading="lazy"/>
                    </div>
                    <div className="text">
                        <p>CUSTOMISE EACH PROJECT <br/>
                        WITH SET OR CUSTOM THEMES. </p>
                    </div>
                </div>
            </div>
        </div>
    )
  }
  
  export default Landing