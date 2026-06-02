import { Link } from "react-router";
import { MdPeople } from "react-icons/md";
import { getAssetUrl } from "@/api";
import { useAuth } from "@/contexts/AuthContext";
import { DEFAULT_ELO } from "@/config/constants";
import styles from "./PlayersSection.module.css";

export default function PlayersSection({ game, boardColor }) {
    const { user } = useAuth();
    const maxPlayers = game.variant?.numPlayers ?? game.numPlayers ?? Math.max(game.players.length, 2);
    const playerSlots = Array.from({ length: maxPlayers }, (_, index) => game.players[index] ?? null);

    return (
        <div
            className={styles.playersSection}
            style={{ "--player-count": maxPlayers, "--board-color": boardColor }}
        >
            {playerSlots.map((player, index) => {
                const isCurrentUser = player?._id === user?._id || player?.username === user?.username;

                return (
                    <div
                        className={`${styles.playerItem} ${isCurrentUser ? styles.currentUser : ""}`}
                        key={player?._id ?? `empty-${index}`}
                    >
                        <span className={styles.pNumber}>{index + 1}</span>

                        {player ? (
                            <Link to={`/users/${player.username}`} className={styles.pLink}>
                                <img
                                    src={getAssetUrl(player.profileImage)}
                                    alt=""
                                    className={styles.pAvatar}
                                />
                                <span className={styles.pElo}>
                                    {player.elo || DEFAULT_ELO} ELO
                                </span>
                            </Link>
                        ) : (
                            <div className={styles.waitingSlot}>
                                <MdPeople className={styles.waitingIcon} />
                                <span>Waiting</span>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
