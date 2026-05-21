import httpStatus from '../utils/statusCodes.js';

// Validates if a string is a valid custom game category ID format
const validateGcid = (id) => {
    // Custom IDs can be any non-empty string (e.g., category_abc123)
    if (!id || typeof id !== 'string' || id.trim().length === 0) {
        return {
            valid: false,
            error: httpStatus.BAD_REQUEST.code,
            message: 'Invalid game category ID format'
        };
    }
    return { valid: true };
};

// Validates game category creation fields (name, numOfRounds, straightsAllowed, timePerRound)
const validateGameCategoryCreation = (name, numOfRounds, straightsAllowed, timePerRound) => {
    if (!name || numOfRounds === undefined || straightsAllowed === undefined || !timePerRound) {
        return {
            valid: false,
            error: httpStatus.BAD_REQUEST.code,
            message: 'name, numOfRounds, straightsAllowed, and timePerRound are required'
        };
    }
    // Validate name
    if (typeof name !== 'string' || name.trim().length === 0) {
        return {
            valid: false,
            error: httpStatus.BAD_REQUEST.code,
            message: 'Category name must be a non-empty string'
        };
    }
    // Validate numOfRounds
    if (![3, 5, 7].includes(numOfRounds)) {
        return {
            valid: false,
            error: httpStatus.BAD_REQUEST.code,
            message: 'numOfRounds must be 3, 5, or 7'
        };
    }
    // Validate straightsAllowed
    if (typeof straightsAllowed !== 'boolean') {
        return {
            valid: false,
            error: httpStatus.BAD_REQUEST.code,
            message: 'straightsAllowed must be a boolean'
        };
    }
    // Validate timePerRound
    if (![3, 10, 30].includes(timePerRound)) {
        return {
            valid: false,
            error: httpStatus.BAD_REQUEST.code,
            message: 'timePerRound must be 3, 10, or 30 seconds'
        };
    }

    return { valid: true };
};

// Validates game category update fields
const validateGameCategoryUpdate = (numOfRounds, timePerRound) => {
    // Only validate fields if they are being updated
    // Validate numOfRounds if provided
    if (numOfRounds && ![3, 5, 7].includes(numOfRounds)) {
        return {
            valid: false,
            error: httpStatus.BAD_REQUEST.code,
            message: 'numOfRounds must be 3, 5, or 7'
        };
    }

    // Validate timePerRound if provided
    if (timePerRound && ![3, 10, 30].includes(timePerRound)) {
        return {
            valid: false,
            error: httpStatus.BAD_REQUEST.code,
            message: 'timePerRound must be 3, 10, or 30 seconds'
        };
    }

    return { valid: true };
};

export default {
    validateGcid,
    validateGameCategoryCreation,
    validateGameCategoryUpdate
};