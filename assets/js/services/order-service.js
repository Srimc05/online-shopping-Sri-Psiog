import {
  auth,
  db,
  serverTimestamp
} from "../firebase-config.js";

import {
  COLLECTIONS,
  PAYMENT_TYPES
} from "../constants.js";

import {
  generateInvoiceNumber
} from "../utils.js";

import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  runTransaction,
  query,
  where,
  orderBy
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

// Get current user's profile
async function getCurrentUserProfile() {
  const userRef = doc(db, COLLECTIONS.USERS, auth.currentUser.uid);
  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) {
    throw new Error("User profile not found");
  }

  return {
    id: snapshot.id,
    ...snapshot.data()
  };
}

// Create order with transaction
export async function placeOrder(cart, paymentType) {
  if (!cart.items || !cart.items.length) {
    throw new Error("Cart is empty");
  }

  const user = auth.currentUser;
  const userProfile = await getCurrentUserProfile();
  const invoiceNumber = generateInvoiceNumber();

  return await runTransaction(db, async (transaction) => {
    let subtotal = 0;

    // Validate stock and calculate subtotal
    for (const item of cart.items) {
      const productRef = doc(
        db,
        COLLECTIONS.PRODUCTS,
        item.productId
      );

      const productSnap = await transaction.get(productRef);

      if (!productSnap.exists()) {
        throw new Error(`${item.title} no longer exists`);
      }

      const product = productSnap.data();

      if (!product.isActive) {
        throw new Error(`${item.title} is inactive`);
      }

      if (product.quantity < item.quantity) {
        throw new Error(
          `Insufficient stock for ${item.title}`
        );
      }

      subtotal += item.price * item.quantity;
    }

    const tax = subtotal * 0.18;
    const grandTotal = subtotal + tax;

    // Validate credit limit
    if (paymentType === PAYMENT_TYPES.CREDIT) {
      const availableCredit = userProfile.creditLimit || 0;

      if (grandTotal > availableCredit) {
        throw new Error("Insufficient credit limit");
      }
    }

    // Create order
    const ordersRef = collection(db, COLLECTIONS.ORDERS);
    const orderRef = doc(ordersRef);

    const orderData = {
      orderId: orderRef.id,
      invoiceNumber,
      userId: user.uid,
      customerName: userProfile.name || "",
      customerEmail: userProfile.email,
      items: cart.items,
      subtotal,
      tax,
      grandTotal,
      paymentType,
      paymentStatus:
        paymentType === PAYMENT_TYPES.CASH
          ? "paid"
          : "approved",
      createdAt: serverTimestamp()
    };

    transaction.set(orderRef, orderData);

    // Create payment record
    const paymentsRef = collection(db, COLLECTIONS.PAYMENTS);
    const paymentRef = doc(paymentsRef);

    transaction.set(paymentRef, {
      orderId: orderRef.id,
      userId: user.uid,
      amount: grandTotal,
      paymentType,
      status: orderData.paymentStatus,
      createdAt: serverTimestamp()
    });

    // Reduce stock
    for (const item of cart.items) {
      const productRef = doc(
        db,
        COLLECTIONS.PRODUCTS,
        item.productId
      );

      const productSnap = await transaction.get(productRef);
      const product = productSnap.data();

      transaction.update(productRef, {
        quantity: product.quantity - item.quantity,
        updatedAt: serverTimestamp()
      });
    }

    // Deduct credit and record transaction
    if (paymentType === PAYMENT_TYPES.CREDIT) {
      const userRef = doc(
        db,
        COLLECTIONS.USERS,
        user.uid
      );

      const newBalance =
        (userProfile.creditLimit || 0) - grandTotal;

      transaction.update(userRef, {
        creditLimit: newBalance,
        updatedAt: serverTimestamp()
      });

      const creditRef = doc(
        collection(db, COLLECTIONS.CREDIT_TRANSACTIONS)
      );

      transaction.set(creditRef, {
        userId: user.uid,
        orderId: orderRef.id,
        amount: grandTotal,
        type: "debit",
        balanceAfter: newBalance,
        createdAt: serverTimestamp()
      });
    }

    return {
      orderId: orderRef.id,
      invoiceNumber
    };
  });
}

// Get current user's orders
export async function getMyOrders() {
  const q = query(
    collection(db, COLLECTIONS.ORDERS),
    where("userId", "==", auth.currentUser.uid),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data()
  }));
}

// Get single order
export async function getOrderById(orderId) {
  const snapshot = await getDoc(
    doc(db, COLLECTIONS.ORDERS, orderId)
  );

  if (!snapshot.exists()) {
    return null;
  }

  return {
    id: snapshot.id,
    ...snapshot.data()
  };
}