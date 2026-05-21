import { Link } from 'react-router-dom';
import { useState, useRef, useEffect } from "react";
import { useAuth } from '@/hooks/useAuth';
import { useAppearance } from "@/hooks/useAppearance";
import style from './styles/Header.module.css';

export default function Header() {
    const { theme, setTheme, lobbyCount, setLobbyCount, soundEnabled, setSoundEnabled, boardColor, setBoardColor } = useAppearance();
    const [open, setOpen] = useState(false);
    const { user, isLoggedIn, logout } = useAuth();
    const wrapperRef = useRef(null);
    const boardColors = [
        { label: "Default", value: "default" },
        { label: "Deep", value: "deep" },
        { label: "Blue", value: "blue" },
        { label: "Plum", value: "plum" }
    ];
    const boardColorPreviewMap = {
        default: "var(--sek-board-default)",
        deep: "var(--sek-board-deep)",
        blue: "var(--sek-board-blue)",
        plum: "var(--sek-board-plum)"
    };

    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setOpen(false);
            }
        }
    
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const userId = user?._id || user?.id;

    return (
        <header className={style['header']}>
            <div className={style['header-container']}>

                {/* LOGO */}
                <Link to="/" className={style['header-logo']}>
                    <span className={style['logo-text']}>
                        Spanish Poker Dice
                    </span>
                </Link>

                {/* NAV */}
                <nav className={style['header-nav']}>

                    <Link to="/" className={style['nav-link']}>Home</Link>
                    <Link to="/lobby" className={style['nav-link']}>Lobby</Link>

                    {/* NEW LINKS */}
                    <Link to="/about-spanish-dice" className={style['nav-link']}>
                        About Game
                    </Link>

                    <Link to="/about-us" className={style['nav-link']}>
                        About Us
                    </Link>

                    {/* APPEARANCE CONTROL */}
                    <div ref={wrapperRef} className={style['appearance-wrapper']}>
                        <button onClick={() => setOpen(prev => !prev)} className={style['nav-link']}>
                            Appearance
                        </button>

                        {open && (
                            <div className={style['appearance-panel']}>
                                    {/* panel content */}
                                    {/* Theme */}
                                <div className={style['appearance-group']}>
                                    <label>Theme</label>
                                    <button  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}  className={style['toggle-btn']}>
                                        {theme === "dark" ? "Dark" : "Light"}
                                    </button>
                                </div>
                                {/* Board color */}
                                <div className={style['appearance-group']}>
                                    <label>Board Color</label>
                                    <div className={style['color-row']}>
                                        {boardColors.map((color) => (
                                            <button
                                                key={color.label}
                                                type="button"
                                                onClick={() => setBoardColor(color.value)}
                                                className={`${style['color-btn']} ${
                                                    boardColor === color.value ? style['selected'] : ''
                                                }`}
                                                style={{
                                                    background:
                                                        boardColorPreviewMap[color.value] || color.value
                                                }}
                                                aria-label={color.label}
                                                title={color.label}
                                            />
                                        ))}
                                    </div>
                                </div>
                                    
                                {/* Sound */}
                                <div className={style['appearance-group']}>
                                    <label>Sound</label>
                                    <button onClick={() => setSoundEnabled(!soundEnabled)} className={style['toggle-btn']}>
                                        {soundEnabled ? "On" : "Off"}
                                    </button>
                                </div>
                                    
                                {/* Lobby count */}
                                <div className={style['appearance-group']}>
                                    <label>Lobby games</label>
                                    <input type="range" min="3" max="20" value={lobbyCount} onChange={(e) => setLobbyCount(Number(e.target.value))}/>
                                    <span>Showing {lobbyCount} games</span>
                                </div>
                            </div>
                        )}
                    </div>
                    {/* AUTH */}
                    {isLoggedIn && user ? (
                        <div className={style['nav-user']}>
                            <Link to={`/profile/${userId}`} className={style['nav-link']}>
                                Hello, {user.username}
                            </Link>
                            {/* PROFILE IMAGE */}
                            <Link to={`/profile/${userId}`} className={style['avatar-link']}>
                                {user.profileImage ? (
                                    <img
                                        src={user.profileImage}
                                        alt="profile"
                                        className={style['avatar']}
                                    />
                                ) : (
                                    <div className={style['avatar-placeholder']}>
                                        {user.username?.[0]?.toUpperCase()}
                                    </div>
                                )}
                            </Link>



                            <button
                                type="button"
                                onClick={logout}
                                className={`${style['nav-link']} ${style['logout-btn']}`}
                            >
                                Logout
                            </button>
                        </div>
                    ) : (
                        <>
                            <Link to="/login" className={style['nav-link']}>
                                Login
                            </Link>

                            <Link
                                to="/register"
                                className={`${style['nav-link']} ${style['nav-link-primary']}`}
                            >
                                Register
                            </Link>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
}
