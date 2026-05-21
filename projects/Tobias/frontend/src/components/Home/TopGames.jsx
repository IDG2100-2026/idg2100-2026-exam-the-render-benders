import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getTopMatches, getRecentFinishedMatches } from "@/services/matchService";
import { getUser } from "@/services/userService";
import styles from "./TopGames.module.css";

export default function TopGames(){
    const [matches, setMatches] = useState([]);
    const [users, setUsers] = useState({});

    useEffect(() => {
        async function fetchMatches() {
            const ongoing = await getTopMatches(5);
            let combined = ongoing;

            // if there are less than 5 ongoing, fill out the rest with recently finished matches
            if (ongoing.length < 5){
                const finished = await getRecentFinishedMatches(5 - ongoing.length);
                combined = [...ongoing, ...finished];
            }

            // fetching all unique player UIDs
            const uids = [...new Set(combined.flatMap(match => match.players))];
            const userList = await Promise.all(uids.map(uid => getUser(uid)));
            const userMap = {};
            userList.forEach(user => userMap[user.uid] = user);

            // sorting by average ELO
            combined.sort((a, b) => {
                const avgA = a.players.reduce((sum, uid) => sum + (userMap[uid]?.eloRating ?? 1000), 0) / a.players.length;
                const avgB = b.players.reduce((sum, uid) => sum + (userMap[uid]?.eloRating ?? 1000), 0) / b.players.length;
                return avgB - avgA;
            });

            setMatches(combined);
            setUsers(userMap);
        }
        fetchMatches();
    }, []);
    
    return (
        <section className={styles.section}>
            <h2 className={styles.title}>&#11088; Top Games &#11088;</h2>
            {matches.length === 0 && <p>No games right now</p>}
            {matches.map(match => {
                const avgElo = Math.round(
                    match.players.reduce((sum, uid) => sum + (users[uid]?.eloRating ?? 1000), 0) / match.players.length
                );
                return (
                    <Link to={`/game/${match.mid}`} key={match.mid}>
                        <div className={styles.card}>
                            <div className={styles.info}>
                                <span>&#127922; </span>
                                <span className={styles.divider}>|</span>
                                <span>Best of {match.rounds}</span>
                                <span className={styles.divider}>|</span>
                                <span>{match.timeControl}s per round</span>
                                <span className={styles.divider}>|</span>
                                <span>{match.includeStraights ? "Straights allowed" : "No straights"}</span>
                            </div>
                            <div className={styles.right}>
                                <span>{match.players.map(uid => users[uid]?.username ?? "?").join(" vs ")}</span>
                                <span className={styles.elo}>Avg Elo: {avgElo}</span>
                            </div>
                        </div>
                    </Link>
                )
            })}
        </section>
    );
}