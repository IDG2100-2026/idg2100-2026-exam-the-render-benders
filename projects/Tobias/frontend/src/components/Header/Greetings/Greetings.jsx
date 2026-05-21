import { Link } from "react-router-dom";
import styles from "./Greetings.module.css";
import { useAuth } from "@/hooks/useAuth";
import { getUser } from "@/services/userService";
import { useState, useEffect } from "react";
import { API_URL } from "@/api.js";

const BASE_URL = API_URL.replace("/api/v1", "");

export default function Greetings(){
    // getting the current user from the auth context
    const { user, logout } = useAuth();
    const [profileData, setProfileData] = useState(null);

    useEffect(() => {
        if (!user?.uid) return;
        getUser(user.uid).then(data => setProfileData(data));
    }, [user]);

    if (user) {
        return (
            <div className={styles.greetings}>
                <div className={styles.divider}></div>
                <span>Hello, {user.username}!</span>
                {profileData?.profilePicture ? (
                    <img 
                        src={`${BASE_URL}/uploads/${profileData.profilePicture}`} 
                        className={styles.avatar}
                        alt="avatar"
                    />
                ) : (
                    <div className={styles.avatarFallback}>
                        {user.username[0].toUpperCase()}
                    </div>
                )}
                <div className={styles.divider}></div>
                <Link to="/profile" className={styles.link}>Profile</Link>
                <button className={styles.button} onClick={logout}>Log out</button>
            </div>
        );
    }

    return (
        <div className={styles.greetings}> 
            <Link to="/login" className={styles.link}>Log in</Link>
            <Link to="/register" className={styles.link}>Register</Link>
        </div>
    );
}
