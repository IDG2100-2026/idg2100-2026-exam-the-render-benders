import { MdLayers } from "react-icons/md";
import { GAME_ROUND_COUNTS } from "@/config/constants";
import styles from "./RoundsSelector.module.css";

export default function RoundsSelector({ value, onChange }) {
    return (
        <div className={styles.container}>
            <p className={styles.label}><MdLayers /> Number of rounds</p>
            <div className={styles.options}>
                {GAME_ROUND_COUNTS.map((n) => (
                    <button
                        key={n}
                        type="button"
                        className={value === n ? styles.active : styles.option}
                        onClick={() => onChange(n)}
                    >
                        Best of {n}
                    </button>
                ))}
            </div>
        </div>
    );
}
