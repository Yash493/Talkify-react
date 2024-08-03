// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: "react-chat-a66ae.firebaseapp.com",
  projectId: "react-chat-a66ae",
  storageBucket: "react-chat-a66ae.appspot.com",
  messagingSenderId: "518550018256",
  appId: "1:518550018256:web:48583cd83c7897798b66d5",
  measurementId: "G-TD75LR01NW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
//const analytics = getAnalytics(app); // Optional, only if you're using Analytics

// Export initialized Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
