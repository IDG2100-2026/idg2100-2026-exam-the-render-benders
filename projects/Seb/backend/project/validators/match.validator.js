import httpStatus from '../utils/statusCodes.js';

// Validates if a string is a valid custom ID format
const validateMid = (id) => {
    // Custom IDs can be any non-empty string (e.g., match_abc123)
    if (!id || typeof id !== 'string' || id.trim().length === 0) {
        return {
            valid: false,
            error: httpStatus.BAD_REQUEST.code,
            message: 'Invalid ID format'
        };
    }
    return { valid: true };
};

// Validates match creation fields
const validateMatchCreation = ( player1, player2, gameType, allowAnonymousPlayers, minElo, maxElo ) => {
    // player1 and gameType are required, player2 is optional
    if (!player1 || !gameType) {
        return {
            valid: false,
            error: httpStatus.BAD_REQUEST.code,
            message: 'player1 and gameType are required'
        };
    }

    // Only check for self-match if player2 is actually provided
    if (player2 && player1 === player2) {
        return {
            valid: false,
            error: httpStatus.BAD_REQUEST.code,
            message: 'A player cannot play against themselves'
        };
    }

    // Check for allowed anon players
    if ( allowAnonymousPlayers !== undefined && typeof allowAnonymousPlayers !== 'boolean') {
        return {
            valid: false,
            error: httpStatus.BAD_REQUEST.code,
            message: 'allowAnonymousPlayers must be a boolean'
        };
    }

    // Check min/max elo
    if (minElo !== undefined) {
        if (!Number.isInteger(minElo) || minElo < 0) {
            return {
                valid: false,
                error: httpStatus.BAD_REQUEST.code,
                message: 'minElo must be a non-negative integer'
            };
        }
    }

    if (maxElo !== undefined) {
        if (!Number.isInteger(maxElo) || maxElo < 0) {
            return {
                valid: false,
                error: httpStatus.BAD_REQUEST.code,
                message: 'maxElo must be a non-negative integer'
            };
        }
    }
    if ( minElo !== undefined && maxElo !== undefined && Number.isInteger(minElo) && Number.isInteger(maxElo) && minElo > maxElo) {
        return {
            valid: false,
            error: httpStatus.BAD_REQUEST.code,
            message: 'minElo cannot be greater than maxElo'
        };
    }
    return { valid: true }; 
};
// Validates match scores
const validateScores = (player1Score, player2Score) => {
    // Both scores are required and must be non-negative integers
    if (player1Score === undefined || player2Score === undefined) {
        return {
            valid: false,
            error: httpStatus.BAD_REQUEST.code,
            message: 'Both player1Score and player2Score are required'
        };
    }
    if (player1Score < 0 || player2Score < 0) {
        return {
            valid: false,
            error: httpStatus.BAD_REQUEST.code,
            message: 'Scores cannot be negative'
        };
    }
    
    // Ensure scores are integers
    if (!Number.isInteger(player1Score) || !Number.isInteger(player2Score)) {
        return {
            valid: false,
            error: httpStatus.BAD_REQUEST.code,
            message: 'Scores must be integers'
        };
    }

    return { valid: true };
};

export default {
    validateMid,
    validateMatchCreation,
    validateScores
};