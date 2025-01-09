import "../styles/Input.css"
import { useState } from "react";

interface InputProps {
    visible?: boolean;
    icon?: React.ReactNode;
    alternateIcon?: React.ReactNode;
    name?: string;
    placeholder?: string;
    value?: string | number;
    onchange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
    textcolor?: string;
    width?: string;
    select?: boolean;
}

const Input: React.FC<InputProps> = ({visible,icon,alternateIcon,name,
    placeholder,onchange,textcolor,width,select}) =>{

    const [isVisible, setVisible] = useState(visible);

    const toggleVisibility = () => {
        select ? setVisible(!isVisible) : setVisible(visible);
    }

    return(
        <div className="input-container">
            <span className="icon" 
                style={{cursor: select ? "pointer" : "default"}}
                onClick={toggleVisibility}>{isVisible ? icon : alternateIcon}</span>
            <input style={{width: width, color: textcolor}}
                type={isVisible ? "text" : "password"}
                name={name} 
                placeholder={placeholder} 
                onChange={onchange}/>
        </div>
    )
}

export default Input