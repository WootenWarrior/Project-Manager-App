//Defined optional values for the button input
interface ButtonProps {
    text?: string;
    icon?: React.ReactNode;
    onclick?: () => void;
    classname?: string;
}

const Button: React.FC<ButtonProps> = (
    {text, icon, onclick, classname}) => {
    return(
        <button onClick={onclick} className={classname}>
            {text && <span>{text}</span>}
            {icon && <span className="button-icon">{icon}</span>}
        </button>
    )
}

export default Button