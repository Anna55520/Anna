
/* =========================
   U9 EXCHANGE MODAL
========================= */

(() => {
  "use strict";

  const modal = document.getElementById(
    "U9-exchange-modal"
  );

  const closeButton = document.getElementById(
    "U9-exchange-modal-close"
  );

  const overlay = document.getElementById(
    "U9-exchange-modal-overlay"
  );

  const form = document.getElementById(
    "U9-exchange-form"
  );

  const amountInput = document.getElementById(
    "U9-exchange-amount"
  );

  const amountLabel = document.getElementById(
    "U9-exchange-amount-label"
  );

  const availableLabel = document.getElementById(
    "U9-exchange-available"
  );

  const availableValue = document.getElementById(
    "U9-exchange-available-value"
  );

  const submitButton = document.getElementById(
    "U9-exchange-submit"
  );

  const directionButtons = document.querySelectorAll(
    ".U9-exchange-direction-button"
  );

  const message = document.getElementById(
    "U9-exchange-message"
  );

  const rateElement = document.getElementById(
    "U9-exchange-rate"
  );

  const feeRateElement = document.getElementById(
    "U9-exchange-fee-rate"
  );

  const grossElement = document.getElementById(
    "U9-exchange-gross"
  );

  const feeElement = document.getElementById(
    "U9-exchange-fee"
  );

  const netElement = document.getElementById(
    "U9-exchange-net"
  );

  const auctionToolButton = document.getElementById(
    "U9-auction-tool-2"
  );

  if (
    !modal ||
    !closeButton ||
    !overlay ||
    !form ||
    !amountInput ||
    !auctionToolButton
  ) {
    console.error(
      "U9 Exchange Modal: Required HTML elements are missing."
    );

    return;
  }

  let exchangeType = "balance_to_coins";

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
     RESET PREVIEW
  ========================= */

  function resetPreview() {
    grossElement.textContent = "—";
    feeElement.textContent = "—";
    netElement.textContent = "—";
  }

  /* =========================
     EXCHANGE DIRECTION
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
      const active =
        button.dataset.exchangeType === type;

      button.classList.toggle("active", active);
      button.setAttribute(
        "aria-pressed",
        String(active)
      );
    });

    if (type === "balance_to_coins") {
      amountLabel.textContent = "Balance Amount";
      availableLabel.firstChild.textContent =
        "Available Balance: ";
    } else {
      amountLabel.textContent = "Coins Amount";
      availableLabel.firstChild.textContent =
        "Available Coins: ";
    }

    amountInput.value = "";
    resetPreview();
    clearMessage();

    /*
      The actual rate, available balance,
      and fee will be loaded from the backend
      in the next integration step.
    */

    rateElement.textContent = "Loading...";
    feeRateElement.textContent = "Loading...";
    availableValue.textContent = "—";

    /*
      Keep disabled until the authenticated
      exchange API has been connected.
    */

    submitButton.disabled = true;
  }

  directionButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setExchangeType(
        button.dataset.exchangeType
      );
    });
  });

  /* =========================
     OPEN MODAL
  ========================= */

  function openExchangeModal() {
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");

    setExchangeType(exchangeType);

    requestAnimationFrame(() => {
      amountInput.focus({
        preventScroll: true
      });
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

  if (
    !window.U9WindowManager ||
    typeof window.U9WindowManager.register !== "function"
  ) {
    console.error(
      "U9 Exchange Modal: Window Manager is not available."
    );

    return;
  }

  const registered = window.U9WindowManager.register(
    "exchange-modal",
    {
      open: openExchangeModal,
      close: closeExchangeModal,
      isOpen: () => modal.classList.contains("is-open")
    }
  );

  if (!registered) {
    console.error(
      "U9 Exchange Modal: Registration failed."
    );

    return;
  }

  /* =========================
     TOOL BUTTON
  ========================= */

  auctionToolButton.addEventListener("click", async () => {
    await window.U9WindowManager.open(
      "exchange-modal"
    );
  });

  /* =========================
     CLOSE BUTTON
  ========================= */

  closeButton.addEventListener("click", async () => {
    await window.U9WindowManager.close(
      "exchange-modal"
    );
  });

  /* =========================
     OVERLAY CLICK
  ========================= */

  overlay.addEventListener("click", async () => {
    await window.U9WindowManager.close(
      "exchange-modal"
    );
  });

  /* =========================
     ESCAPE KEY
  ========================= */

  document.addEventListener("keydown", async (event) => {
    if (
      event.key === "Escape" &&
      window.U9WindowManager.isOpen("exchange-modal")
    ) {
      await window.U9WindowManager.close(
        "exchange-modal"
      );
    }
  });

  /* =========================
     AMOUNT INPUT
  ========================= */

  amountInput.addEventListener("input", () => {
    clearMessage();
    resetPreview();

    /*
      Do not calculate money locally yet.
      Preview calculations will use values
      returned by the backend configuration.
    */
  });

  /* =========================
     SUBMIT
  ========================= */

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    showMessage(
      "Exchange service is not connected yet."
    );
  });

  /* =========================
     INITIAL STATE
  ========================= */

  modal.setAttribute("aria-hidden", "true");

  setExchangeType("balance_to_coins");

  console.log(
    "U9 Exchange Modal initialized."
  );
})();
