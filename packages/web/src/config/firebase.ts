import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Validate configuration
const requiredConfig = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID'
];

const missingConfig = requiredConfig.filter(key => !import.meta.env[key]);

if (missingConfig.length > 0) {
  throw new Error(`Missing Firebase configuration: ${missingConfig.join(', ')}`);
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);
export const storage = getStorage(app);

// Initialize Analytics (only in production)
export const analytics = typeof window !== 'undefined' && firebaseConfig.measurementId 
  ? getAnalytics(app) 
  : null;

// Connect to emulators in development
if (import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true') {
  const EMULATOR_HOST = 'localhost';
  
  try {
    connectAuthEmulator(auth, `http://${EMULATOR_HOST}:9099`, { disableWarnings: true });
    connectFirestoreEmulator(db, EMULATOR_HOST, 8080);
    connectFunctionsEmulator(functions, EMULATOR_HOST, 5001);
    connectStorageEmulator(storage, EMULATOR_HOST, 9199);
    
    console.log('🔧 Connected to Firebase Emulators');
  } catch (error) {
    console.warn('Failed to connect to Firebase Emulators:', error);
  }
}

// Firebase configuration helper
export const firebaseApp = app;

// Environment helpers
export const isEmulator = import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true';
export const isDevelopment = import.meta.env.DEV;
export const isProduction = import.meta.env.PROD;

console.log(`🔥 Firebase initialized for ${isDevelopment ? 'development' : 'production'}`);
console.log(`📍 Project: ${firebaseConfig.projectId}`);
console.log(`🧪 Emulator: ${isEmulator ? 'enabled' : 'disabled'}`);

export default app;