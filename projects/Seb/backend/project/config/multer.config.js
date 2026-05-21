import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url); // Get the current file's directory
const __dirname = path.dirname(__filename); // Get the directory of the current file

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads'); // Ensure the uploads directory exists, if not create it
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => { 
        cb(null, uploadsDir); // cb is the callback function that tells multer where to save the uploaded file
    },
    filename: (req, file, cb) => {
        // Create unique filename: timestamp-originalname
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter (only images)
const fileFilter = (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']; // Allowed MIME types for image files
    
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true); // Accept the file
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'), false); // Reject the file with an error message
    }
};

// Multer middleware. Limits file size to 5MB and applies the storage and file filter configurations
export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB max
    }
});

export default upload;