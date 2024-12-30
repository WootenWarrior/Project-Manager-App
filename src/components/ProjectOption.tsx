interface OptionProps {
    width?: string;
    height?: string;
    title?: string;
    imageUrl?: string;
    description?: string;
}

const projectOption: React.FC<OptionProps> = ({width, height, title, imageUrl, description}) => {
    return (
        <div className="option" 
        style={{background:"white", 
        width:width, 
        height:height}}>
            <img 
                src={imageUrl}
                alt="Project Option"
                style={{width:"100%", 
                height:"100%", 
                objectFit:"cover"}}/>
            <div className="title">{title}</div>
            <p>{description}</p>
        </div>
    );
}

export default projectOption