import { Trophy } from '../models/trophy.js';
import { Tournament } from '../models/tournament.js';
import httpStatus from '../utils/statusCodes.js';
import trophyValidator from '../validators/trophy.validator.js';

// POST upload trophy image
// Uploads an image for a trophy and returns the file path/URL
export async function uploadTrophyImage(req, res) {
    try {
        if (!req.file) {
            return res.status(httpStatus.BAD_REQUEST.code).json({
                success: false,
                error: httpStatus.BAD_REQUEST.message,
                message: 'No file uploaded'
            });
        }

        // Return file path/URL
        const imageUrl = `/uploads/${req.file.filename}`;

        res.status(httpStatus.CREATED.code).json({
            success: true,
            message: 'Image uploaded successfully',
            data: {
                filename: req.file.filename,
                imageUrl: imageUrl,
                size: req.file.size
            }
        });
    } catch (err) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR.code).json({
            success: false,
            error: httpStatus.INTERNAL_SERVER_ERROR.message,
            message: 'Error uploading image',
            errorMessage: err.message
        });
    }
}

// POST create trophy with image
export async function createTrophy(req, res) {
    try {
        const { title, tournamentId } = req.body; // Get title and tournamentId from request body
        let imageUrl = null; // Initialize imageUrl to null, will be set if file is uploaded

        // Validate required fields using validator
        const validation = trophyValidator.validateTrophyCreation(title, tournamentId);
        if (!validation.valid) {
            return res.status(validation.error).json({
                success: false,
                error: httpStatus.BAD_REQUEST.message,
                message: validation.message
            });
        }

        // Check if tournament exists
        const tournament = await Tournament.findById(tournamentId);
        if (!tournament) {
            return res.status(httpStatus.NOT_FOUND.code).json({
                success: false,
                error: httpStatus.NOT_FOUND.message,
                message: 'Tournament not found'
            });
        }

        // If file was uploaded, set image URL
        if (req.file) {
            imageUrl = `/uploads/${req.file.filename}`;
        }

        // Create trophy
        const newTrophy = new Trophy({
            title,
            imageUrl,
            tournament: tournamentId
        });

        await newTrophy.save(); // Try to save trophy to database

        // Attach tournament title to trophy response by populating the tournament field
        const populatedTrophy = await Trophy.findById(newTrophy._id)
            .populate('tournament', 'title');

        res.status(httpStatus.CREATED.code).json({
            success: true,
            message: 'Trophy created successfully',
            data: populatedTrophy
        });
    } catch (err) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR.code).json({
            success: false,
            error: httpStatus.INTERNAL_SERVER_ERROR.message,
            message: 'Error creating trophy',
            errorMessage: err.message
        });
    }
}

// GET all trophies
export async function getAllTrophies(req, res) {
    try {
        // Retrieve all trophies and populate the tournament field to include the tournament title
        const trophies = await Trophy.find()
            .populate('tournament', 'title')
            .sort({ createdAt: -1 })
            .select('-__v'); // Exclude __v field

        res.status(httpStatus.OK.code).json({
            success: true,
            data: trophies,
            count: trophies.length
        });
    } catch (err) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR.code).json({
            success: false,
            error: httpStatus.INTERNAL_SERVER_ERROR.message,
            message: 'Error retrieving trophies',
            errorMessage: err.message
        });
    }
}

// GET trophy by ID
export async function getTrophyById(req, res) {
    try {
        const { tid } = req.params;

        // Validate trophy ID
        const validation = trophyValidator.validateTid(tid); // Validate trophy ID format
        if (!validation.valid) {
            return res.status(validation.error).json({
                success: false,
                error: httpStatus.BAD_REQUEST.message,
                message: validation.message
            });
        }

        // Retrieve trophy by ID and populate the tournament field to include the tournament title
        const trophy = await Trophy.findById(tid)
            .populate('tournament', 'title')
            .select('-__v');
        // If trophy not found, return 404
        if (!trophy) {
            return res.status(httpStatus.NOT_FOUND.code).json({
                success: false,
                error: httpStatus.NOT_FOUND.message,
                message: `Trophy with ID '${tid}' not found`
            });
        }

        res.status(httpStatus.OK.code).json({
            success: true,
            data: trophy
        });
    } catch (err) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR.code).json({
            success: false,
            error: httpStatus.INTERNAL_SERVER_ERROR.message,
            message: 'Error retrieving trophy',
            errorMessage: err.message
        });
    }
}

// DELETE trophy
export async function deleteTrophy(req, res) {
    try {
        const { tid } = req.params;

        // Validate trophy ID
        const validation = trophyValidator.validateTid(tid);
        if (!validation.valid) {
            return res.status(validation.error).json({
                success: false,
                error: httpStatus.BAD_REQUEST.message,
                message: validation.message
            });
        }

        const deletedTrophy = await Trophy.findByIdAndDelete(tid); // Try to delete trophy from database
        
        // If trophy not found, return 404
        if (!deletedTrophy) {
            return res.status(httpStatus.NOT_FOUND.code).json({
                success: false,
                error: httpStatus.NOT_FOUND.message,
                message: `Trophy with ID '${tid}' not found`
            });
        }
        res.status(httpStatus.OK.code).json({
            success: true,
            message: 'Trophy deleted successfully',
            data: deletedTrophy
        });
    } catch (err) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR.code).json({
            success: false,
            error: httpStatus.INTERNAL_SERVER_ERROR.message,
            message: 'Error deleting trophy',
            errorMessage: err.message
        });
    }
}

export default {
    uploadTrophyImage,
    createTrophy,
    getAllTrophies,
    getTrophyById,
    deleteTrophy
};