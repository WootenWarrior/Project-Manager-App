import '../styles/components/Textbox.css'
import { TextboxProps } from '../utils/Interfaces'

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