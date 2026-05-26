import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { apiFetch } from "@/api";
import styles from "./EmailVerificationPage.module.css";

export default function EmailVerificationPage() {
    const { user, loading } = useAuth();
    const [code, setCode] = useState("");
    const [status, setStatus] = useState("pending"); // pending | success | error
    const [error, setError] = useState(null);
    const [resendMsg, setResendMsg] = useState(null);

    // deletes the old code and sends a new one to the same email
    async function handleResend() {
        try {
            await apiFetch("/auth/resend-verification", {
                method: "POST",
                body: JSON.stringify({ email: user?.email })
            });
            setResendMsg("A new code has been sent, check the server logs.");
            setError(null);
        } catch (err) {
            setError(err.message);
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        try {
            await apiFetch("/auth/verify-email", {
                method: "POST",
                // sends user._id so backend can find the matching verification code
                body: JSON.stringify({ userId: user?._id, code })
            });
            setStatus("success");
        } catch (err) {
            setStatus("error");
            setError(err.message);
        }
    }

    if (loading || !user) return null;

    if (status === "success") {
        return (
            <div className={styles.page}>
                <div className={styles.form}>
                    <h1>Email verified!</h1>
                    <p>Your email has been verified. You can now play!</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <form className={styles.form} onSubmit={handleSubmit}>
                <h1>Verify your email</h1>
                <p>We sent a code to your email. Enter it below.</p>
                <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Enter code"
                />
                {error && <p className={styles.error}>{error}</p>}
                <button type="submit">Verify</button>
                <button type="button" onClick={handleResend}>Resend code</button>
                {resendMsg && <p className={styles.success}>{resendMsg}</p>}
            </form>
        </div>
    );
}