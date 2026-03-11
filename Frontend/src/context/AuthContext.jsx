import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // useEffect(() => {
  

  //   const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {

  //     if (firebaseUser) {

  //       setUser(firebaseUser);

  //       // ⭐ GET ROLE FROM FIRESTORE
  //       const userRef = doc(db, "users", firebaseUser.uid);
  //       const snap = await getDoc(userRef);

  //       if (snap.exists()) {
  //         setRole(snap.data().role);
  //       } else {
  //         setRole("User");
  //       }

  //     } else {

  //       setUser(null);
  //       setRole(null);

  //     }

  //     setLoading(false);

  //   });

  //   return unsubscribe;

  // }, []);



  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true); // Ensure loading is true when state changes
      
      if (firebaseUser) {
        setUser(firebaseUser);

        try {
          const userRef = doc(db, "users", firebaseUser.uid);
          const snap = await getDoc(userRef);

          if (snap.exists()) {
            setRole(snap.data().role || "User");
          } else {
            // Document doesn't exist yet, default to User
            setRole("User");
          }
        } catch (error) {
          console.error("Error fetching role:", error);
          setRole("User"); // Fallback on error
        }
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);
