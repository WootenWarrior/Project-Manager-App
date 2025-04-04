import "../styles/pages/Signup.css"
import React, { useState } from "react";
import { userSignup } from "../utils/Firebase";
import { Button, Input } from "../components";
import { FaEye,FaEyeSlash } from "react-icons/fa";
import { MdOutlineEmail } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import Loading from "./Loading";
import "react-toastify/dist/ReactToastify.css";
import "../styles/components/Toast.css";
import { FaArrowLeft, FaPlus } from "react-icons/fa6";
import { BiLogIn } from "react-icons/bi";

function Signup() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

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

    const handleSignup = async (e:React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const userData = {
            email: email,
            password: password,
            createdAt: new Date(),
            uid: ""
        }

        try {
            setLoading(true);
            const signupMessage = await userSignup(userData);

            if (!(signupMessage && signupMessage === "Success")) {
                if (signupMessage) {
                    showToastError(signupMessage);
                    setLoading(false);
                    return;
                }
                else {
                    showToastError("Unexpected error occured.");
                    setLoading(false);
                    return;
                }
            }

            setLoading(false);
            navigate("/Login");
        } catch (error) {
            showToastError("Unexpected error occured.");
            setLoading(false);
            console.log(error);
            return;
        }
    };

    return(
        <div className="signup-page">
            <Button text="Back to home" 
                classname="default-button home"
                onclick={() => navigate("/")}
                altIcon={<FaArrowLeft />}
            />
            {loading ? <Loading/> :
            <div className="signup-box">
                <h1>SIGN UP</h1>
                <form className="form" onSubmit={handleSignup}>
                    <Input 
                        visible={true}
                        icon={<MdOutlineEmail/>} 
                        name="email"
                        placeholder="Enter Email"
                        value={email}
                        onchange={(e) => setEmail(e.target.value)}
                    />
                    <Input 
                        visible={false}
                        icon={<FaEye/>}
                        alternateIcon={<FaEyeSlash/>}
                        name="password"
                        placeholder="Enter Password"
                        value={password}
                        onchange={(e) => setPassword(e.target.value)}
                        select={true}
                    />
                    <Button text="Sign up" classname="default-button" altIcon={<FaPlus/>}/>
                </form>
                <p>Already have an account?</p>
                <Button text="Login" 
                    classname="default-button" 
                    onclick={() => navigate("/Login")}
                    altIcon={<BiLogIn/>}/>
            </div>}
            <ToastContainer toastClassName="default-toast"/>
        </div>
    )
}

export default Signup