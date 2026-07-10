// Firebase Web SDK — client-side only.
// The apiKey here is a Firebase Web API key which is public by design;
// access is controlled by Firestore Rules, not by hiding this key.
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

// Firebase Web API key is public by design — access is controlled by
// Firestore Security Rules (see firestore.rules). Safe to commit.
const firebaseConfig = {
  apiKey:
    (import.meta.env.VITE_FIREBASE_API_KEY as string | undefined) ??
    "AIzaSyBvQ_REPLACE_WITH_YOUR_WEB_API_KEY",
  authDomain: "study-aid-7e6d1.firebaseapp.com",
  databaseURL:
    "https://study-aid-7e6d1-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "study-aid-7e6d1",
  storageBucket: "study-aid-7e6d1.firebasestorage.app",
  messagingSenderId: "302021397403",
  appId: "1:302021397403:web:856279cebadfac515eef3e",
  measurementId: "G-HCYXYE4GT9",
};

let _app: FirebaseApp | null = null;
let _auth: Auth | null = null;
let _db: Firestore | null = null;

export function getFirebase() {
  if (typeof window === "undefined") {
    throw new Error("Firebase can only be used on the client");
  }
  if (!_app) {
    _app = getApps()[0] ?? initializeApp(firebaseConfig);
    _auth = getAuth(_app);
    _db = getFirestore(_app);
  }
  return { app: _app!, auth: _auth!, db: _db! };
}

export const ADMIN_EMAIL = "babul452390@gmail.com";
