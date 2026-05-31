import { useState, useEffect } from "react";
import { useParams } from "react-router";
import { getTournament } from "@/services/tournamentService";
import styles from "./TournamentPage.module.css";

export default function TournamentPage() {
    const { id } = useParams();
    const [tournament, setTournament] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchTournament() {
            setLoading(true);
            try {
                const data = await getTournament(id);
                setTournament(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        fetchTournament();
    }, [id]);

    if (loading) return <p className={styles.msg}>Loading tournament...</p>;
    if (error) return <p className={styles.error}>{error}</p>;
    if (!tournament) return null;

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <h1>{tournament.name}</h1>
                <span className={styles.status}>{tournament.status}</span>
            </div>

            {tournament.description && (
                <p className={styles.description}>{tournament.description}</p>
            )}

            <div className={styles.meta}>
                <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Type</span>
                    <span>{tournament.tournamentType}</span>
                </div>
                <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Format</span>
                    <span>{tournament.format}</span>
                </div>
                {tournament.startDate && (
                    <div className={styles.metaItem}>
                        <span className={styles.metaLabel}>Start date</span>
                        <span>{new Date(tournament.startDate).toLocaleDateString()}</span>
                    </div>
                )}
                <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Players</span>
                    <span>{tournament.players?.length ?? 0} / {tournament.maxParticipants}</span>
                </div>
                {tournament.variant && (
                    <>
                        <div className={styles.metaItem}>
                            <span className={styles.metaLabel}>Rounds</span>
                            <span>{tournament.variant.rounds}</span>
                        </div>
                        <div className={styles.metaItem}>
                            <span className={styles.metaLabel}>Time control</span>
                            <span>{tournament.variant.timeControl}s</span>
                        </div>
                        <div className={styles.metaItem}>
                            <span className={styles.metaLabel}>Rules</span>
                            <span>{tournament.variant.rules}</span>
                        </div>
                    </>
                )}
            </div>

            {tournament.winner && (
                <div className={styles.winner}>
                    Winner: <strong>{tournament.winner.username ?? "Unknown"}</strong>
                </div>
            )}

            <section className={styles.section}>
                <h2>Players</h2>
                {tournament.players?.length === 0 ? (
                    <p className={styles.msg}>No players have joined yet.</p>
                ) : (
                    <ul className={styles.playerList}>
                        {tournament.players.map(p => (
                            <li key={p._id ?? p}>{p.username ?? p}</li>
                        ))}
                    </ul>
                )}
            </section>
        </div>
    );
}
