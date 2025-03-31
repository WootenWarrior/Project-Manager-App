import "../styles/components/Button.css"
import { ButtonProps } from "../utils/Interfaces"

const Button: React.FC<ButtonProps> = ({text, aftericon, beforeicon, 
    onclick, classname, highlightColor, altIcon, tooltip}) => {
    const smallSizeIcon = aftericon || beforeicon || altIcon || null;

    return(
        <>
            <button onClick={onclick} className={classname} 
                data-tooltip-id="button-tooltip" 
                data-tooltip-content={tooltip}
                style={{"--highlight": highlightColor? highlightColor : "var(--default-button-highlight)"} as React.CSSProperties}>
                {smallSizeIcon && <span className="button-small-icon">{smallSizeIcon}</span>}
                {beforeicon && <span className="button-before-icon">{beforeicon}</span>}
                {text && <span className="button-text">{text}</span>}
                {aftericon && <span className="button-after-icon">{aftericon}</span>}
            </button>
        </>
    )
}

export default Button