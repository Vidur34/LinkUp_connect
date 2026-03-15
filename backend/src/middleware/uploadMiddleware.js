// backend/src/middleware/uploadMiddleware.js
const multer = require('multer');

// Configure multer to store files in memory as Buffers
const storage = multer.memoryStorage();

// File filter to only allow PDFs for now
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Only PDF files are allowed!'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
});

module.exports = upload;
