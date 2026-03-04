const express = require("express");
const admin = require("firebase-admin"); // Use the admin instance from your config
const db = require("./config/firebaseadmin"); 
const functions = require('firebase-functions');
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

const imageRoute = require("./routes/imageroute");
app.use('/api/images', imageRoute);

// --- API Routes ---
app.post("/add-user", async (req, res) => {
  const docRef = await db.collection("users").add(req.body);
  res.send({ id: docRef.id });
});

// --- THE PRESENCE TRIGGER ---
// This part only runs if deployed to Firebase Functions
exports.onUserStatusChanged = functions.database.ref('/status/{uid}').onUpdate(
    async (change, context) => {
      const eventStatus = change.after.val(); 
      // Use 'db' which is your firestore instance
      const userFirestoreRef = db.doc(`drivers/${context.params.uid}`);

      console.log(`Updating driver ${context.params.uid} to available: ${eventStatus.available}`);

      return userFirestoreRef.update({
        available: eventStatus.available,
        lastSeen: admin.firestore.FieldValue.serverTimestamp()
      });
    }
);

// This handles local/VPS execution
if (process.env.NODE_ENV !== 'production') {
    app.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`));
}

// If deploying the whole app as a function:
exports.api = functions.https.onRequest(app);