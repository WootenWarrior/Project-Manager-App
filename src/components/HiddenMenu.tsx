import Button from "./Button";
import { HiddenMenuProps } from "../utils/Interfaces";
import '../styles/components/HiddenMenu.css';

const HiddenMenu: React.FC<HiddenMenuProps> = ({classname, visible, close, create, children, createButtonText, closeButtonText}) => {
    return (
        <div className={classname ? classname : "hidden-menu"}>
            <div className={`create_project_menu ${visible ? 'active' : ''}`}>
                <form className="inputs">
                    {children}
                </form>
                <div className="buttons">
                    {close? <Button classname="default-button"
                        text={closeButtonText ? closeButtonText : "close"}
                        onclick={() => close()}
                    /> : <></>}
                    {create? <Button classname="default-button"
                        text={createButtonText ? createButtonText : "create"}
                        onclick={create}
                    />: <></>}
                </div>
            </div>
        </div>
    )
}

export default HiddenMenu;