import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getUser, getUserMatches } from "@/services/userService";
import styles from "./UserGames.module.css";

export default function UserGames() {
    const [matches, setMatches] = useState([]);
    const [profileUser, setProfileUser] = useState(null);
    const { uid } = useParams();

    // fetching user info and all matches for the user
    useEffect(() => {
        if (!uid) return;
        getUser(uid).then(data => setProfileUser(data));
        getUserMatches(uid).then(data => setMatches(data));
    }, [uid]);

    return (
        <div className={styles.page}>
            <Link to={`/profile/${uid}`} className={styles.back}>&lt;- Back to profile</Link>
            <h1>{profileUser?.username}'s games</h1>
            <div className={styles.matches}>
                {matches.length === 0 && <p>No games yet</p>}
                {matches.map(m => (
                    <div key={m.mid} className={styles.match}>
                        <p>Best of {m.rounds} | {m.timeControl} seconds</p>
                        <p>{m.status}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

