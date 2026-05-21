import { createContext, useContext } from "react";

// Creates the context object. null means no user is logged in yet
export const AuthContext = createContext(null);

// Custom hook so components can call useAuth() instead of useContext(AuthContext)
export function useAuth() {
    return useContext(AuthContext);
}