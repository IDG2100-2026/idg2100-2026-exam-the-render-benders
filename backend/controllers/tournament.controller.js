import tournamentService from "../services/tournament.service.js";
import { sendError, statusFromMessage } from "../utils/controllerHelpers.js";


// Get all Tournaments from the database and return them as JSON
// Supports filtering by status: ?status=upcoming, ?status=ongoing or ?status=finished
export async function getAllTournaments(req, res) {
    try {
        const skip = parseInt(req.query.skip) || 0;
        const limit = parseInt(req.query.limit) || 20;
        const filter = {};
        if (req.query.status) filter.status = req.query.status;
        if (req.query.tournamentType) filter.tournamentType = req.query.tournamentType;
        if (req.query.gameCategory) filter.gameCategory = req.query.gameCategory;
        const tournaments = await tournamentService.getAllTournaments({ skip, limit, filter });
        res.status(200).json(tournaments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// Get 5 upcoming tournaments for homepage previews
export async function getUpcomingTournaments(req, res) {
    try {
        const limit = parseInt(req.query.limit) || 5;
        const tournaments = await tournamentService.getUpcomingTournaments(limit);
        res.status(200).json(tournaments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// Get a Tournament from DB and return the Tournament as JSON
export async function getTournament(req, res) {
    try {
        const tournament = await tournamentService.getTournament(req.params.tid);
        if (!tournament) return res.status(404).json({ error: "Tournament not found" });
        res.status(200).json(tournament);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// Create a new Tournament and return it as JSON
export async function createTournament(req, res) {
    try {
        const tournament = await tournamentService.createTournament(req.body);
        res.status(201).json(tournament);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

export async function updateTournament(req, res) {
    try {
        const tournament = await tournamentService.updateTournament(req.params.tid, req.body);
        if (!tournament) return res.status(404).json({ error: "Tournament not found" });
        res.status(200).json(tournament);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

export async function joinTournament(req, res) {
    try {
        const tournament = await tournamentService.joinTournament(req.params.tid, req.body.player);
        if (!tournament) return res.status(404).json({ error: "Tournament not found" });
        res.status(200).json(tournament);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

export async function startTournament(req, res) {
    try {
        const tournament = await tournamentService.startTournament(req.params.tid);
        if (!tournament) return res.status(404).json({ error: "Tournament not found" });
        res.status(200).json(tournament);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

export async function leaveTournament(req, res) {
    try {
        const tournament = await tournamentService.leaveTournament(req.params.tid, req.body.player);
        if (!tournament) return res.status(404).json({ error: "Tournament not found" });
        res.status(200).json(tournament);
    } catch (err) {
        const status = statusFromMessage(err.message, [
            { text: "already started", status: 403 },
            { text: "not in", status: 404}
        ]);
        sendError(res, err, status);
    }
}

export async function getTournamentStandings(req, res) {
    try {
        const standings = await tournamentService.getTournamentStandings(req.params.tid);
        if (!standings) return res.status(404).json({ error: "Tournament not found" });
        res.status(200).json(standings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

export async function deleteTournament(req, res) {
    try {
        const tournament = await tournamentService.deleteTournament(req.params.tid);
        if (!tournament) return res.status(404).json({ error: "Tournament not found" });
        res.status(200).json(tournament);
    } catch (err) {
        const status = err.message.includes("already started") ? 403 : 500;
        res.status(status).json({ error: err.message });
    }
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