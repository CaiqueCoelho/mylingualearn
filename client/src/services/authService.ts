import { 
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { auth, googleProvider } from './firebaseConfig';

/**
 * Sign in with Google using Firebase Auth
 */
export async function signInWithGoogle(): Promise<User> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('[Auth] Google sign-in error:', error);
    throw error;
  }
}

/**
 * Sign out from Firebase Auth
 */
export async function signOut(): Promise<void> {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('[Auth] Sign-out error:', error);
    throw error;
  }
}

/**
 * Subscribe to auth state changes
 */
export function onAuthStateChange(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}

/**
 * Sign in with email and password
 */
export async function signInWithEmail(email: string, password: string): Promise<User> {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    console.error('[Auth] Email sign-in error:', error);
    throw error;
  }
}

/**
 * Register with email and password
 */
export async function registerWithEmail(email: string, password: string): Promise<User> {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    console.error('[Auth] Registration error:', error);
    throw error;
  }
}

/**
 * Sign in anonymously (guest mode)
 */
export async function signInAsGuest(): Promise<User> {
  try {
    const result = await signInAnonymously(auth);
    return result.user;
  } catch (error) {
    console.error('[Auth] Anonymous sign-in error:', error);
    throw error;
  }
}

/**
 * Get current user
 */
export function getCurrentUser(): User | null {
  return auth.currentUser;
}

/**
 * Check if user is anonymous (guest)
 */
export function isGuestUser(user: User | null): boolean {
  return user?.isAnonymous || false;
}

