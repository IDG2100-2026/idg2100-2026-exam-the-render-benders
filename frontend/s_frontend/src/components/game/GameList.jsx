import GameCard from './GameCard';
import style from './styles/GameList.module.css';

export default function GameList({ games = [], mode = 'default' }) {
    if (!games.length) {
        return null;
    }

    return (
        <div className={style['gameList']}>
            {games.map((game) => (
                <GameCard key={game._id} game={game} mode={mode} />
            ))}
        </div>
    );
}