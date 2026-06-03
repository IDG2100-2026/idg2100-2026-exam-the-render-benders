import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { MdLayers, MdAccessTime, MdEmojiEvents } from "react-icons/md";
import { apiFetch, getAssetUrl } from "@/api";
import { DEFAULT_ELO } from "@/config/constants";
import styles from "./TopGames.module.css";

export default function TopGames() {
    const navigate = useNavigate();
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchGames() {
            try {
                const data = await apiFetch("/games/top");
                setGames(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        fetchGames();
    }, []);

    return (
        <div className={styles.container}>
            <h2>Top Games</h2>
            {error && <p className={styles.error}>{error}</p>}
            {loading && <p>Loading...</p>}
            {!loading && games.length === 0 && !error && <p>No games to display.</p>}
            <ol className={styles.list}>
                {games.map((game, index) => {
                    const avgElo = Math.round(
                        game.players.reduce((sum, p) => sum + (p.elo || DEFAULT_ELO), 0) / (game.players.length || 1)
                    );

                    return (
                        <li key={game._id} className={styles.item} onClick={() => navigate(`/games/${game._id}`)}>
                            <span className={`${styles.rank} ${index === 0 ? styles.first : ""}`}>
                                #{index + 1}
                            </span>

                            <span className={`${styles.statusBadge} ${styles[game.status]}`}>
                                {game.status === "ongoing" ? "Live" : "Finished"}
                            </span>

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

                            <span className={styles.elo}>
                                <MdEmojiEvents /> {avgElo}
                            </span>

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
