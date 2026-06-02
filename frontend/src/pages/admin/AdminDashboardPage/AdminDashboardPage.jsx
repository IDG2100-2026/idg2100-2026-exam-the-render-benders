import { Link } from "react-router";
import PlatformActivity from "@/components/PlatformActivity/PlatformActivity";
import styles from "./AdminDashboardPage.module.css";

export default function AdminDashboardPage() {
    return (
        <div className={styles.page}>
            <div className={styles.titleRow}>
                <h1>Admin Dashboard</h1>
                <Link to="/" className={styles.homeBtn}>← Back to site</Link>
            </div>
            <PlatformActivity />
            <div className={styles.links}>
                <Link to="/admin/users" className={styles.card}>
                    <h2>User Administration</h2>
                    <p>Search, list and ban user profiles.</p>
                </Link>
                <Link to="/admin/comments" className={styles.card}>
                    <h2>Comment Administration</h2>
                    <p>View and delete recent comments.</p>
                </Link>
                <Link to="/admin/tournaments/create" className={styles.card}>
                    <h2>Create Tournament</h2>
                    <p>Set up a new tournament.</p>
                </Link>
            </div>
        </div>
    );
}