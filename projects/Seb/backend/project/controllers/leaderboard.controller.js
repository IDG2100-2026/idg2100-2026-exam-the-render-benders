import { User } from '../models/users.js';
import { Match } from '../models/match.js';
import httpStatus from '../utils/statusCodes.js';
import leaderboardValidator from '../validators/leaderboard.validator.js';

// GET global leaderboard
export async function getGlobalLeaderboard(req, res) {
    try {
        const { limit = 50, offset = 0 } = req.query; // Default to top 50 with no offset

        // Validate pagination parameters 
        const validation = leaderboardValidator.validatePagination(limit, offset);
        if (!validation.valid) {
            return res.status(validation.error).json({
                success: false,
                error: httpStatus.BAD_REQUEST.message,
                message: validation.message
            });
        }

        // Get users sorted by ELO rating
        const users = await User.find({ isBanned: false })
            .select('_id username eloRating eloRatingChange userType createdAt')
            .sort({ eloRating: -1 })
            .limit(parseInt(limit))
            .skip(parseInt(offset))
            .lean();

        // Add ranking based on offset and index
        const leaderboard = users.map((user, index) => ({
            rank: parseInt(offset) + index + 1,
            ...user
        }));

        // Get total count
        const total = await User.countDocuments({ isBanned: false });

        res.status(httpStatus.OK.code).json({
            success: true,
            data: leaderboard,
            pagination: {
                total,
                limit: parseInt(limit),
                offset: parseInt(offset),
                hasMore: parseInt(offset) + parseInt(limit) < total
            }
        });
    } catch (err) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR.code).json({
            success: false,
            error: httpStatus.INTERNAL_SERVER_ERROR.message,
            message: 'Error retrieving global leaderboard',
            errorMessage: err.message
        });
    }
}

// GET user rank
export async function getUserRank(req, res) {
    try {
        const { uid } = req.params;

        // Validate user ID
        const validation = leaderboardValidator.validateId(uid);
        if (!validation.valid) {
            return res.status(validation.error).json({
                success: false,
                error: httpStatus.BAD_REQUEST.message,
                message: validation.message
            });
        }

        // Get user
        const user = await User.findById(uid);
        if (!user) {
            return res.status(httpStatus.NOT_FOUND.code).json({
                success: false,
                error: httpStatus.NOT_FOUND.message,
                message: `User with ID '${uid}' not found`
            });
        }

        // Count users with higher ELO
        const rank = await User.countDocuments({
            eloRating: { $gt: user.eloRating },
            isBanned: false
        }) + 1;

        // Get user stats
        const allMatches = await Match.find({
            $or: [
                { player1: uid },
                { player2: uid }
            ]
        });

        // Calculate wins, losses, total matches, and win percentage
        const wins = allMatches.filter(match => match.winner.toString() === uid).length;
        const losses = allMatches.filter(match => match.loser.toString() === uid).length;
        const totalMatches = allMatches.length;
        const winPercentage = totalMatches > 0 ? ((wins / totalMatches) * 100).toFixed(2) : 0;
        
        // Return user rank and stats
        res.status(httpStatus.OK.code).json({
            success: true,
            data: {
                rank,
                username: user.username,
                eloRating: user.eloRating,
                eloRatingChange: user.eloRatingChange,
                userType: user.userType,
                stats: {
                    wins,
                    losses,
                    totalMatches,
                    winPercentage: `${winPercentage}%`
                }
            }
        });
    } catch (err) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR.code).json({
            success: false,
            error: httpStatus.INTERNAL_SERVER_ERROR.message,
            message: 'Error retrieving user rank',
            errorMessage: err.message
        });
    }
}

// GET leaderboard by user type
export async function getLeaderboardByUserType(req, res) {
    try {
        const { userType } = req.query;
        const { limit = 50, offset = 0 } = req.query;

        // Validate user type
        const userTypeValidation = leaderboardValidator.validateUserType(userType);
        if (!userTypeValidation.valid) {
            return res.status(userTypeValidation.error).json({
                success: false,
                error: httpStatus.BAD_REQUEST.message,
                message: userTypeValidation.message
            });
        }

        // Validate pagination
        const paginationValidation = leaderboardValidator.validatePagination(limit, offset);
        if (!paginationValidation.valid) {
            return res.status(paginationValidation.error).json({
                success: false,
                error: httpStatus.BAD_REQUEST.message,
                message: paginationValidation.message
            });
        }

        // Get users by type
        const users = await User.find({ userType, isBanned: false })
            .select('_id username eloRating eloRatingChange userType createdAt')
            .sort({ eloRating: -1 })
            .limit(parseInt(limit))
            .skip(parseInt(offset))
            .lean();

        // Add ranking based on offset and index
        const leaderboard = users.map((user, index) => ({
            rank: parseInt(offset) + index + 1,
            ...user
        }));

        // Get total count for this user type
        const total = await User.countDocuments({ userType, isBanned: false });

        res.status(httpStatus.OK.code).json({
            success: true,
            userType,
            data: leaderboard,
            pagination: {
                total,
                limit: parseInt(limit),
                offset: parseInt(offset),
                hasMore: parseInt(offset) + parseInt(limit) < total
            }
        });
    } catch (err) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR.code).json({
            success: false,
            error: httpStatus.INTERNAL_SERVER_ERROR.message,
            message: 'Error retrieving leaderboard by user type',
            errorMessage: err.message
        });
    }
}

// GET weekly leaderboard
export async function getWeeklyLeaderboard(req, res) {
    try {
        const { limit = 50, offset = 0 } = req.query;

        // Validate pagination
        const validation = leaderboardValidator.validatePagination(limit, offset);
        if (!validation.valid) {
            return res.status(validation.error).json({
                success: false,
                error: httpStatus.BAD_REQUEST.message,
                message: validation.message
            });
        }

        // Get users sorted by ELO rating change
        const users = await User.find({ isBanned: false })
            .select('_id username eloRating eloRatingChange userType createdAt')
            .sort({ eloRatingChange: -1 })
            .limit(parseInt(limit))
            .skip(parseInt(offset))
            .lean(); // .lean() => return plain JS objects instead of Mongoose documents

        // Add ranking based on offset and index
        const leaderboard = users.map((user, index) => ({
            rank: parseInt(offset) + index + 1,
            ...user
        }));

        const total = await User.countDocuments({ isBanned: false });

        res.status(httpStatus.OK.code).json({
            success: true,
            period: 'weekly',
            data: leaderboard,
            pagination: {
                total,
                limit: parseInt(limit),
                offset: parseInt(offset),
                hasMore: parseInt(offset) + parseInt(limit) < total
            }
        });
    } catch (err) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR.code).json({
            success: false,
            error: httpStatus.INTERNAL_SERVER_ERROR.message,
            message: 'Error retrieving weekly leaderboard',
            errorMessage: err.message
        });
    }
}

// GET top rated players
export async function getTopPlayers(req, res) {
    try {
        const { count = 10 } = req.query;

        // Validate count parameter
        const validation = leaderboardValidator.validateTopPlayerCount(count);
        if (!validation.valid) {
            return res.status(validation.error).json({
                success: false,
                error: httpStatus.BAD_REQUEST.message,
                message: validation.message
            });
        }

        // Get top players sorted by ELO rating
        const topPlayers = await User.find({ isBanned: false })
            .select('_id username eloRating eloRatingChange userType')
            .sort({ eloRating: -1 })
            .limit(parseInt(count))
            .lean(); // .lean() => return plain JS objects instead of Mongoose documents

        // Add ranking based on index
        const players = topPlayers.map((player, index) => ({
            rank: index + 1,
            ...player
        }));

        res.status(httpStatus.OK.code).json({
            success: true,
            data: players,
            count: players.length
        });
    } catch (err) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR.code).json({
            success: false,
            error: httpStatus.INTERNAL_SERVER_ERROR.message,
            message: 'Error retrieving top players',
            errorMessage: err.message
        });
    }
}

// GET player comparison
export async function comparePlayersStats(req, res) {
    try {
        const { uid1, uid2 } = req.query;

        // Validate both user IDs
        const uid1Validation = leaderboardValidator.validateId(uid1);
        const uid2Validation = leaderboardValidator.validateId(uid2);

        if (!uid1Validation.valid || !uid2Validation.valid) {
            return res.status(httpStatus.BAD_REQUEST.code).json({
                success: false,
                error: httpStatus.BAD_REQUEST.message,
                message: 'Both user IDs must be valid'
            });
        }

        if (uid1 === uid2) {
            return res.status(httpStatus.BAD_REQUEST.code).json({
                success: false,
                error: httpStatus.BAD_REQUEST.message,
                message: 'Cannot compare a player with themselves'
            });
        }

        // Get both users
        const user1 = await User.findById(uid1);
        const user2 = await User.findById(uid2);

        if (!user1 || !user2) {
            return res.status(httpStatus.NOT_FOUND.code).json({
                success: false,
                error: httpStatus.NOT_FOUND.message,
                message: 'One or both users not found'
            });
        }

        // Get matches between these two players
        const headToHeadMatches = await Match.find({
            $or: [
                { player1: uid1, player2: uid2 },
                { player1: uid2, player2: uid1 }
            ]
        });
        
        // Calculate wins for each player in head-to-head matches
        const user1Wins = headToHeadMatches.filter(match => match.winner?.toString() === uid1).length;
        const user2Wins = headToHeadMatches.filter(match => match.winner?.toString() === uid2).length;

        // Get all matches for each user
        const user1AllMatches = await Match.find({
            $or: [{ player1: uid1 }, { player2: uid1 }]
        });
        const user2AllMatches = await Match.find({
            $or: [{ player1: uid2 }, { player2: uid2 }]
        });

        res.status(httpStatus.OK.code).json({
            success: true,
            data: {
                player1: {
                    username: user1.username,
                    eloRating: user1.eloRating,
                    totalMatches: user1AllMatches.length,
                    wins: user1AllMatches.filter(m => m.winner === uid1).length,
                    headToHeadWins: user1Wins
                },
                player2: {
                    username: user2.username,
                    eloRating: user2.eloRating,
                    totalMatches: user2AllMatches.length,
                    wins: user2AllMatches.filter(m => m.winner === uid2).length,
                    headToHeadWins: user2Wins
                },
                headToHead: {
                    totalMatches: headToHeadMatches.length,
                    player1Wins: user1Wins,
                    player2Wins: user2Wins
                }
            }
        });
    } catch (err) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR.code).json({
            success: false,
            error: httpStatus.INTERNAL_SERVER_ERROR.message,
            message: 'Error comparing players',
            errorMessage: err.message
        });
    }
}

// Export all leaderboard controller methods
export default {
    getGlobalLeaderboard,
    getUserRank,
    getLeaderboardByUserType,
    getWeeklyLeaderboard,
    getTopPlayers,
    comparePlayersStats
};