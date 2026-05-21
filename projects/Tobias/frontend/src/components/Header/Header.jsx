import { Link } from "react-router-dom";
import NavMenu from "./NavMenu/NavMenu";
import Greetings from "./Greetings/Greetings";
import AppearanceSettings from "./AppearanceSettings/AppearanceSettings";
import styles from "./Header.module.css";

export default function Header(){
    return (
        <header className={styles.header}>
            <Link to="/" className={styles.logo}>SPD</Link>
            <NavMenu />
            <div className={styles.right}>
                <AppearanceSettings />
                <Greetings />
            </div>
        </header>
    );
}
