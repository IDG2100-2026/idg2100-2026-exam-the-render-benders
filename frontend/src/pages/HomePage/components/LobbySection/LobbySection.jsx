import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { apiFetch } from "@/api";
import { useAppearance } from "@/contexts/AppearanceContext";
import LobbyCard from "@/components/LobbyCard/LobbyCard";
import styles from "./LobbySection.module.css";

export default function LobbySection() {
    const navigate = useNavigate();
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // lobbyCount comes from appearance settings - user can adjust it with the slider
    const { preferences } = useAppearance();

    // Re-fetches when lobbyCount changes so the list updates immediately
    useEffect(() => {
        async function fetchGames() {
            setLoading(true);
            try {
                const data = await apiFetch(`/games?status=waiting&limit=${preferences.lobbyCount}`);
                setGames(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        fetchGames();
    }, [preferences.lobbyCount]);

    function handleCardClick(gameId) {
        navigate(`/games/${gameId}`);
    }

    return (
        <div className={styles.container}>
            <h2>Lobby</h2>
            {error && <p className={styles.error}>{error}</p>}
            {loading && <p>Loading...</p>}
            {!loading && games.length === 0 && !error && <p>No games waiting for players.</p>}
            <div className={styles.list}>
                {games.map((game) => (
                    <LobbyCard key={game._id} game={game} onCardClick={handleCardClick} />
                ))}
            </div>
        </div>
    );
}
