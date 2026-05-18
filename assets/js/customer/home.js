// assets/js/customer/home.js

import { logout } from "../auth.js";
import { requireRole } from "../guards.js";
import { USER_ROLES } from "../constants.js";
import {
  showToast,
  formatCurrency,
  debounce,
  paginate,
  renderPagination
} from "../utils.js";

import { getProducts } from "../services/product-service.js";
import { getCategories } from "../services/category-service.js";
import { addToCart, getCart } from "../services/cart-service.js";

// DOM Elements
const productsGrid = document.getElementById("productsGrid");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const paginationContainer = document.getElementById(
  "paginationContainer"
);
const logoutBtn = document.getElementById("logoutBtn");
const cartCountBadge = document.getElementById(
  "cartCountBadge"
);

// State
let allProducts = [];
let filteredProducts = [];
let currentPage = 1;
const ITEMS_PER_PAGE = 8;

/* =========================================================
   CART BADGE
========================================================= */
export async function updateCartBadge() {
  try {
    const cart = await getCart();
    const items = cart?.items || [];

    const totalQty = items.reduce(
      (sum, item) => sum + Number(item.quantity || 0),
      0
    );

    if (!cartCountBadge) return;

    cartCountBadge.textContent = totalQty;
    cartCountBadge.style.display =
      totalQty > 0 ? "inline-flex" : "none";
  } catch (error) {
    console.error("Cart badge error:", error);

    if (cartCountBadge) {
      cartCountBadge.style.display = "none";
    }
  }
}

// Make globally available
window.updateCartBadge = updateCartBadge;

/* =========================================================
   LOAD CATEGORIES
========================================================= */
async function loadCategories() {
  if (!categoryFilter) return;

  const categories = await getCategories();

  const activeCategories = categories.filter(
    (category) => category.isActive
  );

  categoryFilter.innerHTML = `
    <option value="">All Categories</option>
    ${activeCategories
      .map(
        (category) => `
          <option value="${category.id}">
            ${category.name}
          </option>
        `
      )
      .join("")}
  `;
}

/* =========================================================
   LOAD PRODUCTS
========================================================= */
async function loadProducts() {
  const products = await getProducts();

  allProducts = products.filter(
    (product) =>
      product.isActive &&
      Number(product.quantity) > 0
  );

  applyFilters();
}

/* =========================================================
   APPLY FILTERS
========================================================= */
function applyFilters() {
  const search =
    searchInput?.value?.trim().toLowerCase() || "";

  const categoryId =
    categoryFilter?.value || "";

  filteredProducts = allProducts.filter(
    (product) => {
      const title =
        (product.title || "").toLowerCase();

      const matchesSearch =
        !search ||
        title.includes(search);

      const matchesCategory =
        !categoryId ||
        product.categoryId === categoryId;

      return (
        matchesSearch &&
        matchesCategory
      );
    }
  );

  currentPage = 1;
  renderCurrentPage();
}

/* =========================================================
   RENDER CURRENT PAGE
========================================================= */
/* =========================================================
   RENDER CURRENT PAGE
   Replace only this function in home.js
========================================================= */
function renderCurrentPage() {
  const result = paginate(
    filteredProducts,
    currentPage,
    ITEMS_PER_PAGE
  );

  const pageItems =
    result?.data ||
    result?.items ||
    [];

  const totalPages =
    result?.totalPages || 1;

  // Render products
  renderProducts(pageItems);

  // Clear pagination if container missing
  if (!paginationContainer) {
    return;
  }

  // IMPORTANT:
  // Your renderPagination() in utils.js expects:
  // renderPagination(container, currentPage, totalPages, onPageChange)
  renderPagination(
    paginationContainer,
    currentPage,
    totalPages,
    (page) => {
      currentPage = page;
      renderCurrentPage();

      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    }
  );
}

/* =========================================================
   RENDER PRODUCTS
========================================================= */
function renderProducts(products = []) {
  if (!productsGrid) return;

  if (!products.length) {
    productsGrid.innerHTML = `
      <div
        class="card"
        style="
          grid-column: 1 / -1;
          text-align: center;
          padding: 3rem;
        "
      >
        <h3>No products found</h3>
        <p>Try adjusting your search or category filter.</p>
      </div>
    `;

    return;
  }

  productsGrid.innerHTML = products
    .map(
      (product) => `
        <div class="product-card">
          <img
            src="${
              product.imageUrl ||
              "https://via.placeholder.com/600x800?text=No+Image"
            }"
            alt="${product.title || "Product"}"
            class="product-image"
          />

          <div class="product-body">
            <h3 class="product-title">
              ${product.title || "Untitled Product"}
            </h3>

            <p class="product-description">
              ${(product.description || "")
                .slice(0, 90)}
            </p>

            <div class="product-price">
              ${formatCurrency(
                Number(product.price || 0)
              )}
            </div>

            <div class="product-actions">
              <a
                href="product-details.html?id=${product.id}"
                class="btn btn-secondary btn-sm"
              >
                View
              </a>

              <button
                class="btn btn-primary btn-sm add-to-cart-btn"
                data-id="${product.id}"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      `
    )
    .join("");

  bindAddToCartButtons();
}

/* =========================================================
   ADD TO CART
========================================================= */
function bindAddToCartButtons() {
  document
    .querySelectorAll(".add-to-cart-btn")
    .forEach((button) => {
      button.addEventListener(
        "click",
        async () => {
          const productId =
            button.dataset.id;

          const product =
            allProducts.find(
              (item) =>
                item.id === productId
            );

          if (!product) return;

          try {
            button.disabled = true;
            button.textContent =
              "Adding...";

            await addToCart(
              product,
              1
            );

            showToast(
              "Added to cart"
            );

            await updateCartBadge();
          } catch (error) {
            console.error(error);

            showToast(
              error.message,
              "error"
            );
          } finally {
            button.disabled = false;
            button.textContent =
              "Add to Cart";
          }
        }
      );
    });
}

/* =========================================================
   EVENTS
========================================================= */
searchInput?.addEventListener(
  "input",
  debounce(applyFilters, 300)
);

categoryFilter?.addEventListener(
  "change",
  applyFilters
);

logoutBtn?.addEventListener(
  "click",
  logout
);

/* =========================================================
   INIT
========================================================= */
async function init() {
  await requireRole(
    USER_ROLES.CUSTOMER
  );

  await loadCategories();
  await loadProducts();
  await updateCartBadge();
}

init().catch((error) => {
  console.error(
    "Customer home error:",
    error
  );

  showToast(
    error.message || "Something went wrong",
    "error"
  );
});