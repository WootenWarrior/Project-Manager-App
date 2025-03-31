import { useState } from "react";
import { Button,Input } from "../components"
import "../styles/pages/Login.css"
import { FaUser,FaEye,FaEyeSlash } from "react-icons/fa";
import { BiLogIn } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import { userLogin } from "../utils/Firebase";
import { URL } from "../utils/BackendURL";
import { IoPersonAdd } from "react-icons/io5";
import { ToastContainer, toast } from "react-toastify";
import Loading from "./Loading";


function Login() {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);

    const showToastError = (message: string) => {
        toast.error(message, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: false,
            draggable: true,
        });
    };

    const goToSignup = () => {
        navigate("/Signup");
    }

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            setLoading(true);
            const loginMessage = await userLogin(email,password);
            
            if (!(loginMessage && loginMessage == "Success")) {
                if (loginMessage) {
                    showToastError(loginMessage);
                    setLoading(false);
                    return;
                }
                else {
                    showToastError("Unexpected error occured.");
                    setLoading(false);
                    return;
                }
            }

            const res = await fetch(`${URL}/api/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                if (errorData.error) {showToastError(errorData.error);}
                else {showToastError("Unexpected error occured.");}
                setLoading(false);
                console.log(errorData);
                return;
            }

            const { token, uid } = await res.json();
            if (rememberMe) {
                localStorage.setItem("token", token);
                localStorage.setItem("user", uid);
            } else {
                sessionStorage.setItem("token", token);
                sessionStorage.setItem("user", uid);
            }
            setLoading(false);
            navigate("/Dashboard");
        } catch (e) {
            console.log(e);
            setLoading(false);
            showToastError("Unexpected error occured.");
            return;
        }
    }

    return (
        <div className="login-page">
            {loading ? <Loading/> :
            <div className="login-box">
                <h1>LOGIN</h1>
                <form className="form" onSubmit={handleLogin}>
                    <Input
                        icon={<FaUser/>}
                        visible={true}
                        name="email"
                        placeholder="Enter Email"
                        onchange={(e) => setEmail(e.target.value)}
                        textcolor="black"
                    />
                    <Input
                        visible={false}
                        icon={<FaEye/>}
                        alternateIcon={<FaEyeSlash/>}
                        select={true}
                        name="password"
                        placeholder="Enter Password"
                        onchange={(e) => setPassword(e.target.value)}
                    />
                    <Button text="Login" 
                        aftericon={<BiLogIn/>} 
                        classname="default-button"
                    />
                    <div className="under-inputs">
                        <label>
                            <input 
                                type="checkbox" 
                                id="remember" 
                                name="remember" 
                                value="remember"
                                onChange={(e) => setRememberMe(e.target.checked)}
                            />
                            Remember me
                        </label>
                    </div>
                </form>
                <p>Don't have an account?</p>
                <Button text="Sign Up" 
                    classname="default-button"
                    onclick={goToSignup}
                    altIcon={<IoPersonAdd />}
                />
            </div>}
            <ToastContainer toastClassName="default-toast"/>
        </div>
    )
}

export default Login