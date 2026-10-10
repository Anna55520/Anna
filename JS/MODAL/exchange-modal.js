
/* =========================
   U9 EXCHANGE MODAL
========================= */

(() => {
  "use strict";

  const API_URL =
    "https://tvtakmswbzawaweytimx.supabase.co/functions/v1/u9-exchange";

  const modal = document.getElementById("U9-exchange-modal");
  const closeButton = document.getElementById("U9-exchange-modal-close");
  const form = document.getElementById("U9-exchange-form");
  const amountInput = document.getElementById("U9-exchange-amount");
  const amountLabel = document.getElementById("U9-exchange-amount-label");
  const availableLabel = document.getElementById("U9-exchange-available");
  const availableValue = document.getElementById("U9-exchange-available-value");
  const submitButton = document.getElementById("U9-exchange-submit");
  const directionButtons = document.querySelectorAll(".U9-exchange-direction-button");
  const message = document.getElementById("U9-exchange-message");
  const rateElement = document.getElementById("U9-exchange-rate");
  const feeRateElement = document.getElementById("U9-exchange-fee-rate");
  const grossElement = document.getElementById("U9-exchange-gross");
  const feeElement = document.getElementById("U9-exchange-fee");
  const netElement = document.getElementById("U9-exchange-net");
  const auctionToolButton = document.getElementById("U9-auction-tool-2");

  const body = document.getElementById("U9-exchange-modal-body");

  if (
    !modal ||
    !closeButton ||
    !form ||
    !amountInput ||
    !amountLabel ||
    !availableLabel ||
    !availableValue ||
    !submitButton ||
    !message ||
    !rateElement ||
    !feeRateElement ||
    !grossElement ||
    !feeElement ||
    !netElement ||
    !auctionToolButton ||
    !window.U9WindowManager
  ) {
    console.error("U9 Exchange Modal: Required elements are missing.");
    return;
  }

  let exchangeType = "balance_to_coins";
  let exchangeConfig = null;
  let balances = null;
  let isSubmitting = false;
  let isLoadingInfo = false;

  /* =========================
     FORMAT NUMBERS
  ========================= */

  function formatNumber(value) {
    const number = Number(value);

    if (!Number.isFinite(number)) {
      return "—";
    }

    return number.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 6
    });
  }


  function updateAuctionCoins(coins) {
    const coinsElement = document.getElementById("U9-auction-coins");

    if (!coinsElement) {
      console.warn("U9 Exchange: #U9-auction-coins not found.");
      return;
    }

    const value = Number(coins);

    if (!Number.isFinite(value)) {
      return;
    }

    coinsElement.textContent = value.toFixed(2);

    // 同步更新 AUCTION 页面内部的 Coins 状态
    if (
      window.U9Auction &&
      typeof window.U9Auction.updateCoins === "function"
    ) {
      window.U9Auction.updateCoins(value);
    }
  }

  function getToken() {
    try {
      return localStorage.getItem("u9_token");
    } catch (error) {
      console.error("U9 Exchange: Unable to read login token.", error);
      return null;
    }
  }

  /* =========================
     API REQUEST
  ========================= */

  async function apiRequest(payload) {
    const token = getToken();

    if (!token) {
      throw new Error("Please log in first.");
    }

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok || result.success !== true) {
      throw new Error(
        result.message ||
        `Exchange request failed (${response.status}).`
      );
    }

    return result;
  }

  /* =========================
     MESSAGE
  ========================= */

  function showMessage(text, type = "error") {
    message.textContent = text;
    message.className =
      "is-visible " +
      (type === "success" ? "is-success" : "is-error");
  }

  function clearMessage() {
    message.textContent = "";
    message.className = "";
  }

  /* =========================
     PREVIEW
  ========================= */

  function resetPreview() {
    grossElement.textContent = "—";
    feeElement.textContent = "—";
    netElement.textContent = "—";
  }

  function getAvailableAmount() {
    if (!balances) {
      return 0;
    }

    return exchangeType === "balance_to_coins"
      ? Number(balances.balance)
      : Number(balances.coins);
  }

  function renderConfig() {
    if (!exchangeConfig) {
      rateElement.textContent = "Loading...";
      feeRateElement.textContent = "Loading...";
      return;
    }

    if (exchangeType === "balance_to_coins") {
      rateElement.textContent =
        `1 Balance = ${formatNumber(
          exchangeConfig.balance_to_coins_rate
        )} Coins`;
    } else {
      rateElement.textContent =
        `${formatNumber(
          exchangeConfig.coins_to_balance_rate
        )} Coins = 1 Balance`;
    }

    feeRateElement.textContent =
      `${formatNumber(
        Number(exchangeConfig.exchange_fee_rate) * 100
      )}%`;

    if (!exchangeConfig.enabled) {
      showMessage("Exchange is currently disabled.");
    }
  }

  function renderAvailableAmount() {
    const label = exchangeType === "balance_to_coins"
      ? "Available Balance: "
      : "Available Coins: ";

    availableLabel.firstChild.textContent = label;

    if (!balances) {
      availableValue.textContent = "—";
      return;
    }

    availableValue.textContent =
      formatNumber(getAvailableAmount());
  }

  function updateSubmitState() {
    const amount = Number(amountInput.value);
    const available = getAvailableAmount();

    const validAmount =
      amountInput.value.trim() !== "" &&
      Number.isFinite(amount) &&
      amount > 0 &&
      amount <= available &&
      /^\d+(\.\d{1,6})?$/.test(amountInput.value.trim());

    submitButton.disabled =
      isSubmitting ||
      isLoadingInfo ||
      !exchangeConfig ||
      !balances ||
      exchangeConfig.enabled !== true ||
      !validAmount;
  }

  function updatePreview() {
    const rawAmount = amountInput.value.trim();
    const amount = Number(rawAmount);

    resetPreview();

    if (
      !exchangeConfig ||
      !rawAmount ||
      !Number.isFinite(amount) ||
      amount <= 0 ||
      !/^\d+(\.\d{1,6})?$/.test(rawAmount)
    ) {
      updateSubmitState();
      return;
    }

    const rate = exchangeType === "balance_to_coins"
      ? Number(exchangeConfig.balance_to_coins_rate)
      : Number(exchangeConfig.coins_to_balance_rate);

    const feeRate = Number(exchangeConfig.exchange_fee_rate);

    const gross = exchangeType === "balance_to_coins"
      ? amount * rate
      : amount / rate;

    const fee = gross * feeRate;
    const net = gross - fee;

    grossElement.textContent = formatNumber(gross);
    feeElement.textContent = formatNumber(fee);
    netElement.textContent = formatNumber(net);

    updateSubmitState();
  }

  /* =========================
     LOAD CONFIG AND BALANCES
  ========================= */

  async function loadExchangeInfo() {
    isLoadingInfo = true;
    updateSubmitState();

    rateElement.textContent = "Loading...";
    feeRateElement.textContent = "Loading...";
    availableValue.textContent = "—";

    try {
      const result = await apiRequest({
        action: "info"
      });

      exchangeConfig = result.config;
      balances = result.balances;

      renderConfig();
      renderAvailableAmount();
      updatePreview();

      return true;
    } catch (error) {
      exchangeConfig = null;
      balances = null;

      rateElement.textContent = "Unavailable";
      feeRateElement.textContent = "Unavailable";
      availableValue.textContent = "—";

      resetPreview();

      showMessage(
        error.message || "Unable to load exchange information."
      );

      console.error("U9 Exchange: Failed to load information.", error);

      return false;
    } finally {
      isLoadingInfo = false;
      updateSubmitState();
    }
  }

  /* =========================
     CHANGE EXCHANGE DIRECTION
  ========================= */

  function setExchangeType(type) {
    if (
      type !== "balance_to_coins" &&
      type !== "coins_to_balance"
    ) {
      return;
    }

    exchangeType = type;

    directionButtons.forEach((button) => {
      const active = button.dataset.exchangeType === type;

      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });

    amountLabel.textContent =
      type === "balance_to_coins"
        ? "Balance Amount"
        : "Coins Amount";

    amountInput.value = "";

    clearMessage();
    resetPreview();
    renderConfig();
    renderAvailableAmount();
    updatePreview();
  }

  directionButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setExchangeType(button.dataset.exchangeType);
    });
  });

  /* =========================
     OPEN MODAL
  ========================= */


  function openExchangeModal() {
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");

    if (body) {
      body.scrollTop = 0;
    }

    clearMessage();
    setExchangeType(exchangeType);

    // 先显示窗口，再在后台加载兑换信息
    void loadExchangeInfo();

    requestAnimationFrame(() => {
      if (modal.classList.contains("is-open")) {
        amountInput.focus({ preventScroll: true });
      }
    });
  }

  /* =========================
     CLOSE MODAL
  ========================= */

  function closeExchangeModal() {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
  }

  /* =========================
     REGISTER WINDOW
  ========================= */

  const registered = window.U9WindowManager.register(
    "exchange-modal",
    {
      open: openExchangeModal,
      close: closeExchangeModal,
      isOpen: () => modal.classList.contains("is-open")
    }
  );

  if (!registered) {
    console.error("U9 Exchange Modal: Registration failed.");
    return;
  }

  /* =========================
     OPEN FROM AUCTION TOOL
  ========================= */

  auctionToolButton.addEventListener("click", async () => {
    try {
      await window.U9WindowManager.open("exchange-modal");
    } catch (error) {
      console.error("U9 Exchange: Failed to open modal.", error);
    }
  });

  /* =========================
     CLOSE BUTTON
  ========================= */

  closeButton.addEventListener("click", async (event) => {
    event.preventDefault();
    event.stopPropagation();

    try {
      await window.U9WindowManager.close("exchange-modal");
    } catch (error) {
      console.error("U9 Exchange: Failed to close modal.", error);
    }
  });

  /* =========================
     OVERLAY
     Intentionally does not close the modal.
  ========================= */

  /* No overlay click listener. */

  /* =========================
     ESCAPE KEY
  ========================= */

  document.addEventListener("keydown", async (event) => {
    if (
      event.key !== "Escape" ||
      !modal.classList.contains("is-open")
    ) {
      return;
    }

    event.preventDefault();

    try {
      await window.U9WindowManager.close("exchange-modal");
    } catch (error) {
      console.error("U9 Exchange: Failed to close with Escape.", error);
    }
  });

  /* =========================
     AMOUNT INPUT
  ========================= */

  amountInput.addEventListener("input", () => {
    clearMessage();
    updatePreview();
  });

  /* =========================
     SUBMIT EXCHANGE
  ========================= */

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const amountText = amountInput.value.trim();
    const amount = Number(amountText);

    if (
      !amountText ||
      !Number.isFinite(amount) ||
      amount <= 0 ||
      !/^\d+(\.\d{1,6})?$/.test(amountText)
    ) {
      showMessage("Enter a valid amount with up to 6 decimal places.");
      return;
    }

    if (amount > getAvailableAmount()) {
      showMessage("Insufficient balance for this exchange.");
      updateSubmitState();
      return;
    }

    if (!exchangeConfig || !exchangeConfig.enabled) {
      showMessage("Exchange is currently unavailable.");
      return;
    }

    isSubmitting = true;
    submitButton.textContent = "Processing...";
    updateSubmitState();
    clearMessage();

    try {
      const result = await apiRequest({
        action: "exchange",
        exchange_type: exchangeType,
        amount,
        request_id: crypto.randomUUID()
      });

      const row = result.result;

      if (row) {
        balances = {
          balance: Number(row.balance_after),
          coins: Number(row.coins_after)
        };

        renderAvailableAmount();

        // 立即同步 AUCTION 页面 Coins
        updateAuctionCoins(balances.coins);
      }

      amountInput.value = "";
      resetPreview();

      showMessage(
        `Exchange successful. Balance: ${formatNumber(
          balances.balance
        )} | Coins: ${formatNumber(balances.coins)}`,
        "success"
      );

      /*
       * Reload authoritative balances and configuration.
       * Keep the success message visible.
       */
      await loadExchangeInfo();

      showMessage(
        `Exchange successful. Balance: ${formatNumber(
          balances.balance
        )} | Coins: ${formatNumber(balances.coins)}`,
        "success"
      );
    } catch (error) {
      showMessage(
        error.message || "Exchange failed. Please try again."
      );

      console.error("U9 Exchange: Transaction failed.", error);

      /*
       * Refresh balances in case the server completed the
       * transaction but the response was interrupted.
       */
      await loadExchangeInfo();
    } finally {
      isSubmitting = false;
      submitButton.textContent = "Exchange";
      updateSubmitState();
    }
  });

  /* =========================
     INITIAL STATE
  ========================= */

  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");

  setExchangeType("balance_to_coins");

  console.log("U9 Exchange Modal initialized.");
})();
