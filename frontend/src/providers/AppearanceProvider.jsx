import { useState, useEffect } from "react";
import { AppearanceContext } from "@/contexts/AppearanceContext";
import { useAuth } from "@/contexts/AuthContext";
import { apiFetch } from "@/api";

const DEFAULTS = {
    theme: "dark",
    boardColor: "#3e3e68",
    sound: true,
    lobbyCount: 5
};

function loadFromStorage() {
    try {
        const stored = localStorage.getItem("appearance");
        return stored ? { ...DEFAULTS, ...JSON.parse(stored) } : { ...DEFAULTS };
    } catch {
        return { ...DEFAULTS };
    }
}

export default function AppearanceProvider({ children }) {
    const { user } = useAuth();
    const [preferences, setPreferences] = useState(loadFromStorage);

    // Apply theme to <html> element whenever theme changes
    useEffect(() => {
        document.documentElement.setAttribute("data-theme", preferences.theme);
    }, [preferences.theme]);

    // When the user logs in, load their saved preferences from the backend.
    // This makes preferences persist across devices and after clearing localStorage.
    // Keyed on user._id so it fires on login but not on every re-render.
    useEffect(() => {
        if (user?.preferences) {
            setPreferences({ ...DEFAULTS, ...user.preferences });
        }
    }, [user?._id]);

    // Save to localStorage and backend whenever preferences change
    useEffect(() => {
        localStorage.setItem("appearance", JSON.stringify(preferences));
        if (user) {
            apiFetch(`/users/${user.username}/preferences`, {
                method: "PATCH",
                body: JSON.stringify(preferences)
            }).catch(() => {});
        }
    }, [preferences]);

    function updatePreferences(updates) {
        setPreferences(prev => ({ ...prev, ...updates }));
    }

    return (
        <AppearanceContext.Provider value={{ preferences, updatePreferences }}>
            {children}
        </AppearanceContext.Provider>
    );
}
