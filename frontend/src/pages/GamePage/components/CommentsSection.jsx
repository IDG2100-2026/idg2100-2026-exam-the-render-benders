import { useState, useEffect } from "react";
import { Link } from "react-router";
import { useAuth } from "@/contexts/AuthContext";
import { apiFetch } from "@/api";
import { MAX_COMMENT_LENGTH } from "@/config/constants";
import styles from "./CommentsSection.module.css";

export default function CommentsSection({ gameId }) {
    const { user } = useAuth();
    const [comments, setComments] = useState([]);
    const [commentBody, setCommentBody] = useState("");
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchComments() {
            try {
                const data = await apiFetch(`/games/${gameId}/comments`);
                setComments(data);
            } catch (err) {
                setError(err.message);
            }
        }
        fetchComments();
    }, [gameId]);

    async function handleSubmit(e) {
        e.preventDefault();
        setError(null);
        try {
            const newComment = await apiFetch("/comments", {
                method: "POST",
                body: JSON.stringify({ body: commentBody, author: user._id, game: gameId })
            });
            setComments((prev) => [...prev, newComment]);
            setCommentBody("");
        } catch (err) {
            setError(err.message);
        }
    }

    async function handleDelete(commentId) {
        try {
            await apiFetch(`/comments/${commentId}`, { method: "DELETE" });
            setComments((prev) => prev.filter((c) => c._id !== commentId));
        } catch (err) {
            setError(err.message);
        }
    }

    return (
        <div className={styles.card}>
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
                                        onClick={() => handleDelete(comment._id)}
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
                <form onSubmit={handleSubmit} className={styles.commentForm}>
                    <textarea
                        value={commentBody}
                        onChange={(e) => setCommentBody(e.target.value)}
                        placeholder="Add a comment..."
                        maxLength={MAX_COMMENT_LENGTH}
                        required
                    />
                    {error && <p className={styles.error}>{error}</p>}
                    <button type="submit">Send</button>
                </form>
            ) : (
                <div className={styles.loginHint}>
                    <p>Please <Link to="/login">log in</Link> to comment.</p>
                </div>
            )}
        </div>
    );
}
