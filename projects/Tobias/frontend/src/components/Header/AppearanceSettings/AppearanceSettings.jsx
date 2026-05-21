import { useState } from "react";
import styles from "./AppearanceSettings.module.css";
import { useAppearance } from "@/contexts/AppearanceContext";

export default function AppearanceSettings(){
    const [isOpen, setIsOpen] = useState(false);
    // destructuring to get the value from the context
    const { darkMode, setDarkMode, boardColor, setBoardColor, soundOn, setSoundOn, lobbyCount, setLobbyCount } = useAppearance();

    // setting some colors that the player can choose between
    const colors = ["darkgreen", "black", "purple", "darkred", "darkblue"];

    return (
        <div className={styles.container}>
            <button className={styles.toggleButton} onClick={() => setIsOpen(!isOpen)}>Settings</button>
            {isOpen && (
                <>
                <div className={styles.overlay} onClick={() => setIsOpen(false)}></div>
                <div className={styles.panel}>
                    <label>
                        <input 
                            type="checkbox"
                            checked={darkMode}
                            onChange={() => setDarkMode(!darkMode)} 
                        />
                        Dark Mode
                    </label>
                    <div className={styles.colorButtons}>
                        <p>Board Color:</p>
                        {colors.map(color => (
                            <button 
                                key={color}
                                className={styles.colorButton}
                                // inline styles because the color is dynamic, and I was not 
                                // able to change it with module.css
                                style={{ backgroundColor: color, outline: boardColor === color ? "3px solid var(--text-heading)" : "none" }}
                                onClick={() => setBoardColor(color)}
                            />
                        ))}
                    </div>
                    <label>
                        <input 
                            type="checkbox"
                            checked={soundOn}
                            onChange={() => setSoundOn(!soundOn)} 
                        />
                        Sound
                    </label>
                    <label>
                        Lobby games: {lobbyCount}
                        <input 
                            type="range"
                            min="1"
                            max="10"
                            value={lobbyCount}
                            onChange={(e) => setLobbyCount(Number(e.target.value))} 
                        />
                    </label>
                </div>
                </>
            )}
        </div>
    );
}
