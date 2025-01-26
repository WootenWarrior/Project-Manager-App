import { useNavigate } from "react-router-dom";

export const handleLogout = (navigate: ReturnType<typeof useNavigate>) => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    console.log("Logged out successfully!");

    navigate("/login");
};