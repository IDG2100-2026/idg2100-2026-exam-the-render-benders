import leaderboardServices from "../services/leaderboard.services.js";

// "/leaderboards"
export async function getAllLeaderboards(req, res){
    const filter = { status: "finished" };
    if (req.query.rounds) filter.rounds = parseInt(req.query.rounds);
    if (req.query.includeStraights) filter.includeStraights = req.query.includeStraights === "true";
    if (req.query.timeControl) filter.timeControl = parseInt(req.query.timeControl);
    const leaderboard = await leaderboardServices.getAllLeaderboards(filter);
    res.json({ leaderboard });
}

// "/leaderboards/matches"
export async function getLeaderboardByMatches(req, res){
    // build the filter based on query parameters (example: ?rounds=5)
    const filter = { status: "finished" };
    // filter the game by variant if that is provided (allows leaderboards per category)
    if (req.query.rounds) filter.rounds = parseInt(req.query.rounds);
    if (req.query.includeStraights) filter.includeStraights = req.query.includeStraights === "true";
    if (req.query.timeControl) filter.timeControl = parseInt(req.query.timeControl);
    const leaderboard = await leaderboardServices.getLeaderboardByMatches(filter);
    res.json({ leaderboard });
}

// "/leaderboards/wins"
export async function getLeaderboardByWins(req, res){
    // build the filter based on query parameters (example: ?rounds=5)
    const filter = { status: "finished" };
    // filter the game by variant if that is provided (allows leaderboards per category)
    if (req.query.rounds) filter.rounds = parseInt(req.query.rounds);
    if (req.query.includeStraights) filter.includeStraights = req.query.includeStraights === "true";
    if (req.query.timeControl) filter.timeControl = parseInt(req.query.timeControl);
    const leaderboard = await leaderboardServices.getLeaderboardByWins(filter);
    res.json({ leaderboard });
}

// "/leaderboards/winPercentage"
export async function getLeaderboardByWinPercentage(req, res){
    // build the filter based on query parameters (example: ?rounds=5)
    const filter = { status: "finished" };
    // filter the game by variant if that is provided (allows leaderboards per category)
    if (req.query.rounds) filter.rounds = parseInt(req.query.rounds);
    if (req.query.includeStraights) filter.includeStraights = req.query.includeStraights === "true";
    if (req.query.timeControl) filter.timeControl = parseInt(req.query.timeControl);
    const leaderboard = await leaderboardServices.getLeaderboardByWinPercentage(filter);
    res.json({ leaderboard });
}

export default {
    getAllLeaderboards,
    getLeaderboardByMatches,
    getLeaderboardByWins,
    getLeaderboardByWinPercentage
}
