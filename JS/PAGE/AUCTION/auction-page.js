/* =========================
   AUCTION PAGE
========================= */

(function () {


  /* =========================
     ELEMENTS
  ========================= */

  const homePage =
    document.getElementById(
      "U9-page-home"
    );


  const shopPage =
    document.getElementById(
      "U9-page-shop"
    );


  const auctionPage =
    document.getElementById(
      "U9-page-auction"
    );


  const test1Page =
    document.getElementById(
      "U9-page-test1"
    );


  const test2Page =
    document.getElementById(
      "U9-page-test2"
    );


  /* =========================
     U9 STATE
  ========================= */

  let ordering = false;

  let completing = false;

  let matchingTimer = null;

  let cooldownTimer = null;

  let currentOrder = null;


  /* =========================
     HELPERS
  ========================= */

  function getUserId() {

    return (
      window.currentUserUUID ||
      window.currentUserId ||
      localStorage.getItem(
        "currentUserUUID"
      ) ||
      localStorage.getItem(
        "currentUserId"
      ) ||
      null
    );

  }

  function getSupabase() {

  if (
      typeof supabaseClient !==
      "undefined" &&
      supabaseClient
  ) {

      return supabaseClient;

  }


  if (
      window.supabaseClient
  ) {

      return window.supabaseClient;

  }


  return null;

  }


  function formatCoins(value) {

    return Number(
      value || 0
    ).toFixed(2);

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
      String(minutes)
        .padStart(2, "0") +
      ":" +
      String(secs)
        .padStart(2, "0")
    );

  }


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


  /* =========================
     OPEN AUCTION PAGE
  ========================= */

  function openAuctionPage() {

    if (
      !auctionPage
    ) {

      return;

    }


    if (
      homePage
    ) {

      homePage.style.display =
        "none";

    }


    if (
      shopPage
    ) {

      shopPage.style.display =
        "none";

    }


    if (
      test1Page
    ) {

      test1Page.style.display =
        "none";

    }


    if (
      test2Page
    ) {

      test2Page.style.display =
        "none";

    }


    auctionPage.style.display =
      "block";


    refreshAuctionPage();

  }


  /* =========================
     INITIALIZE AUCTION PAGE
  ========================= */

  function initializeAuctionPage() {

    if (
      !auctionPage
    ) {

      return;

    }


    auctionPage.style.display =
      "none";


    bindAuctionEvents();

  }


  /* =========================
     UI
  ========================= */

  function updateCoins(coins) {

    const el =
      document.getElementById(
        "U9-auction-coins"
      );


    if (el) {

      el.textContent =
        formatCoins(coins);

    }

  }


  function updateRound(
    completed,
    total
  ) {

    const el =
      document.getElementById(
        "U9-auction-round"
      );


    if (el) {

      el.textContent =
        `${completed} / ${total}`;

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


  function showMatching(
    message
  ) {

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


  /* =========================
     RENDER ORDER
  ========================= */

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

    }

    else if (url) {

      url.style.display =
        "none";

    }


    showOrder();

  }


  /* =========================
     ROUND STATUS
  ========================= */

  async function loadRoundStatus() {

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
      await client.rpc(
        "u9_round_status",
        {
          p_user_id:
            userId
        }
      );


    if (error) {

      console.error(
        "u9_round_status error:",
        error
      );


      throw error;

    }


    if (!data) {

      return null;

    }


    const status =
      Array.isArray(data)
        ? data[0]
        : data;


    if (!status) {

      return null;

    }


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


  /* =========================
     COOLDOWN
  ========================= */

  function handleCooldown(
    cooldownEnd
  ) {

    if (
      cooldownTimer
    ) {

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


      setStartButton(
        false,
        "Start Task"
      );


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

        clearInterval(
          cooldownTimer
        );


        cooldownTimer =
          null;


        if (cooldownEl) {

          cooldownEl.textContent =
            "";

        }


        setStartButton(
          false,
          "Start Task"
        );


        loadRoundStatus();

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


  /* =========================
     MATCHING
  ========================= */

  function startMatchingCountdown(
    matchEndTime
  ) {

    if (
      matchingTimer
    ) {

      clearInterval(
        matchingTimer
      );

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

        clearInterval(
          matchingTimer
        );


        matchingTimer =
          null;


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


  function finishMatching() {

    hideMatching();


    if (
      currentOrder
    ) {

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


  /* =========================
     START TASK
  ========================= */

  async function startTask() {

    if (ordering) {

      return;

    }


    const client =
      getSupabase();


    const userId =
      getUserId();


    if (
      !client
    ) {

      alert(
        "Supabase client is not initialized."
      );

      return;

    }


    if (
      !userId
    ) {

      alert(
        "Please log in first."
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


      const {
        data,
        error
      } =
        await client.rpc(
          "u9_auto_order",
          {
            p_user_id:
              userId
          }
        );


      if (error) {

        throw error;

      }


      const result =
        Array.isArray(data)
          ? data[0]
          : data;


      if (!result) {

        throw new Error(
          "No order was returned."
        );

      }


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


      updateCoins(
        result.coins_after
      );


      const matchEnd =
        result.match_end_time;


      if (matchEnd) {

        startMatchingCountdown(
          matchEnd
        );

      }

      else {

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


  /* =========================
     COMPLETE TASK
  ========================= */

  async function completeTask() {

    if (
      completing
    ) {

      return;

    }


    if (
      !currentOrder?.order_id
    ) {

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


    completing =
      true;


    setCompleteButton(
      true,
      "Completing..."
    );


    try {

      const {
        data,
        error
      } =
        await client.rpc(
          "u9_complete_order",
          {
            p_user_id:
              userId,

            p_order_id:
              currentOrder.order_id
          }
        );


      if (error) {

        throw error;

      }


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


      const status =
        document.getElementById(
          "U9-auction-order-status"
        );


      if (status) {

        status.textContent =
          "Completed";

      }


      setCompleteButton(
        true,
        "Completed"
      );


      updateRound(
        result.completed_count,
        result.orders_per_round
      );


      if (
        result.cooldown_end_time
      ) {

        handleCooldown(
          result.cooldown_end_time
        );


        showMessage(
          "Round completed. Cooldown started."
        );

      }

      else {

        setStartButton(
          false,
          "Start Task"
        );


        showMessage(
          "Task completed successfully."
        );

      }


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


  /* =========================
     REFRESH PAGE
  ========================= */

  async function refreshAuctionPage() {

    try {

      await loadRoundStatus();

    }

    catch (error) {

      console.error(
        "U9 AUCTION REFRESH ERROR:",
        error
      );

    }

  }


  /* =========================
     EVENTS
  ========================= */

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

      startButton.addEventListener(
        "click",
        startTask
      );

    }


    if (completeButton) {

      completeButton.addEventListener(
        "click",
        completeTask
      );

    }

  }


  /* =========================
     PUBLIC FUNCTION
  ========================= */

  window.openAuctionPage =
    openAuctionPage;


  /* =========================
     START AUCTION PAGE
  ========================= */

  initializeAuctionPage();


})();
