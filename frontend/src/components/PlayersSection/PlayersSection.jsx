import { Link } from "react-router";
import { MdPeople } from "react-icons/md";
import { useAuth } from "@/contexts/AuthContext";
import { getAssetUrl } from "@/api";
import { DEFAULT_ELO } from "@/config/constants";
import styles from "./PlayersSection.module.css";

export default function PlayersSection({ game }) {
    const { user } = useAuth();
    const host = game.players[0];
    const opponent = game.players[1];

    return (
        <div className={styles.playersSection}>
            <div className={styles.playerItem}>
                <img
                    src={getAssetUrl(host?.profileImage)}
                    alt=""
                    className={styles.pAvatar}
                />
                <div className={styles.pInfo}>
                    <span className={styles.pLabel}>Host</span>
                    <Link to={`/users/${host?.username}`} className={styles.pName}>
                        {host?.username} {user?.username === host?.username && "(You)"}
                    </Link>
                    <span className={styles.pElo}>{host?.elo || DEFAULT_ELO} ELO</span>
                </div>
            </div>

            <div className={styles.vsDivider}>VS</div>

            <div className={styles.playerItem}>
                {opponent ? (
                    <>
                        <img
                            src={getAssetUrl(opponent.profileImage)}
                            alt=""
                            className={styles.pAvatar}
                        />
                        <div className={styles.pInfo}>
                            <span className={styles.pLabel}>Opponent</span>
                            <Link to={`/users/${opponent.username}`} className={styles.pName}>
                                {opponent.username}
                            </Link>
                            <span className={styles.pElo}>{opponent.elo || DEFAULT_ELO} ELO</span>
                        </div>
                    </>
                ) : (
                    <div className={styles.waitingSlot}>
                        <MdPeople className={styles.waitingIcon} />
                        <span>Waiting...</span>
                    </div>
                )}
            </div>
        </div>
    );
}
