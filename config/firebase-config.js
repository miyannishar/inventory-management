// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAgH6y1zCJx-sLsqe3y-2hPsmOmxy2vdjQ",
  authDomain: "inventory-management-e18a1.firebaseapp.com",
  projectId: "inventory-management-e18a1",
  storageBucket: "inventory-management-e18a1.appspot.com",
  messagingSenderId: "86332980582",
  appId: "1:86332980582:web:6980e5161b67896c34dca7",
  measurementId: "G-N79EE53BQ5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);