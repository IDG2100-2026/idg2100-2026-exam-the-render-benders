import { useState, useEffect } from "react";
import { Link } from "react-router";
import { getUpcomingTournaments } from "@/services/tournamentService";
import styles from "./TournamentPreview.module.css";

export default function TournamentPreview() {
    const [tournaments, setTournaments] = useState([]);

    useEffect(() => {
        getUpcomingTournaments(5)
            .then(data => setTournaments(data))
            .catch(() => {});
    }, []);

    if (tournaments.length === 0) return null;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2>Upcoming Tournaments</h2>
                <Link to="/tournaments" className={styles.viewAll}>View All</Link>
            </div>
            <div className={styles.list}>
                {tournaments.map(t => (
                    <Link
                        key={t._id}
                        to={`/tournaments/${t._id}`}
                        className={styles.item}
                    >
                        <span className={styles.name}>{t.name}</span>
                        <span className={styles.meta}>
                            {t.players?.length ?? 0} / {t.maxParticipants} players 
                        </span>
                        {t.startDate && (
                            <span className={styles.date}>
                                {new Date(t.startDate).toLocaleDateString()}
                            </span>
                        )}
                    </Link>
                ))}
            </div>
        </div>
    );
}

