import '../styles/Textbox.css'

interface TextboxProps {
    classname?: string;
    backgroundcolour?: string;
    textcolor?: string;
    width?: number;
    height?: number;
}

const Textbox: React.FC<TextboxProps> = 
({classname, backgroundcolour, textcolor, width, height}) => {
    return (
        <textarea className={classname}
            style={{background: backgroundcolour,
            color: textcolor,
            width: width,
            height: height}}>
        </textarea>
    )
}

export default Textbox