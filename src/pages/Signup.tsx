import "../styles/Signup.css"
import React, { useState } from "react";
import { auth, db } from "../Firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { Button, Input } from "../components";
import { FaUser,FaLock } from "react-icons/fa";
import { MdOutlineEmail } from "react-icons/md";
import { useNavigate } from "react-router-dom";

function Signup(){
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSignup = async (e:React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            const data = {
                email: user.email,
                createdAt: new Date(),
            }
            console.log(db, user.uid)

            await setDoc(doc(db, "test", user.uid), {data});

            //navigate("/Login");
        } catch (error: unknown) {
            if (error instanceof Error){
                setError(error.message);
            }
            else{
                console.error("Unknown error:", error);
            }
        }
    };

    return(
        <div className="signup-page">
            <div className="signup-box">
                <h1>SIGN UP</h1>
                <form className="form" onSubmit={handleSignup}>
                    <Input 
                    type="text" 
                    icon={<FaUser/>} 
                    name="username"
                    placeholder="Enter Username"
                    value={username}
                    onchange={(e) => setUsername(e.target.value)}/>
                    <Input 
                    type="text" 
                    icon={<MdOutlineEmail/>} 
                    name="email"
                    placeholder="Enter Email"
                    value={email}
                    onchange={(e) => setEmail(e.target.value)}/>
                    <Input 
                    type="password" 
                    icon={<FaLock/>} 
                    name="password"
                    placeholder="Enter Password"
                    value={password}
                    onchange={(e) => setPassword(e.target.value)}/>
                    <Button text="Sign up"
                    classname="signup"/>
                </form>
                {error && <p style={{ color: "red" }}>{error}</p>}
            </div>
        </div>
    )
}

export default Signup