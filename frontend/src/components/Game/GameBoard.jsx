import { useRef, useEffect, useState } from "react";
import "./game-board.js";

// replace with real state from WebSocket (now only mock data)
// Example: socket.on("game-state", (state) => setGameState(state));
const mockState = {
    dice: [
        { value: "A", held: false },
        { value: "K", held: false },
        { value: "Q", held: false },
        { value: "J", held: false },
        { value: "8", held: false }
    ]
};

export default function GameBoard({ isPlayer }) {
    const boardRef = useRef(null);
    const [gameState, setGameState] = useState(mockState);

    useEffect(() => {
        const board = boardRef.current;
        if (!board) return;

        // pass state as a property, not an attribute - attributes are strings only
        board.state = gameState;

        if (!isPlayer) {
            board.setAttribute("spectator", "");
            return;
        }
        board.removeAttribute("spectator");

        function handleHoldDie(event) {
            const { index } = event.detail;
            // flip held on the clicked die, leave all others unchanged
            setGameState((prev) => ({
                ...prev,
                dice: prev.dice.map((die, i) =>
                    i === index ? { ...die, held: !die.held } : die
                )
            }));
        }

        board.addEventListener("hold-die", handleHoldDie);
        return () => board.removeEventListener("hold-die", handleHoldDie);
    }, [gameState, isPlayer]);

    return <game-board ref={boardRef} />;
}