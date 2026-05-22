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
    const [myGames, setMyGames] = useState([]);
    const [error, setError] = useState(null);

    // Fetches all waiting games and the current user's own active games
    useEffect(() => {
        async function fetchGames() {
            try {
                const data = await apiFetch("/games?status=waiting");
                setGames(data);
            } catch (err) {
                setError(err.message);
            }
        }
        async function fetchMyGames() {
            try {
                // mine=true returns games where the logged-in user is already a player
                const data = await apiFetch("/games?mine=true");
                setMyGames(data);
            } catch {
                // non-critical
            }
        }
        fetchGames();
        if (user) fetchMyGames();
    }, [user]);

    // Sends a join request and navigates to the game page on success
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

    // Creates a guest account, logs in as that guest, then joins the game
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
            {/* Show login prompt for anonymous users */}
            {!user && (
                <div className={styles.loginHint}>
                    <p>You are browsing as a guest. Only games open to anonymous players are shown.</p>
                    <Link to="/login" className={styles.loginButton}>Log in to see all games</Link>
                </div>
            )}
            {/* Your active games - games the user created or joined that are still active */}
            {myGames.length > 0 && (
                <section>
                    <h2 className={styles.sectionTitle}>Your active games</h2>
                    <div className={styles.list}>
                        {myGames.map((game) => (
                            <LobbyCard
                                key={game._id}
                                game={game}
                                onCardClick={(id) => navigate(`/games/${id}`)}
                            />
                        ))}
                    </div>
                </section>
            )}

            {error && <p className={styles.error}>{error}</p>}
            <h2 className={styles.sectionTitle}>Open games</h2>
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
    );}
