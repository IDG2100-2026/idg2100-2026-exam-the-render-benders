import { useRef, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "@/contexts/AuthContext";
import { apiFetch } from "@/api";
import { FACE_VALUES, HAND_NAMES, TIMEOUT_RETRY_MS, TIMEOUT_FALLBACK_MS } from "@/config/constants";
import "./game-board.js";
import styles from "./GameBoard.module.css";

// Socket.IO lives on the backend root, not under /api/v1
const SOCKET_URL = import.meta.env.VITE_API_URL.replace("/api/v1", "");

function getId(value) {
    return value?._id?.toString?.() ?? value?.toString?.();
}

function getPlayerName(game, playerId) {
    const id = getId(playerId);
    const player = game?.players?.find(player => getId(player) === id);
    return player?.username ?? "Player";
}

function getFaceValue(face) {
    return FACE_VALUES.indexOf(face);
}

function evaluateHand(rolls = [], rules = "straights-allowed") {
    const counts = rolls.reduce((acc, face) => {
        acc[face] = (acc[face] || 0) + 1;
        return acc;
    }, {});

    const groups = Object.entries(counts)
        .map(([face, count]) => ({ face, count, value: getFaceValue(face) }))
        .sort((a, b) => b.count - a.count || b.value - a.value);

    const pattern = groups.map(group => group.count).sort((a, b) => b - a);
    const values = rolls.map(getFaceValue).sort((a, b) => a- b);
    const uniqueValues = [...new Set(values)];
    const isStraight = rules === "straights-allowed" && uniqueValues.length === rolls.length &&
        uniqueValues.every((value, index) => index === 0 || value === uniqueValues[index - 1] + 1);

    if (pattern[0] === 5) return HAND_NAMES[8];
    if (pattern[0] === 4) return HAND_NAMES[7];
    if (pattern[0] === 3 && pattern[1] === 2) return HAND_NAMES[6];
    if (isStraight) return HAND_NAMES[5];
    if (pattern[0] === 3) return HAND_NAMES[4];
    if (pattern[0] === 2 && pattern[1] === 2) return HAND_NAMES[3];
    if (pattern[0] === 2) return HAND_NAMES[2];

    return HAND_NAMES[1];
}

function getRoundSummary(game) {
    if (!game || !["round-ended", "finished"].includes(game.phase)) return null;

    const roundResults = game.results?.filter(result => result.round === game.currentRound) ?? [];
    const revealedHands = roundResults.filter(result => result.revealedRolls?.length > 0);
    const winners = roundResults.filter(result => result.outcome);

    if (winners.length === 0) return null;

    const pointsWon = roundResults.reduce((sum, result) => {
        const bets = result.bets ?? [];
        return sum + bets.reduce((betSum, bet) => betSum + Math.max(0, bet.amount ?? 0), 0);
    }, 0);

    return {
        winners,
        revealedHands,
        pointsWon: Math.floor(pointsWon / winners.length)
    };
}

export default function GameBoard({ isPlayer, gameId, onStateUpdate, onGameDeleted }) {
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
    const roundSummary = getRoundSummary(serverState);

    // how many rolls the current player has used this round (from server state)
    const myRoundResult = serverState?.results?.find(result =>
        result.player?.toString() === user?._id &&
        result.round === serverState?.currentRound
    );
    const rollsUsed = myRoundResult?.rollCount ?? 0;

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
        socket.on("game-deleted", () => onGameDeleted?.());

        socket.on("game-state", (state) => {
            // clear held dice when the server pushes a new round
            if (roundRef.current !== state.currentRound || ["round-ended", "finished"].includes(state.phase)) {
                roundRef.current = state.currentRound;
                setHeldDice(new Set());
            }
            if (state.phase === "betting") {
                setBetAmount(1);
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
        let fallbackTimer = null;

        function tick() {
            const remaining = Math.max(0, Math.floor((new Date(turnExpiresAt) - Date.now()) / 1000));
            setSecondsLeft(remaining);
            if (remaining === 0 && !timeoutCalled) {
                timeoutCalled = true;
                if (isMyTurn) {
                    apiFetch(`/games/${gameId}/timeout`, { method: "POST" }).catch(err => {
                        // retry once if server clock is slightly behind the client
                        if (err.message?.includes("not expired")) {
                            setTimeout(() => apiFetch(`/games/${gameId}/timeout`, { method: "POST" }).catch(() => { }), TIMEOUT_RETRY_MS);
                        }
                    });
                } else if (isPlayer) {
                    // fallback: if the current player's client isn't responding, try after a delay
                    fallbackTimer = setTimeout(() => {
                        apiFetch(`/games/${gameId}/timeout`, { method: "POST" }).catch(() => { });
                    }, TIMEOUT_FALLBACK_MS);
                }
            }
        }

        tick();
        const id = setInterval(tick, 1000);
        return () => {
            clearInterval(id);
            clearTimeout(fallbackTimer);
            setSecondsLeft(null);
        };
    }, [turnExpiresAt, isMyTurn, isPlayer, gameId]);

    async function handleRoll() {
        setActionError(null);
        try {
            const state = await apiFetch(`/games/${gameId}/roll`, {
                method: "POST",
                body: JSON.stringify({ heldIndexes: [...heldDice] })
            });
            setServerState(state);
            onStateUpdateRef.current?.(state);
        } catch (err) {
            setActionError(err.message);
        }
    }

    async function handleBet(action) {
        setActionError(null);
        try {
            const state = await apiFetch(`/games/${gameId}/bets`, {
                method: "POST",
                body: JSON.stringify({ action, amount: Number(betAmount) || 1 })
            });
            setServerState(state);
            onStateUpdateRef.current?.(state);
        } catch (err) {
            setActionError(err.message);
        }
    }

    return (
        <div className={styles.wrapper}>
            {serverState?.playerStacks?.length > 0 && (
                <div className={styles.economyBar}>
                    <div className={styles.econPlayers}>
                        {serverState.playerStacks.map((entry, i) => (
                            <div key={entry.user} className={styles.econPlayer}>
                                <span className={styles.econLabel}>P{i + 1}</span>
                                <span className={styles.econStack}>{entry.stack}</span>
                            </div>
                        ))}
                    </div>
                    {phase === "betting" && (
                        <div className={styles.econBet}>
                            <span className={styles.econLabel}>Current Bet</span>
                            <span className={styles.econStack}>{serverState.bettingState?.currentBet ?? 0}</span>
                        </div>
                    )}
                </div>
            )}

            {serverState && (
                <div className={styles.phaseInfo}>
                    <span>Round {serverState.currentRound}</span>
                    <span className={styles.phase}>{phase}</span>
                    {secondsLeft !== null && (
                        <span className={secondsLeft <= 5 ? styles.timerLow : styles.timer}>
                            {secondsLeft}s
                        </span>
                    )}
                </div>
            )}
            {roundSummary && (
            <div className={styles.roundResult}>
                <strong>
                    {roundSummary.winners
                        .map(result => getPlayerName(serverState, result.outcome))
                        .join(" and ")} won!
                </strong>
                <span>{roundSummary.pointsWon} points gained</span>
                    
                {roundSummary.revealedHands.length > 0 && (
                    <div className={styles.hands}>
                        {roundSummary.revealedHands.map(result => {
                            const playerId = getId(result.player);
                            const isWinner = roundSummary.winners.some(winner => getId(winner.outcome) === playerId);
                        
                            return (
                                <div
                                    key={`${playerId}-${result.round}`}
                                    className={`${styles.handRow} ${isWinner ? styles.winningHand : ""}`}
                                >
                                    <span>{getPlayerName(serverState, result.player)}</span>
                                    <span>{evaluateHand(result.revealedRolls, serverState.variant?.rules)}</span>
                                    <span>{result.revealedRolls.join(" ")}</span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
            )}
            <game-board ref={boardRef} />

            {actionError && <p className={styles.error}>{actionError}</p>}

            {isPlayer && isMyTurn && phase === "rolling" && (
                <button className={styles.rollBtn} onClick={handleRoll}>
                    {rollsUsed === 0 ? "Roll Dice" : "Reroll"}
                </button>
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
                        {/* allow empty string while typing so users can clear and retype (e.g. "10") - clamp on blur */}
                        <input
                            type="number"
                            min={1}
                            max={serverState?.buyIn}
                            value={betAmount}
                            onChange={e => {
                                const raw = e.target.value;
                                if (raw === "") { setBetAmount(""); return; }
                                setBetAmount(Math.max(1, Math.min(serverState?.buyIn ?? 1, Number(raw))));
                            }}
                            onBlur={() => {
                                if (betAmount === "" || Number(betAmount) < 1) setBetAmount(1);
                            }}
                        />
                        <button onClick={() => handleBet(
                            serverState?.bettingState?.currentBet === 0 ? "bet" : "raise"
                        )}>{serverState?.bettingState?.currentBet === 0 ? "Bet" : "Raise"}</button>
                    </div>
                </div>
            )}

            {isPlayer && !isMyTurn && (phase === "rolling" || phase === "betting") && (
                <p className={styles.waiting}>Waiting for opponent...</p>
            )}
        </div>
    );
}
