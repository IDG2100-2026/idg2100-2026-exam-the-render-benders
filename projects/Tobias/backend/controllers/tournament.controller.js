import tournamentServices from "../services/tournament.services.js";
import { matchedData } from "express-validator";

// "/tournaments"
export async function getAllTournaments(req, res){
    // read limit and skip from query parameters (with fallback values)
    const limit = parseInt(req.query.limit) || 10;
    const skip = parseInt(req.query.skip) || 0;
    // build the filter object (only add provided fields)
    const filter = {};
    // filter on fields that are provided on the URL query parameters
    if (req.query.status) filter.status = req.query.status;
    // build sort object
    const sort = {};
    // if a sort field is provided, then it should sort ascending (example: a-z or lowest-highest)
    if (req.query.sort) sort[req.query.sort] = 1;
    const allTournaments = await tournamentServices.getAllTournaments(limit, skip, filter, sort);
    res.json({ allTournaments });
}

// "/tournaments/:tid"
export async function getTournament(req, res){
    const tournamentObj = await tournamentServices.getTournament(req.params.tid);
    res.json({ tournamentObj });
}

// "/tournaments"
export async function createTournament(req, res){
    const data = matchedData(req);
    // if a trophy image was uploaded, save the file path to the data object
    if (req.file) data.trophy = req.file.path;
    const newTournamentId = await tournamentServices.createTournament(data);
    if (newTournamentId){
        return res.status(201).json({msg: "Tournament created", newTournamentId});
    } else {
        // ideally error code would depend on the error
        return res.status(400).json({msg: "Failed to create the tournament (bad input)"});
    }
}

// "/tournaments/:tid/start"
export async function startTournament(req, res){
    const updatedTournament = await tournamentServices.startTournament(req.params.tid);
    res.json({ updatedTournament });
}

// "/tournaments/:tid/join"
export async function joinTournament(req, res){
    // gets only the uid
    const { uid } = matchedData(req);
    // adds player to tournament using tid from URL and uid from body
    const updatedTournament = await tournamentServices.joinTournament(req.params.tid, uid);
    res.json({ updatedTournament })
}

// "/tournaments/:tid"
export async function editTournament(req, res){
    // only update the validated fields from body
    const updates = matchedData(req);
    // if a trophy image was uploaded, then the file path is saved to the updated object
    if (req.file) updates.trophy = req.file.path;
    // updates tournament
    const updatedTournament = await tournamentServices.updateTournament(req.params.tid, updates);
    res.json({ updatedTournament });
}

// "/tournaments/:tid/finish"
export async function finishTournament(req, res){
    const finishedTournament = await tournamentServices.finishTournament(req.params.tid);
    res.json({ finishedTournament });
}

// "/tournaments/:tid"
export async function deleteTournament(req, res){
    // deletes tournament using tid from URL
    const deletedTournament = await tournamentServices.deleteTournament(req.params.tid);
    res.json({ deletedTournament });
}

export default {
    getAllTournaments,
    getTournament,
    createTournament,
    startTournament,
    joinTournament,
    editTournament,
    finishTournament,
    deleteTournament
}
