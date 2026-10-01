const multer = require('multer');
const { ALLOWED_DOCUMENT_TYPES, MAX_FILE_SIZE } = require('../utils/constants');
const ExpressError = require('../utils/ExpressError');

/**
 * Multer configuration with memory storage.
 * Files are stored in memory as Buffer for direct upload to Cloudinary.
 */
const storage = multer.memoryStorage();

/**
 * File filter: validate MIME type.
 */
function fileFilter(req, file, cb) {
  if (ALLOWED_DOCUMENT_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new ExpressError(
        `Invalid file type: ${file.mimetype}. Allowed types: JPEG, PNG, PDF.`,
        400,
        'INVALID_FILE_TYPE'
      ),
      false
    );
  }
}

// Upload middleware for verification documents (up to 5 files)
const uploadDocuments = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 5,
  },
}).array('documents', 5);

// Upload middleware for single profile image
const uploadProfileImage = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const imageTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (imageTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new ExpressError(
          'Invalid image type. Only JPEG and PNG are allowed.',
          400,
          'INVALID_FILE_TYPE'
        ),
        false
      );
    }
  },
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1,
  },
}).single('profileImage');

/**
 * Wraps multer middleware to catch multer-specific errors
 * and forward them as ExpressErrors.
 */
function handleMulterError(uploadMiddleware) {
  return (req, res, next) => {
    uploadMiddleware(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(new ExpressError('File too large. Maximum size is 5MB.', 400, 'FILE_TOO_LARGE'));
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
          return next(new ExpressError('Too many files. Maximum is 5 files.', 400, 'TOO_MANY_FILES'));
        }
        return next(new ExpressError(err.message, 400, 'UPLOAD_ERROR'));
      }
      if (err) {
        return next(err);
      }
      return next();
    });
  };
}

module.exports = {
  uploadDocuments: handleMulterError(uploadDocuments),
  uploadProfileImage: handleMulterError(uploadProfileImage),
};
