import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBHlg15tbsqHUQpKqyI2IxanAbNoo40dso",
  authDomain: "fir-dff39.firebaseapp.com",
  projectId: "fir-dff39",
  storageBucket: "fir-dff39.firebasestorage.app",
  messagingSenderId: "639303940134",
  appId: "1:639303940134:web:1f6e954e09fc86463f4ee7",
  measurementId: "G-VC297E3D5X"
};

// Initialize Firebase for SSR compatibility (prevent duplicate initialization)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };
