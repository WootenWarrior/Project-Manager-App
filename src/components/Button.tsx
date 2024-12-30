import "../styles/Button.css"

interface ButtonProps {
    text?: string;
    aftericon?: React.ReactNode;
    beforeicon?: React.ReactNode;
    onclick?: () => void;
    classname?: string;
    textcolor?: string;
    backgroundcolor?: string;
}

const Button: React.FC<ButtonProps> = 
({text, aftericon, beforeicon, onclick, classname, textcolor, backgroundcolor}) => {
    return(
        <button onClick={onclick} className={classname}
            style={{"--text-color": textcolor,
            "--background": backgroundcolor} as React.CSSProperties}>
            {beforeicon && <span className="button-before-icon">{beforeicon}</span>}
            {text && <span>{text}</span>}
            {aftericon && <span className="button-after-icon">{aftericon}</span>}
        </button>
    )
}

export default Button