
/* =========================================================
   U9 AUCTION PAGE
   Complete Task / Auto Order / Round / Cooldown
========================================================= */

(function () {
  "use strict";

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
     U9 STATE
  ========================================================= */

  let ordering = false;
  let completing = false;

  let matchingTimer = null;
  let cooldownTimer = null;

  let currentOrder = null;


  /* =========================================================
     USER
  ========================================================= */

  function getUserId() {
    const userId =
      window.currentUserUUID ||
      window.currentUserId ||
      localStorage.getItem("currentUserUUID") ||
      localStorage.getItem("currentUserId") ||
      null;

    return userId;
  }


  /* =========================================================
     SUPABASE
  ========================================================= */

  function getSupabase() {

    /*
      Try all common client names.

      Your old code only checked:
        supabaseClient
        window.supabaseClient

      But your console showed:
        typeof supabaseClient === "undefined"

      So we also check window.supabase and other common names.
    */

    try {
      if (
        typeof supabaseClient !== "undefined" &&
        supabaseClient
      ) {
        return supabaseClient;
      }
    } catch (e) {
      // Ignore ReferenceError
    }


    if (
      window.supabaseClient
    ) {
      return window.supabaseClient;
    }


    if (
      window.supabase
    ) {
      return window.supabase;
    }


    if (
      window.SupabaseClient
    ) {
      return window.SupabaseClient;
    }


    if (
      window.U9Supabase
    ) {
      return window.U9Supabase;
    }


    console.error(
      "U9: Supabase client not found."
    );

    console.error(
      "U9: window.supabaseClient =",
      window.supabaseClient
    );

    console.error(
      "U9: window.supabase =",
      window.supabase
    );

    return null;
  }


  /* =========================================================
     FORMAT
  ========================================================= */

  function formatCoins(value) {
    const number =
      Number(value);

    if (
      Number.isNaN(number)
    ) {
      return "0.00";
    }

    return number.toFixed(2);
  }


  function formatSeconds(seconds) {

    seconds =
      Math.max(
        0,
        Math.ceil(
          Number(seconds) || 0
        )
      );


    const minutes =
      Math.floor(
        seconds / 60
      );


    const secs =
      seconds % 60;


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

    const el =
      document.getElementById(
        "U9-auction-message"
      );


    if (!el) {
      return;
    }


    el.textContent =
      message || "";
  }


  /* =========================================================
     UI - COINS
  ========================================================= */

  function updateCoins(coins) {

    const el =
      document.getElementById(
        "U9-auction-coins"
      );


    if (!el) {
      console.warn(
        "U9: #U9-auction-coins not found."
      );

      return;
    }


    el.textContent =
      formatCoins(coins);
  }


  /* =========================================================
     UI - ROUND
  ========================================================= */

  function updateRound(
    completed,
    total
  ) {

    const el =
      document.getElementById(
        "U9-auction-round"
      );


    if (!el) {
      console.warn(
        "U9: #U9-auction-round not found."
      );

      return;
    }


    const completedNumber =
      Number(completed) || 0;

    const totalNumber =
      Number(total) || 0;


    el.textContent =
      `${completedNumber} / ${totalNumber}`;
  }


  /* =========================================================
     UI - START BUTTON
  ========================================================= */

  function setStartButton(
    disabled,
    text
  ) {

    const button =
      document.getElementById(
        "U9-auction-start"
      );


    if (!button) {
      return;
    }


    button.disabled =
      !!disabled;


    button.textContent =
      text || "Start Task";
  }


  /* =========================================================
     UI - COMPLETE BUTTON
  ========================================================= */

  function setCompleteButton(
    disabled,
    text
  ) {

    const button =
      document.getElementById(
        "U9-auction-complete"
      );


    if (!button) {
      return;
    }


    button.disabled =
      !!disabled;


    button.textContent =
      text || "Complete Task";
  }


  /* =========================================================
     MATCHING UI
  ========================================================= */

  function showMatching(message) {

    const el =
      document.getElementById(
        "U9-auction-matching"
      );


    const text =
      document.getElementById(
        "U9-auction-matching-text"
      );


    if (el) {
      el.style.display =
        "block";
    }


    if (text) {
      text.textContent =
        message || "Matching...";
    }
  }


  function hideMatching() {

    const el =
      document.getElementById(
        "U9-auction-matching"
      );


    if (el) {
      el.style.display =
        "none";
    }
  }


  /* =========================================================
     ORDER UI
  ========================================================= */

  function showOrder() {

    const el =
      document.getElementById(
        "U9-auction-order"
      );


    if (el) {
      el.style.display =
        "block";
    }
  }


  function hideOrder() {

    const el =
      document.getElementById(
        "U9-auction-order"
      );


    if (el) {
      el.style.display =
        "none";
    }
  }


  /* =========================================================
     RENDER ORDER
  ========================================================= */

  function renderOrder(order) {

    if (!order) {
      return;
    }


    currentOrder =
      order;


    const name =
      document.getElementById(
        "U9-auction-product-name"
      );


    const description =
      document.getElementById(
        "U9-auction-product-description"
      );


    const price =
      document.getElementById(
        "U9-auction-product-price"
      );


    const profit =
      document.getElementById(
        "U9-auction-product-profit"
      );


    const url =
      document.getElementById(
        "U9-auction-product-url"
      );


    const status =
      document.getElementById(
        "U9-auction-order-status"
      );


    if (name) {
      name.textContent =
        order.product_name ||
        "Task";
    }


    if (description) {
      description.textContent =
        order.product_description ||
        "Complete this task to receive your Coins and profit.";
    }


    if (price) {
      price.textContent =
        formatCoins(
          order.total_price
        );
    }


    if (profit) {
      profit.textContent =
        "+" +
        formatCoins(
          order.profit
        );
    }


    if (status) {
      status.textContent =
        order.status === "completed"
          ? "Completed"
          : "Pending";
    }


    if (
      url &&
      order.product_url
    ) {

      url.href =
        order.product_url;

      url.style.display =
        "block";

    } else if (url) {

      url.removeAttribute("href");

      url.style.display =
        "none";
    }


    showOrder();
  }


  /* =========================================================
     ROUND STATUS
  ========================================================= */

  async function loadRoundStatus() {

    const client =
      getSupabase();


    const userId =
      getUserId();


    if (!client) {

      console.error(
        "U9: Cannot load round status because Supabase client is missing."
      );

      return null;
    }


    if (!userId) {

      console.error(
        "U9: Cannot load round status because user UUID is missing."
      );

      return null;
    }


    console.log(
      "U9: Loading round status...",
      {
        userId: userId
      }
    );


    const {
      data,
      error
    } =
      await client.rpc(
        "u9_round_status",
        {
          p_user_id: userId
        }
      );


    if (error) {

      console.error(
        "U9 u9_round_status ERROR:",
        error
      );

      throw error;
    }


    console.log(
      "U9 round status:",
      data
    );


    if (!data) {

      console.warn(
        "U9: u9_round_status returned no data."
      );

      return null;
    }


    const status =
      Array.isArray(data)
        ? data[0]
        : data;


    if (!status) {

      console.warn(
        "U9: Round status row is empty."
      );

      return null;
    }


    /* =========================
       UPDATE COINS
    ========================= */

    updateCoins(
      status.coins
    );


    /* =========================
       UPDATE ROUND
    ========================= */

    updateRound(
      status.completed_count,
      status.orders_per_round
    );


    /* =========================
       COOLDOWN
    ========================= */

    handleCooldown(
      status.cooldown_end_time
    );


    return status;
  }


  /* =========================================================
     COOLDOWN
  ========================================================= */

  function handleCooldown(
    cooldownEnd
  ) {

    if (cooldownTimer) {

      clearInterval(
        cooldownTimer
      );

      cooldownTimer =
        null;
    }


    const cooldownEl =
      document.getElementById(
        "U9-auction-cooldown"
      );


    if (!cooldownEnd) {

      if (cooldownEl) {
        cooldownEl.textContent =
          "";
      }


      /*
        Only enable Start Task if there
        isn't another pending order.
      */

      if (
        currentOrder &&
        currentOrder.status === "pending"
      ) {

        setStartButton(
          true,
          "Complete current task first"
        );

      } else {

        setStartButton(
          false,
          "Start Task"
        );
      }


      return;
    }


    function tick() {

      const remaining =
        Math.ceil(
          (
            new Date(
              cooldownEnd
            ).getTime() -
            Date.now()
          ) / 1000
        );


      if (
        remaining <= 0
      ) {

        if (cooldownTimer) {

          clearInterval(
            cooldownTimer
          );

          cooldownTimer =
            null;
        }


        if (cooldownEl) {

          cooldownEl.textContent =
            "";
        }


        setStartButton(
          false,
          "Start Task"
        );


        /*
          Refresh from database after cooldown.
        */

        loadRoundStatus()
          .catch(
            function (error) {
              console.error(
                "U9 cooldown refresh error:",
                error
              );
            }
          );


        return;
      }


      if (cooldownEl) {

        cooldownEl.textContent =
          "Cooldown " +
          formatSeconds(
            remaining
          );
      }


      setStartButton(
        true,
        "Cooldown"
      );
    }


    tick();


    cooldownTimer =
      setInterval(
        tick,
        1000
      );
  }


  /* =========================================================
     MATCHING COUNTDOWN
  ========================================================= */

  function startMatchingCountdown(
    matchEndTime
  ) {

    if (matchingTimer) {

      clearInterval(
        matchingTimer
      );

      matchingTimer =
        null;
    }


    function tick() {

      const remaining =
        Math.ceil(
          (
            new Date(
              matchEndTime
            ).getTime() -
            Date.now()
          ) / 1000
        );


      if (
        remaining <= 0
      ) {

        if (matchingTimer) {

          clearInterval(
            matchingTimer
          );

          matchingTimer =
            null;
        }


        finishMatching();

        return;
      }


      showMatching(
        "Matching... " +
        remaining +
        "s"
      );
    }


    tick();


    matchingTimer =
      setInterval(
        tick,
        500
      );
  }


  /* =========================================================
     FINISH MATCHING
  ========================================================= */

  function finishMatching() {

    hideMatching();


    if (currentOrder) {

      renderOrder(
        currentOrder
      );
    }


    setCompleteButton(
      false,
      "Complete Task"
    );


    setStartButton(
      true,
      "Complete current task first"
    );
  }


  /* =========================================================
     START TASK
  ========================================================= */

  async function startTask() {

    if (ordering) {
      return;
    }


    const client =
      getSupabase();


    const userId =
      getUserId();


    if (!client) {

      alert(
        "Supabase client is not initialized."
      );

      console.error(
        "U9: startTask() aborted - Supabase client missing."
      );

      return;
    }


    if (!userId) {

      alert(
        "Please log in first."
      );

      console.error(
        "U9: startTask() aborted - user UUID missing."
      );

      return;
    }


    ordering =
      true;


    setStartButton(
      true,
      "Matching..."
    );


    hideOrder();


    try {

      showMatching(
        "Starting task..."
      );


      console.log(
        "U9: Calling u9_auto_order...",
        {
          userId: userId
        }
      );


      const {
        data,
        error
      } =
        await client.rpc(
          "u9_auto_order",
          {
            p_user_id: userId
          }
        );


      if (error) {

        console.error(
          "U9 u9_auto_order RPC ERROR:",
          error
        );

        throw error;
      }


      console.log(
        "U9 auto order result:",
        data
      );


      const result =
        Array.isArray(data)
          ? data[0]
          : data;


      if (!result) {

        throw new Error(
          "No order was returned."
        );
      }


      /* =====================================================
         COOLDOWN
      ===================================================== */

      if (
        result.cooldown === true
      ) {

        hideMatching();


        await loadRoundStatus();


        showMessage(
          "The current round is cooling down."
        );


        return;
      }


      /* =====================================================
         CREATE CURRENT ORDER
      ===================================================== */

      currentOrder = {

        order_id:
          result.order_id,

        user_id:
          result.user_id,

        product_id:
          result.product_id,

        product_name:
          result.product_name,

        product_description:
          result.product_description ||
          "",

        product_url:
          result.product_url ||
          "",

        total_price:
          result.total_price,

        profit:
          result.profit,

        coins_after:
          result.coins_after,

        status:
          "pending",

        round_id:
          result.round_id
      };


      /* =====================================================
         UPDATE COINS IMMEDIATELY
      ===================================================== */

      updateCoins(
        result.coins_after
      );


      /* =====================================================
         MATCHING
      ===================================================== */

      const matchEnd =
        result.match_end_time;


      if (matchEnd) {

        startMatchingCountdown(
          matchEnd
        );

      } else {

        finishMatching();
      }


      showMessage("");
    }

    catch (error) {

      console.error(
        "U9 AUTO ORDER ERROR:",
        error
      );


      hideMatching();


      setStartButton(
        false,
        "Start Task"
      );


      showMessage(
        error?.message ||
        "Failed to start task."
      );
    }

    finally {

      ordering =
        false;
    }
  }


  /* =========================================================
     COMPLETE TASK
  ========================================================= */

  async function completeTask() {

    if (completing) {
      return;
    }


    if (!currentOrder?.order_id) {

      console.warn(
        "U9: No current order to complete."
      );

      return;
    }


    const client =
      getSupabase();


    const userId =
      getUserId();


    if (!client) {

      showMessage(
        "Supabase client is not initialized."
      );

      return;
    }


    if (!userId) {

      showMessage(
        "Please log in first."
      );

      return;
    }


    completing =
      true;


    setCompleteButton(
      true,
      "Completing..."
    );


    try {

      console.log(
        "U9: Completing order...",
        {
          userId: userId,
          orderId: currentOrder.order_id
        }
      );


      const {
        data,
        error
      } =
        await client.rpc(
          "u9_complete_order",
          {
            p_user_id: userId,
            p_order_id:
              currentOrder.order_id
          }
        );


      if (error) {

        console.error(
          "U9 u9_complete_order RPC ERROR:",
          error
        );

        throw error;
      }


      console.log(
        "U9 complete order result:",
        data
      );


      const result =
        Array.isArray(data)
          ? data[0]
          : data;


      if (!result) {

        throw new Error(
          "Completion result is empty."
        );
      }


      /* =====================================================
         UPDATE ORDER
      ===================================================== */

      currentOrder.status =
        "completed";


      /* =====================================================
         UPDATE COINS
      ===================================================== */

      updateCoins(
        result.coins_after
      );


      /* =====================================================
         UPDATE STATUS
      ===================================================== */

      const statusEl =
        document.getElementById(
          "U9-auction-order-status"
        );


      if (statusEl) {

        statusEl.textContent =
          "Completed";
      }


      /* =====================================================
         UPDATE ROUND
      ===================================================== */

      updateRound(
        result.completed_count,
        result.orders_per_round
      );


      /* =====================================================
         COOLDOWN
      ===================================================== */

      if (
        result.cooldown_end_time
      ) {

        handleCooldown(
          result.cooldown_end_time
        );


        showMessage(
          "Round completed. Cooldown started."
        );

      } else {

        /*
          Keep completed order visible,
          but allow the next task.
        */

        setStartButton(
          false,
          "Start Task"
        );


        showMessage(
          "Task completed successfully."
        );
      }


      setCompleteButton(
        true,
        "Completed"
      );


      /*
        Refresh exact database status.
      */

      await loadRoundStatus();
    }

    catch (error) {

      console.error(
        "U9 COMPLETE ORDER ERROR:",
        error
      );


      setCompleteButton(
        false,
        "Complete Task"
      );


      showMessage(
        error?.message ||
        "Failed to complete task."
      );
    }

    finally {

      completing =
        false;
    }
  }


  /* =========================================================
     REFRESH AUCTION PAGE
  ========================================================= */

  async function refreshAuctionPage() {

    console.log(
      "U9: Refreshing auction page..."
    );


    try {

      const status =
        await loadRoundStatus();


      console.log(
        "U9: Auction page refreshed.",
        status
      );

    }

    catch (error) {

      console.error(
        "U9 AUCTION REFRESH ERROR:",
        error
      );


      showMessage(
        error?.message ||
        "Failed to load auction status."
      );
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
      homePage.style.display =
        "none";
    }


    if (shopPage) {
      shopPage.style.display =
        "none";
    }


    if (test1Page) {
      test1Page.style.display =
        "none";
    }


    if (test2Page) {
      test2Page.style.display =
        "none";
    }


    auctionPage.style.display =
      "block";


    /*
      Load database state every time
      auction page is opened.
    */

    refreshAuctionPage();
  }


  /* =========================================================
     EVENTS
  ========================================================= */

  function bindAuctionEvents() {

    const startButton =
      document.getElementById(
        "U9-auction-start"
      );


    const completeButton =
      document.getElementById(
        "U9-auction-complete"
      );


    if (startButton) {

      /*
        Prevent duplicate listeners.
      */

      startButton.onclick =
        startTask;
    }


    if (completeButton) {

      completeButton.onclick =
        completeTask;
    }
  }


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


    auctionPage.style.display =
      "none";


    bindAuctionEvents();


    console.log(
      "U9 Auction Page initialized."
    );
  }


  /* =========================================================
     PUBLIC API
  ========================================================= */

  window.openAuctionPage =
    openAuctionPage;


  window.U9Auction = {

    refresh:
      refreshAuctionPage,

    startTask:
      startTask,

    completeTask:
      completeTask,

    getUserId:
      getUserId,

    getSupabase:
      getSupabase
  };


  /* =========================================================
     START
  ========================================================= */

  initializeAuctionPage();

})();
