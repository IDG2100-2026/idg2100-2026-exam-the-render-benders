import { useState, useEffect } from "react";
import { Link } from "react-router";
import { apiFetch } from "@/api";
import { MdDelete } from "react-icons/md";
import styles from "./AdminCommentsPage.module.css";

export default function AdminCommentsPage() {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        apiFetch("/comments")
            .then(data => setComments(data))
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    async function handleDelete(id) {
        try {
            await apiFetch(`/comments/${id}`, { method: "DELETE" });
            setComments(prev => prev.filter(c => c._id !== id));
        } catch (err) {
            setError(err.message);
        }
    }

    if (loading) return <p>Loading comments...</p>;
    if (error) return <p className={styles.error}>{error}</p>;

    return (
        <div className={styles.page}>
            <h1>Comment Administration</h1>
            {comments.length === 0 ? (
                <p className={styles.empty}>No comments found.</p>
            ) : (
                <ul className={styles.list}>
                    {comments.map(comment => (
                        <li key={comment._id} className={styles.item}>
                            <div className={styles.meta}>
                                <Link to={`/users/${comment.author?.username}`} className={styles.author}>
                                    {comment.author?.username ?? "Unknown"}
                                </Link>
                                <span className={styles.date}>
                                    {new Date(comment.createdAt).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}
                                </span>
                                {comment.game && (
                                    <Link to={`/games/${comment.game}`} className={styles.context}>Game</Link>
                                )}
                                {comment.tournament && (
                                    <Link to={`/tournaments/${comment.tournament}`} className={styles.context}>Tournament</Link>
                                )}
                            </div>
                            <p className={styles.body}>{comment.body}</p>
                            <button className={styles.deleteBtn} onClick={() => handleDelete(comment._id)}>
                                <MdDelete /> Delete
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}