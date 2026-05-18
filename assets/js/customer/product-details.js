import { logout } from "../auth.js";
import { requireRole } from "../guards.js";
import { USER_ROLES } from "../constants.js";
import {
  showToast,
  formatCurrency,
  getQueryParam
} from "../utils.js";

import { getProductById } from "../services/product-service.js";
import { addToCart } from "../services/cart-service.js";

const container = document.getElementById("productDetailsContainer");
const logoutBtn = document.getElementById("logoutBtn");

// Load product details
async function loadProduct() {
  const productId = getQueryParam("id");

  if (!productId) {
    container.innerHTML = `
      <div class="card">Product not found.</div>
    `;
    return;
  }

  const product = await getProductById(productId);

  if (
    !product ||
    !product.isActive ||
    Number(product.quantity) <= 0
  ) {
    container.innerHTML = `
      <div class="card">Product not available.</div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="card" style="
      display:grid;
      grid-template-columns: 1fr 1fr;
      gap:2rem;
      align-items:start;
    ">
      <img
        src="${
          product.imageUrl ||
          "https://via.placeholder.com/600x400?text=No+Image"
        }"
        alt="${product.title}"
        style="
          width:100%;
          border-radius:12px;
          object-fit:cover;
        "
      >

      <div>
        <h1 style="margin-bottom: 1rem;">
          ${product.title}
        </h1>

        <p style="
          color: var(--text-muted);
          margin-bottom: 1rem;
          line-height: 1.7;
        ">
          ${product.description || "No description available."}
        </p>

        <h2 style="
          color: var(--primary);
          margin-bottom: 1rem;
        ">
          ${formatCurrency(product.price)}
        </h2>

        <p style="margin-bottom: 1.5rem;">
          Stock: ${product.quantity}
        </p>

        <button
          id="addToCartBtn"
          class="btn btn-primary"
        >
          Add to Cart
        </button>
      </div>
    </div>
  `;

  document
    .getElementById("addToCartBtn")
    .addEventListener("click", async () => {
      try {
        await addToCart(product, 1);
        showToast("Added to cart");
      } catch (error) {
        console.error(error);
        showToast(error.message, "error");
      }
    });
}

// Logout
logoutBtn.addEventListener("click", logout);

// Initialize page
async function init() {
  await requireRole(USER_ROLES.CUSTOMER);
  await loadProduct();
}

init().catch((error) => {
  console.error("Product details error:", error);
  showToast(error.message, "error");
});