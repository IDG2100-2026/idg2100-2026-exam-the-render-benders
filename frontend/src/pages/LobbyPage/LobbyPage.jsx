import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "@/contexts/AuthContext";
import { apiFetch } from "@/api";
import LobbyCard from "@/components/LobbyCard/LobbyCard";
import styles from "./LobbyPage.module.css";

export default function LobbyPage() {
    const { user, login } = useAuth();
    const navigate = useNavigate();
    const [games, setGames] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchGames() {
            try {
                const data = await apiFetch("/games?status=waiting");
                setGames(data);
            } catch (err) {
                setError(err.message);
            }
        }
        fetchGames();
    }, [user]);

    async function handleJoin(gameId) {
        try {
            await apiFetch(`/games/${gameId}/players`, {
                method: "POST",
                body: JSON.stringify({ player: user?._id })
            });
            navigate(`/games/${gameId}`);
        } catch (err) {
            setError(err.message);
        }
    }

    async function handleGuestJoin(gameId) {
        try {
            const guestUser = await apiFetch("/sessions/guest", { method: "POST" });
            login(guestUser);
            await apiFetch(`/games/${gameId}/players`, {
                method: "POST",
                body: JSON.stringify({ player: guestUser._id })
            });
            navigate(`/games/${gameId}`);
        } catch (err) {
            setError(err.message);
        }
    }

    return (
        <div className={styles.page}>
            <h1>Lobby</h1>
            {!user && (
                <div className={styles.loginHint}>
                    <p>You are browsing as a guest. Only games open to anonymous players are shown.</p>
                    <Link to="/login" className={styles.loginButton}>Log in to see all games</Link>
                </div>
            )}
            {error && <p className={styles.error}>{error}</p>}
            {games.length === 0 && !error && (
                <div className={styles.emptyMsg}>
                    <p>No suitable games waiting for players.</p>
                </div>
            )}
            <div className={styles.list}>
                {games.map((game) => (
                    <LobbyCard
                        key={game._id}
                        game={game}
                        onJoin={user ? handleJoin : undefined}
                        onCardClick={user ? handleJoin : (id) => navigate(`/games/${id}`)}
                        onGuestJoin={!user && game.allowAnonymous ? handleGuestJoin : undefined}
                    />
                ))}
            </div>
        </div>
    );
}
