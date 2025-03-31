import { Button, HiddenMenu } from "../components";
import { URL } from "../utils/BackendURL";
import { useState, useEffect } from "react";
import '../styles/components/ThemeChanger.css';

interface ColorTheme {
    background: string;
    highlight: string;
    hiddenMenuBackground: string;
    outlineColor: string;
}

interface ThemeChangerProps {
    isvisible: boolean;
    closeMenu: () => void;
    projectID: string;
}

const ThemeChanger: React.FC<ThemeChangerProps> = ({isvisible, closeMenu, projectID}) => {
    const defaultTheme = { background: "#477bd0", highlight: "#7098da", hiddenMenuBackground: "#6eb6ff", outlineColor: "#ffffff" };
    const [userTheme, setUserTheme] = useState<ColorTheme>(defaultTheme);
    const [_activeTheme, _setActiveTheme] = useState<ColorTheme>(defaultTheme);
    const themes: ColorTheme[] = [
        { background: "#477bd0", highlight: "#7098da", hiddenMenuBackground: "#6eb6ff", outlineColor: "#ffffff" },
        { background: "#c85250", highlight: "#e7625f", hiddenMenuBackground: "#f7bec0", outlineColor: "#e9eae0" },
        { background: "#778a35", highlight: "#d1e2c4", hiddenMenuBackground: "#ebebe8", outlineColor: "#31352e" },
        { background: "#0a0708", highlight: "#444444", hiddenMenuBackground: "#747474", outlineColor: "#b1b1b1" }
    ];

    //Themes sources:
    //https://www.canva.com/colors/color-palettes/cool-cream-strawberry/
    //https://www.canva.com/colors/color-palettes/wall-greens/
    //https://www.canva.com/colors/color-palettes/dark-road-curve/

    const setTheme = async (theme: ColorTheme) => {
        try {
            const token = sessionStorage.getItem("token") || localStorage.getItem("token");
            const res = await fetch(`${URL}/api/theme`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ projectID, token, theme }),
            });

            if(!res.ok){
                const errorData = await res.text();
                console.log(errorData);
                return;
            }
        } catch (error) {
            console.log(error);
        }
    }
    
    useEffect(() => {
        const fetchTheme = async () => {
            try {
                const token = sessionStorage.getItem("token") || localStorage.getItem("token");
                const res = await fetch(`${URL}/api/theme?projectID=${projectID}&token=${token}`);

                if(!res.ok){
                    const errorData = await res.text();
                    console.log(errorData);
                    return;
                }
                const data = await res.json();

                const savedTheme = data.theme;

                if (savedTheme) {
                    applyTheme(savedTheme);
                }
                else {
                    applyTheme(defaultTheme);
                }
            } catch (error) {
                console.log(error);
            }
        }
        fetchTheme();
    }, []);

    const isLightColor = (hexColor: string): boolean => {
        hexColor = hexColor.replace("#", "");
    
        const r = parseInt(hexColor.substring(0, 2), 16);
        const g = parseInt(hexColor.substring(2, 4), 16);
        const b = parseInt(hexColor.substring(4, 6), 16);
    
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        
        return luminance > 0.5;
    };

    const applyTheme = (theme: ColorTheme) => {
        document.documentElement.style.setProperty("--themecolor1", theme.background);
        document.documentElement.style.setProperty("--themecolor2", theme.highlight);
        document.documentElement.style.setProperty("--themecolor3", theme.hiddenMenuBackground);
        document.documentElement.style.setProperty("--themecolor4", theme.outlineColor);
        const isLightTheme = isLightColor(theme.background);
        const textColor = isLightTheme ? "#000000" : "#FFFFFF";
        document.documentElement.style.setProperty("--themecolor6", textColor);
        document.documentElement.style.setProperty("--theme-outline-color", textColor);
        isLightTheme ? 
            document.documentElement.style.setProperty("--theme-highlight-color", "#000000")
            : "";
        setTheme(theme);
    };

    const updateUserTheme = (key: keyof ColorTheme, value: string) => {
        setUserTheme((prevTheme) => ({
            ...prevTheme,
            [key]: value,
        }));
    };

    return(
        <HiddenMenu classname="theme-menu"
            visible={isvisible}
            close={() => closeMenu()}>
            <div className="options">
                <h1 className="title">Choose a theme:</h1>
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
                        <div className="user-color" style={{ background: userTheme.hiddenMenuBackground }}>
                            <input
                                type="color"
                                value={userTheme.hiddenMenuBackground}
                                onChange={(e) => updateUserTheme("hiddenMenuBackground", e.target.value)}
                            />
                        </div>
                        <div className="user-color" style={{ background: userTheme.outlineColor }}>
                            <input
                                type="color"
                                value={userTheme.outlineColor}
                                onChange={(e) => updateUserTheme("outlineColor", e.target.value)}
                            />
                        </div>
                    </span>
                </div>
            </div>
        </HiddenMenu>
    )
}
    

export default ThemeChanger;