import { useState, useEffect } from "react";
import { Link, useParams } from "react-router";
import { MdLayers, MdAccessTime, MdEmojiEvents, MdPeople, MdHourglassEmpty } from "react-icons/md";
import { useAuth } from "@/contexts/AuthContext";
import { useAppearance } from "@/contexts/AppearanceContext";
import { apiFetch, getAssetUrl } from "@/api";
import styles from "./GamePage.module.css";

export default function GamePage() {
    const { id } = useParams();
    const { user } = useAuth();
    const { preferences } = useAppearance();
    const [game, setGame] = useState(null);
    const [comments, setComments] = useState([]);
    const [error, setError] = useState(null);
    const [commentBody, setCommentBody] = useState("");
    const [commentError, setCommentError] = useState(null);

    useEffect(() => {
        async function fetchGame() {
            try {
                const data = await apiFetch(`/games/${id}`);
                setGame(data);
            } catch (err) {
                setError(err.message);
            }
        }
        async function fetchComments() {
            try {
                const data = await apiFetch(`/games/${id}/comments`);
                setComments(data);
            } catch (err) {
                setError(err.message);
            }
        }

        fetchGame();
        fetchComments();

        // 15-second polling as required by Task.md
        const intervalId = setInterval(() => {
            fetchGame();
            fetchComments();
        }, 15000);

        return () => clearInterval(intervalId);
    }, [id]);

    async function handleCommentSubmit(e) {
        e.preventDefault();
        setCommentError(null);
        try {
            const newComment = await apiFetch("/comments", {
                method: "POST",
                body: JSON.stringify({ body: commentBody, author: user._id, game: id })
            });
            setComments((prev) => [...prev, newComment]);
            setCommentBody("");
        } catch (err) {
            setCommentError(err.message);
        }
    }

    async function handleDeleteComment(commentId) {
        try {
            await apiFetch(`/comments/${commentId}`, { method: "DELETE" });
            setComments((prev) => prev.filter((c) => c._id !== commentId));
        } catch (err) {
            setCommentError(err.message);
        }
    }

    if (error) return <div className={styles.pageLayout}><p className={styles.error}>{error}</p></div>;
    if (!game) return <div className={styles.pageLayout}><p>Loading...</p></div>;

    const host = game.players[0];
    const opponent = game.players[1];

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
                                {game.variant.rules === "straights-allowed" ? "Straights" : "No straights"}
                            </span>
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
                                <span className={styles.pElo}>{host?.elo || 1000} ELO</span>
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
                                        <span className={styles.pElo}>{opponent.elo || 1000} ELO</span>
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
                            {/* Area for actual game reserved as required by TASK.md */}
                            <div className={styles.placeholderState}>
                                <h2>Dice Area</h2>
                            </div>

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
                    <ul className={styles.commentList}>
                        {comments.length === 0 && <li className={styles.noComments}>No comments yet.</li>}
                        {comments.map((comment) => (
                            <li key={comment._id} className={styles.comment}>
                                <div className={styles.commentHeader}>
                                    <strong>{comment.author?.username ?? "User"}</strong>
                                    <div className={styles.commentMeta}>
                                        <small>{new Date(comment.createdAt).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}</small>
                                        {(user?._id === comment.author?._id || user?.isAdmin) && (
                                            <button
                                                className={styles.deleteBtn}
                                                onClick={() => handleDeleteComment(comment._id)}
                                                title="Delete comment"
                                            >
                                                &times;
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <p>{comment.body}</p>
                            </li>
                        ))}
                    </ul>
                    {user ? (
                        <form onSubmit={handleCommentSubmit} className={styles.commentForm}>
                            <textarea
                                value={commentBody}
                                onChange={(e) => setCommentBody(e.target.value)}
                                placeholder="Add a comment..."
                                maxLength={1000}
                                required
                            />
                            {commentError && <p className={styles.error}>{commentError}</p>}
                            <button type="submit">Send</button>
                        </form>
                    ) : (
                        <div className={styles.loginHint}>
                            <p>Please <Link to="/login">log in</Link> to comment.</p>
                        </div>
                    )}
                </div>
            </aside>
        </div>
    );
}
