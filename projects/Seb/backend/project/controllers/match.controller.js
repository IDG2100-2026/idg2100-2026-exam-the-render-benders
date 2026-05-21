import { Match } from '../models/match.js';
import { User } from '../models/users.js';
import { GameCategory } from '../models/game.js';
import { Tournament } from '../models/tournament.js';
import httpStatus from '../utils/statusCodes.js';
import matchValidator from '../validators/match.validator.js';

// GET all matches
export async function getAllMatches(req, res) {
    try {
        // Extract query parameters for filtering and pagination
        const { visibility, gameType, player, status, limit = 20, offset = 0 } = req.query;

        const limitNum  = Math.min(Math.max(parseInt(limit)  || 20, 1), 100); // Limit between 1 and 100
        const offsetNum = Math.max(parseInt(offset) || 0, 0); // Offset must be 0 or greater

        // Build filter object based on query parameters
        const filter = {};
        if (visibility) filter.visibility = visibility;
        if (gameType)   filter.gameType   = gameType;
        if (status)     filter.status     = status;
        if (player)     filter.$or      = [{ player1: player }, { player2: player }];

        // Execute both queries in parallel for efficiency
        const [matches, total] = await Promise.all([
            // Find matches with filters, populate references, sort by creation date, and apply pagination
            Match.find(filter)
                .populate('player1', 'username eloRating')
                .populate('player2', 'username eloRating')
                .populate('winner', 'username')
                .populate('loser', 'username')
                .populate('gameType', 'name numOfRounds straightsAllowed timePerRound')
                .populate('tournament', 'title')
                .sort({ createdAt: -1 })
                .limit(limitNum)
                .skip(offsetNum)
                .select('-__v'),
            Match.countDocuments(filter) // Get total count for pagination
        ]);

        res.status(httpStatus.OK.code).json({
            success: true,
            data: matches,
            pagination: { total, limit: limitNum, offset: offsetNum, hasMore: offsetNum + limitNum < total }
        });
    } catch (err) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR.code).json({
            success: false,
            error: httpStatus.INTERNAL_SERVER_ERROR.message,
            message: 'Error retrieving matches',
            errorMessage: err.message
        });
    }
}

// GET match by ID
export async function getMatchById(req, res) {
    try {
        const { mid } = req.params;

        // Validate match ID
        const validation = matchValidator.validateMid(mid);
        if (!validation.valid) {
            return res.status(validation.error).json({
                success: false,
                error: httpStatus.BAD_REQUEST.message,
                message: validation.message
            });
        }

        // Find match by ID and populate references
        const match = await Match.findById(mid)
            .populate('player1', 'username eloRating')
            .populate('player2', 'username eloRating')
            .populate('winner', 'username')
            .populate('loser', 'username')
            .populate('gameType', 'name numOfRounds straightsAllowed timePerRound')
            .populate('tournament', 'title')
            .select('-__v');

        if (!match) {
            return res.status(httpStatus.NOT_FOUND.code).json({
                success: false,
                error: httpStatus.NOT_FOUND.message,
                message: `Match with ID '${mid}' not found`
            });
        }

        res.status(httpStatus.OK.code).json({
            success: true,
            data: match
        });
    } catch (err) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR.code).json({
            success: false,
            error: httpStatus.INTERNAL_SERVER_ERROR.message,
            message: 'Error retrieving match',
            errorMessage: err.message
        });
    }
}

// POST create a new match
export async function createMatch(req, res) {
    try {
        const { player1, player2, gameType, visibility, allowAnonymousPlayers, minElo, maxElo } = req.body;
        const normalizedAllowAnonymousPlayers = allowAnonymousPlayers ?? true;
        const normalizedMinElo = minElo ?? 0;
        const normalizedMaxElo = maxElo ?? 3000;
        
        const validation = matchValidator.validateMatchCreation( player1, player2, gameType, normalizedAllowAnonymousPlayers, normalizedMinElo, normalizedMaxElo);
        if (!validation.valid) {
            return res.status(validation.error).json({
                success: false,
                error: httpStatus.BAD_REQUEST.message,
                message: validation.message
            });
        }

        // Validate player1 ID format (always required)
        const player1Val = matchValidator.validateMid(player1);
        if (!player1Val.valid) {
            return res.status(httpStatus.BAD_REQUEST.code).json({
                success: false,
                error: httpStatus.BAD_REQUEST.message,
                message: 'Invalid player1 ID format'
            });
        }

        // Validate player2 ID format only if provided
        if (player2) {
            const player2Val = matchValidator.validateMid(player2);
            if (!player2Val.valid) {
                return res.status(httpStatus.BAD_REQUEST.code).json({
                    success: false,
                    error: httpStatus.BAD_REQUEST.message,
                    message: 'Invalid player2 ID format'
                });
            }
        }

        // Check if player1 exists
        const playerOne = await User.findById(player1);
        if (!playerOne) {
            return res.status(httpStatus.NOT_FOUND.code).json({
                success: false,
                error: httpStatus.NOT_FOUND.message,
                message: 'Player 1 not found'
            });
        }
        if (playerOne.isBanned) {
            return res.status(httpStatus.FORBIDDEN.code).json({
                success: false,
                error: httpStatus.FORBIDDEN.message,
                message: 'Cannot create match with a banned player'
            });
        }

        // Check player2 only if provided
        if (player2) {
            const playerTwo = await User.findById(player2);
            if (!playerTwo) {
                return res.status(httpStatus.NOT_FOUND.code).json({
                    success: false,
                    error: httpStatus.NOT_FOUND.message,
                    message: 'Player 2 not found'
                });
            }
            if (playerTwo.isBanned) {
                return res.status(httpStatus.FORBIDDEN.code).json({
                    success: false,
                    error: httpStatus.FORBIDDEN.message,
                    message: 'Cannot create match with a banned player'
                });
            }
        }

        // Check if game category exists
        const category = await GameCategory.findById(gameType);
        if (!category) {
            return res.status(httpStatus.NOT_FOUND.code).json({
                success: false,
                error: httpStatus.NOT_FOUND.message,
                message: 'Game category not found'
            });
        }

        // Create new match (Status is 'ongoing' when both players are present, else 'pending')
        const newMatch = new Match({
            player1,
            player2,
            gameType,
            visibility: visibility || 'public',
            allowAnonymousPlayers: normalizedAllowAnonymousPlayers,
            minElo: normalizedMinElo,
            maxElo: normalizedMaxElo,
            player1Score: 0,
            player2Score: 0,
            winner: null,
            loser: null,
            status: player2 ? 'ongoing' : 'pending'
        });

        await newMatch.save();

        const populatedMatch = await Match.findById(newMatch._id)
            .populate('player1', 'username eloRating userType')
            .populate('player2', 'username eloRating userType')
            .populate('gameType', 'name numOfRounds straightsAllowed timePerRound');

        res.status(httpStatus.CREATED.code).json({
            success: true,
            message: 'Match created successfully',
            data: populatedMatch
        });
    } catch (err) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR.code).json({
            success: false,
            error: httpStatus.INTERNAL_SERVER_ERROR.message,
            message: 'Error creating match',
            errorMessage: err.message
        });
    }
}

// POST save match result
// Records scores, determines winner/loser, marks match completed, and updates
// ELO ratings for registered players.
//
// Arena tournament note: if it's an arena tournament match, the
// winner's arenaScores entry is incremented by 1 point automatically.
export async function saveResult(req, res) {
    try {
        const { mid } = req.params;
        const { player1Score, player2Score } = req.body;

        // Validate match ID
        const midValidation = matchValidator.validateMid(mid);
        if (!midValidation.valid) {
            return res.status(midValidation.error).json({
                success: false,
                error: httpStatus.BAD_REQUEST.message,
                message: midValidation.message
            });
        }

        // Validate scores
        const scoreValidation = matchValidator.validateScores(player1Score, player2Score);
        if (!scoreValidation.valid) {
            return res.status(scoreValidation.error).json({
                success: false,
                error: httpStatus.BAD_REQUEST.message,
                message: scoreValidation.message
            });
        }

        const match = await Match.findById(mid);
        if (!match) {
            return res.status(httpStatus.NOT_FOUND.code).json({
                success: false,
                error: httpStatus.NOT_FOUND.message,
                message: `Match with ID '${mid}' not found`
            });
        }

        // Cannot save result for an already completed match
        if (match.status === 'completed') {
            return res.status(httpStatus.CONFLICT.code).json({
                success: false,
                error: httpStatus.CONFLICT.message,
                message: 'Result has already been saved for this match'
            });
        }

        // Update scores and determine winner
        match.player1Score = player1Score;
        match.player2Score = player2Score;

        // Determine winner and loser based on scores
        let winnerId, loserId;
        // If scores are equal, it's a draw. For simplicity, a winner is required.
        if (player1Score > player2Score) {
            match.winner = match.player1;
            match.loser = match.player2;
            winnerId = match.player1;
            loserId = match.player2;
        } else if (player2Score > player1Score) {
            match.winner = match.player2;
            match.loser = match.player1;
            winnerId = match.player2;
            loserId = match.player1;
        } else {
            return res.status(httpStatus.BAD_REQUEST.code).json({
                success: false,
                error: httpStatus.BAD_REQUEST.message,
                message: 'Scores cannot be equal. There must be a winner'
            });
        }

        // Mark match as completed
        match.status = 'completed';
        await match.save();

        // ELO update (Not for anonymous users)
        // Uses the standard ELO formula: Ra' = Ra + K * (Sa - Ea)
        // K-factor = 32, expected score = 1 / (1 + 10^((Rb-Ra)/400))
        const winner = await User.findById(winnerId);
        const loser = await User.findById(loserId);
        // Only update ELO if both players are registered users (not anonymous)
        if (winner && loser && winner.userType !== 'anonymous' && loser.userType !== 'anonymous') {
            const K = 32; // Standard K-factor for ELO
            const expectedWinner = 1 / (1 + Math.pow(10, (loser.eloRating - winner.eloRating) / 400)); // Expected score for the winner
            const expectedLoser = 1 - expectedWinner; // Expected score for the loser
            // Calculate new ELO ratings based on match outcome
            const winnerNewElo = Math.round(winner.eloRating + K * (1 - expectedWinner)); // Winner increase example: (1600 + 32 * (1 - 0.75)) = 1608
            const loserNewElo = Math.max(0, Math.round(loser.eloRating + K * (0 - expectedLoser))); // Loser decrease example: (1454 + 32 * (0 - 0.25)) = 1446
            // Calculate ELO changes for both players
            const winnerEloDelta = winnerNewElo - winner.eloRating; // Change in ELO for winner
            const loserEloDelta = loserNewElo - loser.eloRating; // Change in ELO for loser (negative value)

            // Update both users — accumulate weekly change
            await User.findByIdAndUpdate(winnerId, {
                eloRating: winnerNewElo,
                $inc: { eloRatingChange: winnerEloDelta }
            });
            await User.findByIdAndUpdate(loserId, {
                eloRating: loserNewElo,
                $inc: { eloRatingChange: loserEloDelta }
            });
        }

        // Arena tournament sync
        // If this match belongs to an arena tournament, increase winner score by 1 point
        // This ensures scores stay correct whether results are submitted here or via the dedicated:
        // POST /tournaments/:tid/arena-result endpoint.
        if (match.tournament) {
            const tournament = await Tournament.findById(match.tournament);
            if (tournament && tournament.tournamentType === 'arena' && tournament.status === 'ongoing') {
                const scoreEntry = tournament.arenaScores.find(
                    s => s.participant.toString() === winnerId.toString()
                );
                if (scoreEntry) {
                    scoreEntry.points += 1;
                    await tournament.save();
                }
            }
        }

        const updatedMatch = await Match.findById(mid)
            .populate('player1', 'username eloRating')
            .populate('player2', 'username eloRating')
            .populate('winner', 'username')
            .populate('loser', 'username')
            .populate('gameType', 'name');

        res.status(httpStatus.OK.code).json({
            success: true,
            message: 'Match result saved successfully',
            data: updatedMatch
        });
    } catch (err) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR.code).json({
            success: false,
            error: httpStatus.INTERNAL_SERVER_ERROR.message,
            message: 'Error saving match result',
            errorMessage: err.message
        });
    }
}

// PATCH update match information
export async function updateMatch(req, res) {
    try {
        const { mid } = req.params;
        const { visibility, tournament } = req.body;

        // Validate match ID format
        const validation = matchValidator.validateMid(mid);
        if (!validation.valid) {
            return res.status(validation.error).json({
                success: false,
                error: httpStatus.BAD_REQUEST.message,
                message: validation.message
            });
        }

        // Check if match exists
        const match = await Match.findById(mid);
        if (!match) {
            return res.status(httpStatus.NOT_FOUND.code).json({
                success: false,
                error: httpStatus.NOT_FOUND.message,
                message: `Match with ID '${mid}' not found`
            });
        }

        // Update only allowed fields
        const updateData = {};
        if (visibility) updateData.visibility = visibility;
        if (tournament) updateData.tournament = tournament;

        const updatedMatch = await Match.findByIdAndUpdate(
            mid,
            updateData,
            { new: true, runValidators: true }
        )
        .populate('player1', 'username eloRating')
        .populate('player2', 'username eloRating')
        .populate('winner', 'username')
        .populate('loser', 'username')
        .select('-__v');

        res.status(httpStatus.OK.code).json({
            success: true,
            message: 'Match updated successfully',
            data: updatedMatch
        });
    } catch (err) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR.code).json({
            success: false,
            error: httpStatus.INTERNAL_SERVER_ERROR.message,
            message: 'Error updating match',
            errorMessage: err.message
        });
    }
}

// DELETE match
export async function deleteMatch(req, res) {
    try {
        const { mid } = req.params;

        // Validate match ID format
        const validation = matchValidator.validateMid(mid);
        if (!validation.valid) {
            return res.status(validation.error).json({
                success: false,
                error: httpStatus.BAD_REQUEST.message,
                message: validation.message
            });
        }

        const deletedMatch = await Match.findByIdAndDelete(mid);

        if (!deletedMatch) {
            return res.status(httpStatus.NOT_FOUND.code).json({
                success: false,
                error: httpStatus.NOT_FOUND.message,
                message: `Match with ID '${mid}' not found`
            });
        }

        res.status(httpStatus.OK.code).json({
            success: true,
            message: 'Match deleted successfully',
            data: deletedMatch
        });
    } catch (err) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR.code).json({
            success: false,
            error: httpStatus.INTERNAL_SERVER_ERROR.message,
            message: 'Error deleting match',
            errorMessage: err.message
        });
    }
}

// GET user's matches
export async function getUserMatches(req, res) {
    try {
        const { uid } = req.params;

        // Validate user ID format
        const validation = matchValidator.validateMid(uid);
        if (!validation.valid) {
            return res.status(validation.error).json({
                success: false,
                error: httpStatus.BAD_REQUEST.message,
                message: validation.message
            });
        }

        // Check if user exists
        const user = await User.findById(uid);
        if (!user) {
            return res.status(httpStatus.NOT_FOUND.code).json({
                success: false,
                error: httpStatus.NOT_FOUND.message,
                message: `User with ID '${uid}' not found`
            });
        }

        // Find all matches involving this user
        const matches = await Match.find({
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
        .select('-__v');

        res.status(httpStatus.OK.code).json({
            success: true,
            data: matches,
            count: matches.length
        });
    } catch (err) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR.code).json({
            success: false,
            error: httpStatus.INTERNAL_SERVER_ERROR.message,
            message: 'Error retrieving user matches',
            errorMessage: err.message
        });
    }
}

// GET spectate match
export async function spectateMatch(req, res) {
    try {
        const { mid } = req.params;

        // Validate match ID format
        const validation = matchValidator.validateMid(mid);
        if (!validation.valid) {
            return res.status(validation.error).json({
                success: false,
                error: httpStatus.BAD_REQUEST.message,
                message: validation.message
            });
        }

        // Find match by ID and populate references
        const match = await Match.findById(mid)
            .populate('player1', 'username eloRating')
            .populate('player2', 'username eloRating')
            .populate('winner', 'username')
            .populate('loser', 'username')
            .populate('gameType', 'name numberOfRounds straightsAllowed timePerRound')
            .select('-__v');

        if (!match) {
            return res.status(httpStatus.NOT_FOUND.code).json({
                success: false,
                error: httpStatus.NOT_FOUND.message,
                message: `Match with ID '${mid}' not found`
            });
        }

        // Check visibility (only return public matches for spectators)
        if (match.visibility !== 'public') {
            return res.status(httpStatus.FORBIDDEN.code).json({
                success: false,
                error: httpStatus.FORBIDDEN.message,
                message: 'This match is private and cannot be spectated'
            });
        }

        res.status(httpStatus.OK.code).json({
            success: true,
            data: match
        });
    } catch (err) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR.code).json({
            success: false,
            error: httpStatus.INTERNAL_SERVER_ERROR.message,
            message: 'Error spectating match',
            errorMessage: err.message
        });
    }
}

// POST invite to match
export async function inviteToMatch(req, res) {
    try {
        const { mid } = req.params;
        const { invitedUserId } = req.body;

        // Validate match ID format
        const midValidation = matchValidator.validateMid(mid);
        if (!midValidation.valid) {
            return res.status(midValidation.error).json({
                success: false,
                error: httpStatus.BAD_REQUEST.message,
                message: midValidation.message
            });
        }

        // Validate invited user ID format
        const userValidation = matchValidator.validateMid(invitedUserId);
        if (!userValidation.valid) {
            return res.status(userValidation.error).json({
                success: false,
                error: httpStatus.BAD_REQUEST.message,
                message: 'Invalid invited user ID format'
            });
        }

        // Check if match exists
        const match = await Match.findById(mid);
        if (!match) {
            return res.status(httpStatus.NOT_FOUND.code).json({
                success: false,
                error: httpStatus.NOT_FOUND.message,
                message: `Match with ID '${mid}' not found`
            });
        }

        // Check if user exists
        const invitedUser = await User.findById(invitedUserId);
        if (!invitedUser) {
            return res.status(httpStatus.NOT_FOUND.code).json({
                success: false,
                error: httpStatus.NOT_FOUND.message, 
                message: 'Invited user not found'
            });
        }

        res.status(httpStatus.OK.code).json({
            success: true,
            message: 'Invitation sent successfully',
            data: {
                matchId: mid,
                invitedUser: invitedUser.username
            }
        });
    } catch (err) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR.code).json({
            success: false,
            error: httpStatus.INTERNAL_SERVER_ERROR.message,
            message: 'Error inviting user to match',
            errorMessage: err.message
        });
    }
}

// POST join match
export async function joinMatch(req, res) {
    try {
        const { mid } = req.params;
        const { userId } = req.body;

        // Validate match ID format
        const midValidation = matchValidator.validateMid(mid);
        if (!midValidation.valid) {
            return res.status(midValidation.error).json({
                success: false,
                error: httpStatus.BAD_REQUEST.message,
                message: midValidation.message
            });
        }

        // Validate user ID format
        const userValidation = matchValidator.validateMid(userId);
        if (!userValidation.valid) {
            return res.status(userValidation.error).json({
                success: false,
                error: httpStatus.BAD_REQUEST.message,
                message: 'Invalid user ID format'
            });
        }

        // Check if match exists
        const match = await Match.findById(mid);
        if (!match) {
            return res.status(httpStatus.NOT_FOUND.code).json({
                success: false,
                error: httpStatus.NOT_FOUND.message,
                message: `Match with ID '${mid}' not found`
            });
        }

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(httpStatus.NOT_FOUND.code).json({
                success: false,
                error: httpStatus.NOT_FOUND.message,
                message: 'User not found'
            });
        }

        // Check if user is banned
        if (user.isBanned) {
            return res.status(httpStatus.FORBIDDEN.code).json({
                success: false,
                error: httpStatus.FORBIDDEN.message,
                message: 'Banned users cannot join matches'
            });
        }

        // Checking if the joining player already has joined the game
        if (String(match.player1) === String(userId)) {
            return res.status(httpStatus.CONFLICT.code).json({
                success: false,
                error: httpStatus.CONFLICT.message,
                message: 'Player 1 cannot join the same match as Player 2'
            });
        }
        // Checking if usertype = anonymous and whether Anonymous players can join or not
        if (user.userType === 'anonymous' && match.allowAnonymousPlayers === false) {
            return res.status(httpStatus.FORBIDDEN.code).json({
                success: false,
                error: httpStatus.FORBIDDEN.message,
                message: 'Anonymous users are not allowed to join this match'
            });
        }
        // Checking if the elo is within scope
        if (
            typeof user.eloRating === 'number' &&(
                (typeof match.minElo === 'number' && user.eloRating < match.minElo) ||
                (typeof match.maxElo === 'number' && user.eloRating > match.maxElo)
            )
        ) {
            return res.status(httpStatus.FORBIDDEN.code).json({
                success: false,
                error: httpStatus.FORBIDDEN.message,
                message: 'Your Elo rating does not match this game requirement'
            });
        }

        if (!match.player2) {
            match.player2 = userId;
            match.status = 'ongoing';
            await match.save();
        } else {
            return res.status(httpStatus.CONFLICT.code).json({
                success: false,
                error: httpStatus.CONFLICT.message,
                message: 'Match is already full'
            });
        }

        const updatedMatch = await Match.findById(mid)
            .populate('player1', 'username eloRating userType')
            .populate('player2', 'username eloRating userType')
            .populate('gameType', 'name numOfRounds straightsAllowed timePerRound');

        res.status(httpStatus.OK.code).json({
            success: true,
            message: 'User joined match successfully',
            data: updatedMatch
        });
    } catch (err) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR.code).json({
            success: false,
            error: httpStatus.INTERNAL_SERVER_ERROR.message,
            message: 'Error joining match',
            errorMessage: err.message
        });
    }
}

// Export all controller methods
export default {
    getAllMatches,
    getMatchById,
    createMatch,
    saveResult,
    updateMatch,
    deleteMatch,
    getUserMatches,
    spectateMatch,
    inviteToMatch,
    joinMatch
};