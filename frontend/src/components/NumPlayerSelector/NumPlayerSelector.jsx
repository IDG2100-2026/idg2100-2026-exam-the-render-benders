import { MdPeople } from "react-icons/md";
import { GAME_PLAYER_COUNTS } from "@/config/constants";
import styles from "./NumPlayerSelector.module.css";

export default function NumPlayerSelector({ value, onChange }) {
    return (
        <div className={styles.container}>
            <p className={styles.label}><MdPeople /> Number of players</p>
            <div className={styles.options}>
                {GAME_PLAYER_COUNTS.map((n) => (
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
