import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Validate required environment variables
const env = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Map config keys to env var names for error messages
const envVarNames: Record<string, string> = {
  apiKey: 'VITE_FIREBASE_API_KEY',
  authDomain: 'VITE_FIREBASE_AUTH_DOMAIN',
  databaseURL: 'VITE_FIREBASE_DATABASE_URL',
  projectId: 'VITE_FIREBASE_PROJECT_ID',
  storageBucket: 'VITE_FIREBASE_STORAGE_BUCKET',
  messagingSenderId: 'VITE_FIREBASE_MESSAGING_SENDER_ID',
  appId: 'VITE_FIREBASE_APP_ID',
  measurementId: 'VITE_FIREBASE_MEASUREMENT_ID'
};

// Check for missing required variables
const missingVars = Object.entries(env)
  .filter(([_, value]) => !value)
  .map(([key]) => envVarNames[key] || key);

if (missingVars.length > 0) {
  const errorMessage = `Missing required Firebase environment variables: ${missingVars.join(', ')}\n\n` +
    `Please ensure you have created a .env.production file in the project root with all required variables.\n` +
    `For local development, use .env file.\n` +
    `See .env.example for the required format.`;
  
  if (typeof window !== 'undefined') {
    console.error(errorMessage);
  }
  throw new Error(errorMessage);
}

const firebaseConfig = {
  apiKey: env.apiKey!,
  authDomain: env.authDomain!,
  databaseURL: env.databaseURL!,
  projectId: env.projectId!,
  storageBucket: env.storageBucket!,
  messagingSenderId: env.messagingSenderId!,
  appId: env.appId!,
  measurementId: env.measurementId!
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
export const database = getDatabase(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

