import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "backend/uploads/");
    },
    filename: (req, file, cb) => {   
        const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, unique + path.extname(file.originalname));
    }
});

function fileFilter(req, file, cb) {
    if (file.mimetype.startsWith("image/")) {
        cb(null, true);
    } else {
        cb(new Error("Only image files are allowed"), false);
    }
}

export const uploadTrophy = multer({ storage, fileFilter }).single("trophy");
export const uploadProfileImage = multer({ storage, fileFilter }).single("profileImage");