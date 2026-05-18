
export function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR"
  }).format(Number(amount || 0));
}


export function generateInvoiceNumber() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `INV-${timestamp}-${random}`;
}


export function showToast(
  message,
  type = "success"
) {
  const toast =
    document.createElement("div");

  toast.className =
    `toast ${type}`;
  toast.textContent = message;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("show");
  }, 100);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}


export function showLoader() {
  document
    .getElementById("globalLoader")
    ?.classList.add("active");
}

export function hideLoader() {
  document
    .getElementById("globalLoader")
    ?.classList.remove("active");
}


export function getQueryParam(name) {
  const params =
    new URLSearchParams(
      window.location.search
    );

  return params.get(name);
}


export function redirect(path) {
  window.location.href = path;
}


export function debounce(
  fn,
  delay = 300
) {
  let timer;

  return (...args) => {
    clearTimeout(timer);

    timer = setTimeout(() => {
      fn(...args);
    }, delay);
  };
}


export function paginate(
  items = [],
  currentPage = 1,
  pageSize = 8
) {
  const totalItems =
    items.length;

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        totalItems / pageSize
      )
    );

  const safePage =
    Math.min(
      Math.max(
        currentPage,
        1
      ),
      totalPages
    );

  const start =
    (safePage - 1) *
    pageSize;

  const end =
    start + pageSize;

  return {
    items:
      items.slice(start, end),
    totalItems,
    totalPages,
    currentPage:
      safePage,
    hasPrev:
      safePage > 1,
    hasNext:
      safePage < totalPages
  };
}


export function renderPagination(
  container,
  currentPage,
  totalPages,
  onPageChange
) {
  // Safety check
  if (!container) return;

  // Hide if only one page
  if (totalPages <= 1) {
    container.innerHTML = "";
    return;
  }

  let html = "";


  html += `
    <button
      class="btn btn-secondary btn-sm"
      ${
        currentPage === 1
          ? "disabled"
          : ""
      }
      data-page="${
        currentPage - 1
      }"
    >
      Prev
    </button>
  `;

  // Page buttons
  for (
    let page = 1;
    page <= totalPages;
    page++
  ) {
    html += `
      <button
        class="btn ${
          page ===
          currentPage
            ? "btn-primary"
            : "btn-secondary"
        } btn-sm"
        data-page="${page}"
      >
        ${page}
      </button>
    `;
  }

  // Next button
  html += `
    <button
      class="btn btn-secondary btn-sm"
      ${
        currentPage ===
        totalPages
          ? "disabled"
          : ""
      }
      data-page="${
        currentPage + 1
      }"
    >
      Next
    </button>
  `;

  // Render HTML
  container.innerHTML =
    html;

  // Bind events
  container
    .querySelectorAll(
      "button[data-page]"
    )
    .forEach((button) => {
      button.addEventListener(
        "click",
        () => {
          const page =
            Number(
              button.dataset.page
            );

          if (
            page >= 1 &&
            page <=
              totalPages &&
            page !==
              currentPage
          ) {
            onPageChange(
              page
            );
          }
        }
      );
    });
}


export function formatDate(value) {
  if (!value) return "-";

  let date;

  // Firestore Timestamp
  if (
    typeof value.toDate ===
    "function"
  ) {
    date = value.toDate();
  }
  // JS Date
  else if (
    value instanceof Date
  ) {
    date = value;
  }
  // String or timestamp
  else {
    date = new Date(value);
  }

  if (
    isNaN(date.getTime())
  ) {
    return "-";
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }
  );
}