import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js';

// Firebase configuration (centralized)
const firebaseConfig = {
  apiKey: "AIzaSyCv3im6Uk2y0CwUFk98UD3pLGEUU9P2a8w",
  authDomain: "taxi-cheap.firebaseapp.com",
  projectId: "taxi-cheap",
  storageBucket: "taxi-cheap.firebasestorage.app",
  messagingSenderId: "1016802563845",
  appId: "1:1016802563845:web:1a34981181bd0bf1e7496c",
  measurementId: "G-17KZVVPTTV"
};

// Initialize Firebase and export Firestore instance
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
