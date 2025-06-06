
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

// Check if all required config values are present
const requiredConfigKeys = ['apiKey', 'authDomain', 'projectId', 'appId'];
const missingKeys = requiredConfigKeys.filter(key => !firebaseConfig[key as keyof typeof firebaseConfig]);

if (missingKeys.length > 0) {
  console.error(`Firebase config is missing the following keys: ${missingKeys.join(', ')}. Please check your .env file and ensure all NEXT_PUBLIC_FIREBASE_ variables are set correctly.`);
  // You might want to throw an error here or handle this case appropriately
  // For now, we'll let initializeApp fail if it's going to, to see the Firebase SDK's error.
}


if (!getApps().length) {
  if (firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId && firebaseConfig.appId) {
    app = initializeApp(firebaseConfig);
  } else {
    // Avoid calling initializeApp if critical config is missing
    // This helps prevent the "configuration-not-found" error if env vars are missing
    console.error("Firebase app initialization skipped due to missing critical configuration. See previous error message for details.");
    // Provide a dummy app object or handle this state in your application
    // For now, this will likely lead to errors downstream if 'app' is used without being initialized.
    // A more robust solution would be to prevent app usage or show a specific error UI.
  }
} else {
  app = getApps()[0];
}

// @ts-ignore auth and db might not be initialized if app is not.
const auth: Auth = app ? getAuth(app) : ({} as Auth);
// @ts-ignore
const db: Firestore = app ? getFirestore(app) : ({} as Firestore);

export { app, auth, db };
