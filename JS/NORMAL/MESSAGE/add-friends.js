/* =========================================================
   U9 MESSAGE - ADD FRIEND PAGE
   Uses existing Supabase Edge Function: message-api

   Supported actions:
   - search_users
   - send_friend_request
   - list_friends
   - list_friend_requests

   This file only manages Add Friend page content.
   It does not manage the Message modal, navigation or header.
========================================================= */

(() => {
  "use strict";

  const MESSAGE_API_URL =
    "https://tvtakmswbzawaweytimx.supabase.co/functions/v1/message-api";

  const DEFAULT_AVATAR =
    "/SSVG/avatar/profile.svg";

  const DEFAULT_AVATAR_FRAME =
    "/SSVG/avatar/ordinary.svg";

  const root = document.getElementById(
    "Message-model-add-friends-root"
  );

  if (!root) {
    console.warn(
      "U9 Add Friend: page root was not found."
    );
    return;
  }

  /* =======================================================
     STATE
  ======================================================= */

  const friendIds = new Set();
  const pendingRequestIds = new Set();

  let displayedUsers = [];
  let isSearching = false;

  /* =======================================================
     PAGE CONTENT
  ======================================================= */

  root.innerHTML = `
    <div class="u9-af-container">

      <header class="u9-af-header">
        <h2 class="u9-af-heading">Add Friend</h2>

        <p class="u9-af-subtitle">
          Find people on U9 and send them a friend request.
        </p>
      </header>

      <section class="u9-af-panel">

        <form id="u9-af-search-form">

          <label
            class="u9-af-label"
            for="u9-af-search-input"
          >
            Username or Account
          </label>

          <div class="u9-af-search-row">

            <input
              id="u9-af-search-input"
              class="u9-af-input"
              type="search"
              name="search"
              maxlength="100"
              autocomplete="off"
              placeholder="Enter a username or account"
              aria-label="Search username or account"
              required
            >

            <button
              id="u9-af-search-button"
              class="u9-af-button"
              type="submit"
            >
              Search
            </button>

          </div>

          <div style="height: 17px"></div>

          <label
            class="u9-af-label"
            for="u9-af-initial-message"
          >
            Introduction (Optional)
          </label>

          <textarea
            id="u9-af-initial-message"
            class="u9-af-input u9-af-textarea"
            maxlength="1000"
            placeholder="Write a short message with your request..."
          ></textarea>

          <div
            id="u9-af-message-counter"
            class="u9-af-counter"
          >0 / 1000</div>

          <div
            id="u9-af-feedback"
            class="u9-af-feedback"
            role="status"
            aria-live="polite"
          ></div>

        </form>
      </section>

      <section class="u9-af-results-section">

        <h3 class="u9-af-results-heading">
          Search Results
        </h3>

        <p
          id="u9-af-results-status"
          class="u9-af-results-status"
          aria-live="polite"
        >
          Search by username or account to find someone.
        </p>

        <div
          id="u9-af-results"
          class="u9-af-results"
        ></div>

      </section>

    </div>
  `;

  const searchForm = root.querySelector(
    "#u9-af-search-form"
  );

  const searchInput = root.querySelector(
    "#u9-af-search-input"
  );

  const searchButton = root.querySelector(
    "#u9-af-search-button"
  );

  const initialMessageInput = root.querySelector(
    "#u9-af-initial-message"
  );

  const messageCounter = root.querySelector(
    "#u9-af-message-counter"
  );

  const feedback = root.querySelector(
    "#u9-af-feedback"
  );

  const resultsStatus = root.querySelector(
    "#u9-af-results-status"
  );

  const resultsContainer = root.querySelector(
    "#u9-af-results"
  );

  /* =======================================================
     AUTHENTICATION AND API
  ======================================================= */

  function getAuthToken() {
    try {
      return localStorage.getItem("u9_token") || "";
    } catch (error) {
      console.warn(
        "U9 Add Friend: unable to read session token.",
        error
      );

      return "";
    }
  }

  async function callMessageAPI(action, payload = {}) {
    const headers = {
      "Content-Type": "application/json"
    };

    const token = getAuthToken();

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
      console.error(
        "U9 Add Friend: Message API connection failed.",
        error
      );

      throw new Error(
        "Could not connect to the Message API. Please check your connection and site configuration."
      );
    }

    let data;

    try {
      data = await response.json();
    } catch {
      throw new Error(
        `The Message API returned an invalid response (${response.status}).`
      );
    }

    if (!response.ok || data.success === false) {
      throw new Error(
        data.error ||
        `Request failed (${response.status}).`
      );
    }

    return data;
  }

  /* =======================================================
     FEEDBACK
  ======================================================= */

  function showFeedback(message, type = "info") {
    feedback.textContent = message;

    feedback.className =
      "u9-af-feedback is-visible is-" + type;
  }

  function clearFeedback() {
    feedback.textContent = "";
    feedback.className = "u9-af-feedback";
  }

  function showResultsStatus(message) {
    resultsStatus.textContent = message;
    resultsStatus.hidden = false;
  }

  function hideResultsStatus() {
    resultsStatus.textContent = "";
    resultsStatus.hidden = true;
  }

  /* =======================================================
     SAFE IMAGE URLS
  ======================================================= */

  function getSafeImageUrl(value, fallback) {
    if (typeof value !== "string") {
      return fallback;
    }

    const url = value.trim();

    if (!url) {
      return fallback;
    }

    if (
      /^https?:\/\//i.test(url) ||
      (
        url.startsWith("/") &&
        !url.startsWith("//")
      ) ||
      /^data:image\//i.test(url)
    ) {
      return url;
    }

    return fallback;
  }

  function createAvatar(profile) {
    const wrapper = document.createElement("div");
    wrapper.className = "u9-af-avatar-wrap";

    const avatar = document.createElement("img");
    avatar.className = "u9-af-avatar";
    avatar.alt = "";
    avatar.loading = "lazy";

    avatar.src = getSafeImageUrl(
      profile.avatar_url,
      DEFAULT_AVATAR
    );

    avatar.onerror = () => {
      if (!avatar.dataset.fallbackApplied) {
        avatar.dataset.fallbackApplied = "true";
        avatar.src = DEFAULT_AVATAR;
      }
    };

    const frame = document.createElement("img");
    frame.className = "u9-af-frame";
    frame.alt = "";
    frame.setAttribute("aria-hidden", "true");
    frame.loading = "lazy";

    frame.src = getSafeImageUrl(
      profile.avatar_frame_url,
      DEFAULT_AVATAR_FRAME
    );

    frame.onerror = () => {
      if (!frame.dataset.fallbackApplied) {
        frame.dataset.fallbackApplied = "true";
        frame.src = DEFAULT_AVATAR_FRAME;
      }
    };

    wrapper.append(avatar, frame);

    return wrapper;
  }

  /* =======================================================
     RELATIONSHIP STATUS
  ======================================================= */

  function normalizeId(id) {
    return String(id || "").toLowerCase();
  }

  function getRequestButtonState(profile) {
    const id = normalizeId(profile.id);

    if (friendIds.has(id)) {
      return {
        label: "Already Friends",
        disabled: true,
        complete: true
      };
    }

    if (pendingRequestIds.has(id)) {
      return {
        label: "Request Sent",
        disabled: true,
        complete: true
      };
    }

    if (!profile.account) {
      return {
        label: "Unavailable",
        disabled: true,
        complete: true
      };
    }

    return {
      label: "Add Friend",
      disabled: false,
      complete: false
    };
  }

  /* =======================================================
     RENDER USER RESULT
  ======================================================= */

  function createUserCard(profile) {
    const card = document.createElement("article");
    card.className = "u9-af-user-card";

    card.appendChild(createAvatar(profile));

    const details = document.createElement("div");
    details.className = "u9-af-user-details";

    const username = document.createElement("p");
    username.className = "u9-af-username";
    username.textContent = profile.username || "User";

    const account = document.createElement("p");
    account.className = "u9-af-account";
    account.textContent =
      "Account: " + (profile.account || "Unavailable");

    details.append(username, account);

    const actionWrapper = document.createElement("div");
    actionWrapper.className = "u9-af-user-action";

    const button = document.createElement("button");
    button.type = "button";
    button.className =
      "u9-af-button u9-af-request-button";

    const state = getRequestButtonState(profile);

    button.textContent = state.label;
    button.disabled = state.disabled;

    if (state.complete) {
      button.classList.add("is-complete");
    }

    button.addEventListener("click", () => {
      sendFriendRequest(profile, button);
    });

    actionWrapper.appendChild(button);
    card.append(details, actionWrapper);

    return card;
  }

  function renderUsers(users) {
    displayedUsers = Array.isArray(users) ? users : [];
    resultsContainer.replaceChildren();

    if (displayedUsers.length === 0) {
      showResultsStatus(
        "No users found. Check the username or account and try again."
      );
      return;
    }

    hideResultsStatus();

    const fragment = document.createDocumentFragment();

    displayedUsers.forEach((profile) => {
      fragment.appendChild(createUserCard(profile));
    });

    resultsContainer.appendChild(fragment);
  }

  /* =======================================================
     SEARCH USERS
  ======================================================= */

  async function searchUsers() {
    if (isSearching) {
      return;
    }

    const q = searchInput.value.trim();

    if (q.length < 2) {
      showFeedback(
        "Enter at least 2 characters to search.",
        "error"
      );

      searchInput.focus();
      return;
    }

    isSearching = true;
    searchButton.disabled = true;
    searchButton.textContent = "Searching...";

    clearFeedback();
    resultsContainer.replaceChildren();

    showResultsStatus("Searching for users...");

    try {
      const data = await callMessageAPI(
        "search_users",
        { q }
      );

      const users = Array.isArray(data.users)
        ? data.users
        : [];

      renderUsers(users);

      if (users.length > 0) {
        showFeedback(
          `Found ${users.length} user(s).`,
          "success"
        );
      }
    } catch (error) {
      console.error(
        "U9 Add Friend: search failed.",
        error
      );

      showResultsStatus(
        "Could not load search results."
      );

      showFeedback(
        error.message || "Could not search for users.",
        "error"
      );
    } finally {
      isSearching = false;
      searchButton.disabled = false;
      searchButton.textContent = "Search";
    }
  }

  searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    searchUsers();
  });

  /* =======================================================
     SEND FRIEND REQUEST
  ======================================================= */

  async function sendFriendRequest(profile, button) {
    const id = normalizeId(profile.id);

    if (friendIds.has(id)) {
      button.textContent = "Already Friends";
      button.disabled = true;
      return;
    }

    if (pendingRequestIds.has(id)) {
      button.textContent = "Request Sent";
      button.disabled = true;
      return;
    }

    if (!profile.account) {
      showFeedback(
        "This user's account is unavailable.",
        "error"
      );
      return;
    }

    const oldLabel = button.textContent;

    button.disabled = true;
    button.textContent = "Sending...";

    try {
      const initialMessage =
        initialMessageInput.value.trim();

      await callMessageAPI(
        "send_friend_request",
        {
          receiver_account: profile.account,
          initial_message: initialMessage
        }
      );

      pendingRequestIds.add(id);

      button.textContent = "Request Sent";
      button.classList.add("is-complete");

      showFeedback(
        `Friend request sent to ${profile.username || profile.account}.`,
        "success"
      );
    } catch (error) {
      const message = error.message ||
        "Could not send friend request.";

      const normalizedMessage =
        message.toLowerCase();

      if (normalizedMessage.includes("already friends")) {
        friendIds.add(id);
        button.textContent = "Already Friends";
        button.classList.add("is-complete");
      } else if (
        normalizedMessage.includes("pending friend request already exists")
      ) {
        pendingRequestIds.add(id);
        button.textContent = "Request Sent";
        button.classList.add("is-complete");
      } else {
        button.textContent = oldLabel;
      }

      showFeedback(message, "error");
      console.error(
        "U9 Add Friend: sending request failed.",
        error
      );
    } finally {
      button.disabled =
        friendIds.has(id) ||
        pendingRequestIds.has(id) ||
        !profile.account;
    }
  }

  /* =======================================================
     LOAD EXISTING FRIENDS AND SENT REQUESTS
  ======================================================= */

  async function loadRelationships() {
    try {
      const [friendsData, requestsData] =
        await Promise.all([
          callMessageAPI("list_friends"),
          callMessageAPI("list_friend_requests")
        ]);

      friendIds.clear();
      pendingRequestIds.clear();

      for (const item of friendsData.friends || []) {
        const id = normalizeId(item.friend?.id);

        if (id) {
          friendIds.add(id);
        }
      }

      for (const request of requestsData.sent || []) {
        if (request.status !== "pending") {
          continue;
        }

        const id = normalizeId(request.receiver?.id);

        if (id) {
          pendingRequestIds.add(id);
        }
      }

      if (displayedUsers.length > 0) {
        renderUsers(displayedUsers);
      }
    } catch (error) {
      // The main search/request flow will display its own errors.
      console.warn(
        "U9 Add Friend: relationship status could not be refreshed.",
        error.message
      );
    }
  }

  /* =======================================================
     OPTIONAL MESSAGE COUNTER
  ======================================================= */

  initialMessageInput.addEventListener("input", () => {
    messageCounter.textContent =
      `${initialMessageInput.value.length} / 1000`;
  });

  /* =======================================================
     INITIALIZE
  ======================================================= */

  showResultsStatus(
    "Search by username or account to find someone."
  );

  loadRelationships();

  console.log("U9 Add Friend page initialized.");
})();
