// from here: https://expressjs.com/en/resources/middleware/multer.html

import multer from "multer";
import fs from "node:fs";

// have to create the uploads/ folder if it does not exist
if (!fs.existsSync("uploads/")){
    fs.mkdirSync("uploads/");
}

// store uploaded files in the uploads/ folder
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // if no errors, store image in the uploads/ folder 
        cb(null, "uploads/");
    },
    // keep the original filename
    filename: (req, file, cb) => {
        // if no errors, store the image with the original filename (the one from the user)
        cb(null, file.originalname);
    }
});

// fileFilter controls which file types are allowed
const fileFilter = (req, file, cb) => {
    // mimetype is the file type (example: iamge/png or image/jpeg)
    if (file.mimetype.startsWith("image/")) {
        // if no errors, accept the file
        cb(null, true);
    } else {
        // if errors, reject the file and pass an error and set to false to block the upload
        cb(new Error("Only image files are allowed"), false);
    }
}

// create the upload middleware with the storage and filter settings
export const upload = multer({ storage, fileFilter });
