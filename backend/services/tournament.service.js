import { Tournament } from "../models/tournament.model.js";
import { User } from "../models/user.model.js";

// Returns all the Tournaments from the DB, supports pagination and filtering by status
export async function getAllTournaments({ page = 1, limit = 20, filter = {} } = {}) {
    return await Tournament.find(filter).skip((page - 1) * limit).limit(limit);
}

// Gets a single Tournament by the id
export async function getTournament(tid) {
    return await Tournament.findById(tid);
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
        // $addToSet prevents duplicate trophies if winner is set more than once
        await User.findByIdAndUpdate(data.winner, {
            $addToSet: { trophies: { title: tournament.name, image: tournament.trophy } }
        });
    }

    return tournament;
}

// Adds a player to a tournament's players array, $addToSet prevents duplicates
export async function joinTournament(tid, playerId) {
    return await Tournament.findByIdAndUpdate(
        tid,
        { $addToSet: { players: playerId } },
        { returnDocument: "after" }
    );
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

    // Create pairs from the shuffled list; last player gets null opponent (bye) if odd count
    const bracket = [];
    for (let i = 0; i < players.length; i += 2) {
        bracket.push({
            player1: players[i],
            player2: players[i + 1] || null
        });
    }

    return await Tournament.findByIdAndUpdate(
        tid,
        { bracket, status: "ongoing" },
        { returnDocument: "after" }
    );
}

export default {
    getAllTournaments,
    getTournament,
    createTournament,
    updateTournament,
    joinTournament,
    startTournament
};