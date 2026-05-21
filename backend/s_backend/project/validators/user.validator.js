import httpStatus from "../utils/statusCodes.js"; 

// Validates if a string is a valid custom user ID format
const validateUid = (uid) => {
    // Check if uid is a non-empty string
    if (!uid || typeof uid !== 'string' || uid.trim().length === 0) {
        return {
            valid: false,
            error: httpStatus.BAD_REQUEST.code,
            message: 'Invalid user ID format'
        };
    }
    return { valid: true };
};

// Validates required user fields for creation
const validateUserCreation = (username, age) => {
    // Check if username and age are provided
    if (!username || !age) {
        return {
            valid: false,
            error: httpStatus.BAD_REQUEST.code,
            message: 'Username and age are required'
        };
    }
    // Validate username is a non-empty string
    if (typeof username !== 'string' || username.trim().length === 0) {
        return {
            valid: false,
            error: httpStatus.BAD_REQUEST.code,
            message: 'Username must be a non-empty string'
        };
    }
    // Validate age is a number and at least 18
    if (typeof age !== 'number' || age < 18) {
        return {
            valid: false,
            error: httpStatus.BAD_REQUEST.code,
            message: 'User must be at least 18 years old'
        };
    }

    return { valid: true };
};

// Validates user update fields
const validateUserUpdate = (age) => {
    // Age is optional, but if provided, it must be at least 18
    if (age && age < 18) {
        return {
            valid: false,
            error: httpStatus.BAD_REQUEST.code,
            message: 'User must be at least 18 years old'
        };
    }
    return { valid: true };
};

export default {
    validateUid,
    validateUserCreation,
    validateUserUpdate
};