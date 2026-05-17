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
import { addToCart } from "../services/cart-service.js";

// DOM Elements
const productsGrid = document.getElementById("productsGrid");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const paginationContainer = document.getElementById("paginationContainer");
const logoutBtn = document.getElementById("logoutBtn");

// State
let allProducts = [];
let filteredProducts = [];
let currentPage = 1;

const PAGE_SIZE = 8;

// Load categories into dropdown
async function loadCategories() {
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

// Load products from Firestore
async function loadProducts() {
  renderSkeletons();

  const products = await getProducts();

  allProducts = products.filter(
    (product) =>
      product.isActive &&
      Number(product.quantity) > 0
  );

  filteredProducts = [...allProducts];
  currentPage = 1;

  renderCurrentPage();
}
function renderSkeletons(count = 8) {
  productsGrid.innerHTML = Array(count)
    .fill()
    .map(
      () => `
        <div class="product-card">
          <div class="skeleton skeleton-card"></div>
          <div class="product-body">
            <div class="skeleton skeleton-text"></div>
            <div class="skeleton skeleton-text short"></div>
            <div
              class="skeleton skeleton-text short"
              style="margin-top: 1rem;"
            ></div>
          </div>
        </div>
      `
    )
    .join("");

  paginationContainer.innerHTML = "";
}

// Render current paginated page
function renderCurrentPage() {
  const result = paginate(
    filteredProducts,
    currentPage,
    PAGE_SIZE
  );

  renderProducts(result.items);

  renderPagination({
    container: paginationContainer,
    currentPage: result.currentPage,
    totalPages: result.totalPages,
    onPageChange: (page) => {
      currentPage = page;
      renderCurrentPage();

      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    }
  });
}

// Render product cards
function renderProducts(products) {
  if (!products.length) {
    productsGrid.innerHTML = `
      <div
        class="card"
        style="grid-column: 1 / -1; text-align: center;"
      >
        No products found.
      </div>
    `;

    paginationContainer.innerHTML = "";
    return;
  }

  productsGrid.innerHTML = products
    .map(
      (product) => `
        <div class="product-card">
          <img
            src="${
              product.imageUrl ||
              "https://via.placeholder.com/400x300?text=No+Image"
            }"
            alt="${product.title}"
            class="product-image"
          />

          <div class="product-body">
            <h3 class="product-title">
              ${product.title}
            </h3>

            <p class="product-description">
              ${(product.description || "").slice(0, 80)}
            </p>

            <div class="product-price">
              ${formatCurrency(product.price)}
            </div>

            <div class="product-actions">
              <a
                href="product-details.html?id=${product.id}"
                class="btn btn-secondary"
              >
                View
              </a>

              <button
                class="btn btn-primary add-to-cart-btn"
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

// Bind Add to Cart buttons
function bindAddToCartButtons() {
  document.querySelectorAll(".add-to-cart-btn").forEach((button) => {
    button.addEventListener("click", async () => {
      const productId = button.dataset.id;

      const product = allProducts.find(
        (item) => item.id === productId
      );

      if (!product) return;

      try {
        await addToCart(product, 1);
        showToast("Added to cart");
      } catch (error) {
        console.error(error);
        showToast(error.message, "error");
      }
    });
  });
}

// Search and category filter
function applyFilters() {
  const search = searchInput.value.trim().toLowerCase();
  const categoryId = categoryFilter.value;

  let filtered = [...allProducts];

  // Search filter
  if (search) {
    filtered = filtered.filter((product) =>
      product.title.toLowerCase().includes(search)
    );
  }

  // Category filter
  if (categoryId) {
    filtered = filtered.filter(
      (product) => product.categoryId === categoryId
    );
  }

  filteredProducts = filtered;
  currentPage = 1;

  renderCurrentPage();
}

// Event Listeners
searchInput.addEventListener(
  "input",
  debounce(applyFilters, 300)
);

categoryFilter.addEventListener(
  "change",
  applyFilters
);

logoutBtn.addEventListener(
  "click",
  logout
);

// Initialize page
async function init() {
  await requireRole(USER_ROLES.CUSTOMER);
  await loadCategories();
  await loadProducts();
}

init().catch((error) => {
  console.error("Customer home error:", error);
  showToast(error.message, "error");
});