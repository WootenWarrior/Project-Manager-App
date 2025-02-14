import Button from "./Button";

interface MenuProps {
    classname?: string;
    visible: boolean;
    close: () => void;
    create: () => void;
    children?: React.ReactNode;
}

const HiddenMenu: React.FC<MenuProps> = ({classname, visible, close, create, children}) => {
    return (
        <div className={classname ? classname : "hidden-menu"}>
            <div className={`create_project_menu ${visible ? 'active' : ''}`}>
                <form className="inputs">
                    {children}
                </form>
                <div className="buttons">
                    <Button classname="default-button"
                        text="Cancel"
                        onclick={close}
                    />
                    <Button classname="default-button"
                        text="Create"
                        onclick={create}
                    />
                </div>
            </div>
        </div>
    )
}

export default HiddenMenu;