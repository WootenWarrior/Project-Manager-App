import Button from "./Button";
import { HiddenMenuProps } from "../utils/Interfaces";
import '../styles/components/HiddenMenu.css';
import { FaX } from "react-icons/fa6";
import { FaPlus } from "react-icons/fa";

const HiddenMenu: React.FC<HiddenMenuProps> = ({classname, visible, close, create, children, createButtonText, closeButtonText}) => {
    return (
        <div className={classname ? classname : "hidden-menu"}>
            <div className={`visible-menu ${visible ? 'active' : ''}`}>
                {close? <span className="close-button">
                    <Button classname="default-button"
                    text={closeButtonText ? closeButtonText : "close"}
                    onclick={() => close()}
                    altIcon={<FaX/>}
                /></span> : <></>}
                <form className="inputs">
                    {children}
                </form>
                <div className="buttons">
                    {create? <span className="create-button">
                        <Button classname="default-button"
                        text={createButtonText ? createButtonText : "create"}
                        onclick={create}
                        altIcon={<FaPlus/>}
                    /></span>: <></>}
                </div>
            </div>
        </div>
    )
}

export default HiddenMenu;