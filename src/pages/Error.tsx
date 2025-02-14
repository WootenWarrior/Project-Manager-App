import { useNavigate } from "react-router-dom";
import { Button } from "../components";
import '../styles/ErrorPage.css';

const ErrorPage: React.FC = () => {
    const navigate = useNavigate();
  
    const handleGoHome = () => {
        navigate('/');
    };
  
    return (
        <div className="error-page">
            <h1 className="heading">Oops!</h1>
            <p className="message">Something went wrong. Please try again later.</p>
            <Button classname="default-button" onclick={handleGoHome} text="Go Back"/>
        </div>
    );
};

export default ErrorPage;