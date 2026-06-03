import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import { io } from "socket.io-client";
import { apiFetch } from "@/api";
import { LOBBY_POLL_MS } from "@/config/constants";
import { useAppearance } from "@/contexts/AppearanceContext";
import { useAuth } from "@/contexts/AuthContext";
import LobbyCard from "@/components/LobbyCard/LobbyCard";
import styles from "./LobbySection.module.css";

const SOCKET_URL = import.meta.env.VITE_API_URL.replace("/api/v1", "");

export default function LobbySection() {
    const navigate = useNavigate();
    const { user, login } = useAuth();
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const { preferences } = useAppearance();

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

    useEffect(() => {
        fetchGames(true);
        const intervalId = setInterval(() => fetchGames(false), LOBBY_POLL_MS);
        return () => clearInterval(intervalId);
    }, [fetchGames]);

    useEffect(() => {
        const socket = io(SOCKET_URL, { withCredentials: true });
        socket.on("lobby-update", () => fetchGames(false));
        return () => socket.disconnect();
    }, [fetchGames]);

    async function handleCardClick(gameId) {
        if (user) {
            try {
                await apiFetch(`/games/${gameId}/players`, {
                    method: "POST",
                    body: JSON.stringify({ player: user._id })
                });
            } catch (err) {
                if (!err.message?.toLowerCase().includes("already")) {
                    setError(err.message);
                    return;
                }
            }
        }
        navigate(`/games/${gameId}`);
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
