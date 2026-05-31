import { User } from "../models/user.model.js";
import { Game } from "../models/game.model.js";
import { hashPwd } from "../utils/hash.js";
import { MIN_AGE, MAX_AGE, DEFAULT_ELO } from "../config/constants.js";
import { escapeRegex } from "../utils/escapeRegex.js";

function isOwnerOrAdmin(user, viewer) {
    if (!viewer?.id) return false;
    return viewer.type === "admin" || user._id.toString() === viewer.id;
}

function sanitizeProfile(user, viewer) {
    const userObject = typeof user.toObject === "function" ? user.toObject() : user;
    const {
        pwd,
        sessions,
        email,
        dateOfBirth,
        ...safeUser
    } = userObject;

    if (isOwnerOrAdmin(userObject, viewer)) {
        safeUser.email = email;
    }

    return safeUser;
}

// Returns all users from the database, supports pagination and search by username
export async function getAllUsers({ skip = 0, limit = 20, search } = {}) {
    const filter = search ? { username: { $regex: escapeRegex(search), $options: "i" } } : {};
    return await User.find(filter).select("-pwd").skip(skip).limit(limit);
}

// Get a single user by their username, includes their 10 most recent games and stats
export async function getUser(username, viewer = null) {
    const user = await User.findOne({ username }).populate("trophies");
    if (!user) return null;

    // Fetch recent games and populate player usernames
    const recentGames = await Game.find({ players: user._id })
        .sort({ updatedAt: -1 })
        .limit(10)
        .populate("players", "username profileImage elo elo10s elo30s elo90s")
        .populate("result.winner", "username");

    // Calculate stats for the last month (30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Find all games the user participated in during the last month
    // $gte = "Greater Than or Equal to" - finds games newer than 30 days ago
    const monthlyGames = await Game.find({
        players: user._id,
        status: "finished",
        updatedAt: { $gte: thirtyDaysAgo }
    });

    // Count monthly wins and losses
    let monthlyWins = 0;
    let monthlyLosses = 0;

    for (const game of monthlyGames) {
        const winnerId = game.result?.winner?.toString();

        // Compare the winner's ID with this specific user's ID to see if they won or lost
        if (winnerId === user._id.toString()) {
            monthlyWins++;
        // If there's a winner but it's not our user, it counts as a loss
        } else if (winnerId) {
            monthlyLosses++;
        }
    }

    // Calculate ELO change over the last 7 days using eloHistory
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const weekHistory = user.eloHistory.filter(entry => entry.date >= oneWeekAgo);
    // Difference between current ELO and the oldest recorded ELO within the last week
    const eloChangeLastWeek = weekHistory.length > 0 ? user.elo - weekHistory[0].elo : 0;

    return {
        ...sanitizeProfile(user, viewer),
        points: user.points,
        stats: {
            elo: user.elo,
            elo10s: user.elo10s,
            elo30s: user.elo30s,
            elo90s: user.elo90s,
            gamesPlayed: user.gamesPlayed,
            wins: user.wins,
            losses: Math.max(0, user.gamesPlayed - user.wins),
            monthlyWins,
            monthlyLosses,
            eloChangeLastWeek
        },
        recentGames,
        eloChangeLastWeek,
        monthlyWins,
        monthlyLosses
    };
}

export async function getUserGames(username, { skip = 0, limit = 10, status } = {}) {
    const user = await User.findOne({ username }).select("_id username");
    if (!user) return null;

    const filter = { players: user._id };

    if (status) {
        filter.status = status;
    }

    const [games, total] = await Promise.all([
        Game.find(filter)
            .sort({ updatedAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate("players", "username profileImage elo elo10s elo30s elo90s")
            .populate("result.winner", "username"),
        
        Game.countDocuments(filter)
    ]);

    return {
        games,
        total,
        skip,
        limit,
        hasMore: skip + games.length < total
    };
}

// Creates a new user and saves it to the database, hashes the password before saving
// Throws an error if the user is under 18 years old
export async function createUser(data) {
    const dob = new Date(data.dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth(); // check if birthday has passed this year
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age--;
    }
    if (age < MIN_AGE) throw new Error("You must be at least 18 years old to register");
    if (age > MAX_AGE) throw new Error(`Age cannot exceed ${MAX_AGE} years`);
    const hashedData = { ...data, pwd: hashPwd(data.pwd) };
    return await User.create(hashedData);
}

// Updates a user by username, returns the updated document
// Username is read-only and cannot be changed - stripped out if present in the update data
// If a new password is provided, hash it before saving
export async function updateUser(username, data) {
    const safeData = { ...data };
    delete safeData.username;
    if (safeData.pwd) safeData.pwd = hashPwd(safeData.pwd);
    return await User.findOneAndUpdate({ username }, safeData, { returnDocument: "after" });
}

// Bans a user by username, sets isBanned to true, returns the updated document
export async function banUser(username) {
    return await User.findOneAndUpdate({ username }, { isBanned: true }, { returnDocument: "after" });
}

// Returns users sorted by the given field (elo, wins, gamesPlayed, winRate), highest first
export async function getLeaderboard(sortBy = "elo") {
    // winRate is computed on the fly using aggregation since it's not stored
    if (sortBy === "winRate") {
        return await User.aggregate([
            {
                $addFields: {
                    winRate: {
                        $cond: [{ $eq: ["$gamesPlayed", 0] }, 0, { $divide: ["$wins", "$gamesPlayed"] }]
                    }
                }
            },
            { $sort: { winRate: -1 } }
        ]);
    }
    const allowedSort = ["elo", "wins", "gamesPlayed"];
    const sortField = allowedSort.includes(sortBy) ? sortBy : "elo";
    return await User.find().sort({ [sortField]: -1 });
}

// Returns a user's trophies, populated with title, image, and tournament name
export async function getUserTrophies(username) {
    const user = await User.findOne({ username }).populate({
        path: "trophies",
        populate: { path: "tournament", select: "name" }
    });
    if (!user) return null;
    return user.trophies;
}

// Updates appearance preferences for a user by username
export async function updatePreferences(username, preferences) {
    return await User.findOneAndUpdate({ username }, { preferences }, { returnDocument: "after" });
}

// Finds a user by username and checks the password, returns user without pwd field
export async function loginUser({ username, pwd: inputPwd }) {
    const user = await User.findOne({ username });
    if (!user) return null;
    if (user.pwd !== hashPwd(inputPwd)) return null;
    const { pwd, ...safeUser } = user.toObject(); // pwd is excluded from the spread intentionally
    return safeUser;
}

export default {
    getAllUsers,
    getUser,
    createUser,
    updateUser,
    banUser,
    getLeaderboard,
    loginUser,
    updatePreferences,
    getUserTrophies,
    getUserGames
};