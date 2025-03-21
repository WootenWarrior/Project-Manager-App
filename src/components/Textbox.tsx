import '../styles/components/Textbox.css'
import { TextboxProps } from '../utils/Interfaces'

const Textbox: React.FC<TextboxProps> = ({text, classname, backgroundcolour, 
    textcolor, width, height, placeholder, onchange, value}) => {
    return (
        <div className={classname}>
            <p>
                {text}
            </p>
            <textarea placeholder={placeholder}
            onChange={onchange}
            style={{background: backgroundcolour,
            color: textcolor,
            width: width,
            height: height}}
            value={value}/>
        </div>
    )
}

export default Textbox