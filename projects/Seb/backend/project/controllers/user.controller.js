import { User } from '../models/users.js';
import { Match } from '../models/match.js';
import { Trophy } from '../models/trophy.js';
import httpStatus from '../utils/statusCodes.js';
import userValidator from '../validators/user.validator.js';
import { escapeRegex } from '../utils/escapeRegex.js';

// GET all users
export async function getAllUsers(req, res) {
    try {
        // Pagination parameters with defaults and limits
        const { limit = 20, offset = 0, userType } = req.query;

        const limitNum  = Math.min(Math.max(parseInt(limit)  || 20, 1), 100); // Limit between 1 and 100
        const offsetNum = Math.max(parseInt(offset) || 0, 0); // Offset must be 0 or greater

        // Optional filter by userType
        const filter = {};
        if (userType) filter.userType = userType;

        // Run both queries in parallel for efficiency
        const [users, total] = await Promise.all([
            User.find(filter)
                .select('-__v')
                .sort({ createdAt: -1 })
                .limit(limitNum)
                .skip(offsetNum),
            User.countDocuments(filter)
        ]);

        res.status(httpStatus.OK.code).json({
            success: true,
            data: users,
            pagination: { total, limit: limitNum, offset: offsetNum, hasMore: offsetNum + limitNum < total }
        });
    } catch (err) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR.code).json({
            success: false,
            error: httpStatus.INTERNAL_SERVER_ERROR.message,
            message: 'Error retrieving users',
            errorMessage: err.message
        });
    }
}

// GET user by ID
export async function getUserById(req, res) {
    try {
        const { uid } = req.params;

        // Validate uid format
        const validation = userValidator.validateUid(uid);
        if (!validation.valid) {
            return res.status(validation.error).json({
                success: false,
                error: httpStatus.BAD_REQUEST.message,
                message: validation.message
            });
        }

        const user = await User.findById(uid).select('-__v');

        if(!user) {
            return res.status(httpStatus.NOT_FOUND.code).json({
                success: false,
                error: httpStatus.NOT_FOUND.message,
                message: `User with ID '${uid}' not found`
            });
        }
        res.status(httpStatus.OK.code).json({
            success: true,
            data: user
        });
    } catch(err) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR.code).json({
            success: false,
            error: httpStatus.INTERNAL_SERVER_ERROR.message,
            message: 'Error retrieving user',
            errorMessage: err.message
        });
    }
}

// POST create a new user
export async function createUser(req, res) {
    try {
        const { username, age, userType } = req.body;

        // Validate required fields
        const validation = userValidator.validateUserCreation(username, age);
        if (!validation.valid) {
            return res.status(validation.error).json({
                success: false,
                error: httpStatus.BAD_REQUEST.message,
                message: validation.message
            });
        }

        // Check if username exists
        const existingUser = await User.findOne({ username });
        if(existingUser){
            return res.status(httpStatus.CONFLICT.code).json({
                success: false,
                error: httpStatus.CONFLICT.message,
                message: 'Username already in use'
            });
        }

        // Create a new user
        const newUser = new User({
            username,
            age,
            userType: userType || 'anonymous',
            eloRating: 1600,
            eloRatingChange: 0
        });

        await newUser.save();
        
        res.status(httpStatus.CREATED.code).json({
            success: true,
            message: 'User created successfully',
            data: newUser
        });
    } catch(err) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR.code).json({
            success: false,
            error: httpStatus.INTERNAL_SERVER_ERROR.message,
            message: 'Error creating user',
            errorMessage: err.message
        });
    }
}

// PATCH update user
export async function updateUser(req, res) {
    try {
        const { uid } = req.params;
        const {
            age,
            userType,
            email,
            about,
            profileImage,
            password,
            eloRatings,
            appearance
        } = req.body;

        const uidValidation = userValidator.validateUid(uid);
        if (!uidValidation.valid) {
            return res.status(uidValidation.error).json({
                success: false,
                error: httpStatus.BAD_REQUEST.message,
                message: uidValidation.message
            });
        }

        const user = await User.findById(uid);
        if (!user) {
            return res.status(httpStatus.NOT_FOUND.code).json({
                success: false,
                error: httpStatus.NOT_FOUND.message,
                message: `User with ID '${uid}' not found`
            });
        }

        if (req.body.username) {
            return res.status(httpStatus.FORBIDDEN.code).json({
                success: false,
                error: httpStatus.FORBIDDEN.message,
                message: 'Username cannot be changed after creation'
            });
        }

        const ageValidation = userValidator.validateUserUpdate(age);
        if (!ageValidation.valid) {
            return res.status(ageValidation.error).json({
                success: false,
                error: httpStatus.BAD_REQUEST.message,
                message: ageValidation.message
            });
        }

        const updateData = {};

        if (age) updateData.age = age;
        if (userType) updateData.userType = userType;
        if (email !== undefined) updateData.email = email;
        if (about !== undefined) updateData.about = about;
        if (profileImage !== undefined) updateData.profileImage = profileImage;
        if (password !== undefined) updateData.password = password;
        if (eloRatings !== undefined) updateData.eloRatings = eloRatings;
        if (appearance !== undefined) updateData.appearance = appearance;
        
        const updatedUser = await User.findByIdAndUpdate(
            uid,
            updateData,
            { new: true, runValidators: true }
        ).select('-__v');

        res.status(httpStatus.OK.code).json({
            success: true,
            message: 'User updated successfully',
            data: updatedUser
        });
    } catch (err) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR.code).json({
            success: false,
            error: httpStatus.INTERNAL_SERVER_ERROR.message,
            message: 'Error updating user',
            errorMessage: err.message
        });
    }
}

// DELETE user
export async function deleteUser(req, res){
    try {
        const { uid } = req.params;

        // Validate uid format
        const validation = userValidator.validateUid(uid);
        if (!validation.valid) {
            return res.status(validation.error).json({
                success: false,
                error: httpStatus.BAD_REQUEST.message,
                message: validation.message
            });
        }

        const deletedUser = await User.findByIdAndDelete(uid);

        if (!deletedUser){
            return res.status(httpStatus.NOT_FOUND.code).json({
                success: false,
                error: httpStatus.NOT_FOUND.message,
                message: `User with ID '${uid}' not found`
            });
        }
        res.status(httpStatus.OK.code).json({
            success: true,
            message: 'User deleted successfully',
            data: deletedUser
        });
    } catch(err) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR.code).json({
            success: false,
            error: httpStatus.INTERNAL_SERVER_ERROR.message,
            message: 'Error deleting user',
            errorMessage: err.message
        });
    }
}

// GET user's recent games
export async function getUserRecentGames(req, res){
    try {
        const { uid } = req.params;

        // Validate uid format
        const validation = userValidator.validateUid(uid);
        if (!validation.valid) {
            return res.status(validation.error).json({
                success: false,
                error: httpStatus.BAD_REQUEST.message,
                message: validation.message
            });
        }

        // Check if user exists
        const user = await User.findById(uid);
        if (!user){
            return res.status(httpStatus.NOT_FOUND.code).json({
                success: false,
                error: httpStatus.NOT_FOUND.message,
                message: `User with ID '${uid}' not found`
            });
        }

        // Find matches where user is player1 or player2
        const recentGames = await Match.find({
            $or: [
                { player1: uid },
                { player2: uid }
            ]
        })
        .populate('player1', 'username eloRating')
        .populate('player2', 'username eloRating')
        .populate('winner', 'username')
        .populate('loser', 'username')
        .populate('gameType', 'name numOfRounds')
        .sort({ createdAt: -1 })
        .limit(10)
        .select('-__v');

        res.status(httpStatus.OK.code).json({
            success: true,
            data: recentGames,
            count: recentGames.length
        });

    } catch (err) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR.code).json({
            success: false,
            error: httpStatus.INTERNAL_SERVER_ERROR.message,
            message: 'Error retrieving user recent games',
            errorMessage: err.message
        });
    }
}

// GET user stats
export async function getUserStats(req, res){
    try {
        const { uid } = req.params;

        // Validate uid format
        const validation = userValidator.validateUid(uid);
        if (!validation.valid) {
            return res.status(validation.error).json({
                success: false,
                error: httpStatus.BAD_REQUEST.message,
                message: validation.message
            });
        }

        // Check if user exists
        const user = await User.findById(uid);
        if (!user){
            return res.status(httpStatus.NOT_FOUND.code).json({
                success: false,
                error: httpStatus.NOT_FOUND.message,
                message: `User with ID '${uid}' not found`
            });
        }

        // Get all matches where the user participated
        const matches = await Match.find({
            $or: [
                { player1: uid },
                { player2: uid}
            ]
        });

        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

        // Calculate stats
        const wins = matches.filter(match => match.winner?.toString() === uid).length;
        const losses = matches.filter(match => match.loser?.toString() === uid).length;
        const totalMatches = matches.length;
        const recentMatches = matches.filter((match) => {
            const relevantDate = match.updatedAt || match.createdAt;
            return relevantDate && new Date(relevantDate) >= oneMonthAgo;
        });
        const winsLastMonth = recentMatches.filter(
            (match) => match.winner?.toString() === uid
        ).length;
        const lossesLastMonth = recentMatches.filter(
            (match) => match.loser?.toString() === uid
        ).length;
        const winPercentage = totalMatches > 0 ? ((wins / totalMatches) * 100).toFixed(2) : 0;

        res.status(httpStatus.OK.code).json({
            success: true,
            data: {
                username: user.username,
                eloRating: user.eloRating,
                eloRatingChange: user.eloRatingChange,
                wins,
                losses,
                winsLastMonth,
                lossesLastMonth,
                totalMatches,
                winPercentage: `${winPercentage}%`
            }
        });
    } catch(err) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR.code).json({
            success: false,
            error: httpStatus.INTERNAL_SERVER_ERROR.message,
            message: 'Error retrieving user stats',
            errorMessage: err.message
        });
    }
}

// GET user trophies
export async function getUserTrophies(req, res){
    try{
        const { uid } = req.params;

        // Validate uid format
        const validation = userValidator.validateUid(uid);
        if (!validation.valid) {
            return res.status(validation.error).json({
                success: false,
                error: httpStatus.BAD_REQUEST.message,
                message: validation.message
            });
        }

        // Check if user exists
        const user = await User.findById(uid);
        if (!user){
            return res.status(httpStatus.NOT_FOUND.code).json({
                success: false,
                error: httpStatus.NOT_FOUND.message,
                message: `User with ID '${uid}' not found`
            });
        }

        // Find trophies by looking up completed tournaments where this user is the winner
        const { Tournament } = await import('../models/tournament.js');
        const wonTournaments = await Tournament.find({ winner: uid, status: 'completed' }).select('_id trophy title');
        const trophyIds = wonTournaments.map(t => t.trophy).filter(Boolean);
        
        // Get trophy details and populate tournament info
        const userTrophies = await Trophy.find({ _id: { $in: trophyIds } })
            .populate('tournament', 'title startDateTime')
            .select('-__v');

        res.status(httpStatus.OK.code).json({
            success: true,
            data: userTrophies,
            count: userTrophies.length
        });
    } catch(err){
        res.status(httpStatus.INTERNAL_SERVER_ERROR.code).json({
            success: false,
            error: httpStatus.INTERNAL_SERVER_ERROR.message,
            message: 'Error retrieving user trophies',
            errorMessage: err.message
        });
    }
}

// GET platform activity
export async function getPlatformActivity(req, res){
    try{
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        // Run all counts in parallel for efficiency
        const [
            totalMatches,
            ongoingMatches,
            totalUsers,
            registeredUsers,
            activeUserIds,
            recentMatches
        ] = await Promise.all([
            Match.countDocuments(),
            Match.countDocuments({ status: 'ongoing' }),
            User.countDocuments(),
            User.countDocuments({ userType: 'registered' }),
            // Distinct player1 IDs from matches played in the last 7 days
            Match.find({ createdAt: { $gte: oneWeekAgo } }).distinct('player1'),
            Match.find()
                .populate('player1', 'username')
                .populate('player2', 'username')
                .populate('winner', 'username')
                .populate('gameType', 'name')
                .sort({ createdAt: -1 })
                .limit(10)
                .select('-__v')
        ]);

        res.status(httpStatus.OK.code).json({
            success: true,
            data: {
                totalUsers,
                registeredUsers,
                totalMatches,
                ongoingMatches,
                activeUsersThisWeek: activeUserIds.length,
                recentMatches
            }
        });
    } catch(err){
        res.status(httpStatus.INTERNAL_SERVER_ERROR.code).json({
            success: false,
            error: httpStatus.INTERNAL_SERVER_ERROR.message,
            message: 'Error retrieving platform activity',
            errorMessage: err.message
        });
    }
}

// PATCH ban user (Admin only)
export async function banUser(req, res) {
    try{
        const { uid } = req.params;

        // Validate uid format
        const validation = userValidator.validateUid(uid);
        if (!validation.valid) {
            return res.status(validation.error).json({
                success: false,
                error: httpStatus.BAD_REQUEST.message,
                message: validation.message
            });
        }
        // Set isBanned to true for the specified user
        const bannedUser = await User.findByIdAndUpdate(
            uid,
            { isBanned: true },
            { new: true }
        ).select('-__v');

        if (!bannedUser){
            return res.status(httpStatus.NOT_FOUND.code).json({
                success: false,
                error: httpStatus.NOT_FOUND.message,
                message: `User with ID '${uid}' not found`
            });
        }
        res.status(httpStatus.OK.code).json({
            success: true,
            message: 'User banned successfully',
            data: bannedUser
        });
    } catch(err) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR.code).json({
            success: false,
            error: httpStatus.INTERNAL_SERVER_ERROR.message,
            message: 'Error banning user',
            errorMessage: err.message
        });
    }
}

// GET search users (Admin only)
export async function searchUsers(req, res) {
    try {
        const { username, userType } = req.query;

        // Build filter object
        const filter = {};
        
        if (username){
            // Case-insensitive regex search for usernames
            filter.username = { $regex: `${escapeRegex(username)}`, $options: 'i' };
        }
        if (userType) {
            filter.userType = userType;
        }

        const users = await User.find(filter).select('-__v');
        res.status(httpStatus.OK.code).json({
            success: true,
            data: users,
            count: users.length
        });
    } catch(err) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR.code).json({
            success: false,
            error: httpStatus.INTERNAL_SERVER_ERROR.message,
            message: 'Error searching users',
            errorMessage: err.message
        });
    }
}

// Export all controller methods
export default {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUserRecentGames,
  getUserStats,
  getUserTrophies,
  getPlatformActivity,
  banUser,
  searchUsers
};