export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(amount || 0);
}

export function generateInvoiceNumber() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `INV-${timestamp}-${random}`;
}

export function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('show');
  }, 100);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}

export function showLoader() {
  document.getElementById('globalLoader')?.classList.add('active');
}

export function hideLoader() {
  document.getElementById('globalLoader')?.classList.remove('active');
}

export function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

export function redirect(path) {
  window.location.href = path;
}

export function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

export function paginate(items, currentPage = 1, pageSize = 8) {
  const totalItems = items.length;
  const totalPages = Math.ceil(totalItems / pageSize);

  const start = (currentPage - 1) * pageSize;
  const end = start + pageSize;

  return {
    items: items.slice(start, end),
    totalItems,
    totalPages,
    currentPage,
    hasPrev: currentPage > 1,
    hasNext: currentPage < totalPages
  };
}

export function renderPagination({
  container,
  currentPage,
  totalPages,
  onPageChange
}) {
  if (totalPages <= 1) {
    container.innerHTML = "";
    return;
  }

  let html = `
    <button
      class="btn btn-secondary btn-sm"
      ${currentPage === 1 ? "disabled" : ""}
      data-page="${currentPage - 1}"
    >
      Prev
    </button>
  `;

  for (let i = 1; i <= totalPages; i++) {
    html += `
      <button
        class="btn ${
          i === currentPage
            ? "btn-primary"
            : "btn-secondary"
        } btn-sm"
        data-page="${i}"
      >
        ${i}
      </button>
    `;
  }

  html += `
    <button
      class="btn btn-secondary btn-sm"
      ${currentPage === totalPages ? "disabled" : ""}
      data-page="${currentPage + 1}"
    >
      Next
    </button>
  `;

  container.innerHTML = html;

  container.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      const page = Number(button.dataset.page);
      if (page >= 1 && page <= totalPages) {
        onPageChange(page);
      }
    });
  });
}