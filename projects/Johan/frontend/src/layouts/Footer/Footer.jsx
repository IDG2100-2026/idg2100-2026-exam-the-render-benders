import { Link } from "react-router";
import { FaCircleInfo, FaShieldHalved, FaFileContract } from "react-icons/fa6";
import styles from "./Footer.module.css";

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <nav>
                <ul>
                    <li>
                        <Link to="/about">
                            <FaCircleInfo /> About Us
                        </Link>
                    </li>
                    <li>
                        <Link to="/policy">
                            <FaShieldHalved /> Privacy Policy
                        </Link>
                    </li>
                    <li>
                        <Link to="/terms">
                            <FaFileContract /> Terms and Conditions
                        </Link>
                    </li>
                </ul>
            </nav>
            <p>Spanish Poker Dice © 2020 - 2026</p>
        </footer>
    );
}