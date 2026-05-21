import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router";
import { MdEmojiEvents, MdSportsEsports, MdTimeline, MdArrowForward, MdEmail, MdCalendarToday, MdHistory, MdPieChart, MdTrendingUp } from "react-icons/md";
import { useAuth } from "@/contexts/AuthContext";
import { apiFetch, getAssetUrl } from "@/api";
import styles from "./UserProfilePage.module.css";

export default function UserProfilePage() {
    const { username } = useParams();
    const { user: loggedInUser } = useAuth();
    const [profile, setProfile] = useState(null);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    const [aboutMe, setAboutMe] = useState("");
    const [profileImage, setProfileImage] = useState("");
    const [profileImageFile, setProfileImageFile] = useState(null);
    const [profileImagePreview, setProfileImagePreview] = useState(null);
    const [newPassword, setNewPassword] = useState("");
    const [updateMsg, setUpdateMsg] = useState(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        async function fetchProfile() {
            try {
                const data = await apiFetch(`/users/${username}`);
                setProfile(data);
                setAboutMe(data.aboutMe || "");
                setProfileImage(data.profileImage || "");
            } catch (err) {
                setError(err.message);
            }
        }
        fetchProfile();
    }, [username]);

    async function handleUpdateProfile(e) {
        e.preventDefault();
        setUpdateMsg(null);
        try {
            const formData = new FormData();
            formData.append("aboutMe", aboutMe);
            if (newPassword) formData.append("pwd", newPassword);
            if (profileImageFile) {
                formData.append("profileImage", profileImageFile);
            } else {
                formData.append("profileImage", profileImage);
            }

            const updatedUser = await apiFetch(`/users/${username}`, {
                method: "PUT",
                body: formData
            });

            setProfile((prev) => ({ ...prev, ...updatedUser }));
            setIsEditing(false);
            setNewPassword("");
            setProfileImageFile(null);
            setProfileImagePreview(null);
            setUpdateMsg("Profile updated successfully!");
        } catch (err) {
            setUpdateMsg("Error updating profile: " + err.message);
        }
    }

    function handleCancelEdit() {
        setIsEditing(false);
        setNewPassword("");
        setProfileImageFile(null);
        setProfileImagePreview(null);
        setAboutMe(profile.aboutMe || "");
        setProfileImage(profile.profileImage || "");
    }

    function handleImageClick() {
        if (isEditing && fileInputRef.current) {
            fileInputRef.current.click();
        }
    }

    function handleFileChange(e) {
        const file = e.target.files[0];
        if (file) {
            setProfileImageFile(file);
            setProfileImagePreview(URL.createObjectURL(file));
        }
    }

    if (error) return <div className={styles.page}><p className={styles.error}>{error}</p></div>;
    if (!profile) return <div className={styles.page}><p>Loading...</p></div>;

    const winRate = profile.gamesPlayed > 0
        ? Math.round((profile.wins / profile.gamesPlayed) * 100)
        : 0;

    const isOwnProfile = loggedInUser?.username === profile.username;
    
    // Determine which image to show - getAssetUrl handles the default fallback
    const displayImage = profileImagePreview || getAssetUrl(profile.profileImage);

    return (
        <div className={styles.page}>
            <div className={styles.profileHeaderCard}>
                <div className={styles.headerTop}>
                    <div 
                        className={`${styles.avatarWrapper} ${isEditing ? styles.editingAvatar : ''}`}
                        onClick={handleImageClick}
                    >
                        <img src={displayImage} alt={profile.username} className={styles.avatar} />
                        {isEditing && <div className={styles.avatarOverlay}><span>Change</span></div>}
                    </div>
                    <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} style={{ display: "none" }} />

                    <div className={styles.mainInfo}>
                        <div className={styles.nameRow}>
                            <h1>{profile.username}</h1>
                            {isOwnProfile && <span className={styles.youBadge}>You</span>}
                        </div>
                        <div className={styles.metaRow}>
                            {isOwnProfile && <span className={styles.metaItem}><MdEmail /> {profile.email}</span>}
                            <span className={styles.metaItem}><MdCalendarToday /> Joined {new Date(profile.createdAt).toLocaleDateString()}</span>
                        </div>
                        {isOwnProfile && !isEditing && (
                            <button onClick={() => setIsEditing(true)} className={styles.editBtn}>Edit Profile</button>
                        )}
                    </div>
                </div>

                <div className={styles.headerBottom}>
                    {isEditing ? (
                        <form onSubmit={handleUpdateProfile} className={styles.editForm}>
                            <textarea 
                                value={aboutMe} 
                                onChange={(e) => setAboutMe(e.target.value)} 
                                placeholder="Tell us about yourself..."
                                rows={3}
                            />
                            <div className={styles.editFormRow}>
                                <input 
                                    type="password" 
                                    value={newPassword} 
                                    onChange={(e) => setNewPassword(e.target.value)} 
                                    placeholder="New Password (optional)"
                                />
                                <div className={styles.formActions}>
                                    <button type="submit" className={styles.saveBtn}>Save</button>
                                    <button type="button" onClick={handleCancelEdit} className={styles.cancelBtn}>Cancel</button>
                                </div>
                            </div>
                        </form>
                    ) : (
                        <div className={styles.bioSection}>
                            <p className={styles.bioText}>{profile.aboutMe || "No bio yet."}</p>
                        </div>
                    )}
                </div>
                {updateMsg && <p className={styles.updateMsg}>{updateMsg}</p>}
            </div>

            <div className={styles.dashboardGrid}>
                <div className={styles.eloSection}>
                    <div className={styles.eloMainCard}>
                        <MdEmojiEvents className={styles.eloIcon} />
                        <div className={styles.eloInfo}>
                            <span className={styles.eloLabel}>Overall Rating</span>
                            <span className={styles.eloValueLarge}>{profile.elo}</span>
                        </div>
                    </div>
                    <div className={styles.eloBreakdown}>
                        <div className={styles.variantElo}>
                            <span className={styles.vLabel}>Blitz (3s)</span>
                            <span className={styles.vValue}>{profile.elo3s || 1000}</span>
                        </div>
                        <div className={styles.variantElo}>
                            <span className={styles.vLabel}>Rapid (10s)</span>
                            <span className={styles.vValue}>{profile.elo10s || 1000}</span>
                        </div>
                        <div className={styles.variantElo}>
                            <span className={styles.vLabel}>Classic (30s)</span>
                            <span className={styles.vValue}>{profile.elo30s || 1000}</span>
                        </div>
                    </div>
                </div>

                <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <MdSportsEsports />
                        <div className={styles.statInfo}>
                            <span className={styles.statVal}>{profile.gamesPlayed}</span>
                            <span className={styles.statLab}>Total Games</span>
                        </div>
                    </div>
                    <div className={styles.statCard}>
                        <MdTimeline />
                        <div className={styles.statInfo}>
                            <span className={styles.statVal}>{winRate}%</span>
                            <span className={styles.statLab}>Win Rate</span>
                        </div>
                    </div>
                    <div className={styles.statCard}>
                        <MdPieChart />
                        <div className={styles.statInfo}>
                            <div className={styles.wlDisplay}>
                                <span className={styles.winCount}>{profile.wins}W</span>
                                <span className={styles.lossCount}>{profile.gamesPlayed - profile.wins}L</span>
                            </div>
                            <span className={styles.statLab}>Record (W/L)</span>
                        </div>
                    </div>
                    <div className={styles.statCard}>
                        <MdTrendingUp />
                        <div className={styles.statInfo}>
                            <div className={styles.wlDisplay}>
                                <span className={styles.winCount}>{profile.monthlyWins || 0}W</span>
                                <span className={styles.lossCount}>{profile.monthlyLosses || 0}L</span>
                            </div>
                            <span className={styles.statLab}>This Month</span>
                        </div>
                    </div>
                </div>
            </div>

            {profile.trophies?.length > 0 && (
                <div className={styles.sectionCard}>
                    <h2><MdEmojiEvents /> Trophies</h2>
                    <div className={styles.trophyList}>
                        {profile.trophies.map((trophy, index) => (
                            <div key={index} className={styles.trophy}>
                                <img src={trophy.image} alt={trophy.title} />
                                <span>{trophy.title}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className={styles.sectionCard}>
                <div className={styles.sectionHeader}>
                    <h2><MdHistory /> Recent Games</h2>
                    <Link to={`/users/${username}/games`} className={styles.historyBtn}>Full History</Link>
                </div>
                {profile.recentGames?.length > 0 ? (
                    <div className={styles.gameList}>
                        {profile.recentGames.map((game) => {
                            const opponents = game.players
                                .filter(p => p.username !== profile.username)
                                .map(p => p.username);
                            
                            return (
                                <Link to={`/games/${game._id}`} key={game._id} className={styles.gameListItem}>
                                    <span className={`${styles.statusBadge} ${styles[game.status]}`}>
                                        {game.status}
                                    </span>
                                    <div className={styles.gameDetails}>
                                        <span className={styles.gameOpponent}>
                                            vs {opponents.length > 0 ? opponents.join(", ") : "Waiting..."}
                                        </span>
                                        <span className={styles.gameMeta}>
                                            {game.variant.rounds}r • {game.variant.timeControl}s
                                        </span>
                                    </div>
                                    <MdArrowForward className={styles.arrowIcon} />
                                </Link>
                            );
                        })}
                    </div>
                ) : (
                    <p className={styles.emptyMsg}>No games played yet.</p>
                )}
            </div>
        </div>
    );
}
