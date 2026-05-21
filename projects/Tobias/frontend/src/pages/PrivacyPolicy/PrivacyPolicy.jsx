import styles from "./PrivacyPolicy.module.css";

export default function PrivacyPolicy() {
    return (
        <div className={styles.page}>
            <h1>Our Privacy Policy</h1>
            <section className={styles.section}>
                <h2>1. Data Collection</h2>
                <p>
                    We collect your username, email address and 
                    date of birth when you register. We do not 
                    store your password.
                </p>
            </section>
            <section className={styles.section}>
                <h2>2. How we use your data</h2>
                <p>
                    Your data is used to provide and improve our services. 
                    We do not sell your data to third parties. 
                </p>
            </section>
            <section className={styles.section}>
                <h2>3. Your Rights</h2>
                <p>
                    You have the right to access, correct or delete your 
                    own personal data at any time by contacting us. 
                </p>
            </section>
        </div>
    );
}
