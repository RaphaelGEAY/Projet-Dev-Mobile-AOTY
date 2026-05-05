import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { firebaseConfig } from "@/services/firebase-config";

const firebaseEntries = Object.entries(firebaseConfig) as Array<
  [keyof typeof firebaseConfig, string | undefined]
>;

export const missingFirebaseConfigKeys = firebaseEntries
  .filter(([, value]) => !value)
  .map(([key]) => key);

export const isFirebaseConfigured = missingFirebaseConfigKeys.length === 0;

const firebaseApp = isFirebaseConfigured
  ? getApps().length > 0
    ? getApp()
    : initializeApp(firebaseConfig)
  : null;

let auth: Auth | null = null;
let db: Firestore | null = null;

if (firebaseApp) {
  db = getFirestore(firebaseApp);
  auth = getAuth(firebaseApp);
}

export { auth, db, firebaseApp };
