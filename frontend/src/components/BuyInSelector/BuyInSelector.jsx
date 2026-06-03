import { MdAttachMoney } from "react-icons/md";
import { GAME_BUY_INS } from "@/config/constants";
import styles from "./BuyInSelector.module.css";

export default function BuyInSelector({ value, onChange }) {
    return (
        <div className={styles.container}>
            <p className={styles.label}><MdAttachMoney /> Buy-in</p>
            <div className={styles.options}>
                {GAME_BUY_INS.map((n) => (
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
