import { Comment } from '../models/comment.js';
import { User } from '../models/users.js';
import { Match } from '../models/match.js';
import { Tournament } from '../models/tournament.js';
import httpStatus from '../utils/statusCodes.js';
import commentValidator from '../validators/comment.validator.js';

// GET all match comments for a specific match
export async function getMatchComments(req, res) {
    try {
        const { mid } = req.params;

        // Validate match ID
        const validation = commentValidator.validateId(mid);
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

        // Retrieve comments for the match, populate author username, and sort by creation date
        const comments = await Comment.find({ match: mid, commentType: 'match' })
            .populate('author', 'username')
            .sort({ createdAt: -1 })
            .select('-__v');

        res.status(httpStatus.OK.code).json({
            success: true,
            data: comments,
            count: comments.length
        });
    } catch (err) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR.code).json({
            success: false,
            error: httpStatus.INTERNAL_SERVER_ERROR.message,
            message: 'Error retrieving match comments',
            errorMessage: err.message
        });
    }
}

// GET all tournament comments for a specific tournament
export async function getTournamentComments(req, res) {
    try {
        const { tid } = req.params;

        // Validate tournament ID
        const validation = commentValidator.validateId(tid);
        if (!validation.valid) {
            return res.status(validation.error).json({
                success: false,
                error: httpStatus.BAD_REQUEST.message,
                message: validation.message
            });
        }

        // Check if tournament exists
        const tournament = await Tournament.findById(tid);
        if (!tournament) {
            return res.status(httpStatus.NOT_FOUND.code).json({
                success: false,
                error: httpStatus.NOT_FOUND.message,
                message: `Tournament with ID '${tid}' not found`
            });
        }

        // Retrieve comments for the tournament, populate author username, and sort by creation date
        const comments = await Comment.find({ tournament: tid, commentType: 'tournament' })
            .populate('author', 'username')
            .sort({ createdAt: -1 })
            .select('-__v');

        res.status(httpStatus.OK.code).json({
            success: true,
            data: comments,
            count: comments.length
        });
    } catch (err) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR.code).json({
            success: false,
            error: httpStatus.INTERNAL_SERVER_ERROR.message,
            message: 'Error retrieving tournament comments',
            errorMessage: err.message
        });
    }
}

// POST create comment on a specific match
export async function createMatchComment(req, res) {
    try {
        const { mid } = req.params; // Get match ID from URL params
        const { author, content } = req.body; // Get author and content from request body

        // Validate match ID
        const midValidation = commentValidator.validateId(mid);
        if (!midValidation.valid) {
            return res.status(midValidation.error).json({
                success: false,
                error: httpStatus.BAD_REQUEST.message,
                message: midValidation.message
            });
        }

        // Validate comment fields
        const commentValidation = commentValidator.validateCommentCreation(author, content);
        if (!commentValidation.valid) {
            return res.status(commentValidation.error).json({
                success: false,
                error: httpStatus.BAD_REQUEST.message,
                message: commentValidation.message
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

        // Check if author exists
        const authorUser = await User.findById(author);
        if (!authorUser) {
            return res.status(httpStatus.NOT_FOUND.code).json({
                success: false,
                error: httpStatus.NOT_FOUND.message,
                message: 'Author user not found'
            });
        }

        // Check if author is banned
        if (authorUser.isBanned) {
            return res.status(httpStatus.FORBIDDEN.code).json({
                success: false,
                error: httpStatus.FORBIDDEN.message,
                message: 'Banned users cannot post comments'
            });
        }

        // Create new comment
        const newComment = new Comment({
            author,
            content,
            commentType: 'match',
            match: mid,
            tournament: null
        });

        await newComment.save();

        // Populate author username before sending response
        const populatedComment = await Comment.findById(newComment._id)
            .populate('author', 'username');

        res.status(httpStatus.CREATED.code).json({
            success: true,
            message: 'Comment created successfully',
            data: populatedComment
        });
    } catch (err) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR.code).json({
            success: false,
            error: httpStatus.INTERNAL_SERVER_ERROR.message,
            message: 'Error creating match comment',
            errorMessage: err.message
        });
    }
}

// POST create comment on a specific tournament
export async function createTournamentComment(req, res) {
    try {
        const { tid } = req.params; // Get tournament ID from URL params
        const { author, content } = req.body; // Get author and content from request body

        // Validate tournament ID
        const tidValidation = commentValidator.validateId(tid);
        if (!tidValidation.valid) {
            return res.status(tidValidation.error).json({
                success: false,
                error: httpStatus.BAD_REQUEST.message,
                message: tidValidation.message
            });
        }

        // Validate comment fields
        const commentValidation = commentValidator.validateCommentCreation(author, content);
        if (!commentValidation.valid) {
            return res.status(commentValidation.error).json({
                success: false,
                error: httpStatus.BAD_REQUEST.message,
                message: commentValidation.message
            });
        }

        // Check if tournament exists
        const tournament = await Tournament.findById(tid);
        if (!tournament) {
            return res.status(httpStatus.NOT_FOUND.code).json({
                success: false,
                error: httpStatus.NOT_FOUND.message,
                message: `Tournament with ID '${tid}' not found`
            });
        }

        // Check if author exists
        const authorUser = await User.findById(author);
        if (!authorUser) {
            return res.status(httpStatus.NOT_FOUND.code).json({
                success: false,
                error: httpStatus.NOT_FOUND.message,
                message: 'Author user not found'
            });
        }

        // Check if author is banned
        if (authorUser.isBanned) {
            return res.status(httpStatus.FORBIDDEN.code).json({
                success: false,
                error: httpStatus.FORBIDDEN.message,
                message: 'Banned users cannot post comments'
            });
        }

        // Create new comment
        const newComment = new Comment({
            author,
            content,
            commentType: 'tournament',
            match: null,
            tournament: tid
        });

        await newComment.save();

        // Populate author username before sending response
        const populatedComment = await Comment.findById(newComment._id)
            .populate('author', 'username');

        res.status(httpStatus.CREATED.code).json({
            success: true,
            message: 'Comment created successfully',
            data: populatedComment
        });
    } catch (err) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR.code).json({
            success: false,
            error: httpStatus.INTERNAL_SERVER_ERROR.message,
            message: 'Error creating tournament comment',
            errorMessage: err.message
        });
    }
}

// DELETE comment (Only by author or admin)
export async function deleteComment(req, res) {
    try {
        const { cid } = req.params; // Comment ID from URL params
        const { userId } = req.body; // The user attempting to delete (should be the author or an admin) from request body

        // Validate comment ID
        const cidValidation = commentValidator.validateId(cid);
        if (!cidValidation.valid) {
            return res.status(cidValidation.error).json({
                success: false,
                error: httpStatus.BAD_REQUEST.message,
                message: cidValidation.message
            });
        }
        const comment = await Comment.findById(cid); // Find the comment to be deleted
        if (!comment) {
            return res.status(httpStatus.NOT_FOUND.code).json({
                success: false,
                error: httpStatus.NOT_FOUND.message,
                message: `Comment with ID '${cid}' not found`
            });
        }

        // Check if user is author or admin
        const user = await User.findById(userId);
        if (!user) {
            return res.status(httpStatus.NOT_FOUND.code).json({
                success: false,
                error: httpStatus.NOT_FOUND.message,
                message: 'User not found'
            });
        }

        // Allow deletion if user is author or admin
        if (comment.author.toString() !== userId.toString() && user.userType !== 'admin') {
            return res.status(httpStatus.FORBIDDEN.code).json({
                success: false,
                error: httpStatus.FORBIDDEN.message,
                message: 'You can only delete your own comments'
            });
        }

        const deletedComment = await Comment.findByIdAndDelete(cid); // Delete the comment

        res.status(httpStatus.OK.code).json({
            success: true,
            message: 'Comment deleted successfully',
            data: deletedComment
        });
    } catch (err) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR.code).json({
            success: false,
            error: httpStatus.INTERNAL_SERVER_ERROR.message,
            message: 'Error deleting comment',
            errorMessage: err.message
        });
    }
}

// GET all comments (admin only)
export async function getAllComments(req, res) {
    try {
        const { commentType, author, limit = 50, offset = 0 } = req.query; // Get query parameters for filtering and pagination
        const limitNum = Math.min(Math.max(parseInt(limit) || 50, 1), 100); // Limit between 1 and 100, default to 50
        const offsetNum = Math.max(parseInt(offset) || 0, 0); // Offset must be 0 or greater

        const filter = {}; // Build filter object based on query parameters
        if (commentType) filter.commentType = commentType; // Filter by comment type if provided
        if (author) filter.author = author; // Filter by author ID if provided

        const [comments, total] = await Promise.all([
            Comment.find(filter) // Find comments based on filter
                .populate('author', 'username')
                .populate('match', 'player1 player2')
                .populate('tournament', 'title')
                .sort({ createdAt: -1 })
                .limit(limitNum)
                .skip(offsetNum)
                .select('-__v'),
            Comment.countDocuments(filter)
        ]);

        res.status(httpStatus.OK.code).json({
            success: true,
            data: comments,
            pagination: { total, limit: limitNum, offset: offsetNum, hasMore: offsetNum + limitNum < total }
        });

    } catch (err) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR.code).json({
            success: false,
            error: httpStatus.INTERNAL_SERVER_ERROR.message,
            message: 'Error retrieving comments',
            errorMessage: err.message
        });
    }
}

// DELETE comment (admin only)
export async function deleteCommentAdmin(req, res) {
    try {
        const { cid } = req.params; // Comment ID from URL params

        // Validate comment ID
        const validation = commentValidator.validateId(cid);
        if (!validation.valid) {
            return res.status(validation.error).json({
                success: false,
                error: httpStatus.BAD_REQUEST.message,
                message: validation.message
            });
        }

        const deletedComment = await Comment.findByIdAndDelete(cid); // Delete the comment by ID

        if (!deletedComment) {
            return res.status(httpStatus.NOT_FOUND.code).json({
                success: false,
                error: httpStatus.NOT_FOUND.message,
                message: `Comment with ID '${cid}' not found`
            });
        }

        res.status(httpStatus.OK.code).json({
            success: true,
            message: 'Comment deleted successfully by admin',
            data: deletedComment
        });
    } catch (err) { 
        res.status(httpStatus.INTERNAL_SERVER_ERROR.code).json({
            success: false,
            error: httpStatus.INTERNAL_SERVER_ERROR.message,
            message: 'Error deleting comment',
            errorMessage: err.message
        });
    }
}

export default {
    getMatchComments,
    getTournamentComments,
    createMatchComment,
    createTournamentComment,
    deleteComment,
    getAllComments,
    deleteCommentAdmin
};