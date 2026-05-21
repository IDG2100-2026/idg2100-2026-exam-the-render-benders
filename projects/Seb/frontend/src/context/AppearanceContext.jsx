import { useState, useEffect } from "react";
import { AppearanceContext } from "./appearance-context";
import { useAuth } from "@/hooks/useAuth";
import { updateUser } from "@/services/userService";

function normalizeBoardColor(value) {
    const legacyMap = {
        "#0c1416": "default",
        "#1a2628": "deep",
        "#202a44": "blue",
        "#2b1a2b": "plum",
        "var(--sek-board-default)": "default",
        "var(--sek-board-deep)": "deep",
        "var(--sek-board-blue)": "blue",
        "var(--sek-board-plum)": "plum"
    };

    return legacyMap[value] || value || "default";
}

function loadAppearance() {
    try {
        const savedAppearance = JSON.parse(localStorage.getItem("appearance"));
        if (savedAppearance) {
            return {
                ...savedAppearance,
                boardColor: normalizeBoardColor(savedAppearance.boardColor)
            };
        }

        const savedUser = JSON.parse(localStorage.getItem("user"));
        if (savedUser?.appearance) {
            return {
                ...savedUser.appearance,
                boardColor: normalizeBoardColor(savedUser.appearance.boardColor)
            };
        }

        return {};
    } catch {
        return {};
    }
}

export function AppearanceProvider({ children }) {
    const saved = loadAppearance();
    const { user, isLoggedIn, updateCurrentUser } = useAuth();

    const [theme, setTheme] = useState(saved.theme || "dark");
    const [lobbyCount, setLobbyCount] = useState(saved.lobbyCount || 5);
    const [soundEnabled, setSoundEnabled] = useState(saved.soundEnabled ?? true);
    const [boardColor, setBoardColor] = useState(
        normalizeBoardColor(saved.boardColor)
    );

    useEffect(() => {
        const data = { theme, lobbyCount, soundEnabled, boardColor };
        localStorage.setItem("appearance", JSON.stringify(data));
    }, [theme, lobbyCount, soundEnabled, boardColor]);

    useEffect(() => {
        document.documentElement.dataset.theme = theme;
    }, [theme]);

    useEffect(() => {
        const boardColorMap = {
            default: "var(--sek-board-default)",
            deep: "var(--sek-board-deep)",
            blue: "var(--sek-board-blue)",
            plum: "var(--sek-board-plum)"
        };

        const resolvedBoardColor =
            boardColorMap[boardColor] || boardColor || boardColorMap.default;

        document.documentElement.style.setProperty(
            "--game-board-bg",
            resolvedBoardColor
        );
    }, [boardColor]);

    useEffect(() => {
        if (!isLoggedIn || !user?._id) return;

        const timeout = setTimeout(async () => {
            const appearance = { theme, lobbyCount, soundEnabled, boardColor };

            try {
                await updateUser(user._id, { appearance }, "registered");
                updateCurrentUser?.({ appearance });
            } catch {
                // localStorage remains fallback
            }
        }, 400);

        return () => clearTimeout(timeout);
    }, [
        theme,
        lobbyCount,
        soundEnabled,
        boardColor,
        isLoggedIn,
        user,
        updateCurrentUser
    ]);

    return (
        <AppearanceContext.Provider
            value={{
                theme,
                setTheme,
                lobbyCount,
                setLobbyCount,
                soundEnabled,
                setSoundEnabled,
                boardColor,
                setBoardColor
            }}
        >
            {children}
        </AppearanceContext.Provider>
    );
}