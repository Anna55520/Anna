
/* =================================================
   U9 PROFILE PAGE 2 — WITHDRAWAL / KYC STATUS
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

  // Existing balance display — keep the original one.
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

  const kycNotice = document.getElementById(
    "U9-profile-withdrawal-kyc-notice"
  );

  const kycGuide = document.getElementById(
    "U9-profile-withdrawal-kyc-guide"
  );

  const kycUnavailable = document.getElementById(
    "U9-profile-withdrawal-kyc-unavailable"
  );

  const kycStatusHintIcon = document.getElementById(
    "U9-profile-withdrawal-kyc-status-hint-icon"
  );


  /* =========================
     WITHDRAWAL FORM
  ========================= */

  const withdrawalForm = document.getElementById(
    "U9-profile-withdrawal-form"
  );

  const amountInput = document.getElementById(
    "U9-profile-withdrawal-amount"
  );

  const walletInput = document.getElementById(
    "U9-profile-withdrawal-wallet-address"
  );

  const submitButton = document.getElementById(
    "U9-profile-withdrawal-submit"
  );

  const messageElement = document.getElementById(
    "U9-profile-withdrawal-message"
  );


  /* =========================
     STATE
  ========================= */

  let currentKycStatus = false;

  const categories = [
    "crypto",
    "epayment",
    "bank",
    "card"
  ];

  let currentCategory = "crypto";

  let isSubmitting = false;

  let userSubscribed = false;

  let unsubscribeUser = null;


  /* =================================================
     CATEGORY NAVIGATION
  ================================================= */

  function getButton(category) {

    if (!navigation) return null;

    return navigation.querySelector(
      `[data-category="${category}"]`
    );

  }


  /* =================================================
     KYC INFORMATION
  ================================================= */

  function renderKycInformation() {

    // Crypto does not require KYC in the current design.
    const requiresKyc = currentCategory !== "crypto";

    if (!requiresKyc) {

      if (kycNotice) {
        kycNotice.hidden = true;
      }

      if (kycGuide) {
        kycGuide.hidden = true;
      }

      if (kycUnavailable) {
        kycUnavailable.hidden = true;
      }

      return;
    }


    // KYC approved.
    if (currentKycStatus === true) {

      if (kycNotice) {
        kycNotice.hidden = true;
      }

      if (kycGuide) {
        kycGuide.hidden = true;
      }

      if (kycUnavailable) {
        kycUnavailable.hidden = false;
      }

      if (kycStatusHintIcon) {

        kycStatusHintIcon.src =
          "/SSVG/Withdraw/hint-true.svg";

        kycStatusHintIcon.alt =
          "Payment services unavailable";

      }

      return;
    }


    // KYC not approved.
    if (kycNotice) {
      kycNotice.hidden = false;
    }

    if (kycGuide) {
      kycGuide.hidden = false;
    }

    if (kycUnavailable) {
      kycUnavailable.hidden = true;
    }

    if (kycStatusHintIcon) {

      kycStatusHintIcon.src =
        "/SSVG/Withdraw/hint.svg";

      kycStatusHintIcon.alt =
        "KYC information";

    }

  }


  /* =================================================
     SWITCH CATEGORY
  ================================================= */

  function switchCategory(category) {

    if (!categories.includes(category)) {
      return;
    }

    if (!navigation) {
      return;
    }

    categories.forEach(function (item) {

      const button = getButton(item);

      if (!button) {
        return;
      }

      const isActive = item === category;

      button.classList.toggle(
        "active",
        isActive
      );

      button.setAttribute(
        "aria-selected",
        String(isActive)
      );

      button.tabIndex = isActive ? 0 : -1;

    });

    currentCategory = category;

    renderKycInformation();

    // Only the Crypto withdrawal form is implemented.
    if (withdrawalForm) {

      withdrawalForm.hidden =
        category !== "crypto";

    }

    clearMessage();

  }


  /* =================================================
     NAVIGATION CLICK
  ================================================= */

  if (navigation) {

    navigation.addEventListener(
      "click",
      function (event) {

        const button = event.target.closest(
          ".U9-profile-withdrawal-nav-button"
        );

        if (
          !button ||
          !navigation.contains(button)
        ) {
          return;
        }

        switchCategory(
          button.dataset.category
        );

      }
    );


    /* =========================
       KEYBOARD NAVIGATION
    ========================= */

    navigation.addEventListener(
      "keydown",
      function (event) {

        const button = event.target.closest(
          ".U9-profile-withdrawal-nav-button"
        );

        if (!button) {
          return;
        }

        const index = categories.indexOf(
          button.dataset.category
        );

        if (index === -1) {
          return;
        }

        let nextIndex;

        if (event.key === "ArrowRight") {

          nextIndex =
            (index + 1) % categories.length;

        } else if (event.key === "ArrowLeft") {

          nextIndex =
            (index - 1 + categories.length) %
            categories.length;

        } else {

          return;

        }

        event.preventDefault();

        const nextCategory =
          categories[nextIndex];

        switchCategory(nextCategory);

        getButton(nextCategory)?.focus();

      }
    );

    // INITIALIZE
    switchCategory("crypto");

  } else {

    console.warn(
      "U9 Profile Withdrawal Navigation not found."
    );

  }


  /* =================================================
     BUTTON INITIALIZATION
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
    "kyc"
  );

  initializeButton(
    noticeButton,
    noticeIcon,
    "notice"
  );


  /* =================================================
     EXISTING USER BALANCE
  ================================================= */

  function setBalance(balance) {

    if (!balanceElement) {
      return;
    }

    const amount = Number(balance);

    if (!Number.isFinite(amount)) {

      console.warn(
        "Invalid withdrawal balance:",
        balance
      );

      return;

    }

    balanceElement.textContent =
      amount.toFixed(2);

  }


  /* =================================================
     KYC VERIFIED STATUS
  ================================================= */

  function setKycStatus(verified) {

    if (typeof verified !== "boolean") {

      console.warn(
        "Invalid kyc value:",
        verified
      );

      return;

    }

    if (verifiedIcon) {

      if (verified) {

        verifiedIcon.src =
          "/SSVG/Withdraw/verified.svg";

        verifiedIcon.alt = "Verified";

      } else {

        verifiedIcon.src =
          "/SSVG/Withdraw/unverified.svg";

        verifiedIcon.alt = "Unverified";

      }

    }

    currentKycStatus = verified;

    verifiedButton?.setAttribute(
      "aria-label",
      verified ? "KYC verified" : "KYC unverified"
    );

    renderKycInformation();

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

    if (user.kyc !== undefined) {

      setKycStatus(user.kyc);

    }

  }


  /* =================================================
     HEADER USER SYNC
  ================================================= */

  function applyHeaderUser(user) {

    if (!user || typeof user !== "object") {
      return;
    }

    updateUserInfo({

      balance: user.balance,

      kyc: user.kyc

    });

  }


  function connectHeaderUser() {

    if (!window.U9User) {
      return false;
    }

    if (userSubscribed) {
      return true;
    }

    if (
      typeof window.U9User.subscribe !== "function"
    ) {
      return false;
    }

    userSubscribed = true;

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


    // Apply current user.
    if (
      typeof window.U9User.getState === "function" &&
      window.U9User.getState() === "AUTHENTICATED" &&
      typeof window.U9User.get === "function"
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
      connectHeaderUser
    );

  }


  /* =================================================
     AUTHENTICATION
  ================================================= */

  function isAuthenticated() {

    return Boolean(
      window.U9User &&
      typeof window.U9User.isLoggedIn === "function" &&
      window.U9User.isLoggedIn()
    );

  }


  /* =================================================
     GET ACCESS TOKEN
  ================================================= */

  function getAccessToken() {

    const tokenKeys = [
      "u9_token",
      "u9_access_token",
      "access_token",
      "authToken",
      "token"
    ];

    for (const key of tokenKeys) {

      const token = localStorage.getItem(key);

      if (token) {
        return token;
      }

    }

    return null;

  }


  /* =================================================
     WITHDRAWAL API
  ================================================= */

  async function callWithdrawalAPI(payload) {

    const headers = {
      "Content-Type": "application/json"
    };

    const token = getAccessToken();

    if (token) {

      headers.Authorization =
        "Bearer " + token;

    }

    const response = await fetch(
      "/api/withdrawal",
      {
        method: "POST",
        headers: headers,
        credentials: "include",
        cache: "no-store",
        body: JSON.stringify(payload)
      }
    );

    let result;

    try {

      result = await response.json();

    } catch (error) {

      throw new Error(
        "Invalid server response."
      );

    }

    if (!response.ok) {

      throw new Error(
        result?.error ||
        result?.message ||
        "Withdrawal request failed."
      );

    }

    if (result.success !== true) {

      throw new Error(
        result?.error ||
        result?.message ||
        "Withdrawal request failed."
      );

    }

    return result;

  }


  /* =================================================
     FORM MESSAGE
  ================================================= */

  function showMessage(message, type) {

    if (!messageElement) {
      return;
    }

    messageElement.textContent = message;

    messageElement.dataset.status =
      type || "info";

    messageElement.hidden = false;

  }


  function clearMessage() {

    if (!messageElement) {
      return;
    }

    messageElement.textContent = "";

    messageElement.dataset.status = "";

    messageElement.hidden = true;

  }


  /* =================================================
     FORMAT MONEY
  ================================================= */

  function formatMoney(value) {

    return Number(value).toFixed(2);

  }


  /* =================================================
     VALIDATE WITHDRAWAL INPUT
  ================================================= */

  function validateWithdrawalInput() {

    if (!amountInput || !walletInput) {

      throw new Error(
        "Withdrawal form is not configured."
      );

    }

    const amountText =
      amountInput.value.trim();

    const amount = Number(amountText);

    const walletAddress =
      walletInput.value.trim();

    if (
      !amountText ||
      !Number.isFinite(amount) ||
      amount <= 0
    ) {

      throw new Error(
        "Please enter a valid withdrawal amount."
      );

    }

    // Two decimal places, matching the account balance precision.
    if (!/^\d+(\.\d{1,2})?$/.test(amountText)) {

      throw new Error(
        "Please enter an amount with up to 2 decimal places."
      );

    }

    // Basic TRON address format validation.
    if (
      !/^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(walletAddress)
    ) {

      throw new Error(
        "Please enter a valid USDT TRC20 wallet address."
      );

    }

    return {
      amount: formatMoney(amount),
      wallet_address: walletAddress
    };

  }


  /* =================================================
     SUBMIT WITHDRAWAL
  ================================================= */

  async function submitWithdrawal(event) {

    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    clearMessage();


    /* =========================
       CHECK LOGIN
    ========================= */

    if (!isAuthenticated()) {

      showMessage(
        "Please sign in before submitting a withdrawal.",
        "error"
      );

      return;

    }


    /* =========================
       CHECK CATEGORY
    ========================= */

    if (currentCategory !== "crypto") {

      showMessage(
        "This withdrawal method is not available yet.",
        "error"
      );

      return;

    }


    /* =========================
       VALIDATE INPUT
    ========================= */

    let withdrawalData;

    try {

      withdrawalData =
        validateWithdrawalInput();

    } catch (error) {

      showMessage(
        error.message,
        "error"
      );

      return;

    }


    /* =========================
       CONFIRM REQUEST
    ========================= */

    const amount = Number(
      withdrawalData.amount
    );

    const fee = Math.round(
      amount * 0.01 * 100
    ) / 100;

    const netAmount =
      Math.round(
        (amount - fee) * 100
      ) / 100;

    const confirmed = window.confirm(

      "Confirm your USDT TRC20 withdrawal?\n\n" +
      "Withdrawal amount: " + formatMoney(amount) + " USDT\n" +
      "Fee (1%): " + formatMoney(fee) + " USDT\n" +
      "You will receive: " + formatMoney(netAmount) + " USDT\n\n" +
      "Please make sure your wallet address is correct."

    );

    if (!confirmed) {
      return;
    }


    /* =========================
       SUBMITTING STATE
    ========================= */

    isSubmitting = true;

    if (submitButton) {

      submitButton.disabled = true;

      submitButton.setAttribute(
        "aria-busy",
        "true"
      );

      submitButton.textContent =
        "Submitting...";

    }


    try {

      const result = await callWithdrawalAPI({

        action: "create",

        amount: withdrawalData.amount,

        wallet_address:
          withdrawalData.wallet_address

      });


      /* =========================
         SUCCESS
      ========================= */

      showMessage(
        result.message ||
        "Your withdrawal request has been submitted successfully.",
        "success"
      );


      // Clear inputs after successful submission.
      if (amountInput) {
        amountInput.value = "";
      }

      if (walletInput) {
        walletInput.value = "";
      }


      // Update the existing balance display only
      // when the server returns the new balance.
      const data = result.data || result;

      const newBalance =
        data.new_balance ??
        data.balance;

      if (
        newBalance !== undefined &&
        newBalance !== null
      ) {

        setBalance(newBalance);

      }

    } catch (error) {

      console.error(
        "U9 Withdrawal Error:",
        error
      );

      showMessage(
        error.message ||
        "Unable to submit your withdrawal. Please try again.",
        "error"
      );

    } finally {

      isSubmitting = false;

      if (submitButton) {

        submitButton.disabled = false;

        submitButton.removeAttribute(
          "aria-busy"
        );

        submitButton.textContent =
          "Withdraw";

      }

    }

  }


  /* =================================================
     WITHDRAWAL FORM INITIALIZATION
  ================================================= */

  if (withdrawalForm) {

    withdrawalForm.addEventListener(
      "submit",
      submitWithdrawal
    );

  } else {

    console.warn(
      "U9 Withdrawal form not found."
    );

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

    setKycStatus: setKycStatus,

    updateUserInfo: updateUserInfo,


    // USER SYNC

    refreshUserInfo: function () {

      if (
        window.U9User &&
        typeof window.U9User.getState === "function" &&
        window.U9User.getState() === "AUTHENTICATED" &&
        typeof window.U9User.get === "function"
      ) {

        applyHeaderUser(
          window.U9User.get()
        );

      }

    },


    // WITHDRAWAL

    submitWithdrawal: submitWithdrawal,


    // BUTTON REFERENCES

    getKycButton: function () {
      return verifiedButton;
    },

    getNoticeButton: function () {
      return noticeButton;
    },


    // ICON REFERENCES

    getKycIcon: function () {
      return verifiedIcon;
    },

    getNoticeIcon: function () {
      return noticeIcon;
    }

  };


})();
