import { OptionProps } from "../utils/Interfaces";

const projectOption: React.FC<OptionProps> = ({width, height, title, description, onclick, backgroundColor}) => {
    let isLightColor = true;
    if (backgroundColor) {
        const rgb = backgroundColor.replace("#", "");
        const r = parseInt(rgb.substring(0, 2), 16);
        const g = parseInt(rgb.substring(2, 4), 16);
        const b = parseInt(rgb.substring(4, 6), 16);

        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        isLightColor = luminance > 0.5;
    }

    const textColor = isLightColor ? "black" : "white";

    return (
        <button className="option" onClick={onclick}
        style={{background: backgroundColor ? backgroundColor : "var(--color2)", 
        width:width, 
        height:height,
        overflowY:"scroll",
        cursor:"pointer",
        outline: "1px solid var(--default-button-outline)"}}>
            <div className="title" style={{
                color: textColor, 
                fontWeight: "bold", 
                textTransform: "uppercase"}}>{title}</div>
            <p className="description" style={{color: textColor}}>{description}</p>
        </button>
    );
}

export default projectOption;