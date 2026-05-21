import httpStatus from "../utils/statusCodes.js";

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

// Validates comment creation fields
const validateCommentCreation = (author, content) => {
    // Check if author and content are provided
    if (!author || !content) {
        return {
            valid: false, 
            error: httpStatus.BAD_REQUEST.code,
            message: 'Author and content are required'
        };
    }
    // Validate if content is a non-empty string
    if (typeof content !== 'string' || content.trim().length === 0) {
        return {
            valid: false,
            error: httpStatus.BAD_REQUEST.code,
            message: 'Content must be a non-empty string'
        };
    }
    // Validate content length
    if (content.length > 1000) {
        return {
            valid: false,
            error: httpStatus.BAD_REQUEST.code,
            message: 'Comment content cannot exceed 1000 characters'
        };
    }

    return { valid: true };
};

export default {
    validateId,
    validateCommentCreation
};