import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createGame, getAllGameCategories } from '@/services/gameService';
import { useAuth } from '@/hooks/useAuth';
import GameVariantSelector from '@/components/game/GameVariantSelector';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import style from './styles/CreateGamePage.module.css';

export default function CreateGamePage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const canSetAnonymousAccess =
        user?.userType === 'registered' || user?.userType === 'admin';
    const defaultDesiredOpponentElo = user?.eloRating ?? 1600;

    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        gameType: '',
        numOfRounds: 0,
        straightsAllowed: false,
        timePerRound: 0,
        visibility: 'public',
        allowAnonymousPlayers: true,
        desiredOpponentElo: defaultDesiredOpponentElo
    });

    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingCategories, setIsLoadingCategories] = useState(true);

    useEffect(() => {
        fetchCategories();
    }, []);

    async function fetchCategories() {
        setIsLoadingCategories(true);
        setError('');

        try {
            const data = await getAllGameCategories();
            setCategories(data);

            if (data.length > 0) {
                const defaultCategory = data[0];
                setFormData((prev) => ({
                    ...prev,
                    gameType: defaultCategory._id,
                    numOfRounds: defaultCategory.numOfRounds,
                    straightsAllowed: defaultCategory.straightsAllowed,
                    timePerRound: defaultCategory.timePerRound
                }));
            }
        } catch (err) {
            setError(err?.message || 'Failed to load game categories.');
        } finally {
            setIsLoadingCategories(false);
        }
    }

    function handleChange(event) {
        const { name, value } = event.target;
        const normalizedValue =
            name === 'straightsAllowed' || name === 'allowAnonymousPlayers'
                ? value === true || value === 'true'
                : name === 'numOfRounds' || name === 'timePerRound' || name === 'desiredOpponentElo'
                    ? Number(value)
                    : value;

        setFormData((prev) => {
            const nextFormData = {
                ...prev,
                [name]: normalizedValue
            };

            if (name === 'gameType') {
                const selectedCategory = categories.find(
                    (category) => category._id === normalizedValue
                );

                if (selectedCategory) {
                    nextFormData.numOfRounds = selectedCategory.numOfRounds;
                    nextFormData.straightsAllowed = selectedCategory.straightsAllowed;
                    nextFormData.timePerRound = selectedCategory.timePerRound;
                }

                return nextFormData;
            }

            if (['numOfRounds', 'straightsAllowed', 'timePerRound'].includes(name)) {
                const rankedCategories = [...categories].sort((categoryA, categoryB) => {
                    const scoreA =
                        Number(categoryA[name] === normalizedValue) * 4 +
                        Number(categoryA.numOfRounds === nextFormData.numOfRounds) +
                        Number(categoryA.straightsAllowed === nextFormData.straightsAllowed) +
                        Number(categoryA.timePerRound === nextFormData.timePerRound);
                    const scoreB =
                        Number(categoryB[name] === normalizedValue) * 4 +
                        Number(categoryB.numOfRounds === nextFormData.numOfRounds) +
                        Number(categoryB.straightsAllowed === nextFormData.straightsAllowed) +
                        Number(categoryB.timePerRound === nextFormData.timePerRound);

                    return scoreB - scoreA;
                });

                const matchedCategory = rankedCategories.find(
                    (category) => category[name] === normalizedValue
                );

                if (matchedCategory) {
                    nextFormData.gameType = matchedCategory._id;
                    nextFormData.numOfRounds = matchedCategory.numOfRounds;
                    nextFormData.straightsAllowed = matchedCategory.straightsAllowed;
                    nextFormData.timePerRound = matchedCategory.timePerRound;
                } else {
                    nextFormData.gameType = '';
                }
            }

            return nextFormData;
        });
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setError('');

        const userId = user?._id || user?.id;

        if (!userId) {
            setError('You must be logged in to create a game.');
            return;
        }

        if (!formData.gameType) {
            setError('Please select a valid game variant.');
            return;
        }

        setIsSubmitting(true);

        try {
            const desiredOpponentElo = Number(formData.desiredOpponentElo);
            const hasDesiredOpponentElo = Number.isFinite(desiredOpponentElo) && desiredOpponentElo > 0;
            const eloWindow = 150;

            const payload = {
                player1: userId,
                gameType: formData.gameType,
                visibility: formData.visibility,
                allowAnonymousPlayers: canSetAnonymousAccess
                    ? formData.allowAnonymousPlayers
                    : false,
                minElo: hasDesiredOpponentElo
                    ? Math.max(0, desiredOpponentElo - eloWindow)
                    : 0,
                maxElo: hasDesiredOpponentElo
                    ? desiredOpponentElo + eloWindow
                    : 3000
            };

            const createdGame = await createGame(payload, 'registered', userId);
            const createdGameId =
                createdGame?.data?._id || createdGame?._id || createdGame?.id;

            if (createdGameId) {
                navigate(`/games/${createdGameId}`);
                return;
            }

            navigate('/lobby');
        } catch (err) {
            setError(err?.message || 'Failed to create game.');
        } finally {
            setIsSubmitting(false);
        }
    }

    if (isLoadingCategories) {
        return <LoadingSpinner />;
    }

    return (
        <section className={style['createGamePage']}>
            <div className={style['header']}>
                <p className={style['eyebrow']}>Match Setup</p>
                <h1 className={style['title']}>Create Game</h1>
            </div>

            <div className={style['content']}>
                {error ? <ErrorMessage message={error} /> : null}

                <form className={style['form']} onSubmit={handleSubmit}>
                    <GameVariantSelector
                        formData={formData}
                        onChange={handleChange}
                        categories={categories}
                        showAnonymousOption={canSetAnonymousAccess}
                    />

                    <div className={style['actions']}>
                        <button
                            type='submit'
                            className={style['submitButton']}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Creating...' : 'Create Game'}
                        </button>
                    </div>
                </form>
            </div>
        </section>
    );
}
