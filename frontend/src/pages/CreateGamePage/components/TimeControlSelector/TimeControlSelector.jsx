import { MdAccessTime } from "react-icons/md";
import { GAME_TIME_CONTROLS } from "@/config/constants";
import styles from "./TimeControlSelector.module.css";

export default function TimeControlSelector({ value, onChange }) {
    return (
        <div className={styles.container}>
            <p className={styles.label}><MdAccessTime /> Time per round</p>
            <div className={styles.options}>
                {GAME_TIME_CONTROLS.map((n) => (
                    <button
                        key={n}
                        type="button"
                        className={value === n ? styles.active : styles.option}
                        onClick={() => onChange(n)}
                    >
                        {n}s
                    </button>
                ))}
            </div>
        </div>
    );
}
