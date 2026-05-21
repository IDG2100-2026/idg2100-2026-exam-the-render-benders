import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { apiFetch } from "@/api";
import styles from "./RegisterPage.module.css";

export default function RegisterPage() {
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordRepeat, setPasswordRepeat] = useState("");
    const [dateOfBirth, setDateOfBirth] = useState("");
    const [tos, setTos] = useState(false);

    const [error, setError] = useState(null);

    async function handleSubmit(e) {
        e.preventDefault();

        if (password !== passwordRepeat) {
            setError("Passwords do not match");
            return;
        }
        if (!tos) {
            setError("You must accept the Terms of Service");
            return;
        }

        try {
            await apiFetch("/users", {
                method: "POST",
                body: JSON.stringify({ username, email, pwd: password, dateOfBirth })
            });
            navigate("/login");
        } catch (err) {
            setError(err.message);
        }
    }

    return (
        <div className={styles.page}>
            <form onSubmit={handleSubmit} className={styles.form}>
                <h1>Register</h1>
                
                <div className={styles.field}>
                    <label htmlFor="reg-username">Username</label>
                    <input
                        id="reg-username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="e.g. your_username"
                        required
                        autoFocus
                    />
                </div>

                <div className={styles.field}>
                    <label htmlFor="reg-email">Email</label>
                    <input
                        id="reg-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        required
                    />
                </div>

                <div className={styles.field}>
                    <label htmlFor="reg-password">Password</label>
                    <input
                        id="reg-password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="At least 8 characters"
                        required
                    />
                </div>

                <div className={styles.field}>
                    <label htmlFor="reg-password-repeat">Repeat Password</label>
                    <input
                        id="reg-password-repeat"
                        type="password"
                        value={passwordRepeat}
                        onChange={(e) => setPasswordRepeat(e.target.value)}
                        placeholder="Re-type your password"
                        required
                    />
                </div>

                <div className={styles.field}>
                    <label htmlFor="reg-dob">Date of birth</label>
                    <input
                        id="reg-dob"
                        type="date"
                        value={dateOfBirth}
                        onChange={(e) => setDateOfBirth(e.target.value)}
                        required
                    />
                </div>

                <label className={styles.tosLabel}>
                    <input
                        type="checkbox"
                        checked={tos}
                        onChange={(e) => setTos(e.target.checked)}
                        required
                    />
                    I accept the <Link to="/terms">Terms of Service</Link>
                </label>

                {error && <p className={styles.error}>{error}</p>}
                
                <button type="submit" className={styles.submitBtn}>
                    Register
                </button>
            </form>
        </div>
    );
}
