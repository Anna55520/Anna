
/* =================================================
   U9 PROFILE PAGE 2 — DEPOSIT / KYC STATUS
================================================= */

(function () {

  "use strict";


  /* =========================
     PREVENT DUPLICATE INIT
  ========================= */

  if (window.U9ProfileDeposit) {
    return;
  }


  /* =========================
     ELEMENTS
  ========================= */

  const navigation = document.getElementById(
    "U9-profile-deposit-navigation"
  );

  const balanceElement = document.getElementById(
    "U9-profile-deposit-balance-value"
  );

  const verifiedButton = document.getElementById(
    "U9-profile-deposit-verified-button"
  );

  const verifiedIcon = document.getElementById(
    "U9-profile-deposit-verified-icon"
  );

  const noticeButton = document.getElementById(
    "U9-profile-deposit-notice-button"
  );

  const noticeIcon = document.getElementById(
    "U9-profile-deposit-notice-icon"
  );

  const kycNotice = document.getElementById(
    "U9-profile-deposit-kyc-notice"
  );

  const kycGuide = document.getElementById(
    "U9-profile-deposit-kyc-guide"
  );

  const kycUnavailable = document.getElementById(
    "U9-profile-deposit-kyc-unavailable"
  );

  const kycStatusHintIcon = document.getElementById(
    "U9-profile-deposit-kyc-status-hint-icon"
  );


  /* =========================
     CRYPTO DEPOSIT FORM
  ========================= */

  const cryptoPanel = document.getElementById("U9-profile-deposit-crypto-panel");
  const depositForm = document.getElementById("U9-profile-deposit-form");
  const amountInput = document.getElementById("U9-profile-deposit-amount");
  const receiptInput = document.getElementById("U9-profile-deposit-receipt-input");
  const receiptTrigger = document.getElementById("U9-profile-deposit-receipt-trigger");
  const receiptPreviewWrap = document.getElementById("U9-profile-deposit-receipt-preview-wrap");
  const receiptPreview = document.getElementById("U9-profile-deposit-receipt-preview");
  const receiptName = document.getElementById("U9-profile-deposit-receipt-name");
  const submitButton = document.getElementById("U9-profile-deposit-submit");
  const submitStatus = document.getElementById("U9-profile-deposit-submit-status");
  const copyAddressButton = document.getElementById("U9-profile-deposit-copy-address");
  const copyFeedback = document.getElementById("U9-profile-deposit-copy-feedback");

  // Configure these two values for Database B before going live.
  // The access token must be a Supabase Auth JWT belonging to Database B.
  const DEPOSIT_FUNCTION_URL = window.U9_DEPOSIT_CONFIG?.functionUrl || "";
  const DEPOSIT_ANON_KEY = window.U9_DEPOSIT_CONFIG?.anonKey || "";
  const DEPOSIT_MAX_FILE_BYTES = 8 * 1024 * 1024;
  const DEPOSIT_ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
  const DEPOSIT_WALLET_ADDRESS = "TC1hvrfZVHaCGwg1rJRoB7Ke7v1UkzzGV5";
  let receiptPreviewObjectUrl = null;

  let currentKycStatus = false;


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
     RENDER KYC INFORMATION
  ========================= */

  function renderKycInformation() {

    if (cryptoPanel) {
      cryptoPanel.hidden = currentCategory !== "crypto";
    }

    // Crypto does not require KYC in the current design.
    const requiresKyc = currentCategory !== "crypto";

    if (!requiresKyc) {
      if (kycNotice) kycNotice.hidden = true;
      if (kycGuide) kycGuide.hidden = true;
      if (kycUnavailable) kycUnavailable.hidden = true;
      return;
    }

    if (currentKycStatus === true) {
      // KYC is approved: show country/payment availability notice only.
      if (kycNotice) kycNotice.hidden = true;
      if (kycGuide) kycGuide.hidden = true;
      if (kycUnavailable) kycUnavailable.hidden = false;

      if (kycStatusHintIcon) {
        kycStatusHintIcon.src = "/SSVG/Withdraw/hint-true.svg";
        kycStatusHintIcon.alt = "Payment services unavailable";
      }

      return;
    }

    // KYC is not approved: show the KYC requirement and guide.
    if (kycNotice) kycNotice.hidden = false;
    if (kycGuide) kycGuide.hidden = false;
    if (kycUnavailable) kycUnavailable.hidden = true;

    if (kycStatusHintIcon) {
      kycStatusHintIcon.src = "/SSVG/Withdraw/hint.svg";
      kycStatusHintIcon.alt = "KYC information";
    }

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
    renderKycInformation();

  }


  /* =========================
     NAVIGATION CLICK
  ========================= */

  if (navigation) {

    navigation.addEventListener("click", function (event) {

      const button = event.target.closest(
        ".U9-profile-deposit-nav-button"
      );

      if (!button || !navigation.contains(button)) return;

      switchCategory(button.dataset.category);

    });


    /* =========================
       KEYBOARD NAVIGATION
    ========================= */

    navigation.addEventListener("keydown", function (event) {

      const button = event.target.closest(
        ".U9-profile-deposit-nav-button"
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
      "U9 Profile Deposit Navigation not found."
    );

  }


  /* =================================================
     DEPOSIT FORM HELPERS
  ================================================= */

  function showDepositStatus(message, type) {
    if (!submitStatus) return;
    submitStatus.textContent = message;
    submitStatus.className = "is-visible is-" + (type || "info");
    submitStatus.setAttribute("role", type === "error" ? "alert" : "status");
  }

  function clearDepositStatus() {
    if (!submitStatus) return;
    submitStatus.textContent = "";
    submitStatus.className = "";
  }

  function getDepositAccessToken() {
    // U9 login currently stores its bearer token here. It must also be a
    // valid Supabase Auth JWT for the project hosting deposit-submit.
    return localStorage.getItem("u9_token") ||
      localStorage.getItem("u9_access_token") ||
      localStorage.getItem("access_token") || "";
  }

  function validateReceipt(file) {
    if (!file) return "Please upload your transfer receipt image.";
    if (!DEPOSIT_ALLOWED_TYPES.includes(file.type)) {
      return "Only JPG, PNG, and WebP images are accepted.";
    }
    if (file.size <= 0 || file.size > DEPOSIT_MAX_FILE_BYTES) {
      return "The receipt image must be smaller than 8 MB.";
    }
    return "";
  }

  function setReceiptFile(file) {
    clearDepositStatus();
    if (!file) return;
    const validationError = validateReceipt(file);
    if (validationError) {
      if (receiptInput) receiptInput.value = "";
      if (receiptPreviewWrap) receiptPreviewWrap.classList.remove("has-image");
      if (receiptPreview) receiptPreview.removeAttribute("src");
      if (receiptName) receiptName.textContent = "";
      showDepositStatus(validationError, "error");
      return;
    }

    if (receiptPreviewObjectUrl) URL.revokeObjectURL(receiptPreviewObjectUrl);
    receiptPreviewObjectUrl = URL.createObjectURL(file);
    if (receiptPreview) receiptPreview.src = receiptPreviewObjectUrl;
    if (receiptName) receiptName.textContent = file.name;
    if (receiptPreviewWrap) receiptPreviewWrap.classList.add("has-image");
  }

  async function copyDepositAddress() {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(DEPOSIT_WALLET_ADDRESS);
      } else {
        const temporaryInput = document.createElement("textarea");
        temporaryInput.value = DEPOSIT_WALLET_ADDRESS;
        temporaryInput.setAttribute("readonly", "");
        temporaryInput.style.position = "fixed";
        temporaryInput.style.opacity = "0";
        document.body.appendChild(temporaryInput);
        temporaryInput.select();
        const copied = document.execCommand("copy");
        temporaryInput.remove();
        if (!copied) throw new Error("Clipboard permission was denied.");
      }
      if (copyFeedback) copyFeedback.textContent = "Wallet address copied.";
      if (copyAddressButton) copyAddressButton.setAttribute("aria-label", "Wallet address copied");
    } catch (error) {
      if (copyFeedback) copyFeedback.textContent = "Could not copy. Please copy the address manually.";
      console.warn("U9 Deposit: copy address failed.", error);
    }
  }

  async function submitDepositRequest(event) {
    event.preventDefault();
    clearDepositStatus();

    const rawAmount = amountInput?.value.trim() || "";
    const receipt = receiptInput?.files?.[0] || null;
    if (!/^\d{1,12}(\.\d{1,6})?$/.test(rawAmount) || !Number.isFinite(Number(rawAmount)) || Number(rawAmount) <= 0) {
      showDepositStatus("Please enter a valid USDT amount greater than zero (up to 6 decimal places).", "error");
      amountInput?.focus();
      return;
    }

    const receiptError = validateReceipt(receipt);
    if (receiptError) {
      showDepositStatus(receiptError, "error");
      receiptTrigger?.focus();
      return;
    }

    if (!DEPOSIT_FUNCTION_URL || !DEPOSIT_ANON_KEY) {
      showDepositStatus("Deposit is not connected yet. Configure U9_DEPOSIT_CONFIG with Database B Function URL and anon key.", "error");
      return;
    }

    const accessToken = getDepositAccessToken();
    if (!accessToken) {
      showDepositStatus("Please sign in before submitting a deposit request.", "error");
      return;
    }

    const formData = new FormData();
    formData.append("amount", rawAmount);
    formData.append("receipt", receipt, receipt.name);

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.dataset.originalText = submitButton.textContent.trim();
      submitButton.textContent = "Submitting...";
    }

    try {
      const response = await fetch(DEPOSIT_FUNCTION_URL, {
        method: "POST",
        headers: {
          "apikey": DEPOSIT_ANON_KEY,
          "Authorization": "Bearer " + accessToken
        },
        body: formData,
        credentials: "omit",
        cache: "no-store"
      });

      let result = {};
      try { result = await response.json(); } catch (_) {}

      if (!response.ok || result.success !== true) {
        throw new Error(result.error || "Could not submit the deposit request. Please try again.");
      }

      showDepositStatus("Deposit request submitted successfully. It is now pending review.", "success");
      if (depositForm) depositForm.reset();
      if (receiptPreviewObjectUrl) {
        URL.revokeObjectURL(receiptPreviewObjectUrl);
        receiptPreviewObjectUrl = null;
      }
      if (receiptPreview) receiptPreview.removeAttribute("src");
      if (receiptPreviewWrap) receiptPreviewWrap.classList.remove("has-image");
      if (receiptName) receiptName.textContent = "";
    } catch (error) {
      console.error("U9 Deposit submission failed:", error);
      showDepositStatus(error.message || "Deposit submission failed. Please try again.", "error");
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = submitButton.dataset.originalText || "Submit Deposit";
      }
    }
  }

  if (copyAddressButton) {
    copyAddressButton.addEventListener("click", copyDepositAddress);
  }

  if (receiptTrigger && receiptInput) {
    receiptTrigger.addEventListener("click", function () { receiptInput.click(); });
    receiptInput.addEventListener("change", function () {
      setReceiptFile(receiptInput.files?.[0] || null);
    });
  }

  if (depositForm) {
    depositForm.addEventListener("submit", submitDepositRequest);
  }

  window.addEventListener("beforeunload", function () {
    if (receiptPreviewObjectUrl) URL.revokeObjectURL(receiptPreviewObjectUrl);
  }, { once: true });

  /* =================================================
     DEPOSIT BUTTON INITIALIZATION
  ================================================= */

  function initializeButton(button, icon, name) {

    if (!button) {

      console.warn(
        "U9 Deposit button not found:",
        name
      );

      return;

    }

    button.type = "button";

    if (icon && !button.contains(icon)) {

      console.warn(
        "U9 Deposit icon is outside its button:",
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
     USER BALANCE
  ================================================= */

  function setBalance(balance) {

    if (!balanceElement) return;

    const amount = Number(balance);

    if (!Number.isFinite(amount)) {

      console.warn(
        "Invalid deposit balance:",
        balance
      );

      return;

    }

    balanceElement.textContent = amount.toFixed(2);

  }


  /* =================================================
     KYC VERIFIED STATUS
  ================================================= */

  function setKycStatus(verified) {

    if (!verifiedIcon) return;

    if (typeof verified !== "boolean") {

      console.warn(
        "Invalid kyc value:",
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
        "Invalid deposit user data."
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

      kyc: user.kyc

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
     PUBLIC API
  ================================================= */

  window.U9ProfileDeposit = {

    // CATEGORY

    switchCategory: switchCategory,

    getCurrentCategory: function () {
      return currentCategory;
    },

    reset: function () {
      switchCategory("crypto");
    },


    // DEPOSIT FORM

    copyWalletAddress: copyDepositAddress,

    // USER INFO

    setBalance: setBalance,

    setKycStatus: setKycStatus,

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
