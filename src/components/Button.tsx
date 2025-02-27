import "../styles/components/Button.css"
import { ButtonProps } from "../utils/Interfaces"

const Button: React.FC<ButtonProps> = 
({text, aftericon, beforeicon, onclick, classname, textcolor, backgroundcolor, highlightColor}) => {
    return(
        <button onClick={onclick} className={classname} 
            style={{"--default-button-text-color": textcolor,
            "--default-button-background": backgroundcolor,
            "--select-button-text-color": textcolor,
            "--select-button-background": backgroundcolor,
            "--toggle-button-text-color": textcolor,
            "--toggle-button-background": backgroundcolor,
            "--toggle-button-highlight": highlightColor} as React.CSSProperties}>
            {beforeicon && <span className="button-before-icon">{beforeicon}</span>}
            {text && <span>{text}</span>}
            {aftericon && <span className="button-after-icon">{aftericon}</span>}
        </button>
    )
}

export default Button