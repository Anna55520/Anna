
/* =========================================================
   U9 MESSAGE - ADD FRIEND PAGE
   File: JS/NORMAL/MESSAGE/add-friends.js

   Uses existing Supabase Edge Function:
   message-api

   Supported actions:
   - search_users
   - send_friend_request
   - list_friends
   - list_friend_requests
   - respond_friend_request

   Avatar handling aligned with the working Friends page:
   - uploaded/custom avatar URLs
   - free avatars resolved from /api/avatar-free
   - avatar frame URL/type/ID compatibility

   This file only manages Add Friend page content.
   It does not manage:
   - Message modal
   - navigation
   - header
   - friends.js
   - chat.js
   ========================================================= */

(() => {
  "use strict";

  /*
   * Prevent duplicate module initialization.
   */
  if (window.U9AddFriendsModuleLoaded) {
    return;
  }

  window.U9AddFriendsModuleLoaded = true;

  const MESSAGE_API_URL = "/api/message-api";

  const DEFAULT_AVATAR =
    "/SSVG/avatar/profile.svg";

  const DEFAULT_AVATAR_FRAME =
    "/SSVG/avatar/ordinary.svg";

  const ROOT_ID =
    "Message-model-add-friends-root";

  const root = document.getElementById(ROOT_ID);

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

  /*
   * IDs of users that currently have an outgoing
   * pending friend request.
   */
  const pendingRequestIds = new Set();

  /*
   * Received pending requests.
   *
   * Key:
   *   sender user id
   *
   * Value:
   *   complete request object
   */
  const receivedRequests = new Map();

  let displayedUsers = [];

  let isSearching = false;
  let requestBusy = false;
  let relationshipLoading = false;

  /* =======================================================
     PAGE CONTENT
  ======================================================= */

  root.innerHTML = `
    <div class="u9-af-container">

      <header class="u9-af-header">
        <h2 class="u9-af-heading">
          Add Friend
        </h2>

        <p class="u9-af-subtitle">
          Find people on U9 and send them a friend request.
        </p>
      </header>


      <!-- =================================================
           SEARCH
      ================================================== -->

      <section class="u9-af-panel">

        <form id="u9-af-search-form">

          <label
            class="u9-af-label"
            for="u9-af-search-input"
          >
            Account
          </label>

          <div class="u9-af-search-row">

            <input
              id="u9-af-search-input"
              class="u9-af-input"
              type="search"
              name="search"
              maxlength="100"
              autocomplete="off"
              placeholder="Enter the full account (e.g. A1B2C3)"
              aria-label="Search by account only"
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
          >
            0 / 1000
          </div>


          <div
            id="u9-af-feedback"
            class="u9-af-feedback"
            role="status"
            aria-live="polite"
          ></div>

        </form>

      </section>


      <!-- =================================================
           SEARCH RESULTS
      ================================================== -->

      <section class="u9-af-results-section">

        <h3 class="u9-af-results-heading">
          Search Results
        </h3>

        <p
          id="u9-af-results-status"
          class="u9-af-results-status"
          aria-live="polite"
        >
          Search by exact account to find someone.
        </p>

        <div
          id="u9-af-results"
          class="u9-af-results"
        ></div>

      </section>


      <!-- =================================================
           RECEIVED REQUESTS
      ================================================== -->

      <section
        class="u9-af-requests-section"
        aria-labelledby="u9-af-received-heading"
      >

        <div class="u9-af-requests-header">

          <h3
            id="u9-af-received-heading"
            class="u9-af-results-heading"
          >
            Received Requests
          </h3>

          <span
            id="u9-af-received-count"
            class="u9-af-count"
          >
            0
          </span>

        </div>


        <p
          id="u9-af-received-status"
          class="u9-af-results-status"
          aria-live="polite"
        >
          Loading friend requests...
        </p>


        <div
          id="u9-af-received"
          class="u9-af-request-list"
        ></div>

      </section>


      <!-- =================================================
           SENT REQUESTS
      ================================================== -->

      <section
        class="u9-af-requests-section"
        aria-labelledby="u9-af-sent-heading"
      >

        <div class="u9-af-requests-header">

          <h3
            id="u9-af-sent-heading"
            class="u9-af-results-heading"
          >
            Sent Requests
          </h3>

          <span
            id="u9-af-sent-count"
            class="u9-af-count"
          >
            0
          </span>

        </div>


        <p
          id="u9-af-sent-status"
          class="u9-af-results-status"
          aria-live="polite"
        >
          Loading friend requests...
        </p>


        <div
          id="u9-af-sent"
          class="u9-af-request-list"
        ></div>

      </section>

    </div>
  `;


  /* =======================================================
     ELEMENTS
  ======================================================= */

  const searchForm =
    root.querySelector("#u9-af-search-form");

  const searchInput =
    root.querySelector("#u9-af-search-input");

  const searchButton =
    root.querySelector("#u9-af-search-button");

  const initialMessageInput =
    root.querySelector("#u9-af-initial-message");

  const messageCounter =
    root.querySelector("#u9-af-message-counter");

  const feedback =
    root.querySelector("#u9-af-feedback");

  const resultsStatus =
    root.querySelector("#u9-af-results-status");

  const resultsContainer =
    root.querySelector("#u9-af-results");

  const receivedContainer =
    root.querySelector("#u9-af-received");

  const receivedStatus =
    root.querySelector("#u9-af-received-status");

  const receivedCount =
    root.querySelector("#u9-af-received-count");

  const sentContainer =
    root.querySelector("#u9-af-sent");

  const sentStatus =
    root.querySelector("#u9-af-sent-status");

  const sentCount =
    root.querySelector("#u9-af-sent-count");


  /* =======================================================
     AUTHENTICATION
  ======================================================= */

  function getAuthToken() {
    const possibleKeys = [
      "u9_token",
      "u9_session",
      "session_token",
      "access_token"
    ];

    for (const key of possibleKeys) {
      try {
        const value =
          localStorage.getItem(key);

        if (
          typeof value === "string" &&
          value.trim()
        ) {
          return value.trim();
        }
      } catch (_) {
        // Continue.
      }
    }

    return "";
  }


  /* =======================================================
     MESSAGE API
  ======================================================= */

  async function callMessageAPI(
    action,
    payload = {}
  ) {
    const headers = {
      "Content-Type": "application/json"
    };

    const token = getAuthToken();

    if (token) {
      headers.Authorization =
        `Bearer ${token}`;
    }

    let response;

    try {
      response = await fetch(
        MESSAGE_API_URL,
        {
          method: "POST",
          headers,
          credentials: "include",
          cache: "no-store",
          body: JSON.stringify({
            action,
            ...payload
          })
        }
      );
    } catch (error) {

      console.error(
        "U9 Add Friend: Message API connection failed.",
        error
      );

      throw new Error(
        "Could not connect to the Message API. Please check your connection and try again."
      );
    }


    let data;

    try {
      data = await response.json();
    } catch (_) {

      throw new Error(
        `The Message API returned an invalid response (${response.status}).`
      );
    }


    if (
      !response.ok ||
      data?.success === false
    ) {

      throw new Error(
        data?.error ||
        `Request failed (${response.status}).`
      );
    }


    return data;
  }


  /* =======================================================
     FEEDBACK
  ======================================================= */

  function showFeedback(
    message,
    type = "info"
  ) {
    feedback.textContent =
      message;

    feedback.className =
      "u9-af-feedback is-visible is-" +
      type;
  }


  function clearFeedback() {
    feedback.textContent = "";

    feedback.className =
      "u9-af-feedback";
  }


  function showResultsStatus(
    message
  ) {
    resultsStatus.textContent =
      message;

    resultsStatus.hidden =
      false;
  }


  function hideResultsStatus() {
    resultsStatus.textContent = "";

    resultsStatus.hidden =
      true;
  }


  /* =======================================================
     HELPERS
  ======================================================= */

  function normalizeId(id) {
    return String(
      id || ""
    ).toLowerCase();
  }


  function formatDate(value) {
    if (!value) {
      return "";
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "";
    }

    return date.toLocaleString();
  }


  function getSafeImageUrl(
    value,
    fallback
  ) {
    if (
      typeof value !== "string"
    ) {
      return fallback;
    }

    const url =
      value.trim();

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


  /* =======================================================
     AVATAR RESOLUTION
     Mirrors the working Friends page:
     - uploaded/custom avatar URLs
     - free avatars resolved by avatar ID through /api/avatar-free
     - snake_case and camelCase fields
     - raw SVG, data URLs, local paths, and public Supabase Storage URLs
     - selected avatar frames and independent image fallbacks
  ======================================================= */

  const FREE_AVATAR_API_URL = "/api/avatar-free";
  let freeAvatarMapPromise = null;

  const SUPABASE_STORAGE_HOSTS = new Map([
    ["tvtakmswbzawaweytimx.supabase.co", "/storage/"],
    ["vjlpowhxmflpkjlukkfy.supabase.co", "/storage-2/"]
  ]);

  function normalizeImageURL(value) {
    if (typeof value !== "string") return "";
    const source = value.trim();
    if (!source) return "";

    if (/^<svg\b/i.test(source) || /^<\?xml[\s\S]*?<svg\b/i.test(source)) {
      return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(source);
    }

    if (/^data:image\/[a-z0-9.+-]+(?:;[^,]*)?,/i.test(source)) {
      return source;
    }

    if (source.startsWith("/") && !source.startsWith("//")) {
      return source;
    }

    let parsed;
    try {
      parsed = new URL(source, window.location.origin);
    } catch (_) {
      return "";
    }

    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      return "";
    }

    const proxyPrefix = SUPABASE_STORAGE_HOSTS.get(parsed.hostname.toLowerCase());
    const publicStoragePrefix = "/storage/v1/object/public/";

    if (proxyPrefix && parsed.pathname.startsWith(publicStoragePrefix)) {
      const storagePath = parsed.pathname.slice(publicStoragePrefix.length);
      return proxyPrefix + storagePath + parsed.search + parsed.hash;
    }

    return parsed.href;
  }

  function firstImageValue(...values) {
    for (const value of values) {
      if (typeof value === "string" && value.trim()) return value.trim();
      if (value && typeof value === "object") {
        const nested = value.url || value.custom_url || value.image_url ||
          value.avatar_url || value.svg || value.image || value.src;
        if (typeof nested === "string" && nested.trim()) return nested.trim();
      }
    }
    return "";
  }

  function getRawAvatarValue(profile = {}) {
    return firstImageValue(
      profile.resolved_avatar_url,
      profile.avatar_url,
      profile.avatarUrl,
      profile.custom_avatar_url,
      profile.customAvatarUrl,
      profile.uploaded_avatar_url,
      profile.uploadedAvatarUrl,
      profile.profile_image,
      profile.profileImage,
      profile.photo_url,
      profile.photoUrl,
      profile.avatar
    );
  }

  function getRawFrameValue(profile = {}) {
    return firstImageValue(
      profile.avatar_frame_url,
      profile.avatarFrameUrl,
      profile.custom_avatar_frame_url,
      profile.customAvatarFrameUrl,
      profile.frame_url,
      profile.frameUrl,
      profile.avatar_frame,
      profile.avatarFrame,
      profile.frame
    );
  }

  async function loadFreeAvatarMap() {
    if (!freeAvatarMapPromise) {
      freeAvatarMapPromise = (async () => {
        const headers = { Accept: "application/json" };
        const token = getAuthToken();
        if (token) headers.Authorization = `Bearer ${token}`;

        const response = await fetch(FREE_AVATAR_API_URL, {
          method: "GET",
          headers,
          credentials: "include",
          cache: "no-store"
        });

        let result;
        try {
          result = await response.json();
        } catch (_) {
          throw new Error("Invalid response from the free-avatar service.");
        }

        if (!response.ok || result?.success === false) {
          throw new Error(
            result?.error || result?.message ||
            `Could not load free avatars (${response.status}).`
          );
        }

        const avatars = Array.isArray(result?.avatars) ? result.avatars :
          Array.isArray(result?.data?.avatars) ? result.data.avatars :
          Array.isArray(result?.data) ? result.data : [];

        const map = new Map();
        avatars.forEach((item) => {
          if (!item || item.id === undefined || item.id === null) return;
          const source = normalizeImageURL(firstImageValue(
            item.svg, item.image, item.image_url, item.avatar_url, item.url
          ));
          if (source) map.set(String(item.id), source);
        });
        return map;
      })().catch((error) => {
        freeAvatarMapPromise = null;
        throw error;
      });
    }
    return freeAvatarMapPromise;
  }

  async function resolveAvatarURL(profile = {}) {
    const type = String(
      profile.avatar_type || profile.avatarType || profile.avatar_type_name || "default"
    ).trim().toLowerCase();
    const avatarId = profile.avatar_id ?? profile.avatarId ?? null;
    const directURL = normalizeImageURL(getRawAvatarValue(profile));

    // A custom/uploaded URL always takes priority for custom avatars.
    if (type === "custom" || type === "uploaded" || type === "upload") {
      if (directURL) return directURL;
    }

    // Free avatars are selected by ID on the working Friends page.
    if ((type === "free" || (!directURL && avatarId !== null && avatarId !== "")) &&
        avatarId !== null && avatarId !== "") {
      try {
        const map = await loadFreeAvatarMap();
        const selected = map.get(String(avatarId));
        if (selected) return selected;
      } catch (error) {
        console.warn("U9 Add Friend: Free-avatar catalogue unavailable; trying saved URL.", error);
      }
    }

    if (directURL) return directURL;
    return DEFAULT_AVATAR;
  }

  function resolveAvatarFrameURL(profile = {}) {
    const frameType = String(
      profile.avatar_frame_type || profile.avatarFrameType || "default"
    ).trim().toLowerCase();

    const frameId = profile.avatar_frame_id ?? profile.avatarFrameId ?? null;
    const rawURL = normalizeImageURL(getRawFrameValue(profile));

    // Default frame should use the platform's normal frame asset.
    if (frameType === "default" || frameType === "ordinary" || frameType === "") {
      return rawURL || DEFAULT_AVATAR_FRAME;
    }

    // Custom/uploaded frames are expected to carry a URL or SVG in the API response.
    if (rawURL) return rawURL;

    if (frameId !== null && frameId !== "") {
      console.warn(
        "U9 Add Friend: A frame ID was returned without its frame URL.",
        { userId: profile.id, frameId, frameType }
      );
    }
    return DEFAULT_AVATAR_FRAME;
  }

  function createAvatar(profile = {}) {
    const wrapper = document.createElement("div");
    wrapper.className = "u9-af-avatar-wrap";
    wrapper.style.position = "relative";
    wrapper.style.overflow = "visible";
    wrapper.style.background = "transparent";

    const avatar = document.createElement("img");
    avatar.className = "u9-af-avatar";
    avatar.alt = "";
    avatar.loading = "lazy";
    avatar.decoding = "async";
    avatar.referrerPolicy = "no-referrer";
    avatar.draggable = false;
    avatar.style.position = "absolute";
    avatar.style.inset = "5px";
    avatar.style.zIndex = "1";
    avatar.style.display = "block";
    avatar.style.width = "calc(100% - 10px)";
    avatar.style.height = "calc(100% - 10px)";
    avatar.style.objectFit = "cover";
    avatar.style.objectPosition = "center";
    avatar.style.borderRadius = "50%";
    avatar.src = DEFAULT_AVATAR;

    avatar.addEventListener("error", () => {
      if (avatar.dataset.fallbackApplied !== "true") {
        avatar.dataset.fallbackApplied = "true";
        avatar.src = DEFAULT_AVATAR;
      }
    });

    const frame = document.createElement("img");
    frame.className = "u9-af-frame";
    frame.alt = "";
    frame.setAttribute("aria-hidden", "true");
    frame.loading = "lazy";
    frame.decoding = "async";
    frame.draggable = false;
    frame.style.position = "absolute";
    frame.style.inset = "0";
    frame.style.zIndex = "2";
    frame.style.display = "block";
    frame.style.width = "100%";
    frame.style.height = "100%";
    frame.style.objectFit = "contain";
    frame.style.objectPosition = "center";
    frame.style.border = "0";
    frame.style.pointerEvents = "none";
    frame.src = DEFAULT_AVATAR_FRAME;

    frame.addEventListener("error", () => {
      if (frame.dataset.fallbackApplied !== "true") {
        frame.dataset.fallbackApplied = "true";
        frame.src = DEFAULT_AVATAR_FRAME;
      }
    });

    wrapper.append(avatar, frame);

    // Resolve asynchronously so free-avatar IDs can be mapped to their actual images.
    Promise.all([
      resolveAvatarURL(profile),
      Promise.resolve(resolveAvatarFrameURL(profile))
    ]).then(([avatarURL, frameURL]) => {
      if (avatarURL && avatar.src !== avatarURL) {
        avatar.dataset.fallbackApplied = "";
        avatar.src = avatarURL;
      }
      if (frameURL && frame.src !== frameURL) {
        frame.dataset.fallbackApplied = "";
        frame.src = frameURL;
      }
    }).catch((error) => {
      console.warn("U9 Add Friend: Could not resolve profile avatar.", error);
    });

    return wrapper;
  }


  /* =======================================================
     REQUEST STATE
  ======================================================= */

  function getRequestButtonState(
    profile
  ) {

    const id =
      normalizeId(profile?.id);


    if (
      friendIds.has(id)
    ) {

      return {
        label: "Already Friends",
        disabled: true,
        complete: true
      };
    }


    if (
      pendingRequestIds.has(id)
    ) {

      return {
        label: "Request Sent",
        disabled: true,
        complete: true
      };
    }


    /*
     * If this person has already sent us a request,
     * do not create another request.
     */
    if (
      receivedRequests.has(id)
    ) {

      return {
        label: "Request Received",
        disabled: true,
        complete: true
      };
    }


    if (!profile?.account) {

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
     SEARCH RESULT CARD
  ======================================================= */

  function createUserCard(
    profile
  ) {

    const card =
      document.createElement("article");

    card.className =
      "u9-af-user-card";


    card.appendChild(
      createAvatar(profile)
    );


    const details =
      document.createElement("div");

    details.className =
      "u9-af-user-details";


    const username =
      document.createElement("p");

    username.className =
      "u9-af-username";

    username.textContent =
      profile.username ||
      "User";


    const account =
      document.createElement("p");

    account.className =
      "u9-af-account";

    account.textContent =
      "Account: " +
      (
        profile.account ||
        "Unavailable"
      );


    details.append(
      username,
      account
    );


    const actionWrapper =
      document.createElement("div");

    actionWrapper.className =
      "u9-af-user-action";


    const button =
      document.createElement("button");

    button.type =
      "button";

    button.className =
      "u9-af-button u9-af-request-button";


    const state =
      getRequestButtonState(profile);


    button.textContent =
      state.label;

    button.disabled =
      state.disabled;


    if (state.complete) {
      button.classList.add(
        "is-complete"
      );
    }


    if (!state.complete) {

      button.addEventListener(
        "click",
        () => {
          sendFriendRequest(
            profile,
            button
          );
        }
      );
    }


    actionWrapper.appendChild(
      button
    );

    card.append(
      details,
      actionWrapper
    );


    return card;
  }


  function renderUsers(
    users
  ) {

    displayedUsers =
      Array.isArray(users)
        ? users
        : [];


    resultsContainer.replaceChildren();


    if (
      displayedUsers.length === 0
    ) {

      showResultsStatus(
        "No user found for that account. Check the full account and try again."
      );

      return;
    }


    hideResultsStatus();


    const fragment =
      document.createDocumentFragment();


    displayedUsers.forEach(
      (profile) => {

        fragment.appendChild(
          createUserCard(
            profile
          )
        );
      }
    );


    resultsContainer.appendChild(
      fragment
    );
  }


  /* =======================================================
     SEARCH USERS
  ======================================================= */

  async function searchUsers() {

    if (isSearching) {
      return;
    }


    const q =
      searchInput.value.trim();


    if (!/^[A-Z][A-Z0-9]{5}$/i.test(q)) {

      showFeedback(
        "Enter the complete 6-character account (starts with a letter).",
        "error"
      );

      searchInput.focus();

      return;
    }


    isSearching =
      true;

    searchButton.disabled =
      true;

    searchButton.textContent =
      "Searching...";


    clearFeedback();

    resultsContainer.replaceChildren();

    showResultsStatus(
      "Searching for users..."
    );


    try {

      const data =
        await callMessageAPI(
          "search_users",
          { q }
        );


      const users =
        Array.isArray(data?.users)
          ? data.users
          : [];


      renderUsers(users);


      if (
        users.length > 0
      ) {

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
        error.message ||
        "Could not search for users.",
        "error"
      );

    } finally {

      isSearching =
        false;

      searchButton.disabled =
        false;

      searchButton.textContent =
        "Search";
    }
  }


  /* =======================================================
     SEND FRIEND REQUEST
  ======================================================= */

  async function sendFriendRequest(
    profile,
    button
  ) {

    const id =
      normalizeId(profile?.id);


    if (
      friendIds.has(id)
    ) {

      button.textContent =
        "Already Friends";

      button.disabled =
        true;

      return;
    }


    if (
      pendingRequestIds.has(id)
    ) {

      button.textContent =
        "Request Sent";

      button.disabled =
        true;

      return;
    }


    if (
      receivedRequests.has(id)
    ) {

      button.textContent =
        "Request Received";

      button.disabled =
        true;

      return;
    }


    if (!profile?.account) {

      showFeedback(
        "This user's account is unavailable.",
        "error"
      );

      return;
    }


    if (requestBusy) {
      return;
    }


    requestBusy =
      true;


    const oldLabel =
      button.textContent;


    button.disabled =
      true;

    button.textContent =
      "Sending...";


    try {

      const initialMessage =
        initialMessageInput.value.trim();


      await callMessageAPI(
        "send_friend_request",
        {
          receiver_account:
            profile.account,

          initial_message:
            initialMessage
        }
      );


      /*
       * Update local state immediately.
       */
      pendingRequestIds.add(
        id
      );


      button.textContent =
        "Request Sent";

      button.classList.add(
        "is-complete"
      );


      showFeedback(
        `Friend request sent to ${
          profile.username ||
          profile.account
        }.`,
        "success"
      );


      /*
       * Refresh relationships so
       * Sent Requests stays synchronized.
       */
      await loadRelationships();

    } catch (error) {

      const message =
        error.message ||
        "Could not send friend request.";


      const normalizedMessage =
        message.toLowerCase();


      if (
        normalizedMessage.includes(
          "already friends"
        )
      ) {

        friendIds.add(id);

        button.textContent =
          "Already Friends";

        button.classList.add(
          "is-complete"
        );

      } else if (
        normalizedMessage.includes(
          "pending friend request already exists"
        )
      ) {

        pendingRequestIds.add(id);

        button.textContent =
          "Request Sent";

        button.classList.add(
          "is-complete"
        );

      } else {

        button.textContent =
          oldLabel;
      }


      showFeedback(
        message,
        "error"
      );


      console.error(
        "U9 Add Friend: sending request failed.",
        error
      );

    } finally {

      requestBusy =
        false;

      button.disabled =
        friendIds.has(id) ||
        pendingRequestIds.has(id) ||
        receivedRequests.has(id) ||
        !profile?.account;
    }
  }


  /* =======================================================
     RECEIVED REQUEST CARD
  ======================================================= */

  function createReceivedRequestCard(
    request
  ) {

    const profile =
      request?.sender || {};


    const card =
      document.createElement("article");

    card.className =
      "u9-af-user-card u9-af-request-card";


    card.appendChild(
      createAvatar(profile)
    );


    const details =
      document.createElement("div");

    details.className =
      "u9-af-user-details";


    const username =
      document.createElement("p");

    username.className =
      "u9-af-username";

    username.textContent =
      profile.username ||
      "User";


    const account =
      document.createElement("p");

    account.className =
      "u9-af-account";

    account.textContent =
      "Account: " +
      (
        profile.account ||
        "Unavailable"
      );


    details.append(
      username,
      account
    );


    /*
     * Initial message.
     */
    if (
      request?.initial_message
    ) {

      const message =
        document.createElement("p");

      message.className =
        "u9-af-intro";

      message.textContent =
        request.initial_message;

      details.appendChild(
        message
      );
    }


    /*
     * Optional request time.
     */
    const createdAt =
      request?.created_at ||
      request?.createdAt;


    const formattedDate =
      formatDate(createdAt);


    if (formattedDate) {

      const date =
        document.createElement("p");

      date.className =
        "u9-af-request-date";

      date.textContent =
        formattedDate;

      details.appendChild(
        date
      );
    }


    /*
     * Actions.
     */
    const actions =
      document.createElement("div");

    actions.className =
      "u9-af-user-action u9-af-request-actions";


    const acceptButton =
      document.createElement("button");

    acceptButton.type =
      "button";

    acceptButton.className =
      "u9-af-button u9-af-button-primary";

    acceptButton.textContent =
      "Accept";


    const rejectButton =
      document.createElement("button");

    rejectButton.type =
      "button";

    rejectButton.className =
      "u9-af-button u9-af-button-danger";

    rejectButton.textContent =
      "Reject";


    acceptButton.addEventListener(
      "click",
      () => {

        respondToFriendRequest(
          request,
          "accept",
          acceptButton,
          rejectButton
        );
      }
    );


    rejectButton.addEventListener(
      "click",
      () => {

        respondToFriendRequest(
          request,
          "reject",
          rejectButton,
          acceptButton
        );
      }
    );


    actions.append(
      acceptButton,
      rejectButton
    );


    card.append(
      details,
      actions
    );


    return card;
  }


  /* =======================================================
     RENDER RECEIVED REQUESTS
  ======================================================= */

  function renderReceivedRequests(
    requests
  ) {

    const list =
      Array.isArray(requests)
        ? requests
        : [];


    receivedContainer.replaceChildren();


    /*
     * Keep only pending received requests
     * in the active request count.
     */
    const pending =
      list.filter(
        (request) =>
          String(
            request?.status ||
            "pending"
          ).toLowerCase() ===
          "pending"
      );


    receivedCount.textContent =
      String(pending.length);


    /*
     * Refresh lookup map.
     */
    receivedRequests.clear();


    for (
      const request of pending
    ) {

      const sender =
        request?.sender || {};

      const senderId =
        normalizeId(
          sender.id ||
          request?.sender_id
        );


      if (senderId) {

        receivedRequests.set(
          senderId,
          request
        );
      }
    }


    if (
      pending.length === 0
    ) {

      receivedStatus.textContent =
        "You don't have any pending friend requests.";

      receivedStatus.hidden =
        false;

      return;
    }


    receivedStatus.textContent =
      "";


    receivedStatus.hidden =
      true;


    const fragment =
      document.createDocumentFragment();


    pending.forEach(
      (request) => {

        fragment.appendChild(
          createReceivedRequestCard(
            request
          )
        );
      }
    );


    receivedContainer.appendChild(
      fragment
    );


    /*
     * Search result buttons may need
     * to change to "Request Received".
     */
    if (
      displayedUsers.length > 0
    ) {

      renderUsers(
        displayedUsers
      );
    }
  }


  /* =======================================================
     SENT REQUEST CARD
  ======================================================= */

  function createSentRequestCard(
    request
  ) {

    const profile =
      request?.receiver || {};


    const card =
      document.createElement("article");

    card.className =
      "u9-af-user-card u9-af-request-card";


    card.appendChild(
      createAvatar(profile)
    );


    const details =
      document.createElement("div");

    details.className =
      "u9-af-user-details";


    const username =
      document.createElement("p");

    username.className =
      "u9-af-username";

    username.textContent =
      profile.username ||
      "User";


    const account =
      document.createElement("p");

    account.className =
      "u9-af-account";

    account.textContent =
      "Account: " +
      (
        profile.account ||
        "Unavailable"
      );


    details.append(
      username,
      account
    );


    if (
      request?.initial_message
    ) {

      const message =
        document.createElement("p");

      message.className =
        "u9-af-intro";

      message.textContent =
        request.initial_message;

      details.appendChild(
        message
      );
    }


    const status =
      document.createElement("span");

    status.className =
      "u9-af-status";


    const requestStatus =
      String(
        request?.status ||
        "pending"
      ).toLowerCase();


    status.textContent =
      requestStatus
        .charAt(0)
        .toUpperCase() +
      requestStatus.slice(1);


    if (
      requestStatus ===
      "pending"
    ) {

      status.classList.add(
        "is-pending"
      );

    } else if (
      requestStatus ===
      "accepted"
    ) {

      status.classList.add(
        "is-accepted"
      );

    } else if (
      requestStatus ===
      "rejected"
    ) {

      status.classList.add(
        "is-rejected"
      );

    } else if (
      requestStatus ===
      "cancelled"
    ) {

      status.classList.add(
        "is-cancelled"
      );
    }


    const actionWrapper =
      document.createElement("div");

    actionWrapper.className =
      "u9-af-user-action";


    actionWrapper.appendChild(
      status
    );


    card.append(
      details,
      actionWrapper
    );


    return card;
  }


  /* =======================================================
     RENDER SENT REQUESTS
  ======================================================= */

  function renderSentRequests(
    requests
  ) {

    const list =
      Array.isArray(requests)
        ? requests
        : [];


    sentContainer.replaceChildren();


    const pending =
      list.filter(
        (request) =>
          String(
            request?.status ||
            ""
          ).toLowerCase() ===
          "pending"
      );


    sentCount.textContent =
      String(pending.length);


    if (
      list.length === 0
    ) {

      sentStatus.textContent =
        "You haven't sent any friend requests yet.";

      sentStatus.hidden =
        false;

      return;
    }


    sentStatus.textContent =
      "";

    sentStatus.hidden =
      true;


    const fragment =
      document.createDocumentFragment();


    list.forEach(
      (request) => {

        fragment.appendChild(
          createSentRequestCard(
            request
          )
        );
      }
    );


    sentContainer.appendChild(
      fragment
    );
  }


  /* =======================================================
     ACCEPT / REJECT REQUEST
  ======================================================= */

  async function respondToFriendRequest(
    request,
    decision,
    activeButton,
    otherButton
  ) {

    if (
      requestBusy
    ) {
      return;
    }


    const requestId =
      request?.id;


    if (!requestId) {

      showFeedback(
        "This friend request is missing its request ID.",
        "error"
      );

      return;
    }


    requestBusy =
      true;


    activeButton.disabled =
      true;

    otherButton.disabled =
      true;


    activeButton.textContent =
      decision === "accept"
        ? "Accepting..."
        : "Rejecting...";


    try {

      await callMessageAPI(
        "respond_friend_request",
        {
          request_id:
            requestId,

          decision
        }
      );


      showFeedback(
        decision === "accept"
          ? "Friend request accepted."
          : "Friend request rejected.",
        "success"
      );


      /*
       * Reload all relationship data.
       */
      await loadRelationships();


    } catch (error) {

      console.error(
        "U9 Add Friend: responding to request failed.",
        error
      );


      showFeedback(
        error.message ||
        "Could not update the friend request.",
        "error"
      );


      activeButton.disabled =
        false;

      otherButton.disabled =
        false;

      activeButton.textContent =
        decision === "accept"
          ? "Accept"
          : "Reject";


    } finally {

      requestBusy =
        false;
    }
  }


  /* =======================================================
     LOAD FRIENDS + REQUESTS
  ======================================================= */

  async function loadRelationships() {

    if (
      relationshipLoading
    ) {
      return;
    }


    relationshipLoading =
      true;


    receivedStatus.textContent =
      "Loading friend requests...";

    receivedStatus.hidden =
      false;


    sentStatus.textContent =
      "Loading friend requests...";

    sentStatus.hidden =
      false;


    try {

      /*
       * We deliberately request both endpoints.
       */
      const [
        friendsData,
        requestsData
      ] = await Promise.all([

        callMessageAPI(
          "list_friends"
        ),

        callMessageAPI(
          "list_friend_requests"
        )

      ]);


      /* -----------------------------------------------
         FRIENDS
      ------------------------------------------------ */

      friendIds.clear();


      const friends =
        Array.isArray(
          friendsData?.friends
        )
          ? friendsData.friends
          : [];


      for (
        const item of friends
      ) {

        const friend =
          item?.friend ||
          item;


        const id =
          normalizeId(
            friend?.id
          );


        if (id) {
          friendIds.add(id);
        }
      }


      /* -----------------------------------------------
         SENT
      ------------------------------------------------ */

      pendingRequestIds.clear();


      const sent =
        Array.isArray(
          requestsData?.sent
        )
          ? requestsData.sent
          : [];


      for (
        const request of sent
      ) {

        if (
          String(
            request?.status ||
            ""
          ).toLowerCase() !==
          "pending"
        ) {
          continue;
        }


        const receiver =
          request?.receiver ||
          {};


        const receiverId =
          normalizeId(
            receiver.id ||
            request?.receiver_id
          );


        if (
          receiverId
        ) {

          pendingRequestIds.add(
            receiverId
          );
        }
      }


      /* -----------------------------------------------
         RECEIVED
      ------------------------------------------------ */

      const received =
        Array.isArray(
          requestsData?.received
        )
          ? requestsData.received
          : [];


      renderReceivedRequests(
        received
      );


      /* -----------------------------------------------
         SENT UI
      ------------------------------------------------ */

      renderSentRequests(
        sent
      );


      /* -----------------------------------------------
         SEARCH RESULT STATE
      ------------------------------------------------ */

      if (
        displayedUsers.length > 0
      ) {

        renderUsers(
          displayedUsers
        );
      }

      return true;

    } catch (error) {

      console.warn(
        "U9 Add Friend: relationship status could not be refreshed.",
        error
      );


      receivedContainer.replaceChildren();

      receivedCount.textContent =
        "0";

      receivedStatus.textContent =
        "Could not load received friend requests.";


      receivedStatus.hidden =
        false;


      sentContainer.replaceChildren();

      sentCount.textContent =
        "0";

      sentStatus.textContent =
        "Could not load sent friend requests.";


      sentStatus.hidden =
        false;

      return false;

    } finally {

      relationshipLoading =
        false;
    }
  }


  /* =======================================================
     FORM EVENTS
  ======================================================= */

  searchForm.addEventListener(
    "submit",
    (event) => {

      event.preventDefault();

      searchUsers();
    }
  );


  /* =======================================================
     MESSAGE COUNTER
  ======================================================= */

  initialMessageInput.addEventListener(
    "input",
    () => {

      messageCounter.textContent =
        `${initialMessageInput.value.length} / 1000`;
    }
  );


  /* =======================================================
     INITIALIZE
  ======================================================= */

  showResultsStatus(
    "Search by exact account to find someone."
  );


  // Relationships are fetched when the user opens the Add Friend page,
  // not when this script is loaded during application startup.


  /*
   * Global page initializer expected by normal-message.js.
   * The page shell and event handlers are created once when this
   * module loads; navigating back to Add Friend refreshes the
   * relationship lists without rebuilding the form or losing state.
   */
  window.initializeAddFriendsPage = async function initializeAddFriendsPage() {
    const loaded = await loadRelationships();
    if (loaded) {
      try {
        await callMessageAPI("mark_friend_requests_read");
      } catch (error) {
        console.warn("U9 Add Friend: could not mark requests as read.", error);
      }
    }
    return loaded;
  };

  /* Optional global refresh hook used by other Message components. */
  window.refreshAddFriendsPage = loadRelationships;


  console.log(
    "U9 Add Friend page initialized."
  );

})();
