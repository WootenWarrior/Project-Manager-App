import { Navigate, Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import { handleLogout } from "./Logout";
import { Loading } from "../pages";
import { useNavigate } from "react-router-dom";

export const ProtectedRoute = () => {
    const nav = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

    useEffect(() => {
        const verifyUser = async () => {
            try {
                const token = localStorage.getItem("token") || sessionStorage.getItem("token");
                const uid = localStorage.getItem("user") || sessionStorage.getItem("user");

                if (!token || !uid) {
                    console.log("Missing session uid or token.")
                    handleLogout(nav);
                    return;
                }

                const res = await fetch("/api/protected", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ token }),
                });

                if(!res.ok){
                    const errorData = await res.text();
                    console.log('Error:', errorData);
                    handleLogout(nav);
                    return;
                }

                const data = await res.json();

                setIsAuthenticated(data.verified && (data.uid == uid));
            } catch (error) {
                console.error("Error verifying user:", error);
                setIsAuthenticated(false);
                handleLogout(nav);
                return;
            }
        }
        verifyUser();
    }, []);

    if (!isAuthenticated) {
        return <Loading />;
    }

    return isAuthenticated ? <Outlet /> : <Navigate to="/Login" />;
}