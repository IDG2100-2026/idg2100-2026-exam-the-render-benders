import { MdCheckCircle } from "react-icons/md";
import { RULES_STRAIGHTS, RULES_NO_STRAIGHTS } from "@/config/constants";
import styles from "./RulesSelector.module.css";

export default function RulesSelector({ value, onChange }) {
    return (
        <div className={styles.container}>
            <p className={styles.label}><MdCheckCircle /> Rules</p>
            <div className={styles.options}>
                <button
                    type="button"
                    className={value === RULES_STRAIGHTS ? styles.active : styles.option}
                    onClick={() => onChange(RULES_STRAIGHTS)}
                >
                    Straights allowed
                </button>
                <button
                    type="button"
                    className={value === RULES_NO_STRAIGHTS ? styles.active : styles.option}
                    onClick={() => onChange(RULES_NO_STRAIGHTS)}
                >
                    No straights
                </button>
            </div>
        </div>
    );
}
