import { useState, useEffect, useRef } from "react";
import { Link } from "react-router";
import { useAuth } from "@/contexts/AuthContext.jsx";
import { apiFetch } from "@/api";
import { MAX_COMMENT_LENGTH } from "@/config/constants";
import {
    getGameComments,
    getTournamentComments,
    postGameComment,
    postTournamentComment
} from "@/services/commentService.js";
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

    // connecting to WebSocket and joining the correct room
    useEffect(() => {
        // connecting to the comment WebSocket server
        const ws = new WebSocket(`${WS_BASE_URL}/ws/comments`);
        webSocketRef.current = ws;

        ws.onopen = () => {
            // join the coorect room based on game or tournament 
            if (gameId) {
                ws.send(JSON.stringify({ type: "join-comment-room", game: gameId }));
            } else if (tournamentId) {
                ws.send(JSON.stringify({ type: "join-comment-room", tournament: tournamentId })); 
            }
        };

        ws.onmessage = (event) => {
            const message = JSON.parse(event.data);

            if (message.type === "comment-created") {
                // appending the new comment to the list without reload
                setComments(prev => [...prev, message.comment]);
            }

            if (message.type === "comment-deleted") {
                // removing deleted comment from the list without reload 
                setComments(prev => prev.filter(cmnt => cmnt._id !== message.commentId));
            }
        };

        // disconnect when component unmounts
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
            // don't add locally - WebSocket broadcasts comment-created back to all clients including sender
            setNewComment("");
        } catch (err) {
            // server rejects banned users with an error here
            setSubmitError(err.message);
        }
    }

    async function handleDelete(commentId) {
        setSubmitError(null);
        try {
            await apiFetch(`/comments/${commentId}`, { method: "DELETE" });
            // WebSocket comment-deleted event removes it from all open lists live
        } catch (err) {
            setSubmitError(err.message);
        }
    }

    return (
        <div className={styles.container}>
            <ul className={styles.commentList}>
                {loading && <li className={styles.empty}>Loading...</li>}
                {fetchError && <li className={styles.error}>{fetchError}</li>}
                {!loading && !fetchError && comments.length === 0 && (
                    <li className={styles.empty}>No comments yet.</li>
                )}
                {comments.map(comment => (
                    <li key={comment._id} className={styles.comment}>
                        <div className={styles.commentHeader}>
                            <strong>{comment.author?.username ?? "User"}</strong>
                            <div className={styles.commentMeta}>
                                <small>
                                    {new Date(comment.createdAt).toLocaleString([], {
                                        dateStyle: "short",
                                        timeStyle: "short"
                                    })}
                                </small>
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
                <form onSubmit={handleSubmit} className={styles.form}>
                    <textarea
                        value={newComment}
                        onChange={e => { setNewComment(e.target.value); setSubmitError(null); }}
                        placeholder="Write a comment"
                        maxLength={MAX_COMMENT_LENGTH}
                        required
                    />
                    {submitError && <p className={styles.error}>{submitError}</p>}
                    <button type="submit">Post</button>
                </form>
            ) : (
                <div className={styles.loginHint}>
                    <p>Please <Link to="/login">log in</Link> to comment.</p>
                </div>
            )}
        </div>
    );
}