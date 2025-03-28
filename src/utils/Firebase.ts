import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_APP_API_KEY,
  authDomain: import.meta.env.VITE_APP_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_APP_PROJECT_ID,
  storageBucket: import.meta.env.VITE_APP_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_APP_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_APP_ID,
  measurementId: import.meta.env.VITE_APP_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

interface UserData {
  email: string;
  password: string;
  createdAt: Date;
}

export const userSignup = async (data: UserData) => {
  try {
    await createUserWithEmailAndPassword(auth, data.email, data.password);
    return "Success";
  } catch (error: any) {
    if (error.code) {
      switch (error.code) {
        case "auth/email-already-in-use":
          return "This email is already in use.";
        case "auth/invalid-email":
          return "Invalid email address.";
        case "auth/weak-password":
          return "The password must be at least 6 characters long.";
        case "auth/operation-not-allowed":
          return "Email/password accounts are currently disabled.";
        case "auth/network-request-failed":
          return "Network error. Check your internet connection.";
        default:
          console.error("Error:", error.message);
      }
    }
  }
};

export const userLogin = async (email: string, password: string) => {
  try {
    await signInWithEmailAndPassword(auth, email, password);
    return "Success";
  } catch (error: any) {
    if(email == "") {
      return "Please enter your email.";
    }
    if(password == "") {
      return "Please enter a password.";
    }
    if (error.code) {
      switch (error.code) {
        case "auth/invalid-email":
          return "Invalid email format.";
        case "auth/wrong-password":
          return "Incorrect password.";
        case "auth/invalid-credential":
          return "Email or password is incorrect.";
        case "auth/user-disabled": 
          return "This account has been disabled.";
        case "auth/too-many-requests":
          return "Too many login attempts. Please try again later.";
        case "auth/network-request-failed":
          return "Network error. Check your connection.";
        default:
          console.error("Error:", error.message);
      }
    }
  }
};