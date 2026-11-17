/* =================================================
   U9 PROFILE PAGE 2 — USDT TRC20 WITHDRAWAL
   API: /api/withdrawal
   Actions: info / create / history
================================================= */

(function () {
  "use strict";

  if (window.U9ProfileWithdrawal) return;

  const API_URL = "/api/withdrawal";

  const balanceElement = document.getElementById("U9-profile-withdrawal-balance-value");
  const verifiedButton = document.getElementById("U9-profile-withdrawal-verified-button");
  const verifiedIcon = document.getElementById("U9-profile-withdrawal-verified-icon");
  const noticeButton = document.getElementById("U9-profile-withdrawal-notice-button");
  const noticeIcon = document.getElementById("U9-profile-withdrawal-notice-icon");

  const form = document.getElementById("U9-withdrawal-form");
  const amountInput = document.getElementById("U9-withdrawal-amount");
  const walletInput = document.getElementById("U9-withdrawal-wallet");
  const availableElement = document.getElementById("U9-withdrawal-available");
  const summaryAmount = document.getElementById("U9-withdrawal-summary-amount");
  const summaryFee = document.getElementById("U9-withdrawal-summary-fee");
  const summaryNet = document.getElementById("U9-withdrawal-summary-net");
  const messageElement = document.getElementById("U9-withdrawal-message");
  const submitButton = document.getElementById("U9-withdrawal-submit");
  const historySection = document.getElementById("U9-withdrawal-history-section");
  const historyToggleButton = document.getElementById("U9-withdrawal-history-more-toggle");
  const historyList = document.getElementById("U9-withdrawal-history-list");
  const historyRefreshButton = document.getElementById("U9-withdrawal-history-refresh");
  const historyMoreButton = document.getElementById("U9-withdrawal-history-more");
  const openWithdrawalButton = document.getElementById("U9-profile-button-2");

  let currentBalance = 0;
  let currentKycStatus = false;
  let isSubmitting = false;
  let historyOffset = 0;
  const HISTORY_LIMIT = 20;
  let historyLoading = false;
  let unsubscribeUser = null;

  function formatMoney(value) {
    const number = Number(value);
    return Number.isFinite(number) ? number.toFixed(2) : "0.00";
  }

  function setBalance(value) {
    const amount = Number(value);
    if (!Number.isFinite(amount) || amount < 0) return;
    currentBalance = amount;
    if (balanceElement) balanceElement.textContent = formatMoney(amount);
    if (availableElement) availableElement.textContent = `${formatMoney(amount)} USDT`;
    updateSummary();
  }

  function setKycStatus(verified) {
    if (typeof verified !== "boolean") return;
    currentKycStatus = verified;
    if (verifiedIcon) {
      verifiedIcon.src = verified ? "/SSVG/Withdraw/verified.svg" : "/SSVG/Withdraw/unverified.svg";
      verifiedIcon.alt = verified ? "Verified" : "Unverified";
    }
    verifiedButton?.setAttribute("aria-label", verified ? "KYC verified" : "KYC unverified");
  }

  function updateUserInfo(user) {
    if (!user || typeof user !== "object") return;
    if (user.balance !== undefined) setBalance(user.balance);
    if (user.kyc !== undefined) setKycStatus(user.kyc);
  }

  function getToken() {
    try {
      return localStorage.getItem("u9_token");
    } catch (error) {
      console.error("U9 Withdrawal: Unable to read session token.", error);
      return null;
    }
  }

  async function apiRequest(payload) {
    const token = getToken();
    const headers = { "Content-Type": "application/json" };
    if (token) headers.Authorization = `Bearer ${token}`;

    const response = await fetch(API_URL, {
      method: "POST",
      credentials: "include",
      cache: "no-store",
      headers,
      body: JSON.stringify(payload)
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok || result.success !== true) {
      throw new Error(result.error || result.message || `Request failed (${response.status})`);
    }
    return result;
  }

  function showMessage(message, type) {
    if (!messageElement) return;
    messageElement.textContent = message;
    messageElement.dataset.type = type || "error";
    messageElement.hidden = !message;
  }

  function calculateFee(amount) {
    return Math.round((amount * 0.01 + Number.EPSILON) * 100) / 100;
  }

  function updateSummary() {
    const amount = Number(amountInput?.value || 0);
    const valid = Number.isFinite(amount) && amount > 0;
    const fee = valid ? calculateFee(amount) : 0;
    const net = valid ? Math.max(0, amount - fee) : 0;
    if (summaryAmount) summaryAmount.textContent = `${formatMoney(valid ? amount : 0)} USDT`;
    if (summaryFee) summaryFee.textContent = `${formatMoney(fee)} USDT`;
    if (summaryNet) summaryNet.textContent = `${formatMoney(net)} USDT`;
  }

  async function loadInfo() {
    try {
      const result = await apiRequest({ action: "info" });
      const data = result.data || {};
      if (data.balance !== undefined) setBalance(data.balance);
      return data;
    } catch (error) {
      showMessage(error.message || "Unable to load withdrawal information.", "error");
      return null;
    }
  }

  function statusLabel(status) {
    const labels = {
      pending: "Pending",
      approved: "Approved",
      processing: "Processing",
      completed: "Completed",
      rejected: "Rejected",
      cancelled: "Cancelled"
    };
    return labels[status] || String(status || "Unknown");
  }

  function createHistoryItem(item) {
    const card = document.createElement("article");
    card.className = "U9-withdrawal-history-item";

    const top = document.createElement("div");
    top.className = "U9-withdrawal-history-item-top";

    const amount = document.createElement("strong");
    amount.textContent = `${formatMoney(item.amount)} USDT`;

    const status = document.createElement("span");
    status.className = "U9-withdrawal-status";
    status.dataset.status = String(item.status || "pending");
    status.textContent = statusLabel(item.status);

    top.append(amount, status);

    const details = document.createElement("div");
    details.className = "U9-withdrawal-history-details";
    details.textContent = `Fee ${formatMoney(item.fee)} USDT · Received ${formatMoney(item.net_amount)} USDT`;

    const wallet = document.createElement("div");
    wallet.className = "U9-withdrawal-history-wallet";
    const address = String(item.wallet_address || "");
    wallet.textContent = address ? `${address.slice(0, 8)}…${address.slice(-6)}` : "Wallet address unavailable";
    wallet.title = address;

    const date = document.createElement("time");
    date.className = "U9-withdrawal-history-date";
    if (item.created_at) {
      const parsed = new Date(item.created_at);
      date.dateTime = parsed.toISOString ? item.created_at : "";
      date.textContent = Number.isNaN(parsed.getTime()) ? String(item.created_at) : parsed.toLocaleString();
    }

    card.append(top, details, wallet, date);
    return card;
  }

  async function loadHistory(reset) {
    if (historyLoading || !historyList) return;
    historyLoading = true;
    if (reset) {
      historyOffset = 0;
      historyList.replaceChildren();
    }
    if (historyRefreshButton) historyRefreshButton.disabled = true;
    if (historyMoreButton) historyMoreButton.disabled = true;

    try {
      const result = await apiRequest({ action: "history", limit: HISTORY_LIMIT, offset: historyOffset });
      const records = Array.isArray(result.data) ? result.data : [];
      if (reset && records.length === 0) {
        const empty = document.createElement("p");
        empty.className = "U9-withdrawal-history-empty";
        empty.textContent = "No withdrawal records yet.";
        historyList.appendChild(empty);
      } else {
        records.forEach((item) => historyList.appendChild(createHistoryItem(item)));
      }
      historyOffset += records.length;
      const total = Number(result.pagination?.total || 0);
      if (historyMoreButton) historyMoreButton.hidden = historyOffset >= total || records.length < HISTORY_LIMIT;
    } catch (error) {
      if (reset) {
        const errorText = document.createElement("p");
        errorText.className = "U9-withdrawal-history-empty is-error";
        errorText.textContent = error.message || "Unable to load withdrawal history.";
        historyList.appendChild(errorText);
      } else {
        showMessage(error.message || "Unable to load more records.", "error");
      }
    } finally {
      historyLoading = false;
      if (historyRefreshButton) historyRefreshButton.disabled = false;
      if (historyMoreButton) historyMoreButton.disabled = false;
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (isSubmitting || !form || !amountInput || !walletInput) return;
    showMessage("", "");

    const amountText = amountInput.value.trim();
    const amount = Number(amountText);
    const walletAddress = walletInput.value.trim();

    if (!/^\d{1,10}(?:\.\d{1,2})?$/.test(amountText) || !Number.isFinite(amount) || amount <= 0) {
      showMessage("Enter a valid amount with up to 2 decimal places.", "error");
      amountInput.focus();
      return;
    }
    if (amount > currentBalance) {
      showMessage("Insufficient balance.", "error");
      amountInput.focus();
      return;
    }
    if (!/^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(walletAddress)) {
      showMessage("Enter a valid USDT TRC20 wallet address.", "error");
      walletInput.focus();
      return;
    }

    const fee = calculateFee(amount);
    const net = Math.max(0, amount - fee);
    const confirmed = window.confirm(
      `Confirm USDT TRC20 withdrawal?\n\nAmount: ${formatMoney(amount)} USDT\nFee (1%): ${formatMoney(fee)} USDT\nEstimated received: ${formatMoney(net)} USDT\n\nWallet: ${walletAddress}`
    );
    if (!confirmed) return;

    isSubmitting = true;
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Submitting…";
    }

    try {
      const result = await apiRequest({
        action: "create",
        amount: amountText,
        wallet_address: walletAddress
      });
      const responseData = result.data || {};
      const withdrawal = responseData.withdrawal || {};
      if (responseData.balance !== undefined) setBalance(responseData.balance);
      else await loadInfo();

      amountInput.value = "";
      updateSummary();
      showMessage(
        `Withdrawal request submitted. Request ID: ${withdrawal.id || "created"}. Amount: ${formatMoney(withdrawal.amount ?? amount)} USDT; fee: ${formatMoney(withdrawal.fee ?? fee)} USDT; estimated received: ${formatMoney(withdrawal.net_amount ?? net)} USDT.`,
        "success"
      );

      if (historySection) historySection.hidden = false;
      await loadHistory(true);
    } catch (error) {
      showMessage(error.message || "Unable to submit withdrawal request.", "error");
    } finally {
      isSubmitting = false;
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = "Submit Withdrawal";
      }
    }
  }

  function applyHeaderUser(user) {
    if (!user || typeof user !== "object") return;
    updateUserInfo({ balance: user.balance, kyc: user.kyc });
  }

  function connectHeaderUser() {
    if (!window.U9User) return false;
    if (unsubscribeUser) return true;
    if (typeof window.U9User.subscribe === "function") {
      unsubscribeUser = window.U9User.subscribe((user, state) => {
        if (state === "AUTHENTICATED" && user) applyHeaderUser(user);
      });
    }
    if (
      typeof window.U9User.getState === "function" &&
      window.U9User.getState() === "AUTHENTICATED" &&
      typeof window.U9User.get === "function"
    ) {
      applyHeaderUser(window.U9User.get());
    }
    return true;
  }

  if (form) form.addEventListener("submit", handleSubmit);
  if (amountInput) amountInput.addEventListener("input", updateSummary);

  if (openWithdrawalButton) {
    openWithdrawalButton.addEventListener("click", () => {
      showMessage("", "");
      loadInfo();
      loadHistory(true);
    });
  }

  if (historyToggleButton) {
    historyToggleButton.addEventListener("click", () => {
      const willHide = historyList?.hidden !== true;
      if (historyList) historyList.hidden = willHide;
      if (historyMoreButton) historyMoreButton.hidden = willHide;
      historyToggleButton.textContent = willHide ? "Show" : "Hide";
      if (!willHide) loadHistory(true);
    });
  }

  if (historyRefreshButton) historyRefreshButton.addEventListener("click", () => loadHistory(true));
  if (historyMoreButton) historyMoreButton.addEventListener("click", () => loadHistory(false));

  if (verifiedButton) verifiedButton.type = "button";
  if (noticeButton) noticeButton.type = "button";
  if (noticeIcon && !noticeButton?.contains(noticeIcon)) {
    console.warn("U9 Withdrawal: Notice icon is outside its button.");
  }

  if (!connectHeaderUser()) {
    window.addEventListener("u9:user-ready", connectHeaderUser, { once: true });
  }

  updateSummary();

  window.U9ProfileWithdrawal = {
    setBalance,
    setKycStatus,
    updateUserInfo,
    refreshUserInfo: function () {
      if (window.U9User?.getState?.() === "AUTHENTICATED") {
        applyHeaderUser(window.U9User.get());
      }
    },
    refresh: loadInfo,
    loadHistory: () => loadHistory(true),
    getKycButton: () => verifiedButton,
    getNoticeButton: () => noticeButton,
    getKycIcon: () => verifiedIcon,
    getNoticeIcon: () => noticeIcon
  };
})();
