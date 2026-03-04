const express = require("express");
const admin = require("firebase-admin");
const db = require("./config/firebaseadmin"); 
const cors = require("cors");
const dotenv = require("dotenv");

// 1. Remove or comment out 'firebase-functions' for local dev
// const functions = require('firebase-functions'); 

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

const imageRoute = require("./routes/imageroute");
app.use('/api/images', imageRoute);

// --- API Routes ---
app.post("/add-user", async (req, res) => {
  try {
    const docRef = await db.collection("users").add(req.body);
    res.send({ id: docRef.id });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

/* --- COMMENT THIS OUT FOR LOCAL NODEMON DEV ---
  This logic only works when you run 'firebase deploy --only functions'
  It will ALWAYS crash if you run it with 'node index.js'

exports.onUserStatusChanged = functions.database.ref('/status/{uid}').onUpdate(
    async (change, context) => {
      const eventStatus = change.after.val(); 
      const userFirestoreRef = db.doc(`drivers/${context.params.uid}`);
      return userFirestoreRef.update({
        available: eventStatus.available,
        lastSeen: admin.firestore.FieldValue.serverTimestamp()
      });
    }
);
*/

// --- START SERVER ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));