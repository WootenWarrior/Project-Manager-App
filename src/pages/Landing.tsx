import { useNavigate } from "react-router-dom"
import { Button } from "../components"
import "../styles/Landing.css"

function Landing() {
    const navigate = useNavigate();

    const goToLogin = () => {
        navigate("/Login");
    }

    return (
        <div className="landing-page">
            <div className="background-shapes"></div>
            <h1>Landing</h1>
            <Button 
            text="Login" 
            onclick={goToLogin} />
        </div>
    )
  }
  
  export default Landing