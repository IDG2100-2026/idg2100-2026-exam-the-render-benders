import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createMatch } from "@/services/matchService";
import { useAuth } from "@/hooks/useAuth.js";
import styles from "./CreateGame.module.css";

export default function CreateGame(){
    const [rounds, setRounds] = useState(3);
    const [timeControl, setTimeControl] = useState(10);
    const [includeStraights, setIncludeStraights] = useState(false);
    const [allowAnonymous, setAllowAnonymous] = useState(false);
    const [error, setError] = useState(null);

    // i think desired ELO is a bit weird for a platform like this (because then good players
    // can just play against beginners), but it is in the task, so I decided to add it
    const [desiredElo, setDesiredElo] = useState("");

    const { user } = useAuth();
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        try {
            const matchData = {
                uid: user?.uid,
                rounds,
                timeControl,
                includeStraights,
                allowAnonymous,
                ...(desiredElo !== "" && {
                    eloMin: Number(desiredElo) - 100,
                    eloMax: Number(desiredElo) + 100
                }),
            };
            const createdMatch = await createMatch(matchData);
            navigate(`/game/${createdMatch.newMatchId}`);
        } catch (error) {
            setError(error.message);
        }
    }

    return (
        <div className={styles.page}>
            <h1>Create Game</h1>
            {error && <p className={styles.error}>{error}</p>}
            <form className={styles.form} onSubmit={handleSubmit}>

                {/* Rounds */}
                <div className={styles.group}>
                    <label>Rounds</label>
                    <div className={styles.options}>
                        {[3, 5, 7].map(r => (
                            <button
                                type="button"
                                key={r}
                                className={`button ${rounds === r ? "button-primary" : "button-secondary"}`}
                                onClick={() => setRounds(r)}>
                                Best of {r}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Time Control */}
                <div className={styles.group}>
                    <label>Time per Round</label>
                    <div className={styles.options}>
                        {[3, 10, 30].map(t => (
                            <button
                                type="button"
                                key={t}
                                className={`button ${timeControl === t ? "button-primary" : "button-secondary"}`}
                                onClick={() => setTimeControl(t)}>
                                {t} seconds
                            </button>
                        ))}
                    </div>
                </div>

                {/* Straights */}
                <div className={styles.group}>
                    <label>Straights</label>
                    <div className={styles.options}>
                        <button
                            type="button"
                            className={`button ${!includeStraights ? "button-primary" : "button-secondary"}`}
                            onClick={() => setIncludeStraights(false)}>
                            Not allowed
                        </button>
                        <button
                            type="button"
                            className={`button ${includeStraights ? "button-primary" : "button-secondary"}`}
                            onClick={() => setIncludeStraights(true)}>
                            Allowed
                        </button>
                    </div>
                </div>

                {user && (
                    <div className={styles.group}>
                        <label>Desired opponent ELO (optional)</label>
                        <input
                            type="number"
                            className={styles.input}
                            placeholder="e.g. 1000"
                            value={desiredElo}
                            onChange={e => setDesiredElo(e.target.value)}
                        />
                    </div>
                )}

                {/* Allow Anonymous (only for logged in users */}
                {user && (
                    <div className={styles.group}>
                        <label>Allow Anonymous players</label>
                        <input
                            type="checkbox"
                            checked={allowAnonymous}
                            onChange={e => setAllowAnonymous(e.target.checked)} 
                        />
                    </div>
                )}

                <button type="submit" className="button button-primary">
                    Create Game
                </button>
            </form>
        </div>
    );
}