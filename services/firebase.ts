import { initializeApp, getApp, getApps } from "firebase/app";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getAuth,
  getReactNativePersistence,
  initializeAuth,
  type Auth,
} from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { Platform } from "react-native";
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

  if (Platform.OS === "web") {
    auth = getAuth(firebaseApp);
  } else {
    try {
      auth = initializeAuth(firebaseApp, {
        persistence: getReactNativePersistence(AsyncStorage),
      });
    } catch {
      auth = getAuth(firebaseApp);
    }
  }
}

export { auth, db, firebaseApp };
