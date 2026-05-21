import { GameCategory } from "../models/game.js";
import httpStatus from "../utils/statusCodes.js";
import gameCategoryValidator from '../validators/gameCategory.validator.js';

// GET all game categories
export async function getAllGameCategories(req, res){
    try{
        // Retrieve all game categories sorted by creation date (newest first)
        const categories = await GameCategory.find()
            .sort({ createdAt: -1 })
            .select('-__v');

        res.status(httpStatus.OK.code).json({
            success: true,
            data: categories,
            count: categories.length
        });
    } catch(err) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR.code).json({
            success: false,
            error: httpStatus.INTERNAL_SERVER_ERROR.message,
            message: 'Error retrieving game categories',
            errorMessage: err.message
        });
    }
}

// GET game category by ID
export async function getGameCategoryById(req, res) {
    try {
        const { gcid } = req.params;

        // Validate game category ID
        const validation = gameCategoryValidator.validateGcid(gcid);
        if (!validation.valid) {
            return res.status(validation.error).json({
                success: false,
                error: httpStatus.BAD_REQUEST.message,
                message: validation.message
            });
        }
        // Retrieve game category by ID. Exclude __v field from response.
        const category = await GameCategory.findById(gcid).select('-__v');

        if (!category) {
            return res.status(httpStatus.NOT_FOUND.code).json({
                success: false,
                error: httpStatus.NOT_FOUND.message,
                message: `Game category with ID '${gcid}' not found`
            });
        }

        res.status(httpStatus.OK.code).json({
            success: true,
            data: category
        });
    } catch (err) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR.code).json({
            success: false,
            error: httpStatus.INTERNAL_SERVER_ERROR.message,
            message: 'Error retrieving game category',
            errorMessage: err.message
        });
    }
}

// POST create game category (Admin only)
export async function createGameCategory(req, res) {
    try {
        const { name, numOfRounds, straightsAllowed, timePerRound } = req.body; // Extract fields from request body

        // Validate required fields
        const validation = gameCategoryValidator.validateGameCategoryCreation(
            name,
            numOfRounds,
            straightsAllowed,
            timePerRound
        );
        if (!validation.valid) {
            return res.status(validation.error).json({
                success: false,
                error: httpStatus.BAD_REQUEST.message,
                message: validation.message
            });
        }

        // Check if category with same name already exists
        const existingCategory = await GameCategory.findOne({ name });
        if (existingCategory) {
            return res.status(httpStatus.CONFLICT.code).json({
                success: false,
                error: httpStatus.CONFLICT.message,
                message: 'Game category with this name already exists'
            });
        }

        // Create new game category
        const newCategory = new GameCategory({
            name,
            numOfRounds,
            straightsAllowed,
            timePerRound
        });

        await newCategory.save(); // Save the new category to the database

        res.status(httpStatus.CREATED.code).json({
            success: true,
            message: 'Game category created successfully',
            data: newCategory
        });
    } catch (err) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR.code).json({
            success: false,
            error: httpStatus.INTERNAL_SERVER_ERROR.message,
            message: 'Error creating game category',
            errorMessage: err.message
        });
    }
}

// PATCH update game category (Admin only)
export async function updateGameCategory(req, res) {
    try {
        const { gcid } = req.params; // Game category ID from URL parameters
        const { name, numOfRounds, straightsAllowed, timePerRound } = req.body; // Fields to update from request body

        // Validate game category ID
        const gcidValidation = gameCategoryValidator.validateGcid(gcid);
        if (!gcidValidation.valid) {
            return res.status(gcidValidation.error).json({
                success: false,
                error: httpStatus.BAD_REQUEST.message,
                message: gcidValidation.message
            });
        }

        // Check if category exists
        const category = await GameCategory.findById(gcid);
        if (!category) {
            return res.status(httpStatus.NOT_FOUND.code).json({
                success: false,
                error: httpStatus.NOT_FOUND.message,
                message: `Game category with ID '${gcid}' not found`
            });
        }

        // Validate update fields
        const updateValidation = gameCategoryValidator.validateGameCategoryUpdate(
            numOfRounds,
            timePerRound
        );
        if (!updateValidation.valid) {
            return res.status(updateValidation.error).json({
                success: false,
                error: httpStatus.BAD_REQUEST.message,
                message: updateValidation.message
            });
        }

        // Check if new name already exists (if being changed)
        if (name && name !== category.name) {
            const existingCategory = await GameCategory.findOne({ name });
            if (existingCategory) {
                return res.status(httpStatus.CONFLICT.code).json({
                    success: false,
                    error: httpStatus.CONFLICT.message,
                    message: 'Game category with this name already exists'
                });
            }
        }

        // Update only allowed fields
        const updateData = {};
        if (name) updateData.name = name;
        if (numOfRounds) updateData.numOfRounds = numOfRounds;
        if (straightsAllowed !== undefined) updateData.straightsAllowed = straightsAllowed;
        if (timePerRound) updateData.timePerRound = timePerRound;

        const updatedCategory = await GameCategory.findByIdAndUpdate(
            gcid,
            updateData,
            { returnDocument: 'after', runValidators: true }
        ).select('-__v');
 
        res.status(httpStatus.OK.code).json({
            success: true,
            message: 'Game category updated successfully',
            data: updatedCategory
        });
    } catch (err) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR.code).json({
            success: false,
            error: httpStatus.INTERNAL_SERVER_ERROR.message,
            message: 'Error updating game category',
            errorMessage: err.message
        });
    }
}

// DELETE game category (Admin only)
export async function deleteGameCategory(req, res) {
    try {
        const { gcid } = req.params; // Game category ID from URL parameters

        // Validate game category ID
        const validation = gameCategoryValidator.validateGcid(gcid);
        if (!validation.valid) {
            return res.status(validation.error).json({
                success: false,
                error: httpStatus.BAD_REQUEST.message,
                message: validation.message
            });
        }

        // Attempt to delete the game category by ID
        const deletedCategory = await GameCategory.findByIdAndDelete(gcid);

        if (!deletedCategory) {
            return res.status(httpStatus.NOT_FOUND.code).json({
                success: false,
                error: httpStatus.NOT_FOUND.message,
                message: `Game category with ID '${gcid}' not found`
            });
        }

        res.status(httpStatus.OK.code).json({
            success: true,
            message: 'Game category deleted successfully',
            data: deletedCategory
        });
    } catch (err) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR.code).json({
            success: false,
            error: httpStatus.INTERNAL_SERVER_ERROR.message,
            message: 'Error deleting game category',
            errorMessage: err.message
        });
    }
}

// GET category by name
export async function getGameCategoryByName(req, res) {
    try {
        const { name } = req.query;

        // Check if name query parameter is provided and valid
        if (!name || typeof name !== 'string' || name.trim().length === 0) {
            return res.status(httpStatus.BAD_REQUEST.code).json({
                success: false,
                error: httpStatus.BAD_REQUEST.message,
                message: 'Category name is required'
            });
        }

        const category = await GameCategory.findOne({ name }).select('-__v');

        if (!category) {
            return res.status(httpStatus.NOT_FOUND.code).json({
                success: false,
                error: httpStatus.NOT_FOUND.message,
                message: `Game category '${name}' not found`
            });
        }

        res.status(httpStatus.OK.code).json({
            success: true,
            data: category
        });
    } catch (err) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR.code).json({
            success: false,
            error: httpStatus.INTERNAL_SERVER_ERROR.message,
            message: 'Error retrieving game category',
            errorMessage: err.message
        });
    }
}

// Export all game category controller methods
export default {
    getAllGameCategories,
    getGameCategoryById,
    createGameCategory,
    updateGameCategory,
    deleteGameCategory,
    getGameCategoryByName
};
