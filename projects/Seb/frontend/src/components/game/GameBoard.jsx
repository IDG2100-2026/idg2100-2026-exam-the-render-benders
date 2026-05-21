import { useState } from "react";
import { joinGame } from "@/services/gameService";
import { useAuth } from "@/hooks/useAuth";
import CommentSection from "@/components/comments/CommentSection";
import style from "./styles/GameBoard.module.css";

function formatPlayer(player) {
    if (!player) return "Open Slot";
    return player.username || player.displayName || player.name || "Unknown";
}

function formatElo(player) {
    if (!player || typeof player.eloRating !== "number") {
        return "Elo unavailable";
    }

    return `Elo ${player.eloRating}`;
}

export default function GameBoard({ game, onRefresh }) {
    const { user } = useAuth();
    const [isJoining, setIsJoining] = useState(false);
    const [error, setError] = useState("");

    if (!game) return null;

    const {
        _id,
        gameType,
        status,
        player1,
        player2
    } = game;

    const userId = user?._id || user?.id;
    const playersJoined = [player1, player2].filter(Boolean).length;
    const isJoinable = status === "pending" && playersJoined < 2;
    const isWaitingForPlayers = status === "pending" && playersJoined < 2;

    async function handleJoin() {
        if (!userId) {
            setError("You must be logged in to join.");
            return;
        }

        setIsJoining(true);
        setError("");

        try {
            await joinGame(_id, "registered", userId);
            await onRefresh?.();
        } catch (err) {
            setError(err?.message || "Failed to join game.");
        } finally {
            setIsJoining(false);
        }
    }

    return (
        <section className={style["gameBoard"]}>
            <div className={style["topSection"]}>
                <div className={style["gameInfo"]}>
                    <p className={style["gameType"]}>
                        {gameType?.name || "Match"}
                    </p>

                    <h1 className={style["title"]}>
                        Spanish Poker Dice
                    </h1>

                    <p className={style["status"]}>
                        Status: {status}
                    </p>
                </div>

                {isJoinable ? (
                    <button
                        className={style["joinButton"]}
                        onClick={handleJoin}
                        disabled={isJoining}
                    >
                        {isJoining ? "Joining..." : "Join Game"}
                    </button>
                ) : null}
            </div>

            {error ? (
                <p className={style["error"]}>{error}</p>
            ) : null}

            <div className={style["contentGrid"]}>
                <div className={style["mainColumn"]}>
                    <div className={style["playerSection"]}>
                        <div className={style["playerCard"]}>
                            <p className={style["label"]}>Player 1</p>
                            <p className={style["value"]}>
                                {formatPlayer(player1)}
                            </p>
                            <p className={style["meta"]}>{formatElo(player1)}</p>
                        </div>

                        <div className={style["playerCard"]}>
                            <p className={style["label"]}>Player 2</p>
                            <p className={style["value"]}>
                                {formatPlayer(player2)}
                            </p>
                            <p className={style["meta"]}>{formatElo(player2)}</p>
                        </div>
                    </div>

                    <div className={style["boardShell"]}>
                        <div className={style["boardHeader"]}>
                            <h2 className={style["boardTitle"]}>Game Board</h2>
                            <div className={style["settingsSection"]}>
                                <p>Rounds: {gameType?.numOfRounds ?? "-"}</p>
                                <p>Time: {gameType?.timePerRound ?? "-"}s</p>
                                <p>
                                    Straights: {gameType?.straightsAllowed ? "On" : "Off"}
                                </p>
                            </div>
                        </div>

                        <div className={style["boardStage"]}>
                            <div className={style["boardArena"]}>
                                <p className={style["boardEyebrow"]}>Reserved Gameplay Area</p>
                                <p className={style["boardCopy"]}>
                                    Dice actions and live round interactions are not implemented
                                    in this sprint, but this is where active gameplay would appear.
                                </p>
                            </div>

                            {isWaitingForPlayers ? (
                                <div className={style["boardOverlay"]}>
                                    <p className={style["overlayTitle"]}>
                                        Waiting for other players
                                    </p>
                                    <p className={style["overlayCopy"]}>
                                        This match will start when another player joins.
                                    </p>
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>

                <aside className={style["commentSidebar"]}>
                    <CommentSection gameId={_id} />
                </aside>
            </div>
        </section>
    );
}
