
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
    !auctionToolButton
  ) {
    console.error(
      "U9 Exchange Modal: Required HTML elements are missing."
    );

    return;
  }

  if (
    !window.U9WindowManager ||
    typeof window.U9WindowManager.register !== "function"
  ) {
    console.error(
      "U9 Exchange Modal: Window Manager is not available."
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
      Backend configuration is not connected yet.
    */

    rateElement.textContent = "Loading...";
    feeRateElement.textContent = "Loading...";
    availableValue.textContent = "—";

    /*
      Keep exchange disabled until the authenticated
      backend API has been connected.
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

    const body = document.getElementById(
      "U9-exchange-modal-body"
    );

    if (body) {
      body.scrollTop = 0;
    }

    setExchangeType(exchangeType);

    requestAnimationFrame(() => {
      if (
        modal.classList.contains("is-open") &&
        amountInput
      ) {
        amountInput.focus({
          preventScroll: true
        });
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

      isOpen: () =>
        modal.classList.contains("is-open")
    }
  );

  if (!registered) {
    console.error(
      "U9 Exchange Modal: Registration failed."
    );

    return;
  }

  /* =========================
     OPEN FROM AUCTION TOOL
  ========================= */

  auctionToolButton.addEventListener(
    "click",
    async () => {
      try {
        await window.U9WindowManager.open(
          "exchange-modal"
        );
      } catch (error) {
        console.error(
          "U9 Exchange Modal: Failed to open.",
          error
        );
      }
    }
  );

  /* =========================
     CLOSE BUTTON ONLY
  ========================= */

  closeButton.addEventListener(
    "click",
    async (event) => {
      event.preventDefault();
      event.stopPropagation();

      try {
        await window.U9WindowManager.close(
          "exchange-modal"
        );
      } catch (error) {
        console.error(
          "U9 Exchange Modal: Failed to close.",
          error
        );
      }
    }
  );

  /* =========================
     OVERLAY
     Intentionally has NO click-to-close handler.
  ========================= */

  /* Do not add an overlay click listener here. */

  /* =========================
     ESCAPE KEY
  ========================= */

  document.addEventListener(
    "keydown",
    async (event) => {
      if (
        event.key !== "Escape" ||
        !modal.classList.contains("is-open")
      ) {
        return;
      }

      event.preventDefault();

      try {
        await window.U9WindowManager.close(
          "exchange-modal"
        );
      } catch (error) {
        console.error(
          "U9 Exchange Modal: Failed to close with Escape.",
          error
        );
      }
    }
  );

  /* =========================
     AMOUNT INPUT
  ========================= */

  amountInput.addEventListener("input", () => {
    clearMessage();
    resetPreview();

    /*
      Preview calculations will be added when
      backend configuration is connected.
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

  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");

  setExchangeType("balance_to_coins");

  console.log(
    "U9 Exchange Modal initialized."
  );
})();
