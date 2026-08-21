/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  onAuthStateChanged,
  GoogleAuthProvider,
  User,
  UserCredential
} from 'firebase/auth';
import { auth, googleProvider } from './firebase';

export const signInWithGoogle = async (): Promise<{ userCredential: UserCredential; googleOAuthToken?: string }> => {
  const result = await signInWithPopup(auth, googleProvider);
  const credential = GoogleAuthProvider.credentialFromResult(result);
  const googleOAuthToken = credential?.accessToken;
  if (googleOAuthToken) {
    try {
      localStorage.setItem('sgq_vickytex_google_oauth_token', googleOAuthToken);
    } catch {}
  }
  return { userCredential: result, googleOAuthToken };
};

export const loginWithEmail = async (email: string, passwordHash: string): Promise<UserCredential> => {
  return await signInWithEmailAndPassword(auth, email, passwordHash);
};

export const registerWithEmail = async (email: string, passwordHash: string): Promise<UserCredential> => {
  return await createUserWithEmailAndPassword(auth, email, passwordHash);
};

export const logoutUser = async (): Promise<void> => {
  return await firebaseSignOut(auth);
};

export const resetPassword = async (email: string): Promise<void> => {
  return await firebaseSendPasswordResetEmail(auth, email);
};

export const subscribeToAuthChanges = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};
