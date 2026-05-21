import { useContext } from "react";
import { AuthContext } from "@/contexts/AuthContext.js";

// a custom hook so that any component easily can access the auth state
export const useAuth = () => useContext(AuthContext);
