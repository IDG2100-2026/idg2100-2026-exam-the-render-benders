import { useState, useEffect } from "react";
import { apiFetch } from "@/api";
import styles from "./PlatformActivity.module.css";

export default function PlatformActivity() {
    const [activity, setActivity] = useState(null);

    useEffect(() => {
        apiFetch("/activity")
            .then(data => setActivity(data))
            .catch(() => {});
    }, []);

    if (!activity) return null;

    return (
        <div className={styles.container}>
            <h2>Platform Activity</h2>
            <div className={styles.stats}>
                <div className={styles.stat}>
                    <span className={styles.value}>{activity.ongoingGames}</span>
                    <span className={styles.label}>Games Live</span>
                </div>
                <div className={styles.stat}>
                    <span className={styles.value}>{activity.waitingGames}</span>
                    <span className={styles.label}>Waiting for Players</span>
                </div>
                <div className={styles.stat}>
                    <span className={styles.value}>{activity.activeUsersThisWeek}</span>
                    <span className={styles.label}>Active Players This Week</span>
                </div>
            </div>
        </div>
    );
}

