import { logout } from "../auth.js";
import { requireRole } from "../guards.js";
import { USER_ROLES } from "../constants.js";
import { formatCurrency, showToast } from "../utils.js";

import {
  getCart,
  updateCartItem,
  removeCartItem
} from "../services/cart-service.js";

// DOM Elements
const cartContainer = document.getElementById("cartContainer");
const logoutBtn = document.getElementById("logoutBtn");

// Load cart
async function loadCart() {
  const cart = await getCart();
  const items = cart.items || [];

  if (!items.length) {
    cartContainer.innerHTML = `
      <div style="text-align:center; padding:2rem;">
        <h3>Your cart is empty</h3>
        <p style="color: var(--text-muted); margin-top: 0.5rem;">
          Add some products to continue shopping.
        </p>
        <a
          href="home.html"
          class="btn btn-primary"
          style="margin-top: 1rem;"
        >
          Continue Shopping
        </a>
      </div>
    `;
    return;
  }

  let subtotal = 0;

  cartContainer.innerHTML = `
    <div class="cart-items">
      ${items
        .map((item) => {
          const itemTotal = item.price * item.quantity;
          subtotal += itemTotal;

          return `
            <div class="cart-item">
              <img
                src="${
                  item.imageUrl ||
                  "https://via.placeholder.com/100x100?text=No+Image"
                }"
                alt="${item.title}"
                class="cart-item-image"
              />

              <div class="cart-item-info">
                <h3>${item.title}</h3>
                <p>${formatCurrency(item.price)}</p>
              </div>

              <input
                type="number"
                min="1"
                value="${item.quantity}"
                class="cart-qty-input"
                data-id="${item.productId}"
              />

              <div class="cart-item-total">
                ${formatCurrency(itemTotal)}
              </div>

              <button
                class="btn btn-secondary btn-sm remove-btn"
                data-id="${item.productId}"
              >
                Remove
              </button>
            </div>
          `;
        })
        .join("")}
    </div>

    <hr style="margin: 2rem 0;">

    <div class="cart-summary">
      <h2>Subtotal: ${formatCurrency(subtotal)}</h2>

      <a
        href="checkout.html"
        class="btn btn-primary"
        style="margin-top: 1rem;"
      >
        Proceed to Checkout
      </a>
    </div>
  `;

  bindCartActions();
}

// Bind quantity updates and remove buttons
function bindCartActions() {
  // Quantity update
  document.querySelectorAll(".cart-qty-input").forEach((input) => {
    input.addEventListener("change", async () => {
      const productId = input.dataset.id;
      const quantity = Number(input.value);

      if (quantity < 1) {
        input.value = 1;
        return;
      }

      try {
        await updateCartItem(productId, quantity);
        await loadCart();
      } catch (error) {
        console.error(error);
        showToast(error.message, "error");
      }
    });
  });

  // Remove item
  document.querySelectorAll(".remove-btn").forEach((button) => {
    button.addEventListener("click", async () => {
      const productId = button.dataset.id;

      try {
        await removeCartItem(productId);
        showToast("Item removed from cart");
        await loadCart();
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
  await requireRole(USER_ROLES.CUSTOMER);
  await loadCart();
}

init().catch((error) => {
  console.error("Cart page error:", error);
  showToast(error.message, "error");
});