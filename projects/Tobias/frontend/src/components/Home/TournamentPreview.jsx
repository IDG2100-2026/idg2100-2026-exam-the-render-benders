import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getUpcomingTournaments } from "@/services/tournamentService";
import styles from "./TournamentPreview.module.css";

export default function TournamentPreview() {
    const [tournaments, setTournaments] = useState([]);

    useEffect(() => {
        getUpcomingTournaments(5).then(data => setTournaments(data));
    }, []);

    return (
        <section className={styles.section}>
            <h2 className={styles.title}>&#127942; Upcoming Tournaments &#127942;</h2>
            {tournaments.length === 0 && <p>No upcoming tournaments</p>}
            {tournaments.map(tournament => (
                <Link to={`/tournaments/${tournament.tid}`} key={tournament.tid}>
                    <div className={styles.card}>
                        <div className={styles.info}>
                            <span>&#127942; {tournament.title}</span>
                        </div>
                        <div className={styles.right}>
                            <span>{new Date(tournament.startDateTime).toLocaleDateString()}</span>
                            <span className={styles.players}>{tournament.players.length} signed up</span>
                        </div>
                    </div>
                </Link>
            ))}
            <Link to="/tournaments" className={styles.link}>See all tournaments</Link>
        </section>
    );
}
