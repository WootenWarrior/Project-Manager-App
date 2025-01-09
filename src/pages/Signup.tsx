import "../styles/Signup.css"
import React, { useState } from "react";
import { userSignup } from "../server/Firebase";
import { Button, Input } from "../components";
import { FaEye,FaEyeSlash } from "react-icons/fa";
import { MdOutlineEmail } from "react-icons/md";
import { useNavigate } from "react-router-dom";

function Signup(){
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSignup = async (e:React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
        const data = {
            email: email,
            password: password,
            createdAt: new Date(),
        }
        
        const message = await userSignup(data);

        if(message == "Success"){
            navigate("/Login")
        }
        else{
            if(message){
                setError(message);
            }
            else{
                console.log("Error occurred with no message output.");
            }
        }
    };

    return(
        <div className="signup-page">
            <div className="signup-box">
                <h1>SIGN UP</h1>
                <form className="form" onSubmit={handleSignup}>
                    <Input 
                        visible={true}
                        icon={<MdOutlineEmail/>} 
                        name="email"
                        placeholder="Enter Email"
                        value={email}
                        onchange={(e) => setEmail(e.target.value)}/>
                    <Input 
                        visible={false}
                        icon={<FaEye/>}
                        alternateIcon={<FaEyeSlash/>}
                        name="password"
                        placeholder="Enter Password"
                        value={password}
                        onchange={(e) => setPassword(e.target.value)}/>
                    <Button text="Sign up"
                        classname="default-button"/>
                </form>
                {error && <p style={{ color: "red" }}>{error}</p>}
            </div>
        </div>
    )
}

export default Signup