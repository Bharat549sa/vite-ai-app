import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithRedirect, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword, 
  GoogleAuthProvider, 
  signOut as firebaseSignOut,
  getRedirectResult,
  onAuthStateChanged,
  User
} from "firebase/auth";

// Firebase configuration using environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
initializeApp(firebaseConfig);

// Get auth instance
const auth = getAuth();

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();

// Type for auth results
interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
}

// Sign in with Google
export const signInWithGoogle = async (): Promise<AuthResult> => {
  try {
    await signInWithRedirect(auth, googleProvider);
    return { success: true };
  } catch (error: any) {
    console.error("Error signing in with Google:", error);
    return {
      success: false,
      error: error.message || "Failed to sign in with Google",
    };
  }
};

// Register with email and password
export const registerWithEmail = async (
  email: string,
  password: string
): Promise<AuthResult> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    return {
      success: true,
      user: userCredential.user,
    };
  } catch (error: any) {
    console.error("Error registering with email:", error);
    return {
      success: false,
      error: error.message || "Failed to register",
    };
  }
};

// Sign in with email and password
export const signInWithEmail = async (
  email: string,
  password: string
): Promise<AuthResult> => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return {
      success: true,
      user: userCredential.user,
    };
  } catch (error: any) {
    console.error("Error signing in with email:", error);
    return {
      success: false,
      error: error.message || "Failed to sign in",
    };
  }
};

// Sign out
export const signOut = async (): Promise<AuthResult> => {
  try {
    await firebaseSignOut(auth);
    return { success: true };
  } catch (error: any) {
    console.error("Error signing out:", error);
    return {
      success: false,
      error: error.message || "Failed to sign out",
    };
  }
};

// Handle redirect result
export const handleRedirectResult = async (): Promise<AuthResult> => {
  try {
    const result = await getRedirectResult(auth);
    if (!result) {
      // No redirect result, not an error
      return { success: true };
    }
    
    return {
      success: true,
      user: result.user,
    };
  } catch (error: any) {
    console.error("Error handling redirect result:", error);
    return {
      success: false,
      error: error.message || "Failed to handle redirect",
    };
  }
};

// Get current user
export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

// Subscribe to auth changes
export const subscribeToAuthChanges = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};