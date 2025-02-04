import placeholderImage from "../assets/No-Image-Placeholder.svg.png";

export interface OptionProps {
    id: number;
    width?: string;
    height?: string;
    title?: string;
    url?: string;
    description?: string;
    onclick?: () => void;
}

export const projectOption: React.FC<OptionProps> = ({width, height, title, url, description, onclick}) => {
    return (
        <button className="option" onClick={onclick}
        style={{background:"white", 
        width:width, 
        height:height,
        justifyContent:"center",
        alignItems:"center",
        display:"flex",
        flexDirection:"column",
        overflow:"hidden",
        cursor:"pointer"}}>
            <img 
                src={url || placeholderImage}
                alt="Project image"
                style={{width:"100%", 
                height:"100%", 
                objectFit:"cover",
                maxWidth: "90%",
                maxHeight: "70%"}}/>
            <div className="title" style={{
                color:"black", 
                fontWeight: "bold", 
                textTransform: "uppercase"}}>{title}</div>
            <p>{description}</p>
        </button>
    );
}