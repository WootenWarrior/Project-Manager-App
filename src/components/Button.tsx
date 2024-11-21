import { Link } from "react-router-dom";

//Defined optional values for the button input
interface ButtonProps {
    text?: string;
    icon?: React.ReactNode;
    onclick?: () => void;
    classname?: string;
    linkto?: string;
}

const Button: React.FC<ButtonProps> = (
    {text, icon, onclick, classname, linkto='/'}) => {
    return(
        <Link to={linkto}>
            <button onClick={onclick} className={classname}>
                {text && <span>{text}</span>}
                {icon && <span className="button-icon">{icon}</span>}
            </button>
        </Link>
    )
}

export default Button