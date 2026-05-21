import { useState, useCallback } from 'react';
import { GameContext } from './game-context.js';

export function GameProvider({ children }) {
    const [games, setGames] = useState([]);
    const [selectedGame, setSelectedGame] = useState(null);
    const [filters, setFilters] = useState({
        visibility: null,
        gameType: null,
        player: null,
        status: null,
        limit: 20,
        offset: 0
    });

    const updateGames = useCallback((newGames) => {
        setGames(newGames);
    }, []);

    const updateGame = useCallback((gameId, updates) => {
        setGames((prev) =>
            prev.map((game) =>
                game._id === gameId ? { ...game, ...updates } : game
            )
        );
    }, []);

    const updateFilters = useCallback((newFilters) => {
        setFilters((prev) => ({ ...prev, ...newFilters }));
    }, []);

    return (
        <GameContext.Provider
            value={{
                games,
                selectedGame,
                filters,
                setSelectedGame,
                updateGames,
                updateGame,
                updateFilters
            }}
        >
            {children}
        </GameContext.Provider>
    );
}