import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { apiFetch } from "@/api.js";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import styles from "./Register.module.css";

export default function Register() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    // just an extra check where the user typed the password correctly again
    const [confirmPassword, setConfirmPassword] = useState("");
    const [email, setEmail] = useState("");
    const [dateOfBirth, setDateOfBirth] = useState("");
    // checkbox that must be true for the form to be submitted
    const [agreeTerms, setAgreeTerms] = useState(false);

    // destructuring the login function and only returning the login 
    const { login } = useAuth();
    // makes it possible for the user to navigate without using <Link>
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        // checking if both password fields are the same before proceeding
        if (password !== confirmPassword) {
            alert("Passwords does not match");
            return;
        }
        // calculating the age from the date of birth field
        const birthDate = new Date(dateOfBirth);
        const age = Math.floor((new Date() - birthDate) / (365 * 24 * 60 * 60 * 1000));
        if (age < 18) {
            alert("You must be 18 years or older to register");
            return;
        }

        // creating the user
        await apiFetch("/users", {
            method: "POST",
            body: JSON.stringify({ username, pwd: password, email, age })
        });

        // logging the user in automatically after registering
        const loginResult = await apiFetch("/users/login", {
            method: "POST",
            body: JSON.stringify({ username, pwd: password })
        });

        login(loginResult.user);
        navigate("/");
    }
    return (
        <div className={styles.page}>
            <div className={styles.card}>
                <h1>Register</h1>
                <form onSubmit={handleSubmit} className={styles.form}>
                    <label className={styles.label}>
                        Username 
                        <input
                            type="text"
                            className={styles.input}
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required  
                        />
                    </label>
                    <label className={styles.label}>
                        Email 
                        <input
                            type="email"
                            className={styles.input}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required  
                        />
                    </label>
                    <label className={styles.label}>
                        Date of Birth (must be 18+)
                        <input
                            type="date" 
                            className={styles.input}
                            value={dateOfBirth}
                            onChange={(e) => setDateOfBirth(e.target.value)}
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
                    <label className={styles.label}>
                        Confirm password 
                        <input
                            type="password"
                            className={styles.input}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required 
                        />
                    </label>
                    <small>Min. 8 characters and 1 of each: uppercase, lowercase, number and symbol</small>
                    <label className={styles.checkboxLabel}>
                        <input
                            type="checkbox"
                            checked={agreeTerms}
                            // e.target.checked gives true/false instead of a string
                            onChange={(e) => setAgreeTerms(e.target.checked)}
                            required  
                        />
                        I agree to the <Link to="/terms-and-conditions">terms and conditions</Link>
                    </label>
                    <button 
                        type="submit"
                        className="button button-primary"
                    >
                        Register
                    </button>
                </form>
                <Link to="/login" className={styles.backLink}>
                    Already have an account? Log in
                </Link>
                <Link to="/" className={styles.backLink}>
                    Go back
                </Link>
            </div>
        </div>
    );
}
