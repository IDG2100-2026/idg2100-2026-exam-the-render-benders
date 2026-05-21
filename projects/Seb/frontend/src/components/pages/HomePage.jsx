import { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useFetch } from '@/hooks/useFetch';
import { useAppearance } from '@/hooks/useAppearance';
import { useAuth } from '@/hooks/useAuth';
import { getAllGames } from '@/services/gameService';
import { getPlatformStats } from '@/services/userService';
import { filterJoinableGames } from '@/utils/filterJoinableGames';
import GameList from '@/components/game/GameList';
import GameCard from '@/components/game/GameCard';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import style from './styles/HomePage.module.css';

const TOP_GAMES_COUNT = 5;

export default function HomePage() {
    const { lobbyCount } = useAppearance();
    const { user, isLoggedIn } = useAuth();

    const fetchAvailableGames = useCallback(() => {
        return getAllGames({
            status: 'pending',
            limit: 100
        });
    }, []);

    const fetchTopGames = useCallback(async () => {
        const ongoingGames = await getAllGames({
            status: 'ongoing',
            limit: TOP_GAMES_COUNT
        });

        if (ongoingGames.length >= TOP_GAMES_COUNT) {
            return ongoingGames;
        }

        const remainingCount = TOP_GAMES_COUNT - ongoingGames.length;

        const completedGames = await getAllGames({
            status: 'completed',
            limit: remainingCount
        });

        return [...ongoingGames, ...completedGames];
    }, []);

    const fetchPlatformStats = useCallback(() => {
        return getPlatformStats();
    }, []);

    const {
        data: gamesData,
        loading: gamesLoading,
        error: gamesError
    } = useFetch(fetchAvailableGames);

    const {
        data: topGamesData,
        loading: topGamesLoading,
        error: topGamesError
    } = useFetch(fetchTopGames);

    const {
        data: platformStatsResponse
    } = useFetch(fetchPlatformStats);

    const games = Array.isArray(gamesData) ? gamesData : [];
    const safeTopGamesData = Array.isArray(topGamesData) ? topGamesData : [];
    const platformStats = platformStatsResponse?.data || platformStatsResponse || {};

    const joinablePreviewGames = filterJoinableGames(games, {
        isLoggedIn,
        user
    }).slice(0, lobbyCount);

    const topGames = [...safeTopGamesData]
        .sort((a, b) => {
            const avgA = getAverageElo(a);
            const avgB = getAverageElo(b);
            return avgB - avgA;
        })
        .slice(0, TOP_GAMES_COUNT);

    function getAverageElo(game) {
        const ratings = [
            game?.player1?.eloRating,
            game?.player2?.eloRating
        ].filter((rating) => typeof rating === 'number');

        if (!ratings.length) return 0;

        return ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
    }

    return (
        <div className={style['home-page']}>
            <section className={style['hero']}>
                <h1 className={style['hero-title']}>Spanish Poker Dice</h1>
                <p className={style['hero-subtitle']}>
                    Join live matches, compete for rating, and follow the
                    strongest games on the platform.
                </p>
                <Link to="/create-game" className={style['hero-button']}>
                    Create New Game
                </Link>
            </section>

            <section className={style['home-section']}>
                <h2 className={style['section-title']}>Platform Activity</h2>

                <div className={style['activityOverview']}>
                    <div className={style['activityCard']}>
                        <strong className={style['activityValue']}>
                            {platformStats.totalUsers ?? 0}
                        </strong>
                        <span className={style['activityLabel']}>Users</span>
                    </div>

                    <div className={style['activityCard']}>
                        <strong className={style['activityValue']}>
                            {platformStats.totalMatches ?? 0}
                        </strong>
                        <span className={style['activityLabel']}>Matches</span>
                    </div>

                    <div className={style['activityCard']}>
                        <strong className={style['activityValue']}>
                            {platformStats.ongoingMatches ?? 0}
                        </strong>
                        <span className={style['activityLabel']}>Live Games</span>
                    </div>

                    <div className={style['activityCard']}>
                        <strong className={style['activityValue']}>
                            {platformStats.activeUsersThisWeek ?? 0}
                        </strong>
                        <span className={style['activityLabel']}>Active This Week</span>
                    </div>
                </div>
            </section>

            <section className={style['home-section']}>
                <h2 className={style['section-title']}>Available Games</h2>

                {gamesLoading ? (
                    <LoadingSpinner />
                ) : gamesError ? (
                    <ErrorMessage message={gamesError} />
                ) : joinablePreviewGames.length ? (
                    <GameList games={joinablePreviewGames} mode="lobby" />
                ) : (
                    <p className={style['no-data']}>
                        No available games right now.
                    </p>
                )}
            </section>

            <section className={style['home-section']}>
                <h2 className={style['section-title']}>Top Games</h2>

                {topGamesLoading ? (
                    <LoadingSpinner />
                ) : topGamesError ? (
                    <ErrorMessage message={topGamesError} />
                ) : topGames.length ? (
                    <div className={style['top-games-grid']}>
                        {topGames.map((game) => (
                            <GameCard key={game._id} game={game} />
                        ))}
                    </div>
                ) : (
                    <p className={style['no-data']}>
                        No ongoing or recent games right now.
                    </p>
                )}
            </section>
        </div>
    );
}