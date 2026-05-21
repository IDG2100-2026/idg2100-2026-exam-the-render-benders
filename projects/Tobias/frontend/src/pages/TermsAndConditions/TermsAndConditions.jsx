import styles from "./TermsAndConditions.module.css";

export default function TermsAndConditions() {
    return (
        <div className={styles.page}>
            <h1>Terms and Conditions</h1>
            <section className={styles.section}>
                <h2>1. Accepting terms</h2>
                <p>
                    By using SPD, you agree to these terms, and
                    if you don't, then you have to stop using the 
                    platform.
                </p>
            </section>
            <section className={styles.section}>
                <h2>2. Age Requirement</h2>
                <p>
                    You must be at least 18 years old to register and 
                    use this platform. Underage people who get caught 
                    using the platform will be banned.
                </p>
            </section>
            <section className={styles.section}>
                <h2>3. User Conduct</h2>
                <p>
                    You agree to not cheat, harass other people or use 
                    this platform for any anything illegal. Breaching this, 
                    you will be banned.
                </p>
            </section>
            <section className={styles.section}>
                <h2>4. Changes to Terms</h2>
                <p>
                    We have the right to update these terms at any time. 
                    Continued use of the platform means accepting these new 
                    terms. 
                </p>
            </section>
        </div>
    );
}
