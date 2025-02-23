import React, { useState, ChangeEvent } from "react";
import HiddenMenu from "./HiddenMenu";

const BackgroundChanger: React.FC = () => {
    const [backgroundMode, setBackgroundMode] = useState<"color" | "image">("color");
    const [menuActive, setMenuActive] = useState(false);
    const [color, setColor] = useState<string>("#ffffff");

    const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
        const imageUrl = reader.result as string;
        document.documentElement.style.setProperty("--background-image", `url(${imageUrl})`);
        setBackgroundMode("image");
        };
        reader.readAsDataURL(file);
    };

    const handleColorChange = (e: ChangeEvent<HTMLInputElement>) => {
        const newColor = e.target.value;
        document.documentElement.style.setProperty("--background-image", newColor);
        setColor(newColor);
        setBackgroundMode("color");
    };

    return (
        <div style={{ padding: "1rem" }}>
            <h2>Background Changer</h2>
            <HiddenMenu visible={menuActive} 
                close={() => setMenuActive(false)}
                create={() => setMenuActive(false)}>
                <div>
                    <label htmlFor="color-picker">Select a color: </label>
                    <input
                    id="color-picker"
                    type="color"
                    value={color}
                    onChange={handleColorChange}
                    />
                </div>
                <div style={{ marginTop: "1rem" }}>
                    <label htmlFor="image-upload">Or upload an image: </label>
                    <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    />
                </div>
                <p>Current mode: {backgroundMode}</p>
            </HiddenMenu>
        </div>
    );
};

export default BackgroundChanger;