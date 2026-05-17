

import { logout } from "../auth.js";
import { requireRole } from "../guards.js";
import { USER_ROLES } from "../constants.js";
import { showToast, formatCurrency } from "../utils.js";

import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  toggleProductStatus
} from "../services/product-service.js";

import {
  getCategories
} from "../services/category-service.js";

// DOM Elements
const productForm = document.getElementById("productForm");
const productIdInput = document.getElementById("productId");
const productCategorySelect = document.getElementById("productCategory");
const productTitleInput = document.getElementById("productTitle");
const productDescriptionInput = document.getElementById("productDescription");
const productQuantityInput = document.getElementById("productQuantity");
const productPriceInput = document.getElementById("productPrice");
const productImageInput = document.getElementById("productImage");
const productsTableBody = document.getElementById("productsTableBody");
const logoutBtn = document.getElementById("logoutBtn");

// Load Categories into Dropdown
async function loadCategories() {
  const categories = await getCategories();

  const activeCategories = categories.filter(
    (category) => category.isActive
  );

  productCategorySelect.innerHTML = `
    <option value="">Select Category</option>
    ${activeCategories
      .map(
        (category) =>
          `<option value="${category.id}">
            ${category.name}
          </option>`
      )
      .join("")}
  `;
}

// Load Products Table
async function loadProducts() {
  const products = await getProducts();

  if (!products.length) {
    productsTableBody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align:center; padding:1rem;">
          No products found.
        </td>
      </tr>
    `;
    return;
  }

  productsTableBody.innerHTML = products
    .map(
      (product) => `
        <tr>
          <td>
            ${
              product.imageUrl
                ? `<img
                    src="${product.imageUrl}"
                    alt="${product.title}"
                    style="width:50px;height:50px;object-fit:cover;border-radius:8px;"
                  >`
                : "-"
            }
          </td>
          <td>${product.title}</td>
          <td>${product.categoryName || "-"}</td>
          <td>${product.quantity}</td>
          <td>${formatCurrency(product.price)}</td>
          <td>
            ${
              product.isActive
                ? '<span class="badge badge-success">Active</span>'
                : '<span class="badge badge-danger">Inactive</span>'
            }
          </td>
          <td>
            <button
              class="btn btn-secondary btn-sm edit-btn"
              data-id="${product.id}"
            >
              Edit
            </button>

            <button
              class="btn btn-secondary btn-sm toggle-btn"
              data-id="${product.id}"
              data-active="${product.isActive}"
            >
              ${product.isActive ? "Deactivate" : "Activate"}
            </button>
          </td>
        </tr>
      `
    )
    .join("");

  bindActionButtons();
}

// Bind Edit and Toggle Buttons
function bindActionButtons() {
  document.querySelectorAll(".edit-btn").forEach((button) => {
    button.addEventListener("click", async () => {
      const id = button.dataset.id;
      const product = await getProductById(id);

      if (!product) return;

      productIdInput.value = product.id;
      productCategorySelect.value = product.categoryId;
      productTitleInput.value = product.title;
      productDescriptionInput.value = product.description || "";
      productQuantityInput.value = product.quantity;
      productPriceInput.value = product.price;
      productImageInput.value = product.imageUrl || "";

      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    });
  });

  document.querySelectorAll(".toggle-btn").forEach((button) => {
    button.addEventListener("click", async () => {
      const id = button.dataset.id;
      const currentState = button.dataset.active === "true";

      await toggleProductStatus(id, !currentState);
      showToast("Product status updated");
      await loadProducts();
    });
  });
}

// Reset Form
function resetForm() {
  productForm.reset();
  productIdInput.value = "";
}

// Handle Create / Update
productForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const categoryId = productCategorySelect.value;
  const categoryName =
    productCategorySelect.options[
      productCategorySelect.selectedIndex
    ].text;

  const data = {
    categoryId,
    categoryName,
    title: productTitleInput.value.trim(),
    description: productDescriptionInput.value.trim(),
    quantity: productQuantityInput.value,
    price: productPriceInput.value,
    imageUrl: productImageInput.value.trim()
  };

  try {
    if (productIdInput.value) {
      await updateProduct(productIdInput.value, data);
      showToast("Product updated successfully");
    } else {
      await createProduct(data);
      showToast("Product created successfully");
    }

    resetForm();
    await loadProducts();
  } catch (error) {
    console.error(error);
    showToast(error.message, "error");
  }
});

// Logout
logoutBtn.addEventListener("click", logout);

// Initialize Page
async function init() {
  await requireRole(USER_ROLES.ADMIN);
  await loadCategories();
  await loadProducts();
}

init().catch((error) => {
  console.error("Products page error:", error);
  showToast(error.message, "error");
});