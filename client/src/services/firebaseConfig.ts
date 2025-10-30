import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDGHrQ1Yh8y-E9baPjDWHmtjXrKA-oNUqw",
  authDomain: "alertu-1546021902504.firebaseapp.com",
  databaseURL: "https://alertu-1546021902504.firebaseio.com",
  projectId: "alertu-1546021902504",
  storageBucket: "alertu-1546021902504.firebasestorage.app",
  messagingSenderId: "908529589070",
  appId: "1:908529589070:web:c2bd3c66eb2f4b1b7bdc1f",
  measurementId: "G-EQSLF24LBW"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
export const database = getDatabase(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

