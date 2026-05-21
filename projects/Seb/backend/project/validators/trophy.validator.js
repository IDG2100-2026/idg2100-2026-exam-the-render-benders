import httpStatus from '../utils/statusCodes.js';

// Validates trophy ID format
const validateTid = (id) => {
    // Check if ID is a non-empty string
    if (!id || typeof id !== 'string' || id.trim().length === 0) {
        return {
            valid: false,
            error: httpStatus.BAD_REQUEST.code,
            message: 'Invalid trophy ID format'
        };
    }
    return { valid: true };
};

// Validates trophy creation input
const validateTrophyCreation = (title, tournamentId) => {
    // Check for required fields
    if (!title || !tournamentId) {
        return {
            valid: false,
            error: httpStatus.BAD_REQUEST.code,
            message: 'Title and tournament ID are required'
        };
    }
    // Validate title, ensuring it's a non-empty string
    if (typeof title !== 'string' || title.trim().length === 0) {
        return {
            valid: false,
            error: httpStatus.BAD_REQUEST.code,
            message: 'Trophy title must be a non-empty string'
        };
    }

    return { valid: true };
};

export default {
    validateTid,
    validateTrophyCreation
}; 