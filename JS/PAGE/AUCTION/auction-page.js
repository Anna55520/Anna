
/* =========================================================
   U9 AUCTION PAGE
   Task Matching / Order / Round / Cooldown

   API migration:
   /api/Auction-auto-order
   /api/Auction-round-status
   /api/Auction-order-matching
   /api/Auction-complete-order
   /api/Auction-active-matching

   Business logic and existing UI IDs preserved.
========================================================= */

(function () {
  "use strict";

  /* =========================================================
     CONFIGURATION
  ========================================================= */

  const API = {
    autoOrder: "/api/Auction-auto-order",
    roundStatus: "/api/Auction-round-status",
    orderMatching: "/api/Auction-order-matching",
    completeOrder: "/api/Auction-complete-order",
    activeMatching: "/api/Auction-active-matching"
  };

  const SESSION_STORAGE_KEYS = [
    "u9_session",
    "u9_session_token",
    "sessionToken",
    "session_token",
    "authToken",
    "access_token",
    "token"
  ];

  /* =========================================================
     ELEMENTS
  ========================================================= */

  const homePage =
    document.getElementById("U9-page-home");

  const shopPage =
    document.getElementById("U9-page-shop");

  const auctionPage =
    document.getElementById("U9-page-auction");

  const test1Page =
    document.getElementById("U9-page-test1");

  const test2Page =
    document.getElementById("U9-page-test2");

  /* =========================================================
     STATE
  ========================================================= */

  let ordering = false;
  let completing = false;

  let matchingTimer = null;
  let cooldownTimer = null;
  let balanceTimer = null;

  let currentOrder = null;
  let currentMatching = null;

  let currentCoins = 0;
  let currentRoundStatus = null;

  let refreshSequence = 0;

  /* =========================================================
     USER
  ========================================================= */

  function getUserId() {
    try {
      if (
        window.U9User &&
        typeof window.U9User.get === "function"
      ) {
        const user = window.U9User.get();

        if (user && user.id) {
          return user.id;
        }
      }
    } catch (error) {
      console.error(
        "U9: Failed to read U9User:",
        error
      );
    }

    if (window.currentUserUUID) {
      return window.currentUserUUID;
    }

    if (window.currentUserId) {
      return window.currentUserId;
    }

    try {
      const storedUUID =
        localStorage.getItem("currentUserUUID");

      if (storedUUID) {
        return storedUUID;
      }

      const storedId =
        localStorage.getItem("currentUserId");

      if (storedId) {
        return storedId;
      }
    } catch (error) {
      console.warn(
        "U9: Unable to read stored user ID:",
        error
      );
    }

    console.error("U9: User UUID is missing.");

    return null;
  }

  /* =========================================================
     SESSION TOKEN

     IMPORTANT:
     The token must be the raw U9 session token.
     The Edge Function hashes it and checks session.token_hash.

     If your login code uses a different storage key, add that
     exact key to SESSION_STORAGE_KEYS below.
  ========================================================= */

  function readStoredToken() {
    try {
      for (const key of SESSION_STORAGE_KEYS) {
        const value = localStorage.getItem(key);

        if (
          typeof value === "string" &&
          value.trim()
        ) {
          const token = value.trim();

          // Support JSON-stringified token values.
          if (
            token.startsWith('"') &&
            token.endsWith('"')
          ) {
            try {
              const decoded = JSON.parse(token);

              if (typeof decoded === "string") {
                return decoded;
              }
            } catch (_) {
              // Use the original value below.
            }
          }

          // Support JSON objects used by some auth clients.
          if (
            token.startsWith("{") &&
            token.endsWith("}")
          ) {
            try {
              const parsed = JSON.parse(token);

              const candidate =
                parsed.sessionToken ||
                parsed.session_token ||
                parsed.access_token ||
                parsed.token;

              if (
                typeof candidate === "string" &&
                candidate.trim()
              ) {
                return candidate.trim();
              }
            } catch (_) {
              // Not a JSON object; use the raw value.
            }
          }

          return token;
        }
      }
    } catch (error) {
      console.warn(
        "U9: Could not read session token from localStorage:",
        error
      );
    }

    return null;
  }

  function readCookieToken() {
    try {
      const cookie = document.cookie || "";

      const match = cookie.match(
        /(?:^|;\s*)u9_session=([^;]*)/
      );

      if (match && match[1]) {
        return decodeURIComponent(match[1]);
      }
    } catch (error) {
      console.warn(
        "U9: Could not read U9 session cookie:",
        error
      );
    }

    return null;
  }

  function getSessionToken() {
    // Prefer an explicit token supplied by the existing auth module.
    try {
      if (
        window.U9Auth &&
        typeof window.U9Auth.getSessionToken === "function"
      ) {
        const token = window.U9Auth.getSessionToken();

        if (
          typeof token === "string" &&
          token.trim()
        ) {
          return token.trim();
        }
      }
    } catch (error) {
      console.warn(
        "U9: U9Auth token lookup failed:",
        error
      );
    }

    try {
      if (
        window.U9Session &&
        typeof window.U9Session.getToken === "function"
      ) {
        const token = window.U9Session.getToken();

        if (
          typeof token === "string" &&
          token.trim()
        ) {
          return token.trim();
        }
      }
    } catch (error) {
      console.warn(
        "U9: U9Session token lookup failed:",
        error
      );
    }

    return readStoredToken() || readCookieToken();
  }

  /* =========================================================
     SAME-ORIGIN API

     Do not call Supabase RPC/table APIs from this page.
     All auction requests go through Vercel rewrites.
  ========================================================= */

  async function apiPost(path, body = {}) {
    const token = getSessionToken();

    if (!token) {
      throw new Error(
        "Your session could not be found. Please log in again."
      );
    }

    const response = await fetch(path, {
      method: "POST",
      credentials: "same-origin",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });

    let payload;

    try {
      payload = await response.json();
    } catch (_) {
      throw new Error(
        `The server returned an invalid response (HTTP ${response.status}).`
      );
    }

    if (!response.ok || payload?.success === false) {
      const message =
        payload?.message ||
        payload?.error ||
        `Request failed (HTTP ${response.status}).`;

      if (response.status === 401) {
        throw new Error(
          "Your session has expired. Please log in again."
        );
      }

      throw new Error(message);
    }

    return payload;
  }

  function unwrapResult(payload) {
    if (!payload) {
      return null;
    }

    if (
      Object.prototype.hasOwnProperty.call(
        payload,
        "result"
      )
    ) {
      return payload.result;
    }

    return payload;
  }

  function unwrapRow(payload) {
    const result = unwrapResult(payload);

    if (Array.isArray(result)) {
      return result[0] || null;
    }

    return result || null;
  }

  function pickValue(object, keys, fallback = undefined) {
    if (!object) {
      return fallback;
    }

    for (const key of keys) {
      if (
        Object.prototype.hasOwnProperty.call(object, key) &&
        object[key] !== undefined
      ) {
        return object[key];
      }
    }

    return fallback;
  }

  /* =========================================================
     API: ROUND STATUS
  ========================================================= */

  async function requestRoundStatus() {
    const payload = await apiPost(
      API.roundStatus,
      {}
    );

    const row = unwrapRow(payload);

    if (!row) {
      return null;
    }

    // Accept common column names from RETURNS TABLE.
    return {
      ...row,

      current_round_id: pickValue(
        row,
        ["current_round_id", "round_id"]
      ),

      completed_count: pickValue(
        row,
        ["completed_count", "v_completed_count"],
        0
      ),

      orders_per_round: pickValue(
        row,
        ["orders_per_round", "configured_orders_per_round"],
        3
      ),

      cooldown_start_time: pickValue(
        row,
        ["cooldown_start_time", "cooldown_start"]
      ),

      cooldown_end_time: pickValue(
        row,
        ["cooldown_end_time", "cooldown_end"]
      ),

      coins: pickValue(
        row,
        ["coins", "current_coins", "final_coins"],
        0
      ),

      pending_order_id: pickValue(
        row,
        ["pending_order_id", "id"]
      ),

      pending_product_id: pickValue(
        row,
        ["pending_product_id", "product_id"]
      ),

      pending_product_name: pickValue(
        row,
        ["pending_product_name", "product_name"]
      ),

      pending_product_image_url: pickValue(
        row,
        ["pending_product_image_url", "product_image_url"]
      ),

      pending_total_price: pickValue(
        row,
        ["pending_total_price", "total_price"]
      ),

      pending_profit: pickValue(
        row,
        ["pending_profit", "profit"]
      ),

      pending_status: pickValue(
        row,
        ["pending_status", "status"]
      ),

      pending_round_id: pickValue(
        row,
        ["pending_round_id", "round_id"]
      )
    };
  }

  /* =========================================================
     API: AUTO ORDER
  ========================================================= */

  async function requestAutoOrder() {
    const payload = await apiPost(
      API.autoOrder,
      {}
    );

    return unwrapRow(payload);
  }

  /* =========================================================
     API: ORDER MATCHING
  ========================================================= */

  async function requestOrderMatching(matchingId) {
    const payload = await apiPost(
      API.orderMatching,
      {
        matching_id: matchingId
      }
    );

    return unwrapRow(payload);
  }

  /* =========================================================
     API: COMPLETE ORDER
  ========================================================= */

  async function requestCompleteOrder(orderId) {
    const payload = await apiPost(
      API.completeOrder,
      {
        order_id: orderId
      }
    );

    return unwrapRow(payload);
  }

  /* =========================================================
     API: ACTIVE MATCHING

     The Edge Function should return the user's active matching
     row, or null when there is no active matching.
  ========================================================= */

  async function requestActiveMatching() {
    const payload = await apiPost(
      API.activeMatching,
      {}
    );

    const result = unwrapResult(payload);

    if (!result) {
      return null;
    }

    if (Array.isArray(result)) {
      return result[0] || null;
    }

    if (result.matching) {
      return result.matching;
    }

    if (result.data) {
      if (Array.isArray(result.data)) {
        return result.data[0] || null;
      }

      return result.data;
    }

    // A single row may be returned directly.
    if (result.id || result.matching_id) {
      return result;
    }

    return null;
  }

  /* =========================================================
     FORMAT
  ========================================================= */

  function formatCoins(value) {
    const number = Number(value);

    if (!Number.isFinite(number)) {
      return "0.00";
    }

    return number.toFixed(2);
  }

  function formatSeconds(seconds) {
    seconds = Math.max(
      0,
      Math.ceil(Number(seconds) || 0)
    );

    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return (
      String(minutes).padStart(2, "0") +
      ":" +
      String(secs).padStart(2, "0")
    );
  }

  /* =========================================================
     MESSAGE
  ========================================================= */

  function showMessage(message) {
    const el = document.getElementById(
      "U9-auction-message"
    );

    if (el) {
      el.textContent = message || "";
    }
  }

  /* =========================================================
     UI - BUTTONS
  ========================================================= */

  function setStartButton(disabled, text) {
    const button = document.getElementById(
      "U9-auction-start"
    );

    if (!button) {
      return;
    }

    button.disabled = !!disabled;
    button.textContent = text || "Start Task";
  }

  function setCompleteButton(disabled, text) {
    const button = document.getElementById(
      "U9-auction-complete"
    );

    if (!button) {
      return;
    }

    button.disabled = !!disabled;
    button.textContent = text || "Complete Task";
  }

  function updateCompleteButtonByBalance() {
    if (
      !currentOrder ||
      currentOrder.status !== "pending"
    ) {
      return;
    }

    if (currentCoins < 0) {
      setCompleteButton(true, "Recharge to Complete");
    } else {
      setCompleteButton(false, "Complete Task");
    }
  }

  /* =========================================================
     UI - COINS
  ========================================================= */

  function updateCoins(coins) {
    currentCoins = Number(coins) || 0;

    const el = document.getElementById(
      "U9-auction-coins"
    );

    if (el) {
      el.textContent = formatCoins(currentCoins);
    }

    updateCompleteButtonByBalance();
  }

  /* =========================================================
     BALANCE AUTO REFRESH
  ========================================================= */

  function stopBalanceRefresh() {
    if (balanceTimer) {
      clearInterval(balanceTimer);
      balanceTimer = null;
    }
  }

  function startBalanceRefresh() {
    stopBalanceRefresh();

    if (
      !currentOrder ||
      currentOrder.status !== "pending"
    ) {
      return;
    }

    async function refreshBalance() {
      if (
        !currentOrder ||
        currentOrder.status !== "pending"
      ) {
        stopBalanceRefresh();
        return;
      }

      try {
        const status = await requestRoundStatus();

        if (!status) {
          return;
        }

        currentRoundStatus = status;
        updateCoins(status.coins);
      } catch (error) {
        console.error(
          "U9 balance refresh error:",
          error
        );
      }
    }

    refreshBalance();

    balanceTimer = setInterval(
      refreshBalance,
      2000
    );
  }

  /* =========================================================
     UI - ROUND
  ========================================================= */

  function updateRound(completed, total) {
    const el = document.getElementById(
      "U9-auction-round"
    );

    if (!el) {
      console.warn(
        "U9: #U9-auction-round not found."
      );
      return;
    }

    const completedNumber = Number(completed) || 0;
    const totalNumber = Number(total) || 0;

    el.textContent =
      `${completedNumber} / ${totalNumber}`;
  }

  /* =========================================================
     MATCHING UI
  ========================================================= */

  function showMatching(message) {
    const el = document.getElementById(
      "U9-auction-matching"
    );

    const text = document.getElementById(
      "U9-auction-matching-text"
    );

    if (el) {
      el.style.display = "block";
    }

    if (text) {
      text.textContent = message || "Matching...";
    }
  }

  function hideMatching() {
    const el = document.getElementById(
      "U9-auction-matching"
    );

    if (el) {
      el.style.display = "none";
    }
  }

  /* =========================================================
     ORDER UI
  ========================================================= */

  function showOrder() {
    const el = document.getElementById(
      "U9-auction-order"
    );

    if (el) {
      el.style.display = "block";
    }
  }

  function hideOrder() {
    const el = document.getElementById(
      "U9-auction-order"
    );

    if (el) {
      el.style.display = "none";
    }
  }

  /* =========================================================
     RENDER ORDER
  ========================================================= */

  function renderOrder(order) {
    if (!order) {
      return;
    }

    currentOrder = order;

    const name = document.getElementById(
      "U9-auction-product-name"
    );

    const image = document.getElementById(
      "U9-auction-product-image"
    );

    const description = document.getElementById(
      "U9-auction-product-description"
    );

    const price = document.getElementById(
      "U9-auction-product-price"
    );

    const profit = document.getElementById(
      "U9-auction-product-profit"
    );

    const url = document.getElementById(
      "U9-auction-product-url"
    );

    const status = document.getElementById(
      "U9-auction-order-status"
    );

    if (name) {
      name.textContent = order.product_name || "Task";
    }

    if (image) {
      if (order.product_image_url) {
        image.src = order.product_image_url;
        image.alt = order.product_name || "Product";
        image.style.display = "block";
      } else {
        image.removeAttribute("src");
        image.alt = "";
        image.style.display = "none";
      }
    }

    if (description) {
      description.textContent =
        order.product_description ||
        "Complete this task to receive your Coins and profit.";
    }

    if (price) {
      price.textContent = formatCoins(order.total_price);
    }

    if (profit) {
      profit.textContent =
        "+" + formatCoins(order.profit);
    }

    if (status) {
      status.textContent =
        order.status === "completed"
          ? "Completed"
          : "Pending";
    }

    if (url && order.product_url) {
      url.href = order.product_url;
      url.style.display = "block";
    } else if (url) {
      url.removeAttribute("href");
      url.style.display = "none";
    }

    showOrder();
    updateCompleteButtonByBalance();
  }

  /* =========================================================
     BUILD PENDING ORDER FROM ROUND STATUS
  ========================================================= */

  function buildPendingOrderFromStatus(status) {
    if (!status) {
      return null;
    }

    if (
      !status.pending_order_id ||
      status.pending_status !== "pending"
    ) {
      return null;
    }

    return {
      order_id: status.pending_order_id,
      user_id: getUserId(),
      product_id: status.pending_product_id,
      product_name: status.pending_product_name || "Task",
      product_description: "",
      product_url: "",
      product_image_url:
        status.pending_product_image_url || "",
      total_price: status.pending_total_price,
      profit: status.pending_profit,
      status: status.pending_status,
      round_id: status.pending_round_id
    };
  }

  /* =========================================================
     ROUND STATUS
  ========================================================= */

  async function loadRoundStatus() {
    console.log("U9: Loading round status...");

    const status = await requestRoundStatus();

    if (!status) {
      console.warn(
        "U9: Auction round status returned no data."
      );
      return null;
    }

    currentRoundStatus = status;

    updateCoins(status.coins);

    updateRound(
      status.completed_count,
      status.orders_per_round
    );

    handleCooldown(status.cooldown_end_time);

    console.log("U9 round status:", status);

    return status;
  }

  /* =========================================================
     COOLDOWN
  ========================================================= */

  function handleCooldown(cooldownEnd) {
    if (cooldownTimer) {
      clearInterval(cooldownTimer);
      cooldownTimer = null;
    }

    const cooldownEl = document.getElementById(
      "U9-auction-cooldown"
    );

    if (!cooldownEnd) {
      if (cooldownEl) {
        cooldownEl.textContent = "";
      }

      if (currentMatching) {
        setStartButton(true, "Matching...");
        return;
      }

      if (
        currentOrder &&
        currentOrder.status === "pending"
      ) {
        setStartButton(
          true,
          "Complete current task first"
        );
      } else {
        setStartButton(false, "Start Task");
      }

      return;
    }

    function tick() {
      const remaining = Math.ceil(
        (
          new Date(cooldownEnd).getTime() -
          Date.now()
        ) / 1000
      );

      if (remaining <= 0) {
        if (cooldownTimer) {
          clearInterval(cooldownTimer);
          cooldownTimer = null;
        }

        if (cooldownEl) {
          cooldownEl.textContent = "";
        }

        if (currentRoundStatus) {
          updateRound(
            0,
            currentRoundStatus.orders_per_round
          );

          currentRoundStatus = {
            ...currentRoundStatus,
            completed_count: 0,
            cooldown_start_time: null,
            cooldown_end_time: null
          };
        }

        if (!currentMatching && !currentOrder) {
          setStartButton(false, "Start Task");
        }

        return;
      }

      if (cooldownEl) {
        cooldownEl.textContent =
          "Cooldown " + formatSeconds(remaining);
      }

      setStartButton(true, "Cooldown");
    }

    tick();

    cooldownTimer = setInterval(tick, 1000);
  }

  /* =========================================================
     MATCHING COUNTDOWN
  ========================================================= */

  function startMatchingCountdown(matchEndTime) {
    if (matchingTimer) {
      clearInterval(matchingTimer);
      matchingTimer = null;
    }

    function tick() {
      const remaining = Math.ceil(
        (
          new Date(matchEndTime).getTime() -
          Date.now()
        ) / 1000
      );

      if (remaining <= 0) {
        if (matchingTimer) {
          clearInterval(matchingTimer);
          matchingTimer = null;
        }

        finishMatching();
        return;
      }

      showMatching(
        "Matching... " + remaining + "s"
      );
    }

    tick();

    matchingTimer = setInterval(tick, 500);
  }

  /* =========================================================
     FINISH MATCHING
  ========================================================= */

  async function finishMatching() {
    if (!currentMatching) {
      console.warn("U9: No active matching found.");
      hideMatching();
      return;
    }

    const matchingId = currentMatching.matching_id;

    if (!matchingId) {
      showMessage("Matching ID is missing.");
      return;
    }

    setStartButton(true, "Creating order...");

    showMatching(
      "Matching completed. Creating order..."
    );

    try {
      console.log(
        "U9: Calling Auction-order-matching...",
        { matchingId }
      );

      const result =
        await requestOrderMatching(matchingId);

      console.log(
        "U9 order matching result:",
        result
      );

      if (!result) {
        throw new Error(
          "Order matching result is empty."
        );
      }

      const orderId = pickValue(
        result,
        ["order_id", "id"]
      );

      if (!orderId) {
        throw new Error(
          "Order ID was not returned by the API."
        );
      }

      currentOrder = {
        order_id: orderId,
        user_id: result.user_id || getUserId(),
        product_id: result.product_id,
        product_name:
          result.product_name ||
          result.name ||
          "Task",
        product_image_url:
          result.product_image_url ||
          result.image_url ||
          "",
        product_description: "",
        product_url: "",
        total_price: pickValue(
          result,
          ["total_price", "price"],
          0
        ),
        profit: result.profit ?? 0,
        coins_after: pickValue(
          result,
          ["coins_after", "final_coins"],
          currentCoins
        ),
        status: result.status || "pending",
        round_id: result.round_id,
        order_number: result.order_number
      };

      currentMatching = null;

      hideMatching();

      updateCoins(currentOrder.coins_after);

      renderOrder(currentOrder);

      updateCompleteButtonByBalance();

      setStartButton(
        true,
        "Complete current task first"
      );

      startBalanceRefresh();

      showMessage("Task matched successfully.");
    } catch (error) {
      console.error(
        "U9 ORDER MATCHING ERROR:",
        error
      );

      // Keep the active matching state available for recovery.
      showMessage(
        error?.message ||
        "Failed to create order."
      );

      setStartButton(
        false,
        "Retry Matching"
      );
    }
  }

  /* =========================================================
     START TASK
  ========================================================= */

  async function startTask() {
    if (ordering) {
      return;
    }

    if (currentMatching) {
      console.warn(
        "U9: Matching is already running."
      );
      return;
    }

    if (
      currentOrder &&
      currentOrder.status === "pending"
    ) {
      showMessage(
        "Please complete the current task first."
      );
      return;
    }

    if (currentCoins < 0) {
      showMessage(
        "Please recharge your Coins before starting another task."
      );
      return;
    }

    if (!getUserId()) {
      showMessage("Please log in first.");
      return;
    }

    if (!getSessionToken()) {
      showMessage(
        "Your session could not be found. Please log in again."
      );
      return;
    }

    ordering = true;

    setStartButton(true, "Matching...");

    hideOrder();

    setCompleteButton(true, "Complete Task");

    try {
      showMatching("Starting Matching...");
      showMessage("");

      console.log(
        "U9: Calling Auction-auto-order..."
      );

      const result = await requestAutoOrder();

      console.log(
        "U9 auto order result:",
        result
      );

      if (!result) {
        throw new Error(
          "No matching result was returned."
        );
      }

      if (result.cooldown === true) {
        currentMatching = null;

        hideMatching();

        await loadRoundStatus();

        showMessage(
          "The current round is cooling down."
        );

        return;
      }

      const matchingId = pickValue(
        result,
        ["matching_id", "id"]
      );

      if (!matchingId) {
        throw new Error(
          "Matching ID was not returned."
        );
      }

      currentMatching = {
        matching_id: matchingId,
        user_id: result.user_id || getUserId(),
        product_id: result.product_id,
        product_name: result.product_name,
        total_price: result.total_price,
        profit: result.profit,
        coins_after: result.coins_after,
        match_start_time: result.match_start_time,
        match_end_time: result.match_end_time,
        round_id: result.round_id,
        order_number: result.order_number
      };

      // Coins should not change during matching.
      if (result.coins != null) {
        updateCoins(result.coins);
      } else if (result.coins_after != null) {
        updateCoins(result.coins_after);
      }

      currentOrder = null;

      hideOrder();

      setCompleteButton(true, "Complete Task");

      setStartButton(true, "Matching...");

      if (result.match_end_time) {
        startMatchingCountdown(
          result.match_end_time
        );
      } else {
        await finishMatching();
      }
    } catch (error) {
      console.error(
        "U9 AUTO ORDER ERROR:",
        error
      );

      currentMatching = null;

      hideMatching();

      setCompleteButton(true, "Complete Task");

      setStartButton(false, "Start Task");

      showMessage(
        error?.message ||
        "Failed to start task."
      );
    } finally {
      ordering = false;
    }
  }

  /* =========================================================
     COMPLETE TASK
  ========================================================= */

  async function completeTask() {
    if (completing) {
      return;
    }

    if (
      !currentOrder ||
      currentOrder.status !== "pending"
    ) {
      showMessage(
        "There is no pending task to complete."
      );
      return;
    }

    if (currentCoins < 0) {
      showMessage(
        "Please recharge your Coins before completing this order."
      );

      setCompleteButton(
        true,
        "Recharge to Complete"
      );

      return;
    }

    if (!getSessionToken()) {
      showMessage(
        "Your session could not be found. Please log in again."
      );
      return;
    }

    completing = true;

    setCompleteButton(true, "Completing...");

    try {
      console.log(
        "U9: Calling Auction-complete-order...",
        { orderId: currentOrder.order_id }
      );

      const result = await requestCompleteOrder(
        currentOrder.order_id
      );

      console.log(
        "U9 complete order result:",
        result
      );

      if (!result) {
        throw new Error(
          "Completion result is empty."
        );
      }

      currentOrder.status = "completed";

      updateCoins(
        pickValue(
          result,
          ["coins_after", "final_coins"],
          currentCoins
        )
      );

      const statusEl = document.getElementById(
        "U9-auction-order-status"
      );

      if (statusEl) {
        statusEl.textContent = "Completed";
      }

      updateRound(
        pickValue(
          result,
          ["completed_count"],
          0
        ),
        pickValue(
          result,
          ["orders_per_round"],
          currentRoundStatus?.orders_per_round ?? 0
        )
      );

      stopBalanceRefresh();

      const cooldownEnd = pickValue(
        result,
        ["cooldown_end_time", "cooldown_end"]
      );

      if (cooldownEnd) {
        handleCooldown(cooldownEnd);

        showMessage(
          "Round completed. Cooldown started."
        );
      } else {
        setStartButton(false, "Start Task");

        showMessage(
          "Task completed successfully."
        );
      }

      setCompleteButton(true, "Completed");

      currentOrder = null;

      await loadRoundStatus();
    } catch (error) {
      console.error(
        "U9 COMPLETE ORDER ERROR:",
        error
      );

      if (currentCoins < 0) {
        setCompleteButton(
          true,
          "Recharge to Complete"
        );
      } else {
        setCompleteButton(
          false,
          "Complete Task"
        );
      }

      showMessage(
        error?.message ||
        "Failed to complete task."
      );
    } finally {
      completing = false;
    }
  }

  /* =========================================================
     LOAD PENDING ORDER
  ========================================================= */

  async function loadPendingOrder(status) {
    const pendingOrder =
      buildPendingOrderFromStatus(status);

    if (!pendingOrder) {
      currentOrder = null;

      stopBalanceRefresh();

      hideOrder();

      return null;
    }

    currentOrder = pendingOrder;

    renderOrder(currentOrder);

    updateCompleteButtonByBalance();

    setStartButton(
      true,
      "Complete current task first"
    );

    startBalanceRefresh();

    console.log(
      "U9 pending order restored:",
      currentOrder
    );

    return currentOrder;
  }

  /* =========================================================
     LOAD ACTIVE MATCHING
  ========================================================= */

  async function loadActiveMatching() {
    const data = await requestActiveMatching();

    if (!data) {
      currentMatching = null;
      return null;
    }

    const matchingId = pickValue(
      data,
      ["matching_id", "id"]
    );

    const matchEndTime = data.match_end_time;

    if (!matchingId || !matchEndTime) {
      console.error(
        "U9: Active matching response is missing required fields.",
        data
      );

      return null;
    }

    currentMatching = {
      matching_id: matchingId,
      user_id: data.user_id || getUserId(),
      product_id: data.product_id,
      match_start_time: data.match_start_time,
      match_end_time: matchEndTime,
      round_id: data.round_id,
      order_number: data.order_number
    };

    currentOrder = null;

    stopBalanceRefresh();

    hideOrder();

    setCompleteButton(true, "Complete Task");

    setStartButton(true, "Matching...");

    const remaining = Math.ceil(
      (
        new Date(matchEndTime).getTime() -
        Date.now()
      ) / 1000
    );

    if (remaining <= 0) {
      await finishMatching();
    } else {
      startMatchingCountdown(matchEndTime);
    }

    console.log(
      "U9 active matching restored:",
      currentMatching
    );

    return currentMatching;
  }

  /* =========================================================
     REFRESH AUCTION PAGE
  ========================================================= */

  async function refreshAuctionPage() {
    const sequence = ++refreshSequence;

    console.log(
      "U9: Refreshing auction page..."
    );

    try {
      const status = await loadRoundStatus();

      if (sequence !== refreshSequence || !status) {
        return null;
      }

      const pendingOrder =
        await loadPendingOrder(status);

      if (sequence !== refreshSequence) {
        return null;
      }

      if (pendingOrder) {
        currentMatching = null;

        if (matchingTimer) {
          clearInterval(matchingTimer);
          matchingTimer = null;
        }

        hideMatching();

        console.log(
          "U9: Pending order restored.",
          pendingOrder
        );

        return {
          status,
          pendingOrder,
          activeMatching: null
        };
      }

      stopBalanceRefresh();

      const activeMatching =
        await loadActiveMatching();

      if (sequence !== refreshSequence) {
        return null;
      }

      console.log("U9: Auction status:", status);

      console.log(
        "U9: Pending order:",
        pendingOrder
      );

      console.log(
        "U9: Active matching:",
        activeMatching
      );

      return {
        status,
        pendingOrder: null,
        activeMatching
      };
    } catch (error) {
      console.error(
        "U9 AUCTION REFRESH ERROR:",
        error
      );

      showMessage(
        error?.message ||
        "Failed to load auction status."
      );

      return null;
    }
  }

  /* =========================================================
     OPEN AUCTION PAGE
  ========================================================= */

  function openAuctionPage() {
    if (!auctionPage) {
      console.warn(
        "U9: Auction page element not found."
      );
      return;
    }

    if (homePage) {
      homePage.style.display = "none";
    }

    if (shopPage) {
      shopPage.style.display = "none";
    }

    if (test1Page) {
      test1Page.style.display = "none";
    }

    if (test2Page) {
      test2Page.style.display = "none";
    }

    auctionPage.style.display = "block";

    refreshAuctionPage();
  }

  /* =========================================================
     EVENTS
  ========================================================= */

  function bindAuctionEvents() {
    const startButton = document.getElementById(
      "U9-auction-start"
    );

    const completeButton = document.getElementById(
      "U9-auction-complete"
    );

    if (startButton) {
      startButton.onclick = startTask;
    }

    if (completeButton) {
      completeButton.onclick = completeTask;
    }
  }

  /* =========================================================
     CLEANUP
  ========================================================= */

  function stopAllTimers() {
    if (matchingTimer) {
      clearInterval(matchingTimer);
      matchingTimer = null;
    }

    if (cooldownTimer) {
      clearInterval(cooldownTimer);
      cooldownTimer = null;
    }

    stopBalanceRefresh();
  }

  /* =========================================================
     PUBLIC API
  ========================================================= */

  window.openAuctionPage = openAuctionPage;

  window.U9Auction = {
    refresh: refreshAuctionPage,
    startTask,
    completeTask,
    getUserId,
    getSessionToken,
    updateCoins,
    stopAllTimers
  };

  /* =========================================================
     INITIALIZE
  ========================================================= */

  function initializeAuctionPage() {
    if (!auctionPage) {
      console.warn(
        "U9: Auction page does not exist."
      );
      return;
    }

    auctionPage.style.display = "none";

    bindAuctionEvents();

    console.log(
      "U9 Auction Page initialized."
    );
  }

  initializeAuctionPage();

})();

/* =========================================================
   AUCTION TOOL BUTTONS
========================================================= */

(function () {
  "use strict";

  function initializeAuctionTools() {
    const historyButton = document.getElementById(
      "U9-auction-tool-3"
    );

    if (!historyButton) {
      return;
    }

    if (historyButton.dataset.u9Bound === "true") {
      return;
    }

    historyButton.dataset.u9Bound = "true";

    historyButton.addEventListener(
      "click",
      async function () {
        if (
          !window.U9History ||
          typeof window.U9History.openPage !== "function"
        ) {
          console.error(
            "U9 Auction: U9History is not available."
          );
          return;
        }

        await window.U9History.openPage("order");
      }
    );
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initializeAuctionTools,
      { once: true }
    );
  } else {
    initializeAuctionTools();
  }
})();
