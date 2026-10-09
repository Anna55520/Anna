
/* =========================================================
   U9 ORDER HISTORY PAGE
   File: JS/NORMAL/HISTORY/order-page.js

   Uses:
   - Existing U9 Supabase client
   - Edge Function: u9-order-history

   Does NOT modify:
   - /me
   - u9_auto_order
   - u9_round_status
   - u9_order_matching
   - u9_complete_order
========================================================= */

(function () {
  "use strict";

  const FUNCTION_URL =
    "https://tvtakmswbzawaweytimx.supabase.co/functions/v1/u9-order-history";

  const PAGE_ID = "U9-page-order";
  const NAV_BUTTON_ID = "History-model-Order-button";

  let loading = false;
  let initialized = false;

  let pageElements = {
    root: null,
    message: null,
    list: null,
    refreshButton: null
  };

  /* =========================================================
     SUPABASE CLIENT
  ========================================================= */

  function getSupabase() {
    return (
      window.supabaseClient ||
      window.supabase ||
      null
    );
  }

  /* =========================================================
     CURRENT USER
     User ID is not sent to the Edge Function.
     The server must identify the user from the U9 session.
  ========================================================= */

  function getCurrentUser() {
    try {
      if (
        window.U9User &&
        typeof window.U9User.get === "function"
      ) {
        return window.U9User.get();
      }
    } catch (error) {
      console.warn(
        "[U9 Order History] U9User.get failed:",
        error
      );
    }

    return (
      window.currentUser ||
      window.currentUserData ||
      null
    );
  }

  /* =========================================================
     PAGE ELEMENTS
  ========================================================= */

  function getPageRoot() {
    return document.getElementById(PAGE_ID);
  }

  function getOrCreateElement(tag, id, parent) {
    let element = document.getElementById(id);

    if (!element) {
      element = document.createElement(tag);
      element.id = id;
      parent.appendChild(element);
    }

    return element;
  }

  function setupPageElements() {
    const root = getPageRoot();

    if (!root) {
      console.warn(
        "[U9 Order History] Page element not found:",
        PAGE_ID
      );
      return false;
    }

    pageElements.root = root;

    root.style.boxSizing = "border-box";

    const styleId = "U9-order-history-style";

    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;

      style.textContent = `
        #U9-order-history-container {
          width: 100%;
          max-width: 1000px;
          margin: 0 auto;
          padding: 16px;
          box-sizing: border-box;
        }

        #U9-order-history-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 16px;
          flex-wrap: wrap;
        }

        #U9-order-history-heading {
          margin: 0;
          font-size: 22px;
          font-weight: 700;
        }

        #U9-order-history-refresh {
          border: none;
          border-radius: 8px;
          padding: 10px 16px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
        }

        #U9-order-history-refresh:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        #U9-order-history-message {
          padding: 18px 12px;
          text-align: center;
          overflow-wrap: anywhere;
        }

        #U9-order-history-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .U9-order-history-card {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          padding: 14px;
          border: 1px solid rgba(128,128,128,0.28);
          border-radius: 12px;
          box-sizing: border-box;
          overflow-wrap: anywhere;
        }

        .U9-order-history-image {
          width: 92px;
          height: 92px;
          flex: 0 0 92px;
          object-fit: cover;
          border-radius: 8px;
          background: rgba(128,128,128,0.12);
        }

        .U9-order-history-details {
          min-width: 0;
          flex: 1;
        }

        .U9-order-history-product-name {
          margin: 0 0 8px;
          font-size: 16px;
          font-weight: 700;
          overflow-wrap: anywhere;
        }

        .U9-order-history-meta {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 6px 12px;
          font-size: 13px;
        }

        .U9-order-history-meta > div {
          min-width: 0;
          overflow-wrap: anywhere;
        }

        .U9-order-history-status {
          display: inline-block;
          margin-top: 10px;
          padding: 4px 9px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 700;
          background: rgba(128,128,128,0.14);
        }

        @media (max-width: 480px) {
          #U9-order-history-container {
            padding: 10px;
          }

          .U9-order-history-card {
            gap: 10px;
            padding: 10px;
          }

          .U9-order-history-image {
            width: 76px;
            height: 76px;
            flex-basis: 76px;
          }

          .U9-order-history-meta {
            grid-template-columns: minmax(0, 1fr);
          }
        }
      `;

      document.head.appendChild(style);
    }

    const container = getOrCreateElement(
      "div",
      "U9-order-history-container",
      root
    );

    const toolbar = getOrCreateElement(
      "div",
      "U9-order-history-toolbar",
      container
    );

    const heading = getOrCreateElement(
      "h2",
      "U9-order-history-heading",
      toolbar
    );

    heading.textContent = "Order History";

    const refreshButton = getOrCreateElement(
      "button",
      "U9-order-history-refresh",
      toolbar
    );

    refreshButton.type = "button";
    refreshButton.textContent = "Refresh";

    const message = getOrCreateElement(
      "div",
      "U9-order-history-message",
      container
    );

    const list = getOrCreateElement(
      "div",
      "U9-order-history-list",
      container
    );

    pageElements.message = message;
    pageElements.list = list;
    pageElements.refreshButton = refreshButton;

    if (!refreshButton.dataset.u9Bound) {
      refreshButton.addEventListener("click", function () {
        loadOrderHistory();
      });

      refreshButton.dataset.u9Bound = "true";
    }

    return true;
  }

  /* =========================================================
     MESSAGE
  ========================================================= */

  function showHistoryMessage(message, show = true) {
    if (!pageElements.message) return;

    pageElements.message.textContent = message;
    pageElements.message.style.display = show
      ? "block"
      : "none";
  }

  function setLoadingState(isLoading) {
    if (pageElements.refreshButton) {
      pageElements.refreshButton.disabled = isLoading;
      pageElements.refreshButton.textContent = isLoading
        ? "Loading..."
        : "Refresh";
    }
  }

  /* =========================================================
     FORMAT HELPERS
  ========================================================= */

  function escapeText(value) {
    return String(value ?? "");
  }

  function formatMoney(value) {
    const number = Number(value);

    if (!Number.isFinite(number)) {
      return value == null ? "—" : String(value);
    }

    return number.toFixed(2);
  }

  function formatDate(value) {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return date.toLocaleString();
  }

  function formatStatus(status) {
    const value = String(status || "unknown")
      .trim()
      .toLowerCase();

    const labels = {
      pending: "Pending",
      completed: "Completed",
      cancelled: "Cancelled",
      canceled: "Cancelled",
      failed: "Failed",
      matching: "Matching"
    };

    return labels[value] || value;
  }

  function getProductImage(product) {
    if (!product) return "";

    return (
      product.image_url ||
      product.product_image_url ||
      product.image ||
      product.thumbnail_url ||
      ""
    );
  }

  function createTextElement(tag, className, text) {
    const element = document.createElement(tag);

    if (className) {
      element.className = className;
    }

    element.textContent = escapeText(text);

    return element;
  }

  /* =========================================================
     RENDER ORDER CARDS
  ========================================================= */

  function renderOrders(orders, productsById) {
    if (!pageElements.list) return;

    pageElements.list.replaceChildren();

    if (!Array.isArray(orders) || orders.length === 0) {
      showHistoryMessage("No order history yet.");
      return;
    }

    showHistoryMessage("", false);

    orders.forEach(function (order) {
      const product = productsById.get(order.product_id) || {};

      const card = document.createElement("article");
      card.className = "U9-order-history-card";

      const imageUrl = getProductImage(product);

      if (imageUrl) {
        const image = document.createElement("img");

        image.className = "U9-order-history-image";
        image.src = imageUrl;
        image.alt = product.name || "Product";
        image.loading = "lazy";

        image.addEventListener("error", function () {
          image.style.display = "none";
        });

        card.appendChild(image);
      }

      const details = document.createElement("div");
      details.className = "U9-order-history-details";

      const productName = product.name ||
        order.product_name ||
        "Product";

      details.appendChild(
        createTextElement(
          "h3",
          "U9-order-history-product-name",
          productName
        )
      );

      const meta = document.createElement("div");
      meta.className = "U9-order-history-meta";

      const fields = [
        ["Order ID", order.id || "—"],
        ["Quantity", order.quantity ?? 1],
        ["Price", formatMoney(order.total_price)],
        ["Profit", formatMoney(order.profit)],
        ["Date", formatDate(order.created_at)]
      ];

      fields.forEach(function (field) {
        const item = document.createElement("div");

        const label = document.createElement("strong");
        label.textContent = field[0] + ": ";

        const value = document.createElement("span");
        value.textContent = escapeText(field[1]);

        item.appendChild(label);
        item.appendChild(value);
        meta.appendChild(item);
      });

      details.appendChild(meta);

      const status = createTextElement(
        "span",
        "U9-order-history-status",
        formatStatus(order.status)
      );

      details.appendChild(status);
      card.appendChild(details);
      pageElements.list.appendChild(card);
    });
  }

  /* =========================================================
     REQUEST EDGE FUNCTION

     Uses the U9 session cookie when it is available.
     If the existing application keeps its session token in
     localStorage, it tries common U9 session keys as well.

     Do not send a user_id parameter. The Edge Function must
     identify the user from the verified session.
  ========================================================= */

  function getSessionToken() {
    const possibleKeys = [
      "u9_session",
      "u9Session",
      "u9_session_token",
      "session_token"
    ];

    for (const key of possibleKeys) {
      try {
        const value = localStorage.getItem(key);

        if (value && value.trim()) {
          return value.trim();
        }
      } catch (error) {
        console.warn(
          "[U9 Order History] Cannot read localStorage:",
          error
        );
      }
    }

    return null;
  }

  async function requestOrderHistory() {
    const supabase = getSupabase();

    if (!supabase) {
      throw new Error(
        "Supabase client is not initialized."
      );
    }

    /*
      Preferred path:
      Use the existing Supabase client to invoke the function.
      This sends the project's API key and the client's configured
      Authorization header.
    */
    const { data, error } = await supabase.functions.invoke(
      "u9-order-history",
      {
        method: "GET"
      }
    );

    if (!error && data) {
      return data;
    }

    console.warn(
      "[U9 Order History] Supabase invoke failed; trying direct request:",
      error
    );

    /*
      Fallback path:
      If U9 stores its custom session token in localStorage,
      send it as a Bearer token to the same Edge Function.
      The function must still validate the token hash server-side.
    */
    const token = getSessionToken();

    if (token) {
      const headers = {
        "Content-Type": "application/json"
      };

      /*
        supabase.functions.invoke normally handles the project's
        API key. A direct fetch also needs the project's public
        anon/publishable key in apikey. We deliberately do not
        guess the key from undocumented globals.
      */
      const publicKey =
        window.SUPABASE_ANON_KEY ||
        window.supabaseAnonKey ||
        window.supabasePublishableKey;

      if (!publicKey) {
        throw new Error(
          "The U9 session was found, but the public Supabase API key is not exposed to this page. Configure the existing public key global or use the existing client request."
        );
      }

      headers.apikey = publicKey;
      headers.Authorization = "Bearer " + token;

      const response = await fetch(FUNCTION_URL, {
        method: "GET",
        headers,
        credentials: "include"
      });

      const result = await response.json().catch(function () {
        return {};
      });

      if (!response.ok) {
        throw new Error(
          result.error ||
          "Order history request failed (" + response.status + ")."
        );
      }

      return result;
    }

    throw error || new Error(
      "Unable to load order history."
    );
  }

  /* =========================================================
     LOAD ORDER HISTORY
  ========================================================= */

  async function loadOrderHistory() {
    if (loading) return;

    if (!setupPageElements()) return;

    loading = true;
    setLoadingState(true);
    showHistoryMessage("Loading order history...");
    pageElements.list.replaceChildren();

    try {
      const currentUser = getCurrentUser();

      if (!currentUser) {
        console.warn(
          "[U9 Order History] No current user found in frontend state."
        );
      }

      const data = await requestOrderHistory();

      if (!data || data.success !== true) {
        throw new Error(
          data?.error || "Unexpected Edge Function response."
        );
      }

      const orders = Array.isArray(data.orders)
        ? data.orders
        : [];

      const products = Array.isArray(data.products)
        ? data.products
        : [];

      const productsById = new Map(
        products
          .filter(function (product) {
            return product && product.id;
          })
          .map(function (product) {
            return [product.id, product];
          })
      );

      console.log(
        "[U9 Order History] Record count:",
        orders.length
      );

      renderOrders(orders, productsById);
    } catch (error) {
      console.error(
        "[U9 Order History] Load failed:",
        error
      );

      showHistoryMessage(
        error?.message ||
        "Unable to load order history. Please try again."
      );
    } finally {
      loading = false;
      setLoadingState(false);
    }
  }

  /* =========================================================
     PAGE INITIALIZATION
  ========================================================= */

  function initializeOrderPage() {
    if (initialized) {
      setupPageElements();
      return;
    }

    initialized = true;

    const navButton = document.getElementById(
      NAV_BUTTON_ID
    );

    if (navButton && !navButton.dataset.u9OrderBound) {
      navButton.addEventListener("click", function () {
        loadOrderHistory();
      });

      navButton.dataset.u9OrderBound = "true";
    }

    if (getPageRoot()) {
      setupPageElements();
    }

    console.log("[U9 Order History] Initialized.");
  }

  /* =========================================================
     PUBLIC API
  ========================================================= */

  window.U9OrderHistory = {
    refresh: loadOrderHistory,
    initialize: initializeOrderPage
  };

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
