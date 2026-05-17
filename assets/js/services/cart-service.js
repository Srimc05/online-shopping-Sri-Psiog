import { auth, db, serverTimestamp } from "../firebase-config.js";
import { COLLECTIONS } from "../constants.js";

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

// Get current user's cart document reference
function getCartRef() {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("User not authenticated");
  }

  return doc(db, COLLECTIONS.CARTS, user.uid);
}

// Get cart
export async function getCart() {
  const cartRef = getCartRef();
  const snapshot = await getDoc(cartRef);

  if (!snapshot.exists()) {
    return {
      userId: auth.currentUser.uid,
      items: []
    };
  }

  return snapshot.data();
}

// Add item to cart
export async function addToCart(product, quantity = 1) {
  const cart = await getCart();

  const existingItem = cart.items.find(
    (item) => item.productId === product.id
  );

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.items.push({
      productId: product.id,
      title: product.title,
      price: Number(product.price),
      quantity,
      imageUrl: product.imageUrl || ""
    });
  }

  await saveCart(cart.items);
}

// Update item quantity
export async function updateCartItem(productId, quantity) {
  const cart = await getCart();

  cart.items = cart.items
    .map((item) =>
      item.productId === productId
        ? { ...item, quantity: Number(quantity) }
        : item
    )
    .filter((item) => item.quantity > 0);

  await saveCart(cart.items);
}

// Remove item from cart
export async function removeCartItem(productId) {
  const cart = await getCart();

  cart.items = cart.items.filter(
    (item) => item.productId !== productId
  );

  await saveCart(cart.items);
}

// Clear cart completely
export async function clearCart() {
  const cartRef = getCartRef();
  await deleteDoc(cartRef);
}

// Save cart to Firestore
async function saveCart(items) {
  const user = auth.currentUser;
  const cartRef = getCartRef();

  await setDoc(cartRef, {
    userId: user.uid,
    items,
    updatedAt: serverTimestamp()
  });
}