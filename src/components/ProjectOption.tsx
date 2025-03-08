import { OptionProps } from "../utils/Interfaces";

const projectOption: React.FC<OptionProps> = ({width, height, title, description, onclick, backgroundColor}) => {
    const textColor = backgroundColor ? "black" : "var(--default-text-color)";

    return (
        <button className="option" onClick={onclick}
        style={{background: backgroundColor ? backgroundColor : "var(--color2)", 
        width:width, 
        height:height,
        justifyContent:"center",
        alignItems:"center",
        display:"flex",
        flexDirection:"column",
        overflowY:"scroll",
        cursor:"pointer",
        outline: "1px solid var(--default-button-outline)"}}>
            <div className="title" style={{
                color: textColor, 
                fontWeight: "bold", 
                textTransform: "uppercase"}}>{title}</div>
            <p style={{color: textColor}}>{description}</p>
        </button>
    );
}

export default projectOption;