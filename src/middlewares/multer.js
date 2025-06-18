// utils/upload.js  (or wherever you keep it)
const multer = require('multer');
const path   = require('path');
const fs     = require('fs');

const UPLOAD_ROOT = path.join(__dirname, '..', './../public', 'uploads');

const storage = multer.diskStorage({
  destination: (_req, file, cb) => {
    // ---- Folder mapping ----
    let folderName;
    if (file.fieldname === 'profilePicture') {
      folderName = 'userProfile';         // <── force everything called "profilePicture" here
    } else {
      folderName = file.fieldname || 'others';
    }

    const fullPath = path.join(UPLOAD_ROOT, folderName);
    fs.mkdirSync(fullPath, { recursive: true }); // ensure folder exists
    cb(null, fullPath);
  },

  filename: (_req, file, cb) => {
    const uniqueSuffix  = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext           = path.extname(file.originalname);
    const cleanOriginal = path.basename(file.originalname, ext).replace(/\s+/g, '_');
    cb(null, `${cleanOriginal}-${uniqueSuffix}${ext}`);
  },
});

module.exports = multer({ storage });
