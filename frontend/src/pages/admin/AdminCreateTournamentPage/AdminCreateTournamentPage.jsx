import { useState } from "react";
import { useNavigate } from "react-router";
import { apiFetch } from "@/api";
import styles from "./AdminCreateTournamentPage.module.css";

export default function AdminCreateTournamentPage() {
    const navigate = useNavigate();
    const [error, setError] = useState(null);
    const [form, setForm] = useState({
        name: "",
        description: "",
        tournamentType: "arena",
        startDate: "",
        maxParticipants: 8,
        variant: {
            rounds: 3,
            timeControl: 30,
            rules: "straights-allowed",
            numPlayers: 2,
            buyIn: 1,
        }
    });

    function setField(field, value) {
        setForm(prev => ({ ...prev, [field]: value }));
    }

    function setVariant(field, value) {
        setForm(prev => ({ ...prev, variant: { ...prev.variant, [field]: value } }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError(null);
        try {
            const payload = {
                ...form,
                startDate: form.startDate || undefined,
                maxParticipants: Number(form.maxParticipants),
                variant: {
                    ...form.variant,
                    rounds: Number(form.variant.rounds),
                    timeControl: Number(form.variant.timeControl),
                    numPlayers: Number(form.variant.numPlayers),
                    buyIn: Number(form.variant.buyIn),
                }
            };
            const tournament = await apiFetch("/tournaments", {
                method: "POST",
                body: JSON.stringify(payload)
            });
            navigate(`/tournaments/${tournament._id}`);
        } catch (err) {
            setError(err.message);
        }
    }

    return (
        <div className={styles.page}>
            <h1>Create Tournament</h1>
            <form className={styles.form} onSubmit={handleSubmit}>
                <label className={styles.label}>
                    Name *
                    <input value={form.name} onChange={e => setField("name", e.target.value)} required />
                </label>

                <label className={styles.label}>
                    Description
                    <textarea value={form.description} onChange={e => setField("description", e.target.value)} rows={3} />
                </label>

                <label className={styles.label}>
                    Tournament Type
                    <select value={form.tournamentType} onChange={e => setField("tournamentType", e.target.value)}>
                        <option value="arena">Arena</option>
                        <option value="knockout">Knockout</option>
                    </select>
                </label>

                <label className={styles.label}>
                    Start Date
                    <input type="datetime-local" value={form.startDate} onChange={e => setField("startDate", e.target.value)} />
                </label>

                <label className={styles.label}>
                    Max Participants
                    <input type="number" min={2} value={form.maxParticipants} onChange={e => setField("maxParticipants", e.target.value)} />
                </label>

                <fieldset className={styles.fieldset}>
                    <legend>Game Variant</legend>

                    <label className={styles.label}>
                        Rounds
                        <select value={form.variant.rounds} onChange={e => setVariant("rounds", e.target.value)}>
                            <option value={3}>3</option>
                            <option value={5}>5</option>
                            <option value={7}>7</option>
                        </select>
                    </label>

                    <label className={styles.label}>
                        Time Control (seconds)
                        <select value={form.variant.timeControl} onChange={e => setVariant("timeControl", e.target.value)}>
                            <option value={10}>10s</option>
                            <option value={30}>30s</option>
                            <option value={90}>90s</option>
                        </select>
                    </label>

                    <label className={styles.label}>
                        Rules
                        <select value={form.variant.rules} onChange={e => setVariant("rules", e.target.value)}>
                            <option value="straights-allowed">Straights allowed</option>
                            <option value="no-straights">No straights</option>
                        </select>
                    </label>

                    <label className={styles.label}>
                        Number of Players
                        <select value={form.variant.numPlayers} onChange={e => setVariant("numPlayers", e.target.value)}>
                            <option value={2}>2</option>
                            <option value={3}>3</option>
                            <option value={5}>5</option>
                        </select>
                    </label>

                    <label className={styles.label}>
                        Buy-in (points)
                        <select value={form.variant.buyIn} onChange={e => setVariant("buyIn", e.target.value)}>
                            <option value={1}>1</option>
                            <option value={10}>10</option>
                            <option value={50}>50</option>
                        </select>
                    </label>
                </fieldset>

                {error && <p className={styles.error}>{error}</p>}

                <button type="submit" className={styles.submit}>Create Tournament</button>
            </form>
        </div>
    );
}
