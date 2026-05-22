import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { useAuth } from "@/contexts/AuthContext";
import { apiFetch } from "@/api";
import RoundsSelector from "./components/RoundsSelector/RoundsSelector";
import RulesSelector from "./components/RulesSelector/RulesSelector";
import TimeControlSelector from "./components/TimeControlSelector/TimeControlSelector";
import styles from "./CreateGamePage.module.css";

export default function CreateGamePage() {
    const { user } = useAuth(); // get the logged in user from context
    const navigate = useNavigate();

    // Form state - one value per field, matches what the backend expects
    const [rounds, setRounds] = useState(3);
    const [rules, setRules] = useState("straights-allowed");
    const [timeControl, setTimeControl] = useState(10);
    const [allowAnonymous, setAllowAnonymous] = useState(false);
    const [desiredElo, setDesiredElo] = useState("");

    const [error, setError] = useState(null); // error message shown if the API call fails

    if (!user) {
        return (
            <div className={styles.page}>
                <p>You must be <Link to="/login">logged in</Link> to create a game.</p>
            </div>
        );
    }

    async function handleSubmit(e) {
        e.preventDefault(); // stops the browser from reloading the page on form submit
        try {
            const newGame = await apiFetch("/games", {
                method: "POST",
                body: JSON.stringify({
                    players: [user._id], // the creator is automatically added as a player
                    variant: { rounds, rules, timeControl },
                    allowAnonymous,
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

                {/* Allow anonymous - only show to logged in users */}
                {user && (
                    <label className={styles.checkboxLabel}>
                        <input
                            type="checkbox"
                            checked={allowAnonymous}
                            onChange={(e) => setAllowAnonymous(e.target.checked)}
                        />
                        Allow anonymous players to join
                    </label>
                )}
                <label className={styles.fieldLabel}>
                    Desired opponent Elo (optional)
                    <input
                        type="number"
                        value={desiredElo}
                        onChange={(e) => setDesiredElo(e.target.value)}
                        placeholder="e.g. 1000"
                        min="0"
                    />
                </label>
                {/* Only shown if the API call fails */}
                {error && <p className={styles.error}>{error}</p>}
                <button type="submit" className={styles.submitButton}>Create Game</button>
            </form>
        </div>
    );
}