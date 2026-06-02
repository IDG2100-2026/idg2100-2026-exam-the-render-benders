import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import { MdLayers, MdAccessTime, MdEmojiEvents, MdHourglassEmpty, MdExitToApp } from "react-icons/md";
import { useAuth } from "@/contexts/AuthContext";
import { useAppearance } from "@/contexts/AppearanceContext";
import { apiFetch } from "@/api";
import { RULES_STRAIGHTS } from "@/config/constants";
import Comments from "@/components/Comments/Comments";
import GameBoard from "@/components/Game/GameBoard";
import PlayersSection from "@/components/PlayersSection/PlayersSection";
import styles from "./GamePage.module.css";

export default function GamePage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, refreshUser } = useAuth();
    const { preferences } = useAppearance();
    const [game, setGame] = useState(null);
    const [error, setError] = useState(null);
    const [confirmLeave, setConfirmLeave] = useState(false);
    const gameRef = useRef(null);

    useEffect(() => {
        async function fetchGame() {
            try {
                const data = await apiFetch(`/games/${id}`);
                setGame(data);
                gameRef.current = data;
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

    // auto-leave waiting game when navigating away without using the Leave button
    useEffect(() => {
        return () => {
            const g = gameRef.current;
            if (g?.status === "waiting" && user?._id) {
                apiFetch(`/games/${g._id}/players/${user._id}`, { method: "DELETE" }).catch(() => {});
            }
        };
    }, [user?._id]);

    function handleLeaveGame() {
        setConfirmLeave(true);
    }

    async function handleConfirmLeave() {
        setConfirmLeave(false);
        try {
            await apiFetch(`/games/${id}/players/${user._id}`, { method: "DELETE" });
            navigate("/lobby");
        } catch (err) {
            setError(err.message);
        }
    }

    if (error) return <div className={styles.pageLayout}><p className={styles.error}>{error}</p></div>;
    if (!game) return <div className={styles.pageLayout}><p>Loading...</p></div>;

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

                    <PlayersSection game={game} boardColor={preferences.boardColor} />

                    <div className={styles.boardWrapper}>
                        <div className={styles.board} style={{ backgroundColor: preferences.boardColor }}>
                            {/* Game board - Web Components wired in GameBoard.jsx */}
                            <GameBoard 
                                isPlayer={isPlayer} 
                                gameId={id} 
                                onStateUpdate={(state) => {
                                    setGame(prev => prev ? { ...prev, status: state.status, result: state.result } : prev);
                                    if (state.status === "finished") refreshUser();
                                }}
                                onGameDeleted={() => navigate("/lobby")} 
                            />

                            {game.status === "waiting" && (
                                <div className={styles.overlay}>
                                    <MdHourglassEmpty className={styles.pulse} />
                                    <h2>Waiting for players</h2>
                                    <p>The game will start once someone joins.</p>
                                </div>
                            )}

                            {game.status === "finished" && (
                                <div className={styles.overlay}>
                                    <MdEmojiEvents />
                                    <h2>{game.result?.winner ? `Winner: ${game.result.winner.username}` : "Game over"}</h2>
                                    <p>The game has finished.</p>
                                </div>
                            )}

                            {confirmLeave && (
                                <div className={styles.overlay}>
                                    <h2>{game.status === "ongoing" ? "Forfeit game?" : "Leave game?"}</h2>
                                    <p>{game.status === "ongoing" ? "Leaving will forfeit the match to your opponent." : "Are you sure you want to leave?"}</p>
                                    <div className={styles.confirmActions}>
                                        <button className={styles.confirmBtn} onClick={handleConfirmLeave}>Confirm</button>
                                        <button className={styles.cancelBtn} onClick={() => setConfirmLeave(false)}>Cancel</button>
                                    </div>
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
