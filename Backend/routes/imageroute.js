const express = require('express');
const { uploadToCloudinary } = require('../utils/cloudinary');
const { db, admin } = require('../config/firebaseadmin');
const multer = require('multer');
const fs = require('fs'); // Added to clean up temp files

const router = express.Router();
const upload = multer({ dest: 'temp/' });

// Changed from .single('image') to .array('images', 5) 
// 'images' is the field name, 5 is the max number of files
router.post('/upload', upload.array('images', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No images uploaded" });
    }

    // 1. Upload all files to Cloudinary in parallel
    const uploadPromises = req.files.map(async (file) => {
      const result = await uploadToCloudinary(file.path);
      
      // Optional: Delete local temp file after upload to keep server clean
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      
      return {
        imageUrl: result.secure_url,
        publicId: result.public_id
      };
    });

    const uploadedImages = await Promise.all(uploadPromises);

    // 2. Save the array of images to Firestore
    const imageData = {
      images: uploadedImages, // This is now an array of objects {imageUrl, publicId}
      uploadedBy: req.body.userId || "anonymous",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection('user_images').add(imageData);

    res.status(200).json({
      message: "Success",
      dbId: docRef.id,
      urls: uploadedImages.map(img => img.imageUrl) // Send back simple URL array
    });

  } catch (error) {
    console.error("Upload Route Error:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;