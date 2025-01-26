import placeholderImage from "../assets/No-Image-Placeholder.svg.png";

interface OptionProps {
    width?: string;
    height?: string;
    title?: string;
    imageUrl?: string;
    description?: string;
    onclick?: () => void;
}

const projectOption: React.FC<OptionProps> = ({width, height, title, imageUrl, description, onclick}) => {
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
                src={imageUrl || placeholderImage}
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

export default projectOption