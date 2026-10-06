
/* =========================================================
   U9 ORDER START
   JS/PAGE/AUCTION/u9-order-start.js

   Responsibility:
   - Bind U9 Order button
   - Start a new U9 order
   - Call u9-order-start Edge Function
   - Display server-controlled matching countdown

   This file does NOT:
   - Select products
   - Deduct coins
   - Create PENDING orders
   - Complete orders
   - Handle DONE button
========================================================= */

(() => {
  "use strict";

  /* =======================================================
     CONFIG
  ======================================================= */

  const U9_ORDER_START_URL =
    "https://tvtakmswbzawaweytimx.supabase.co/functions/v1/u9-order-start";


  /* =======================================================
     STATE
  ======================================================= */

  let isStartingOrder = false;

  let matchingTimer = null;


  /* =======================================================
     DOM
  ======================================================= */

  let orderButton = null;

  let roundProgress = null;

  let coinsElement = null;


  /* =======================================================
     INIT
  ======================================================= */

  function init() {

    orderButton =
      document.getElementById(
        "U9-order-button"
      );

    roundProgress =
      document.getElementById(
        "U9-round-progress"
      );

    coinsElement =
      document.getElementById(
        "U9-coins"
      );


    if (!orderButton) {

      console.warn(
        "[U9 Order Start] Order button not found."
      );

      return;
    }


    /*
     * Prevent duplicate event binding.
     */

    if (
      orderButton.dataset.u9OrderStartBound ===
      "true"
    ) {

      return;
    }


    orderButton.dataset.u9OrderStartBound =
      "true";


    orderButton.addEventListener(
      "click",
      handleOrderClick
    );


    console.log(
      "[U9 Order Start] Ready."
    );
  }


  /* =======================================================
     AUTH TOKEN
  ======================================================= */

  function getToken() {

    const token =
      localStorage.getItem(
        "u9_token"
      );

    if (!token) {

      return null;
    }


    return token;
  }


  /* =======================================================
     ORDER CLICK
  ======================================================= */

  async function handleOrderClick() {

    /*
     * Frontend double-click protection.
     *
     * Database also protects this,
     * but we don't need to send
     * unnecessary duplicate requests.
     */

    if (isStartingOrder) {

      return;
    }


    const token =
      getToken();


    if (!token) {

      console.warn(
        "[U9 Order Start] No session token."
      );

      showError(
        "Please login first."
      );

      return;
    }


    isStartingOrder =
      true;


    setButtonLoading(
      true
    );


    try {

      const response =
        await fetch(
          U9_ORDER_START_URL,
          {
            method: "POST",

            headers: {
              "Authorization":
                `Bearer ${token}`,

              "Content-Type":
                "application/json"
            },

            credentials:
              "include"
          }
        );


      let result = null;


      try {

        result =
          await response.json();

      } catch (jsonError) {

        console.error(
          "[U9 Order Start] Invalid JSON response:",
          jsonError
        );

        throw new Error(
          "INVALID_SERVER_RESPONSE"
        );
      }


      console.log(
        "[U9 Order Start] Response:",
        result
      );


      /* ===================================================
         SERVER ERROR
      =================================================== */

      if (
        !response.ok ||
        !result ||
        result.success !== true
      ) {

        handleServerError(
          result
        );

        return;
      }


      /* ===================================================
         SUCCESS
      =================================================== */

      handleOrderStarted(
        result
      );

    } catch (error) {

      console.error(
        "[U9 Order Start] Request failed:",
        error
      );

      showError(
        "Unable to start order. Please try again."
      );

    } finally {

      isStartingOrder =
        false;


      /*
       * Do not automatically enable
       * the button if an order is now
       * MATCHING.
       *
       * handleOrderStarted() controls
       * the final button state.
       */

      if (
        !orderButton.dataset.u9Matching
      ) {

        setButtonLoading(
          false
        );
      }
    }
  }


  /* =======================================================
     ORDER STARTED
  ======================================================= */

  function handleOrderStarted(
    result
  ) {

    const order =
      result.order || {};

    const round =
      result.round || {};

    const user =
      result.user || {};


    /* =====================================================
       UPDATE USER COINS
       
       No coins are deducted yet.
    ===================================================== */

    if (
      coinsElement &&
      user.coins !== undefined
    ) {

      coinsElement.textContent =
        formatNumber(
          user.coins
        );
    }


    /* =====================================================
       UPDATE ROUND
    ===================================================== */

    if (
      roundProgress &&
      round.target_orders !== undefined
    ) {

      const completed =
        Number(
          round.completed_orders || 0
        );

      const target =
        Number(
          round.target_orders || 0
        );


      roundProgress.textContent =
        `${completed}/${target}`;
    }


    /* =====================================================
       MATCHING
    ===================================================== */

    if (
      order.status ===
      "MATCHING"
    ) {

      orderButton.dataset.u9Matching =
        "true";


      /*
       * Disable button while order
       * is being matched.
       */

      orderButton.disabled =
        true;


      /*
       * Start server-controlled
       * countdown.
       */

      startMatchingCountdown(
        order.matching_ready_at
      );


      /*
       * Store useful state globally
       * for the next U9 auction script.
       */

      window.U9CurrentOrder =
        order;

      window.U9CurrentRound =
        round;


      console.log(
        "[U9 Order Start] Matching started:",
        order
      );

      return;
    }


    /*
     * Unexpected success state.
     */

    console.warn(
      "[U9 Order Start] Unexpected order status:",
      order.status
    );


    setButtonLoading(
      false
    );
  }


  /* =======================================================
     MATCHING COUNTDOWN
     
     The server provides matching_ready_at.
     The browser only displays the countdown.
     
     Client timer is NOT the authority.
  ======================================================= */

  function startMatchingCountdown(
    matchingReadyAt
  ) {

    stopMatchingCountdown();


    if (!matchingReadyAt) {

      console.warn(
        "[U9 Order Start] Missing matching_ready_at."
      );

      orderButton.textContent =
        "Matching...";

      return;
    }


    const readyTime =
      new Date(
        matchingReadyAt
      ).getTime();


    if (
      !Number.isFinite(
        readyTime
      )
    ) {

      console.warn(
        "[U9 Order Start] Invalid matching_ready_at:",
        matchingReadyAt
      );

      orderButton.textContent =
        "Matching...";

      return;
    }


    orderButton.disabled =
      true;


    function updateCountdown() {

      const now =
        Date.now();


      const remainingMs =
        readyTime - now;


      const remainingSeconds =
        Math.max(
          0,
          Math.ceil(
            remainingMs / 1000
          )
        );


      if (
        remainingSeconds > 0
      ) {

        orderButton.textContent =
          `Matching... ${remainingSeconds}s`;

        return;
      }


      /*
       * Matching time has reached
       * the server-provided ready time.
       *
       * IMPORTANT:
       * This does NOT mean the client
       * declares the order matched.
       *
       * The next server-side matching
       * step must verify the order.
       */

      stopMatchingCountdown();


      orderButton.textContent =
        "Matching...";


      console.log(
        "[U9 Order Start] Matching time reached:",
        matchingReadyAt
      );


      /*
       * Keep button disabled.
       *
       * Product matching / PENDING
       * is handled separately.
       */

      orderButton.disabled =
        true;
    }


    updateCountdown();


    matchingTimer =
      setInterval(
        updateCountdown,
        250
      );
  }


  /* =======================================================
     STOP MATCHING TIMER
  ======================================================= */

  function stopMatchingCountdown() {

    if (
      matchingTimer !== null
    ) {

      clearInterval(
        matchingTimer
      );

      matchingTimer =
        null;
    }
  }


  /* =======================================================
     SERVER ERROR HANDLER
  ======================================================= */

  function handleServerError(
    result
  ) {

    if (!result) {

      showError(
        "Server error. Please try again."
      );

      return;
    }


    const error =
      result.error || "";


    switch (error) {

      case "UNAUTHORIZED":

        /*
         * Session is invalid.
         */

        try {

          localStorage.removeItem(
            "u9_token"
          );

        } catch (e) {

          console.warn(
            "[U9 Order Start] Unable to remove token:",
            e
          );
        }


        showError(
          "Please login again."
        );

        break;


      case "INSUFFICIENT_COINS":

        showError(
          `You need at least ${formatNumber(
            result.required_coins
          )} coins to start an order.`
        );

        break;


      case "ORDER_ALREADY_ACTIVE":

        /*
         * Another request already
         * owns the user's active order.
         */

        if (
          result.order
        ) {

          window.U9CurrentOrder =
            result.order;


          /*
           * If the existing order is
           * MATCHING, restore its
           * countdown.
           */

          if (
            result.order.status ===
            "MATCHING"
          ) {

            orderButton.dataset.u9Matching =
              "true";

            orderButton.disabled =
              true;

            startMatchingCountdown(
              result.order.matching_ready_at
            );

          } else {

            orderButton.disabled =
              true;

            orderButton.textContent =
              "Order Pending";
          }
        }


        showError(
          "You already have an active order."
        );

        break;


      case "ROUND_COOLDOWN":

        showError(
          `Round cooldown: ${formatNumber(
            result.remaining_seconds || 0
          )}s remaining.`
        );

        break;


      case "ROUND_SETTINGS_NOT_FOUND":

        showError(
          "U9 round settings are unavailable."
        );

        break;


      case "ROUND_NOT_ACTIVE":

        showError(
          "Your round is not active."
        );

        break;


      default:

        console.error(
          "[U9 Order Start] Server error:",
          result
        );

        showError(
          result.message ||
          "Unable to start order."
        );

        break;
    }
  }


  /* =======================================================
     BUTTON LOADING
  ======================================================= */

  function setButtonLoading(
    loading
  ) {

    if (!orderButton) {
      return;
    }


    if (loading) {

      orderButton.disabled =
        true;

      orderButton.textContent =
        "Starting...";

      return;
    }


    /*
     * Only restore Order state
     * if we are not already matching.
     */

    if (
      orderButton.dataset.u9Matching
    ) {

      return;
    }


    orderButton.disabled =
      false;

    orderButton.textContent =
      "Order";
  }


  /* =======================================================
     ERROR DISPLAY
     
     Current page does not have a
     dedicated error element yet.
     
     For now:
     - console.error
     - alert
     
     This can later be replaced by
     the actual U9 UI notification.
  ======================================================= */

  function showError(
    message
  ) {

    console.error(
      "[U9 Order Start]",
      message
    );


    /*
     * Avoid alert spam while the user
     * is interacting with the auction.
     */

    if (
      typeof window.alert ===
      "function"
    ) {

      window.alert(
        message
      );
    }
  }


  /* =======================================================
     FORMAT NUMBER
  ======================================================= */

  function formatNumber(
    value
  ) {

    const number =
      Number(value);


    if (
      !Number.isFinite(
        number
      )
    ) {

      return "0";
    }


    return number.toLocaleString(
      "en-US",
      {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      }
    );
  }


  /* =======================================================
     PAGE READY
     
     Supports:
     - Script loaded before DOM
     - Script loaded after DOM
  ======================================================= */

  if (
    document.readyState ===
    "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      init,
      {
        once: true
      }
    );

  } else {

    init();
  }


  /* =======================================================
     PUBLIC API
     
     Useful for future U9 scripts.
  ======================================================= */

  window.U9OrderStart = {
    start: handleOrderClick,
    stopMatchingCountdown
  };

})();
