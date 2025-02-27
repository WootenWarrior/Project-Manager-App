import { Button, HiddenMenu } from "../components";
import { useState } from "react";

interface ColorTheme {
    
}

const ThemeChanger: React.FC<ColorTheme> = () => {
    const [menuActive, setMenuActive] = useState(false);

    const changeTheme = () => {
        const randomColor = "";
        document.documentElement.style.setProperty("--project-bg-color", randomColor);
    }

    const showMenu = () => {
        setMenuActive(true);
    }
    const hideMenu = () => {
        setMenuActive(false);
    }

    return(
        <div className="theme-changer">
            <Button classname="default-button"
                onclick={showMenu}
                text="Change theme"
            />
            <HiddenMenu classname="theme-menu"
                visible={menuActive}
                close={hideMenu}>
                <div className="options">
                    <Button classname="toggle-button"
                        text="Theme 1"
                        onclick={changeTheme}
                    />
                    <Button classname="toggle-button"
                        text="Theme 2"
                        onclick={changeTheme}
                    />
                    <Button classname="toggle-button"
                        text="Theme 3"
                        onclick={changeTheme}
                    />
                    <Button classname="toggle-button"
                        text="Theme 4"
                        onclick={changeTheme}
                    />
                    <Button classname="default-button"
                        text="Custom theme"
                        onclick={changeTheme}
                    />
                </div>
            </HiddenMenu>
        </div>
    )
}
    

export default ThemeChanger;