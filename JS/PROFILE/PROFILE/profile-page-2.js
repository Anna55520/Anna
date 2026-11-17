
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

  const maxButton = document.getElementById(
    "U9-profile-withdrawal-max-button"
  );

  const pasteButton = document.getElementById(
    "U9-profile-withdrawal-paste-button"
  );

  const feeValueElement = document.getElementById(
    "U9-profile-withdrawal-fee-value"
  );

  const netValueElement = document.getElementById(
    "U9-profile-withdrawal-net-value"
  );

  const passwordSettingsButton = document.getElementById(
    "U9-profile-withdrawal-password-settings-button"
  );

  const walletSettingsButton = document.getElementById(
    "U9-profile-withdrawal-wallet-settings-button"
  );

  const passwordModal = document.getElementById(
    "U9-profile-withdrawal-password-modal"
  );

  const walletModal = document.getElementById(
    "U9-profile-withdrawal-wallet-modal"
  );

  const confirmModal = document.getElementById(
    "U9-profile-withdrawal-confirm-modal"
  );

  const passwordForm = document.getElementById(
    "U9-profile-withdrawal-password-form"
  );

  const walletForm = document.getElementById(
    "U9-profile-withdrawal-wallet-form"
  );

  const confirmForm = document.getElementById(
    "U9-profile-withdrawal-confirm-form"
  );

  const currentPasswordGroup = document.getElementById(
    "U9-profile-withdrawal-current-password-group"
  );

  const currentPasswordInput = document.getElementById(
    "U9-profile-withdrawal-current-password"
  );

  const newPasswordInput = document.getElementById(
    "U9-profile-withdrawal-new-password"
  );

  const confirmPasswordInput = document.getElementById(
    "U9-profile-withdrawal-confirm-password"
  );

  const boundWalletInput = document.getElementById(
    "U9-profile-withdrawal-bound-wallet"
  );

  const confirmPasswordInputForWithdrawal = document.getElementById(
    "U9-profile-withdrawal-confirm-input"
  );

  const passwordSaveButton = document.getElementById(
    "U9-profile-withdrawal-password-save"
  );

  const walletSaveButton = document.getElementById(
    "U9-profile-withdrawal-wallet-save"
  );

  const confirmSubmitButton = document.getElementById(
    "U9-profile-withdrawal-confirm-submit"
  );

  const passwordMessageElement = document.getElementById(
    "U9-profile-withdrawal-password-message"
  );

  const walletMessageElement = document.getElementById(
    "U9-profile-withdrawal-wallet-message"
  );

  const confirmMessageElement = document.getElementById(
    "U9-profile-withdrawal-confirm-message"
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

  let currentBalance = 0;

  let hasWithdrawalPassword = false;

  let hasWithdrawalWallet = false;

  let boundWalletAddress = "";

  let pendingWithdrawalData = null;

  let withdrawalInfoLoading = false;


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

    currentBalance = amount;

    balanceElement.textContent =
      amount.toFixed(2);

    updateFeePreview();

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

    if (isAuthenticated()) {
      loadWithdrawalInfo();
    }

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
     FEE PREVIEW
     1% fee is calculated from the requested amount.
     The requested amount is the gross amount deducted
     from the user's account balance.
  ================================================= */

  function calculateFee(amount) {
    return Math.round((Number(amount) * 0.01) * 100) / 100;
  }

  function updateFeePreview() {
    if (!feeValueElement || !netValueElement) return;

    const amount = Number(amountInput?.value || 0);
    const validAmount = Number.isFinite(amount) && amount > 0;
    const fee = validAmount ? calculateFee(amount) : 0;
    const net = validAmount
      ? Math.max(0, Math.round((amount - fee) * 100) / 100)
      : 0;

    feeValueElement.textContent = formatMoney(fee) + " USDT";
    netValueElement.textContent = formatMoney(net) + " USDT";
  }


  /* =================================================
     MODAL HELPERS
  ================================================= */

  function openModal(modal) {
    if (!modal) return;
    modal.hidden = false;
    document.body.classList.add("U9-withdrawal-modal-open");
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.hidden = true;

    const anyOpen = [passwordModal, walletModal, confirmModal]
      .some(function (item) {
        return item && !item.hidden;
      });

    if (!anyOpen) {
      document.body.classList.remove("U9-withdrawal-modal-open");
    }
  }

  function showLocalMessage(element, message, type) {
    if (!element) return;
    element.textContent = message;
    element.dataset.status = type || "info";
    element.hidden = false;
  }

  function clearLocalMessage(element) {
    if (!element) return;
    element.textContent = "";
    element.dataset.status = "";
    element.hidden = true;
  }

  function setButtonBusy(button, busy, normalText, busyText) {
    if (!button) return;
    button.disabled = busy;
    if (busy) {
      button.textContent = busyText || "Please wait...";
    } else {
      button.textContent = normalText;
    }
  }


  /* =================================================
     LOAD SERVER-SIDE WITHDRAWAL SETTINGS
  ================================================= */

  async function loadWithdrawalInfo() {
    if (!isAuthenticated() || withdrawalInfoLoading) return;

    withdrawalInfoLoading = true;

    try {
      const result = await callWithdrawalAPI({
        action: "info"
      });

      const data = result.data || result;

      hasWithdrawalPassword =
        data.has_withdrawal_password === true;

      hasWithdrawalWallet =
        data.has_withdrawal_wallet === true;

      boundWalletAddress =
        typeof data.withdrawal_wallet_address === "string"
          ? data.withdrawal_wallet_address
          : "";

      if (boundWalletAddress) {
        if (walletInput) walletInput.value = boundWalletAddress;
        if (boundWalletInput) boundWalletInput.value = boundWalletAddress;
      }

      if (data.balance !== undefined && data.balance !== null) {
        setBalance(data.balance);
      }

      updateFeePreview();

    } catch (error) {
      console.warn("U9 Withdrawal settings could not be loaded:", error);
    } finally {
      withdrawalInfoLoading = false;
    }
  }


  /* =================================================
     OPEN PASSWORD SETTINGS
  ================================================= */

  function openPasswordSettings() {
    if (!isAuthenticated()) {
      showMessage("Please sign in first.", "error");
      return;
    }

    clearLocalMessage(passwordMessageElement);

    if (currentPasswordGroup) {
      currentPasswordGroup.hidden = !hasWithdrawalPassword;
    }

    if (currentPasswordInput) currentPasswordInput.value = "";
    if (newPasswordInput) newPasswordInput.value = "";
    if (confirmPasswordInput) confirmPasswordInput.value = "";

    const title = document.getElementById(
      "U9-profile-withdrawal-password-modal-title"
    );

    if (title) {
      title.textContent = hasWithdrawalPassword
        ? "Change Withdrawal Password"
        : "Set Withdrawal Password";
    }

    if (passwordSaveButton) {
      passwordSaveButton.textContent = hasWithdrawalPassword
        ? "Update Password"
        : "Save Password";
    }

    openModal(passwordModal);
  }


  /* =================================================
     OPEN WALLET SETTINGS
  ================================================= */

  function openWalletSettings() {
    if (!isAuthenticated()) {
      showMessage("Please sign in first.", "error");
      return;
    }

    clearLocalMessage(walletMessageElement);

    if (boundWalletInput) {
      boundWalletInput.value = boundWalletAddress || "";
    }

    openModal(walletModal);
  }


  /* =================================================
     SAVE WITHDRAWAL PASSWORD
  ================================================= */

  async function saveWithdrawalPassword(event) {
    event.preventDefault();

    if (!isAuthenticated()) {
      showLocalMessage(passwordMessageElement, "Please sign in first.", "error");
      return;
    }

    const newPassword = newPasswordInput?.value.trim() || "";
    const confirmPassword = confirmPasswordInput?.value.trim() || "";
    const currentPassword = currentPasswordInput?.value.trim() || "";

    if (!/^\d{6}$/.test(newPassword)) {
      showLocalMessage(passwordMessageElement, "Password must contain exactly six digits.", "error");
      return;
    }

    if (newPassword !== confirmPassword) {
      showLocalMessage(passwordMessageElement, "The confirmation password does not match.", "error");
      return;
    }

    if (hasWithdrawalPassword && !/^\d{6}$/.test(currentPassword)) {
      showLocalMessage(passwordMessageElement, "Please enter your current six-digit password.", "error");
      return;
    }

    setButtonBusy(passwordSaveButton, true, "Save Password", "Saving...");

    try {
      const payload = {
        action: "set_password",
        password: newPassword
      };

      if (hasWithdrawalPassword) {
        payload.current_password = currentPassword;
      }

      const result = await callWithdrawalAPI(payload);

      hasWithdrawalPassword = true;

      showLocalMessage(
        passwordMessageElement,
        result.message || "Withdrawal password saved successfully.",
        "success"
      );

      if (passwordForm) passwordForm.reset();

      window.setTimeout(function () {
        closeModal(passwordModal);
      }, 650);

    } catch (error) {
      showLocalMessage(
        passwordMessageElement,
        error.message || "Unable to save withdrawal password.",
        "error"
      );
    } finally {
      setButtonBusy(
        passwordSaveButton,
        false,
        hasWithdrawalPassword ? "Update Password" : "Save Password"
      );
    }
  }


  /* =================================================
     SAVE BOUND WALLET
  ================================================= */

  async function saveBoundWallet(event) {
    event.preventDefault();

    if (!isAuthenticated()) {
      showLocalMessage(walletMessageElement, "Please sign in first.", "error");
      return;
    }

    const address = boundWalletInput?.value.trim() || "";

    if (!/^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(address)) {
      showLocalMessage(walletMessageElement, "Please enter a valid TRON (TRC20) wallet address.", "error");
      return;
    }

    setButtonBusy(walletSaveButton, true, "Save Wallet", "Saving...");

    try {
      const result = await callWithdrawalAPI({
        action: "set_wallet",
        wallet_address: address
      });

      boundWalletAddress = address;
      hasWithdrawalWallet = true;

      if (walletInput) walletInput.value = address;

      showLocalMessage(
        walletMessageElement,
        result.message || "Withdrawal wallet saved successfully.",
        "success"
      );

      window.setTimeout(function () {
        closeModal(walletModal);
      }, 650);

    } catch (error) {
      showLocalMessage(
        walletMessageElement,
        error.message || "Unable to save wallet address.",
        "error"
      );
    } finally {
      setButtonBusy(walletSaveButton, false, "Save Wallet");
    }
  }


  /* =================================================
     CREATE WITHDRAWAL REQUEST
  ================================================= */

  async function createWithdrawal(withdrawalData, withdrawalPassword) {
    if (isSubmitting) return;

    isSubmitting = true;

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.setAttribute("aria-busy", "true");
      submitButton.textContent = "Submitting...";
    }

    if (confirmSubmitButton) {
      confirmSubmitButton.disabled = true;
      confirmSubmitButton.textContent = "Submitting...";
    }

    try {
      const payload = {
        action: "create",
        amount: withdrawalData.amount,
        wallet_address: withdrawalData.wallet_address
      };

      if (withdrawalPassword) {
        payload.withdrawal_password = withdrawalPassword;
      }

      const result = await callWithdrawalAPI(payload);

      closeModal(confirmModal);
      clearLocalMessage(confirmMessageElement);

      showMessage(
        result.message ||
        "Your withdrawal request has been submitted successfully.",
        "success"
      );

      if (amountInput) amountInput.value = "";

      // When the server uses a bound wallet, keep it in the form.
      if (walletInput) {
        walletInput.value = boundWalletAddress || "";
      }

      const data = result.data || result;
      const newBalance = data.new_balance ?? data.balance;

      if (newBalance !== undefined && newBalance !== null) {
        setBalance(newBalance);
      } else {
        await loadWithdrawalInfo();
      }

      updateFeePreview();

    } catch (error) {
      if (confirmModal && !confirmModal.hidden) {
        showLocalMessage(
          confirmMessageElement,
          error.message || "Unable to submit withdrawal.",
          "error"
        );
      } else {
        showMessage(
          error.message || "Unable to submit your withdrawal. Please try again.",
          "error"
        );
      }
    } finally {
      isSubmitting = false;

      if (submitButton) {
        submitButton.disabled = false;
        submitButton.removeAttribute("aria-busy");
        submitButton.textContent = "Withdraw";
      }

      if (confirmSubmitButton) {
        confirmSubmitButton.disabled = false;
        confirmSubmitButton.textContent = "Confirm & Withdraw";
      }
    }
  }


  /* =================================================
     WITHDRAWAL PASSWORD CONFIRM FORM
  ================================================= */

  async function confirmWithdrawalPassword(event) {
    event.preventDefault();

    if (!pendingWithdrawalData) {
      showLocalMessage(confirmMessageElement, "Please restart your withdrawal request.", "error");
      return;
    }

    const password = confirmPasswordInputForWithdrawal?.value.trim() || "";

    if (!/^\d{6}$/.test(password)) {
      showLocalMessage(confirmMessageElement, "Please enter your six-digit withdrawal password.", "error");
      return;
    }

    clearLocalMessage(confirmMessageElement);

    await createWithdrawal(pendingWithdrawalData, password);

    if (!isSubmitting && confirmModal?.hidden) {
      pendingWithdrawalData = null;
      if (confirmForm) confirmForm.reset();
    }
  }


  /* =================================================
     MAX BUTTON
  ================================================= */

  if (maxButton) {
    maxButton.addEventListener("click", function () {
      if (!isAuthenticated()) {
        showMessage("Please sign in first.", "error");
        return;
      }

      if (!Number.isFinite(currentBalance) || currentBalance <= 0) {
        showMessage("There is no available balance to withdraw.", "error");
        return;
      }

      if (amountInput) {
        amountInput.value = currentBalance.toFixed(2);
        amountInput.dispatchEvent(new Event("input", { bubbles: true }));
      }

      clearMessage();
      updateFeePreview();
    });
  }


  /* =================================================
     PASTE BUTTON
  ================================================= */

  if (pasteButton) {
    pasteButton.addEventListener("click", async function () {
      try {
        if (!navigator.clipboard || typeof navigator.clipboard.readText !== "function") {
          throw new Error("Clipboard access is not available. Please paste the address manually.");
        }

        const text = (await navigator.clipboard.readText()).trim();

        if (!text) {
          throw new Error("Your clipboard is empty.");
        }

        if (walletInput) {
          walletInput.value = text;
          walletInput.dispatchEvent(new Event("input", { bubbles: true }));
        }

        clearMessage();

      } catch (error) {
        showMessage(
          error.message || "Unable to read clipboard. Please paste the address manually.",
          "error"
        );
      }
    });
  }


  /* =================================================
     LIVE FEE PREVIEW
  ================================================= */

  if (amountInput) {
    amountInput.addEventListener("input", updateFeePreview);
  }

  updateFeePreview();


  /* =================================================
     SETTINGS BUTTONS & MODAL CLOSE BUTTONS
  ================================================= */

  passwordSettingsButton?.addEventListener("click", openPasswordSettings);
  walletSettingsButton?.addEventListener("click", openWalletSettings);

  document.getElementById("U9-profile-withdrawal-password-modal-close")
    ?.addEventListener("click", function () { closeModal(passwordModal); });

  document.getElementById("U9-profile-withdrawal-wallet-modal-close")
    ?.addEventListener("click", function () { closeModal(walletModal); });

  document.getElementById("U9-profile-withdrawal-confirm-modal-close")
    ?.addEventListener("click", function () {
      closeModal(confirmModal);
      pendingWithdrawalData = null;
      confirmForm?.reset();
      clearLocalMessage(confirmMessageElement);
    });

  [passwordModal, walletModal, confirmModal].forEach(function (modal) {
    modal?.addEventListener("click", function (event) {
      if (event.target === modal) {
        closeModal(modal);
        if (modal === confirmModal) {
          pendingWithdrawalData = null;
          confirmForm?.reset();
          clearLocalMessage(confirmMessageElement);
        }
      }
    });
  });

  passwordForm?.addEventListener("submit", saveWithdrawalPassword);
  walletForm?.addEventListener("submit", saveBoundWallet);
  confirmForm?.addEventListener("submit", confirmWithdrawalPassword);


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

    if (isSubmitting) return;

    clearMessage();

    if (!isAuthenticated()) {
      showMessage(
        "Please sign in before submitting a withdrawal.",
        "error"
      );
      return;
    }

    if (currentCategory !== "crypto") {
      showMessage(
        "This withdrawal method is not available yet.",
        "error"
      );
      return;
    }

    let withdrawalData;

    try {
      withdrawalData = validateWithdrawalInput();
    } catch (error) {
      showMessage(error.message, "error");
      return;
    }

    const amount = Number(withdrawalData.amount);

    if (amount > currentBalance) {
      showMessage(
        "Your withdrawal amount cannot exceed your available balance.",
        "error"
      );
      return;
    }

    const fee = calculateFee(amount);
    const netAmount = Math.max(
      0,
      Math.round((amount - fee) * 100) / 100
    );

    // Always show the latest fee breakdown before password confirmation.
    updateFeePreview();

    if (hasWithdrawalPassword) {
      pendingWithdrawalData = withdrawalData;

      if (confirmPasswordInputForWithdrawal) {
        confirmPasswordInputForWithdrawal.value = "";
      }

      clearLocalMessage(confirmMessageElement);
      openModal(confirmModal);

      window.setTimeout(function () {
        confirmPasswordInputForWithdrawal?.focus();
      }, 50);

      return;
    }

    const confirmed = window.confirm(
      "Confirm your USDT TRC20 withdrawal?\n\n" +
      "Withdrawal amount: " + formatMoney(amount) + " USDT\n" +
      "Withdrawal fee (1%): " + formatMoney(fee) + " USDT\n" +
      "You will receive: " + formatMoney(netAmount) + " USDT\n\n" +
      "Please make sure your wallet address is correct."
    );

    if (!confirmed) return;

    await createWithdrawal(withdrawalData, null);
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

    refreshWithdrawalInfo: loadWithdrawalInfo,

    updateFeePreview: updateFeePreview,

    openPasswordSettings: openPasswordSettings,

    openWalletSettings: openWalletSettings,


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
