import '../styles/Textbox.css'

interface TextboxProps {
    classname?: string;
    backgroundcolour?: string;
    textcolor?: string;
    width?: string;
    height?: string;
    placeholder?: string;
    onchange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const Textbox: React.FC<TextboxProps> = 
({classname, backgroundcolour, textcolor, width, height, placeholder,onchange}) => {
    return (
        <textarea className={classname} 
            placeholder={placeholder}
            onChange={onchange}
            style={{background: backgroundcolour,
                color: textcolor,
                width: width,
                height: height}}>
        </textarea>
    )
}

export default Textbox