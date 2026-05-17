import { db, serverTimestamp } from "../firebase-config.js";
import { COLLECTIONS, USER_ROLES } from "../constants.js";

import {
  collection,
  getDocs,
  doc,
  updateDoc,
  query,
  where,
  orderBy
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

const usersRef = collection(db, COLLECTIONS.USERS);

// Get all customers only
export async function getCustomers() {
  const q = query(
    usersRef,
    where("role", "==", USER_ROLES.CUSTOMER),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data()
  }));
}

// Update customer credit limit
export async function updateCustomerCreditLimit(userId, creditLimit) {
  const userRef = doc(db, COLLECTIONS.USERS, userId);

  await updateDoc(userRef, {
    creditLimit: Number(creditLimit),
    updatedAt: serverTimestamp()
  });
}