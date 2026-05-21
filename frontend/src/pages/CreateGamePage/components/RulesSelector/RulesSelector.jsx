import { MdCheckCircle } from "react-icons/md";
import styles from "./RulesSelector.module.css";

export default function RulesSelector({ value, onChange }) {
    return (
        <div className={styles.container}>
            <p className={styles.label}><MdCheckCircle /> Rules</p>
            <div className={styles.options}>
                <button
                    type="button"
                    className={value === "straights-allowed" ? styles.active : styles.option}
                    onClick={() => onChange("straights-allowed")}
                >
                    Straights allowed
                </button>
                <button
                    type="button"
                    className={value === "no-straights" ? styles.active : styles.option}
                    onClick={() => onChange("no-straights")}
                >
                    No straights
                </button>
            </div>
        </div>
    );
}
