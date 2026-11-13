
/* =================================================
   U9 PROFILE PAGE 2 — WITHDRAWAL
================================================= */

(function () {

  "use strict";


  /* =========================
     PREVENT DUPLICATE INIT
  ========================= */

  if (window.U9ProfileWithdrawal) {
    return;
  }


  /* =========================
     ELEMENTS
  ========================= */

  const navigation = document.getElementById(
    "U9-profile-withdrawal-navigation"
  );

  const balanceElement = document.getElementById(
    "U9-profile-withdrawal-balance-value"
  );

  const verifiedButton = document.getElementById(
    "U9-profile-withdrawal-verified-button"
  );

  const verifiedIcon = document.getElementById(
    "U9-profile-withdrawal-verified-icon"
  );

  const noticeButton = document.getElementById(
    "U9-profile-withdrawal-notice-button"
  );

  const noticeIcon = document.getElementById(
    "U9-profile-withdrawal-notice-icon"
  );


  /* =========================
     CATEGORIES
  ========================= */

  const categories = [
    "crypto",
    "epayment",
    "bank",
    "card"
  ];

  let currentCategory = "crypto";


  /* =========================
     GET BUTTON
  ========================= */

  function getButton(category) {

    if (!navigation) return null;

    return navigation.querySelector(
      `[data-category="${category}"]`
    );

  }


  /* =========================
     SWITCH CATEGORY
  ========================= */

  function switchCategory(category) {

    if (!categories.includes(category)) return;
    if (!navigation) return;

    categories.forEach(function (item) {

      const button = getButton(item);

      if (!button) return;

      const isActive = item === category;

      button.classList.toggle("active", isActive);

      button.setAttribute(
        "aria-selected",
        String(isActive)
      );

      button.tabIndex = isActive ? 0 : -1;

    });

    currentCategory = category;

    const cryptoPanel = document.getElementById(
      "U9-withdrawal-crypto-panel"
    );

    if (cryptoPanel) {
      cryptoPanel.hidden = category !== "crypto";
    }

  }


  /* =========================
     NAVIGATION CLICK
  ========================= */

  if (navigation) {

    navigation.addEventListener("click", function (event) {

      const button = event.target.closest(
        ".U9-profile-withdrawal-nav-button"
      );

      if (!button || !navigation.contains(button)) return;

      switchCategory(button.dataset.category);

    });


    /* =========================
       KEYBOARD NAVIGATION
    ========================= */

    navigation.addEventListener("keydown", function (event) {

      const button = event.target.closest(
        ".U9-profile-withdrawal-nav-button"
      );

      if (!button) return;

      const index = categories.indexOf(
        button.dataset.category
      );

      if (index === -1) return;

      let nextIndex;

      if (event.key === "ArrowRight") {

        nextIndex = (index + 1) % categories.length;

      } else if (event.key === "ArrowLeft") {

        nextIndex =
          (index - 1 + categories.length) % categories.length;

      } else {

        return;

      }

      event.preventDefault();

      const nextCategory = categories[nextIndex];

      switchCategory(nextCategory);

      getButton(nextCategory)?.focus();

    });


    // INITIALIZE
    switchCategory("crypto");

  } else {

    console.warn(
      "U9 Profile Withdrawal Navigation not found."
    );

  }


  /* =================================================
     WITHDRAWAL BUTTON INITIALIZATION
  ================================================= */

  function initializeButton(button, icon, name) {

    if (!button) {

      console.warn(
        "U9 Withdrawal button not found:",
        name
      );

      return;

    }

    button.type = "button";

    if (icon && !button.contains(icon)) {

      console.warn(
        "U9 Withdrawal icon is outside its button:",
        name
      );

    }

  }

  initializeButton(
    verifiedButton,
    verifiedIcon,
    "verified"
  );

  initializeButton(
    noticeButton,
    noticeIcon,
    "notice"
  );


  /* =================================================
     USER BALANCE
  ================================================= */

  function setBalance(balance) {

    if (!balanceElement) return;

    const amount = Number(balance);

    if (!Number.isFinite(amount)) {

      console.warn(
        "Invalid withdrawal balance:",
        balance
      );

      return;

    }

    balanceElement.textContent = amount.toFixed(2);

    const availableBalance = document.getElementById(
      "U9-withdrawal-available-balance"
    );

    if (availableBalance) {
      availableBalance.textContent = amount.toFixed(2);
    }

    const amountInput = document.getElementById(
      "U9-withdrawal-crypto-amount"
    );

    if (amountInput) {
      amountInput.max = String(amount);
    }

  }


  /* =================================================
     EMAIL VERIFIED STATUS
  ================================================= */

  function setEmailVerified(verified) {

    if (!verifiedIcon) return;

    if (typeof verified !== "boolean") {

      console.warn(
        "Invalid email_verified value:",
        verified
      );

      return;

    }

    if (verified) {

      verifiedIcon.src = "/SSVG/Withdraw/verified.svg";
      verifiedIcon.alt = "Verified";

    } else {

      verifiedIcon.src = "/SSVG/Withdraw/unverified.svg";
      verifiedIcon.alt = "Unverified";

    }

    verifiedButton?.setAttribute(
      "aria-label",
      verified ? "Email verified" : "Email unverified"
    );

  }


  /* =================================================
     UPDATE USER INFO
  ================================================= */

  function updateUserInfo(user) {

    if (!user || typeof user !== "object") {

      console.warn(
        "Invalid withdrawal user data."
      );

      return;

    }

    if (user.balance !== undefined) {

      setBalance(user.balance);

    }

    if (user.email_verified !== undefined) {

      setEmailVerified(user.email_verified);

    }

  }


  /* =================================================
     HEADER USER SYNC
  ================================================= */

  let unsubscribeUser = null;


  /* =========================
     APPLY HEADER USER
  ========================= */

  function applyHeaderUser(user) {

    if (!user || typeof user !== "object") {
      return;
    }

    updateUserInfo({

      balance: user.balance,

      email_verified: user.email_verified

    });

  }


  /* =========================
     CONNECT HEADER USER
  ========================= */

  function connectHeaderUser() {

    if (!window.U9User) {
      return false;
    }

    // Prevent duplicate subscriptions
    if (unsubscribeUser) {
      return true;
    }


    /* =========================
       SUBSCRIBE USER CHANGES
    ========================= */

    unsubscribeUser = window.U9User.subscribe(

      function (user, state) {

        if (
          state === "AUTHENTICATED" &&
          user
        ) {

          applyHeaderUser(user);

        }

      }

    );


    /* =========================
       APPLY CURRENT USER
    ========================= */

    if (
      window.U9User.getState() ===
      "AUTHENTICATED"
    ) {

      applyHeaderUser(
        window.U9User.get()
      );

    }

    return true;

  }


  /* =================================================
     HEADER READY LISTENER
  ================================================= */

  if (!connectHeaderUser()) {

    window.addEventListener(
      "u9:user-ready",
      connectHeaderUser,
      { once: true }
    );

  }


  /* =================================================
     CRYPTO WITHDRAWAL FORM — FRONTEND ONLY
  ================================================= */

  const cryptoForm = document.getElementById(
    "U9-withdrawal-crypto-form"
  );

  const cryptoAmountInput = document.getElementById(
    "U9-withdrawal-crypto-amount"
  );

  const cryptoAddressInput = document.getElementById(
    "U9-withdrawal-crypto-address"
  );

  const cryptoNetworkInput = document.getElementById(
    "U9-withdrawal-crypto-network"
  );

  const cryptoMessage = document.getElementById(
    "U9-withdrawal-crypto-message"
  );

  const useMaxButton = document.getElementById(
    "U9-withdrawal-use-max"
  );

  function getAvailableBalance() {
    const value = Number(balanceElement?.textContent || 0);
    return Number.isFinite(value) && value > 0 ? value : 0;
  }

  function showCryptoMessage(message, type) {
    if (!cryptoMessage) return;

    cryptoMessage.textContent = message;
    cryptoMessage.className =
      "U9-withdrawal-message is-" + type;
  }

  function clearCryptoMessage() {
    if (!cryptoMessage) return;

    cryptoMessage.textContent = "";
    cryptoMessage.className = "U9-withdrawal-message";
  }

  if (useMaxButton && cryptoAmountInput) {
    useMaxButton.addEventListener("click", function () {
      const balance = getAvailableBalance();
      cryptoAmountInput.value = balance > 0 ? balance.toFixed(2) : "";
      clearCryptoMessage();
    });
  }

  if (cryptoAmountInput) {
    cryptoAmountInput.addEventListener("input", clearCryptoMessage);
  }

  if (cryptoAddressInput) {
    cryptoAddressInput.addEventListener("input", clearCryptoMessage);
  }

  if (cryptoForm) {
    cryptoForm.addEventListener("submit", function (event) {
      event.preventDefault();
      clearCryptoMessage();

      const amount = Number(cryptoAmountInput?.value);
      const balance = getAvailableBalance();
      const address = String(cryptoAddressInput?.value || "").trim();
      const network = cryptoNetworkInput?.value || "";

      if (!Number.isFinite(amount) || amount <= 0) {
        showCryptoMessage("Please enter a valid withdrawal amount.", "error");
        cryptoAmountInput?.focus();
        return;
      }

      if (!Number.isInteger(Math.round(amount * 100)) ||
          Math.abs(amount * 100 - Math.round(amount * 100)) > 0.000001) {
        showCryptoMessage("Please enter an amount with no more than 2 decimal places.", "error");
        cryptoAmountInput?.focus();
        return;
      }

      if (amount > balance) {
        showCryptoMessage("The withdrawal amount cannot exceed your available balance.", "error");
        cryptoAmountInput?.focus();
        return;
      }

      if (network !== "TRC20") {
        showCryptoMessage("Please select the USDT TRC20 network.", "error");
        cryptoNetworkInput?.focus();
        return;
      }

      // Basic TRON address format check (starts with T, 34 Base58 characters).
      if (!/^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(address)) {
        showCryptoMessage("Please enter a valid USDT TRC20 wallet address.", "error");
        cryptoAddressInput?.focus();
        return;
      }

      // No API/database call is made until the backend endpoint is implemented.
      showCryptoMessage(
        "Your withdrawal details are valid. Database submission will be enabled when the backend is ready.",
        "success"
      );
    });
  }

  /* =================================================
     PUBLIC API
  ================================================= */

  window.U9ProfileWithdrawal = {

    // CATEGORY

    switchCategory: switchCategory,

    getCurrentCategory: function () {
      return currentCategory;
    },

    reset: function () {
      switchCategory("crypto");
    },


    // USER INFO

    setBalance: setBalance,

    setEmailVerified: setEmailVerified,

    updateUserInfo: updateUserInfo,


    // USER SYNC

    refreshUserInfo: function () {

      if (
        window.U9User &&
        window.U9User.getState() === "AUTHENTICATED"
      ) {

        applyHeaderUser(
          window.U9User.get()
        );

      }

    },


    // BUTTON REFERENCES

    getVerifiedButton: function () {
      return verifiedButton;
    },

    getNoticeButton: function () {
      return noticeButton;
    },


    // ICON REFERENCES

    getVerifiedIcon: function () {
      return verifiedIcon;
    },

    getNoticeIcon: function () {
      return noticeIcon;
    }

  };


})();
