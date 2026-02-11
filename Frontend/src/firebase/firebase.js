import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAs9NEROWkO4crW2lwkiBsBAjk0kOJDawU",
  authDomain: "website-cabs-travels.firebaseapp.com",
  projectId: "website-cabs-travels",
  storageBucket: "website-cabs-travels.firebasestorage.app",
  messagingSenderId: "527860510459",
  appId: "1:527860510459:web:b6b5e13d7889e114520a5e",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ Export Auth properly
export const auth = getAuth(app);

export default app;
