import { logout } from "../auth.js";
import { requireRole } from "../guards.js";
import { USER_ROLES, COLLECTIONS, PAYMENT_TYPES } from "../constants.js";
import { db } from "../firebase-config.js";
import { formatCurrency, showToast } from "../utils.js";

import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

// DOM Elements
const logoutBtn = document.getElementById("logoutBtn");

async function loadReports() {
  const ordersSnapshot = await getDocs(
    collection(db, COLLECTIONS.ORDERS)
  );

  let totalRevenue = 0;
  let totalOrders = 0;
  let cashOrders = 0;
  let creditOrders = 0;

  ordersSnapshot.forEach((docSnap) => {
    const order = docSnap.data();

    totalOrders++;
    totalRevenue += order.grandTotal || 0;

    if (order.paymentType === PAYMENT_TYPES.CASH) {
      cashOrders++;
    }

    if (order.paymentType === PAYMENT_TYPES.CREDIT) {
      creditOrders++;
    }
  });

  document.getElementById("reportTotalRevenue").textContent =
    formatCurrency(totalRevenue);

  document.getElementById("reportTotalOrders").textContent =
    totalOrders;

  document.getElementById("reportCashOrders").textContent =
    cashOrders;

  document.getElementById("reportCreditOrders").textContent =
    creditOrders;
}

// Logout
logoutBtn.addEventListener("click", logout);

// Initialize page
async function init() {
  await requireRole(USER_ROLES.ADMIN);
  await loadReports();
}

init().catch((error) => {
  console.error("Reports page error:", error);
  showToast(error.message, "error");
});