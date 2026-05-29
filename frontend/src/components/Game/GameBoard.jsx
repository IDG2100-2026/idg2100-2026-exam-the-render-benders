import { useRef, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "@/contexts/AuthContext";
import { apiFetch } from "@/api";
import { TIMEOUT_RETRY_MS } from "@/config/constants";
import "./game-board.js";
import styles from "./GameBoard.module.css";

// Socket.IO lives on the backend root, not under /api/v1
const SOCKET_URL = import.meta.env.VITE_API_URL.replace("/api/v1", "");

export default function GameBoard({ isPlayer, gameId, onStateUpdate }) {
    const boardRef = useRef(null);
    const onStateUpdateRef = useRef(onStateUpdate);
    const { user } = useAuth();
    const [serverState, setServerState] = useState(null);
    // holds are tracked locally - server does not persist them between clicks
    const [heldDice, setHeldDice] = useState(new Set());
    const roundRef = useRef(null);
    const [betAmount, setBetAmount] = useState(1);
    const [actionError, setActionError] = useState(null);
    const [secondsLeft, setSecondsLeft] = useState(null);

    const isMyTurn = serverState?.currentTurn?.toString() === user?._id;
    const phase = serverState?.phase;
    const turnExpiresAt = serverState?.timeoutState?.turnExpiresAt ?? null;

    useEffect(() => { onStateUpdateRef.current = onStateUpdate; }, [onStateUpdate]);

    // fetch initial state via REST so the board shows immediately on reload
    useEffect(() => {
        if (!gameId) return;
        apiFetch(`/games/${gameId}/state`)
            .then(data => setServerState(data))
            .catch(() => { });
    }, [gameId]);

    // connect to Socket.IO, join the game room and listen for state updates
    useEffect(() => {
        if (!gameId) return;
        const socket = io(SOCKET_URL, { withCredentials: true });

        socket.on("connect", () => {
            socket.emit("join-room", { gid: gameId });
        });

        // server sends a personalised state: current player sees their own hidden rolls,
        // other players' hidden rolls are stripped out
        socket.on("game-state", (state) => {
            // clear held dice when the server pushes a new round
            if (roundRef.current !== state.currentRound) {
                roundRef.current = state.currentRound;
                setHeldDice(new Set());
            }
            setServerState(state);
            setActionError(null);
            onStateUpdateRef.current?.(state);
        });

        return () => socket.disconnect();
    }, [gameId]);

    // sync the web component whenever server state or held dice change
    useEffect(() => {
        const board = boardRef.current;
        if (!board) return;

        // set spectator mode before the early return so non-players always get it
        if (!isPlayer) {
            board.setAttribute("spectator", "");
        } else {
            board.removeAttribute("spectator");
        }

        if (!serverState) return;

        // find this player's result entry for the current round
        const myResult = serverState.results?.find(r =>
            r.player?.toString() === user?._id &&
            r.round === serverState.currentRound
        );

        const dice = (myResult?.hiddenRolls ?? []).map((value, i) => ({
            value,
            held: heldDice.has(i)
        }));

        if (dice.length === 0) return;
        board.state = { dice };

        if (!isPlayer) return;

        function handleHoldDie(event) {
            const { index } = event.detail;
            // toggle the held state for the clicked die
            setHeldDice(prev => {
                const next = new Set(prev);
                next.has(index) ? next.delete(index) : next.add(index);
                return next;
            });
        }

        board.addEventListener("hold-die", handleHoldDie);
        return () => board.removeEventListener("hold-die", handleHoldDie);
    }, [serverState, heldDice, isPlayer, user]);

    // countdown timer - ticks every second, triggers timeout endpoint when it hits zero
    useEffect(() => {
        if (!turnExpiresAt) return;

        let timeoutCalled = false;
        function tick() {
            const remaining = Math.max(0, Math.floor((new Date(turnExpiresAt) - Date.now()) / 1000));
            setSecondsLeft(remaining);
            if (remaining === 0 && isMyTurn && !timeoutCalled) {
                timeoutCalled = true;
                apiFetch(`/games/${gameId}/timeout`, { method: "POST" }).catch(err => {
                    // retry once if server clock is slightly behind the client
                    if (err.message?.includes("not expired")) {
                        setTimeout(() => apiFetch(`/games/${gameId}/timeout`, { method: "POST" }).catch(() => { }), TIMEOUT_RETRY_MS);
                    }
                });
            }
        }

        tick();
        const id = setInterval(tick, 1000);
        return () => {
            clearInterval(id);
            setSecondsLeft(null);
        };
    }, [turnExpiresAt, isMyTurn, gameId]);

    async function handleRoll() {
        setActionError(null);
        try {
            await apiFetch(`/games/${gameId}/roll`, { method: "POST" });
        } catch (err) {
            setActionError(err.message);
        }
    }

    async function handleBet(action) {
        setActionError(null);
        try {
            await apiFetch(`/games/${gameId}/bets`, {
                method: "POST",
                body: JSON.stringify({ action, amount: betAmount })
            });
        } catch (err) {
            setActionError(err.message);
        }
    }

    return (
        <div className={styles.wrapper}>
            {serverState && (
                <div className={styles.phaseInfo}>
                    <span>Round {serverState.currentRound}</span>
                    <span className={styles.phase}>{phase}</span>
                    <span>Pot: {serverState.pot ?? 0}</span>
                    {secondsLeft !== null && (
                        <span className={secondsLeft <= 5 ? styles.timerLow : styles.timer}>
                            {secondsLeft}s
                        </span>
                    )}
                </div>
            )}

            <game-board ref={boardRef} />

            {actionError && <p className={styles.error}>{actionError}</p>}

            {isPlayer && isMyTurn && phase === "rolling" && (
                <button className={styles.rollBtn} onClick={handleRoll}>Roll Dice</button>
            )}

            {isPlayer && isMyTurn && phase === "betting" && (
                <div className={styles.betControls}>
                    <button onClick={() => handleBet("fold")}>Fold</button>
                    {serverState?.bettingState?.currentBet === 0 ? (
                        <button onClick={() => handleBet("check")}>Check</button>
                    ) : (
                        <button onClick={() => handleBet("match")}>Match</button>
                    )}
                    <div className={styles.betInput}>
                        <input
                            type="number"
                            min={1}
                            value={betAmount}
                            onChange={e => setBetAmount(Number(e.target.value))}
                        />
                        <button onClick={() => handleBet(
                            serverState?.bettingState?.currentBet === 0 ? "bet" : "raise"
                        )}>Bet</button>
                    </div>
                </div>
            )}

            {isPlayer && !isMyTurn && (phase === "rolling" || phase === "betting") && (
                <p className={styles.waiting}>Waiting for opponent...</p>
            )}
        </div>
    );
}
