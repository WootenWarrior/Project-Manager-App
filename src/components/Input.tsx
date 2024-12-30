import "../styles/Input.css"

interface InputProps {
    type?: string;
    icon?: React.ReactNode;
    name?: string;
    placeholder?: string;
    value?: string | number;
    onchange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
    textcolor?: string;
}

const Input: React.FC<InputProps> = ({type,icon,name,placeholder,onchange,textcolor}) =>{
    return(
        <div className="input-container">
            <span className="icon">{icon}</span>
            <input 
            type={type} 
            name={name} 
            placeholder={placeholder} 
            onChange={onchange}/>
        </div>
    )
}

export default Input