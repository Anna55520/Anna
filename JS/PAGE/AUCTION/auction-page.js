/* =========================================================
   U9 AUCTION PAGE
   Task Matching / Order / Round / Cooldown
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

  /*
   * Latest round status returned by u9_round_status.
   * This now also contains pending order information.
   */
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

        const user =
          window.U9User.get();

        if (
          user &&
          user.id
        ) {

          console.log(
            "U9: User ID from U9User:",
            user.id
          );

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

      console.log(
        "U9: User ID from window.currentUserUUID:",
        window.currentUserUUID
      );

      return window.currentUserUUID;
    }


    if (window.currentUserId) {

      console.log(
        "U9: User ID from window.currentUserId:",
        window.currentUserId
      );

      return window.currentUserId;
    }


    const storedUUID =
      localStorage.getItem(
        "currentUserUUID"
      );

    if (storedUUID) {

      console.log(
        "U9: User ID from localStorage currentUserUUID:",
        storedUUID
      );

      return storedUUID;
    }


    const storedId =
      localStorage.getItem(
        "currentUserId"
      );

    if (storedId) {

      console.log(
        "U9: User ID from localStorage currentUserId:",
        storedId
      );

      return storedId;
    }


    console.error(
      "U9: User UUID is missing."
    );

    return null;
  }


  /* =========================================================
     SUPABASE
  ========================================================= */

  function getSupabase() {

    try {

      if (
        typeof supabaseClient !== "undefined" &&
        supabaseClient
      ) {

        return supabaseClient;
      }

    } catch (error) {
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
     UI - COMPLETE BUTTON BY BALANCE
  ========================================================= */

  function updateCompleteButtonByBalance() {

    if (
      !currentOrder ||
      currentOrder.status !== "pending"
    ) {

      return;
    }


    if (
      currentCoins < 0
    ) {

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
  }


  /* =========================================================
     UI - COINS
  ========================================================= */

  function updateCoins(coins) {

    currentCoins =
      Number(coins) || 0;


    const el =
      document.getElementById(
        "U9-auction-coins"
      );


    if (el) {

      el.textContent =
        formatCoins(
          currentCoins
        );
    }


    updateCompleteButtonByBalance();
  }


  /* =========================================================
     BALANCE AUTO REFRESH
  ========================================================= */

  function stopBalanceRefresh() {

    if (balanceTimer) {

      clearInterval(
        balanceTimer
      );

      balanceTimer =
        null;
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


      const client =
        getSupabase();


      const userId =
        getUserId();


      if (
        !client ||
        !userId
      ) {

        return;
      }


      try {

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
            "U9 balance refresh error:",
            error
          );

          return;
        }


        if (!data) {
          return;
        }


        const status =
          Array.isArray(data)
            ? data[0]
            : data;


        if (!status) {
          return;
        }


        updateCoins(
          status.coins
        );

      }

      catch (error) {

        console.error(
          "U9 balance refresh exception:",
          error
        );
      }
    }


    refreshBalance();


    balanceTimer =
      setInterval(
        refreshBalance,
        2000
      );
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

      order_id:
        status.pending_order_id,

      user_id:
        getUserId(),

      product_id:
        status.pending_product_id,

      product_name:
        status.pending_product_name ||
        "Task",

      product_description:
        "",

      product_url:
        "",

      product_image_url:
        status.pending_product_image_url ||
        "",

      total_price:
        status.pending_total_price,

      profit:
        status.pending_profit,

      status:
        status.pending_status,

      round_id:
        status.pending_round_id
    };
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


    /*
     * Save the complete status object.
     */
    currentRoundStatus =
      status;


    updateCoins(
      status.coins
    );


    updateRound(
      status.completed_count,
      status.orders_per_round
    );


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


      if (
        currentMatching
      ) {

        setStartButton(
          true,
          "Matching..."
        );

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


        /*
         * Cooldown has ended.
         *
         * The previous round is finished.
         * Show the new round as 0 / total immediately.
         *
         * The actual new round_id will be created
         * by u9_auto_order when the next task starts.
         */
        if (
          currentRoundStatus
        ) {

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


        if (
          !currentMatching &&
          !currentOrder
        ) {

          setStartButton(
            false,
            "Start Task"
          );
        }


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

  async function finishMatching() {

    if (!currentMatching) {

      console.warn(
        "U9: No active matching found."
      );

      hideMatching();

      return;
    }


    const client =
      getSupabase();


    const userId =
      getUserId();


    if (!client || !userId) {

      showMessage(
        "Unable to complete matching."
      );

      return;
    }


    const matchingId =
      currentMatching.matching_id;


    if (!matchingId) {

      console.error(
        "U9: matching_id is missing."
      );

      showMessage(
        "Matching ID is missing."
      );

      return;
    }


    setStartButton(
      true,
      "Creating order..."
    );


    showMatching(
      "Matching completed. Creating order..."
    );


    try {

      console.log(
        "U9: Calling u9_order_matching...",
        {
          userId: userId,
          matchingId: matchingId
        }
      );


      const {
        data,
        error
      } =
        await client.rpc(
          "u9_order_matching",
          {
            p_user_id: userId,
            p_matching_id: matchingId
          }
        );


      if (error) {

        console.error(
          "U9 u9_order_matching RPC ERROR:",
          error
        );

        throw error;
      }


      console.log(
        "U9 order matching result:",
        data
      );


      const result =
        Array.isArray(data)
          ? data[0]
          : data;


      if (!result) {

        throw new Error(
          "Order matching result is empty."
        );
      }


      if (!result.order_id) {

        throw new Error(
          "Order was not created."
        );
      }


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
          "",

        product_url:
          "",

        total_price:
          result.total_price,

        profit:
          result.profit,

        coins_after:
          result.coins_after,

        status:
          result.status || "pending",

        round_id:
          result.round_id,

        order_number:
          result.order_number
      };


      currentMatching =
        null;


      hideMatching();


      /*
       * Coins are deducted here,
       * after matching is finished.
       */
      updateCoins(
        result.coins_after
      );


      renderOrder(
        currentOrder
      );


      updateCompleteButtonByBalance();


      setStartButton(
        true,
        "Complete current task first"
      );


      startBalanceRefresh();


      showMessage(
        "Task matched successfully."
      );
    }

    catch (error) {

      console.error(
        "U9 ORDER MATCHING ERROR:",
        error
      );


      currentMatching =
        null;


      hideMatching();


      setCompleteButton(
        true,
        "Complete Task"
      );


      setStartButton(
        false,
        "Start Task"
      );


      showMessage(
        error?.message ||
        "Failed to create order."
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


    if (
      currentCoins < 0
    ) {

      showMessage(
        "Please recharge your Coins before starting another task."
      );

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


    setCompleteButton(
      true,
      "Complete Task"
    );


    try {

      showMatching(
        "Starting Matching..."
      );


      showMessage("");


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
          "No matching result was returned."
        );
      }


      /* =====================================================
         COOLDOWN
      ===================================================== */

      if (
        result.cooldown === true
      ) {

        currentMatching =
          null;

        hideMatching();


        await loadRoundStatus();


        showMessage(
          "The current round is cooling down."
        );


        return;
      }


      /* =====================================================
         SAVE MATCHING STATE
      ===================================================== */

      if (!result.matching_id) {

        throw new Error(
          "Matching ID was not returned."
        );
      }


      currentMatching = {

        matching_id:
          result.matching_id,

        user_id:
          result.user_id,

        product_id:
          result.product_id,

        product_name:
          result.product_name,

        total_price:
          result.total_price,

        profit:
          result.profit,

        coins_after:
          result.coins_after,

        match_start_time:
          result.match_start_time,

        match_end_time:
          result.match_end_time,

        round_id:
          result.round_id,

        order_number:
          result.order_number
      };


      /*
       * Coins do NOT change during Matching.
       */
      updateCoins(
        result.coins_after
      );


      currentOrder =
        null;


      hideOrder();


      setCompleteButton(
        true,
        "Complete Task"
      );


      setStartButton(
        true,
        "Matching..."
      );


      /* =====================================================
         START MATCHING COUNTDOWN
      ===================================================== */

      const matchEnd =
        result.match_end_time;


      if (matchEnd) {

        startMatchingCountdown(
          matchEnd
        );

      } else {

        await finishMatching();
      }
    }

    catch (error) {

      console.error(
        "U9 AUTO ORDER ERROR:",
        error
      );


      currentMatching =
        null;


      currentOrder =
        null;


      hideMatching();


      setCompleteButton(
        true,
        "Complete Task"
      );


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


    if (
      !currentOrder ||
      currentOrder.status !== "pending"
    ) {

      showMessage(
        "There is no pending task to complete."
      );

      return;
    }


    if (
      currentCoins < 0
    ) {

      showMessage(
        "Please recharge your Coins before completing this order."
      );


      setCompleteButton(
        true,
        "Recharge to Complete"
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


      currentOrder.status =
        "completed";


      updateCoins(
        result.coins_after
      );


      const statusEl =
        document.getElementById(
          "U9-auction-order-status"
        );


      if (statusEl) {

        statusEl.textContent =
          "Completed";
      }


      updateRound(
        result.completed_count,
        result.orders_per_round
      );


      stopBalanceRefresh();


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


      currentOrder =
        null;


      await loadRoundStatus();
    }

    catch (error) {

      console.error(
        "U9 COMPLETE ORDER ERROR:",
        error
      );


      if (
        currentCoins < 0
      ) {

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
    }

    finally {

      completing =
        false;
    }
  }


  /* =========================================================
     LOAD PENDING ORDER
  ========================================================= */

  async function loadPendingOrder(
    status
  ) {

    /*
     * Pending order information now comes from
     * u9_round_status.
     *
     * Do not query u9-orders directly from the browser.
     */

    const pendingOrder =
      buildPendingOrderFromStatus(
        status
      );


    if (!pendingOrder) {

      currentOrder =
        null;

      stopBalanceRefresh();

      hideOrder();

      return null;
    }


    currentOrder =
      pendingOrder;


    renderOrder(
      currentOrder
    );


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

    const client =
      getSupabase();


    const userId =
      getUserId();


    if (
      !client ||
      !userId
    ) {

      return null;
    }


    const {
      data,
      error
    } =
      await client
        .from("u9-matchings")
        .select("*")
        .eq(
          "user_id",
          userId
        )
        .eq(
          "status",
          "matching"
        )
        .order(
          "created_at",
          {
            ascending: false
          }
        )
        .limit(1)
        .maybeSingle();


    if (error) {

      console.error(
        "U9 load active matching error:",
        error
      );

      return null;
    }


    if (!data) {

      return null;
    }


    currentMatching = {

      matching_id:
        data.id,

      user_id:
        data.user_id,

      product_id:
        data.product_id,

      match_start_time:
        data.match_start_time,

      match_end_time:
        data.match_end_time,

      round_id:
        data.round_id,

      order_number:
        data.order_number
    };


    currentOrder =
      null;


    stopBalanceRefresh();


    hideOrder();


    setCompleteButton(
      true,
      "Complete Task"
    );


    setStartButton(
      true,
      "Matching..."
    );


    const remaining =
      Math.ceil(
        (
          new Date(
            data.match_end_time
          ).getTime() -
          Date.now()
        ) / 1000
      );


    if (
      remaining <= 0
    ) {

      await finishMatching();

    } else {

      startMatchingCountdown(
        data.match_end_time
      );
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

    console.log(
      "U9: Refreshing auction page..."
    );


    try {

      /*
       * u9_round_status now returns:
       *
       * Coins
       * Round information
       * Pending order information
       *
       * in one RPC call.
       */
      const status =
        await loadRoundStatus();


      if (!status) {

        return null;
      }


      /*
       * A pending order has priority.
       */
      const pendingOrder =
        await loadPendingOrder(
          status
        );


      if (
        pendingOrder
      ) {

        currentMatching =
          null;


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


      /*
       * If there is no pending order,
       * stop balance polling.
       */
      stopBalanceRefresh();


      /*
       * If there is no pending order,
       * check whether Matching is still active.
       */
      const activeMatching =
        await loadActiveMatching();


      console.log(
        "U9: Auction status:",
        status
      );


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
        pendingOrder,
        activeMatching
      };

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

      startButton.onclick =
        startTask;
    }


    if (completeButton) {

      completeButton.onclick =
        completeTask;
    }
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


  initializeAuctionPage();

})();
