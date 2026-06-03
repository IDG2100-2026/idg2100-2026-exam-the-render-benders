import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { useAuth } from "@/contexts/AuthContext";
import { apiFetch } from "@/api";
import styles from "./LoginPage.module.css";

export default function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState(null);

    async function handleSubmit(e) {
        e.preventDefault();
        try {
            const userData = await apiFetch("/auth/login", {
                method: "POST",
                body: JSON.stringify({ username, pwd: password })
            });
            login(userData);
            navigate("/");
        } catch (err) {
            if (err.message?.toLowerCase().includes("too many")) {
                setError(err.message);
            } else {
                setError("Invalid username or password. Remember: passwords require uppercase, a number and a symbol (e.g. Password123!).");
            }
        }
    }

    return (
        <div className={styles.page}>
            <form onSubmit={handleSubmit} className={styles.form}>
                <h1>Login</h1>
                
                <div className={styles.field}>
                    <label htmlFor="username">Username</label>
                    <input
                        id="username"
                        type="text"
                        name="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Your username"
                        required
                        autoFocus
                        autoComplete="username"
                    />
                </div>

                <div className={styles.field}>
                    <label htmlFor="password">Password</label>
                    <input
                        id="password"
                        type="password"
                        name="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Your password"
                        required
                        autoComplete="current-password"
                    />
                </div>

                {error && <p className={styles.error}>{error}</p>}

                <button type="submit" className={styles.loginBtn}>
                    Log in
                </button>

                <div className={styles.actions}>
                    <button
                        type="button"
                        className={styles.forgotPasswordButton}
                        onClick={() => alert("Password reset is not available yet.")}
                    >
                        Forgot password?
                    </button>
                </div>

                <p className={styles.registerLink}>
                    Don&apos;t have an account? <Link to="/register" className={styles.registerButton}>Register</Link>
                </p>
            </form>
        </div>
    );
}
