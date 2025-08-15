import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBvBlbWmFxN1t0Sv0TkWfcYndvgzq6499Y",
  authDomain: "edu-platform-35476.firebaseapp.com",
  projectId: "edu-platform-35476",
  storageBucket: "edu-platform-35476.firebasestorage.app",
  messagingSenderId: "823570222456",
  appId: "1:823570222456:web:656afb19407d955448cc8d",
  measurementId: "G-V7DZRJR57F"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
