import "../styles/Signup.css"
import { useNavigate } from 'react-router-dom';
import { Button, Input } from "../components";
import { FaUser,FaLock } from "react-icons/fa";
import { MdOutlineEmail } from "react-icons/md";

function Signup(){
    const navigate = useNavigate();
    const handleSignUpClick = () =>{
        navigate('/signup');
    }

    return(
        <div className="signup-page">
            <div className="signup-box">
                <h1>SIGN UP</h1>
                <form className="form">
                    <Input 
                    type="text" 
                    icon={<FaUser/>} 
                    name="username"
                    placeholder="Enter Username"/>
                    <Input 
                    type="text" 
                    icon={<MdOutlineEmail/>} 
                    name="email"
                    placeholder="Enter Email"/>
                    <Input 
                    type="password" 
                    icon={<FaLock/>} 
                    name="password"
                    placeholder="Enter Password"/>
                    <Button text="Sign up"
                    onclick={handleSignUpClick}
                    classname="Signup-button"
                    linkto="/"/>
                </form>
            </div>
        </div>
    )
}

export default Signup