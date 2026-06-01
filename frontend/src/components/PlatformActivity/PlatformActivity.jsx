import { useState, useEffect } from "react";
import { getPlatformActivity } from "@/services/activityService";
import { useAuth } from "@/contexts/AuthContext";
import styles from "./PlatformActivity.module.css";

export default function PlatformActivity() {
    const [activity, setActivity] = useState(null);
    const { user } = useAuth();

    useEffect(() => {
        getPlatformActivity()
            .then(data => setActivity(data))
            .catch(() => {});
    }, []);

    if (!activity) return null;

    return (
        <div className={styles.container}>
            <h2>Platform Activity</h2>
            <div className={styles.stats}>
                <div className={styles.stat}>
                    {/* <span className={styles.value}>{activity.ongoingGames}</span> */}
                    {/* <span className={styles.label}>Games Live</span> */}
                    <span className={styles.value}>{activity.activePlayers}</span>
                    <span className={styles.label}>Active Players</span>
                </div>
                <div className={styles.stat}>
                    {/* <span className={styles.value}>{activity.waitingGames}</span> */}
                    {/* <span className={styles.label}>Waiting for Players</span> */}
                    <span className={styles.value}>{activity.gamesPlayedLastWeek}</span>
                    <span className={styles.label}>Games Played Last Week</span>
                </div>
                <div className={styles.stat}>
                    {/* <span className={styles.value}>{activity.activeUsersThisWeek}</span> */}
                    {/* <span className={styles.label}>Active Players This Week</span> */}
                    <span className={styles.value}>{activity.availableGamesNow}</span>
                    <span className={styles.label}>Available Games Now</span>
                </div>
            </div>
            {!user && <p className={styles.signInHint}>Sign in to see your personal stats</p>}
        </div>
    );
}

