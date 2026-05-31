import { Tournament } from "../models/tournament.model.js";
import { User } from "../models/user.model.js";

// Returns all tournaments, supports skip pagination and filtering by status/tournamentType/gameCategory
export async function getAllTournaments({ skip = 0, limit = 20, filter = {} } = {}) {
    return await Tournament.find(filter)
        .populate("players", "username elo")
        .populate("gameCategory", "name numOfRounds")
        .populate("trophy", "title image")
        .skip(skip)
        .limit(limit);
}

// Returns a small homepage-friendly list of upcoming tournaments
export async function getUpcomingTournaments(limit = 5) {
    return await Tournament.find({ status: "upcoming" })
        .populate("players", "username elo")
        .populate("gameCategory", "name numOfRounds")
        .populate("trophy", "title image")
        .sort({ startDate: 1, createdAt: -1 })
        .limit(limit);
}

// Gets a single Tournament by the id with full population
export async function getTournament(tid) {
    return await Tournament.findById(tid)
        .populate("players", "username elo")
        .populate("gameCategory", "name numOfRounds straightsAllowed timePerRound")
        .populate("trophy", "title image")
        .populate("winner", "username");
}

// Creates a new Tournament and saves it to the DB
export async function createTournament(data) {
    return await Tournament.create(data);
}

// Updates a Tournament by (tid), then returns the updated document
// If a winner is set and the tournament has a trophy, awards it to the winner's profile
export async function updateTournament(tid, data) {
    const tournament = await Tournament.findByIdAndUpdate(tid, data, { returnDocument: "after" });
    if (!tournament) return null;

    if (data.winner && tournament.trophy) {
        // Push the Trophy ObjectId - $addToSet prevents duplicates
        await User.findByIdAndUpdate(data.winner, {
            $addToSet: { trophies: tournament.trophy }
        });
    }

    return tournament;
}

// Adds a player to a tournament - validates ban, duplicate, capacity, and status
export async function joinTournament(tid, playerId) {
    const tournament = await Tournament.findById(tid);
    if (!tournament) return null;

    const user = await User.findById(playerId);
    if (!user) throw new Error("User not found");
    if (user.isBanned) throw new Error("Banned users cannot join tournaments");
    if (tournament.status !== "upcoming") throw new Error("Cannot join a tournament that has already started");
    if (tournament.players.some(p => p.toString() === playerId.toString())) throw new Error("Already joined this tournament");
    if (tournament.players.length >= tournament.maxParticipants) throw new Error("Tournament is full");

    tournament.players.push(playerId);
    if (tournament.tournamentType === "arena") {
        tournament.arenaScores.push({ participant: playerId, points: 0 });
    }
    await tournament.save();
    return await Tournament.findById(tid).populate("players", "username elo");
}

// Removes a player from a tournament - only allowed while status is upcoming
export async function leaveTournament(tid, playerId) {
    const tournament = await Tournament.findById(tid);
    if (!tournament) return null;
    if (tournament.status !== "upcoming") throw new Error("Cannot leave a tournament that has already started");
    if (!tournament.players.some(p => p.toString() === playerId.toString())) throw new Error("User is not in this tournament");

    tournament.players = tournament.players.filter(p => p.toString() !== playerId.toString());
    if (tournament.tournamentType === "arena") {
        tournament.arenaScores = tournament.arenaScores.filter(s => s.participant.toString() !== playerId.toString());
    }
    await tournament.save();
    return tournament;
}

// Returns tournament standings - arena: sorted arenaScores, knockout: rounds array
export async function getTournamentStandings(tid) {
    const tournament = await Tournament.findById(tid).populate("players", "username elo");
    if (!tournament) return null;

    if (tournament.tournamentType === "arena") {
        const usernameMap = Object.fromEntries(tournament.players.map(p => [p._id.toString(), p.username]));
        const standings = [...tournament.arenaScores]
            .sort((a, b) => b.points - a.points)
            .map((score, i) => ({
                rank: i + 1,
                userId: score.participant,
                username: usernameMap[score.participant.toString()] || null,
                points: score.points
            }));

        let timeRemainingSeconds = null;
        if (tournament.status === "ongoing" && tournament.startDate) {
            const elapsed = Date.now() - new Date(tournament.startDate).getTime();
            const total = tournament.durationMinutes * 60 * 1000;
            timeRemainingSeconds = Math.max(0, Math.round((total - elapsed) / 1000));
        }
        return { tournamentType: "arena", standings, timeRemainingSeconds };
    }

    return { tournamentType: "knockout", standings: tournament.rounds };
}

// Deletes a tournament - only pending/upcoming tournaments can be deleted
export async function deleteTournament(tid) {
    const tournament = await Tournament.findById(tid);
    if (!tournament) return null;
    if (tournament.status !== "upcoming") throw new Error("Cannot delete a tournament that has already started");
    return await Tournament.findByIdAndDelete(tid);
}

// Starts a tournament: shuffles players randomly, creates first-round pairings (bracket), sets status to ongoing
// Players with no opponent (odd count) get a bye: player2 is null
export async function startTournament(tid) {
    const tournament = await Tournament.findById(tid);
    if (!tournament) return null;

    // Fisher-Yates shuffle for random pairing
    const players = [...tournament.players];
    for (let i = players.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [players[i], players[j]] = [players[j], players[i]];
    }

    // Odd number of players: last one gets a bye (auto-advances without playing)
    const byePlayer = players.length % 2 !== 0 ? players[players.length - 1] : null;

    return await Tournament.findByIdAndUpdate(
        tid,
        {
            status: "ongoing",
            rounds: [{ roundNumber: 1, matches: [], byePlayer }]
        },
        { returnDocument: "after" }
    );
}

export default {
    getAllTournaments,
    getTournament,
    createTournament,
    updateTournament,
    joinTournament,
    leaveTournament,
    getTournamentStandings,
    deleteTournament,
    startTournament,
    getUpcomingTournaments
};