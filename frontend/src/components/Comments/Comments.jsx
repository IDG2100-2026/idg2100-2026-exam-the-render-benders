import { useState, useEffect, useRef } from "react";
import { Link } from "react-router";
import { MdDelete } from "react-icons/md";
import { useAuth } from "@/contexts/AuthContext.jsx";
import {
    getGameComments,
    getTournamentComments,
    postGameComment,
    postTournamentComment,
    deleteComment
} from "@/services/commentService.js";
import { MAX_COMMENT_LENGTH } from "@/config/constants.js";
import styles from "./Comments.module.css";

const WS_BASE_URL = import.meta.env.VITE_WS_URL;

export default function Comments({ gameId, tournamentId }) {
    const { user } = useAuth();
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState(null);
    const [submitError, setSubmitError] = useState(null);
    const webSocketRef = useRef(null);
    const listRef = useRef(null);

    useEffect(() => {
        if (listRef.current) {
            listRef.current.scrollTop = listRef.current.scrollHeight;
        }
    }, [comments]);

    // connecting to WebSocket and joining the correct room
    useEffect(() => {
        const ws = new WebSocket(`${WS_BASE_URL}/ws/comments`);
        webSocketRef.current = ws;

        ws.onopen = () => {
            // join the correct room based on game or tournament
            if (gameId) {
                ws.send(JSON.stringify({ type: "join-comment-room", game: gameId }));
            } else if (tournamentId) {
                ws.send(JSON.stringify({ type: "join-comment-room", tournament: tournamentId }));
            }
        };

        ws.onmessage = (event) => {
            const message = JSON.parse(event.data);

            if (message.type === "game-comment:created" || message.type === "tournament-comment:created" || message.type === "comment:created") {
                setComments(prev => [...prev, message.comment]);
            }

            if (message.type === "comment:deleted") {
                setComments(prev => prev.filter(cmnt => cmnt._id !== message.commentId));
            }
        };

        return () => ws.close();
    }, [gameId, tournamentId]);

    // fetching initial comments from the REST API on mount
    useEffect(() => {
        async function fetchComments() {
            setLoading(true);
            setFetchError(null);
            try {
                // fetching game or tournament based on which id is passed in
                const data = gameId
                    ? await getGameComments(gameId)
                    : await getTournamentComments(tournamentId);
                setComments(data);
            } catch (err) {
                setFetchError(err.message);
            } finally {
                setLoading(false);
            }
        }
        fetchComments();
    }, [gameId, tournamentId]);

    async function handleSubmit(e) {
        e.preventDefault();
        if (!newComment.trim()) return;
        setSubmitError(null);
        try {
            // post to game or tournament based on which id was passed in
            gameId
                ? await postGameComment(gameId, newComment, user._id)
                : await postTournamentComment(tournamentId, newComment, user._id);
            // don't add locally — WebSocket broadcasts comment-created back to all clients including sender
            setNewComment("");
        } catch (err) {
            // server rejects banned users with an error here
            setSubmitError(err.message);
        }
    }

    async function handleDelete(commentId) {
        setSubmitError(null);
        try {
            await deleteComment(commentId);
            // don't remove locally — WebSocket broadcasts comment-deleted to all open lists
        } catch (err) {
            setSubmitError(err.message);
        }
    }

    const canDelete = (comment) =>
        user && (user._id === comment.author?._id || user.isAdmin);

    return (
        <div className={styles.container}>
            <ul className={styles.commentList} ref={listRef}>
                {loading && <li className={styles.empty}>Loading...</li>}
                {fetchError && <li className={styles.error}>{fetchError}</li>}
                {!loading && !fetchError && comments.length === 0 && (
                    <li className={styles.empty}>No comments yet.</li>
                )}
                {comments.map(comment => (
                    <li key={comment._id} className={styles.comment}>
                        <div className={styles.commentHeader}>
                            <strong>
                                <Link to={`/users/${comment.author?.username}`}>
                                    {comment.author?.username ?? "User"}
                                </Link>
                            </strong>
                            <div className={styles.commentMeta}>
                                <small>
                                    {new Date(comment.createdAt).toLocaleString([], {
                                        dateStyle: "short",
                                        timeStyle: "short"
                                    })}
                                </small>
                                {canDelete(comment) && (
                                    <button
                                        className={styles.deleteBtn}
                                        onClick={() => handleDelete(comment._id)}
                                        aria-label="Delete comment"
                                    >
                                        <MdDelete />
                                    </button>
                                )}
                            </div>
                        </div>
                        <p>{comment.body}</p>
                    </li>
                ))}
            </ul>
            {submitError && <p className={styles.error}>{submitError}</p>}
            {user ? (
                <form className={styles.form} onSubmit={handleSubmit}>
                    <textarea
                        value={newComment}
                        onChange={e => setNewComment(e.target.value)}
                        placeholder="Write a comment..."
                        maxLength={MAX_COMMENT_LENGTH}
                    />
                    <button type="submit">Post</button>
                </form>
            ) : (
                <div className={styles.loginHint}>
                    <p><Link to="/login">Log in</Link> to leave a comment.</p>
                </div>
            )}
        </div>
    );
}
