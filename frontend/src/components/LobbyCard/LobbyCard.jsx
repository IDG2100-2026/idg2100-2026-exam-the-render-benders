import { Link } from "react-router";
import { MdEmojiEvents, MdAccessTime, MdLayers, MdCheckCircle, MdCancel, MdPeople, MdAttachMoney } from "react-icons/md";
import { getAssetUrl } from "@/api";
import styles from "./LobbyCard.module.css";

// Shared card component used in both LobbySection and LobbyPage.
// onGuestJoin: called when an anonymous user clicks "Play as Guest" on an allowAnonymous game
export default function LobbyCard({ game, onJoin, onCardClick, onGuestJoin }) {
    const avgElo = Math.round(
        game.players.reduce((sum, p) => sum + (p.elo || 1000), 0) / (game.players.length || 1)
    );

    const cardClass = `${styles.card} ${onCardClick ? styles.clickable : ""}`.trim();

    // Use the first player (host) for the main avatar
    const host = game.players[0];

    return (
        <div
            className={cardClass}
            onClick={onCardClick ? () => onCardClick(game._id) : undefined}
        >
            {/* Player Avatar */}
            <div className={styles.avatarWrapper}>
                <img
                    src={getAssetUrl(host?.profileImage)}
                    alt={host?.username || "Player"}
                    className={styles.avatarImg}
                />
            </div>

            {/* Player names */}
            <div className={styles.players}>
                {game.players.map((p, i) => (
                    <span key={p.username || p}>
                        <Link
                            to={`/users/${p.username || p}`}
                            className={styles.playerLink}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {p.username || p}
                        </Link>
                        {i < game.players.length - 1 && ", "}
                    </span>
                ))}
            </div>

            {/* Variant info */}
            <div className={styles.variant}>
                <span><MdLayers /> {game.variant.rounds}r</span>
                <span><MdAccessTime /> {game.variant.timeControl}s</span>
                <span className={styles.rules}>
                    {game.variant.rules === "straights-allowed" ? (
                        <><MdCheckCircle /> Straights</>
                    ) : (
                        <><MdCancel /> No straights</>
                    )}
                </span>
                <span><MdPeople /> {game.players.length}/{game.numPlayers}</span>
                <span><MdAttachMoney /> {game.buyIn} pts</span>
            </div>

            {/* Avg Elo */}
            <span className={styles.elo}>
                <MdEmojiEvents /> {avgElo}
            </span>

            {onJoin && (
                <button
                    className={styles.joinButton}
                    onClick={(e) => { e.stopPropagation(); onJoin(game._id); }}
                >
                    Join
                </button>
            )}
            {onGuestJoin && (
                <button
                    className={styles.loginToJoin}
                    onClick={(e) => { e.stopPropagation(); onGuestJoin(game._id); }}
                >
                    Play as Guest
                </button>
            )}
        </div>
    );
}
