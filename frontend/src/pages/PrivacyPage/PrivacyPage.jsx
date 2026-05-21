import styles from "./PrivacyPage.module.css";

export default function PrivacyPage() {
    return (
        <div className={styles.page}>
            <h1>Privacy Policy</h1>
            <p className={styles.updated}>Last updated: April 2026</p>

            <h2>1. Information We Collect</h2>
            <p>We collect information you provide when registering, including your username, email address, and date of birth. We also collect gameplay data such as match history and Elo ratings.</p>

            <h2>2. How We Use Your Information</h2>
            <p>Your information is used to operate the platform, manage your account, and improve the user experience. We do not sell your personal data to third parties.</p>

            <h2>3. Data Storage</h2>
            <p>Your data is stored securely. We take reasonable measures to protect it from unauthorized access, but no system is completely secure.</p>

            <h2>4. Cookies and Local Storage</h2>
            <p>We use browser local storage to remember your preferences, such as theme and display settings. No tracking cookies are used.</p>

            <h2>5. Your Rights</h2>
            <p>You have the right to access, correct, or delete your personal data. Contact us through the platform if you wish to exercise these rights.</p>

            <h2>6. Changes to This Policy</h2>
            <p>We may update this privacy policy from time to time. Changes will be posted on this page with an updated date.</p>
        </div>
    );
}
