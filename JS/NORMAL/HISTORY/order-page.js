
/* =========================================================
 * U9 ORDER HISTORY PAGE
 * File: JS/NORMAL/HISTORY/order-page.js
 *
 * Page ID:       History-model-Order-Page
 * Navigation ID: History-model-Order-button
 * Refresh ID:    U9-history-order-refresh
 * Pagination ID: U9-history-order-pagination
 * Token:         localStorage["u9_token"]
 * Edge Function: u9-order-history
 * ========================================================= */

(function () {
  "use strict";

  const PAGE_ID = "History-model-Order-Page";
  const BUTTON_ID = "History-model-Order-button";
  const FUNCTION_NAME = "u9-order-history";

  const PAGE_SIZE = 10;
  const VISIBLE_PAGE_BUTTONS = 3;
  const CACHE_MS = 15000;

  let initialized = false;
  let loading = false;
  let allOrders = [];
  let currentPage = 1;
  let lastLoadTime = 0;

  /* =======================================================
     BASIC HELPERS
  ======================================================= */

  function getPage() {
    return document.getElementById(PAGE_ID);
  }

  function getSupabaseClient() {
    return window.supabaseClient || window.supabase || null;
  }

  function getSessionToken() {
    return localStorage.getItem("u9_token") || "";
  }

  function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, function (char) {
      const entities = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      };

      return entities[char];
    });
  }

  function getSafeImageURL(value) {
    if (typeof value !== "string" || !value.trim()) {
      return "";
    }

    try {
      const url = new URL(value.trim(), window.location.href);

      if (url.protocol !== "https:" && url.protocol !== "http:") {
        return "";
      }

      return url.href;
    } catch (_) {
      return "";
    }
  }

  function formatMoney(value) {
    const number = Number(value);

    if (!Number.isFinite(number)) {
      return "0.00";
    }

    return number.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  function formatDate(value) {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return date.toLocaleString();
  }

  function getStatusInfo(status) {
    const value = String(status || "unknown").toLowerCase();

    const knownStatuses = {
      completed: {
        label: "Completed",
        className: "completed"
      },
      complete: {
        label: "Completed",
        className: "completed"
      },
      pending: {
        label: "Pending",
        className: "pending"
      },
      matching: {
        label: "Matching",
        className: "matching"
      },
      processing: {
        label: "Processing",
        className: "processing"
      },
      cancelled: {
        label: "Cancelled",
        className: "cancelled"
      },
      canceled: {
        label: "Cancelled",
        className: "canceled"
      },
      failed: {
        label: "Failed",
        className: "failed"
      }
    };

    return knownStatuses[value] || {
      label: value.charAt(0).toUpperCase() + value.slice(1),
      className: ""
    };
  }

  /* =======================================================
     CENTRAL LOADING / ERROR STATE
  ======================================================= */

  function showOrderHistoryState(type, message) {
    const page = getPage();

    const state = page?.querySelector(
      "#U9-history-order-state"
    );

    const stateMessage = page?.querySelector(
      "#U9-history-order-state-message"
    );

    const retryButton = page?.querySelector(
      "#U9-history-order-retry"
    );

    const list = page?.querySelector(
      "#U9-history-order-list"
    );

    if (!state || !stateMessage) return;

    state.hidden = false;
    state.dataset.state = type;
    stateMessage.textContent = message;

    if (retryButton) {
      retryButton.hidden = type !== "error";
    }

    if (list) {
      list.hidden = true;
    }
  }

  function hideOrderHistoryState() {
    const page = getPage();

    const state = page?.querySelector(
      "#U9-history-order-state"
    );

    const list = page?.querySelector(
      "#U9-history-order-list"
    );

    if (state) {
      state.hidden = true;
      delete state.dataset.state;
    }

    if (list) {
      list.hidden = false;
    }
  }

  /* =======================================================
     REFRESH BUTTON
  ======================================================= */

  function setLoading(isLoading) {
    const button = getPage()?.querySelector(
      "#U9-history-order-refresh"
    );

    if (!button) return;

    button.disabled = isLoading;
    button.textContent = "Refresh";
  }

  /* =======================================================
     CREATE PAGE STRUCTURE
  ======================================================= */

  function renderPage() {
    const page = getPage();

    if (!page) {
      console.error(
        "[U9 Order History] Page element not found:",
        PAGE_ID
      );

      return false;
    }

    if (page.dataset.orderHistoryRendered === "true") {
      return true;
    }

    page.innerHTML = `
      <div class="U9-history-order-sticky">

        <div class="U9-history-order-summary-row">

          <p id="U9-history-order-summary">
            0 orders
          </p>

          <nav
            id="U9-history-order-pagination"
            aria-label="Order history pagination"
          ></nav>

          <button
            type="button"
            id="U9-history-order-refresh"
          >
            Refresh
          </button>

        </div>

      </div>

      <div
        id="U9-history-order-state"
        class="U9-history-order-state"
        role="status"
        aria-live="polite"
        hidden
      >
        <img
          class="U9-history-order-loading-image"
          src="/SVG/logo/loading.svg"
          alt=""
        >

        <p id="U9-history-order-state-message">
          Loading order history...
        </p>

        <button
          type="button"
          id="U9-history-order-retry"
          hidden
        >
          Try again
        </button>
      </div>

      <div id="U9-history-order-list"></div>
    `;

    page.dataset.orderHistoryRendered = "true";

    /* Refresh button */

    page.querySelector("#U9-history-order-refresh")
      ?.addEventListener("click", function () {
        loadOrderHistory(true);
      });

    /* Retry button */

    page.querySelector("#U9-history-order-retry")
      ?.addEventListener("click", function () {
        loadOrderHistory(true);
      });

    /* Pagination buttons */

    page.querySelector("#U9-history-order-pagination")
      ?.addEventListener("click", function (event) {
        const target = event.target;

        if (!(target instanceof Element)) {
          return;
        }

        const button = target.closest(
          "button[data-page-action], button[data-page-number]"
        );

        if (!button || button.disabled) {
          return;
        }

        const action = button.dataset.pageAction;

        if (action === "previous") {
          changePage(currentPage - 1);
          return;
        }

        if (action === "next") {
          changePage(currentPage + 1);
          return;
        }

        if (button.dataset.pageNumber) {
          const pageNumber = Number(button.dataset.pageNumber);

          if (Number.isInteger(pageNumber)) {
            changePage(pageNumber);
          }
        }
      });

    return true;
  }

  /* =======================================================
     PAGINATION
  ======================================================= */

  function getTotalPages() {
    return Math.max(
      1,
      Math.ceil(allOrders.length / PAGE_SIZE)
    );
  }

  function renderPagination() {
    const pagination = getPage()?.querySelector(
      "#U9-history-order-pagination"
    );

    if (!pagination) return;

    const totalPages = getTotalPages();

    let startPage = 1;

    if (totalPages > VISIBLE_PAGE_BUTTONS) {
      startPage = Math.max(
        1,
        Math.min(
          currentPage - Math.floor(VISIBLE_PAGE_BUTTONS / 2),
          totalPages - VISIBLE_PAGE_BUTTONS + 1
        )
      );
    }

    let html = `
      <button
        type="button"
        class="U9-history-order-page-button"
        data-page-action="previous"
        aria-label="Previous page"
        ${currentPage <= 1 ? "disabled" : ""}
      >‹</button>
    `;

    for (
      let slot = 0;
      slot < VISIBLE_PAGE_BUTTONS;
      slot++
    ) {
      const pageNumber = startPage + slot;

      if (pageNumber <= totalPages) {
        const isActive = pageNumber === currentPage;

        html += `
          <button
            type="button"
            class="U9-history-order-page-button ${
              isActive ? "active" : ""
            }"
            data-page-number="${pageNumber}"
            aria-label="Page ${pageNumber}"
            ${isActive ? 'aria-current="page"' : ""}
          >${pageNumber}</button>
        `;
      } else {
        html += `
          <button
            type="button"
            class="U9-history-order-page-button placeholder"
            disabled
            aria-hidden="true"
          >–</button>
        `;
      }
    }

    html += `
      <button
        type="button"
        class="U9-history-order-page-button"
        data-page-action="next"
        aria-label="Next page"
        ${currentPage >= totalPages ? "disabled" : ""}
      >›</button>
    `;

    pagination.innerHTML = html;
  }

  function changePage(nextPage) {
    const totalPages = getTotalPages();

    if (
      !Number.isInteger(nextPage) ||
      nextPage < 1 ||
      nextPage > totalPages ||
      nextPage === currentPage
    ) {
      return;
    }

    currentPage = nextPage;

    renderOrders();
  }

  /* =======================================================
     EMPTY STATE
  ======================================================= */

  function renderEmptyState() {
    const list = getPage()?.querySelector(
      "#U9-history-order-list"
    );

    if (!list) return;

    list.innerHTML = `
      <div class="U9-history-order-empty">
        <div class="U9-history-order-empty-icon">📦</div>

        <h3>No orders yet</h3>

        <p>
          Your completed and pending orders will appear here.
        </p>
      </div>
    `;
  }

  /* =======================================================
     RENDER CURRENT PAGE
  ======================================================= */

  function renderOrders() {
    const page = getPage();

    const list = page?.querySelector(
      "#U9-history-order-list"
    );

    const summary = page?.querySelector(
      "#U9-history-order-summary"
    );

    if (!list || !summary) return;

    const totalOrders = allOrders.length;
    const totalPages = getTotalPages();

    if (currentPage > totalPages) {
      currentPage = totalPages;
    }

    summary.textContent =
      `${totalOrders} ${
        totalOrders === 1 ? "order" : "orders"
      }`;

    renderPagination();

    if (totalOrders === 0) {
      renderEmptyState();
      return;
    }

    const startIndex = (currentPage - 1) * PAGE_SIZE;

    const visibleOrders = allOrders.slice(
      startIndex,
      startIndex + PAGE_SIZE
    );

    list.innerHTML = visibleOrders.map(function (order) {
      const orderId = escapeHTML(order.id || "—");

      const productName = escapeHTML(
        order.product_name || "Product"
      );

      const statusInfo = getStatusInfo(order.status);

      const statusLabel = escapeHTML(statusInfo.label);

      const statusClass = statusInfo.className
        ? ` ${statusInfo.className}`
        : "";

      const quantityNumber = Number(order.quantity);

      const quantity =
        Number.isFinite(quantityNumber) && quantityNumber > 0
          ? quantityNumber
          : 1;

      const imageURL = getSafeImageURL(order.image_url);

      const imageHTML = imageURL
        ? `
          <img
            class="U9-history-order-image"
            src="${escapeHTML(imageURL)}"
            alt="${productName}"
            loading="lazy"
            referrerpolicy="no-referrer"
          >
        `
        : `
          <div class="U9-history-order-image-placeholder">
            No image available
          </div>
        `;

      return `
        <article class="U9-history-order-card">

          <div class="U9-history-order-card-top">

            <div class="U9-history-order-date">
              ${escapeHTML(formatDate(order.created_at))}
            </div>

            <span class="U9-history-order-status${statusClass}">
              ${statusLabel}
            </span>

          </div>

          <div class="U9-history-order-product">

            ${imageHTML}

            <div class="U9-history-order-product-info">

              <h3>${productName}</h3>

              <p>
                Quantity:
                <strong>${quantity}</strong>
              </p>

              <p>
                Total Price:
                <strong>${formatMoney(order.total_price)}</strong>
              </p>

              <p>
                Profit:
                <strong>${formatMoney(order.profit)}</strong>
              </p>

            </div>

          </div>

          <div class="U9-history-order-card-bottom">

            <span>Order ID</span>

            <span class="U9-history-order-id">
              ${orderId}
            </span>

          </div>

        </article>
      `;
    }).join("");

    /* Replace failed images with a placeholder. */

    list.querySelectorAll(
      ".U9-history-order-image"
    ).forEach(function (image) {
      image.addEventListener("error", function () {
        const placeholder = document.createElement("div");

        placeholder.className =
          "U9-history-order-image-placeholder";

        placeholder.textContent = "Image unavailable";

        image.replaceWith(placeholder);
      }, { once: true });
    });
  }

  /* =======================================================
     LOAD ORDER HISTORY
  ======================================================= */

  async function loadOrderHistory(forceRefresh) {
    if (loading) return;

    const page = getPage();

    if (!page || !renderPage()) {
      return;
    }

    const now = Date.now();

    if (
      !forceRefresh &&
      page.dataset.orderHistoryLoaded === "true" &&
      now - lastLoadTime < CACHE_MS
    ) {
      hideOrderHistoryState();
      return;
    }

    const token = getSessionToken();

    if (!token) {
      allOrders = [];
      currentPage = 1;

      showOrderHistoryState(
        "error",
        "Please log in to view your order history."
      );

      return;
    }

    const client = getSupabaseClient();

    if (!client || !client.functions) {
      showOrderHistoryState(
        "error",
        "Supabase client is not initialized. Check supabase-client.js."
      );

      return;
    }

    loading = true;

    setLoading(true);

    showOrderHistoryState(
      "loading",
      "Loading order history..."
    );

    try {
      const { data, error } = await client.functions.invoke(
        FUNCTION_NAME,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (error) {
        let details =
          error.message || "Unknown function error";

        if (
          error.context &&
          typeof error.context.json === "function"
        ) {
          try {
            const body = await error.context.json();

            if (body?.error) {
              details = body.error;
            } else if (body?.message) {
              details = body.message;
            }
          } catch (_) {
            // Keep the original error message.
          }
        }

        throw new Error(details);
      }

      if (
        !data ||
        data.success !== true ||
        !Array.isArray(data.orders)
      ) {
        throw new Error(
          data?.error || "Invalid order history response."
        );
      }

      allOrders = data.orders;
      currentPage = 1;

      renderOrders();

      hideOrderHistoryState();

      page.dataset.orderHistoryLoaded = "true";
      lastLoadTime = Date.now();

      console.log(
        "[U9 Order History] Loaded",
        allOrders.length,
        "orders."
      );

    } catch (error) {
      console.error(
        "[U9 Order History] Load failed:",
        error
      );

      showOrderHistoryState(
        "error",
        error?.message ||
          "Unable to load order history. Please try again."
      );

    } finally {
      loading = false;
      setLoading(false);
    }
  }

  /* =======================================================
     INITIALIZE
  ======================================================= */

  function initialize() {
    if (initialized) return;

    const page = getPage();

    if (!page) {
      console.warn(
        "[U9 Order History] Page element not found yet:",
        PAGE_ID
      );

      return;
    }

    initialized = true;

    renderPage();

    const navButton = document.getElementById(BUTTON_ID);

    if (navButton) {
      navButton.addEventListener("click", function () {
        loadOrderHistory(false);
      });
    } else {
      console.warn(
        "[U9 Order History] Navigation button not found:",
        BUTTON_ID
      );
    }

    console.log("[U9 Order History] Page initialized.");
  }

  /* =======================================================
     PUBLIC METHODS
  ======================================================= */

  window.U9OrderHistoryPage = {
    initialize: initialize,

    refresh: function () {
      return loadOrderHistory(true);
    },

    load: function () {
      return loadOrderHistory(false);
    }
  };

  /* =======================================================
     START
  ======================================================= */

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initialize
    );
  } else {
    initialize();
  }

})();
