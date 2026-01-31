import path from 'path';
import express from 'express';
import multer from 'multer';

const router = express.Router();

const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename(req, file, cb) {
        cb(
            null,
            `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
        );
    },
});

function checkFileType(file, cb) {
    const filetypes = /jpg|jpeg|png|pdf|zip|doc|docx|ppt|pptx|txt|xls|xlsx|rar/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Mimetype check can be tricky for some files, so we'll rely mostly on extension for now or expand the regex
    // const mimetype = filetypes.test(file.mimetype);

    if (extname) { // Relaxed check to allow various file types
        return cb(null, true);
    } else {
        cb('Supported files: Images, PDF, Docs, Zip');
    }
}

const upload = multer({
    storage,
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    },
});

router.post('/', (req, res) => {
    upload.single('image')(req, res, function (err) {
        if (err) {
            return res.status(400).json({ message: err.message || err });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Fix Windows paths
        const normalizedPath = req.file.path.replace(/\\/g, "/");
        res.json({ url: `/${normalizedPath}` });
    });
});

export default router;
