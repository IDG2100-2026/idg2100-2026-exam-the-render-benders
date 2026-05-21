import { Game } from "../models/game.model.js";
import { User } from "../models/user.model.js";

// K-factor determines how much ELO changes per game (32 is standard for beginners)
const K = 32;

// Calculates new ELO ratings for two players after a game
function calculateElo(players, winnerId, timeControl = 10) {
    const [playerA, playerB] = players;

    // Determine which Elo rating to use as base (defaulting to 1000 if not set)
    let eloField = "elo";
    if (timeControl === 3) eloField = "elo3s";
    else if (timeControl === 10) eloField = "elo10s";
    else if (timeControl === 30) eloField = "elo30s";

    const ratingA = playerA[eloField] || 1000;
    const ratingB = playerB[eloField] || 1000;

    // Expected scores based on current ratings (probability of winning)
    const expectedA = 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
    const expectedB = 1 / (1 + Math.pow(10, (ratingA - ratingB) / 400));

    // Check who won
    const playerAWon = playerA._id.equals(winnerId);

    return {
        newEloA: Math.round(ratingA + K * ((playerAWon ? 1 : 0) - expectedA)),
        newEloB: Math.round(ratingB + K * ((playerAWon ? 0 : 1) - expectedB)),
        eloField
    };
}

// Returns all games from the database, supports pagination and advanced filtering
export async function getAllGames({ page = 1, limit = 20, filter = {}, requestingUser = null } = {}) {
    const query = { ...filter };

    // If a user ID is provided, exclude games they are already participating in
    if (requestingUser?.id) {
        query.players = { $ne: requestingUser.id };

        // For regular users, also filter by Elo (+/- 200) if it's a lobby/waiting query
        if (requestingUser.type === "user" && query.status === "waiting") {
            const user = await User.findById(requestingUser.id);
            if (user) {
                // Find games where (desiredElo - 200) <= user.elo <= (desiredElo + 200)
                // We use $expr to compare fields within the document
                query.$or = [
                    { desiredElo: { $exists: false } },
                    { 
                        $and: [
                            { desiredElo: { $lte: user.elo + 200 } },
                            { desiredElo: { $gte: user.elo - 200 } }
                        ]
                    }
                ];
            }
        }
    } else if (query.status === "waiting") {
        // For anonymous users, only show games that explicitly allow them
        query.allowAnonymous = true;
    }

    return await Game.find(query)
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("players", "username elo elo3s elo10s elo30s profileImage")
        .populate("result.winner", "username");
}

// Fetches the top 5 games based on the highest average Elo rating of participating players
// If there are fewer than 5 ongoing games, it fills the list with the most recent finished games
export async function getTopGames() {
    // fetches all ongoing games and populate player info
    let ongoingGames = await Game.find({ status: "ongoing" })
        .populate("players", "username elo elo3s elo10s elo30s profileImage");

    // Sorts them by average Elo rating (descending order)
    ongoingGames.sort((a, b) => {
        const avgA = a.players.reduce((sum, p) => sum + (p.elo || 1000), 0) / (a.players.length || 1);
        const avgB = b.players.reduce((sum, p) => sum + (p.elo || 1000), 0) / (b.players.length || 1);
        return avgB - avgA;
    });

    // Keep the top 5
    let result = ongoingGames.slice(0, 5);

    // If we need more to reach 5, fetch the latest finished games
    if (result.length < 5) {
        const needed = 5 - result.length;
        const finishedGames = await Game.find({ status: "finished" })
            .sort({ createdAt: -1 }) // newest first
            .limit(needed)
            .populate("players", "username elo elo3s elo10s elo30s profileImage")
            .populate("result.winner", "username");
        
        result = [...result, ...finishedGames];
    }

    return result;
}

// Gets a single game by the id
export async function getGame(gid) {
    return await Game.findById(gid)
        .populate("players", "username elo elo3s elo10s elo30s profileImage")
        .populate("result.winner", "username");
}

// Adds player to an existing game. Sets status to "ongoing" when 2 players have joined.
export async function joinGame(gid, playerId, requestingUser = null) {
    const game = await Game.findById(gid);
    if (!game) return null;

    // Anonymous users can only join games that explicitly allow them
    if (requestingUser?.type === "anonymous" && !game.allowAnonymous) {
        throw new Error("This game does not allow anonymous players");
    }

    await Game.findByIdAndUpdate(gid, { $addToSet: { players: playerId } });

    const updated = await Game.findById(gid)
        .populate("players", "username elo elo3s elo10s elo30s profileImage");

    if (updated && updated.players.length >= 2 && updated.status === "waiting") {
        updated.status = "ongoing";
        await updated.save();
    }

    return updated;
}

// Creates a new game, saves it to the database
export async function createGame(data) {
    return await Game.create(data);
}

// Updates a game by ID (gid), then returns the updated document
// If the game just became finished and has a winner, updates both players' ELO ratings
export async function updateGame(gid, data) {
    // Fetch the current game first so we can check if it was already finished
    const oldGame = await Game.findById(gid);
    if (!oldGame) return null;

    const game = await Game.findByIdAndUpdate(gid, data, { returnDocument: "after" });

    // Only update ELO, wins, and gamesPlayed on the transition to finished (not on repeat calls, not for anonymous games)
    if (!game.isAnonymous && oldGame.status !== "finished" && game.status === "finished" && game.result?.winner) {
        const players = await User.find({ _id: { $in: game.players } });
        
        // Calculate new Elo for the specific time control variant
        const { newEloA, newEloB, eloField } = calculateElo(players, game.result.winner, game.variant.timeControl);
        
        // We also update the general Elo for the leaderboard (average change)
        const diffA = newEloA - (players[0][eloField] || 1000);
        const diffB = newEloB - (players[1][eloField] || 1000);
        const generalEloA = players[0].elo + diffA;
        const generalEloB = players[1].elo + diffB;

        const playerAWon = players[0]._id.equals(game.result.winner);

        await User.findByIdAndUpdate(players[0]._id, {
            $set: { [eloField]: newEloA, elo: generalEloA },
            $inc: { gamesPlayed: 1, wins: playerAWon ? 1 : 0 },
            $push: { eloHistory: { elo: generalEloA, date: new Date() } }
        });
        await User.findByIdAndUpdate(players[1]._id, {
            $set: { [eloField]: newEloB, elo: generalEloB },
            $inc: { gamesPlayed: 1, wins: playerAWon ? 0 : 1 },
            $push: { eloHistory: { elo: generalEloB, date: new Date() } }
        });
    }

    return game;
}

export default {
    getAllGames,
    getTopGames,
    getGame,
    joinGame,
    createGame,
    updateGame
};