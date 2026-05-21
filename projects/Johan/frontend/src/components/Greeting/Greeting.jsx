import { useAuth } from "../../contexts/AuthContext";
import { Link } from "react-router";
import { getAssetUrl } from "../../api";
import styles from "./Greeting.module.css";

export default function Greeting() {
    const { user, logout } = useAuth();

    if (user) {
        return (
            <div className={styles.greeting}>
                <Link to={`/users/${user.username}`} className={styles.profileLink}>
                    <img 
                        src={getAssetUrl(user.profileImage)} 
                        alt={user.username} 
                        className={styles.profileIcon} 
                    />
                    <span className={styles.username}>Hello, {user.username}</span>
                </Link>
                <button onClick={logout} className={styles.button}>Log out</button>
            </div>
        );
    }

    return (
        <div className={styles.greeting}>
            <Link to="/login" className={styles.loginButton}>Login</Link>
            <Link to="/register" className={styles.registerButton}>Register</Link>
        </div>
    );
}
