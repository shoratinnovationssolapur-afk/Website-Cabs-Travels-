import { auth } from "./firebase";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

// ✅ Signup Function
export const signupUser = (email, password) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

// ✅ Login Function
export const loginUser = (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};

// ✅ Logout Function
export const logoutUser = () => {
  return signOut(auth);
};
