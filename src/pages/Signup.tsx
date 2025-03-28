import "../styles/pages/Signup.css"
import React, { useState, useEffect } from "react";
import { userSignup } from "../utils/Firebase";
import { Button, Input } from "../components";
import { FaEye,FaEyeSlash } from "react-icons/fa";
import { MdOutlineEmail } from "react-icons/md";
import { useNavigate } from "react-router-dom";

function Signup(){
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        setTimeout(() => {
            setError("");
        }, 5000);
    }, [error]);

    const handleSignup = async (e:React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
        const userData = {
            email: email,
            password: password,
            createdAt: new Date(),
        }

        try {
            /*
            const apiKey = import.meta.env.VITE_APP_EMAIL_VERIFY_API_KEY;
            await fetch(`https://api.mails.so/v1/validate?email=${email}`, {
                method: 'GET',
                headers: {
                    'x-mails-api-key': apiKey
                },
                mode: 'no-cors'
            })
            .then(response => response.json())
            .then(data => console.log(data));
            */

            const message = await userSignup(userData);

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
        } catch (error) {
            if(error instanceof Error && error.message) {
                setError(error.message);
            }
            console.log(error);
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
                    <Button text="Sign up" classname="default-button"/>
                </form>
                {error && <p style={{ color: "red" }}>{error}</p>}
            </div>
        </div>
    )
}

export default Signup