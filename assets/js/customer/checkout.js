// assets/js/customer/checkout.js

import { logout } from "../auth.js";
import { requireRole } from "../guards.js";
import { USER_ROLES, PAYMENT_TYPES } from "../constants.js";
import { formatCurrency, showToast } from "../utils.js";

import { getCart, clearCart } from "../services/cart-service.js";
import { placeOrder } from "../services/order-service.js";

// DOM Elements
const checkoutContainer =
  document.getElementById("checkoutContainer");

const logoutBtn =
  document.getElementById("logoutBtn");

// Load Checkout Page
async function loadCheckout() {
  const cart = await getCart();
  const items = cart?.items || [];

  // Empty cart
  if (!items.length) {
    checkoutContainer.innerHTML = `
      <div style="text-align:center; padding:2rem;">
        <h3>Your cart is empty</h3>
        <a
          href="home.html"
          class="btn btn-primary"
          style="margin-top:1rem;"
        >
          Continue Shopping
        </a>
      </div>
    `;
    return;
  }

  // Calculate totals
  let subtotal = 0;

  const itemsHtml = items
    .map((item) => {
      const itemTotal =
        Number(item.price) * Number(item.quantity);

      subtotal += itemTotal;

      return `
        <div
          style="
            display:flex;
            justify-content:space-between;
            margin-bottom:0.75rem;
          "
        >
          <span>
            ${item.title} × ${item.quantity}
          </span>
          <span>
            ${formatCurrency(itemTotal)}
          </span>
        </div>
      `;
    })
    .join("");

  const tax = subtotal * 0.18;
  const grandTotal = subtotal + tax;

  // Render UI
  checkoutContainer.innerHTML = `
    <div class="card">
      <h3 style="margin-bottom:1rem;">
        Order Summary
      </h3>

      ${itemsHtml}

      <hr style="margin:1rem 0;" />

      <div style="display:flex; justify-content:space-between;">
        <span>Subtotal</span>
        <span>${formatCurrency(subtotal)}</span>
      </div>

      <div style="display:flex; justify-content:space-between;">
        <span>Tax (18%)</span>
        <span>${formatCurrency(tax)}</span>
      </div>

      <div
        style="
          display:flex;
          justify-content:space-between;
          font-weight:700;
          margin-top:1rem;
          font-size:1.1rem;
        "
      >
        <span>Total</span>
        <span>${formatCurrency(grandTotal)}</span>
      </div>

      <div class="form-group" style="margin-top:2rem;">
        <label class="form-label">
          Payment Method
        </label>

        <select
          id="paymentType"
          class="form-control"
        >
          <option value="${PAYMENT_TYPES.CASH}">
            Cash
          </option>
          <option value="${PAYMENT_TYPES.CREDIT}">
            Credit
          </option>
        </select>
      </div>

      <button
        id="placeOrderBtn"
        class="btn btn-primary"
        style="margin-top:1rem; width:100%;"
      >
        Place Order
      </button>
    </div>
  `;

  // Place Order Button
  const placeOrderBtn =
    document.getElementById("placeOrderBtn");

  placeOrderBtn.addEventListener(
    "click",
    async () => {
      const paymentType =
        document.getElementById(
          "paymentType"
        ).value;

      try {
        // Prevent double click
        placeOrderBtn.disabled = true;
        placeOrderBtn.textContent =
          "Placing Order...";

        const result = await placeOrder(
          cart,
          paymentType
        );

        // Clear cart after successful order
        await clearCart();

        showToast(
          "Order placed successfully"
        );

        // Redirect to invoice
        window.location.href =
          `invoice.html?id=${result.orderId}`;
      } catch (error) {
        console.error(
          "Checkout error:",
          error
        );

        showToast(
          error.message,
          "error"
        );

        // Re-enable button
        placeOrderBtn.disabled = false;
        placeOrderBtn.textContent =
          "Place Order";
      }
    }
  );
}

// Logout
logoutBtn?.addEventListener(
  "click",
  logout
);

// Initialize Page
async function init() {
  await requireRole(
    USER_ROLES.CUSTOMER
  );

  await loadCheckout();
}

init().catch((error) => {
  console.error(
    "Checkout page error:",
    error
  );

  showToast(
    error.message,
    "error"
  );
});