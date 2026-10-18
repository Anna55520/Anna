
/* =========================================================
   U9 AUCTION PAGE
   Task Matching / Order / Round / Cooldown

   API mode:
   All auction requests go through same-origin Vercel rewrites.
   No direct browser RPC or table queries to Supabase.

   Required API routes:
   /api/Auction-round-status
   /api/Auction-active-matching
   /api/Auction-auto-order
   /api/Auction-order-matching
   /api/Auction-complete-order
========================================================= */

(function () {
  "use strict";

  /* =========================================================
     ELEMENTS
  ========================================================= */

  const homePage = document.getElementById("U9-page-home");
  const shopPage = document.getElementById("U9-page-shop");
  const auctionPage = document.getElementById("U9-page-auction");
  const test1Page = document.getElementById("U9-page-test1");
  const test2Page = document.getElementById("U9-page-test2");

  /* =========================================================
     API ROUTES
  ========================================================= */

  const API = Object.freeze({
    roundStatus: "/api/Auction-round-status",
    activeMatching: "/api/Auction-active-matching",
    autoOrder: "/api/Auction-auto-order",
    orderMatching: "/api/Auction-order-matching",
    completeOrder: "/api/Auction-complete-order"
  });

  /* =========================================================
     STATE
  ========================================================= */

  let ordering = false;
  let completing = false;
  let refreshing = false;

  let matchingTimer = null;
  let cooldownTimer = null;
  let balanceTimer = null;

  let currentOrder = null;
  let currentMatching = null;
  let currentCoins = 0;
  let currentRoundStatus = null;

  /* =========================================================
     USER
     Used for display/compatibility only.
     The server must authenticate the session independently.
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
      console.error("U9: Failed to read U9User:", error);
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
        null
      );
    } catch (error) {
      return null;
    }
  }

  /* =========================================================
     API REQUEST HELPER

     All requests use the site's own origin and session cookies.
     Do not send a user_id to decide whose data may be accessed.
     Edge Functions must derive the user from the authenticated
     U9 session.
  ========================================================= */

  async function requestAuctionApi(path, body) {
    const options = {
      method: "POST",
      credentials: "same-origin",
      cache: "no-store",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body || {})
    };

    let response;

    try {
      response = await fetch(path, options);
    } catch (error) {
      console.error("U9 Auction network error:", path, error);

      throw new Error(
        "Cannot reach the auction API. Please check your connection and try again."
      );
    }

    const rawText = await response.text();
    let payload = null;

    if (rawText) {
      try {
        payload = JSON.parse(rawText);
      } catch (error) {
        console.error(
          "U9 Auction received a non-JSON response:",
          path,
          response.status,
          rawText.slice(0, 500)
        );

        throw new Error(
          response.status === 404
            ? "Auction API route was not found. Please check the Vercel deployment."
            : "The auction API returned an invalid response."
        );
      }
    }

    if (!response.ok) {
      const message =
        payload &&
        (
          payload.error ||
          payload.message ||
          payload.details
        );

      throw new Error(
        message ||
        `Auction API request failed (${response.status}).`
      );
    }

    if (
      !payload ||
      typeof payload !== "object"
    ) {
      throw new Error("The auction API returned an empty response.");
    }

    if (payload.ok === false) {
      throw new Error(
        payload.error ||
        payload.message ||
        "The auction request failed."
      );
    }

    /*
     * Current Edge Functions return { ok: true, data: ... }.
     * Also accept a direct JSON result for compatibility.
     */
    if (
      Object.prototype.hasOwnProperty.call(payload, "data")
    ) {
      return payload.data;
    }

    return payload;
  }

  function unwrapRow(data) {
    if (Array.isArray(data)) {
      return data[0] || null;
    }

    return data || null;
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
    const el = document.getElementById("U9-auction-message");

    if (el) {
      el.textContent = message || "";
    }
  }

  /* =========================================================
     BUTTONS
  ========================================================= */

  function setStartButton(disabled, text) {
    const button = document.getElementById("U9-auction-start");

    if (!button) {
      return;
    }

    button.disabled = !!disabled;
    button.textContent = text || "Start Task";
  }

  function setCompleteButton(disabled, text) {
    const button = document.getElementById("U9-auction-complete");

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
     COINS
  ========================================================= */

  function updateCoins(coins) {
    const parsed = Number(coins);

    if (Number.isFinite(parsed)) {
      currentCoins = parsed;
    }

    const el = document.getElementById("U9-auction-coins");

    if (el) {
      el.textContent = formatCoins(currentCoins);
    }

    updateCompleteButtonByBalance();
  }

  /* =========================================================
     BALANCE AUTO REFRESH
     Uses the round-status Edge Function, not direct Supabase RPC.
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
        const data = await requestAuctionApi(API.roundStatus, {});
        const status = unwrapRow(data);

        if (!status) {
          return;
        }

        currentRoundStatus = status;
        updateCoins(status.coins);
      } catch (error) {
        console.error("U9 balance refresh error:", error);
      }
    }

    refreshBalance();
    balanceTimer = setInterval(refreshBalance, 5000);
  }

  /* =========================================================
     ROUND UI
  ========================================================= */

  function updateRound(completed, total) {
    const el = document.getElementById("U9-auction-round");

    if (!el) {
      return;
    }

    const completedNumber = Number(completed) || 0;
    const totalNumber = Number(total) || 0;

    el.textContent = `${completedNumber} / ${totalNumber}`;
  }

  /* =========================================================
     MATCHING UI
  ========================================================= */

  function showMatching(message) {
    const el = document.getElementById("U9-auction-matching");
    const text = document.getElementById("U9-auction-matching-text");

    if (el) {
      el.style.display = "block";
    }

    if (text) {
      text.textContent = message || "Matching...";
    }
  }

  function hideMatching() {
    const el = document.getElementById("U9-auction-matching");

    if (el) {
      el.style.display = "none";
    }
  }

  /* =========================================================
     ORDER UI
  ========================================================= */

  function showOrder() {
    const el = document.getElementById("U9-auction-order");

    if (el) {
      el.style.display = "block";
    }
  }

  function hideOrder() {
    const el = document.getElementById("U9-auction-order");

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

    const name = document.getElementById("U9-auction-product-name");
    const image = document.getElementById("U9-auction-product-image");
    const description = document.getElementById("U9-auction-product-description");
    const price = document.getElementById("U9-auction-product-price");
    const profit = document.getElementById("U9-auction-product-profit");
    const url = document.getElementById("U9-auction-product-url");
    const status = document.getElementById("U9-auction-order-status");

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
      profit.textContent = "+" + formatCoins(order.profit);
    }

    if (status) {
      status.textContent =
        order.status === "completed" ? "Completed" : "Pending";
    }

    if (url) {
      if (order.product_url) {
        url.href = order.product_url;
        url.style.display = "block";
      } else {
        url.removeAttribute("href");
        url.style.display = "none";
      }
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
      product_image_url: status.pending_product_image_url || "",
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
    console.log("U9: Loading round status through Vercel API...");

    const data = await requestAuctionApi(API.roundStatus, {});
    const status = unwrapRow(data);

    if (!status) {
      console.warn("U9: Round status returned no data.");
      return null;
    }

    currentRoundStatus = status;

    updateCoins(status.coins);
    updateRound(status.completed_count, status.orders_per_round);
    handleCooldown(status.cooldown_end_time);

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

    const cooldownEl = document.getElementById("U9-auction-cooldown");

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
        setStartButton(true, "Complete current task first");
      } else {
        setStartButton(false, "Start Task");
      }

      return;
    }

    function tick() {
      const endTime = new Date(cooldownEnd).getTime();

      if (!Number.isFinite(endTime)) {
        if (cooldownEl) {
          cooldownEl.textContent = "";
        }

        setStartButton(false, "Start Task");
        return;
      }

      const remaining = Math.ceil((endTime - Date.now()) / 1000);

      if (remaining <= 0) {
        if (cooldownTimer) {
          clearInterval(cooldownTimer);
          cooldownTimer = null;
        }

        if (cooldownEl) {
          cooldownEl.textContent = "";
        }

        if (currentRoundStatus) {
          updateRound(0, currentRoundStatus.orders_per_round);

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
      const endTime = new Date(matchEndTime).getTime();

      if (!Number.isFinite(endTime)) {
        clearInterval(matchingTimer);
        matchingTimer = null;
        showMessage("The matching end time is invalid.");
        return;
      }

      const remaining = Math.ceil((endTime - Date.now()) / 1000);

      if (remaining <= 0) {
        if (matchingTimer) {
          clearInterval(matchingTimer);
          matchingTimer = null;
        }

        finishMatching();
        return;
      }

      showMatching("Matching... " + remaining + "s");
    }

    tick();
    matchingTimer = setInterval(tick, 500);
  }

  /* =========================================================
     FINISH MATCHING
     Calls Auction-order-matching Edge Function.
  ========================================================= */

  async function finishMatching() {
    if (!currentMatching) {
      hideMatching();
      return;
    }

    const matchingId = currentMatching.matching_id;

    if (!matchingId) {
      console.error("U9: matching_id is missing.");
      showMessage("Matching ID is missing.");
      return;
    }

    setStartButton(true, "Creating order...");
    showMatching("Matching completed. Creating order...");

    try {
      console.log("U9: Calling order-matching API:", matchingId);

      const data = await requestAuctionApi(
        API.orderMatching,
        { p_matching_id: matchingId }
      );

      const result = unwrapRow(data);

      if (!result || !result.order_id) {
        throw new Error("Order was not created.");
      }

      currentOrder = {
        order_id: result.order_id,
        user_id: result.user_id || getUserId(),
        product_id: result.product_id,
        product_name: result.product_name || "Task",
        product_image_url: result.product_image_url || "",
        product_description: result.product_description || "",
        product_url: result.product_url || "",
        total_price: result.total_price,
        profit: result.profit,
        coins_after: result.coins_after,
        status: result.status || "pending",
        round_id: result.round_id,
        order_number: result.order_number
      };

      currentMatching = null;

      hideMatching();

      if (result.coins_after !== undefined && result.coins_after !== null) {
        updateCoins(result.coins_after);
      }

      renderOrder(currentOrder);

      setStartButton(true, "Complete current task first");
      startBalanceRefresh();

      showMessage("Task matched successfully.");
    } catch (error) {
      console.error("U9 ORDER MATCHING ERROR:", error);

      /*
       * Do not assume the server operation failed just because the
       * browser received an error. Refresh the authoritative state.
       */
      hideMatching();
      showMessage(error.message || "Failed to create order.");

      try {
        await refreshAuctionPage();
      } catch (refreshError) {
        console.error("U9 recovery refresh failed:", refreshError);
      }
    }
  }

  /* =========================================================
     START TASK
     Calls Auction-auto-order Edge Function.
  ========================================================= */

  async function startTask() {
    if (ordering || completing) {
      return;
    }

    if (currentMatching) {
      showMessage("Matching is already running.");
      return;
    }

    if (
      currentOrder &&
      currentOrder.status === "pending"
    ) {
      showMessage("Please complete the current task first.");
      return;
    }

    if (currentCoins < 0) {
      showMessage("Please recharge your Coins before starting another task.");
      return;
    }

    ordering = true;

    setStartButton(true, "Matching...");
    hideOrder();
    setCompleteButton(true, "Complete Task");

    try {
      showMatching("Starting Matching...");
      showMessage("");

      console.log("U9: Calling auto-order API...");

      const data = await requestAuctionApi(API.autoOrder, {});
      const result = unwrapRow(data);

      if (!result) {
        throw new Error("No matching result was returned.");
      }

      if (result.cooldown === true) {
        currentMatching = null;
        hideMatching();

        await loadRoundStatus();

        showMessage("The current round is cooling down.");
        return;
      }

      if (!result.matching_id) {
        throw new Error(
          result.error || "Matching ID was not returned."
        );
      }

      currentMatching = {
        matching_id: result.matching_id,
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

      /*
       * Matching alone should not deduct Coins.
       * The server's auto-order result is authoritative.
       */
      if (result.coins_after !== undefined && result.coins_after !== null) {
        updateCoins(result.coins_after);
      }

      currentOrder = null;
      hideOrder();
      setCompleteButton(true, "Complete Task");
      setStartButton(true, "Matching...");

      if (result.match_end_time) {
        startMatchingCountdown(result.match_end_time);
      } else {
        await finishMatching();
      }
    } catch (error) {
      console.error("U9 AUTO ORDER ERROR:", error);

      currentMatching = null;
      hideMatching();

      setCompleteButton(true, "Complete Task");
      setStartButton(false, "Start Task");

      showMessage(error.message || "Failed to start task.");
    } finally {
      ordering = false;
    }
  }

  /* =========================================================
     COMPLETE TASK
     Calls Auction-complete-order Edge Function.
  ========================================================= */

  async function completeTask() {
    if (completing || ordering) {
      return;
    }

    if (
      !currentOrder ||
      currentOrder.status !== "pending"
    ) {
      showMessage("There is no pending task to complete.");
      return;
    }

    if (currentCoins < 0) {
      showMessage("Please recharge your Coins before completing this order.");
      setCompleteButton(true, "Recharge to Complete");
      return;
    }

    const orderId = currentOrder.order_id;

    if (!orderId) {
      showMessage("Order ID is missing. Please refresh the auction page.");
      return;
    }

    completing = true;
    setCompleteButton(true, "Completing...");

    try {
      console.log("U9: Completing order through API:", orderId);

      const data = await requestAuctionApi(
        API.completeOrder,
        { p_order_id: orderId }
      );

      const result = unwrapRow(data);

      if (!result) {
        throw new Error("Completion result is empty.");
      }

      currentOrder.status = "completed";

      if (result.coins_after !== undefined && result.coins_after !== null) {
        updateCoins(result.coins_after);
      }

      const statusEl = document.getElementById("U9-auction-order-status");

      if (statusEl) {
        statusEl.textContent = "Completed";
      }

      if (
        result.completed_count !== undefined &&
        result.orders_per_round !== undefined
      ) {
        updateRound(result.completed_count, result.orders_per_round);
      }

      stopBalanceRefresh();

      /*
       * Clear the pending order before applying cooldown UI.
       */
      currentOrder = null;
      hideOrder();

      if (result.cooldown_end_time) {
        handleCooldown(result.cooldown_end_time);
        showMessage("Round completed. Cooldown started.");
      } else {
        setStartButton(false, "Start Task");
        showMessage("Task completed successfully.");
      }

      setCompleteButton(true, "Completed");

      /*
       * Refresh authoritative balance, round and pending-order state.
       */
      await refreshAuctionPage();
    } catch (error) {
      console.error("U9 COMPLETE ORDER ERROR:", error);

      /*
       * Recover from possible network interruption by checking
       * server state. The operation may have succeeded server-side.
       */
      showMessage(error.message || "Failed to complete task.");

      try {
        await refreshAuctionPage();
      } catch (refreshError) {
        console.error("U9 completion recovery failed:", refreshError);
      }

      if (
        currentOrder &&
        currentOrder.status === "pending"
      ) {
        if (currentCoins < 0) {
          setCompleteButton(true, "Recharge to Complete");
        } else {
          setCompleteButton(false, "Complete Task");
        }
      }
    } finally {
      completing = false;
    }
  }

  /* =========================================================
     LOAD PENDING ORDER
     Pending-order details come from round-status API.
  ========================================================= */

  async function loadPendingOrder(status) {
    const pendingOrder = buildPendingOrderFromStatus(status);

    if (!pendingOrder) {
      currentOrder = null;
      stopBalanceRefresh();
      hideOrder();
      return null;
    }

    currentOrder = pendingOrder;

    renderOrder(currentOrder);
    updateCompleteButtonByBalance();

    setStartButton(true, "Complete current task first");
    startBalanceRefresh();

    console.log("U9 pending order restored:", currentOrder);

    return currentOrder;
  }

  /* =========================================================
     LOAD ACTIVE MATCHING
     Calls Auction-active-matching Edge Function.
  ========================================================= */

  async function loadActiveMatching() {
    const data = await requestAuctionApi(API.activeMatching, {});
    const row = unwrapRow(data);

    if (!row) {
      currentMatching = null;
      return null;
    }

    /*
     * The active-matching function may return a table row with
     * "id", while other functions use "matching_id".
     */
    const matchingId = row.matching_id || row.id;

    if (!matchingId) {
      console.warn("U9 active matching response has no ID:", row);
      currentMatching = null;
      return null;
    }

    currentMatching = {
      matching_id: matchingId,
      user_id: row.user_id || getUserId(),
      product_id: row.product_id,
      product_name: row.product_name,
      total_price: row.total_price,
      profit: row.profit,
      coins_after: row.coins_after,
      match_start_time: row.match_start_time,
      match_end_time: row.match_end_time,
      round_id: row.round_id,
      order_number: row.order_number
    };

    currentOrder = null;
    stopBalanceRefresh();
    hideOrder();
    setCompleteButton(true, "Complete Task");
    setStartButton(true, "Matching...");

    if (!row.match_end_time) {
      await finishMatching();
    } else {
      const remaining = Math.ceil(
        (new Date(row.match_end_time).getTime() - Date.now()) / 1000
      );

      if (remaining <= 0) {
        await finishMatching();
      } else {
        startMatchingCountdown(row.match_end_time);
      }
    }

    console.log("U9 active matching restored:", currentMatching);

    return currentMatching;
  }

  /* =========================================================
     REFRESH AUCTION PAGE
  ========================================================= */

  async function refreshAuctionPage() {
    if (refreshing) {
      return null;
    }

    refreshing = true;

    console.log("U9: Refreshing auction page...");

    try {
      const status = await loadRoundStatus();

      if (!status) {
        showMessage("Unable to load auction status.");
        return null;
      }

      /*
       * Pending orders have priority over active matching.
       */
      const pendingOrder = await loadPendingOrder(status);

      if (pendingOrder) {
        currentMatching = null;
        hideMatching();

        return {
          status,
          pendingOrder,
          activeMatching: null
        };
      }

      stopBalanceRefresh();

      const activeMatching = await loadActiveMatching();

      console.log("U9: Auction status:", status);
      console.log("U9: Active matching:", activeMatching);

      return {
        status,
        pendingOrder: null,
        activeMatching
      };
    } catch (error) {
      console.error("U9 AUCTION REFRESH ERROR:", error);

      showMessage(
        error.message || "Failed to load auction status."
      );

      return null;
    } finally {
      refreshing = false;
    }
  }

  /* =========================================================
     OPEN AUCTION PAGE
  ========================================================= */

  function openAuctionPage() {
    if (!auctionPage) {
      console.warn("U9: Auction page element not found.");
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
    const startButton = document.getElementById("U9-auction-start");
    const completeButton = document.getElementById("U9-auction-complete");

    if (startButton) {
      startButton.onclick = startTask;
    }

    if (completeButton) {
      completeButton.onclick = completeTask;
    }
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

    /*
     * Kept for compatibility with older modules.
     * This page itself does not use the client for auction requests.
     */
    getSupabase: function () {
      try {
        if (
          typeof supabaseClient !== "undefined" &&
          supabaseClient
        ) {
          return supabaseClient;
        }
      } catch (error) {
        // Ignore ReferenceError.
      }

      return (
        window.supabaseClient ||
        window.supabase ||
        window.SupabaseClient ||
        window.U9Supabase ||
        null
      );
    },

    updateCoins
  };

  /* =========================================================
     INITIALIZE
  ========================================================= */

  function initializeAuctionPage() {
    if (!auctionPage) {
      console.warn("U9: Auction page does not exist.");
      return;
    }

    auctionPage.style.display = "none";

    bindAuctionEvents();

    console.log("U9 Auction Page initialized.");
  }

  initializeAuctionPage();

})();


/* =========================================================
   AUCTION TOOL BUTTONS
   Order History
========================================================= */

(function () {
  "use strict";

  function initializeAuctionTools() {
    const historyButton = document.getElementById("U9-auction-tool-3");

    if (!historyButton) {
      return;
    }

    if (historyButton.dataset.u9Bound === "true") {
      return;
    }

    historyButton.dataset.u9Bound = "true";

    historyButton.addEventListener("click", async function () {
      if (
        !window.U9History ||
        typeof window.U9History.openPage !== "function"
      ) {
        console.error("U9 Auction: U9History is not available.");
        return;
      }

      try {
        await window.U9History.openPage("order");
      } catch (error) {
        console.error("U9 Auction: Failed to open order history:", error);
      }
    });
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
