import { Link } from "react-router-dom";
import styles from "./NavMenu.module.css";

export default function NavMenu(){
    return (
        <nav className={styles.nav}>
            <Link to="/lobby" className={styles.link}>Lobby</Link>
            <Link to="/tournaments" className={styles.link}>Tournaments</Link>
            <Link to="/about-spanish-poker-dice" className={styles.link}>About</Link>
        </nav>
    );
}
