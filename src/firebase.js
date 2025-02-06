// src/firebase.js
import { initializeApp } from 'firebase/app';
import firebaseConfig from './firebaseConfig';
import { getAuth } from 'firebase/auth';

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get the authentication instance
const auth = getAuth(app);

// Export the auth instance to use it in your app
export { auth };
