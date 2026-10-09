
/* =========================
   U9 HISTORY ORDER PAGE
========================= */

(function () {
  "use strict";

  const PAGE_ID = "History-model-Order-Page";
  let isLoading = false;
  let loadToken = 0;

  function getSupabase() {
    return window.supabaseClient || window.supabase || null;
  }

  function getUserId() {
    if (
      window.U9User &&
      typeof window.U9User.get === "function"
    ) {
      const user = window.U9User.get();

      if (typeof user === "string") {
        return user;
      }

      if (user && user.id) {
        return user.id;
      }
    }

    if (window.currentUserUUID) {
      return window.currentUserUUID;
    }

    if (window.currentUserId) {
      return window.currentUserId;
    }

    try {
      return (
        localStorage.getItem("currentUserUUID") ||
        localStorage.getItem("currentUserId") ||
        ""
      );
    } catch (error) {
      return "";
    }
  }

  function escapeHTML(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function formatMoney(value) {
    const number = Number(value);

    if (!Number.isFinite(number)) {
      return "0.00";
    }

    return number.toFixed(2);
  }

  function formatDate(value) {
    if (!value) {
      return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return date.toLocaleString();
  }

  function getStatusInfo(status) {
    const value = String(status || "")
      .toLowerCase();

    if (
      value === "completed" ||
      value === "complete" ||
      value === "success"
    ) {
      return {
        label: "Completed",
        className: "completed"
      };
    }

    if (
      value === "pending" ||
      value === "matching"
    ) {
      return {
        label: value === "matching"
          ? "Matching"
          : "Pending",
        className: value
      };
    }

    if (
      value === "cancelled" ||
      value === "canceled" ||
      value === "failed"
    ) {
      return {
        label: value.charAt(0).toUpperCase() +
          value.slice(1),
        className: "cancelled"
      };
    }

    return {
      label: status || "Unknown",
      className: "unknown"
    };
  }

  function getImageURL(product) {
    if (!product) {
      return "";
    }

    return (
      product.product_image_url ||
      product.image_url ||
      product.image ||
      ""
    );
  }

  function getPage() {
    return document.getElementById(PAGE_ID);
  }

  function getOrCreateList(page) {
    let list = page.querySelector(
      "#U9-history-order-list"
    );

    if (!list) {
      page.innerHTML = `
        <div class="U9-history-order-header">
          <h2>Task History</h2>
          <button
            id="U9-history-order-refresh"
            type="button"
          >Refresh</button>
        </div>
        <div
          id="U9-history-order-message"
          role="status"
        ></div>
        <div id="U9-history-order-list"></div>
      `;

      list = page.querySelector(
        "#U9-history-order-list"
      );

      const refreshButton = page.querySelector(
        "#U9-history-order-refresh"
      );

      if (refreshButton) {
        refreshButton.addEventListener(
          "click",
          loadOrderHistory
        );
      }
    }

    return list;
  }

  function showMessage(message) {
    const page = getPage();

    if (!page) {
      return;
    }

    getOrCreateList(page);

    const messageElement = page.querySelector(
      "#U9-history-order-message"
    );

    if (messageElement) {
      messageElement.textContent = message || "";
    }
  }

  function renderOrders(orders, productsById) {
    const page = getPage();

    if (!page) {
      return;
    }

    const list = getOrCreateList(page);

    if (!orders.length) {
      list.innerHTML = `
        <div class="U9-history-order-empty">
          <div class="U9-history-order-empty-icon">📦</div>
          <h3>No task history yet</h3>
          <p>Your completed and pending tasks will appear here.</p>
        </div>
      `;
      return;
    }

    list.innerHTML = orders.map(function (order) {
      const product = productsById[order.product_id] || {};
      const status = getStatusInfo(order.status);
      const imageURL = getImageURL(product);

      const productName =
        product.name ||
        order.product_name ||
        "Product";

      const quantity = Number(order.quantity || 1);
      const price = order.total_price;
      const profit = order.profit;

      const imageHTML = imageURL
        ? `
          <img
            class="U9-history-order-image"
            src="${escapeHTML(imageURL)}"
            alt="${escapeHTML(productName)}"
            loading="lazy"
            referrerpolicy="no-referrer"
          >
        `
        : `
          <div class="U9-history-order-image-placeholder">
            No Image
          </div>
        `;

      return `
        <article class="U9-history-order-card">
          <div class="U9-history-order-card-top">
            <span class="U9-history-order-date">
              ${escapeHTML(formatDate(order.created_at))}
            </span>
            <span class="U9-history-order-status ${status.className}">
              ${escapeHTML(status.label)}
            </span>
          </div>

          <div class="U9-history-order-product">
            ${imageHTML}

            <div class="U9-history-order-product-info">
              <h3>${escapeHTML(productName)}</h3>
              <p>Quantity: ${escapeHTML(quantity)}</p>
              <p>Price: ${escapeHTML(formatMoney(price))} Coins</p>
              <p>Profit: ${escapeHTML(formatMoney(profit))} Coins</p>
            </div>
          </div>

          <div class="U9-history-order-card-bottom">
            <span>Order ID</span>
            <span class="U9-history-order-id">
              ${escapeHTML(order.id || "—")}
            </span>
          </div>
        </article>
      `;
    }).join("");

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

  async function loadOrderHistory() {
    if (isLoading) {
      return;
    }

    const page = getPage();

    if (!page) {
      console.error(
        "U9 History: Order Page element not found."
      );
      return;
    }

    const supabase = getSupabase();
    const userId = getUserId();
    const token = ++loadToken;

    if (!supabase) {
      showMessage(
        "Unable to load task history: Supabase client is not initialized."
      );
      return;
    }

    if (!userId) {
      showMessage(
        "Please sign in to view your task history."
      );
      return;
    }

    isLoading = true;
    showMessage("Loading task history...");

    try {
      console.log("[U9 Order History] Current user ID:", userId);

      const { data: orders, error: ordersError } =
      await supabase
          .from("u9-orders")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

      console.log("[U9 Order History] Query error:", ordersError);
      console.log("[U9 Order History] Query data:", orders);
      console.log("[U9 Order History] Record count:", orders?.length);

      if (ordersError) {
        throw ordersError;
      }

      if (token !== loadToken) {
        return;
      }

      const orderList = orders || [];
      const productIds = [
        ...new Set(
          orderList
            .map(function (order) {
              return order.product_id;
            })
            .filter(Boolean)
        )
      ];

      let productsById = {};

      if (productIds.length) {
        const { data: products, error: productsError } =
          await supabase
            .from("u9-products")
            .select("*")
            .in("id", productIds);

        if (productsError) {
          throw productsError;
        }

        (products || []).forEach(function (product) {
          productsById[product.id] = product;
        });
      }

      if (token !== loadToken) {
        return;
      }

      const messageElement = page.querySelector(
        "#U9-history-order-message"
      );

      if (messageElement) {
        messageElement.textContent = orderList.length
          ? `${orderList.length} task record(s)`
          : "";
      }

      renderOrders(orderList, productsById);

    } catch (error) {
      console.error(
        "U9 History: Failed to load task history:",
        error
      );

      showMessage(
        "Could not load task history. Please try again."
      );
    } finally {
      isLoading = false;
    }
  }

  function initializeOrderPage() {
    const page = getPage();

    if (!page || page.dataset.orderHistoryInitialized === "true") {
      return;
    }

    page.dataset.orderHistoryInitialized = "true";
    getOrCreateList(page);

    /*
     * Load when the user switches to Order Page.
     * The event bubbles from the existing navigation button.
     */
    const orderButton = document.getElementById(
      "History-model-Order-button"
    );

    if (orderButton) {
      orderButton.addEventListener(
        "click",
        loadOrderHistory
      );
    }

    /*
     * Also expose a manual refresh API.
     */
    window.U9OrderHistory = {
      refresh: loadOrderHistory
    };
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initializeOrderPage,
      { once: true }
    );
  } else {
    initializeOrderPage();
  }
})();
