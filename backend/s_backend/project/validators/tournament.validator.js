import httpStatus from '../utils/statusCodes.js';

// Validates if a string is a valid custom tournament ID format
const validateTid = (id) => {
    if (!id || typeof id !== 'string' || id.trim().length === 0) {
        return {
            valid: false,
            error: httpStatus.BAD_REQUEST.code,
            message: 'Invalid tournament ID format'
        };
    }
    return { valid: true };
};

// Validates tournament creation fields
const validateTournamentCreation = (title, tournamentType, gameCategory, startDateTime, createdBy) => {
    // Check for required fields
    if (!title || !tournamentType || !gameCategory || !startDateTime || !createdBy) {
        return {
            valid: false,
            error: httpStatus.BAD_REQUEST.code,
            message: 'Title, Tournament type, Game category, Start time, and created by are required'
        };
    }

    // Validate tournament type, must be either 'knockout' or 'arena'
    if (!['knockout', 'arena'].includes(tournamentType)) {
        return {
            valid: false,
            error: httpStatus.BAD_REQUEST.code,
            message: 'Tournament type must be either "knockout" or "arena"'
        };
    }

    // Check if start date is in the future
    const startDate = new Date(startDateTime);
    if (startDate <= new Date()) {
        return {
            valid: false,
            error: httpStatus.BAD_REQUEST.code,
            message: 'Tournament start date must be in the future'
        };
    }

    return { valid: true };
};

export default {
    validateTid,
    validateTournamentCreation
};