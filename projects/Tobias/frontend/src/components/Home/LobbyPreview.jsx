import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getLobbyMatches } from "@/services/matchService";
import styles from "./LobbyPreview.module.css";
import { useAppearance } from "@/contexts/AppearanceContext";
import { getUser } from "@/services/userService";


export default function LobbyPreview(){
    const [matches, setMatches] = useState([]);
    const [players, setPlayers] = useState([]);
    const { lobbyCount } = useAppearance();

    useEffect(() => {
        getLobbyMatches(lobbyCount).then((data) => {
            setMatches(data);
            // collect all unique player uids from all matches
            const uids = [...new Set(data.flatMap(m => m.players))];
            // fetching each player and storing them by the uid
            Promise.all(uids.map(uid => getUser(uid))).then(users => {
                const playerMap = {};
                users.forEach(u => playerMap[u.uid] = u);
                setPlayers(playerMap);
            });
        });
    }, [lobbyCount]);

    // calculating the average ELO for the match
    function avgElo(match) {
        // filter(Boolean) removes undefined/null (the players not loaded yet)
        const elos = match.players.map(uid => players[uid]?.eloRating).filter(Boolean);
        if (elos.length === 0) return "?";
        // adding all the ELOs together and dividing by number of players
        return Math.round(elos.reduce((a, b) => a + b, 0) / elos.length);
    }

    return (
        <section className={styles.section}>
            <h2 className={styles.title}>&#9824;&#65039; Lobby &#9824;&#65039;</h2>
            {matches.length === 0 && <p>No open games right now</p>}
            {matches.map(match => (
                <Link to={`/game/${match.mid}`} key={match.mid}>
                    <div className={styles.card}>
                        <div className={styles.info}>
                            <span>&#127922;</span>
                            <span className={styles.divider}>|</span>
                            <span>Best of {match.rounds}</span>
                            <span className={styles.divider}>|</span>
                            <span>{match.timeControl}s per round</span>
                            <span className={styles.divider}>|</span>
                            <span>{match.includeStraights ? "Straights allowed" : "No straights"}</span>
                        </div>
                        <div className={styles.right}>
                            <span className={styles.players}>
                                {/* joining the players usernames with vs between */}
                                {match.players.map(uid => players[uid]?.username ?? "...").join(" vs ")}
                            </span>
                            <span className={styles.players}>ELO: {avgElo(match)}</span>
                            <span className={styles.players}>{match.players.length}/2 players</span> 
                        </div>
                    </div>
                </Link>
            ))}
            <Link to="/lobby">See all active games</Link>
        </section>
    );
}