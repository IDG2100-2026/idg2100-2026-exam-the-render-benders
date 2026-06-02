import { useState, useEffect, useRef } from "react";
import { NavLink, Link } from "react-router";
import { FaBars, FaXmark, FaDice, FaList, FaBookOpen, FaHouse, FaShield } from "react-icons/fa6";
import { useAuth } from "@/contexts/AuthContext";
import Greeting from "@/components/Greeting/Greeting";
import AppearancePanel from "@/components/AppearancePanel/AppearancePanel";
import { getAssetUrl } from "@/api";
import styles from "./Header.module.css";

export default function Header() {
    const [open, setOpen] = useState(false);
    const { user, logout } = useAuth();
    // useRef gives us a direct reference to the header element so we can check if clicks happen inside or outside it
    const navRef = useRef(null);

    // Effect to close mobile menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            // navRef.current.contains(event.target) returns true if the clicked element is inside the header
            // if it's false (clicked outside), we close the menu
            if (open && navRef.current && !navRef.current.contains(event.target)) {
                setOpen(false);
            }
        }
        if (open) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [open]);

    return (
        <header className={styles.header} ref={navRef}>
            <Link to="/" className={styles.logo}>
                <FaDice className={styles.logoIcon} />
                <span className={styles.logoText}>Spanish Poker Dice</span>
            </Link>
            <div className={styles.headerActions}>
                <nav className={styles.nav}>
                    <ul>
                        <li>
                            <NavLink to="/lobby">
                                <FaList /> Lobby
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/about-spanish-dice">
                                <FaBookOpen /> About
                            </NavLink>
                        </li>
                    </ul>
                </nav>
                <div className={styles.greetingWrapper}>
                    <Greeting />
                </div>
                {user?.isAdmin && (
                    <NavLink to="/admin" className={styles.adminLink}>
                        <FaShield /> Admin
                    </NavLink>
                )}
                <AppearancePanel />
                <button className={styles.menuButton} onClick={() => setOpen(p => !p)} aria-label="Toggle menu">
                    {open ? <FaXmark /> : <FaBars />}
                </button>
            </div>
            {open && (
                <nav className={styles.mobileNav}>
                    <ul>
                        <li>
                            <NavLink to="/" onClick={() => setOpen(false)}>
                                <FaHouse /> Home
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/lobby" onClick={() => setOpen(false)}>
                                <FaList /> Lobby
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/about-spanish-dice" onClick={() => setOpen(false)}>
                                <FaBookOpen /> About Spanish Dice
                            </NavLink>
                        </li>
                        {user?.isAdmin && (
                            <li>
                                <NavLink to="/admin" onClick={() => setOpen(false)}>
                                    <FaShield /> Admin
                                </NavLink>
                            </li>
                        )}
                        {user ? (
                            <li className={styles.mobileAuthItem}>
                                <Link to={`/users/${user.username}`} className={styles.mobileUserInfo} onClick={() => setOpen(false)}>
                                    <img
                                        src={getAssetUrl(user.profileImage)}
                                        alt={user.username}
                                        className={styles.mobileAvatar}
                                    />
                                    <span className={styles.mobileGreeting}>Hello, {user.username}</span>
                                </Link>
                                <button className={styles.mobileLogout} onClick={() => { logout(); setOpen(false); }}>Log out</button>
                            </li>
                        ) : (
                            <li className={styles.mobileAuthItem}>
                                <NavLink to="/login" className={styles.mobileAuthBtn} onClick={() => setOpen(false)}>Login</NavLink>
                                <NavLink to="/register" className={styles.mobileAuthBtn} onClick={() => setOpen(false)}>Register</NavLink>
                            </li>
                        )}
                    </ul>
                </nav>
            )}
        </header>
    );
}