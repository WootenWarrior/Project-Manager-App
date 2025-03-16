import "../styles/components/Button.css"
import { ButtonProps } from "../utils/Interfaces"

const Button: React.FC<ButtonProps> = 
({text, aftericon, beforeicon, onclick, classname, highlightColor}) => {
    return(
        <button onClick={onclick} className={classname} 
            style={{"--highlight": highlightColor? highlightColor : "var(--default-button-highlight)"} as React.CSSProperties}>
            {beforeicon && <span className="button-before-icon">{beforeicon}</span>}
            {text && <span>{text}</span>}
            {aftericon && <span className="button-after-icon">{aftericon}</span>}
        </button>
    )
}

export default Button