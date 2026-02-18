const dotenv = require('dotenv');

const cloudinary = require('cloudinary').v2;
const fs = require('fs'); // Node's File System to delete local temp files
dotenv.config(); // Load environment variables from .env file

// Configure with your API Secret
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads a local file to Cloudinary and returns the result
 * @param {string} localFilePath 
 */
const uploadToCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    // Upload the file to cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
      folder: "web_app_uploads", // Organizes images into a folder
    });

    // File has been uploaded successfully, remove from local server
    fs.unlinkSync(localFilePath);
    
    return response;
  } catch (error) {
    // Remove the local file even if the upload failed
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
    console.error("Cloudinary Upload Error:", error);
    return null;
  }
};

module.exports = { uploadToCloudinary };