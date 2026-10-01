const cloudinary = require('../config/cloudinary');
const ExpressError = require('../utils/ExpressError');

/**
 * Upload a single file buffer to Cloudinary.
 * @param {Buffer} fileBuffer - The file buffer from multer memory storage.
 * @param {string} folder - Cloudinary folder path.
 * @param {string} resourceType - 'image' or 'raw' (for PDFs).
 * @returns {Promise<{url: string, publicId: string}>}
 */
async function uploadToCloudinary(fileBuffer, folder = 'docterapp', resourceType = 'auto') {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
        allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
      },
      (error, result) => {
        if (error) {
          return reject(new ExpressError('File upload failed. Please try again.', 500, 'UPLOAD_FAILED'));
        }
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
    );

    uploadStream.end(fileBuffer);
  });
}

/**
 * Delete a file from Cloudinary by its public ID.
 * @param {string} publicId
 * @param {string} resourceType
 */
async function deleteFromCloudinary(publicId, resourceType = 'image') {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (error) {
    console.error('Cloudinary delete error:', error.message);
    // Non-critical — don't throw
  }
}

/**
 * Upload multiple file buffers to Cloudinary.
 * @param {Array<{buffer: Buffer, originalname: string, mimetype: string}>} files
 * @param {string} folder
 * @returns {Promise<Array<{url: string, publicId: string, originalName: string}>>}
 */
async function uploadMultiple(files, folder = 'docterapp/verifications') {
  const uploads = files.map(async (file) => {
    const resourceType = file.mimetype === 'application/pdf' ? 'raw' : 'image';
    const result = await uploadToCloudinary(file.buffer, folder, resourceType);
    return {
      ...result,
      originalName: file.originalname,
    };
  });

  return Promise.all(uploads);
}

module.exports = {
  uploadToCloudinary,
  deleteFromCloudinary,
  uploadMultiple,
};
