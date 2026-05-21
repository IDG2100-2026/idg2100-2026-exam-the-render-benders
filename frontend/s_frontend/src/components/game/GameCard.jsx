import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { joinGame } from '@/services/gameService';
import { useAuth } from '@/hooks/useAuth';
import style from './styles/GameCard.module.css';

function formatPlayerName(player, fallback = 'Open Slot') {
    if (!player) return fallback;
    return player.username || player.displayName || player.name || fallback;
}

function getAverageElo(player1, player2) {
    const ratings = [player1?.eloRating, player2?.eloRating].filter(
        (rating) => typeof rating === 'number'
    );

    if (!ratings.length) return 'N/A';

    return Math.round(
        ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
    );
}

export default function GameCard({ game, mode = 'default' }) {
    const { user, isLoggedIn } = useAuth();
    const navigate = useNavigate();
    const [isJoining, setIsJoining] = useState(false);

    if (!game) return null;

    const { _id, gameType, status, visibility, player1, player2 } = game;

    const userId = user?._id || user?.id;
    const player1Id = player1?._id || player1?.id;
    const player2Id = player2?._id || player2?.id;

    const isPlayer =
        String(player1Id) === String(userId) ||
        String(player2Id) === String(userId);

    const canJoin = isLoggedIn && status === 'pending' && !player2Id && !isPlayer;

    const playersJoined = [player1, player2].filter(Boolean).length;
    const averageElo = getAverageElo(player1, player2);

    async function handlePrimaryAction() {
        if (canJoin) {
            try {
                setIsJoining(true);
                await joinGame(_id, 'registered', userId);
                navigate(`/games/${_id}`);
                return;
            } catch {
                navigate(`/games/${_id}`);
                return;
            } finally {
                setIsJoining(false);
            }
        }

        navigate(`/games/${_id}`);
    }

    const actionLabel = canJoin ? (isJoining ? 'Joining...' : 'Join Game') : isPlayer ? 'Open Game' : mode === 'lobby' ? 'View Game' : 'View Game';

    return (
        <article className={style['gameCard']}>
            <div className={style['cardTop']}>
                <div>
                    <p className={style['gameType']}> {gameType?.name || 'Match'}</p>
                    <h3 className={style['gameTitle']}>Spanish Poker Dice</h3>
                </div>

                <span className={style['status']}> {status || 'unknown'}</span>
            </div>

            <div className={style['metaRow']}>
                <span>{visibility || 'public'}</span>
                <span>{playersJoined}/2 players</span>
                <span>Avg ELO: {averageElo}</span>
            </div>

            <div className={style['settingsRow']}>
                <span>Rounds: {gameType?.numOfRounds ?? '—'}</span>
                <span> Straights: {gameType?.straightsAllowed ? 'On' : 'Off'}</span>
                <span>Time: {gameType?.timePerRound ?? '—'}s</span>
            </div>

            <div className={style['playerSection']}>
                <div className={style['playerBlock']}>
                    <span className={style['label']}>Player 1</span>
                    <span className={style['value']}>
                        {formatPlayerName(player1)}
                    </span>
                </div>

                <div className={style['playerBlock']}>
                    <span className={style['label']}>Player 2</span>
                    <span className={style['value']}>
                        {formatPlayerName(player2)}
                    </span>
                </div>
            </div>

            {mode === 'lobby' && (
                <p className={style['cardHint']}>
                    {canJoin ? 'Available to join now.' : isPlayer ? 'You are already part of this game.' : !isLoggedIn ? 'Log in to join games directly.' : 'Open to preview details.'}
                </p>
            )}

            <button type='button' className={style['gameLink']} onClick={handlePrimaryAction} disabled={isJoining}> {actionLabel}</button>
        </article>
    );
}