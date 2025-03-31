import { useSearchParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Loading } from "../pages";
import { URL } from "./BackendURL";

const ActivateAccount = () => {
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(false);
    const uid = searchParams.get("uid");
    const nav = useNavigate();

    useEffect(() => {
        const checkForUID = async () => {
            if (uid) {
                try {
                    setLoading(true);
                    const res = await fetch(`${URL}/api/activate`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ uid }),
                    });

                    if (!res.ok) {
                        const errorData = await res.json();
                        console.log(errorData);
                        return;
                    }

                    const { token } = await res.json();
                    if (token) {
                        sessionStorage.setItem("token", token);
                        nav("/Dashboard");
                        setLoading(false);
                        return;
                    }
                    else {
                        nav("/Signup?error=Email activation error.");
                        setLoading(false);
                        return;
                    }
                } catch (error) {
                    console.log(error);
                    nav("/Signup?error=Email activation error.");
                    return;
                }
            }
        }
        checkForUID();
    }, [uid]);

    return (
        <>
            {loading ?? <Loading />}
        </>
    )
};

export default ActivateAccount;