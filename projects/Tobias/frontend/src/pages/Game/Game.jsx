import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { getMatch, joinMatch } from "@/services/matchService";
import { useAuth } from "@/hooks/useAuth";
import { getUser, createGuestUser } from "@/services/userService";
import { getMatchComments, leaveMatchComment } from "@/services/commentService";
import styles from "./Game.module.css";

export default function GamePage(){
    const [match, setMatch] = useState(null);
    const [players, setPlayers] = useState([]);
    const [comments, setComments] = useState([]);
    const [commentText, setCommentText] = useState("");
    const [commentAuthor, setCommentAuthor] = useState({});

    // useParams gets the :id from /game/:id
    const { mid } = useParams();
    const { user, login } = useAuth();
    const [joiningAsGuest, setJoiningAsGuest] = useState(false);
    // the players joining a match were registered twice, so I 
    // had to use useRef to prevent that
    // Apparently, React runs effects twice in development with StrictMode
    const hasJoined = useRef(false);

    // fetching user data for all players when the match data is updated
    useEffect(() => {
        if (!match) return;
        Promise.all(match.players.map(uid => getUser(uid)))
            .then(data => setPlayers(data));
    }, [match]);

    // fetches comments for the match when the mid changes
    useEffect(() => {
        getMatchComments(mid).then(data => {
            setComments(data);
            // fetching unique author usernames
            const uniqueUids = [...new Set(data.map(c => c.uid))];
            // fetching user data for each unique uid
            Promise.all(uniqueUids.map(uid => getUser(uid)))
                .then(users => {
                    // building a map of uid -> username for fast looking up
                    const map = {};
                    users.forEach(u => map[u.uid] = u.username);
                    setCommentAuthor(map);
                })
        });
    }, [mid]);

    // fetches match data on load and polls every 15 seconds for updates
    useEffect(() => {
        function fetchMatch() {
            getMatch(mid).then(async data => {
                setMatch(data);
                // if a match is pending and the user is not already a player
                // and is not joined the match, then join automatically
                if (data.status === "pending" && user && !data.players.includes(user.uid) && !hasJoined.current) {
                    hasJoined.current = true;
                    await joinMatch(mid, { uid: user.uid });
                    // refershing match after joining so that polling sees the updated status
                    const updated = await getMatch(mid);
                    setMatch(updated);
                }
            });
        }
        fetchMatch();

        // setInterval runs fetchMatch every 15 seconds
        const interval = setInterval(fetchMatch, 15000);
        // stopping the interval when the user leaves the page (cleanup)
        return () => clearInterval(interval);
    }, [mid, user]);

    async function handleGuestJoin() {
        hasJoined.current = true;
        setJoiningAsGuest(true);
        const guest = await createGuestUser();
        login(guest);
        await joinMatch(mid, { uid: guest.uid });
        const updated = await getMatch(mid);
        setMatch(updated);
        setJoiningAsGuest(false);
    }

    // handling submitting a new comment (only for logged in users)
    async function handleComment(e) {
        e.preventDefault();
        // don't submit if the user is not logged in or the comment is empty
        if (!user || !commentText.trim()) return;
        await leaveMatchComment(mid, { uid: user.uid, text: commentText });
        // clearing the text field after submitting
        setCommentText("");

        // refreshing the comments after posting
        getMatchComments(mid).then(data => {
            setComments(data);
            // getting the unique uids from the new comments to avoid fetching the same user multiple times
            const uniqueUids = [...new Set(data.map(c => c.uid))];

            // fetching the user data for each unique uid and updating the author map
            Promise.all(uniqueUids.map(uid => getUser(uid)))
                .then(users => {
                    const map = {};
                    users.forEach(u => map[u.uid] = u.username);
                    setCommentAuthor(map);
                });
        });
    }

    return (
        <div className={styles.page}>
            {!match && <p>Loading...</p>}
            {match && (
                <div className={styles.board}>
                    <h1>Game</h1>
                    {/* Showing some match information */}
                    <p>Match id: #{match.mid}</p>
                    <p>Best of {match.rounds} | {match.timeControl} seconds |  
                        Straights: {match.includeStraights ? "Allowed" : "Not allowed"}
                    </p>
                    <p>Anonymous: {match.allowAnonymous ? "Allowed" : "Not allowed"}</p>

                    {/* If the match is "pending, then show this message instead */}
                    {match.status === "pending" && (
                        <div className={styles.waiting}>
                            <p>Waiting for another player...</p>
                        </div>
                    )}

                    {/* Allow anonymous users to join as guest if the game allows it */}
                    {match.status === "pending" && !user && match.allowAnonymous && (
                        <div className={styles.waiting}>
                            <p>This game allows anonymous players</p>
                            <button
                                className="button button-primary"
                                onClick={handleGuestJoin}
                                disabled={joiningAsGuest}
                            >
                                {joiningAsGuest ? "Joining..." : "Join as guest"}
                            </button>
                        </div>
                    )}

                    {/* Presenting the players with name and elo */}
                    <div className={styles.gameArea}>
                        <div className={styles.players}>
                            {players.map(p => (
                                <div key={p.uid} className={styles.player}>
                                    <p>{p.username}</p>
                                    <p>ELO: {p.eloRating}</p>
                                </div>
                            ))}
                        </div>
                        <div className={styles.diceArea}>
                            &#127922; &#127922; &#127922; &#127922; &#127922;
                        </div>
                    </div>

                    {/* Comments section */}
                    <div className={styles.comments}>
                        <h2>Comments</h2>
                        {comments.length === 0 && <p>No comments yet...</p>}
                        {comments.map(c => (
                            <div className={styles.comment} key={c.cid}>
                                <p className={styles.commentAuthor}>{commentAuthor[c.uid]}</p>
                                <p className={styles.commentDate}>{new Date(c.createdAt).toLocaleString()}</p>
                                <p className={styles.commentText}>{c.text}</p>
                            </div>
                        ))}
                        {user && (
                            <form onSubmit={handleComment} className={styles.commentForm}>
                                <textarea
                                    value={commentText}
                                    onChange={e => setCommentText(e.target.value)}
                                    placeholder="Leave a comment..." 
                                />
                                <button type="submit" className="button button-primary">
                                    Post
                                </button>
                            </form>
                        )}
                        {!user && <p>Log in to leave a comment</p>}
                    </div>
                </div>
            )}
        </div>
    );
}