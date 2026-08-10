/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import firebaseConfigJson from '../../firebase-applet-config.json';

const env = (import.meta as any).env || {};

// Read config from localStorage, env vars or fallback to firebase-applet-config.json
const getSavedCustomConfig = () => {
  try {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('vickytex_custom_firebase_config');
      if (saved) return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load custom firebase config', e);
  }
  return null;
};

const customConfig = getSavedCustomConfig();

const firebaseConfig = {
  apiKey: customConfig?.apiKey || env.VITE_FIREBASE_API_KEY || firebaseConfigJson.apiKey || "",
  authDomain: customConfig?.authDomain || env.VITE_FIREBASE_AUTH_DOMAIN || firebaseConfigJson.authDomain || "",
  projectId: customConfig?.projectId || env.VITE_FIREBASE_PROJECT_ID || firebaseConfigJson.projectId || "",
  storageBucket: customConfig?.storageBucket || env.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfigJson.storageBucket || "",
  messagingSenderId: customConfig?.messagingSenderId || env.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseConfigJson.messagingSenderId || "",
  appId: customConfig?.appId || env.VITE_FIREBASE_APP_ID || firebaseConfigJson.appId || ""
};

export const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth: Auth = getAuth(app);

const dbId = (firebaseConfigJson as any).firestoreDatabaseId;
export const db: Firestore = (dbId && dbId !== '(default)') ? getFirestore(app, dbId) : getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
