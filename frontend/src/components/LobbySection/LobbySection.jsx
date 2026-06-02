import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import { io } from "socket.io-client";
import { apiFetch } from "@/api";
import { LOBBY_POLL_MS } from "@/config/constants";
import { useAppearance } from "@/contexts/AppearanceContext";
import { useAuth } from "@/contexts/AuthContext";
import LobbyCard from "@/components/LobbyCard/LobbyCard";
import styles from "./LobbySection.module.css";


// Socket.IO lives on the backend root, not under /api/v1
const SOCKET_URL = import.meta.env.VITE_API_URL.replace("/api/v1", "");

export default function LobbySection() {
    const navigate = useNavigate();
    const { user, login } = useAuth();
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // lobbyCount comes from appearance settings - user can adjust it with the slider
    const { preferences } = useAppearance();

    // Re-fetches on mount, when lobbyCount changes, and every LOBBY_POLL_MS
    // only shows loading spinner on first fetch - background polls update silently
    const fetchGames = useCallback(async (showSpinner = false) => {
        if (showSpinner) setLoading(true);
        try {
            const data = await apiFetch(`/games?status=waiting&limit=${preferences.lobbyCount}`);
            setGames(data);
        } catch (err) {
            setError(err.message);
        } finally {
            if (showSpinner) setLoading(false);
        }
    }, [preferences.lobbyCount]);

    // initial fetch + polling fallback
    useEffect(() => {
        fetchGames(true);
        const intervalId = setInterval(() => fetchGames(false), LOBBY_POLL_MS);
        return () => clearInterval(intervalId);
    }, [fetchGames]);

    // real-time updates: re-fetch whenever a game is created, filled, or deleted
    useEffect(() => {
        const socket = io(SOCKET_URL, { withCredentials: true });
        socket.on("lobby-update", () => fetchGames(false));
        return () => socket.disconnect();
    }, [fetchGames]);

    async function handleCardClick(gameId) {
        // if logged in, join the game first before navigating
        // this ensures the player is registered as a participant, not just a spectator
        if (user) {
            try {
                await apiFetch(`/games/${gameId}/players`, {
                    method: "POST",
                    body: JSON.stringify({ player: user._id })
                });
            } catch (err) {
                // already a player = fine, navigate anyway
                // any other error (not enough points, banned, etc.) = show it and don't navigate
                if (!err.message?.toLowerCase().includes("already")) {
                    setError(err.message);
                    return;
                }
            }
        }
        navigate(`/games/${gameId}`);
    }

    // creates a guest session, joins the game, then navigates - same flow as LobbyPage
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
        <div className={styles.container}>
            <h2>Lobby</h2>
            {error && <p className={styles.error}>{error}</p>}
            {loading && <p>Loading...</p>}
            {!loading && games.length === 0 && !error && <p>No games waiting for players.</p>}
            <div className={styles.list}>
                {games.map((game) => (
                    <LobbyCard
                        key={game._id}
                        game={game}
                        onCardClick={handleCardClick}
                        onGuestJoin={!user && game.allowAnonymous ? handleGuestJoin : undefined}
                    />
                ))}
            </div>
        </div>
    );
}
