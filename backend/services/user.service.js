import { User } from "../models/user.model.js";
import { Game } from "../models/game.model.js";
import { hashPwd } from "../utils/hash.js";
import { MIN_AGE, MAX_AGE, DEFAULT_ELO, USER_UPDATABLE_FIELDS } from "../config/constants.js";
import { escapeRegex } from "../utils/escapeRegex.js";
import { getAge } from "../utils/dateHelpers.js";
import { isOwnerOrAdmin } from "../utils/authHelpers.js";

function sanitizeProfile(user, viewer) {
    const userObject = typeof user.toObject === "function" ? user.toObject() : user;
    const {
        pwd,
        sessions,
        email,
        dateOfBirth,
        ...safeUser
    } = userObject;

    if (isOwnerOrAdmin(userObject._id, viewer)) {
        safeUser.email = email;
    }

    return safeUser;
}

export async function getAllUsers({ skip = 0, limit = 20, search } = {}) {
    const filter = search ? { username: { $regex: escapeRegex(search), $options: "i" } } : {};
    return await User.find(filter).select("-pwd").skip(skip).limit(limit);
}

export async function getUser(username, viewer = null) {
    const user = await User.findOne({ username }).populate("trophies");
    if (!user) return null;

    const recentGames = await Game.find({ players: user._id })
        .sort({ updatedAt: -1 })
        .limit(10)
        .populate("players", "username profileImage elo elo10s elo30s elo90s")
        .populate("result.winner", "username");

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const monthlyGames = await Game.find({
        players: user._id,
        status: "finished",
        updatedAt: { $gte: thirtyDaysAgo }
    });

    let monthlyWins = 0;
    let monthlyLosses = 0;

    for (const game of monthlyGames) {
        const winnerId = game.result?.winner?.toString();

        if (winnerId === user._id.toString()) {
            monthlyWins++;
        } else if (winnerId) {
            monthlyLosses++;
        }
    }

    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const weekHistory = user.eloHistory.filter(entry => entry.date >= oneWeekAgo);
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

export async function createUser(data) {
    const age = getAge(data.dateOfBirth);
    if (age < MIN_AGE) throw new Error("You must be at least 18 years old to register");
    if (age > MAX_AGE) throw new Error(`Age cannot exceed ${MAX_AGE} years`);
    const hashedData = { ...data, pwd: hashPwd(data.pwd) };
    return await User.create(hashedData);
}

export async function updateUser(username, data) {
    const safeData = {};
    for (const field of USER_UPDATABLE_FIELDS) {
        if (field in data) safeData[field] = data[field];
    }
    if (safeData.pwd) safeData.pwd = hashPwd(safeData.pwd);
    return await User.findOneAndUpdate({ username }, safeData, { returnDocument: "after" });
}

export async function banUser(username) {
    const user = await User.findOne({ username });
    if (!user) return null;
    return await User.findOneAndUpdate({ username }, { isBanned: !user.isBanned }, { returnDocument: "after" });
}

export async function getLeaderboard(sortBy = "elo") {
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

export async function getUserTrophies(username) {
    const user = await User.findOne({ username }).populate({
        path: "trophies",
        populate: { path: "tournament", select: "name" }
    });
    if (!user) return null;
    return user.trophies;
}

export async function updatePreferences(username, preferences) {
    return await User.findOneAndUpdate({ username }, { preferences }, { returnDocument: "after" });
}

export async function loginUser({ username, pwd: inputPwd }) {
    const user = await User.findOne({ username });
    if (!user) return null;
    if (user.pwd !== hashPwd(inputPwd)) return null;
    const { pwd, ...safeUser } = user.toObject(); 
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
