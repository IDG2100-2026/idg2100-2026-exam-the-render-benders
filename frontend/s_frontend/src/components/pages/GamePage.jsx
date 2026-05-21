import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { getGameById } from '@/services/gameService';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import GameBoard from '@/components/game/GameBoard';
import style from './styles/GamePage.module.css';

export default function GamePage() {
	const { gameId } = useParams();

	const [game, setGame] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState('');

	const fetchGame = useCallback(async () => {
		setError('');

		try {
			const data = await getGameById(gameId);
			setGame(data?.data || data);
		} catch (err) {
			setError(err?.message || 'Failed to load game.');
		} finally {
			setIsLoading(false);
		}
	}, [gameId]);

	useEffect(() => {
		fetchGame();
		const interval = setInterval(fetchGame, 15000);
		return () => clearInterval(interval);
	}, [fetchGame]);

	if (isLoading) {
		return (
			<div className={style['centered']}>
				<LoadingSpinner />
			</div>
		);
	}

	if (error) {
		return <ErrorMessage message={error} />;
	}

	return (
		<div className={style['gamePage']}>
			<div className={style['container']}>
				<GameBoard game={game} onRefresh={fetchGame} />
			</div>
		</div>
	);
}
