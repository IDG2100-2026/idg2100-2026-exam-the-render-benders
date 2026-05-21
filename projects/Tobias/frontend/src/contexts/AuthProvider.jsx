import { useState } from "react";
import { AuthContext } from "./AuthContext.js";

// wrapping the app and providing the auth state to all the components
export const AuthProvider = ({ children }) => {
    // trying to fetch the user from localStorage when the app is started so you dont loose 
        // the login after refresh
    const savedUser = localStorage.getItem("user");
    // if there is no stored user, then I parsed the the JSON string back to an object
    // if not, then set as null (not logged in)
    const [user, setUser] = useState(savedUser ? JSON.parse(savedUser) : null);

    const login = (userData) => {
        setUser(userData);
        // storing the user in localStorage so it "survives" refresh
        localStorage.setItem("user", JSON.stringify(userData));
    };
    const logout = () => {
        setUser(null);
        // removing the user from localStorage
        localStorage.removeItem("user");
    };

    return (
        // All components inside AuthProvider can now access user, login and logout
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
