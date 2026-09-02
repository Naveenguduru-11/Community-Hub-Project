/**
 * imageService.js
 * Handles image storage as base64 strings in MongoDB.
 * If CLOUDINARY_* env vars are set, uses Cloudinary instead.
 */

const cloudinary = require('cloudinary').v2;

const hasCloudinary = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (hasCloudinary) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

/**
 * Upload a single file buffer and return a URL/base64 string.
 * @param {Buffer} buffer  - file buffer from multer memoryStorage
 * @param {string} mimetype - e.g. 'image/jpeg'
 * @param {string} folder  - Cloudinary folder name (ignored for base64)
 * @returns {Promise<string>} URL or base64 data URI
 */
exports.uploadImage = async (buffer, mimetype, folder = 'communityhub') => {
  if (hasCloudinary) {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder, resource_type: 'image' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result.secure_url);
        }
      );
      stream.end(buffer);
    });
  }
  // Fallback: base64 data URI
  const b64 = buffer.toString('base64');
  return `data:${mimetype};base64,${b64}`;
};

/**
 * Upload multiple file buffers.
 * @param {Array<{buffer, mimetype}>} files
 * @param {string} folder
 * @returns {Promise<string[]>}
 */
exports.uploadImages = async (files, folder = 'communityhub') => {
  return Promise.all(files.map(f => exports.uploadImage(f.buffer, f.mimetype, folder)));
};

/**
 * Delete an image by URL (Cloudinary only, no-op for base64).
 */
exports.deleteImage = async (url) => {
  if (!hasCloudinary || !url || url.startsWith('data:')) return;
  try {
    // Extract public_id from Cloudinary URL
    const parts = url.split('/');
    const folderAndFile = parts.slice(-2).join('/');
    const publicId = folderAndFile.replace(/\.[^.]+$/, '');
    await cloudinary.uploader.destroy(publicId);
  } catch (_) {
    // ignore
  }
};
