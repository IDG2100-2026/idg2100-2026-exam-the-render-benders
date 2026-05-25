import { MdAttachMoney } from "react-icons/md";
import styles from "./BuyInSelector.module.css";

// Selector for the buy-in amount - points each player pays to join (goes into the pot)
// value: currently selected amount, onChange: called when user picks a different one
export default function BuyInSelector({ value, onChange }) {
    return (
        <div className={styles.container}>
            <p className={styles.label}><MdAttachMoney /> Buy-in</p>
            <div className={styles.options}>
                {[1, 10, 50].map((n) => (
                    <button
                        key={n}
                        type="button"
                        className={value === n ? styles.active : styles.option}
                        onClick={() => onChange(n)}
                    >
                        {n} pts
                    </button>
                ))}
            </div>
        </div>
    );
}
