import { useCallback, useMemo } from 'react';
import { getAllGames } from '@/services/gameService';
import { useFetch } from '@/hooks/useFetch';
import { useAuth } from '@/hooks/useAuth';
import { filterJoinableGames } from '@/utils/filterJoinableGames';
import GameList from '@/components/game/GameList';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import style from './styles/LobbyPage.module.css';

export default function LobbyPage() {
    const { user, isLoggedIn } = useAuth();

    const fetchGames = useCallback(() => {
        return getAllGames({
            status: 'pending',
            limit: 100
        });
    }, []);

    const {
        data: gamesData,
        loading: isLoading,
        error
    } = useFetch(fetchGames);

    const joinableGames = useMemo(() => {
        const games = Array.isArray(gamesData) ? gamesData : [];

        return filterJoinableGames(games, {
            isLoggedIn,
            user
        });
    }, [gamesData, isLoggedIn, user]);

    return (
        <section className={style['lobbyPage']}>
            <div className={style['header']}>
                <p className={style['eyebrow']}>Matchmaking</p>
                <h1 className={style['title']}>Lobby</h1>
                <p className={style['description']}>
                    Browse games that are currently available for you to join.
                </p>
            </div>

            <div className={style['content']}>
                {isLoading ? (
                    <div className={style['centered']}>
                        <LoadingSpinner />
                    </div>
                ) : error ? (
                    <ErrorMessage message={error} />
                ) : joinableGames.length ? (
                    <GameList games={joinableGames} mode='lobby' />
                ) : (
                    <p className={style['description']}>
                        No joinable games are available right now.
                    </p>
                )}
            </div>
        </section>
    );
}