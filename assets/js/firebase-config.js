// assets/js/firebase-config.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-storage.js";
import {
  getAuth,
  GoogleAuthProvider
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

import {
  getFirestore,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

// Your Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyDHK98k0OTsAWXJySLRwb7DCJSpSLzcym4",
  authDomain: "online-shopping-sri-psiog.firebaseapp.com",
  projectId: "online-shopping-sri-psiog",
  storageBucket: "online-shopping-sri-psiog.firebasestorage.app",
  messagingSenderId: "734326093763",
  appId: "1:734326093763:web:dd8cf7700c949465fbaf76",
  measurementId: "G-YMBFWQNYM8"
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const storage = getStorage(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// Export services
export {
  app,
  auth,
    storage,
  db,
  googleProvider,
  serverTimestamp
};