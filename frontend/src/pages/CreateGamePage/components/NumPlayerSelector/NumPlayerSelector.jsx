import { MdPeople } from "react-icons/md";
import styles from "./NumPlayerSelector.module.css";

// Selector for how many players can join the game (2, 3, or 5)
// value: currently selected number, onChange: called when user picks a different one
export default function NumPlayerSelector({ value, onChange }) {
    return (
        <div className={styles.container}>
            <p className={styles.label}><MdPeople /> Number of players</p>
            <div className={styles.options}>
                {[2, 3, 5].map((n) => (
                    <button
                        key={n}
                        type="button"
                        className={value === n ? styles.active : styles.option}
                        onClick={() => onChange(n)}
                    >
                        {n} players
                    </button>
                ))}
            </div>
        </div>
    );
}
