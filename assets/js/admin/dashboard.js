import { logout } from "../auth.js";
import { requireRole } from "../guards.js";
import { USER_ROLES, COLLECTIONS } from "../constants.js";
import { db } from "../firebase-config.js";
import { formatCurrency } from "../utils.js";

import {
  collection,
  getDocs,
  query,
  where
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

async function loadDashboard() {
  // Only admins can access this page
  await requireRole(USER_ROLES.ADMIN);

  // Load all data in parallel
  const [
    productsSnapshot,
    customersSnapshot,
    ordersSnapshot
  ] = await Promise.all([
    getDocs(
      query(
        collection(db, COLLECTIONS.PRODUCTS),
        where("isActive", "==", true)
      )
    ),
    getDocs(
      query(
        collection(db, COLLECTIONS.USERS),
        where("role", "==", USER_ROLES.CUSTOMER)
      )
    ),
    getDocs(collection(db, COLLECTIONS.ORDERS))
  ]);

  // Counts
  const totalProducts = productsSnapshot.size;
  const totalCustomers = customersSnapshot.size;
  const totalOrders = ordersSnapshot.size;

  // Calculate total sales
  let totalSales = 0;
  ordersSnapshot.forEach((doc) => {
    const order = doc.data();
    totalSales += order.grandTotal || 0;
  });

  // Update UI
  document.getElementById("totalProducts").textContent = totalProducts;
  document.getElementById("totalCustomers").textContent = totalCustomers;
  document.getElementById("totalOrders").textContent = totalOrders;
  document.getElementById("totalSales").textContent =
    formatCurrency(totalSales);
}

// Logout button
document
  .getElementById("logoutBtn")
  .addEventListener("click", logout);

// Initialize page
loadDashboard().catch((error) => {
  console.error("Dashboard error:", error);
});