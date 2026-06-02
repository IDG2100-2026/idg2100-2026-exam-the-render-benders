import { useState, useEffect } from "react";
import { Link } from "react-router";
import { apiFetch, getAssetUrl } from "@/api";
import styles from "./AdminUsersPage.module.css";

export default function AdminUsersPage() {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        apiFetch("/users")
            .then(data => setUsers(data))
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    async function handleBan(username, isBanned) {
        try {
            await apiFetch(`/users/${username}/ban`, { method: "PATCH" });
            setUsers(prev => prev.map(u =>
                u.username === username ? { ...u, isBanned: !isBanned } : u
            ));
        } catch (err) {
            setError(err.message);
        }
    }

    const filtered = users.filter(u =>
        u.username.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <p>Loading users...</p>;
    if (error) return <p className={styles.error}>{error}</p>;

    return (
        <div className={styles.page}>
            <h1>User Administration</h1>
            <input
                className={styles.search}
                type="text"
                placeholder="Search by username..."
                value={search}
                onChange={e => setSearch(e.target.value)}
            />
            <ul className={styles.list}>
                {filtered.map(user => (
                    <li key={user._id} className={styles.item}>
                        <img src={getAssetUrl(user.profileImage)} alt="" className={styles.avatar} />
                        <div className={styles.info}>
                            <Link to={`/users/${user.username}`} className={styles.username}>
                                {user.username}
                            </Link>
                            <span className={styles.meta}>
                                {user.isAdmin && <span className={styles.badge}>Admin</span>}
                                {user.isGuest && <span className={styles.badge}>Guest</span>}
                                {user.isBanned && <span className={`${styles.badge} ${styles.banned}`}>Banned</span>}
                                <span>{user.points ?? 0} pts</span>
                                <span>{user.elo ?? 1000} ELO</span>
                            </span>
                        </div>
                        {!user.isAdmin && (
                            <button
                                className={user.isBanned ? styles.unbanBtn : styles.banBtn}
                                onClick={() => handleBan(user.username, user.isBanned)}
                            >
                                {user.isBanned ? "Unban" : "Ban"}
                            </button>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}