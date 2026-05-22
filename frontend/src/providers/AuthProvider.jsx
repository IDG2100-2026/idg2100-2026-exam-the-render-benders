import { useState } from "react";
import { AuthContext } from "@/contexts/AuthContext";

function loadUserFromStorage() {
    try {
        const stored = localStorage.getItem("user");
        return stored ? JSON.parse(stored) : null;
    } catch {
        return null;
    }
}

// Wraps the app and makes user, login and logout available to all components
export default function AuthProvider({ children }) {
    const [user, setUser] = useState(loadUserFromStorage);

    // Stores the logged in user in state and persists to localStorage
    function login(userData) {
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("userType", userData.isAdmin ? "admin" : "user");
        localStorage.setItem("userId", userData._id);
    }

    // Clears the user from state (logs out)
    function logout() {
        setUser(null);
        localStorage.removeItem("user");
        localStorage.removeItem("userType");
        localStorage.removeItem("userId");
    }

    return (
        // Passes user, login and logout into the context so any component can access them
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}