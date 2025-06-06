
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

let app: FirebaseApp;

// Check if critical config values are missing or empty
const criticalKeys = ['apiKey', 'authDomain', 'projectId', 'appId'];
const missingCriticalKeys = criticalKeys.filter(key => {
  const value = firebaseConfig[key as keyof typeof firebaseConfig];
  return !value || value.trim() === '' || value.startsWith('YOUR_'); // Check for placeholders too
});

if (missingCriticalKeys.length > 0) {
  const message = `CRITICAL Firebase config is missing, empty, or using placeholder values for keys: ${missingCriticalKeys.join(', ')}. 
Firebase cannot be initialized. Please ensure:
1. You have a .env file in the root of your project.
2. All NEXT_PUBLIC_FIREBASE_ environment variables are correctly set in .env with your *actual* Firebase project credentials.
3. You have RESTARTED your Next.js development server after creating or modifying the .env file.`;
  console.error(message);
  // Throw an error here to stop further execution if critical config is missing
  throw new Error(message);
}

if (!getApps().length) {
  try {
    app = initializeApp(firebaseConfig);
  } catch (e) {
    console.error("Error during Firebase initializeApp:", e);
    const errorMsg = `Firebase initializeApp failed. This usually means your .env file contains incorrect Firebase credentials, or there's a network issue.
Please verify:
1. A .env file exists at the project root.
2. It contains all required NEXT_PUBLIC_FIREBASE_ variables.
3. The values are correct for your Firebase project.
4. You have RESTARTED your Next.js development server after any changes to .env.
Original error: ${(e as Error).message}`;
    throw new Error(errorMsg);
  }
} else {
  app = getApps()[0];
}

// If 'app' is somehow still not defined after the above (shouldn't happen if throw above works)
if (!app) {
    const errorMsg = `Firebase app could not be initialized for an unknown reason, though critical config checks passed. This is unexpected. Please check server logs and Firebase setup.`;
    console.error(errorMsg);
    throw new Error(errorMsg);
}

const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);

export { app, auth, db };
