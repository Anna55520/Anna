
/* =========================================================
   U9 AUCTION PAGE
   Edge Functions:
   - /api/Auction-auto-order
   - /api/Auction-round-status
   - /api/Auction-order-matching
   - /api/Auction-complete-order
   - /api/Auction-active-matching
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
      console.error("U9: Failed to read U9User:", error);
    }

    if (window.currentUserUUID) {
      return window.currentUserUUID;
    }

    if (window.currentUserId) {
      return window.currentUserId;
    }

    try {
      const storedUUID = localStorage.getItem("currentUserUUID");
      if (storedUUID) return storedUUID;

      const storedId = localStorage.getItem("currentUserId");
      if (storedId) return storedId;
    } catch (error) {
      console.warn("U9: Unable to read stored user ID.", error);
    }

    console.error("U9: User UUID is missing.");
    return null;
  }

  /* =========================================================
     SESSION TOKEN
  ========================================================= */

  function getSessionToken() {
    try {
      // Existing U9 frontend convention.
      const token = localStorage.getItem("u9_token");

      if (token) {
        return token;
      }
    } catch (error) {
      console.warn("U9: Unable to read session token.", error);
    }

    // Do not use a user ID as an authentication token.
    return null;
  }

  /* =========================================================
     API REQUEST
  ========================================================= */

  async function callAuctionAPI(path, payload = {}) {
    const token = getSessionToken();

    if (!token) {
      throw new Error(
        "Your login session has expired. Please log in again."
      );
    }

    const response = await fetch(path, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      cache: "no-store",
      body: JSON.stringify(payload)
    });

    const rawText = await response.text();

    let data = null;

    try {
      data = rawText ? JSON.parse(rawText) : null;
    } catch {
      console.error("U9 Auction: Non-JSON API response:", {
        path,
        status: response.status,
        body: rawText
      });

      throw new Error(
        `Auction API returned invalid JSON (${response.status}).`
      );
    }

    if (!response.ok || data?.success !== true) {
      console.error("U9 Auction API error:", {
        path,
        status: response.status,
        response: data
      });

      const message =
        data?.message ||
        data?.error ||
        data?.details ||
        data?.hint ||
        `Auction API request failed (${response.status}).`;

      throw new Error(message);
    }

    return data.result ?? null;
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
     UI - BUTTONS
  ========================================================= */

  function setStartButton(disabled, text) {
    const button = document.getElementById("U9-auction-start");

    if (!button) return;

    button.disabled = !!disabled;
    button.textContent = text || "Start Task";
  }

  function setCompleteButton(disabled, text) {
    const button = document.getElementById("U9-auction-complete");

    if (!button) return;

    button.disabled = !!disabled;
    button.textContent = text || "Complete Task";
  }

  function updateCompleteButtonByBalance() {
    if (!currentOrder || currentOrder.status !== "pending") {
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

    const el = document.getElementById("U9-auction-coins");

    if (el) {
      el.textContent = formatCoins(currentCoins);
    }

    updateCompleteButtonByBalance();
  }

  /* =========================================================
     UI - ROUND
  ========================================================= */

  function updateRound(completed, total) {
    const el = document.getElementById("U9-auction-round");

    if (!el) return;

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
    if (!order) return;

    currentOrder = order;

    const name = document.getElementById("U9-auction-product-name");
    const image = document.getElementById("U9-auction-product-image");
    const description = document.getElementById(
      "U9-auction-product-description"
    );
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
    if (!status) return null;

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

    if (!currentOrder || currentOrder.status !== "pending") {
      return;
    }

    async function refreshBalance() {
      if (!currentOrder || currentOrder.status !== "pending") {
        stopBalanceRefresh();
        return;
      }

      try {
        const status = await callAuctionAPI(
          "/api/Auction-round-status"
        );

        if (status) {
          currentRoundStatus = status;
          updateCoins(status.coins);
        }
      } catch (error) {
        console.error("U9 balance refresh error:", error);
      }
    }

    refreshBalance();

    balanceTimer = setInterval(refreshBalance, 2000);
  }

  /* =========================================================
     ROUND STATUS
  ========================================================= */

  async function loadRoundStatus() {
    const userId = getUserId();

    if (!userId) {
      throw new Error("Please log in first.");
    }

    console.log("U9: Loading round status...");

    const status = await callAuctionAPI(
      "/api/Auction-round-status"
    );

    if (!status) {
      console.warn("U9: Auction-round-status returned no result.");
      return null;
    }

    currentRoundStatus = status;

    updateCoins(status.coins);
    updateRound(status.completed_count, status.orders_per_round);

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

      if (currentOrder && currentOrder.status === "pending") {
        setStartButton(true, "Complete current task first");
      } else {
        setStartButton(false, "Start Task");
      }

      return;
    }

    function tick() {
      const remaining = Math.ceil(
        (new Date(cooldownEnd).getTime() - Date.now()) / 1000
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
      const remaining = Math.ceil(
        (new Date(matchEndTime).getTime() - Date.now()) / 1000
      );

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
     FINISH MATCHING -> CREATE ORDER
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
    showMatching("Matching completed. Creating order...");

    try {
      console.log("U9: Calling Auction-order-matching...", {
        matchingId
      });

      const result = await callAuctionAPI(
        "/api/Auction-order-matching",
        { p_matching_id: matchingId }
      );

      if (!result || !result.order_id) {
        throw new Error("Order was not created.");
      }

      currentOrder = {
        order_id: result.order_id,
        user_id: result.user_id || getUserId(),
        product_id: result.product_id,
        product_name: result.product_name,
        product_image_url: result.product_image_url || "",
        product_description: "",
        product_url: "",
        total_price: result.total_price,
        profit: result.profit,
        coins_after: result.coins_after,
        status: result.status || "pending",
        round_id: result.round_id,
        order_number: result.order_number
      };

      currentMatching = null;

      hideMatching();

      updateCoins(result.coins_after);
      renderOrder(currentOrder);

      setStartButton(true, "Complete current task first");
      startBalanceRefresh();

      showMessage("Task matched successfully.");
    } catch (error) {
      console.error("U9 ORDER MATCHING ERROR:", error);

      /*
       * Do not automatically discard the matching ID on a network error.
       * The server may have processed the request even if the response failed.
       */
      showMessage(error.message || "Failed to create order.");

      setStartButton(true, "Retry / Refresh status");
    }
  }

  /* =========================================================
     START TASK
  ========================================================= */

  async function startTask() {
    if (ordering) return;

    if (currentMatching) {
      console.warn("U9: Matching is already running.");
      return;
    }

    if (currentOrder && currentOrder.status === "pending") {
      showMessage("Please complete the current task first.");
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
      showMessage("Your login session has expired. Please log in again.");
      return;
    }

    ordering = true;

    setStartButton(true, "Matching...");
    hideOrder();
    setCompleteButton(true, "Complete Task");

    try {
      showMatching("Starting Matching...");
      showMessage("");

      console.log("U9: Calling Auction-auto-order...");

      const result = await callAuctionAPI(
        "/api/Auction-auto-order"
      );

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
        throw new Error("Matching ID was not returned.");
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

      // Starting a match does not deduct Coins.
      if (result.coins_after != null) {
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
  ========================================================= */

  async function completeTask() {
    if (completing) return;

    if (!currentOrder || currentOrder.status !== "pending") {
      showMessage("There is no pending task to complete.");
      return;
    }

    if (currentCoins < 0) {
      showMessage(
        "Please recharge your Coins before completing this order."
      );

      setCompleteButton(true, "Recharge to Complete");
      return;
    }

    if (!getUserId()) {
      showMessage("Please log in first.");
      return;
    }

    if (!getSessionToken()) {
      showMessage("Your login session has expired. Please log in again.");
      return;
    }

    completing = true;
    setCompleteButton(true, "Completing...");

    try {
      console.log("U9: Completing order...", {
        orderId: currentOrder.order_id
      });

      const result = await callAuctionAPI(
        "/api/Auction-complete-order",
        { p_order_id: currentOrder.order_id }
      );

      if (!result) {
        throw new Error("Completion result is empty.");
      }

      currentOrder.status = "completed";

      updateCoins(result.final_coins);

      const statusEl = document.getElementById(
        "U9-auction-order-status"
      );

      if (statusEl) {
        statusEl.textContent = "Completed";
      }

      updateRound(
        result.completed_count,
        result.orders_per_round
      );

      stopBalanceRefresh();

      setCompleteButton(true, "Completed");

      currentOrder = null;

      if (result.cooldown_end_time) {
        handleCooldown(result.cooldown_end_time);
        showMessage("Round completed. Cooldown started.");
      } else {
        setStartButton(false, "Start Task");
        showMessage("Task completed successfully.");
      }

      await loadRoundStatus();
    } catch (error) {
      console.error("U9 COMPLETE ORDER ERROR:", error);

      updateCompleteButtonByBalance();

      showMessage(error.message || "Failed to complete task.");
    } finally {
      completing = false;
    }
  }

  /* =========================================================
     LOAD PENDING ORDER
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
     Uses Auction-active-matching Edge Function.
  ========================================================= */

  async function loadActiveMatching() {
    const userId = getUserId();

    if (!userId) {
      return null;
    }

    const result = await callAuctionAPI(
      "/api/Auction-active-matching"
    );

    /*
     * Expected response:
     * { success: true, result: null }
     * or
     * { success: true, result: { id, user_id, ... } }
     *
     * Also accept { result: { matching: {...} } } if the
     * Edge Function returns a nested matching object.
     */
    const data = result?.matching ?? result;

    if (!data || !data.id) {
      currentMatching = null;
      hideMatching();
      return null;
    }

    currentMatching = {
      matching_id: data.id,
      user_id: data.user_id,
      product_id: data.product_id,
      match_start_time: data.match_start_time,
      match_end_time: data.match_end_time,
      round_id: data.round_id,
      order_number: data.order_number
    };

    currentOrder = null;

    stopBalanceRefresh();
    hideOrder();

    setCompleteButton(true, "Complete Task");
    setStartButton(true, "Matching...");

    const endTime = data.match_end_time;
    const remaining = endTime
      ? Math.ceil((new Date(endTime).getTime() - Date.now()) / 1000)
      : 0;

    if (remaining <= 0) {
      await finishMatching();
    } else {
      startMatchingCountdown(endTime);
    }

    console.log("U9 active matching restored:", currentMatching);

    return currentMatching;
  }

  /* =========================================================
     REFRESH AUCTION PAGE
  ========================================================= */

  async function refreshAuctionPage() {
    console.log("U9: Refreshing auction page...");

    try {
      const status = await loadRoundStatus();

      if (!status) {
        return null;
      }

      // Pending orders take priority over active matching.
      const pendingOrder = await loadPendingOrder(status);

      if (pendingOrder) {
        currentMatching = null;

        console.log(
          "U9: Pending order restored from round status.",
          pendingOrder
        );

        return {
          status,
          pendingOrder,
          activeMatching: null
        };
      }

      stopBalanceRefresh();

      const activeMatching = await loadActiveMatching();

      console.log("U9: Auction status:", status);
      console.log("U9: Pending order:", pendingOrder);
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

    if (homePage) homePage.style.display = "none";
    if (shopPage) shopPage.style.display = "none";
    if (test1Page) test1Page.style.display = "none";
    if (test2Page) test2Page.style.display = "none";

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
     PUBLIC API
  ========================================================= */

  window.openAuctionPage = openAuctionPage;

  window.U9Auction = {
    refresh: refreshAuctionPage,
    startTask,
    completeTask,
    getUserId,
    getSessionToken,
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

/* =========================
   AUCTION TOOL BUTTONS
========================= */

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

    historyButton.addEventListener("click", async function () {
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
