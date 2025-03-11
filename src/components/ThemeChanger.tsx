import { Button, HiddenMenu } from "../components";
import { useState, useEffect } from "react";
import '../styles/components/ThemeChanger.css';

interface ColorTheme {
    background: string;
    highlight: string;
    hiddenMenuBackground: string;
    outlineColor: string;
}

interface ThemeChangerProps {
    visible: boolean;
    closeMenu: () => void;
}

const ThemeChanger: React.FC<ThemeChangerProps> = ({visible, closeMenu,/*theme: ColorTheme*/}) => {
    const [activeTheme, setActiveTheme] = useState<ColorTheme | null>(null);
    const [userTheme, setUserTheme] = useState<ColorTheme>({
        background: "#ffffff",
        highlight: "#ff0000",
        hiddenMenuBackground: "#ffffff",
        outlineColor: "#ffffff"
    });
    const themes: ColorTheme[] = [
        { background: "#11001c", highlight: "#5a028d", hiddenMenuBackground: "#4f0147", outlineColor: "#940085" },
        { background: "#fdf6e3", highlight: "#268bd2", hiddenMenuBackground: "#4f0147", outlineColor: "#940085" },
        { background: "#282c34", highlight: "#61dafb", hiddenMenuBackground: "#4f0147", outlineColor: "#940085" },
        { background: "#2d2a32", highlight: "#c678dd", hiddenMenuBackground: "#4f0147", outlineColor: "#940085" }
    ];

    console.log(visible);
    console.log(activeTheme); // temp

    useEffect(() => {
        const savedTheme = localStorage.getItem("activeTheme");
        if (savedTheme) {
            const parsedTheme = JSON.parse(savedTheme);
            applyTheme(parsedTheme);
            setActiveTheme(parsedTheme);
        }
    }, []);

    const applyTheme = (theme: ColorTheme) => {
        document.documentElement.style.setProperty("--project-bg-color", theme.background);
        document.documentElement.style.setProperty("--project-highlight-color", theme.highlight);
        setActiveTheme(theme);
        localStorage.setItem("activeTheme", JSON.stringify(theme));
    };

    const updateUserTheme = (key: keyof ColorTheme, value: string) => {
        setUserTheme((prevTheme) => ({
            ...prevTheme,
            [key]: value,
        }));
    };

    return(
        <div className="theme-changer">
            <HiddenMenu classname="theme-menu"
                visible={visible}
                close={() => closeMenu()}>
                <div className="options">
                    {themes.map((theme, index) => (
                        <div className="theme" key={index}>
                            <Button
                                classname="toggle-button"
                                onclick={() => applyTheme(theme)}
                                text={`Theme ${index + 1}`}
                            />
                            <span className="colors">
                                <div className="color" style={{ background: theme.background }}></div>
                                <div className="color" style={{ background: theme.highlight }}></div>
                                <div className="color" style={{ background: theme.hiddenMenuBackground }}></div>
                                <div className="color" style={{ background: theme.outlineColor }}></div>
                            </span>
                        </div>
                    ))}
                    <div className="user-theme">
                        <Button classname="toggle-button"
                            text="Custom theme"
                            onclick={() => applyTheme(userTheme)}
                        />
                        <span className="user-colors">
                            <div className="user-color" style={{ background: userTheme.background }}>
                                <input
                                    type="color"
                                    value={userTheme.background}
                                    onChange={(e) => updateUserTheme("background", e.target.value)}
                                />
                            </div>
                            <div className="user-color" style={{ background: userTheme.highlight }}>
                                <input
                                    type="color"
                                    value={userTheme.background}
                                    onChange={(e) => updateUserTheme("highlight", e.target.value)}
                                />
                            </div>
                            <div className="user-color" style={{ background: userTheme.background }}>
                                <input
                                    type="color"
                                    value={userTheme.background}
                                    onChange={(e) => updateUserTheme("background", e.target.value)}
                                />
                            </div>
                        </span>
                    </div>
                </div>
            </HiddenMenu>
        </div>
    )
}
    

export default ThemeChanger;