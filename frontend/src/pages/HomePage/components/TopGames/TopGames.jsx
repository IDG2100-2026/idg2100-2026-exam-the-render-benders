import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { MdLayers, MdAccessTime, MdEmojiEvents } from "react-icons/md";
import { apiFetch, getAssetUrl } from "../../../../api";
import styles from "./TopGames.module.css";

export default function TopGames() {
    const navigate = useNavigate();
    const [games, setGames] = useState([]);
    const [error, setError] = useState(null);

    // Fetches top games when the component mounts
    useEffect(() => {
        async function fetchGames() {
            try {
                // Calls our backend endpoint that sorts by Elo and fills with recent games if needed
                const data = await apiFetch("/games/top");
                setGames(data);
            } catch (err) {
                setError(err.message);
            }
        }
        fetchGames();
    }, []);

    return (
        <div className={styles.container}>
            <h2>Top Games</h2>
            {error && <p className={styles.error}>{error}</p>}
            {games.length === 0 && !error && <p>No games to display.</p>}
            <ol className={styles.list}>
                {games.map((game, index) => {
                    // calculates average Elo of all players in the game
                    const avgElo = Math.round(
                        game.players.reduce((sum, p) => sum + (p.elo || 1000), 0) / (game.players.length || 1)
                    );

                    return (
                        <li key={game._id} className={styles.item} onClick={() => navigate(`/games/${game._id}`)}>
                            {/* Rank number */}
                            <span className={`${styles.rank} ${index === 0 ? styles.first : ""}`}>
                                #{index + 1}
                            </span>

                            {/* Status Badge */}
                            <span className={`${styles.statusBadge} ${styles[game.status]}`}>
                                {game.status === "ongoing" ? "Live" : "Finished"}
                            </span>

                            {/* Players with Avatars */}
                            <div className={styles.players}>
                                {game.players.map((p, i) => (
                                    <span key={p.username} className={styles.playerWrapper}>
                                        <img 
                                            src={getAssetUrl(p.profileImage)} 
                                            alt={p.username} 
                                            className={styles.pAvatar} 
                                        />
                                        <Link
                                            to={`/users/${p.username}`}
                                            onClick={(e) => e.stopPropagation()}
                                            className={styles.playerLink}
                                        >
                                            {p.username}
                                        </Link>
                                        {i < game.players.length - 1 && <span className={styles.vs}>vs</span>}
                                    </span>
                                ))}
                            </div>

                            {/* Avg Elo */}
                            <span className={styles.elo}>
                                <MdEmojiEvents /> {avgElo}
                            </span>

                            {/* Variant */}
                            <div className={styles.variant}>
                                <span><MdLayers /> {game.variant.rounds}r</span>
                                <span><MdAccessTime /> {game.variant.timeControl}s</span>
                            </div>
                        </li>
                    );
                })}
            </ol>
        </div>
    );
}
