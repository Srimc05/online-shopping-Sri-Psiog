// assets/js/services/order-service.js

import {
  db,
  auth,
  serverTimestamp
} from "../firebase-config.js";

import {
  COLLECTIONS,
  PAYMENT_TYPES
} from "../constants.js";

import {
  doc,
  collection,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  runTransaction
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

// Generate invoice number
function generateInvoiceNumber() {
  return `INV-${Date.now()}`;
}

// Place Order
export async function placeOrder(cart, paymentType) {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("User not authenticated");
  }

  const items = cart?.items || [];

  if (!items.length) {
    throw new Error("Cart is empty");
  }

  return await runTransaction(db, async (transaction) => {
    const userRef = doc(
      db,
      COLLECTIONS.USERS,
      user.uid
    );

    // Read user
    const userSnap = await transaction.get(userRef);

    if (!userSnap.exists()) {
      throw new Error("User profile not found");
    }

    const userData = userSnap.data();

    // Read all products first
    const productData = [];

    for (const item of items) {
      const productRef = doc(
        db,
        COLLECTIONS.PRODUCTS,
        item.productId
      );

      const productSnap =
        await transaction.get(productRef);

      if (!productSnap.exists()) {
        throw new Error(
          `${item.title} no longer exists`
        );
      }

      const product = productSnap.data();

      if (
        Number(product.quantity) <
        Number(item.quantity)
      ) {
        throw new Error(
          `Insufficient stock for ${item.title}`
        );
      }

      productData.push({
        ref: productRef,
        product,
        item
      });
    }

    // Calculate totals
    let subtotal = 0;

    for (const item of items) {
      subtotal +=
        Number(item.price) *
        Number(item.quantity);
    }

    const tax = subtotal * 0.18;
    const grandTotal = subtotal + tax;

    // Credit validation
    if (
      paymentType === PAYMENT_TYPES.CREDIT &&
      Number(userData.creditLimit || 0) <
        grandTotal
    ) {
      throw new Error(
        "Insufficient credit limit"
      );
    }

    // Create refs
    const orderRef = doc(
      collection(db, COLLECTIONS.ORDERS)
    );

    const paymentRef = doc(
      collection(db, COLLECTIONS.PAYMENTS)
    );

    // Update stock
    for (const entry of productData) {
      transaction.update(entry.ref, {
        quantity:
          Number(entry.product.quantity) -
          Number(entry.item.quantity),
        updatedAt: serverTimestamp()
      });
    }

    // Update credit limit if payment type is credit
    if (paymentType === PAYMENT_TYPES.CREDIT) {
      transaction.update(userRef, {
        creditLimit:
          Number(userData.creditLimit || 0) -
          grandTotal,
        updatedAt: serverTimestamp()
      });
    }

    // Create order
    const invoiceNumber = generateInvoiceNumber();

    transaction.set(orderRef, {
      orderNumber: invoiceNumber,
      invoiceNumber,

      customerId: user.uid,
      customerName: userData.name || "",
      customerEmail: userData.email || "",

      items,
      subtotal,
      tax,
      grandTotal,
      paymentType,
      status: "Placed",

      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    // Create payment record
    transaction.set(paymentRef, {
      orderId: orderRef.id,
      customerId: user.uid,
      amount: grandTotal,
      paymentType,
      status: "Paid",
      createdAt: serverTimestamp()
    });

    return {
      orderId: orderRef.id
    };
  });
}

// Get single order by ID
export async function getOrderById(orderId) {
  const orderRef = doc(
    db,
    COLLECTIONS.ORDERS,
    orderId
  );

  const snapshot = await getDoc(orderRef);

  if (!snapshot.exists()) {
    return null;
  }

  return {
    id: snapshot.id,
    ...snapshot.data()
  };
}

// Get all orders of currently logged-in customer
export async function getMyOrders() {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("User not authenticated");
  }

  const ordersRef = collection(
    db,
    COLLECTIONS.ORDERS
  );

  const q = query(
    ordersRef,
    where("customerId", "==", user.uid),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data()
  }));
}