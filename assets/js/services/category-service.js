import { db, serverTimestamp } from "../firebase-config.js";
import { COLLECTIONS } from "../constants.js";

import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

const categoriesRef = collection(db, COLLECTIONS.CATEGORIES);


export async function createCategory(data) {
  return await addDoc(categoriesRef, {
    name: data.name,
    description: data.description || "",
    isActive: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
}


export async function getCategories() {
  const q = query(categoriesRef, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data()
  }));
}


export async function getCategoryById(id) {
  const snapshot = await getDoc(doc(db, COLLECTIONS.CATEGORIES, id));

  if (!snapshot.exists()) return null;

  return {
    id: snapshot.id,
    ...snapshot.data()
  };
}


export async function updateCategory(id, data) {
  const categoryRef = doc(db, COLLECTIONS.CATEGORIES, id);

  await updateDoc(categoryRef, {
    name: data.name,
    description: data.description || "",
    updatedAt: serverTimestamp()
  });
}


export async function toggleCategoryStatus(id, isActive) {
  const categoryRef = doc(db, COLLECTIONS.CATEGORIES, id);

  await updateDoc(categoryRef, {
    isActive,
    updatedAt: serverTimestamp()
  });
}