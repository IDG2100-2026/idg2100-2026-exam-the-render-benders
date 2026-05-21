import tournamentService from "../services/tournament.service.js";


// Get all Tournaments from the database and return them as JSON
// Supports filtering by status: ?status=upcoming, ?status=ongoing or ?status=finished
export async function getAllTournaments(req, res) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const filter = {};
        if (req.query.status) filter.status = req.query.status;
        const tournaments = await tournamentService.getAllTournaments({ page, limit, filter });
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
        if (req.user?.type !== "admin") return res.status(403).json({ error: "Admin access required" });
        const data = { ...req.body };
        if (req.file) data.trophy = req.file.filename;
        const tournament = await tournamentService.createTournament(data);
        res.status(201).json(tournament);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// Updates a Tournament by ID (tid) and return the updated Tournament as JSON (admin only)
export async function updateTournament(req, res) {
    try {
        if (req.user?.type !== "admin") return res.status(403).json({ error: "Admin access required" });
        const tournament = await tournamentService.updateTournament(req.params.tid, req.body);
        if (!tournament) return res.status(404).json({ error: "Tournament not found" });
        res.status(200).json(tournament);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// Adds the requesting user to a tournament's players list
// Anonymous users cannot join tournaments
export async function joinTournament(req, res) {
    try {
        if (req.user?.type === "anonymous") return res.status(403).json({ error: "Login required to join tournaments" });
        const tournament = await tournamentService.joinTournament(req.params.tid, req.body.player);
        if (!tournament) return res.status(404).json({ error: "Tournament not found" });
        res.status(200).json(tournament);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// Starts a tournament: randomly pairs players into a bracket and sets status to ongoing (admin only)
export async function startTournament(req, res) {
    try {
        if (req.user?.type !== "admin") return res.status(403).json({ error: "Admin access required" });
        const tournament = await tournamentService.startTournament(req.params.tid);
        if (!tournament) return res.status(404).json({ error: "Tournament not found" });
        res.status(200).json(tournament);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

export default {
    getAllTournaments,
    getTournament,
    createTournament,
    updateTournament,
    joinTournament,
    startTournament
};