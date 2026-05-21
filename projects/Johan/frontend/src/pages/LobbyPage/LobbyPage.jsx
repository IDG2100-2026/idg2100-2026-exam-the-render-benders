import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../../contexts/AuthContext";
import { apiFetch } from "../../api";
import LobbyCard from "../../components/LobbyCard/LobbyCard";
import styles from "./LobbyPage.module.css";

export default function LobbyPage() {
    const { user } = useAuth(); // get the logged in user to check eligibility
    const navigate = useNavigate();
    const [games, setGames] = useState([]);
    const [error, setError] = useState(null);

    // Fetches all waiting games when the component mounts
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
    }, []);

    // Sends a join request and navigates to the game page on success
    async function handleJoin(gameId) {
        try {
            await apiFetch(`/games/${gameId}/join`, {
                method: "PATCH",
                body: JSON.stringify({ player: user?._id })
            });
            // Automatically navigate to the game page after joining
            navigate(`/games/${gameId}`);
        } catch (err) {
            setError(err.message);
        }
    }

    return (
        <div className={styles.page}>
            <h1>Lobby</h1>
            {/* Show login prompt for anonymous users */}
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
                    />
                ))}
            </div>
        </div>
    );}
