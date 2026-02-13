const dotenv = require('dotenv');
dotenv.config()
var admin = require("firebase-admin");

var serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: serviceAccount.project_id
});
 
const db = admin.firestore();
const auth = admin.auth();

module.exports = { db, auth };
