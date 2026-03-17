import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getDatabase } from "firebase/database"; // <--- 1. ADD THIS

const firebaseConfig = {
  apiKey: import.meta.env.VITE_YOUR_API_KEY,
  authDomain:import.meta.env.VITE_YOUR_DOMAIN,
  projectId:import.meta.env.VITE_YOUR_PROJECT_ID,
  storageBucket:import.meta.env.VITE_YOUR_BUCKET,
  messagingSenderId:import.meta.env.VITE_YOUR_ID,
  appId:import.meta.env.VITE_YOUR_APP_ID,
  databaseURL:import.meta.env.VITE_YOUR_DATABASE_URL // <--- 2. ADD THIS
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const rtdb = getDatabase(app); // <--- 3. EXPORT THIS
