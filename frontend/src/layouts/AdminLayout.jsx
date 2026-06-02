import { Outlet, NavLink } from "react-router";
import styles from "./AdminLayout.module.css";

export default function AdminLayout() {
    return (
        <>
            <header className={styles.header}>
                <NavLink to="/" className={styles.logo}>Spanish Poker Dice</NavLink>
                <nav className={styles.nav}>
                    <NavLink to="/admin" end className={({ isActive }) => isActive ? styles.active : ""}>Dashboard</NavLink>
                    <NavLink to="/admin/users" className={({ isActive }) => isActive ? styles.active : ""}>Users</NavLink>
                    <NavLink to="/admin/comments" className={({ isActive }) => isActive ? styles.active : ""}>Comments</NavLink>
                    <NavLink to="/admin/tournaments/create" className={({ isActive }) => isActive ? styles.active : ""}>Create Tournament</NavLink>
                </nav>
            </header>
            <main className={styles.main}>
                <Outlet />
            </main>
        </>
    );
}