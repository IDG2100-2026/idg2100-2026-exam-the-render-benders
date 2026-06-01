import { useState, useEffect } from "react";
import { AuthContext } from "@/contexts/AuthContext";
import { API_URL } from "@/api";

// Wraps the app and makes user, login and logout available to all components
export default function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // On mount, call POST /auth/refresh to restore session from the JWT cookie
    useEffect(() => {
        fetch(API_URL + "/auth/refresh", { method: "POST", credentials: "include" })
            .then((res) => res.ok ? res.json() : null)
            .then((data) => { if (data?._id) setUser(data); })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    // Stores the logged in user in state
    function login(userData) {
        setUser(userData);
    }

    async function refreshUser() {
        const res = await fetch(API_URL + "/auth/refresh", {
            method: "POST",
            credentials: "include" 
        });
        if (res.ok) {
            const data = await res.json();
            if (data?._id) setUser(data);
        }
    }

    // Calls backend to clear the JWT cookie, then clears state
    async function logout() {
        await fetch(API_URL + "/auth/logout", { method: "POST", credentials: "include" });
        setUser(null);
    }

    return (
        // Passes user, login and logout into the context so any component can access them
        <AuthContext.Provider value={{ user, login, logout, loading, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
}