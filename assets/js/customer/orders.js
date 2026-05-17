import { logout } from "../auth.js";
import { requireRole } from "../guards.js";
import { USER_ROLES } from "../constants.js";
import {
  formatCurrency,
  formatDate,
  showToast
} from "../utils.js";

import { getMyOrders } from "../services/order-service.js";

// DOM Elements
const ordersContainer = document.getElementById("ordersContainer");
const logoutBtn = document.getElementById("logoutBtn");

// Load orders
async function loadOrders() {
  const orders = await getMyOrders();

  if (!orders.length) {
    ordersContainer.innerHTML = `
      <div style="text-align:center; padding:2rem;">
        <h3>No orders found</h3>
        <p style="color: var(--text-muted); margin-top:0.5rem;">
          Start shopping to see your orders.
        </p>
        <a
          href="home.html"
          class="btn btn-primary"
          style="margin-top:1rem;"
        >
          Shop Now
        </a>
      </div>
    `;
    return;
  }

  ordersContainer.innerHTML = orders
    .map(
      (order) => `
        <div class="card" style="margin-bottom:1rem;">
          <div style="
            display:flex;
            justify-content:space-between;
            align-items:center;
            gap:1rem;
            flex-wrap:wrap;
          ">
            <div>
              <h3>${order.invoiceNumber}</h3>
              <p style="color: var(--text-muted);">
                ${formatDate(order.createdAt)}
              </p>
              <p>
                Payment: ${order.paymentType}
              </p>
            </div>

            <div style="text-align:right;">
              <h3>${formatCurrency(order.grandTotal)}</h3>
              <a
                href="invoice.html?id=${order.id}"
                class="btn btn-secondary btn-sm"
                style="margin-top:0.5rem;"
              >
                View Invoice
              </a>
            </div>
          </div>
        </div>
      `
    )
    .join("");
}

// Logout
logoutBtn.addEventListener("click", logout);

// Initialize page
async function init() {
  await requireRole(USER_ROLES.CUSTOMER);
  await loadOrders();
}

init().catch((error) => {
  console.error("Orders page error:", error);
  showToast(error.message, "error");
});