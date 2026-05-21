import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import { MdLayers, MdAccessTime, MdArrowForward, MdHistory, MdArrowBack } from "react-icons/md";
import { apiFetch } from "../../api";
import styles from "./UserGamesPage.module.css";

export default function UserGamesPage() {
    const { username } = useParams();
    const [games, setGames] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchUserGames() {
            try {
                // Fetch games where this user is a player
                const allGames = await apiFetch(`/games?limit=100`);
                // Client-side filtering for simplicity
                const userGames = allGames.filter(game => 
                    game.players.some(p => p.username === username)
                );
                setGames(userGames);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        fetchUserGames();
    }, [username]);

    if (loading) return <div className={styles.page}><p>Loading game history...</p></div>;
    if (error) return <div className={styles.page}><p className={styles.error}>{error}</p></div>;

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <div className={styles.headerTitle}>
                    <MdHistory className={styles.titleIcon} />
                    <h1>History for <span className={styles.username}>{username}</span></h1>
                </div>
                <Link to={`/users/${username}`} className={styles.backLink}>
                    <MdArrowBack /> Back to Profile
                </Link>
            </header>

            {games.length === 0 ? (
                <div className={styles.empty}>
                    <p>No games found in the history for this user.</p>
                    <Link to="/lobby" className={styles.lobbyLink}>Find a game to play!</Link>
                </div>
            ) : (
                <div className={styles.list}>
                    {games.map((game) => {
                        const opponents = game.players
                            .filter(p => p.username !== username)
                            .map(p => p.username);

                        return (
                            <Link to={`/games/${game._id}`} key={game._id} className={styles.gameListItem}>
                                <span className={`${styles.statusBadge} ${styles[game.status]}`}>
                                    {game.status}
                                </span>
                                
                                <div className={styles.gameDetails}>
                                    <span className={styles.gameOpponent}>
                                        vs {opponents.length > 0 ? opponents.join(", ") : "Waiting..."}
                                    </span>
                                    <div className={styles.gameMeta}>
                                        <span><MdLayers /> {game.variant.rounds}r</span>
                                        <span><MdAccessTime /> {game.variant.timeControl}s</span>
                                        <span className={styles.rulesText}>
                                            {game.variant.rules === "straights-allowed" ? "Straights" : "No straights"}
                                        </span>
                                    </div>
                                    {game.status === "finished" && game.result?.winner && (
                                        <span className={styles.resultText}>
                                            Winner: <strong>{game.result.winner.username || "Anonymous"}</strong>
                                        </span>
                                    )}
                                </div>

                                <div className={styles.rightInfo}>
                                    <span className={styles.dateText}>
                                        {new Date(game.createdAt).toLocaleDateString()}
                                    </span>
                                    <MdArrowForward className={styles.arrowIcon} />
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
