import matchmakingService from '../services/matchmaking.service.js';
import { GameCategory }   from '../models/game.js';
import { Match }          from '../models/match.js';
import httpStatus         from '../utils/statusCodes.js';

// Adds the player to the queue. 
export async function joinQueue(req, res) {
    try {
        const { userId, gameCategory } = req.body; // Get userId and gameCategory from request body
        // Validate input, if either is missing return a 400 Bad Request
        if (!userId || !gameCategory) {
            return res.status(httpStatus.BAD_REQUEST.code).json({
                success: false,
                error: httpStatus.BAD_REQUEST.message,
                message: 'userId and gameCategory are required'
            });
        }

        // Verify the game category exists before queuing
        const category = await GameCategory.findById(gameCategory);
        if (!category) {
            return res.status(httpStatus.NOT_FOUND.code).json({
                success: false,
                error: httpStatus.NOT_FOUND.message,
                message: `Game category '${gameCategory}' not found`
            });
        }
        // Attempt to enqueue the player and handle possible failure reasons
        const result = await matchmakingService.enqueue(userId, gameCategory);

        if (!result.ok) {
            const messageMap = {
                already_queued:        'You are already in the matchmaking queue',
                user_not_found:        'User not found',
                banned:                'Banned users cannot use matchmaking',
                anonymous_not_allowed: 'Anonymous users cannot use matchmaking — please register first'
            };
            return res.status(httpStatus.CONFLICT.code).json({
                success: false,
                error: httpStatus.CONFLICT.message,
                message: messageMap[result.reason] ?? 'Could not join queue'
            });
        }

        res.status(httpStatus.OK.code).json({
            success: true,
            message: 'You have joined the matchmaking queue. Poll GET /matchmaking/status/:uid for updates.',
            data: { userId, gameCategory, gameCategoryName: category.name }
        });
    } catch (err) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR.code).json({
            success: false,
            error: httpStatus.INTERNAL_SERVER_ERROR.message,
            message: 'Error joining matchmaking queue',
            errorMessage: err.message
        });
    }
}

// Removes the player from the queue.
export async function leaveQueue(req, res) {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(httpStatus.BAD_REQUEST.code).json({
                success: false,
                error: httpStatus.BAD_REQUEST.message,
                message: 'userId is required'
            });
        }
        // Attempt to dequeue the player and handle possible failure reasons
        const removed = matchmakingService.dequeue(userId);

        if (!removed) {
            return res.status(httpStatus.NOT_FOUND.code).json({
                success: false,
                error: httpStatus.NOT_FOUND.message,
                message: 'User is not currently in the matchmaking queue'
            });
        }

        res.status(httpStatus.OK.code).json({
            success: true,
            message: 'You have left the matchmaking queue'
        });
    } catch (err) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR.code).json({
            success: false,
            error: httpStatus.INTERNAL_SERVER_ERROR.message,
            message: 'Error leaving matchmaking queue',
            errorMessage: err.message
        });
    }
}

// Poll this endpoint after joining the queue.
export async function getQueueStatus(req, res) {
    try {
        const { uid } = req.params;

        const entry = matchmakingService.getStatus(uid);

        if (!entry) {
            return res.status(httpStatus.OK.code).json({
                success: true,
                status: 'not_in_queue'
            });
        }

        if (entry.matchId) {
            // Match is ready — fetch basic match info and remove from queue
            const match = await Match.findById(entry.matchId)
                .populate('player1', 'username eloRating')
                .populate('player2', 'username eloRating')
                .populate('gameType', 'name numOfRounds straightsAllowed timePerRound')
                .select('-__v');

            // Remove from queue now that the player has gotten their match
            matchmakingService.dequeue(uid);

            return res.status(httpStatus.OK.code).json({
                success: true,
                status: 'matched',
                message: 'A match has been found!',
                data: match
            });
        }

        // Still searching, save how long they have been waiting and the
        // current ELO window so the client can show meaningful feedback
        const waitSeconds  = Math.round((Date.now() - new Date(entry.joinedAt).getTime()) / 1000);
        const steps        = Math.floor((waitSeconds * 1000) / 10_000); // RELAX_INTERVAL_MS
        const currentWindow = Math.min(100 + steps * 50, 600);          // mirrors service constants

        res.status(httpStatus.OK.code).json({
            success: true,
            status: 'searching',
            data: {
                userId: entry.userId,
                gameCategory: entry.gameCategory,
                waitSeconds,
                currentEloWindow: currentWindow
            }
        });
    } catch (err) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR.code).json({
            success: false,
            error: httpStatus.INTERNAL_SERVER_ERROR.message,
            message: 'Error retrieving matchmaking status',
            errorMessage: err.message
        });
    }
}

// Returns a snapshot of everyone currently in the queue.
export async function getQueueSnapshot(req, res) {
    try {
        const snapshot = matchmakingService.getQueueSnapshot();
        
        // Calculate wait time for each entry and format the response
        const now = Date.now(); 
        const entries = snapshot.map(e => ({
            userId:       e.userId,
            eloRating:    e.eloRating,
            gameCategory: e.gameCategory,
            waitSeconds:  Math.round((now - new Date(e.joinedAt).getTime()) / 1000),
            matched:      e.matchId !== null
        }));

        res.status(httpStatus.OK.code).json({
            success: true,
            queueLength: entries.length,
            data: entries
        });
    } catch (err) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR.code).json({
            success: false,
            error: httpStatus.INTERNAL_SERVER_ERROR.message,
            message: 'Error retrieving queue snapshot',
            errorMessage: err.message
        });
    }
}

export default { joinQueue, leaveQueue, getQueueStatus, getQueueSnapshot };