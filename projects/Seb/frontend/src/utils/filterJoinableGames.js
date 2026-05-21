export function filterJoinableGames(games, { isLoggedIn, user }) {
    const userId = user?._id || user?.id;
    const userElo = user?.eloRating;

    return games.filter((game) => {
        const player1Id = game?.player1?._id || game?.player1?.id || game?.player1;
        const player2Id = game?.player2?._id || game?.player2?.id || game?.player2;

        const isPending = game?.status === 'pending';
        const hasOpenSlot = !player2Id;
        const isAlreadyInGame =
            String(player1Id) === String(userId) ||
            String(player2Id) === String(userId);

        if (!isPending || !hasOpenSlot || isAlreadyInGame) {
            return false;
        }

        if (!isLoggedIn) {
            if (game?.visibility === 'private') return false;
            if (game?.allowAnonymousPlayers === false) return false;
            return true;
        }

        if (typeof userElo === 'number') {
            if (typeof game?.minElo === 'number' && userElo < game.minElo) {
                return false;
            }

            if (typeof game?.maxElo === 'number' && userElo > game.maxElo) {
                return false;
            }
        }

        return true;
    });
}