import matchServices from "../services/match.services.js";
import { matchedData } from "express-validator";

// "/matches"
export async function getAllMatches(req, res){
    // read limit and skip from the query parameters (with fallbacks if not provided)
    const limit = parseInt(req.query.limit) || 10;
    const skip = parseInt(req.query.skip) || 0;

    // build the filter object (only add fields that are actually provided)
    const filter = {};

    // only filter on fieldds that are provided here
    if (req.query.status) filter.status = req.query.status;
    if (req.query.rounds) filter.rounds = parseInt(req.query.rounds);
    if (req.query.timeControl) filter.timeControl = parseInt(req.query.timeControl);
    if (req.query.includeStraights !== undefined) filter.includeStraights = req.query.includeStraights === "true";

    // building the sort object (default is newest first using _id)
    const sort = {};
    // if a sort field is provided, then it should sort ascending (example: a-z or lowest-highest)
    if (req.query.sort) sort[req.query.sort] = 1;

    const uid = req.query.uid ? parseInt(req.query.uid) : null;
    // getting all matches from db
    const allMatches = await matchServices.getAllMatches(limit, skip, filter, sort, uid);
    res.json({ allMatches });
}

// "/matches/:mid"
export async function getMatch(req, res){
    // does not need parseInt, because I have already used toInt() in the validator
    const matchObj = await matchServices.getMatch(req.params.mid);
    res.json({ matchObj });
}

// "/matches"
export async function createMatch(req, res){
    // gives validated fields
    const data = matchedData(req);
    // converting uid from the body to the players array the match model expects
    data.players = [data.uid];
    delete data.uid;
    try {
        const newMatchId = await matchServices.createMatch(data);
        if (newMatchId){
            // creates the match successfully
            return res.status(201).json({msg: "Match created, ", newMatchId});
        }
        return res.status(400).json({msg: "Failed to create the match (bad input)"});
    } catch (err) {
        return res.status(400).json({ msg: err.message });
    }
}

// "/matches/:mid"
export async function joinMatch(req, res){
    // gets only the uid
    const { uid } = matchedData(req);
    // adds the player to the match using mid from the URL and uid from the body
    const updatedMatch = await matchServices.joinMatch(req.params.mid, uid);
    res.json({ updatedMatch });
}

// "/matches/:mid"
export async function saveMatch(req, res){
    // gets the results from the validated body data
    const { results } = req.body;
    // saves result using mid from the URL and results from the body
    const savedMatch = await matchServices.saveMatchResult(req.params.mid, results);
    res.json({ savedMatch });
}

// I decided to add this here instead of in user.controller because it receives match data
// "/users/:uid/matches"
export async function getUsersRecentMatches(req, res){
    // does not need parseInt because toInt() is used in the validator
    const recentMatches = await matchServices.getUsersRecentMatches(req.params.uid);
    res.json({ recentMatches });
}

// added in oblig 3
export async function getMatchStats(req, res) {
    const stats = await matchServices.getUserMatchStats(req.params.uid);
    res.json({ stats });
}

export default {
    getAllMatches,
    getMatch,
    createMatch,
    joinMatch,
    saveMatch,
    getUsersRecentMatches,
    getMatchStats
}