import multer from "multer";
import path from "path";

// Local storage for uploads (ensure directory exists and is writable)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        // Unique timestamp, random salt ensures no file is ever overwritten
        const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, unique + path.extname(file.originalname));
    }
});

// Only allow image MIME types to prevent malicious script uploads
function fileFilter(req, file, cb) {
    if (file.mimetype.startsWith("image/")) {
        cb(null, true);
    } else {
        cb(new Error("Only image files are allowed"), false);
    }
}

export const uploadTrophy = multer({ storage, fileFilter }).single("trophy");
export const uploadProfileImage = multer({ storage, fileFilter }).single("profileImage");