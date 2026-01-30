// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  updateProfile,
  signOut 
} from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDTpQ_BwoD-lZd8WM6mY5z3YzRFyEM0Dpc",
  authDomain: "habit-tracker-64699.firebaseapp.com",
  projectId: "habit-tracker-64699",
  storageBucket: "habit-tracker-64699.firebasestorage.app",
  messagingSenderId: "73186772228",
  appId: "1:73186772228:web:cae156f288ef9f0b2dfc51",
  measurementId: "G-5CQ77C786F"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// --- GOOGLE LOGIN ---
export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Google Login failed", error);
    throw error;
  }
};

// --- EMAIL SIGN UP ---
export const registerWithEmail = async (email, password, name) => {
  try {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    const user = res.user;
    // Add their name to their profile
    await updateProfile(user, { displayName: name });
    return user;
  } catch (error) {
    console.error("Registration failed", error);
    throw error;
  }
};

// --- EMAIL LOGIN ---
export const loginWithEmail = async (email, password) => {
  try {
    const res = await signInWithEmailAndPassword(auth, email, password);
    return res.user;
  } catch (error) {
    console.error("Login failed", error);
    throw error;
  }
};

export const logout = async () => {
  await signOut(auth);
};