import { useState, useEffect } from "react";
import { AuthContext } from "@/contexts/AuthContext";
import { API_URL } from "@/api";

export default function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(API_URL + "/auth/refresh", { method: "POST", credentials: "include" })
            .then((res) => res.ok ? res.json() : null)
            .then((data) => { if (data?._id) setUser(data); })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

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

    async function logout() {
        await fetch(API_URL + "/auth/logout", { method: "POST", credentials: "include" });
        setUser(null);
    }

    return (
        <AuthContext.Provider value={{ user, login, logout, loading, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
}