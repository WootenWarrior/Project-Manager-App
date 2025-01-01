import { useState } from "react";
import { Button,Input } from "../components"
import "../styles/Login.css"
import { FaUser,FaLock } from "react-icons/fa";
import { BiLogIn } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import { userLogin } from "../Firebase";

function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const goToSignup = () => {
        navigate("/Signup");
    }

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const loginMessage = await userLogin(email,password);

        if(loginMessage == "Success"){
            navigate("/Dashboard")
        }
        else{
            if(loginMessage){
                setError(loginMessage);
            }
            else{
                console.log("Error occurred with no message output.");
            }
        }
    }

    return (
        <div className="login-page">
            <div className="login-box">
                <h1>LOGIN</h1>
                <form className="form" onSubmit={handleLogin}>
                    <Input
                        icon={<FaUser/>}
                        type="text"
                        name="email"
                        placeholder="Enter Email"
                        onchange={(e) => setEmail(e.target.value)}
                        textcolor="black"/>
                    <Input
                        icon={<FaLock/>}
                        type="password"
                        name="password"
                        placeholder="Enter Password"
                        onchange={(e) => setPassword(e.target.value)}/>
                    <div className="under-inputs">
                        <label>
                            <input 
                            type="checkbox" 
                            id="remember" 
                            name="remember" 
                            value="remember"/>
                            Remember me
                        </label>
                        <a href="">Forgot Password?</a>
                    </div>
                    <Button text="Login" 
                    aftericon={<BiLogIn/>} 
                    classname="default-button"
                    backgroundcolor="black"
                    textcolor="white"/>
                    {error && <p className="error" style={{ color: "red"}}>{error}</p>}
                </form>
                <p>Don't have an account?</p>
                <Button text="Sign Up" 
                classname="default-button"
                onclick={goToSignup}
                backgroundcolor="transparent"/>
            </div>
        </div>
    )
}

export default Login