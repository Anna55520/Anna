/* =========================================================
   U9 MESSAGE — ADD FRIEND
   File: JS/NORMAL/MESSAGE/add-friends.js

   Uses existing Supabase Edge Function: message-api

   Actions:
   - search_users          (Account only; exact 6-character account)
   - send_friend_request
   - list_friend_requests
   - respond_friend_request

   UI behavior:
   - No standalone "Search Results" heading/panel
   - No standalone "Received Requests" panel
   - Search results appear directly below the account search form
   - Sent Requests panel remains
   - "观看" button is intentionally inert

   Does not modify:
   - normal-message.js
   - friends.js
   - chat.js
   - profile/avatar modules
   ========================================================= */

(() => {
  "use strict";

  if (window.U9AddFriendsModuleLoaded) return;
  window.U9AddFriendsModuleLoaded = true;

  const MESSAGE_API_URL =
    "https://tvtakmswbzawaweytimx.supabase.co/functions/v1/message-api";

  const DEFAULT_AVATAR = "/SSVG/avatar/profile.svg";
  const DEFAULT_FRAME = "/SSVG/avatar/ordinary.svg";
  const ROOT_ID = "Message-model-add-friends-root";

  let initialized = false;
  let requestBusy = false;
  let searchResults = [];
  let hasSearched = false;

  let requestData = {
    received: [],
    sent: []
  };

  let searchSequence = 0;
  let refreshSequence = 0;

  /* =========================================================
     HELPERS
  ========================================================= */

  const escapeHTML = (value) =>
    String(value ?? "").replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[char]);

  function getRoot() {
    return document.getElementById(ROOT_ID);
  }

  function getSessionToken() {
    const possibleKeys = [
      "u9_token",
      "u9_session",
      "session_token",
      "access_token"
    ];

    for (const key of possibleKeys) {
      try {
        const value = localStorage.getItem(key);

        if (value && value.trim()) {
          return value.trim();
        }
      } catch (_) {
        // Storage may be unavailable; try the cookie below.
      }
    }

    try {
      const match = document.cookie.match(
        /(?:^|;\s*)u9_session=([^;]+)/
      );

      if (match?.[1]) {
        return decodeURIComponent(match[1]);
      }
    } catch (_) {
      // The API will report an authentication error if necessary.
    }

    return "";
  }

  async function callMessageAPI(action, payload = {}) {
    const token = getSessionToken();

    const headers = {
      "Content-Type": "application/json"
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    let response;

    try {
      response = await fetch(MESSAGE_API_URL, {
        method: "POST",
        headers,
        credentials: "include",
        cache: "no-store",
        body: JSON.stringify({
          action,
          ...payload
        })
      });
    } catch (error) {
      console.error("U9 Add Friend network error:", error);

      throw new Error(
        "Network error. Please check your connection and try again."
      );
    }

    let result;

    try {
      result = await response.json();
    } catch (_) {
      throw new Error(
        `The server returned an invalid response (${response.status}).`
      );
    }

    if (!response.ok || result?.success === false) {
      throw new Error(
        result?.error || `Request failed (${response.status}).`
      );
    }

    return result;
  }

  function setNotice(message = "", type = "") {
    const notice = getRoot()?.querySelector("#u9-af-notice");

    if (!notice) return;

    notice.textContent = message;
    notice.className = "u9-af-notice";

    if (type === "success") {
      notice.classList.add("is-success");
    }

    if (type === "error") {
      notice.classList.add("is-error");
    }
  }

  function setButtonBusy(
    button,
    busy,
    busyText = "Please wait…"
  ) {
    if (!button) return;

    if (busy) {
      if (!button.hasAttribute("data-original-text")) {
        button.dataset.originalText = button.textContent;
      }

      button.textContent = busyText;
      button.disabled = true;
      return;
    }

    if (button.dataset.originalText !== undefined) {
      button.textContent = button.dataset.originalText;
      delete button.dataset.originalText;
    }

    button.disabled = false;
  }

  function normalizeAccount(value) {
    return String(value ?? "")
      .trim()
      .toUpperCase();
  }

  function isValidAccount(value) {
    return /^[A-Z][A-Z0-9]{5}$/.test(value);
  }

  /* =========================================================
     AVATAR / AVATAR FRAME

     Uses CSS/NORMAL/MESSAGE/add-friends.css

     SVG locations:
     - Default avatar: /SSVG/avatar/profile.svg
     - Default frame:  /SSVG/avatar/ordinary.svg

     The avatar/frame dimensions and positioning are controlled
     by CSS, matching the proportions in friends.css.
  ========================================================= */

  function getAvatar(profile) {
    const url = profile?.avatar_url;

    return typeof url === "string" && url.trim()
      ? url.trim()
      : DEFAULT_AVATAR;
  }

  function getFrame(profile) {
    const url = profile?.avatar_frame_url;

    return typeof url === "string" && url.trim()
      ? url.trim()
      : DEFAULT_FRAME;
  }

  function avatarMarkup(profile = {}) {
    const username = escapeHTML(profile.username || "User");
    const avatar = escapeHTML(getAvatar(profile));
    const frame = escapeHTML(getFrame(profile));

    const fallbackAvatar = escapeHTML(DEFAULT_AVATAR);
    const fallbackFrame = escapeHTML(DEFAULT_FRAME);

    return `
      <div class="u9-af-avatar-stack" aria-hidden="true">
        <img
          class="u9-af-avatar"
          src="${avatar}"
          alt="${username}"
          loading="lazy"
          onerror="this.onerror=null;this.src='${fallbackAvatar}'"
        >

        <img
          class="u9-af-avatar-frame"
          src="${frame}"
          alt=""
          loading="lazy"
          onerror="this.onerror=null;this.src='${fallbackFrame}'"
        >
      </div>
    `;
  }

  /* =========================================================
     REQUEST STATUS
  ========================================================= */

  function statusMarkup(status) {
    const value = String(status || "pending").toLowerCase();

    const labels = {
      pending: "Pending",
      accepted: "Accepted",
      rejected: "Rejected",
      cancelled: "Cancelled"
    };

    return `
      <span class="u9-af-status u9-af-status-${escapeHTML(value)}">
        ${escapeHTML(labels[value] || value)}
      </span>
    `;
  }

  function hasPendingRequest(items, fieldName, userId) {
    return (Array.isArray(items) ? items : []).some((request) =>
      String(request?.[fieldName] ?? "") ===
        String(userId ?? "") &&
      String(request?.status ?? "").toLowerCase() === "pending"
    );
  }

  /* =========================================================
     PAGE HTML

     No standalone Search Results panel.
     No standalone Received Requests panel.
     Search cards appear directly below the search form.
  ========================================================= */

  function renderShell() {
    const root = getRoot();

    if (!root) return false;

    root.innerHTML = `
      <div class="u9-af-page">

        <header class="u9-af-header">
          <h2 class="u9-af-heading">Add Friend</h2>

          <p class="u9-af-subtitle">
            Find people on U9 and send them a friend request.
          </p>
        </header>

        <div
          id="u9-af-notice"
          class="u9-af-notice"
          role="status"
          aria-live="polite"
        ></div>

        <section
          class="u9-af-panel"
          aria-labelledby="u9-af-search-title"
        >
          <div class="u9-af-panel-heading">
            <h3
              class="u9-af-panel-title"
              id="u9-af-search-title"
            >
              Search Users
            </h3>
          </div>

          <form
            id="u9-af-search-form"
            class="u9-af-search-form"
          >
            <div>
              <label
                class="u9-af-label"
                for="u9-af-account"
              >
                Account
              </label>

              <div class="u9-af-search-row">
                <input
                  id="u9-af-account"
                  class="u9-af-input"
                  name="account"
                  type="text"
                  placeholder="Enter 6-character account"
                  maxlength="6"
                  minlength="6"
                  pattern="[A-Za-z][A-Za-z0-9]{5}"
                  autocomplete="off"
                  autocapitalize="characters"
                  spellcheck="false"
                  required
                >

                <button
                  class="u9-af-search-button"
                  id="u9-af-search-button"
                  type="submit"
                >Search</button>
              </div>

              <p class="u9-af-subtitle">
                Search by Account only. Username search is disabled.
              </p>
            </div>

            <div>
              <label
                class="u9-af-label"
                for="u9-af-introduction"
              >
                Introduction (Optional)
              </label>

              <textarea
                id="u9-af-introduction"
                class="u9-af-textarea"
                maxlength="1000"
                placeholder="Write a short message with your request…"
              ></textarea>

              <span
                class="u9-af-counter"
                id="u9-af-intro-counter"
              >0 / 1000</span>
            </div>
          </form>

          <!-- Search results are displayed inline below the form. -->
          <div
            class="u9-af-list"
            id="u9-af-results"
            aria-live="polite"
          >
            <div class="u9-af-empty">
              Enter an Account to find a U9 user.
            </div>
          </div>
        </section>

        <section
          class="u9-af-panel"
          aria-labelledby="u9-af-sent-title"
        >
          <div class="u9-af-panel-heading">
            <h3
              class="u9-af-panel-title"
              id="u9-af-sent-title"
            >
              Sent Requests
            </h3>

            <span
              class="u9-af-count"
              id="u9-af-sent-count"
            >0</span>
          </div>

          <div
            class="u9-af-list"
            id="u9-af-sent"
          >
            <div class="u9-af-empty">
              Loading sent requests…
            </div>
          </div>
        </section>

      </div>
    `;

    return true;
  }

  /* =========================================================
     SEARCH RESULT CARDS
  ========================================================= */

  function renderSearchResults() {
    const root = getRoot();
    const list = root?.querySelector("#u9-af-results");

    if (!list) return;

    if (!searchResults.length) {
      list.innerHTML = hasSearched
        ? `
          <div class="u9-af-empty">
            No user found with that Account.
          </div>
        `
        : `
          <div class="u9-af-empty">
            Enter an Account to find a U9 user.
          </div>
        `;

      return;
    }

    list.innerHTML = searchResults.map((user) => {
      const id = escapeHTML(user.id);
      const username = escapeHTML(user.username || "User");
      const account = escapeHTML(user.account || "—");

      const outgoingPending = hasPendingRequest(
        requestData.sent,
        "receiver_id",
        user.id
      );

      const incomingPending = hasPendingRequest(
        requestData.received,
        "sender_id",
        user.id
      );

      let requestButton;

      if (outgoingPending) {
        requestButton = `
          <button
            type="button"
            class="u9-af-button u9-af-button-sent"
            disabled
          >
            Request Sent
          </button>
        `;
      } else if (incomingPending) {
        /*
         * The Received Requests section has been removed.
         * Show the incoming status here to avoid treating it
         * as a new outgoing request.
         */
        requestButton = `
          <button
            type="button"
            class="u9-af-button u9-af-button-secondary"
            disabled
          >
            Request Received
          </button>
        `;
      } else {
        requestButton = `
          <button
            type="button"
            class="u9-af-button u9-af-button-primary"
            data-action="send-request"
            data-user-id="${id}"
          >
            Add Friend
          </button>
        `;
      }

      return `
        <article
          class="u9-af-user-card"
          data-user-id="${id}"
        >
          ${avatarMarkup(user)}

          <div class="u9-af-user-info">
            <p class="u9-af-username">
              ${username}
            </p>

            <p class="u9-af-account">
              Account: ${account}
            </p>
          </div>

          <div class="u9-af-card-actions">
            ${requestButton}

            <button
              type="button"
              class="u9-af-button u9-af-button-secondary"
              data-action="view-user"
              data-user-id="${id}"
            >
              观看
            </button>
          </div>
        </article>
      `;
    }).join("");
  }

  /* =========================================================
     SENT REQUESTS
  ========================================================= */

  function renderSentRequests() {
    const root = getRoot();

    const list = root?.querySelector("#u9-af-sent");
    const count = root?.querySelector("#u9-af-sent-count");

    if (!list || !count) return;

    const sent = Array.isArray(requestData.sent)
      ? requestData.sent
      : [];

    const pendingCount = sent.filter((item) =>
      String(item?.status ?? "").toLowerCase() === "pending"
    ).length;

    count.textContent = String(pendingCount);

    if (!sent.length) {
      list.innerHTML = `
        <div class="u9-af-empty">
          You haven't sent any friend requests yet.
        </div>
      `;

      return;
    }

    list.innerHTML = sent.map((request) => {
      const profile = request?.receiver || {};
      const status = String(
        request?.status || "pending"
      ).toLowerCase();

      return `
        <article class="u9-af-user-card">
          ${avatarMarkup(profile)}

          <div class="u9-af-user-info">
            <p class="u9-af-username">
              ${escapeHTML(profile.username || "User")}
            </p>

            <p class="u9-af-account">
              Account: ${escapeHTML(profile.account || "—")}
            </p>

            ${
              request?.initial_message
                ? `
                  <p class="u9-af-intro">
                    ${escapeHTML(request.initial_message)}
                  </p>
                `
                : ""
            }
          </div>

          <div class="u9-af-card-actions">
            ${statusMarkup(status)}
          </div>
        </article>
      `;
    }).join("");
  }

  /* =========================================================
     LOAD FRIEND REQUEST DATA

     Requests are loaded from the existing message-api.
     Only Sent Requests are rendered as a separate panel.
  ========================================================= */

  async function loadFriendRequests(options = {}) {
    const currentSequence = ++refreshSequence;

    const root = getRoot();
    const sentList = root?.querySelector("#u9-af-sent");

    if (
      !options.silent &&
      sentList &&
      requestData.sent.length === 0
    ) {
      sentList.innerHTML = `
        <div class="u9-af-empty">
          Loading sent requests…
        </div>
      `;
    }

    try {
      const result = await callMessageAPI(
        "list_friend_requests"
      );

      if (currentSequence !== refreshSequence) return;

      requestData = {
        received: Array.isArray(result?.received)
          ? result.received
          : [],

        sent: Array.isArray(result?.sent)
          ? result.sent
          : []
      };

      renderSentRequests();
      renderSearchResults();
    } catch (error) {
      if (currentSequence !== refreshSequence) return;

      console.error(
        "U9 Add Friend: request list failed:",
        error
      );

      if (sentList) {
        sentList.innerHTML = `
          <div class="u9-af-empty">
            Could not load sent requests:
            ${escapeHTML(error.message)}
          </div>
        `;
      }

      setNotice(error.message, "error");
    }
  }

  /* =========================================================
     ACCOUNT-ONLY SEARCH

     message-api search_users accepts q.
     Exact account filtering is enforced on the client.
  ========================================================= */

  async function searchByAccount(account) {
    const normalized = normalizeAccount(account);

    if (!isValidAccount(normalized)) {
      throw new Error(
        "Enter a valid 6-character Account (first character must be a letter)."
      );
    }

    const currentSequence = ++searchSequence;
    hasSearched = true;

    const root = getRoot();

    const list = root?.querySelector("#u9-af-results");
    const button = root?.querySelector("#u9-af-search-button");

    searchResults = [];

    if (list) {
      list.innerHTML = `
        <div class="u9-af-empty">
          Searching Account…
        </div>
      `;
    }

    setButtonBusy(button, true, "Searching…");

    try {
      const result = await callMessageAPI(
        "search_users",
        {
          q: normalized
        }
      );

      // Ignore an older response if another search has started.
      if (currentSequence !== searchSequence) return;

      const users = Array.isArray(result?.users)
        ? result.users
        : [];

      // Only exact Account matches are displayed.
      searchResults = users.filter(
        (user) => normalizeAccount(user?.account) === normalized
      );

      renderSearchResults();

      if (searchResults.length) {
        setNotice(
          `Found ${searchResults.length} user(s).`,
          "success"
        );
      } else {
        setNotice(
          "No user found with that Account."
        );
      }
    } finally {
      if (currentSequence === searchSequence) {
        setButtonBusy(button, false);
      }
    }
  }

  /* =========================================================
     SEND FRIEND REQUEST
  ========================================================= */

  async function sendRequestForUser(userId, button) {
    const user = searchResults.find(
      (item) => String(item?.id) === String(userId)
    );

    if (!user) {
      throw new Error(
        "User not found in the current search results."
      );
    }

    if (requestBusy) return;

    requestBusy = true;
    setButtonBusy(button, true, "Sending…");

    const root = getRoot();

    const intro =
      root?.querySelector("#u9-af-introduction")?.value || "";

    try {
      await callMessageAPI(
        "send_friend_request",
        {
          receiver_account: user.account,
          initial_message: intro.trim()
        }
      );

      setNotice(
        `Friend request sent to ${user.username || user.account}.`,
        "success"
      );

      await loadFriendRequests({
        silent: true
      });

      renderSearchResults();
    } finally {
      requestBusy = false;

      if (button?.isConnected) {
        setButtonBusy(button, false);
      }
    }
  }

  /* =========================================================
     RESPOND TO REQUEST

     Kept available for compatibility with the existing API.
     There is currently no Received Requests panel or button.
  ========================================================= */

  async function respondToRequest(
    requestId,
    decision,
    button
  ) {
    if (requestBusy) return;

    requestBusy = true;

    setButtonBusy(
      button,
      true,
      decision === "accept"
        ? "Accepting…"
        : "Rejecting…"
    );

    try {
      await callMessageAPI(
        "respond_friend_request",
        {
          request_id: requestId,
          decision
        }
      );

      setNotice(
        decision === "accept"
          ? "Friend request accepted."
          : "Friend request rejected.",
        "success"
      );

      await loadFriendRequests({
        silent: true
      });
    } finally {
      requestBusy = false;

      if (button?.isConnected) {
        setButtonBusy(button, false);
      }
    }
  }

  /* =========================================================
     EVENTS
  ========================================================= */

  function bindEvents() {
    const root = getRoot();

    if (!root || root.dataset.u9AfBound === "true") {
      return;
    }

    root.dataset.u9AfBound = "true";

    /* Search form */

    root.addEventListener("submit", async (event) => {
      if (event.target?.id !== "u9-af-search-form") {
        return;
      }

      event.preventDefault();
      setNotice();

      const account =
        root.querySelector("#u9-af-account")?.value || "";

      hasSearched = true;

      try {
        await searchByAccount(account);
      } catch (error) {
        console.error(
          "U9 Add Friend search failed:",
          error
        );

        setNotice(error.message, "error");

        const list = root.querySelector("#u9-af-results");

        if (list) {
          list.innerHTML = `
            <div class="u9-af-empty">
              ${escapeHTML(error.message)}
            </div>
          `;
        }
      }
    });

    /* Input fields */

    root.addEventListener("input", (event) => {
      if (event.target?.id === "u9-af-account") {
        const input = event.target;
        const start = input.selectionStart;

        input.value = normalizeAccount(input.value)
          .replace(/[^A-Z0-9]/g, "")
          .slice(0, 6);

        try {
          input.setSelectionRange(start, start);
        } catch (_) {
          // Some input types do not support selection ranges.
        }
      }

      if (event.target?.id === "u9-af-introduction") {
        const counter =
          root.querySelector("#u9-af-intro-counter");

        if (counter) {
          counter.textContent =
            `${event.target.value.length} / 1000`;
        }
      }
    });

    /* Card actions */

    root.addEventListener("click", async (event) => {
      const button = event.target.closest(
        "button[data-action]"
      );

      if (!button || !root.contains(button)) {
        return;
      }

      const action = button.dataset.action;

      // "观看" is intentionally a placeholder button.
      if (action === "view-user") {
        return;
      }

      if (
        action !== "send-request" &&
        action !== "accept-request" &&
        action !== "reject-request"
      ) {
        return;
      }

      setNotice();

      try {
        if (action === "send-request") {
          await sendRequestForUser(
            button.dataset.userId,
            button
          );
        } else if (action === "accept-request") {
          await respondToRequest(
            button.dataset.requestId,
            "accept",
            button
          );
        } else if (action === "reject-request") {
          await respondToRequest(
            button.dataset.requestId,
            "reject",
            button
          );
        }
      } catch (error) {
        console.error(
          "U9 Add Friend action failed:",
          error
        );

        setNotice(error.message, "error");
      }
    });
  }

  /* =========================================================
     INITIALIZATION

     normal-message.js expects:
     window.initializeAddFriendsPage
  ========================================================= */

  function initializeAddFriendsPage() {
    const root = getRoot();

    if (!root) {
      console.warn(
        "U9 Add Friend: root element not found:",
        ROOT_ID
      );

      return false;
    }

    renderShell();
    bindEvents();

    initialized = true;

    const intro =
      root.querySelector("#u9-af-introduction");

    const counter =
      root.querySelector("#u9-af-intro-counter");

    if (intro && counter) {
      counter.textContent =
        `${intro.value.length} / 1000`;
    }

    loadFriendRequests();

    console.info(
      "U9 Add Friend page initialized."
    );

    return true;
  }

  // Required by normal-message.js page manager.
  window.initializeAddFriendsPage =
    initializeAddFriendsPage;

  // Optional manual refresh hook for debugging.
  window.refreshAddFriendsPage = () => {
    if (!initialized) {
      return initializeAddFriendsPage();
    }

    return loadFriendRequests();
  };

  // Initialize immediately only if the page is already active.
  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      () => {
        if (getRoot()?.closest(".active")) {
          initializeAddFriendsPage();
        }
      },
      { once: true }
    );
  } else if (getRoot()?.closest(".active")) {
    initializeAddFriendsPage();
  }

  console.info("U9 Add Friend module ready.");
})();
