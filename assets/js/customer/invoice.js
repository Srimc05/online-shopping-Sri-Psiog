
import { logout } from "../auth.js";
import { requireRole } from "../guards.js";
import { USER_ROLES } from "../constants.js";
import {
  formatCurrency,
  formatDate,
  getQueryParam,
  showToast
} from "../utils.js";

import { getOrderById } from "../services/order-service.js";


const invoiceContainer = document.getElementById("invoiceContainer");
const logoutBtn = document.getElementById("logoutBtn");


async function loadInvoice() {
  const orderId = getQueryParam("id");

  if (!orderId) {
    invoiceContainer.innerHTML = `
      <div class="card">Invoice not found.</div>
    `;
    return;
  }

  const order = await getOrderById(orderId);

  if (!order) {
    invoiceContainer.innerHTML = `
      <div class="card">Invoice not found.</div>
    `;
    return;
  }

  const itemsHtml = order.items
    .map(
      (item) => `
        <tr>
          <td>${item.title}</td>
          <td>${item.quantity}</td>
          <td>${formatCurrency(item.price)}</td>
          <td>${formatCurrency(
            item.price * item.quantity
          )}</td>
        </tr>
      `
    )
    .join("");

  invoiceContainer.innerHTML = `
    <div style="
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 2rem;
      flex-wrap: wrap;
      margin-bottom: 2rem;
    ">
      <div>
        <h1>Invoice</h1>
        <p>${order.invoiceNumber}</p>
        <p>${formatDate(order.createdAt)}</p>
      </div>

      <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
        <button
          id="downloadPdfBtn"
          class="btn btn-secondary"
        >
          Download PDF
        </button>

        <button
          id="printInvoiceBtn"
          class="btn btn-secondary"
        >
          Print Invoice
        </button>
      </div>
    </div>

    <hr style="margin: 1.5rem 0;">

    <div style="margin-bottom: 2rem;">
      <h3>Customer Details</h3>
      <p>${order.customerName || "-"}</p>
      <p>${order.customerEmail}</p>
      <p>Payment Type: ${order.paymentType}</p>
    </div>

    <table class="table">
      <thead>
        <tr>
          <th>Item</th>
          <th>Qty</th>
          <th>Price</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>

    <div style="
      margin-top: 2rem;
      margin-left: auto;
      max-width: 300px;
    ">
      <div style="
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.5rem;
      ">
        <span>Subtotal</span>
        <span>${formatCurrency(order.subtotal)}</span>
      </div>

      <div style="
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.5rem;
      ">
        <span>Tax (18%)</span>
        <span>${formatCurrency(order.tax)}</span>
      </div>

      <div style="
        display: flex;
        justify-content: space-between;
        font-weight: 700;
        font-size: 1.1rem;
        border-top: 1px solid #e2e8f0;
        padding-top: 0.75rem;
      ">
        <span>Grand Total</span>
        <span>${formatCurrency(order.grandTotal)}</span>
      </div>
    </div>
  `;

  document
    .getElementById("printInvoiceBtn")
    .addEventListener("click", () => {
      window.print();
    });


  document
    .getElementById("downloadPdfBtn")
    .addEventListener("click", () => {
      window.print();
    });
}

// Logout
logoutBtn.addEventListener("click", logout);

// Initialize page
async function init() {
  await requireRole(USER_ROLES.CUSTOMER);
  await loadInvoice();
}

init().catch((error) => {
  console.error("Invoice page error:", error);
  showToast(error.message, "error");
});