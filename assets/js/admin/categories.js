
import { logout } from "../auth.js";
import { requireRole } from "../guards.js";
import { USER_ROLES } from "../constants.js";
import { showToast } from "../utils.js";

import {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  toggleCategoryStatus
} from "../services/category-service.js";

// DOM Elements
const categoryForm = document.getElementById("categoryForm");
const categoryIdInput = document.getElementById("categoryId");
const categoryNameInput = document.getElementById("categoryName");
const categoryDescriptionInput = document.getElementById("categoryDescription");
const tableBody = document.getElementById("categoriesTableBody");
const logoutBtn = document.getElementById("logoutBtn");

// Load categories into table
async function loadCategories() {
  const categories = await getCategories();

  if (!categories.length) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="4" style="text-align:center; padding:1rem;">
          No categories found.
        </td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = categories
    .map(
      (category) => `
        <tr>
          <td>${category.name}</td>
          <td>${category.description || "-"}</td>
          <td>
            ${
              category.isActive
                ? '<span style="color:green; font-weight:600;">Active</span>'
                : '<span style="color:red; font-weight:600;">Inactive</span>'
            }
          </td>
          <td>
            <button
              class="btn btn-secondary btn-sm edit-btn"
              data-id="${category.id}"
            >
              Edit
            </button>

            <button
              class="btn btn-secondary btn-sm toggle-btn"
              data-id="${category.id}"
              data-active="${category.isActive}"
            >
              ${category.isActive ? "Deactivate" : "Activate"}
            </button>
          </td>
        </tr>
      `
    )
    .join("");

  bindActionButtons();
}

// Bind Edit and Toggle buttons
function bindActionButtons() {
  document.querySelectorAll(".edit-btn").forEach((button) => {
    button.addEventListener("click", async () => {
      const id = button.dataset.id;
      const category = await getCategoryById(id);

      if (!category) return;

      categoryIdInput.value = category.id;
      categoryNameInput.value = category.name;
      categoryDescriptionInput.value = category.description || "";

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

      await toggleCategoryStatus(id, !currentState);
      showToast("Category status updated");
      await loadCategories();
    });
  });
}

// Reset form
function resetForm() {
  categoryForm.reset();
  categoryIdInput.value = "";
}

// Handle create/update
categoryForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = categoryIdInput.value.trim();

  const data = {
    name: categoryNameInput.value.trim(),
    description: categoryDescriptionInput.value.trim()
  };

  try {
    if (id) {
      await updateCategory(id, data);
      showToast("Category updated successfully");
    } else {
      await createCategory(data);
      showToast("Category created successfully");
    }

    resetForm();
    await loadCategories();
  } catch (error) {
    console.error(error);
    showToast(error.message, "error");
  }
});

// Logout
logoutBtn.addEventListener("click", logout);

// Initialize page
async function init() {
  await requireRole(USER_ROLES.ADMIN);
  await loadCategories();
}

init().catch((error) => {
  console.error("Categories page error:", error);
  showToast(error.message, "error");
});