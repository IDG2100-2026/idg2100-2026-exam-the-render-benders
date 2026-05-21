import { createContext } from "react";

// creating the context with default values 
export const AuthContext = createContext({ user: null, login: () => {}, logout: () => {} });


