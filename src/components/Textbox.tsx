import '../styles/Textbox.css'

interface TextboxProps {
    classname?: string;
    backgroundcolour?: string;
    textcolor?: string;
    width?: number;
    height?: number;
    placeholder?: string;
}

const Textbox: React.FC<TextboxProps> = 
({classname, backgroundcolour, textcolor, width, height, placeholder}) => {
    return (
        <textarea className={classname} 
            placeholder={placeholder}
            style={{background: backgroundcolour,
                color: textcolor,
                width: width,
                height: height}}>
        </textarea>
    )
}

export default Textbox