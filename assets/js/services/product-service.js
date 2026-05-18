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

const productsRef = collection(db, COLLECTIONS.PRODUCTS);

export async function createProduct(data) {
  return await addDoc(productsRef, {
    categoryId: data.categoryId,
    categoryName: data.categoryName,
    title: data.title,
    description: data.description || "",
    quantity: Number(data.quantity),
    price: Number(data.price),
    imageUrl: data.imageUrl || "",
    isActive: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
}

export async function getProducts() {
  const q = query(productsRef, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data()
  }));
}

export async function getProductById(id) {
  const snapshot = await getDoc(doc(db, COLLECTIONS.PRODUCTS, id));

  if (!snapshot.exists()) return null;

  return {
    id: snapshot.id,
    ...snapshot.data()
  };
}


export async function updateProduct(id, data) {
  const productRef = doc(db, COLLECTIONS.PRODUCTS, id);

  await updateDoc(productRef, {
    categoryId: data.categoryId,
    categoryName: data.categoryName,
    title: data.title,
    description: data.description || "",
    quantity: Number(data.quantity),
    price: Number(data.price),
    imageUrl: data.imageUrl || "",
    updatedAt: serverTimestamp()
  });
}


export async function toggleProductStatus(id, isActive) {
  const productRef = doc(db, COLLECTIONS.PRODUCTS, id);

  await updateDoc(productRef, {
    isActive,
    updatedAt: serverTimestamp()
  });
}