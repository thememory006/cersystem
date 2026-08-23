import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBNHoORXABB0XUZ0X6-H352jOo4AWXcEGk",
  authDomain: "cershcoolsystem.firebaseapp.com",
  projectId: "cershcoolsystem",
  storageBucket: "cershcoolsystem.firebasestorage.app",
  messagingSenderId: "281596933584",
  appId: "1:281596933584:web:42770e6c80eca1ed97b5d5",
  measurementId: "G-5ZXRDFLB2P"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider };