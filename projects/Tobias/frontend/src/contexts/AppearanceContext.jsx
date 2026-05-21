import { createContext, useContext, useState, useEffect } from "react";
import { AuthContext } from "./AuthContext.js";
import { updateUser } from "@/services/userService";

// allowing any component wrapped in AppearanceProvider to read and update 
    // appearance settings without passing props down the component tree
const AppearanceContext = createContext();

export function AppearanceProvider({ children }) {
    // reading the saved value from localStorage with fallback
    // JSON.parse converts string to boolean
    const saved = localStorage.getItem("darkMode");
    const [darkMode, setDarkMode] = useState(saved ? JSON.parse(saved) : false);
    const savedColor = localStorage.getItem("boardColor");
    // is already a string so doesn't need conversion
    const [boardColor, setBoardColor] = useState(savedColor ?? "darkgreen");
    const savedCount = localStorage.getItem("lobbyCount");
    // Number converts string (e.g. "5") back to number
    const [lobbyCount, setLobbyCount] = useState(savedCount ? Number(savedCount) : 5);
    const savedSound = localStorage.getItem("soundOn");
    const [soundOn, setSoundOn] = useState(savedSound ? JSON.parse(savedSound) : false);

    // getting the logged in user from AuthContext
    const { user } = useContext(AuthContext);

    // getting the user's saved appearance settings when they log in
    // I was not able to use setting inside useEffect, but saw eslint-disable from this link: 
    // https://eslint.org/docs/latest/use/configure/rules#using-configuration-comments
    /* eslint-disable */
    useEffect(() => {
        if (!user) {
            // resetting to defaults when loggin out
            setDarkMode(false);
            setBoardColor("darkgreen");
            setSoundOn(false);
            setLobbyCount(5);
            return;
        }
        // load the user's settings or reset to defaults if they had none
        // ?? sets default if value is undefined or null
        setDarkMode(user.appearance?.darkMode ?? false);
        setBoardColor(user.appearance?.boardColor ?? "darkgreen");
        setSoundOn(user.appearance?.soundOn ?? false);
        setLobbyCount(user.appearance?.lobbyCount ?? 5);
    }, [user]);
    /* eslint-enable */

    // runs every time darkMode changes
    useEffect(() => {
        document.documentElement.classList.toggle("dark", darkMode);
        localStorage.setItem("darkMode", JSON.stringify(darkMode));
        // saving it to backend if the user is logged in
        if (user?.uid) {
            updateUser(user.uid, { appearance: { darkMode, boardColor, soundOn, lobbyCount } });
        }
    }, [darkMode]);

    // runs every time boardColor changes
    useEffect(() => {
        // setProperty sets --board-color as a CSS variable on the html
            // (can then be used: var(--board-color))
        document.documentElement.style.setProperty("--board-color", boardColor);
        localStorage.setItem("boardColor", boardColor);
        // saving it to backend if the user is logged in
        if (user?.uid) {
            updateUser(user.uid, { appearance: { darkMode, boardColor, soundOn, lobbyCount } });
        }
    }, [boardColor]);

    // runs every time soundOn changes
    useEffect(() => {
        // soundOn is boolean, so I used JSON.stringify to store as string
        localStorage.setItem("soundOn", JSON.stringify(soundOn));
        // saving it to backend if user is logged in
        if (user?.uid) {
            updateUser(user.uid, { appearance: { darkMode, boardColor, soundOn, lobbyCount } });
        }
    }, [soundOn]);

    // runs every time lobbyCount changes
    useEffect(() => {
        // String() converts the number to string (localStorage needs string)
        localStorage.setItem("lobbyCount", String(lobbyCount));
        // saving to backend if user is logged in
        if (user?.uid) {
            updateUser(user.uid, { appearance: { darkMode, boardColor, soundOn, lobbyCount } });
        }
    }, [lobbyCount]);

    return (
        // Provider makes values available to any component that calls useAppearance
            // as long as its inside AppearanceProvider
        <AppearanceContext.Provider value={{ darkMode, setDarkMode, boardColor, setBoardColor, soundOn, setSoundOn, lobbyCount, setLobbyCount }}>
            {children}
        </AppearanceContext.Provider>
    );
}

// A custom hook so the components can access the context with: useAppearance()
export function useAppearance() {
    return useContext(AppearanceContext);
}
