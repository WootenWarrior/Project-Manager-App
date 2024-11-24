import "../styles/Input.css"

//Defined optional values for the input input
interface InputProps {
    type?: string;
    icon?: React.ReactNode;
    name?: string;
    placeholder?: string;
    value?: string | number;
    onchange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const Input: React.FC<InputProps> = ({type,icon,name,placeholder}) =>{
    return(
        <div className="input-container">
            <span className="icon">{icon}</span>
            <input 
            type={type} 
            name={name} 
            placeholder={placeholder} />
        </div>
    )
}

export default Input