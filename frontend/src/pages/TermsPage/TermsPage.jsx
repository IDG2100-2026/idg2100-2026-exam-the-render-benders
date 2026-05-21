import styles from "./TermsPage.module.css";

export default function TermsPage() {
    return (
        <div className={styles.page}>
            <h1>Terms and Conditions</h1>
            <p className={styles.updated}>Last updated: April 2026</p>

            <h2>1. Acceptance of Terms</h2>
            <p>By accessing or using Spanish Poker Dice, you agree to be bound by these Terms and Conditions. If you do not agree, please do not use the platform.</p>

            <h2>2. Eligibility</h2>
            <p>You must be at least 18 years old to create an account. By registering, you confirm that you meet this requirement.</p>

            <h2>3. User Accounts</h2>
            <p>You are responsible for maintaining the confidentiality of your login credentials. You agree not to share your account with others or use another user's account.</p>

            <h2>4. Acceptable Use</h2>
            <p>You agree not to cheat, exploit bugs, harass other users, or attempt to disrupt the platform. Violations may result in account suspension or permanent ban.</p>

            <h2>5. Intellectual Property</h2>
            <p>All content on this platform, including design, graphics, and code, is the property of Spanish Poker Dice. You may not reproduce or distribute it without permission.</p>

            <h2>6. Changes to Terms</h2>
            <p>We reserve the right to update these terms at any time. Continued use of the platform after changes are posted constitutes your acceptance of the new terms.</p>
        </div>
    );
}
