```javascript
(() => {
  "use strict";

  /* =========================================================
     U9 ORDER API
  ========================================================= */

  const U9_ORDER_URL =
    "https://tvtakmswbzawaweytimx.supabase.co/functions/v1/u9-order";

  /* =========================================================
     STATE
  ========================================================= */

  let state = {
    user: null,
    settings: null,
    round: null,
    order: null,
    matchingTimer: null,
    cooldownTimer: null,
    busy: false,
  };

  /* =========================================================
     DOM
  ========================================================= */

  const $ = (selector) =>
    document.querySelector(selector);

  const orderButton =
    $("#U9-order-button");

  const roundProgress =
    $("#U9-round-progress");

  const coinsElement =
    $("#U9-coins");

  /*
    Optional elements.
    The JS will work even if some are not present.
  */

  const matchingElement =
    $("#U9-matching");

  const matchingTimeElement =
    $("#U9-matching-time");

  const orderElement =
    $("#U9-order");

  const orderImageElement =
    $("#U9-order-image");

  const orderNameElement =
    $("#U9-order-name");

  const orderPriceElement =
    $("#U9-order-price");

  const orderProfitElement =
    $("#U9-order-profit");

  const orderPaidElement =
    $("#U9-order-paid");

  const orderRemainingElement =
    $("#U9-order-remaining");

  const orderStatusElement =
    $("#U9-order-status");

  const payButton =
    $("#U9-pay-button");

  const completeButton =
    $("#U9-complete-button");

  const cooldownElement =
    $("#U9-cooldown");

  const cooldownTimeElement =
    $("#U9-cooldown-time");

  /* =========================================================
     HELPERS
  ========================================================= */

  function number(value) {
    const n =
      Number(value);

    return Number.isFinite(n)
      ? n
      : 0;
  }

  function money(value) {
    return number(value)
      .toFixed(2);
  }

  function escapeHtml(value) {
    return String(
      value ?? "",
    )
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function setText(
    element,
    value,
  ) {
    if (!element) return;

    element.textContent =
      value ?? "";
  }

  function show(
    element,
  ) {
    if (!element) return;

    element.hidden = false;
    element.style.display = "";
  }

  function hide(
    element,
  ) {
    if (!element) return;

    element.hidden = true;
  }

  function enable(
    element,
  ) {
    if (!element) return;

    element.disabled = false;
  }

  function disable(
    element,
  ) {
    if (!element) return;

    element.disabled = true;
  }

  /* =========================================================
     AUTH HEADERS
  ========================================================= */

  function getHeaders() {
    const headers = {
      "Content-Type":
        "application/json",
    };

    /*
      If another login system has placed
      an access token on window, use it.
    */

    const token =
      window.U9AccessToken ||
      window.accessToken ||
      window.authToken ||
      "";

    if (token) {
      headers.Authorization =
        `Bearer ${token}`;
    }

    return headers;
  }

  /* =========================================================
     API
  ========================================================= */

  async function api(
    method = "GET",
    body = null,
  ) {
    const options = {
      method,
      headers:
        getHeaders(),
      credentials:
        "include",
    };

    if (
      method !== "GET" &&
      body !== null
    ) {
      options.body =
        JSON.stringify(body);
    }

    const response =
      await fetch(
        U9_ORDER_URL,
        options,
      );

    let result = null;

    try {
      result =
        await response.json();
    } catch {
      result = {
        success: false,
        error:
          "INVALID_SERVER_RESPONSE",
      };
    }

    if (
      !response.ok ||
      result?.success === false
    ) {
      const error =
        result?.error ||
        `HTTP_${response.status}`;

      const err =
        new Error(error);

      err.status =
        response.status;

      err.result =
        result;

      throw err;
    }

    return result;
  }

  /* =========================================================
     CLEAR TIMERS
  ========================================================= */

  function clearMatchingTimer() {
    if (
      state.matchingTimer
    ) {
      clearInterval(
        state.matchingTimer,
      );

      state.matchingTimer =
        null;
    }
  }

  function clearCooldownTimer() {
    if (
      state.cooldownTimer
    ) {
      clearInterval(
        state.cooldownTimer,
      );

      state.cooldownTimer =
        null;
    }
  }

  /* =========================================================
     USER
  ========================================================= */

  function renderUser(
    user,
  ) {
    if (!user) return;

    state.user =
      user;

    setText(
      coinsElement,
      money(user.coins),
    );

    window.U9RoundUser =
      user;
  }

  /* =========================================================
     ROUND
  ========================================================= */

  function renderRound(
    round,
  ) {
    state.round =
      round || null;

    window.U9CurrentRound =
      round || null;

    if (!round) {
      setText(
        roundProgress,
        "0/0",
      );

      return;
    }

    const completed =
      number(
        round.completed_orders,
      );

    const target =
      number(
        round.target_orders,
      );

    setText(
      roundProgress,
      `${completed}/${target}`,
    );

    if (
      round.status ===
      "COOLDOWN"
    ) {
      startCooldownCountdown(
        round.cooldown_until,
      );
    } else {
      clearCooldownTimer();
      hide(cooldownElement);
    }
  }

  /* =========================================================
     ORDER
  ========================================================= */

  function renderOrder(
    order,
  ) {
    state.order =
      order || null;

    window.U9CurrentOrder =
      order || null;

    if (!order) {
      hide(orderElement);
      hide(matchingElement);

      clearMatchingTimer();

      if (
        orderButton
      ) {
        enable(orderButton);
        orderButton.textContent =
          "Start Order";
      }

      return;
    }

    show(orderElement);

    setText(
      orderStatusElement,
      order.status,
    );

    setText(
      orderNameElement,
      order.product_name ||
        "",
    );

    setText(
      orderPriceElement,
      order.product_price != null
        ? money(
            order.product_price,
          )
        : "",
    );

    setText(
      orderProfitElement,
      order.profit != null
        ? money(
            order.profit,
          )
        : "",
    );

    setText(
      orderPaidElement,
      money(
        order.paid_amount,
      ),
    );

    setText(
      orderRemainingElement,
      money(
        order.remaining_amount,
      ),
    );

    if (
      orderImageElement
    ) {
      if (
        order.image_url
      ) {
        orderImageElement.src =
          order.image_url;

        show(
          orderImageElement,
        );
      } else {
        hide(
          orderImageElement,
        );
      }
    }

    if (
      order.status ===
      "MATCHING"
    ) {
      show(matchingElement);

      disable(orderButton);

      setText(
        orderButton,
        "Matching...",
      );

      startMatchingCountdown(
        order.matching_ready_at,
      );

      hide(payButton);
      hide(completeButton);

      return;
    }

    clearMatchingTimer();
    hide(matchingElement);

    if (
      order.status ===
      "PENDING"
    ) {
      disable(orderButton);

      setText(
        orderButton,
        "Order Pending",
      );

      const remaining =
        number(
          order.remaining_amount,
        );

      if (
        remaining > 0
      ) {
        show(payButton);
        disable(completeButton);
      } else {
        hide(payButton);
        show(completeButton);
        enable(completeButton);
      }

      return;
    }

    if (
      order.status ===
      "COMPLETED"
    ) {
      clearMatchingTimer();

      hide(payButton);
      hide(completeButton);

      enable(orderButton);

      setText(
        orderButton,
        "Start Order",
      );

      return;
    }
  }

  /* =========================================================
     MATCHING COUNTDOWN
  ========================================================= */

  function startMatchingCountdown(
    readyAt,
  ) {
    clearMatchingTimer();

    if (!readyAt) {
      return;
    }

    const target =
      new Date(
        readyAt,
      ).getTime();

    const update =
      async () => {
        const remainingMs =
          target -
          Date.now();

        const seconds =
          Math.max(
            0,
            Math.ceil(
              remainingMs /
                1000,
            ),
          );

        setText(
          matchingTimeElement,
          String(seconds),
        );

        if (
          seconds <= 0
        ) {
          clearMatchingTimer();

          setText(
            matchingTimeElement,
            "0",
          );

          /*
            Server decides whether
            matching is actually ready.
          */

          await matchOrder();
        }
      };

    update();

    state.matchingTimer =
      setInterval(
        update,
        1000,
      );
  }

  /* =========================================================
     MATCH ORDER
  ========================================================= */

  async function matchOrder() {
    if (
      state.busy
    ) {
      return;
    }

    state.busy =
      true;

    try {
      const result =
        await api(
          "POST",
          {
            action:
              "match",
          },
        );

      renderUser(
        result.user,
      );

      renderRound(
        result.round,
      );

      renderOrder(
        result.order,
      );

      console.log(
        "[U9] Matched Order:",
        result.order,
      );
    } catch (
      error
    ) {
      /*
        If the server says it is
        not ready yet, reload state.
      */

      if (
        error.message ===
        "ORDER_NOT_FOUND"
      ) {
        await loadStatus();
      } else {
        handleError(
          error,
        );
      }
    } finally {
      state.busy =
        false;
    }
  }

  /* =========================================================
     LOAD STATUS
  ========================================================= */

  async function loadStatus() {
    try {
      const result =
        await api(
          "GET",
        );

      renderUser(
        result.user,
      );

      renderRound(
        result.round,
      );

      renderOrder(
        result.order,
      );

      window.U9RoundSettings =
        result.settings;

      return result;
    } catch (
      error
    ) {
      handleError(
        error,
      );

      return null;
    }
  }

  /* =========================================================
     START ORDER
  ========================================================= */

  async function startOrder() {
    if (
      state.busy
    ) {
      return;
    }

    state.busy =
      true;

    disable(
      orderButton,
    );

    setText(
      orderButton,
      "Starting...",
    );

    try {
      const result =
        await api(
          "POST",
          {
            action:
              "start",
          },
        );

      renderUser(
        result.user,
      );

      renderRound(
        result.round,
      );

      renderOrder(
        result.order,
      );

      console.log(
        "[U9] Order Started:",
        result.order,
      );
    } catch (
      error
    ) {
      handleError(
        error,
      );

      enable(
        orderButton,
      );

      setText(
        orderButton,
        "Start Order",
      );
    } finally {
      state.busy =
        false;
    }
  }

  /* =========================================================
     PAY REMAINING
  ========================================================= */

  async function payRemaining() {
    if (
      state.busy
    ) {
      return;
    }

    state.busy =
      true;

    disable(
      payButton,
    );

    setText(
      payButton,
      "Processing...",
    );

    try {
      const result =
        await api(
          "POST",
          {
            action:
              "pay",
          },
        );

      renderUser(
        result.user,
      );

      renderRound(
        result.round,
      );

      renderOrder(
        result.order,
      );

      console.log(
        "[U9] Remaining Payment:",
        result.order,
      );
    } catch (
      error
    ) {
      handleError(
        error,
      );

      if (
        payButton
      ) {
        enable(
          payButton,
        );

        setText(
          payButton,
          "Pay Remaining",
        );
      }
    } finally {
      state.busy =
        false;
    }
  }

  /* =========================================================
     COMPLETE
  ========================================================= */

  async function completeOrder() {
    if (
      state.busy
    ) {
      return;
    }

    state.busy =
      true;

    disable(
      completeButton,
    );

    setText(
      completeButton,
      "Completing...",
    );

    try {
      const result =
        await api(
          "POST",
          {
            action:
              "complete",
          },
        );

      renderUser(
        result.user,
      );

      renderRound(
        result.round,
      );

      renderOrder(
        result.order,
      );

      console.log(
        "[U9] Order Completed:",
        result.order,
      );

      /*
        Reload once so the
        latest round state is authoritative.
      */

      await loadStatus();
    } catch (
      error
    ) {
      handleError(
        error,
      );

      if (
        completeButton
      ) {
        enable(
          completeButton,
        );

        setText(
          completeButton,
          "Complete Order",
        );
      }
    } finally {
      state.busy =
        false;
    }
  }

  /* =========================================================
     COOLDOWN COUNTDOWN
  ========================================================= */

  function startCooldownCountdown(
    cooldownUntil,
  ) {
    clearCooldownTimer();

    if (
      !cooldownUntil
    ) {
      hide(
        cooldownElement,
      );

      return;
    }

    show(
      cooldownElement,
    );

    const target =
      new Date(
        cooldownUntil,
      ).getTime();

    const update =
      async () => {
        const remainingMs =
          target -
          Date.now();

        const seconds =
          Math.max(
            0,
            Math.ceil(
              remainingMs /
                1000,
            ),
          );

        setText(
          cooldownTimeElement,
          formatSeconds(
            seconds,
          ),
        );

        if (
          seconds <= 0
        ) {
          clearCooldownTimer();

          hide(
            cooldownElement,
          );

          await loadStatus();
        }
      };

    update();

    state.cooldownTimer =
      setInterval(
        update,
        1000,
      );

    disable(
      orderButton,
    );

    setText(
      orderButton,
      "Cooldown...",
    );
  }

  /* =========================================================
     FORMAT TIME
  ========================================================= */

  function formatSeconds(
    seconds,
  ) {
    const total =
      Math.max(
        0,
        Math.floor(
          seconds,
        ),
      );

    const minutes =
      Math.floor(
        total / 60,
      );

    const secs =
      total % 60;

    if (
      minutes <= 0
    ) {
      return `${secs}s`;
    }

    return `${minutes}m ${secs}s`;
  }

  /* =========================================================
     ERROR HANDLING
  ========================================================= */

  function handleError(
    error,
  ) {
    const code =
      error?.message ||
      "UNKNOWN_ERROR";

    console.error(
      "[U9] Error:",
      code,
      error,
    );

    switch (
      code
    ) {
      case "UNAUTHORIZED":
        setText(
          orderButton,
          "Login Required",
        );
        disable(
          orderButton,
        );
        break;

      case "INSUFFICIENT_START_COINS":
        setText(
          orderButton,
          "Insufficient Coins",
        );
        enable(
          orderButton,
        );
        break;

      case "ORDER_ALREADY_ACTIVE":
        setText(
          orderButton,
          "Order Active",
        );
        disable(
          orderButton,
        );
        loadStatus();
        break;

      case "ROUND_COOLDOWN":
        disable(
          orderButton,
        );
        setText(
          orderButton,
          "Cooldown...",
        );
        loadStatus();
        break;

      case "INSUFFICIENT_COINS":
        setText(
          payButton,
          "Insufficient Coins",
        );
        enable(
          payButton,
        );
        break;

      case "ORDER_PAYMENT_REQUIRED":
        show(
          payButton,
        );
        disable(
          completeButton,
        );
        break;

      case "NO_PRODUCTS":
        setText(
          orderStatusElement,
          "No Product Available",
        );
        break;

      case "U9_DISABLED":
        disable(
          orderButton,
        );
        setText(
          orderButton,
          "Unavailable",
        );
        break;

      default:
        /*
          Keep UI usable for
          recoverable errors.
        */

        if (
          orderButton &&
          !state.order
        ) {
          enable(
            orderButton,
          );

          setText(
            orderButton,
            "Start Order",
          );
        }

        break;
    }
  }

  /* =========================================================
     EVENTS
  ========================================================= */

  function bindEvents() {
    if (
      orderButton
    ) {
      orderButton.addEventListener(
        "click",
        (event) => {
          event.preventDefault();

          startOrder();
        },
      );
    }

    if (
      payButton
    ) {
      payButton.addEventListener(
        "click",
        (event) => {
          event.preventDefault();

          payRemaining();
        },
      );
    }

    if (
      completeButton
    ) {
      completeButton.addEventListener(
        "click",
        (event) => {
          event.preventDefault();

          completeOrder();
        },
      );
    }
  }

  /* =========================================================
     PUBLIC API
  ========================================================= */

  window.U9Order = {
    start:
      startOrder,

    match:
      matchOrder,

    pay:
      payRemaining,

    complete:
      completeOrder,

    refresh:
      loadStatus,

    getState:
      () => ({
        ...state,
      }),
  };

  /* =========================================================
     INIT
  ========================================================= */

  async function init() {
    bindEvents();

    await loadStatus();
  }

  if (
    document.readyState ===
    "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      init,
      {
        once: true,
      },
    );
  } else {
    init();
  }
})();
```
