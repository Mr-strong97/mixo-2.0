import { initializeApp } from "firebase/app";
import { browserLocalPersistence, getAuth, onAuthStateChanged, setPersistence } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "TON_API_KEY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "mixo-app-xxxx.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "mixo-app-xxxx",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "mixo-app-xxxx.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789:web:abc123"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const authReady = new Promise((resolve) => {
  const unsubscribe = onAuthStateChanged(auth, () => {
    unsubscribe();
    resolve(auth.currentUser);
  });
});

setPersistence(auth, browserLocalPersistence).catch(() => {});

export const getFirebaseIdToken = async (forceRefresh = false) => {
  await authReady.catch(() => {});
  const user = auth.currentUser;
  if (!user) return null;
  return user.getIdToken(forceRefresh);
};
