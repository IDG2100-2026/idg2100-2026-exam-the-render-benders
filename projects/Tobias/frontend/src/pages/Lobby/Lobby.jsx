import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getFilteredLobbyMatches } from "@/services/matchService";
import styles from "./Lobby.module.css";
import { getUser } from "@/services/userService";
import { useAuth } from "@/hooks/useAuth";

// The lobby page shows open games that the users can join with filters and pagination
export default function Lobby() {
    const [matches, setMatches] = useState([]);
    const [filters, setFilters] = useState({});
    const [skip, setSkip] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [players, setPlayers] = useState({});
    // just a value I have set that gives the amound of games to be shown
    const LIMIT = 20;
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        getFilteredLobbyMatches(filters, skip, LIMIT, user?.uid).then(data => {
            if (skip === 0){
                // replacing the list if a new filter is applied
                setMatches(data);
            } else {
                // load more, append to the existing list
                setMatches(prev => [...prev, ...data]);
            }
            // if there are fewer than LIMIT returned, then there are no more to load 
            setHasMore(data.length === LIMIT);
        });
    }, [filters, skip, user]);

    useEffect(() => {
        const uids = [...new Set(matches.flatMap(m => m.players))];
        Promise.all(uids.map(uid => getUser(uid))).then(users => {
            const playerMap = {};
            users.forEach(u => playerMap[u.uid] = u);
            setPlayers(playerMap);
        });
    }, [matches]);

    // when a filter changes, reset to the first page
    function handleFilter(key, value){
        setFilters(prev => ({ ...prev, [key]: value }));
        setSkip(0);
    }

    function clearFilter(key) {
        setFilters(prev => {
            const updated = { ...prev };
            delete updated[key];
            return updated;
        });
        setSkip(0);
    }

    function avgElo(match) {
        const elos = match.players.map(uid => players[uid]?.eloRating).filter(Boolean);
        if (elos.length === 0) return "?";
        return Math.round(elos.reduce((a, b) => a + b, 0) / elos.length);
    }

    return (
        <div className={styles.page}>
            <h1>Lobby</h1>

            {/** Filter buttons */}
            <div className={styles.filters}>
                <div className={styles.filterGroup}>
                    <span>Rounds:</span>
                    <button 
                        className={`button ${!filters.rounds ? "button-primary" : "button-secondary"}`}
                        onClick={() => clearFilter("rounds")}
                        >All
                    </button>
                    {[3, 5, 7].map(rounds => (
                        <button 
                            key={rounds}
                            className={`button ${filters.rounds === rounds ? "button-primary" : "button-secondary"}`}
                            onClick={() => handleFilter("rounds", rounds)}
                            >Best of {rounds}
                        </button>
                    ))}
                </div>
                <div className={styles.filterGroup}>
                    <span>Time:</span>
                    <button
                        className={`button ${!filters.timeControl ? "button-primary" : "button-secondary"}`}
                        onClick={() => clearFilter("timeControl")}
                        >All
                    </button>
                    {[3, 10, 30].map(time => (
                        <button
                            key={time}
                            className={`button ${filters.timeControl === time ? "button-primary" : "button-secondary"}`}
                            onClick={() => handleFilter("timeControl", time)}
                            >{time} sec
                        </button>
                    ))}
                </div>
                <div className={styles.filterGroup}>
                    <span>Straights:</span>
                    <button
                        className={`button ${filters.includeStraights === undefined ? "button-primary" : "button-secondary"}`}
                        onClick={() => clearFilter("includeStraights")}
                        >All
                    </button>
                    <button
                        className={`button ${filters.includeStraights === true ? "button-primary" : "button-secondary"}`}
                        onClick={() => handleFilter("includeStraights", true)}
                        >Allowed
                    </button>
                    <button
                        className={`button ${filters.includeStraights === false ? "button-primary" : "button-secondary"}`}
                        onClick={() => handleFilter("includeStraights", false)}
                        >Not allowed
                    </button>
                </div>
            </div>

            {/** Match list as table */}
            {matches.length === 0 && <p>No open games right now</p>}
            {matches.length > 0 && (
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Rounds</th>
                            <th>Time</th>
                            <th>Straights</th>
                            <th>Player</th>
                            <th>Avg ELO</th>
                        </tr>
                    </thead>
                    <tbody>
                        {matches
                            .filter(match => !match.players.includes(user?.uid))
                            .map(match => (
                            <tr key={match.mid} onClick={() => navigate(`/game/${match.mid}`)} className={styles.row}>
                                <td>Best of {match.rounds}</td>
                                <td>{match.timeControl}s</td>
                                <td>{match.includeStraights ? "Allowed" : "Not allowed"}</td>
                                <td>{match.players.map(uid => players[uid]?.username ?? "...").join(" vs ")}</td>
                                <td>{avgElo(match)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {/** "Load more" button */}
            {hasMore && (
                <button 
                    className="button button-primary" 
                    onClick={() => setSkip(prev => prev + LIMIT)}
                    >Load more
                </button>
            )}
        </div>
    );
}
