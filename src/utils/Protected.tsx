import { Navigate, Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import { handleLogout } from "./Logout";
import { Loading } from "../pages";
import { useNavigate } from "react-router-dom";
import { URL } from "./BackendURL";

export const ProtectedRoute = () => {
    const nav = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const [_isMobile, _setIsMobile] = useState<boolean | null>(null);

    useEffect(() => {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        const uid = localStorage.getItem("user") || sessionStorage.getItem("user");

        /*
        const restrictMobile = async () => {
            const res = await fetch(`${URL}/api/mobile-restrict?token=${token}&userAgent=${navigator.userAgent}`);
            
            if (!res.ok) {
                const errorData = await res.text();
                console.log('Error:', errorData);
                setIsMobile(true);
                nav("/");
                return;
            }
        
            const data = await res.json();
            setIsMobile(!data.verified && (data.uid == uid));
        }
        */

        const verifyUser = async () => {
            try {
                if (!token || !uid) {
                    console.log("Missing session uid or token.")
                    handleLogout(nav);
                    return;
                }

                const res = await fetch(`${URL}/api/protected?token=${token}`);

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

    /*
    if (isMobile) {
        return <Error header="404" message="Page not available on mobile"/>
    }
    */

    return isAuthenticated ? <Outlet /> : <Navigate to="/Login" />;
}