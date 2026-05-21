import { useState } from "react";
import { AuthContext } from "../contexts/AuthContext";

// Wraps the app and makes user, login and logout available to all components
export default function AuthProvider({ children }) {
    const [user, setUser] = useState(null);

    // Stores the logged in user in state
    function login(userData) {
        setUser(userData);
    }

    // Clears the user from state (logs out)
    function logout() {
        setUser(null);
        localStorage.removeItem("userType");
        localStorage.removeItem("userId"); // ensure the backend sees us as truly anonymous
    }

    return (
        // Passes user, login and logout into the context so any component can access them
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}