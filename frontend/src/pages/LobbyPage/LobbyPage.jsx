import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "@/contexts/AuthContext";
import { apiFetch } from "@/api";
import { GAME_ROUND_COUNTS, GAME_TIME_CONTROLS, GAME_PLAYER_COUNTS, GAME_BUY_INS, RULES_STRAIGHTS, RULES_NO_STRAIGHTS } from "@/config/constants";
import LobbyCard from "@/components/LobbyCard/LobbyCard";
import styles from "./LobbyPage.module.css";

export default function LobbyPage() {
    const { user, login } = useAuth();
    const navigate = useNavigate();
    const [games, setGames] = useState([]);
    const [error, setError] = useState(null);

    // Filter state - null means "show all", a value means only show games matching that value
    const [filterRules, setFilterRules] = useState(null);
    const [filterRounds, setFilterRounds] = useState(null);
    const [filterTimeControl, setFilterTimeControl] = useState(null);
    const [filterNumPlayers, setFilterNumPlayers] = useState(null);
    const [filterBuyIn, setFilterBuyIn] = useState(null);

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

    // Apply active filters - if a filter is null it passes all games through
    const filteredGames = games
        .filter(game => !filterRules || game.variant.rules === filterRules)
        .filter(game => !filterRounds || game.variant.rounds === filterRounds)
        .filter(game => !filterTimeControl || game.variant.timeControl === filterTimeControl)
        .filter(game => !filterNumPlayers || game.numPlayers === filterNumPlayers)
        .filter(game => !filterBuyIn || game.buyIn === filterBuyIn);

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

            {/* Filter bar - each group toggles a filter, clicking the active value resets it to null */}
            <div className={styles.filters}>
                <div className={styles.filterGroup}>
                    <span>Rules</span>
                    <button onClick={() => setFilterRules(null)} className={!filterRules ? styles.filterActive : styles.filterBtn}>All</button>
                    <button onClick={() => setFilterRules(RULES_STRAIGHTS)} className={filterRules === RULES_STRAIGHTS ? styles.filterActive : styles.filterBtn}>Straights</button>
                    <button onClick={() => setFilterRules(RULES_NO_STRAIGHTS)} className={filterRules === RULES_NO_STRAIGHTS ? styles.filterActive : styles.filterBtn}>No straights</button>
                </div>
                <div className={styles.filterGroup}>
                    <span>Rounds</span>
                    {GAME_ROUND_COUNTS.map(n => (
                        <button key={n} onClick={() => setFilterRounds(filterRounds === n ? null : n)} className={filterRounds === n ? styles.filterActive : styles.filterBtn}>{n}</button>
                    ))}
                </div>
                <div className={styles.filterGroup}>
                    <span>Time</span>
                    {GAME_TIME_CONTROLS.map(n => (
                        <button key={n} onClick={() => setFilterTimeControl(filterTimeControl === n ? null : n)} className={filterTimeControl === n ? styles.filterActive : styles.filterBtn}>{n}s</button>
                    ))}
                </div>
                <div className={styles.filterGroup}>
                    <span>Players</span>
                    {GAME_PLAYER_COUNTS.map(n => (
                        <button key={n} onClick={() => setFilterNumPlayers(filterNumPlayers === n ? null : n)} className={filterNumPlayers === n ? styles.filterActive : styles.filterBtn}>{n}</button>
                    ))}
                </div>
                <div className={styles.filterGroup}>
                    <span>Buy-in</span>
                    {GAME_BUY_INS.map(n => (
                        <button key={n} onClick={() => setFilterBuyIn(filterBuyIn === n ? null : n)} className={filterBuyIn === n ? styles.filterActive : styles.filterBtn}>{n} pts</button>
                    ))}
                </div>
            </div>

            {filteredGames.length === 0 && !error && (
                <div className={styles.emptyMsg}>
                    <p>No suitable games waiting for players.</p>
                </div>
            )}
            <div className={styles.list}>
                {filteredGames.map((game) => (
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
