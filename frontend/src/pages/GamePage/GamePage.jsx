import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router";
import { MdLayers, MdAccessTime, MdEmojiEvents, MdPeople, MdHourglassEmpty, MdExitToApp } from "react-icons/md";
import { useAuth } from "@/contexts/AuthContext";
import { useAppearance } from "@/contexts/AppearanceContext";
import { apiFetch, getAssetUrl } from "@/api";
import { DEFAULT_ELO, RULES_STRAIGHTS } from "@/config/constants";
import Comments from "@/components/Comments/Comments.jsx";
import GameBoard from "@/components/Game/GameBoard";
import styles from "./GamePage.module.css";

export default function GamePage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { preferences } = useAppearance();
    const [game, setGame] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchGame() {
            try {
                const data = await apiFetch(`/games/${id}`);
                setGame(data);
            } catch (err) {
                setError(err.message);
            }
        }

        fetchGame();

        // 15-second polling as required by Task.md
        const intervalId = setInterval(() => {
            fetchGame();
        }, 15000);

        return () => clearInterval(intervalId);
    }, [id]);

    async function handleLeaveGame() {
        const confirmMsg = game.status === "ongoing"
            ? "Leaving an ongoing game will forfeit the match to your opponent. Continue?"
            : "Are you sure you want to leave this game?";
        if (!window.confirm(confirmMsg)) return;
        try {
            await apiFetch(`/games/${id}/players/${user._id}`, { method: "DELETE" });
            navigate("/lobby");
        } catch (err) {
            setError(err.message);
        }
    }

    if (error) return <div className={styles.pageLayout}><p className={styles.error}>{error}</p></div>;
    if (!game) return <div className={styles.pageLayout}><p>Loading...</p></div>;

    const host = game.players[0];
    const opponent = game.players[1];
    const isPlayer = user && game.players.some(p => p._id === user._id);
    const canLeave = isPlayer && game.status !== "finished";

    return (
        <div className={styles.pageLayout}>
            <div className={styles.mainContent}>
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <div className={styles.titleRow}>
                            <h1>Game #{id.slice(-4)}</h1>
                            <span className={`${styles.badge} ${styles[game.status]}`}>{game.status}</span>
                        </div>
                        <div className={styles.variantBadges}>
                            <span className={styles.variantBadge}>
                                <MdLayers /> {game.variant.rounds}r
                            </span>
                            <span className={styles.variantBadge}>
                                <MdAccessTime /> {game.variant.timeControl}s
                            </span>
                            <span className={styles.variantBadge}>
                                {game.variant.rules === RULES_STRAIGHTS ? "Straights" : "No straights"}
                            </span>
                            {canLeave && (
                                <button className={styles.leaveBtn} onClick={handleLeaveGame}>
                                    <MdExitToApp /> {game.status === "ongoing" ? "Forfeit" : "Leave"}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Participants Section - Required by TASK.md */}
                    <div className={styles.playersSection}>
                        <div className={styles.playerItem}>
                            <img
                                src={getAssetUrl(host?.profileImage)}
                                alt=""
                                className={styles.pAvatar}
                            />
                            <div className={styles.pInfo}>
                                <span className={styles.pLabel}>Host</span>
                                <Link to={`/users/${host?.username}`} className={styles.pName}>
                                    {host?.username} {user?.username === host?.username && "(You)"}
                                </Link>
                                <span className={styles.pElo}>{host?.elo || DEFAULT_ELO} ELO</span>
                            </div>
                        </div>

                        <div className={styles.vsDivider}>VS</div>

                        <div className={styles.playerItem}>
                            {opponent ? (
                                <>
                                    <img
                                        src={getAssetUrl(opponent.profileImage)}
                                        alt=""
                                        className={styles.pAvatar}
                                    />
                                    <div className={styles.pInfo}>
                                        <span className={styles.pLabel}>Opponent</span>
                                        <Link to={`/users/${opponent.username}`} className={styles.pName}>
                                            {opponent.username}
                                        </Link>
                                        <span className={styles.pElo}>{opponent.elo || DEFAULT_ELO} ELO</span>
                                    </div>
                                </>
                            ) : (
                                <div className={styles.waitingSlot}>
                                    <MdPeople className={styles.waitingIcon} />
                                    <span>Waiting...</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className={styles.boardWrapper}>
                        <div className={styles.board} style={{ backgroundColor: preferences.boardColor }}>
                            {/* Game board, Web Components wired in GameBoard.jsx */}
                            <GameBoard isPlayer={isPlayer} />

                            {/* Overlays for Game Status */}
                            {game.status === "waiting" && (
                                <div className={styles.overlay}>
                                    <MdHourglassEmpty className={styles.pulse} />
                                    <h2>Waiting for players</h2>
                                    <p>The game will start once someone joins.</p>
                                </div>
                            )}

                            {game.status === "finished" && game.result?.winner && (
                                <div className={styles.overlay}>
                                    <MdEmojiEvents />
                                    <h2>Winner: {game.result.winner.username}</h2>
                                    <p>The game has finished.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <aside className={styles.sidebar}>
                <div className={styles.commentCard}>
                    <h2>Comments</h2>
                    <Comments gameId={id}/>
                </div>
            </aside>
        </div>
    );
}
