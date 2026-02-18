const express = require('express');
const { uploadToCloudinary } = require('../utils/cloudinary'); // CORRECT (Added the extra dot)
const { db, admin } = require('../config/firebaseadmin'); // Your Firebase setup file
const multer = require('multer');

const router = express.Router();
const upload = multer({ dest: 'temp/' }); // Temporary storage for incoming files

router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    // 1. Upload to Cloudinary using your new service
    const cloudinaryResponse = await uploadToCloudinary(req.file.path);

    if (!cloudinaryResponse) {
      return res.status(500).json({ message: "Cloudinary upload failed" });
    }

    // 2. Save the URL to Firebase Firestore
    const imageData = {
      imageUrl: cloudinaryResponse.secure_url,
      publicId: cloudinaryResponse.public_id,
      uploadedBy: req.body.userId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection('user_images').add(imageData);

    res.status(200).json({
      message: "Success",
      dbId: docRef.id,
      url: cloudinaryResponse.secure_url
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
module.exports = router;