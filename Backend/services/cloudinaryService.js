const cloudinary = require('cloudinary').v2;

if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

/**
 * Upload buffer to Cloudinary or return formatted base64 data URI fallback
 */
async function uploadToCloudinary(fileBuffer, originalFilename = 'issue_image.jpg', mimeType = 'image/jpeg') {
  if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'sahayog_issues', resource_type: 'auto' },
        (error, result) => {
          if (error) return reject(error);
          resolve({
            url: result.secure_url,
            filename: originalFilename,
            size: result.bytes || fileBuffer.length,
          });
        }
      );
      uploadStream.end(fileBuffer);
    });
  }

  // Graceful fallback for local development: Base64 data URI
  const base64Data = fileBuffer.toString('base64');
  const dataUri = `data:${mimeType};base64,${base64Data}`;
  return {
    url: dataUri,
    filename: originalFilename,
    size: fileBuffer.length,
  };
}

/**
 * Upload base64 data URI to Cloudinary or return data URI
 */
async function uploadDataUriToCloudinary(dataUri, originalFilename = 'issue_image.jpg') {
  if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
    try {
      const result = await cloudinary.uploader.upload(dataUri, {
        folder: 'sahayog_issues',
        resource_type: 'image',
      });
      return {
        url: result.secure_url,
        filename: originalFilename,
        size: result.bytes || 102400,
      };
    } catch (err) {
      console.error('[Cloudinary] Direct upload failed, falling back to data URI:', err.message);
    }
  }
  return {
    url: dataUri,
    filename: originalFilename,
    size: 102400,
  };
}

module.exports = {
  uploadToCloudinary,
  uploadDataUriToCloudinary,
};
