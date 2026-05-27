import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext.jsx";
import { 
    getGameComments, 
    getTournamentComments, 
    postGameComment, 
    postTournamentComment 
} from "@/services/commentService.js";

const WS_BASE_URL = import.meta.env.VITE_WS_URL;

export default function Comments({ gameId, tournamentId }) {
    const { user } = useAuth();
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
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
            // fetching game or tournament based on which id is passed in 
            const data = gameId 
                ? await getGameComments(gameId)
                : await getTournamentComments(tournamentId);
            setComments(data);
        }
        fetchComments();
    }, [gameId, tournamentId]);

    async function handleSubmit(e) {
        e.preventDefault();
        if (!newComment.trim()) return;
        // post to game or tournament based on which id was passed in 
        const created = gameId
            ? await postGameComment(gameId, newComment, user._id)
            : await postTournamentComment(tournamentId, newComment, user._id);
        setComments(prev => [...prev, created]);
        setNewComment("");
    }

    return (
        <div>
            <ul>
                {comments.map(comment => (
                    <li key={comment._id}>
                        <strong>{comment.author?.username}</strong>: {comment.body}
                    </li>
                ))}
            </ul>
            {user && (
                <form onSubmit={handleSubmit}>
                    <input
                        value={newComment}
                        onChange={e => setNewComment(e.target.value)}
                        placeholder="Write a comment"
                    />
                    <button type="submit">Post</button>
                </form>
            )}
        </div>
    );
}