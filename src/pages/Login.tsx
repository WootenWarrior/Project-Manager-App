import { useState } from "react";
import { Button,Input } from "../components"
import "../styles/Login.css"
import { FaUser,FaEye,FaEyeSlash } from "react-icons/fa";
import { BiLogIn } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import { userLogin } from "../utils/Firebase";

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
        try {
            const loginMessage = await userLogin(email,password);
            
            if(!(loginMessage && loginMessage == "Success")){
                console.log('Error:', loginMessage);
                return;
            }
            console.log("login success");

            const res = await fetch("/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            if(!res.ok){
                const errorData = await res.text();
                setError(errorData);
                console.log('Error:', errorData);
                return;
            }

            const data = await res.json();
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", data.uid);

            console.log(data)
        } catch (e) {
            console.log(e);
            navigate("/");
            return;
        }
        navigate("/Dashboard");
    }

    return (
        <div className="login-page">
            <div className="login-box">
                <h1>LOGIN</h1>
                <form className="form" onSubmit={handleLogin} action="/api/login">
                    <Input
                        icon={<FaUser/>}
                        visible={true}
                        name="email"
                        placeholder="Enter Email"
                        onchange={(e) => setEmail(e.target.value)}
                        textcolor="black"/>
                    <Input
                        visible={false}
                        icon={<FaEye/>}
                        alternateIcon={<FaEyeSlash/>}
                        select={true}
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