import { Link } from "react-router";
import styles from "./NotFoundPage.module.css";

export default function NotFoundPage() {
    return (
        <div className={styles.page}>
            <h1 className={styles.code}>404</h1>
            <p className={styles.message}>Page not found.</p>
            <Link to="/" className={styles.link}>Go home</Link>
        </div>
    );
}
