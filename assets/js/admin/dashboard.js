
import { logout } from "../auth.js";
import { requireRole } from "../guards.js";
import { USER_ROLES, COLLECTIONS } from "../constants.js";
import { db } from "../firebase-config.js";
import {
  formatCurrency,
  formatDate,
  showToast
} from "../utils.js";

import {
  collection,
  getDocs,
  query,
  where
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

// DOM Elements
const logoutBtn = document.getElementById("logoutBtn");
const lowStockContainer = document.getElementById("lowStockContainer");
const topSellingContainer =
  document.getElementById("topSellingContainer");
const salesChartCanvas =
  document.getElementById("salesChart");

let salesChart = null;

async function loadDashboard() {
  await requireRole(USER_ROLES.ADMIN);

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

  const totalProducts = productsSnapshot.size;
  const totalCustomers = customersSnapshot.size;
  const totalOrders = ordersSnapshot.size;

  let totalSales = 0;
  const lowStockProducts = [];
  const salesMap = {};
  const monthlySales = {};

  // Process Orders
  ordersSnapshot.forEach((docSnap) => {
    const order = docSnap.data();

    totalSales += order.grandTotal || 0;

    // Top selling products
    (order.items || []).forEach((item) => {
      if (!salesMap[item.productId]) {
        salesMap[item.productId] = {
          title: item.title,
          quantitySold: 0,
          revenue: 0
        };
      }

      salesMap[item.productId].quantitySold += item.quantity;
      salesMap[item.productId].revenue +=
        item.price * item.quantity;
    });

    // Monthly sales
    if (order.createdAt?.toDate) {
      const date = order.createdAt.toDate();
      const monthKey = date.toLocaleString("en-IN", {
        month: "short",
        year: "numeric"
      });

      monthlySales[monthKey] =
        (monthlySales[monthKey] || 0) +
        (order.grandTotal || 0);
    }
  });

  // Process Products
  productsSnapshot.forEach((docSnap) => {
    const product = docSnap.data();

    if (Number(product.quantity) < 15) {
      lowStockProducts.push({
        id: docSnap.id,
        ...product
      });
    }
  });

  // Update Stats
  document.getElementById("totalProducts").textContent =
    totalProducts;

  document.getElementById("totalCustomers").textContent =
    totalCustomers;

  document.getElementById("totalOrders").textContent =
    totalOrders;

  document.getElementById("totalSales").textContent =
    formatCurrency(totalSales);

  // Render Sections
  renderLowStock(lowStockProducts);
  renderTopSelling(salesMap);
  renderSalesChart(monthlySales);
}

function renderLowStock(products) {
  if (!products.length) {
    lowStockContainer.innerHTML = `
      <p style="color: #16a34a; font-weight: 600;">
        All products are sufficiently stocked.
      </p>
    `;
    return;
  }

  lowStockContainer.innerHTML = `
    <table class="table">
      <thead>
        <tr>
          <th>Product</th>
          <th>Category</th>
          <th>Quantity</th>
        </tr>
      </thead>
      <tbody>
        ${products
          .map(
            (product) => `
              <tr>
                <td>${product.title}</td>
                <td>${product.categoryName || "-"}</td>
                <td>
                  <span class="badge badge-danger">
                    ${product.quantity}
                  </span>
                </td>
              </tr>
            `
          )
          .join("")}
      </tbody>
    </table>
  `;
}

function renderTopSelling(salesMap) {
  const topProducts = Object.values(salesMap)
    .sort((a, b) => b.quantitySold - a.quantitySold)
    .slice(0, 10);

  if (!topProducts.length) {
    topSellingContainer.innerHTML = `
      <p style="color: #64748b;">
        No sales data available yet.
      </p>
    `;
    return;
  }

  topSellingContainer.innerHTML = `
    <table class="table">
      <thead>
        <tr>
          <th>Product</th>
          <th>Units Sold</th>
          <th>Revenue</th>
        </tr>
      </thead>
      <tbody>
        ${topProducts
          .map(
            (product) => `
              <tr>
                <td>${product.title}</td>
                <td>${product.quantitySold}</td>
                <td>${formatCurrency(product.revenue)}</td>
              </tr>
            `
          )
          .join("")}
      </tbody>
    </table>
  `;
}

function renderSalesChart(monthlySales) {
  if (!salesChartCanvas || typeof Chart === "undefined") {
    return;
  }

  const labels = Object.keys(monthlySales);
  const values = Object.values(monthlySales);

  if (!labels.length) {
    return;
  }

  if (salesChart) {
    salesChart.destroy();
  }

  salesChart = new Chart(salesChartCanvas, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Sales",
          data: values,
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: true
        }
      }
    }
  });
}

// Logout
logoutBtn.addEventListener("click", logout);

// Initialize
async function init() {
  await loadDashboard();
}

init().catch((error) => {
  console.error("Dashboard error:", error);
  showToast(error.message, "error");
});