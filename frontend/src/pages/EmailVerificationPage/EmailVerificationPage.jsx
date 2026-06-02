import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/contexts/AuthContext";
import { apiFetch } from "@/api";
import styles from "./EmailVerificationPage.module.css";

export default function EmailVerificationPage() {
    const navigate = useNavigate();
    const { user, loading, login } = useAuth();
    const [code, setCode] = useState("");
    const [verified, setVerified] = useState(false);
    // single message state - only one message can show at a time
    const [message, setMessage] = useState({ text: "Sending code...", type: "info" });
    const hasSent = useRef(false);

    // auto-send a verification code when the page loads so the user doesn't have to click Resend first
    useEffect(() => {
        if (user && !hasSent.current) {
            hasSent.current = true;
            apiFetch("/auth/resend-verification", {
                method: "POST",
                body: JSON.stringify({ email: user.email })
            })
                .then(() => setMessage({ text: "We sent a code to your email. Enter it below.", type: "success" }))
                .catch(() => setMessage({ text: "Failed to send code. Click resend below.", type: "error" }));
        }
    }, [user]);

    // deletes the old code and sends a new one to the same email
    async function handleResend() {
        setMessage({ text: "Sending code...", type: "info" });
        try {
            await apiFetch("/auth/resend-verification", {
                method: "POST",
                body: JSON.stringify({ email: user?.email })
            });
            setMessage({ text: "A new code has been sent, check the server logs.", type: "success" });
        } catch (err) {
            setMessage({ text: err.message, type: "error" });
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setMessage(null);
        try {
            const result = await apiFetch("/auth/verify-email", {
                method: "POST",
                // sends user._id so backend can find the matching verification code
                body: JSON.stringify({ userId: user?._id, code })
            });
            if (result.user) {
                login(result.user);
            }
            setVerified(true);
        } catch (err) {
            setMessage({ text: err.message, type: "error" });
        }
    }

    if (loading || !user) return null;

    useEffect(() => {
        if (verified) {
            const timer = setTimeout(() => navigate("/"), 2000);
            return () => clearTimeout(timer);
        }
    }, [verified, navigate]);

    if (verified) {
        return (
            <div className={styles.page}>
                <div className={styles.form}>
                    <h1>Email verified!</h1>
                    <p>Your email has been verified. Redirecting you to the homepage...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <form className={styles.form} onSubmit={handleSubmit}>
                <h1>Verify your email</h1>
                {message && (
                    <p className={message.type === "error" ? styles.error : message.type === "success" ? styles.success : undefined}>
                        {message.text}
                    </p>
                )}
                <input
                    type="text"
                    value={code}
                    onChange={(e) => { setCode(e.target.value); setMessage(null); }}
                    placeholder="Enter code"
                />
                <button type="submit">Verify</button>
                <button type="button" onClick={handleResend}>Resend code</button>
            </form>
        </div>
    );
}
