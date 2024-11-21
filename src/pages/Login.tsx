import { Button,Input } from "../components"
import "../styles/Login.css"
import { FaUser,FaLock } from "react-icons/fa";
import { BiLogIn } from "react-icons/bi";

function Login() {
    return (
        <div className="login-page">
            <div className="login-box">
                <h1>LOGIN</h1>
                <form className="form">
                    <Input
                    icon={<FaUser/>}
                    type="text"
                    name="username"
                    placeholder="Enter Username"/>
                    <Input
                    icon={<FaLock/>}
                    type="password"
                    name="password"
                    placeholder="Enter Password"/>
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
                    <Button text="Login" icon={<BiLogIn/>} classname="login"/>
                    <p>Don't have an account?</p>
                    <Button text="Sign Up" classname="signup" linkto="/Signup"/>
                </form>
            </div>
        </div>
    )
}

export default Login