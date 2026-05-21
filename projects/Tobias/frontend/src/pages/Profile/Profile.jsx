import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getUser, getUserMatches, updateUser, updateProfilePicture, getUserStats } from "@/services/userService";
import { useAuth } from "@/hooks/useAuth";
import { API_URL } from "@/api.js";
import styles from "./Profile.module.css";

const BASE_URL = API_URL.replace("/api/v1", "");

export default function Profile() {
    const [profileUser, setProfileUser] = useState(null);
    const [matches, setMatches] = useState([]);
    const [editing, setEditing] = useState(false);
    const [editEmail, setEditEmail] = useState("");
    const [editAboutMe, setEditAboutMe] = useState("");
    const [editPassword, setEditPassword] = useState("");
    const [stats, setStats] = useState(null);

    const { uid } = useParams();
    const { user } = useAuth();

    // The user id we want to show (both in URL and the logged in user)
    // use the uid from URL, if that does not exist, use the logged inn players uid
    const targetUid = uid || user?.uid;

    // fetching the profile user data when the targetUid changes
    useEffect(() => {
        if (!targetUid) return;
        getUser(targetUid).then(data => setProfileUser(data));
    }, [targetUid]);

    // fetching the last 10 matches for the specific user
    useEffect(() => {
        if (!targetUid) return;
        getUserMatches(targetUid).then(data => setMatches(data));
    }, [targetUid]);

    // fetching wins and losses from the last 30 days
    useEffect(() => {
        if (!targetUid) return;
        getUserStats(targetUid).then(data => setStats(data));
    }, [targetUid]);

    async function handleEdit(e) {
        // preventing the page from reloading when the form is submitted
        e.preventDefault();
        // sending the updated fields to the backend
        const updated = await updateUser(targetUid, {
            ...(editEmail !== profileUser?.email && { email: editEmail }),
            aboutMe: editAboutMe,
            // only include password if the user typed something
            ...(editPassword && { pwd: editPassword })
        });
        // updating the profile with the new data 
        if (updated) setProfileUser(updated);
        // closing the edit form
        setEditing(false);
    }

    async function handleImageUpload(e) {
        const file = e.target.files[0];
        if (!file) return;
        const updated = await updateProfilePicture(targetUid, file);
        if (updated) setProfileUser(updated);
    }

    return (
        <div className={styles.page}>
            {!profileUser && <p>You have to log in to see the users profile</p>}
            {profileUser && (
                <div className={styles.layout}>
                    <div className={styles.left}>
                        <div className={styles.header}>
                            <div className={styles.avatarSection}>
                                {profileUser.profilePicture ? (
                                    <img 
                                        src={`${BASE_URL}/uploads/${profileUser.profilePicture}`}
                                        className={styles.avatar}
                                        alt="Profile"
                                    />
                                ) : (
                                    <div className={styles.avatarFallback}>
                                        {profileUser.username[0].toUpperCase()}
                                    </div>
                                )}
                                {user?.uid === profileUser.uid && (
                                    <label className={styles.imageUpload}>
                                        Change photo
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            hidden
                                        />
                                    </label>
                                )}
                            </div>
                            <h1>{profileUser.username}</h1>
                            {/* Showing the email if the user is logged in */}
                            {user?.uid === profileUser.uid && (
                                <>
                                    <p>Email: {profileUser.email}</p>
                                    <p>UID: {profileUser.uid}</p>
                                </>
                            )}
                            {profileUser.aboutMe && (
                                <div className={styles.aboutMe}>
                                    <h3>About me</h3>
                                    <p>{profileUser.aboutMe}</p>
                                </div>
                            )}
                            {user?.uid === profileUser.uid && (
                                <button className="button button-secondary" onClick={() => { 
                                    setEditEmail(profileUser.email);
                                    setEditAboutMe(profileUser.aboutMe || "");
                                    setEditPassword("");
                                    setEditing(!editing);
                                }}>
                                    {editing ? "Cancel" : "Edit Profile"}
                                </button>
                            )}
                            {editing && (
                                <form onSubmit={handleEdit} className={styles.editForm}>
                                    <label>
                                        Email 
                                        {/* value comes from the state */}
                                        <input
                                            type="email"
                                            value={editEmail}
                                            onChange={e => setEditEmail(e.target.value)}
                                            required 
                                        />
                                    </label>
                                    <label>
                                        About Me 
                                        <textarea
                                            value={editAboutMe}
                                            onChange={e => setEditAboutMe(e.target.value)} 
                                        />
                                    </label>
                                    <label>
                                        New password (leave blank to keep current)
                                        <input
                                            type="password"
                                            value={editPassword}
                                            onChange={e => setEditPassword(e.target.value)} 
                                        />
                                        <small>Minimum 8 characters and 1 of each: uppercase, lowercase, number and symbol </small>
                                    </label>
                                    <button type="submit" className="button button-primary">
                                        Save
                                    </button>
                                </form>
                            )}
                        </div>

                        {/* User stats */}
                        <div className={styles.stats}>
                            <h2>Stats</h2>
                            <p>ELO: {profileUser.eloRating}</p>
                            <p>Games played: {matches.filter(m => m.status === "finished").length}</p>
                            <p>Wins last month: {stats?.wins ?? "0"}</p>
                            <p>Losses last month: {stats?.losses ?? "0"}</p>
                        </div>

                        {/* Trophies */}
                        <div className={styles.trophies}>
                            <h2>Trophies</h2>
                            {/* Show message if user has no trophies */}
                            {profileUser.trophies?.length === 0 && <p>No trophies yet</p>}
                            <div className={styles.trophyList}>
                                {profileUser.trophies?.map((trophy, index) => (
                                    <div key={index} className={styles.trophy}>
                                        {trophy.image && <img src={trophy.image} alt={trophy.title} />}
                                        <p>{trophy.title}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Last 10 matches */}
                    <div className={styles.right}>
                        <h2>Recent Matches</h2>
                        {matches.length === 0 && <p>No matches yet</p>}
                        {matches
                            .filter(m => m.status === "finished" || m.status === "ongoing")
                            .map(m => (
                                <div key={m.mid} className={styles.match}>
                                    <p>Best of {m.rounds} | {m.timeControl} seconds</p>
                                    <p>{m.status}</p>
                                </div>
                            ))
                        }
                        <Link to={`/profile/${targetUid}/games`}
                            className={styles.viewAllGamesLink}>
                            View all games
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
