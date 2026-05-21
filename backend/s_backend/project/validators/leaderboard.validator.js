import httpStatus from '../utils/statusCodes.js';

// Validates if a string is a valid custom ID format
const validateId = (id) => {
    if (!id || typeof id !== 'string' || id.trim().length === 0) {
        return {
            valid: false,
            error: httpStatus.BAD_REQUEST.code,
            message: 'Invalid ID format'
        };
    }
    return { valid: true };
};

// Validates pagination parameters
const validatePagination = (limit, offset) => {
    const limitNum = parseInt(limit);
    const offsetNum = parseInt(offset);

    // Limit must be a positive integer between 1 and 100
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
        return {
            valid: false,
            error: httpStatus.BAD_REQUEST.code,
            message: 'Limit must be a number between 1 and 100' 
        };
    }
    // Offset must be a non-negative integer
    if (isNaN(offsetNum) || offsetNum < 0) {
        return {
            valid: false,
            error: httpStatus.BAD_REQUEST.code,
            message: 'Offset must be a non-negative number'
        };
    }

    return { valid: true };
};

// Validates user type filter
const validateUserType = (userType) => {
    if (!userType) {
        return {
            valid: false,
            error: httpStatus.BAD_REQUEST.code,
            message: 'userType is required'
        };
    }

    // userType must be one of the allowed values
    if (!['registered', 'anonymous', 'admin'].includes(userType)) {
        return {
            valid: false,
            error: httpStatus.BAD_REQUEST.code,
            message: 'userType must be "registered", "anonymous", or "admin"'
        };
    }

    return { valid: true };
};

// Validates top player count parameter
const validateTopPlayerCount = (count) => {
    const countNum = parseInt(count);

    // Count must be a positive integer between 1 and 100
    if (isNaN(countNum) || countNum < 1 || countNum > 100) {
        return {
            valid: false,
            error: httpStatus.BAD_REQUEST.code,
            message: 'Count must be a number between 1 and 100'
        };
    }

    return { valid: true };
};

export default {
    validateId,
    validatePagination,
    validateUserType,
    validateTopPlayerCount
};