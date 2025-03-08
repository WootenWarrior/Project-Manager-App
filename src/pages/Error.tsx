import { useNavigate } from "react-router-dom";
import { Button } from "../components";
import { ErrorPageProps } from "../utils/Interfaces";
import '../styles/pages/ErrorPage.css';

const ErrorPage: React.FC<ErrorPageProps> = ({header, message}) => {
    const navigate = useNavigate();
  
    const handleGoHome = () => {
        navigate('/');
    };
  
    return (
        <div className="error-page">
            <h1 className="heading">{header? header : "Oops"}</h1>
            <p className="message">{message? message : "Something went wrong. Please try again later."}</p>
            <Button classname="default-button" onclick={handleGoHome} text="Back to Homepage"/>
        </div>
    );
};

export default ErrorPage;