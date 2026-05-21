import { useCallback, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useFetch } from '@/hooks/useFetch';
import { getUser, getUserStats, getUserRecentGames, getUserTrophies, updateUser } from '@/services/userService';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import style from './styles/ProfilePage.module.css';

export default function ProfilePage() {
    const { userId } = useParams();
    const { user, updateCurrentUser } = useAuth();

    const isOwnProfile = (user?._id || user?.id) === userId;

    const fetchUser = useCallback(() => getUser(userId), [userId]);
    const fetchStats = useCallback(() => getUserStats(userId), [userId]);
    const fetchGames = useCallback(() => getUserRecentGames(userId), [userId]);
    const fetchTrophies = useCallback(() => getUserTrophies(userId), [userId]);

    const { data: userResponse, loading: userLoading, error: userError } = useFetch(fetchUser);
    const { data: statsResponse } = useFetch(fetchStats);
    const { data: gamesResponse } = useFetch(fetchGames);
    const { data: trophiesResponse } = useFetch(fetchTrophies);

    const userInfo = userResponse?.data || userResponse;
    const stats = statsResponse?.data || {};
    const games = gamesResponse?.data || [];
    const trophies = trophiesResponse?.data || [];

    const [formData, setFormData] = useState({
        email: '',
        about: '',
        profileImage: '',
        password: ''
    });
    const [saveError, setSaveError] = useState('');
    const [saveSuccess, setSaveSuccess] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (!userInfo) return;

        setFormData({
            email: userInfo.email || '',
            about: userInfo.about || '',
            profileImage: userInfo.profileImage || '',
            password: ''
        });
    }, [userInfo]);

    function handleChange(event) {
        const { name, value } = event.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    }

    async function handleSave(event) {
        event.preventDefault();
        setSaveError('');
        setSaveSuccess('');

        if (!isOwnProfile) return;

        setIsSaving(true);

        try {
            const payload = {
                email: formData.email,
                about: formData.about,
                profileImage: formData.profileImage
            };

            if (formData.password.trim()) {
                payload.password = formData.password;
            }

            const response = await updateUser(userId, payload, 'registered');
            const updatedUser = response?.data || response;

            setFormData((prev) => ({
                ...prev,
                password: ''
            }));

            if ((user?._id || user?.id) === userId) {
                updateCurrentUser?.(updatedUser);
            }

            setSaveSuccess('Profile updated successfully.');
        } catch (err) {
            setSaveError(err?.message || 'Failed to update profile.');
        } finally {
            setIsSaving(false);
        }
    }

    if (userLoading) {
        return <LoadingSpinner />;
    }

    if (userError || !userInfo) {
        return <ErrorMessage message={userError || 'User not found'} />;
    }

    const eloRatings = userInfo.eloRatings || {};

    return (
        <div className={style['profilePage']}>
            <section className={style['heroCard']}>
                <div className={style['avatarBlock']}>
                    {userInfo.profileImage ? (
                        <img
                            src={userInfo.profileImage}
                            alt={`${userInfo.username} profile`}
                            className={style['avatar']}
                        />
                    ) : (
                        <div className={style['avatarPlaceholder']}>
                            {userInfo.username?.slice(0, 1).toUpperCase()}
                        </div>
                    )}
                </div>

                <div className={style['heroInfo']}>
                    <p className={style['eyebrow']}>User Profile</p>
                    <h1 className={style['username']}>{userInfo.username}</h1>
                    <p className={style['meta']}>Account type: {userInfo.userType}</p>
                    <p className={style['meta']}>Main Elo: {stats.eloRating ?? userInfo.eloRating ?? '-'}</p>
                </div>
            </section>

            <div className={style['grid']}>
                <section className={style['panel']}>
                    <h2 className={style['sectionTitle']}>Profile Details</h2>

                    <div className={style['readOnlyRow']}>
                        <span className={style['label']}>Username</span>
                        <span className={style['value']}>{userInfo.username}</span>
                    </div>

                    {isOwnProfile ? (
                        <form className={style['form']} onSubmit={handleSave}>
                            {saveError ? <ErrorMessage message={saveError} /> : null}
                            {saveSuccess ? <p className={style['success']}>{saveSuccess}</p> : null}

                            <div className={style['fieldGroup']}>
                                <label className={style['label']} htmlFor='profileImage'>
                                    Profile Image URL
                                </label>
                                <input
                                    id='profileImage'
                                    name='profileImage'
                                    type='text'
                                    value={formData.profileImage}
                                    onChange={handleChange}
                                    className={style['input']}
                                    placeholder='https://...'
                                />
                            </div>

                            <div className={style['fieldGroup']}>
                                <label className={style['label']} htmlFor='email'>
                                    Email
                                </label>
                                <input
                                    id='email'
                                    name='email'
                                    type='email'
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={style['input']}
                                    placeholder='name@example.com'
                                />
                            </div>

                            <div className={style['fieldGroup']}>
                                <label className={style['label']} htmlFor='about'>
                                    About Me
                                </label>
                                <textarea
                                    id='about'
                                    name='about'
                                    value={formData.about}
                                    onChange={handleChange}
                                    className={style['textarea']}
                                    rows={5}
                                    placeholder='Tell others a bit about yourself...'
                                />
                            </div>

                            <div className={style['fieldGroup']}>
                                <label className={style['label']} htmlFor='password'>
                                    New Password
                                </label>
                                <input
                                    id='password'
                                    name='password'
                                    type='password'
                                    value={formData.password}
                                    onChange={handleChange}
                                    className={style['input']}
                                    placeholder='Leave blank to keep current password'
                                />
                            </div>

                            <button
                                type='submit'
                                className={style['saveButton']}
                                disabled={isSaving}
                            >
                                {isSaving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </form>
                    ) : (
                        <div className={style['infoList']}>
                            <div className={style['readOnlyRow']}>
                                <span className={style['label']}>About</span>
                                <span className={style['value']}>
                                    {userInfo.about || 'No description yet.'}
                                </span>
                            </div>
                        </div>
                    )}
                </section>

                <section className={style['panel']}>
                    <h2 className={style['sectionTitle']}>Stats</h2>

                    <div className={style['statsGrid']}>
                        <div className={style['statCard']}>
                            <span className={style['statLabel']}>Games Played </span>
                            <span className={style['statValue']}>{stats.totalMatches ?? 0}</span>
                        </div>
                        <div className={style['statCard']}>
                            <span className={style['statLabel']}>Wins Last Month </span>
                            <span className={style['statValue']}>{stats.winsLastMonth ?? stats.wins ?? 0}</span>
                        </div>
                        <div className={style['statCard']}>
                            <span className={style['statLabel']}>Losses Last Month </span>
                            <span className={style['statValue']}>{stats.lossesLastMonth ?? stats.losses ?? 0}</span>
                        </div>
                        <div className={style['statCard']}>
                            <span className={style['statLabel']}>Win Rate </span>
                            <span className={style['statValue']}>{stats.winPercentage ?? '0%'}</span>
                        </div>
                    </div>

                    <div className={style['eloSection']}>
                        <h3 className={style['subTitle']}>Elo by Time Control</h3>
                        <div className={style['statsGrid']}>
                            <div className={style['statCard']}>
                                <span className={style['statLabel']}>Total Wins </span>
                                <span className={style['statValue']}>{stats.wins ?? 0}</span>
                            </div>
                            <div className={style['statCard']}>
                                <span className={style['statLabel']}>Total Losses </span>
                                <span className={style['statValue']}>{stats.losses ?? 0}</span>
                            </div>
                            <div className={style['statCard']}>
                                <span className={style['statLabel']}>Blitz </span>
                                <span className={style['statValue']}>{eloRatings.blitz ?? '-'}</span>
                            </div>
                            <div className={style['statCard']}>
                                <span className={style['statLabel']}>Rapid </span>
                                <span className={style['statValue']}>{eloRatings.rapid ?? '-'}</span>
                            </div>
                            <div className={style['statCard']}>
                                <span className={style['statLabel']}>Classical </span>
                                <span className={style['statValue']}>{eloRatings.classical ?? '-'}</span>
                            </div>
                            <div className={style['statCard']}>
                                <span className={style['statLabel']}>Weekly Change </span>
                                <span className={style['statValue']}>{stats.eloRatingChange ?? '-'}</span>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            <div className={style['grid']}>
                <section className={style['panel']}>
                    <h2 className={style['sectionTitle']}>Trophies & Awards</h2>
                    {trophies.length ? (
                        <div className={style['trophyGrid']}>
                            {trophies.map((trophy) => (
                                <div key={trophy._id} className={style['trophyCard']}>
                                    {trophy.imageUrl ? (
                                        <img
                                            src={trophy.imageUrl}
                                            alt={trophy.title}
                                            className={style['trophyImage']}
                                        />
                                    ) : null}
                                    <p className={style['trophyTitle']}>{trophy.title}</p>
                                    <p className={style['trophyMeta']}>
                                        {trophy.tournament?.title || 'Award'}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className={style['emptyState']}>No trophies yet.</p>
                    )}
                </section>

                <section className={style['panel']}>
                    <h2 className={style['sectionTitle']}>Last 10 Games</h2>
                    <Link to={`/profile/${userId}/games`} className={style['viewAllLink']}>
                        View all games
                    </Link>
                    {games.length ? (
                        <div className={style['gameList']}>
                            {games.map((game) => (
                                <div key={game._id} className={style['gameRow']}>
                                    <div>
                                        <p className={style['gameTitle']}>
                                            {game.player1?.username || 'Unknown'} vs {game.player2?.username || 'Open Slot'}
                                        </p>
                                        <p className={style['gameMeta']}>
                                            {game.gameType?.name || 'Match'} • {game.status}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className={style['emptyState']}>No recent games.</p>
                    )}
                </section>
            </div>
        </div>
    );
}
