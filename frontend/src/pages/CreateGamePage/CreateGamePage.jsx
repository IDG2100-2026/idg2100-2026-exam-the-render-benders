import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/contexts/AuthContext";
import { apiFetch } from "@/api";
import { MAX_ELO, RULES_STRAIGHTS, GAME_ROUND_COUNTS, GAME_TIME_CONTROLS, GAME_PLAYER_COUNTS, GAME_BUY_INS } from "@/config/constants";
import RoundsSelector from "./components/RoundsSelector/RoundsSelector";
import RulesSelector from "./components/RulesSelector/RulesSelector";
import TimeControlSelector from "./components/TimeControlSelector/TimeControlSelector";
import NumPlayerSelector from "./components/NumPlayerSelector/NumPlayerSelector";
import BuyInSelector from "./components/BuyInSelector/BuyInSelector";
import styles from "./CreateGamePage.module.css";

export default function CreateGamePage() {
    const { user } = useAuth(); // get the logged in user from context
    const navigate = useNavigate();

    // Form state - one value per field, matches what the backend expects
    const [rounds, setRounds] = useState(GAME_ROUND_COUNTS[0]);
    const [rules, setRules] = useState(RULES_STRAIGHTS);
    const [timeControl, setTimeControl] = useState(GAME_TIME_CONTROLS[0]);
    const [allowAnonymous, setAllowAnonymous] = useState(false);
    const [desiredElo, setDesiredElo] = useState("");
    const [numPlayers, setNumPlayers] = useState(GAME_PLAYER_COUNTS[0]);
    const [buyIn, setBuyIn] = useState(GAME_BUY_INS[0]);

    const [error, setError] = useState(null); // error message shown if the API call fails

    async function handleSubmit(e) {
        e.preventDefault(); // stops the browser from reloading the page on form submit
        try {
            const newGame = await apiFetch("/games", {
                method: "POST",
                body: JSON.stringify({
                    players: [user._id], // the creator is automatically added as a player
                    variant: { rounds, rules, timeControl },
                    allowAnonymous,
                    numPlayers,
                    buyIn,
                    // Only include desiredElo if the user typed something, otherwise skip the field entirely
                    ...(desiredElo !== "" && { desiredElo: Number(desiredElo) })
                })
            });
            // Navigate to the new game page after it is created
            navigate(`/games/${newGame._id}`);
        } catch (err) {
            // If the backend returns an error, show it to the user
            setError(err.message);
        }
    }

    return (
        <div className={styles.page}>
            <form onSubmit={handleSubmit} className={styles.form}>
                <h1>Create Game</h1>
                {/* Variant sub-components - each controls one part of the game variant */}
                <RoundsSelector value={rounds} onChange={setRounds} />
                <RulesSelector value={rules} onChange={setRules} />
                <TimeControlSelector value={timeControl} onChange={setTimeControl} />
                <NumPlayerSelector value={numPlayers} onChange={setNumPlayers} />
                <BuyInSelector value={buyIn} onChange={setBuyIn} />

                <label className={styles.checkboxLabel}>
                    <input
                        type="checkbox"
                        checked={allowAnonymous}
                        onChange={(e) => setAllowAnonymous(e.target.checked)}
                    />
                    Allow anonymous players to join
                </label>
                <label className={styles.fieldLabel}>
                    Desired opponent Elo (optional)
                    <input
                        type="number"
                        value={desiredElo}
                        onChange={(e) => setDesiredElo(e.target.value)}
                        placeholder="e.g. 1000"
                        min="0"
                        max={MAX_ELO}
                    />
                </label>
                {/* Only shown if the API call fails */}
                {error && <p className={styles.error}>{error}</p>}
                <button type="submit" className={styles.submitButton}>Create Game</button>
            </form>
        </div>
    );
}