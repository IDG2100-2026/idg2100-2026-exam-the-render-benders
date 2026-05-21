import { useContext } from "react";
import { GameContext } from "../context/GameContext";

export function useGameData() {
    const context = useContext(GameContext);
    if (!context) {
        throw new Error('useGameData must be used within GameProvider');
    }
    return context;
}