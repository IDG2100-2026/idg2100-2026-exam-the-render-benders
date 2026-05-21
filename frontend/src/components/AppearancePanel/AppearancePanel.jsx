import { useState, useEffect, useRef } from "react";
import { MdSettings } from "react-icons/md";
import { useAppearance } from "../../contexts/AppearanceContext";
import styles from "./AppearancePanel.module.css";

// Predefined board colors the user can choose from
const BOARD_COLORS = [
    { label: "Purple", value: "#3e3e68" },
    { label: "Green", value: "#2d6a4f" },
    { label: "Red", value: "#6a2d2d" },
    { label: "Blue", value: "#1a3a5c" },
    { label: "Dark", value: "#1a1a1a" },
];

export default function AppearancePanel() {
    // Controls whether the panel is visible or hidden
    const [open, setOpen] = useState(false);
    // preferences holds the current settings, updatePreferences updates one or more fields at a time
    const { preferences, updatePreferences } = useAppearance();
    const panelRef = useRef(null);

    // Effect to close the panel when clicking outside of it
    useEffect(() => {
        function handleClickOutside(event) {
            // If panel is open and the click is NOT inside our component, close it
            if (open && panelRef.current && !panelRef.current.contains(event.target)) {
                setOpen(false);
            }
        }

        // Add listener when panel is open
        if (open) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        // Cleanup: remove listener when panel closes or component unmounts
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [open]);

    return (
        <div className={styles.wrapper} ref={panelRef}>
            {/* Palette icon button that toggles the panel */}
            <button className={styles.trigger} onClick={() => setOpen(p => !p)} aria-label="Appearance settings">
                <MdSettings />
            </button>
            {open && (
                <div className={styles.panel}>
                    {/* Toggle between dark and light theme - applies data-theme to <html> via AppearanceProvider */}
                    <div className={styles.row}>
                        <span>Theme</span>
                        <button
                            className={styles.toggle}
                            onClick={() => updatePreferences({ theme: preferences.theme === "dark" ? "light" : "dark" })}
                        >
                            {preferences.theme === "dark" ? "Dark" : "Light"}
                        </button>
                    </div>
                    {/* Sound toggle - actual sound not implemented, just saves the preference */}
                    <div className={styles.row}>
                        <span>Sound</span>
                        <button
                            className={styles.toggle}
                            onClick={() => updatePreferences({ sound: !preferences.sound })}
                        >
                            {preferences.sound ? "On" : "Off"}
                        </button>
                    </div>
                    {/* Board color picker - shows colored circles, highlights the active one */}
                    <div className={styles.colorRow}>
                        <span>Board color</span>
                        <div className={styles.colors}>
                            {BOARD_COLORS.map((color) => (
                                <button
                                    key={color.value}
                                    className={`${styles.colorSwatch} ${preferences.boardColor === color.value ? styles.active : ""}`}
                                    style={{ backgroundColor: color.value }}
                                    onClick={() => updatePreferences({ boardColor: color.value })}
                                    aria-label={color.label}
                                />
                            ))}
                        </div>
                    </div>
                    {/* Slider to control how many games are shown in the lobby preview on the homepage */}
                    <div className={styles.row}>
                        <span>Lobby games: {preferences.lobbyCount}</span>
                        <input
                            type="range"
                            min={1}
                            max={10}
                            value={preferences.lobbyCount}
                            onChange={(e) => updatePreferences({ lobbyCount: parseInt(e.target.value) })}
                            className={styles.slider}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
