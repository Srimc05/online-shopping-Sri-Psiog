import { logout } from "../auth.js";
import { requireRole } from "../guards.js";
import { USER_ROLES } from "../constants.js";
import { showToast, formatCurrency } from "../utils.js";

import {
  getCustomers,
  updateCustomerCreditLimit
} from "../services/user-service.js";

// DOM Elements
const customersTableBody = document.getElementById("customersTableBody");
const logoutBtn = document.getElementById("logoutBtn");

// Load customers table
async function loadCustomers() {
  const customers = await getCustomers();

  if (!customers.length) {
    customersTableBody.innerHTML = `
      <tr>
        <td colspan="4" style="text-align:center; padding:1rem;">
          No customers found.
        </td>
      </tr>
    `;
    return;
  }

  customersTableBody.innerHTML = customers
    .map(
      (customer) => `
        <tr>
          <td>${customer.name || "-"}</td>
          <td>${customer.email}</td>
          <td>${formatCurrency(customer.creditLimit || 0)}</td>
          <td>
            <button
              class="btn btn-secondary btn-sm edit-credit-btn"
              data-id="${customer.id}"
              data-credit="${customer.creditLimit || 0}"
            >
              Update Credit
            </button>
          </td>
        </tr>
      `
    )
    .join("");

  bindActions();
}

// Bind update credit buttons
function bindActions() {
  document.querySelectorAll(".edit-credit-btn").forEach((button) => {
    button.addEventListener("click", async () => {
      const userId = button.dataset.id;
      const currentCredit = button.dataset.credit;

      const newCredit = prompt(
        "Enter new credit limit:",
        currentCredit
      );

      if (newCredit === null) return;

      const parsedValue = Number(newCredit);

      if (Number.isNaN(parsedValue) || parsedValue < 0) {
        showToast("Invalid credit limit", "error");
        return;
      }

      try {
        await updateCustomerCreditLimit(userId, parsedValue);
        showToast("Credit limit updated successfully");
        await loadCustomers();
      } catch (error) {
        console.error(error);
        showToast(error.message, "error");
      }
    });
  });
}

// Logout
logoutBtn.addEventListener("click", logout);

// Initialize page
async function init() {
  await requireRole(USER_ROLES.ADMIN);
  await loadCustomers();
}

init().catch((error) => {
  console.error("Customers page error:", error);
  showToast(error.message, "error");
});