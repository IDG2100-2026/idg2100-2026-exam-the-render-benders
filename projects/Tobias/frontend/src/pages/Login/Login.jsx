import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { apiFetch } from "@/api.js";
import styles from "./Login.module.css";

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    // getting the login function from the auth context
    const { login } = useAuth();
    // useNavigate lets me redirect the user after logging in
    const navigate = useNavigate();

    async function handleSubmit(e) {
        // preventing the default form submission (which would reload the page)
        e.preventDefault();
        setError("");
        try {
            const result = await apiFetch("/users/login", {
                method: "POST",
                body: JSON.stringify({ username, pwd: password })
            });
            login(result.user);
            navigate("/");
        } catch (err) {
            // showing error message if login fails
            setError(err.message);
        }
    }

    return (
        <div className={styles.page}>
            <div className={styles.card}>
                <h1>Log in</h1>
                <form onSubmit={handleSubmit} className={styles.form}>
                    <label className={styles.label}>
                        Username
                        <input 
                            type="text"
                            className={styles.input}
                            value={username}
                            // updating the state on every keystroke
                            onChange={(e) => setUsername(e.target.value)}
                            required  
                        />
                    </label>
                    <label className={styles.label}>
                        Password 
                        <input 
                            type="password"
                            className={styles.input}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required 
                        />
                    </label>
                    <button type="submit" className="button button-primary">Log in</button>
                    {/** Not implemented! */}
                    <button type="button" className="button button-secondary">Forgot password (not implemented)</button>
                    {error && <p className={styles.error}>{error}</p>}
                </form>
                <Link to="/register" className={styles.backLink}>Don't have a user? Register</Link>
                <Link to="/" className={styles.backLink}>Go back</Link>
            </div>
        </div>
    );
}
