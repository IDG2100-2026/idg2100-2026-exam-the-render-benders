import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/contexts/AuthContext";
import { apiFetch } from "@/api";
import LobbyCard from "@/components/LobbyCard/LobbyCard";
import styles from "./MyActiveGames.module.css";

export default function MyActiveGames() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [games, setGames] = useState([]);

    useEffect(() => {
        if (!user) return;
        async function fetchMine() {
            try {
                const data = await apiFetch("/games?mine=true");
                setGames(data);
            } catch {
                // 
            }
        }
        fetchMine();
    }, [user]);

    if (!user || games.length === 0) return null;

    return (
        <div className={styles.container}>
            <h2>Your active games</h2>
            <div className={styles.list}>
                {games.map((game) => (
                    <LobbyCard
                        key={game._id}
                        game={game}
                        onCardClick={(id) => navigate(`/games/${id}`)}
                    />
                ))}
            </div>
        </div>
    );
}
