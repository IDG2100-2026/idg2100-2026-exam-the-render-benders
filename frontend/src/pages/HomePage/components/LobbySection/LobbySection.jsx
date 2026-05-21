import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { apiFetch } from "@/api";
import { useAuth } from "@/contexts/AuthContext";
import { useAppearance } from "@/contexts/AppearanceContext";
import LobbyCard from "@/components/LobbyCard/LobbyCard";
import styles from "./LobbySection.module.css";

export default function LobbySection() {
    const navigate = useNavigate();
    const { user } = useAuth(); // needed to send player ID when joining
    const [games, setGames] = useState([]);
    const [error, setError] = useState(null);
    // lobbyCount comes from appearance settings - user can adjust it with the slider
    const { preferences } = useAppearance();

    // Re-fetches when lobbyCount changes so the list updates immediately
    useEffect(() => {
        async function fetchGames() {
            try {
                const data = await apiFetch(`/games?status=waiting&limit=${preferences.lobbyCount}`);
                setGames(data);
            } catch (err) {
                setError(err.message);
            }
        }
        fetchGames();
    }, [preferences.lobbyCount]);

    // Tries to join the game, then navigates to it regardless of success
    // If join fails (e.g. game already full), the user can still watch as a spectator
    async function handleCardClick(gameId) {
        if (user) {
            try {
                await apiFetch(`/games/${gameId}/join`, {
                    method: "PATCH",
                    body: JSON.stringify({ player: user._id })
                });
            } catch {
                // join failed - navigate anyway so the user can watch
            }
        }
        navigate(`/games/${gameId}`);
    }

    return (
        <div className={styles.container}>
            <h2>Lobby</h2>
            {error && <p className={styles.error}>{error}</p>}
            {games.length === 0 && !error && <p>No games waiting for players.</p>}
            <div className={styles.list}>
                {games.map((game) => (
                    <LobbyCard key={game._id} game={game} onCardClick={handleCardClick} />
                ))}
            </div>
        </div>
    );
}
