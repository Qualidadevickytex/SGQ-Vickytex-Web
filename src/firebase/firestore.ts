/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  DocumentData,
  QueryConstraint
} from 'firebase/firestore';
import { db } from './firebase';

export const getCollectionRef = (collectionName: string) => collection(db, collectionName);
export const getDocRef = (collectionName: string, id: string) => doc(db, collectionName, id);

export const getAllDocs = async <T = DocumentData>(collectionName: string): Promise<(T & { id: string })[]> => {
  const querySnapshot = await getDocs(getCollectionRef(collectionName));
  const items: (T & { id: string })[] = [];
  querySnapshot.forEach((docSnap) => {
    items.push({ id: docSnap.id, ...(docSnap.data() as T) });
  });
  return items;
};

export const getDocById = async <T = DocumentData>(collectionName: string, id: string): Promise<(T & { id: string }) | null> => {
  const docSnap = await getDoc(getDocRef(collectionName, id));
  if (docSnap.exists()) {
    return { id: docSnap.id, ...(docSnap.data() as T) };
  }
  return null;
};

export const createDocWithId = async <T extends DocumentData>(collectionName: string, id: string, data: T): Promise<T & { id: string }> => {
  await setDoc(getDocRef(collectionName, id), { ...data, updatedAt: new Date().toISOString() }, { merge: true });
  return { id, ...data };
};

export const createDoc = async <T extends DocumentData>(collectionName: string, data: T): Promise<T & { id: string }> => {
  const docRef = await addDoc(getCollectionRef(collectionName), { ...data, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
  return { id: docRef.id, ...data };
};

export const updateDocData = async <T extends DocumentData>(collectionName: string, id: string, data: Partial<T>): Promise<void> => {
  await updateDoc(getDocRef(collectionName, id), { ...data, updatedAt: new Date().toISOString() });
};

export const deleteDocById = async (collectionName: string, id: string): Promise<void> => {
  await deleteDoc(getDocRef(collectionName, id));
};

export const queryDocs = async <T = DocumentData>(collectionName: string, ...constraints: QueryConstraint[]): Promise<(T & { id: string })[]> => {
  const q = query(getCollectionRef(collectionName), ...constraints);
  const querySnapshot = await getDocs(q);
  const items: (T & { id: string })[] = [];
  querySnapshot.forEach((docSnap) => {
    items.push({ id: docSnap.id, ...(docSnap.data() as T) });
  });
  return items;
};
