
/* =========================================================
 * U9 ORDER HISTORY PAGE
 * File: JS/NORMAL/HISTORY/order-page.js
 *
 * Uses:
 *   Page ID:   History-model-Order-Page
 *   Button ID: History-model-Order-button
 *   Token:     localStorage["u9_token"]
 *   Function:  u9-order-history
 *
 * Does NOT modify /me or task/order RPC functions.
 * ========================================================= */

(function () {
  "use strict";

  const PAGE_ID = "History-model-Order-Page";
  const BUTTON_ID = "History-model-Order-button";
  const FUNCTION_NAME = "u9-order-history";

  let initialized = false;
  let loading = false;
  let lastLoadTime = 0;

  const CACHE_MS = 15000;

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
      return escapeHTML(value);
    }

    return date.toLocaleString();
  }

  function normalizeStatus(status) {
    const value = String(status || "unknown").toLowerCase();

    const labels = {
      completed: "Completed",
      complete: "Completed",
      pending: "Pending",
      processing: "Processing",
      cancelled: "Cancelled",
      canceled: "Cancelled",
      failed: "Failed"
    };

    return labels[value] || value.charAt(0).toUpperCase() + value.slice(1);
  }

  function showMessage(type, message) {
    const page = getPage();
    if (!page) return;

    const container = page.querySelector("#U9-order-history-message");
    if (!container) return;

    container.className = "u9-order-history-message " + type;
    container.textContent = message;
    container.hidden = false;
  }

  function hideMessage() {
    const page = getPage();
    const container = page?.querySelector("#U9-order-history-message");

    if (container) {
      container.hidden = true;
      container.textContent = "";
    }
  }

  function setLoading(isLoading) {
    const page = getPage();
    if (!page) return;

    const button = page.querySelector("#U9-order-history-refresh");

    if (button) {
      button.disabled = isLoading;
      button.textContent = isLoading ? "Loading..." : "Refresh";
    }
  }

  function renderPage() {
    const page = getPage();
    if (!page) {
      console.error("[U9 Order History] Page element not found:", PAGE_ID);
      return false;
    }

    // Avoid rebuilding the page every time the navigation button is clicked.
    if (page.dataset.orderHistoryRendered === "true") {
      return true;
    }

    page.innerHTML = `
      <div class="u9-order-history">
        <div class="u9-order-history-header">
          <div>
            <h2 class="u9-order-history-title">Order History</h2>
            <p class="u9-order-history-subtitle">
              View your previous tasks and order details.
            </p>
          </div>

          <button
            type="button"
            id="U9-order-history-refresh"
            class="u9-order-history-refresh"
          >
            Refresh
          </button>
        </div>

        <div
          id="U9-order-history-message"
          class="u9-order-history-message"
          role="status"
          aria-live="polite"
          hidden
        ></div>

        <div
          id="U9-order-history-summary"
          class="u9-order-history-summary"
        >
          Your orders will appear here.
        </div>

        <div
          id="U9-order-history-list"
          class="u9-order-history-list"
        ></div>
      </div>

      <style>
        #${PAGE_ID} .u9-order-history {
          width: 100%;
          box-sizing: border-box;
          padding: 20px;
          color: #222;
        }

        #${PAGE_ID} .u9-order-history-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 20px;
        }

        #${PAGE_ID} .u9-order-history-title {
          margin: 0;
          font-size: 24px;
          font-weight: 700;
        }

        #${PAGE_ID} .u9-order-history-subtitle {
          margin: 6px 0 0;
          color: #777;
          font-size: 14px;
        }

        #${PAGE_ID} .u9-order-history-refresh {
          padding: 10px 16px;
          border: 0;
          border-radius: 8px;
          background: #222;
          color: #fff;
          cursor: pointer;
          font-size: 14px;
        }

        #${PAGE_ID} .u9-order-history-refresh:disabled {
          opacity: .6;
          cursor: not-allowed;
        }

        #${PAGE_ID} .u9-order-history-message {
          margin: 12px 0;
          padding: 12px 14px;
          border-radius: 8px;
          background: #f3f3f3;
          color: #333;
          overflow-wrap: anywhere;
        }

        #${PAGE_ID} .u9-order-history-message.error {
          background: #fff0f0;
          color: #a40000;
        }

        #${PAGE_ID} .u9-order-history-message.success {
          background: #effaf0;
          color: #176b2c;
        }

        #${PAGE_ID} .u9-order-history-summary {
          margin-bottom: 14px;
          color: #666;
          font-size: 14px;
        }

        #${PAGE_ID} .u9-order-history-list {
          display: grid;
          grid-template-columns: 1fr;
          gap: 14px;
        }

        #${PAGE_ID} .u9-order-card {
          box-sizing: border-box;
          padding: 16px;
          border: 1px solid #e7e7e7;
          border-radius: 12px;
          background: #fff;
          box-shadow: 0 2px 8px rgba(0, 0, 0, .035);
        }

        #${PAGE_ID} .u9-order-card-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 14px;
        }

        #${PAGE_ID} .u9-order-name {
          margin: 0;
          font-size: 17px;
          font-weight: 700;
          overflow-wrap: anywhere;
        }

        #${PAGE_ID} .u9-order-id {
          margin-top: 5px;
          color: #888;
          font-size: 12px;
          overflow-wrap: anywhere;
        }

        #${PAGE_ID} .u9-order-status {
          flex-shrink: 0;
          padding: 5px 9px;
          border-radius: 20px;
          background: #eee;
          color: #444;
          font-size: 12px;
        }

        #${PAGE_ID} .u9-order-status.completed {
          background: #e8f7eb;
          color: #176b2c;
        }

        #${PAGE_ID} .u9-order-details {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
        }

        #${PAGE_ID} .u9-order-detail-label {
          margin-bottom: 4px;
          color: #888;
          font-size: 12px;
        }

        #${PAGE_ID} .u9-order-detail-value {
          font-size: 14px;
          font-weight: 600;
          overflow-wrap: anywhere;
        }

        #${PAGE_ID} .u9-order-empty {
          padding: 32px 16px;
          border: 1px dashed #ddd;
          border-radius: 12px;
          color: #777;
          text-align: center;
        }

        @media (max-width: 480px) {
          #${PAGE_ID} .u9-order-history {
            padding: 14px;
          }

          #${PAGE_ID} .u9-order-history-title {
            font-size: 21px;
          }

          #${PAGE_ID} .u9-order-details {
            gap: 14px 10px;
          }
        }
      </style>
    `;

    page.dataset.orderHistoryRendered = "true";

    page.querySelector("#U9-order-history-refresh")
      ?.addEventListener("click", function () {
        loadOrderHistory(true);
      });

    return true;
  }

  function renderOrders(orders) {
    const page = getPage();
    if (!page) return;

    const list = page.querySelector("#U9-order-history-list");
    const summary = page.querySelector("#U9-order-history-summary");

    if (!list || !summary) return;

    const safeOrders = Array.isArray(orders) ? orders : [];

    summary.textContent =
      safeOrders.length === 1
        ? "1 order found."
        : `${safeOrders.length} orders found.`;

    if (safeOrders.length === 0) {
      list.innerHTML = `
        <div class="u9-order-empty">
          <div style="font-size: 18px; margin-bottom: 8px;">
            No orders yet
          </div>
          <div>Your completed and pending orders will appear here.</div>
        </div>
      `;
      return;
    }

    list.innerHTML = safeOrders.map(function (order) {
      const orderId = escapeHTML(order.id || "—");
      const productName = escapeHTML(
        order.product_name || order.product?.name || "Product"
      );
      const status = normalizeStatus(order.status);
      const statusClass =
        String(order.status || "").toLowerCase() === "completed"
          ? "completed"
          : "";

      const quantity = Number(order.quantity);
      const quantityText = Number.isFinite(quantity) ? quantity : 1;

      return `
        <article class="u9-order-card">
          <div class="u9-order-card-top">
            <div>
              <h3 class="u9-order-name">${productName}</h3>
              <div class="u9-order-id">Order ID: ${orderId}</div>
            </div>

            <span class="u9-order-status ${statusClass}">
              ${escapeHTML(status)}
            </span>
          </div>

          <div class="u9-order-details">
            <div>
              <div class="u9-order-detail-label">Quantity</div>
              <div class="u9-order-detail-value">${quantityText}</div>
            </div>

            <div>
              <div class="u9-order-detail-label">Total Price</div>
              <div class="u9-order-detail-value">
                ${formatMoney(order.total_price)}
              </div>
            </div>

            <div>
              <div class="u9-order-detail-label">Profit</div>
              <div class="u9-order-detail-value">
                ${formatMoney(order.profit)}
              </div>
            </div>

            <div>
              <div class="u9-order-detail-label">Created At</div>
              <div class="u9-order-detail-value">
                ${formatDate(order.created_at)}
              </div>
            </div>
          </div>
        </article>
      `;
    }).join("");
  }

  async function loadOrderHistory(forceRefresh) {
    if (loading) return;

    const page = getPage();
    if (!page) {
      console.error("[U9 Order History] Page element not found:", PAGE_ID);
      return;
    }

    if (!renderPage()) return;

    const now = Date.now();

    if (
      !forceRefresh &&
      page.dataset.orderHistoryLoaded === "true" &&
      now - lastLoadTime < CACHE_MS
    ) {
      return;
    }

    const token = getSessionToken();

    if (!token) {
      showMessage("error", "Please log in to view your order history.");
      renderOrders([]);
      return;
    }

    const client = getSupabaseClient();

    if (!client || !client.functions) {
      showMessage(
        "error",
        "Supabase client is not initialized. Please check supabase-client.js."
      );
      return;
    }

    loading = true;
    setLoading(true);
    hideMessage();

    try {
      /*
       * The Supabase client automatically supplies the public apikey.
       * Explicitly override Authorization with the U9 session token.
       * The Edge Function must have verify_jwt=false and validate this
       * custom token against the U9 session table itself.
       */
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
        let details = error.message || "Unknown function error";

        if (error.context && typeof error.context.json === "function") {
          try {
            const body = await error.context.json();
            if (body?.error) details = body.error;
            else if (body?.message) details = body.message;
          } catch (_) {
            // Keep the original error message.
          }
        }

        throw new Error(details);
      }

      if (!data || data.success !== true || !Array.isArray(data.orders)) {
        throw new Error(data?.error || "The server returned an invalid response.");
      }

      renderOrders(data.orders);
      page.dataset.orderHistoryLoaded = "true";
      lastLoadTime = Date.now();

      console.log(
        "[U9 Order History] Loaded",
        data.orders.length,
        "orders."
      );
    } catch (error) {
      console.error("[U9 Order History] Load failed:", error);

      showMessage(
        "error",
        error?.message || "Unable to load order history. Please try again."
      );
    } finally {
      loading = false;
      setLoading(false);
    }
  }

  function initialize() {
    if (initialized) return;

    const page = getPage();

    if (!page) {
      console.warn(
        "[U9 Order History] Waiting for page element:",
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

  // Optional public methods for debugging or manual refresh.
  window.U9OrderHistoryPage = {
    initialize: initialize,
    refresh: function () {
      return loadOrderHistory(true);
    },
    load: function () {
      return loadOrderHistory(false);
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize);
  } else {
    initialize();
  }
})();
