import { useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useFetch } from '@/hooks/useFetch';
import { getUserMatches, getUser } from '@/services/userService';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import GameList from '@/components/game/GameList';
import style from './styles/UserGamesPage.module.css';

export default function UserGamesPage() {
    const { userId } = useParams();

    const fetchUser = useCallback(() => getUser(userId), [userId]);
    const fetchGames = useCallback(() => getUserMatches(userId), [userId]);

    const { data: userResponse, loading: userLoading, error: userError } = useFetch(fetchUser);
    const { data: gamesResponse, loading: gamesLoading, error: gamesError } = useFetch(fetchGames);

    const user = userResponse?.data || userResponse;
    const games = gamesResponse?.data || [];

    if (userLoading || gamesLoading) {
        return <LoadingSpinner />;
    }

    if (userError || gamesError) {
        return <ErrorMessage message={userError || gamesError} />;
    }

    return (
        <div className={style['userGamesPage']}>
            <div className={style['header']}>
                <p className={style['eyebrow']}>Match History</p>
                <h1 className={style['title']}>
                    {user?.username || 'User'} — All Games
                </h1>
            </div>

            {games.length ? (
                <GameList games={games} />
            ) : (
                <p className={style['emptyState']}>No games found.</p>
            )}
        </div>
    );
}