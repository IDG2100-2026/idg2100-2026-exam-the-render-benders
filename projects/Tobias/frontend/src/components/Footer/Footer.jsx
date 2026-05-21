import { Link } from "react-router-dom";
import PlatformInfo from "./PlatformInfo";
import styles from "./Footer.module.css";

export default function Footer(){
    return (
        <footer className={styles.footer}>
            <nav className={styles.nav}>
                <Link to="/about" className={styles.link}>About Us</Link>
                <Link to="/privacy-policy" className={styles.link}>Privacy Policy</Link>
                <Link to="/terms-and-conditions" className={styles.link}>Terms and Conditions</Link>
            </nav>
            <PlatformInfo />
        </footer>
    );
}
