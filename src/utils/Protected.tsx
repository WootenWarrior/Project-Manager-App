import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export const ProtectedRoute = () => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const navigate = useNavigate();
    useEffect(() => {
        const verifyUser = async () => {
            try {
                const token = localStorage.getItem("token");
                const uid = localStorage.getItem("user");

                const res = await fetch("/api/protected", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ uid, token }),
                });

                if(!res.ok){
                    const errorData = await res.text();
                    console.log('Error:', errorData);
                    navigate("/login");
                    return;
                }

                const data = await res.json();

                setIsAuthenticated(data.verified && (data.uid == uid));
            } catch (error) {
                console.error("Error verifying user:", error);
                setIsAuthenticated(false);
                navigate("/login");
                return;
            }
        }
        verifyUser();
    }, []);

    if (!isAuthenticated) {
        // Loading menu
        return <div>Loading...</div>;
    }
    return isAuthenticated ? <Outlet /> : <Navigate to="/Login" />;
}