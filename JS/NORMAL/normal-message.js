/* =================================================
   U9 MESSAGE NORMAL MODAL
   File: JS/NORMAL/normal-message.js

   Features:
   - Open and close Message modal
   - Navigate between Message pages
   - Load home friends through message-api
   - Display selected friend avatar and avatar frame
   - Display friend name without account
   - SVG chat button opens Chat page
   - Preserve existing Chat page navigation
   - Preserve Friends / Add Friend / Group / Customer Service
================================================= */

(function () {
  "use strict";

  /* =================================================
     CONFIGURATION
  ================================================= */

  const MESSAGE_API_URL = "/api/message-api";

  const GROUP_API_URL = "/api/group-api";

  const BACK_ICON_URL =
    "/SSVG/account/back.svg";

  const DEFAULT_CHAT_AVATAR =
    "/SSVG/avatar/profile.svg";

  const DEFAULT_CHAT_FRAME =
    "/SSVG/avatar/ordinary.svg";

  /* =================================================
     PAGE CONFIGURATION
  ================================================= */

  const messagePageConfig = {
    "friends": {
      buttonId: "Message-model-friends-button",
      pageId: "Message-model-friends-page",
      title: "Friend",
      initializer: "initializeFriendsPage"
    },

    "add-friends": {
      buttonId: "Message-model-add-friends-button",
      pageId: "Message-model-add-friends-page",
      title: "Add Friend",
      initializer: "initializeAddFriendsPage"
    },

    "group": {
      buttonId: "Message-model-group-button",
      pageId: "Message-model-group-page",
      title: "Group",
      initializer: "initializeGroupPage"
    },

    "customer-service": {
      buttonId: "Message-model-customer-service-button",
      pageId: "Message-model-customer-service-page",
      title: "Customer Service",
      initializer: "initializeCustomerServicePage"
    }
  };

  /* =================================================
     STATE
  ================================================= */

  let currentMessagePage = null;
  let currentChatUser = null;

  let closeAnimationTimer = null;
  let messageInitialized = false;

  let homeFriendsRequest = null;
  let homeFriends = [];
  let homeFriendsLoaded = false;
  let homeFriendsById = new Map();
  let unreadRefreshTimer = null;
  let unreadRefreshInFlight = false;
  let unreadBySender = {};
  let unreadByGroup = {};

  let homeGroupsRequest = null;
  let homeGroups = [];
  let homeGroupsLoaded = false;

  /* =================================================
     DOM HELPERS
  ================================================= */

  function getElement(id) {
    return document.getElementById(id);
  }

  function getMessagePageElements() {
    const elements = {};

    Object.keys(messagePageConfig).forEach(function (key) {
      const config = messagePageConfig[key];

      elements[key] = {
        button: getElement(config.buttonId),
        page: getElement(config.pageId)
      };
    });

    return elements;
  }

  function getChatPage() {
    return getElement("Message-model-chat-page");
  }

  function getMessageHome() {
    return getElement("Message-model-home");
  }

  function getHomeFriendsList() {
    return getElement("Message-model-friends-list");
  }

  function getHomeGroupsList() {
    return getElement("Message-model-groups-list");
  }

  /* =================================================
     HTML ESCAPING
  ================================================= */

  function escapeHTML(value) {
    return String(value ?? "").replace(
      /[&<>"']/g,
      function (character) {
        return {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;"
        }[character];
      }
    );
  }

  /* =================================================
     IMAGE URL NORMALIZATION
  ================================================= */

  function normalizeImageURL(value, fallback) {
    if (typeof value !== "string") {
      return fallback;
    }

    const source = value.trim();

    if (!source) {
      return fallback;
    }

    // Support inline SVG supplied by the trusted avatar-frame system.
    if (
      /^<svg[\s>]/i.test(source) ||
      /^<\?xml[\s\S]*?<svg[\s>]/i.test(source)
    ) {
      return "data:image/svg+xml;charset=UTF-8," +
        encodeURIComponent(source);
    }

    // Keep valid image data URLs unchanged.
    if (
      /^data:image\/[a-z0-9.+-]+(?:;[^,]*)?,/i.test(source)
    ) {
      return source;
    }

    try {
      const url = new URL(source, window.location.origin);

      if (url.protocol !== "https:" && url.protocol !== "http:") {
        return fallback;
      }

      // Supabase project A public Storage -> same-origin Vercel proxy.
      if (
        url.hostname === "tvtakmswbzawaweytimx.supabase.co" &&
        url.pathname.startsWith("/storage/v1/object/public/")
      ) {
        const storagePath = url.pathname.replace(
          "/storage/v1/object/public/",
          ""
        );

        return "/storage/" + storagePath + url.search + url.hash;
      }

      // Supabase project B public Storage -> same-origin Vercel proxy.
      if (
        url.hostname === "vjlpowhxmflpkjlukkfy.supabase.co" &&
        url.pathname.startsWith("/storage/v1/object/public/")
      ) {
        const storagePath = url.pathname.replace(
          "/storage/v1/object/public/",
          ""
        );

        return "/storage-2/" + storagePath + url.search + url.hash;
      }

      // Preserve other valid HTTP(S) image URLs.
      return url.href;
    } catch (error) {
      console.warn("U9 Message: Invalid image URL.", error);
      return fallback;
    }
  }

  function getUserAvatarURL(user) {
    if (!user || typeof user !== "object") {
      return DEFAULT_CHAT_AVATAR;
    }

    const avatarValue =
      user.avatar_url ||
      user.avatarUrl ||
      (
        typeof user.avatar === "string"
          ? user.avatar
          : user.avatar?.url ||
            user.avatar?.custom_url ||
            user.avatar?.image
      ) ||
      user.profile_image ||
      user.photo_url ||
      "";

    return normalizeImageURL(
      avatarValue,
      DEFAULT_CHAT_AVATAR
    );
  }

  function getUserAvatarFrameURL(user) {
    if (!user || typeof user !== "object") {
      return DEFAULT_CHAT_FRAME;
    }

    const frameValue =
      user.avatar_frame_url ||
      user.avatarFrameUrl ||
      user.avatar_frame?.url ||
      user.avatar_frame?.svg ||
      user.avatar_frame?.image ||
      user.avatarFrame?.url ||
      user.avatarFrame?.svg ||
      user.avatarFrame?.image ||
      user.avatarFrame ||
      "";

    const source = typeof frameValue === "string"
      ? frameValue
      : frameValue && typeof frameValue === "object"
        ? (
            frameValue.url ||
            frameValue.svg ||
            frameValue.image ||
            frameValue.avatar_frame_url ||
            ""
          )
        : "";

    return normalizeImageURL(source, DEFAULT_CHAT_FRAME);
  }

  /* =================================================
     SESSION TOKEN

     Uses the same localStorage token keys as friends.js.
     The existing u9_session cookie is also supported
     through credentials: include.
  ================================================= */

  function getSessionToken() {
    const keys = [
      "u9_token",
      "u9_access_token",
      "access_token",
      "authToken",
      "token"
    ];

    for (const key of keys) {
      try {
        const value = localStorage.getItem(key);

        if (value && value.trim()) {
          return value.trim();
        }
      } catch (error) {
        console.warn(
          "U9 Message: Cannot read session token."
        );

        return "";
      }
    }

    return "";
  }

  /* =================================================
     MESSAGE API
  ================================================= */

  async function callMessageAPI(action, payload = {}) {
    const headers = {
      "Content-Type": "application/json"
    };

    const token = getSessionToken();

    if (token) {
      headers.Authorization = "Bearer " + token;
    }

    const response = await fetch(
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

    let result;

    try {
      result = await response.json();
    } catch (error) {
      throw new Error(
        "Invalid response from message server."
      );
    }

    if (
      !response.ok ||
      !result ||
      result.success !== true
    ) {
      const error = new Error(
        result?.error ||
        `Request failed (${response.status}).`
      );

      error.status = response.status;

      throw error;
    }

    return result;
  }


  /* =================================================
     GROUP API

     Uses the separate group-api Edge Function and the
     same U9 custom-session token/cookie convention as
     JS/NORMAL/MESSAGE/group.js.
     This does not change or replace message-api.
  ================================================= */

  function getGroupSessionToken() {
    for (const key of [
      "u9_token",
      "u9_session",
      "session_token",
      "access_token"
    ]) {
      try {
        const token = localStorage.getItem(key);

        if (token && token.trim()) {
          return token.trim();
        }
      } catch (error) {
        // Fall back to the U9 session cookie.
      }
    }

    try {
      const match = document.cookie.match(
        /(?:^|;\s*)u9_session=([^;]+)/
      );

      if (match?.[1]) {
        return decodeURIComponent(match[1]);
      }
    } catch (error) {
      // The API will report an authentication error if needed.
    }

    return "";
  }

  async function callGroupAPI(action, payload = {}) {
    const headers = {
      "Content-Type": "application/json"
    };

    const token = getGroupSessionToken();

    if (token) {
      headers.Authorization = "Bearer " + token;
    }

    let response;

    try {
      response = await fetch(
        GROUP_API_URL,
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
      const networkError = new Error(
        "Network error while loading groups. Check your connection and try again."
      );
      networkError.cause = error;
      throw networkError;
    }

    let result;

    try {
      result = await response.json();
    } catch (error) {
      const invalidResponseError = new Error(
        `Invalid response from group server (${response.status}).`
      );
      invalidResponseError.status = response.status;
      throw invalidResponseError;
    }

    if (
      !response.ok ||
      !result ||
      result.success !== true
    ) {
      const requestError = new Error(
        result?.error ||
        `Group request failed (${response.status}).`
      );
      requestError.status = response.status;
      throw requestError;
    }

    return result;
  }

  /* =================================================
     UNREAD MESSAGE INDICATORS (ONE-TO-ONE FRIEND CHAT)
  ================================================= */

  async function refreshMessageUnreadIndicators() {
    if (unreadRefreshInFlight) return;
    unreadRefreshInFlight = true;

    try {
      let friendHasUnread = Object.values(unreadBySender).some((count) => Number(count) > 0);
      let groupHasUnread = Object.values(unreadByGroup).some((count) => Number(count) > 0);

      try {
        const result = await callMessageAPI("get_unread_messages");
        unreadBySender = result.unread_by_sender && typeof result.unread_by_sender === "object"
          ? result.unread_by_sender : {};
        friendHasUnread = Boolean(result.has_unread) || Object.values(unreadBySender).some((count) => Number(count) > 0);

        document.querySelectorAll("#Message-model-friends-list [data-home-chat-friend-id]").forEach(function (button) {
          const friendId = String(button.dataset.homeChatFriendId || "");
          const hasUnread = Number(unreadBySender[friendId] || 0) > 0;
          button.classList.toggle("has-unread", hasUnread);
          button.setAttribute("aria-label", hasUnread ? "Open chat, unread messages" : "Open chat");
          button.title = hasUnread ? "Unread messages" : "Chat";
        });
      } catch (error) {
        console.warn("U9 Message: Could not refresh friend unread indicators.", error);
      }

      try {
        const result = await callGroupAPI("list_my_groups");
        const groups = normalizeHomeGroups(result.groups);
        unreadByGroup = {};
        groups.forEach(function (group) {
          unreadByGroup[String(group.id)] = Number(group.unread_count || 0);
        });
        groupHasUnread = Object.values(unreadByGroup).some((count) => Number(count) > 0);

        document.querySelectorAll("#Message-model-groups-list [data-home-chat-group-id]").forEach(function (button) {
          const groupId = String(button.dataset.homeChatGroupId || "");
          const hasUnread = Number(unreadByGroup[groupId] || 0) > 0;
          button.classList.toggle("has-unread", hasUnread);
          button.setAttribute("aria-label", hasUnread ? "Open group chat, unread messages" : "Open group chat");
          button.title = hasUnread ? "Unread group messages" : "Open Group Chat";
        });
      } catch (error) {
        console.warn("U9 Message: Could not refresh group unread indicators.", error);
      }

      let friendRequestsHaveUnread = false;
      try {
        const requestSummary = await callMessageAPI("get_unread_friend_requests");
        friendRequestsHaveUnread = requestSummary?.has_unread === true || Number(requestSummary?.unread_count || 0) > 0;
      } catch (error) {
        console.warn("U9 Message: Could not refresh friend-request unread indicator.", error);
      }

      let groupRequestsHaveUnread = false;
      try {
        const requestSummary = await callGroupAPI("get_unread_group_join_requests");
        groupRequestsHaveUnread = requestSummary?.has_unread === true || Number(requestSummary?.unread_count || 0) > 0;
      } catch (error) {
        console.warn("U9 Message: Could not refresh group-request unread indicator.", error);
      }

      const addFriendsButton = document.getElementById("Message-model-add-friends-button");
      if (addFriendsButton) {
        addFriendsButton.classList.toggle("has-unread", friendRequestsHaveUnread);
        addFriendsButton.setAttribute("aria-label", friendRequestsHaveUnread ? "Add Friend, unread friend requests" : "Add Friend");
        addFriendsButton.title = friendRequestsHaveUnread ? "Unread friend requests" : "Add Friend";
      }

      const groupButton = document.getElementById("Message-model-group-button");
      if (groupButton) {
        groupButton.classList.toggle("has-unread", groupRequestsHaveUnread);
        groupButton.setAttribute("aria-label", groupRequestsHaveUnread ? "Group, unread join requests" : "Group");
        groupButton.title = groupRequestsHaveUnread ? "Unread group join requests" : "Group";
      }

      let customerServiceHasUnread = false;
      try {
        if (typeof window.getCustomerServiceUnreadSummary === "function") {
          const customerServiceSummary = await window.getCustomerServiceUnreadSummary(false);
          customerServiceHasUnread = customerServiceSummary?.has_unread === true;
        }
      } catch (error) {
        // Do not break friend/group unread indicators if customer-service polling fails.
        console.warn("U9 Message: Could not refresh customer service unread indicator.", error);
      }

      const hasAnyUnread = friendHasUnread || groupHasUnread || customerServiceHasUnread || friendRequestsHaveUnread || groupRequestsHaveUnread;
      const customerServiceButton = document.getElementById("Message-model-customer-service-button");
      if (customerServiceButton) {
        customerServiceButton.classList.toggle("has-unread", customerServiceHasUnread);
        customerServiceButton.setAttribute("aria-label", customerServiceHasUnread ? "Customer Service, unread messages" : "Customer Service");
        customerServiceButton.title = customerServiceHasUnread ? "Unread customer service messages" : "Customer Service";
      }

      ["U9-page-container-tool-message", "U9-page-container-tool-menu"].forEach(function (id) {
        const button = document.getElementById(id);
        if (!button) return;
        button.classList.toggle("has-unread", hasAnyUnread);
        const baseLabel = id.endsWith("menu") ? "Menu" : "Messages";
        button.setAttribute("aria-label", hasAnyUnread ? `${baseLabel}, unread messages` : baseLabel);
      });
    } finally {
      unreadRefreshInFlight = false;
    }
  }

  function startUnreadMessagePolling() {
    if (unreadRefreshTimer !== null) {
      window.clearInterval(unreadRefreshTimer);
    }

    refreshMessageUnreadIndicators();
    unreadRefreshTimer = window.setInterval(
      refreshMessageUnreadIndicators,
      5000
    );
  }

  /* =================================================
     HOME FRIENDS: NORMALIZE API RESPONSE

     Expected response:
     {
       success: true,
       friends: [
         {
           friendship_id: "...",
           friend: {
             id: "...",
             username: "...",
             avatar_type: "custom",
             avatar_url: "...",
             avatar_frame_type: "free",
             avatar_frame_url: "..."
           }
         }
       ]
     }
  ================================================= */

  function normalizeHomeFriends(items) {
    if (!Array.isArray(items)) {
      return [];
    }

    return items
      .map(function (item) {
        /*
         * list_friends returns a friendship object
         * with its user profile inside item.friend.
         */
        const profile = item?.friend || item;

        if (!profile || !profile.id) {
          return null;
        }

        return {
          id: String(profile.id),

          username: String(
            profile.username || "User"
          ),

          avatar_type:
            profile.avatar_type || "default",

          avatar_id:
            profile.avatar_id || null,

          avatar_url:
            getUserAvatarURL(profile),

          avatar_frame_type:
            profile.avatar_frame_type || "default",

          avatar_frame_id:
            profile.avatar_frame_id || null,

          avatar_frame_url:
            getUserAvatarFrameURL(profile),

          status: "Friend",
          type: "friend"
        };
      })
      .filter(Boolean);
  }

  /* =================================================
     HOME FRIENDS: STATUS
  ================================================= */

  function renderHomeFriendsMessage(message, type = "info") {
    const container = getHomeFriendsList();

    if (!container) {
      return;
    }

    container.innerHTML = `
      <div
        class="Message-model-empty Message-model-home-friends-state Message-model-home-friends-${escapeHTML(type)}"
        role="${type === "error" ? "alert" : "status"}"
      >
        ${escapeHTML(message)}
      </div>
    `;
  }

  /* =================================================
     HOME FRIENDS: CHAT SVG ICON

     Inline SVG avoids dependence on a separate icon path.
  ================================================= */

  function renderChatIcon() {
    return `
      <img
        class="Message-model-contact-chat-icon"
        src="/SSVG/normal/chat.svg"
        alt=""
        aria-hidden="true"
        width="22"
        height="22"
        draggable="false"
      />
    `;
  }

  /* =================================================
     HOME FRIENDS: RENDER ONE FRIEND

     Account is intentionally not displayed here.
     The full account appears in the Friends page.
  ================================================= */

  function renderHomeFriend(friend) {
    const avatarURL = friend.avatar_url;
    const frameURL = friend.avatar_frame_url;

    return `
      <article
        class="Message-model-contact-row Message-model-home-friend-row"
        data-home-friend-id="${escapeHTML(friend.id)}"
      >
        <div
          class="Message-model-contact-avatar-stack"
          aria-hidden="true"
        >
          <img
            class="Message-model-contact-avatar"
            data-home-image-role="avatar"
            data-fallback-stage="0"
            data-friend-name="${escapeHTML(friend.username)}"
            src="${escapeHTML(avatarURL)}"
            alt=""
            loading="lazy"
            referrerpolicy="no-referrer"
            draggable="false"
          >

          <img
            class="Message-model-contact-avatar-frame"
            data-home-image-role="frame"
            data-fallback-stage="0"
            src="${escapeHTML(frameURL)}"
            alt=""
            loading="lazy"
            referrerpolicy="no-referrer"
            draggable="false"
          >
        </div>

        <div class="Message-model-contact-name">
          ${escapeHTML(friend.username)}
        </div>

        <button
          class="Message-model-contact-chat"
          type="button"
          data-home-chat-friend-id="${escapeHTML(friend.id)}"
          aria-label="Open chat with ${escapeHTML(friend.username)}"
          title="Chat"
        >
          ${renderChatIcon()}
        </button>
      </article>
    `;
  }

  /* =================================================
     HOME FRIENDS: RENDER LIST
  ================================================= */

  function renderHomeFriends(friends) {
    const container = getHomeFriendsList();

    if (!container) {
      return;
    }

    homeFriends = Array.isArray(friends)
      ? friends
      : [];

    homeFriendsById = new Map(
      homeFriends.map(function (friend) {
        return [
          String(friend.id),
          friend
        ];
      })
    );

    if (homeFriends.length === 0) {
      container.innerHTML = `
        <div class="Message-model-empty Message-model-home-friends-state">
          No friends to display.
        </div>
      `;

      return;
    }

    container.innerHTML = homeFriends
      .map(renderHomeFriend)
      .join("");
  }

  /* =================================================
     HOME FRIENDS: OPEN CHAT

     A click on the SVG button passes the selected friend
     to the existing openMessageChat() function.
  ================================================= */

  function handleHomeFriendsClick(event) {
    const button = event.target.closest(
      "[data-home-chat-friend-id]"
    );

    if (!button) {
      return;
    }

    const friendId =
      button.dataset.homeChatFriendId;

    const friend = homeFriendsById.get(
      String(friendId)
    );

    if (!friend) {
      console.warn(
        "U9 Message: Home friend was not found.",
        friendId
      );

      return;
    }

    if (
      typeof window.openMessageChat !== "function"
    ) {
      console.error(
        "U9 Message: openMessageChat() is unavailable."
      );

      return;
    }

    /*
     * This button is on Message home, so Chat should
     * return to Message home when the user presses Back.
     */
    window.messageChatReturnPage = null;

    window.openMessageChat({
      id: friend.id,

      name: friend.username,

      avatar: friend.avatar_url,
      avatar_url: friend.avatar_url,

      avatar_type: friend.avatar_type,
      avatar_id: friend.avatar_id,

      avatar_frame_type:
        friend.avatar_frame_type,

      avatar_frame_id:
        friend.avatar_frame_id,

      avatar_frame_url:
        friend.avatar_frame_url,

      avatarFrameUrl:
        friend.avatar_frame_url,

      status: "Friend",
      type: "friend"
    });
  }

  /* =================================================
     HOME FRIENDS: IMAGE FALLBACKS
  ================================================= */

  function handleHomeFriendsImageError(event) {
    const image = event.target;

    if (!(image instanceof HTMLImageElement)) {
      return;
    }

    const role = image.dataset.homeImageRole;

    if (!role) {
      return;
    }

    const stage =
      image.dataset.fallbackStage || "0";

    /* -----------------------------------------------
       AVATAR FALLBACK
    ----------------------------------------------- */

    if (role === "avatar") {
      if (stage === "0") {
        image.dataset.fallbackStage = "1";
        image.src = DEFAULT_CHAT_AVATAR;
        return;
      }

      const row = image.closest(
        ".Message-model-home-friend-row"
      );

      const name =
        row?.querySelector(
          ".Message-model-contact-name"
        )?.textContent || "User";

      const initials = String(name)
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map(function (part) {
          return part.charAt(0);
        })
        .join("")
        .toUpperCase() || "U";

      const fallback =
        document.createElement("div");

      fallback.className =
        "Message-model-contact-avatar-fallback";

      fallback.textContent = initials;
      fallback.setAttribute("aria-hidden", "true");

      image.replaceWith(fallback);

      return;
    }

    /* -----------------------------------------------
       FRAME FALLBACK
    ----------------------------------------------- */

    if (role === "frame") {
      if (stage === "0") {
        image.dataset.fallbackStage = "1";
        image.src = DEFAULT_CHAT_FRAME;
        return;
      }

      image.hidden = true;
    }
  }

  /* =================================================
     HOME FRIENDS: BIND EVENTS ONCE
  ================================================= */

  function bindHomeFriendsEvents() {
    const container = getHomeFriendsList();

    if (!container) {
      return;
    }

    if (
      container.dataset.homeFriendsClickBound !== "true"
    ) {
      container.dataset.homeFriendsClickBound = "true";

      container.addEventListener(
        "click",
        handleHomeFriendsClick
      );
    }

    if (
      container.dataset.homeFriendsErrorBound !== "true"
    ) {
      container.dataset.homeFriendsErrorBound = "true";

      /*
       * Image error events do not bubble normally,
       * therefore capture the event on the list.
       */
      container.addEventListener(
        "error",
        handleHomeFriendsImageError,
        true
      );
    }
  }

  /* =================================================
     HOME FRIENDS: LOAD FROM SERVER
  ================================================= */

  function loadHomeFriends(options = {}) {
    const container = getHomeFriendsList();

    if (!container) {
      return Promise.resolve([]);
    }

    const force = options.force === true;

    /*
     * Keep the successfully loaded list for this page session.
     * Opening/closing the Message home must not trigger another
     * list_friends request unless an explicit refresh is requested.
     */
    if (homeFriendsLoaded && !force) {
      refreshMessageUnreadIndicators();
      return Promise.resolve(homeFriends);
    }

    /* Avoid duplicate requests while the same request is running. */
    if (homeFriendsRequest) {
      return homeFriendsRequest;
    }

    bindHomeFriendsEvents();

    // Do not blank an already rendered list during a manual/background refresh.
    if (!homeFriendsLoaded) {
      renderHomeFriendsMessage(
        "Loading friends...",
        "loading"
      );
    }

    homeFriendsRequest = (async function () {
      try {
        const result = await callMessageAPI(
          "list_friends"
        );

        const friends = normalizeHomeFriends(
          result.friends
        );

        renderHomeFriends(friends);
        homeFriendsLoaded = true;
        refreshMessageUnreadIndicators();

        console.log(
          "U9 Message Home: Friends loaded.",
          {
            count: friends.length
          }
        );

        return friends;
      } catch (error) {
        console.error(
          "U9 Message Home: Failed to load friends.",
          error
        );

        if (homeFriendsLoaded) {
          console.warn("U9 Message Home: Refresh failed; keeping cached friends.");
        } else if (
          error?.status === 401 ||
          /authentication required|invalid session|session expired|unauthorized/i.test(
            String(error?.message || "")
          )
        ) {
          renderHomeFriendsMessage(
            "Please sign in again to load your friends.",
            "error"
          );
        } else {
          renderHomeFriendsMessage(
            "Could not load friends. Please try again.",
            "error"
          );
        }

        return [];
      } finally {
        homeFriendsRequest = null;
      }
    })();

    return homeFriendsRequest;
  }

  /* =================================================
     HOME GROUPS: NORMALIZE API RESPONSE

     group-api list_my_groups returns:
     {
       success: true,
       groups: [
         { group: { id, name, description, avatar_url },
           membership: { role, status } }
       ]
     }
  ================================================= */

  function normalizeHomeGroups(items) {
    if (!Array.isArray(items)) {
      return [];
    }

    return items
      .map(function (item) {
        const group = item?.group || item;
        const membership = item?.membership || {};

        if (!group || !group.id) {
          return null;
        }

        if (
          membership.status &&
          membership.status !== "active"
        ) {
          return null;
        }

        return {
          id: String(group.id),
          name: String(group.name || "Unnamed group"),
          description: String(group.description || ""),
          avatar_url: normalizeImageURL(
            group.avatar_url,
            ""
          ),
          role: String(membership.role || "member"),
          status: String(membership.status || "active"),
          unread_count: Number(membership.unread_count || 0)
        };
      })
      .filter(Boolean);
  }

  /* =================================================
     HOME GROUPS: EMPTY / ERROR STATE
  ================================================= */

  function renderHomeGroupsMessage(message, type = "info") {
    const container = getHomeGroupsList();

    if (!container) {
      return;
    }

    container.innerHTML = `
      <div
        class="Message-model-empty Message-model-home-groups-state Message-model-home-groups-${escapeHTML(type)}"
        role="${type === "error" ? "alert" : "status"}"
      >
        ${escapeHTML(message)}
      </div>
    `;
  }

  /* =================================================
     HOME GROUPS: RENDER ONE GROUP
  ================================================= */

  function renderHomeGroup(group) {
    const avatarMarkup = group.avatar_url
      ? `
        <img
          class="Message-model-home-group-avatar-image"
          data-home-group-image="true"
          src="${escapeHTML(group.avatar_url)}"
          alt=""
          loading="lazy"
          referrerpolicy="no-referrer"
          draggable="false"
        >
      `
      : `<span class="Message-model-home-group-avatar-fallback" aria-hidden="true">G</span>`;

    const roleLabel = {
      owner: "Owner",
      admin: "Admin",
      member: "Member"
    }[group.role] || "Member";

    const description = group.description.trim()
      ? group.description
      : "No group description has been added.";

    return `
      <article
        class="Message-model-home-group-row"
        data-home-group-id="${escapeHTML(group.id)}"
      >
        <div class="Message-model-home-group-avatar" aria-hidden="true">
          ${avatarMarkup}
        </div>

        <div class="Message-model-home-group-main">
          <div class="Message-model-home-group-topline">
            <div class="Message-model-home-group-name">
              ${escapeHTML(group.name)}
            </div>
            <span class="Message-model-home-group-role">
              ${escapeHTML(roleLabel)}
            </span>
          </div>

          <div class="Message-model-home-group-description">
            ${escapeHTML(description)}
          </div>

          <div class="Message-model-home-group-id">
            Group ID: ${escapeHTML(group.id)}
          </div>
        </div>

        <button
          class="Message-model-home-group-chat"
          type="button"
          data-home-chat-group-id="${escapeHTML(group.id)}"
          aria-label="Open group chat with ${escapeHTML(group.name)}"
          title="Open Group Chat"
        >
          <img
            class="Message-model-home-group-chat-icon"
            src="/SSVG/normal/chat.svg"
            alt=""
            aria-hidden="true"
            draggable="false"
          >
        </button>
      </article>
    `;
  }

  /* =================================================
     HOME GROUPS: RENDER LIST
  ================================================= */

  function renderHomeGroups(groups) {
    const container = getHomeGroupsList();

    if (!container) {
      return;
    }

    homeGroups = Array.isArray(groups) ? groups : [];

    if (homeGroups.length === 0) {
      renderHomeGroupsMessage("No groups to display.");
      return;
    }

    container.innerHTML = homeGroups
      .map(renderHomeGroup)
      .join("");
  }

  /* =================================================
     HOME GROUPS: OPEN GROUP CHAT

     Uses the existing Chat Page through normal-message.js.
     The selected group UUID is never passed as a friend ID.
  ================================================= */

  function handleHomeGroupsClick(event) {
    const button = event.target.closest("[data-home-chat-group-id]");

    if (!button) {
      return;
    }

    const groupId = String(button.dataset.homeChatGroupId || "");
    const group = homeGroups.find(function (item) {
      return String(item.id) === groupId;
    });

    if (!group) {
      console.warn("U9 Message Home: Group was not found.", groupId);
      return;
    }

    if (typeof window.openMessageGroupChat !== "function") {
      console.error(
        "U9 Message Home: openMessageGroupChat() is unavailable."
      );
      return;
    }

    // Message home should be the return destination when Back is pressed.
    window.messageChatReturnPage = null;

    const opened = window.openMessageGroupChat({
      groupId: group.id,
      group: group,
      membership: {
        role: group.role,
        status: group.status
      }
    });

    if (!opened) {
      console.error("U9 Message Home: Could not open group chat.", groupId);
    }
  }

  /* =================================================
     HOME GROUPS: IMAGE FALLBACK
  ================================================= */

  function handleHomeGroupsImageError(event) {
    const image = event.target;

    if (
      !(image instanceof HTMLImageElement) ||
      image.dataset.homeGroupImage !== "true"
    ) {
      return;
    }

    const fallback = document.createElement("span");
    fallback.className = "Message-model-home-group-avatar-fallback";
    fallback.textContent = "G";
    fallback.setAttribute("aria-hidden", "true");
    image.replaceWith(fallback);
  }

  /* =================================================
     HOME GROUPS: LOAD FROM group-api
  ================================================= */

  function loadHomeGroups(options = {}) {
    const container = getHomeGroupsList();

    if (!container) {
      return Promise.resolve([]);
    }

    const force = options.force === true;

    // Reuse the group list for the lifetime of this page session.
    if (homeGroupsLoaded && !force) {
      refreshMessageUnreadIndicators();
      return Promise.resolve(homeGroups);
    }

    if (homeGroupsRequest) {
      return homeGroupsRequest;
    }

    // Preserve the current list while a forced refresh runs in the background.
    if (!homeGroupsLoaded) {
      renderHomeGroupsMessage("Loading groups…", "loading");
    }

    if (container.dataset.homeGroupsClickBound !== "true") {
      container.dataset.homeGroupsClickBound = "true";
      container.addEventListener("click", handleHomeGroupsClick);
    }

    if (container.dataset.homeGroupsErrorBound !== "true") {
      container.dataset.homeGroupsErrorBound = "true";
      container.addEventListener(
        "error",
        handleHomeGroupsImageError,
        true
      );
    }

    homeGroupsRequest = (async function () {
      try {
        const result = await callGroupAPI("list_my_groups");
        const groups = normalizeHomeGroups(result.groups);

        renderHomeGroups(groups);
        homeGroupsLoaded = true;
        // Apply current per-group unread dots immediately after the list is rendered.
        refreshMessageUnreadIndicators();

        console.log(
          "U9 Message Home: Groups loaded.",
          { count: groups.length }
        );

        return groups;
      } catch (error) {
        console.error(
          "U9 Message Home: Failed to load groups.",
          error
        );

        if (homeGroupsLoaded) {
          console.warn("U9 Message Home: Refresh failed; keeping cached groups.");
        } else if (
          error?.status === 401 ||
          /authentication required|invalid session|session expired|unauthorized/i.test(
            String(error?.message || "")
          )
        ) {
          renderHomeGroupsMessage(
            "Please sign in again to load your groups.",
            "error"
          );
        } else {
          renderHomeGroupsMessage(
            "Could not load groups. Please try again.",
            "error"
          );
        }

        return [];
      } finally {
        homeGroupsRequest = null;
      }
    })();

    return homeGroupsRequest;
  }

  /* =================================================
     MODAL ELEMENTS
  ================================================= */

  function getMessageModal() {
    return getElement("U9-message-normal-modal");
  }

  function getMessageModalContent() {
    return getElement("U9-message-normal-modal-content");
  }

  function getMessageModalTitle() {
    return getElement("U9-message-normal-modal-title");
  }

  function getMessageModalTitleText() {
    return getElement("U9-message-normal-modal-title-text");
  }

  function getMessageModalClose() {
    return getElement("U9-message-normal-modal-close");
  }

  function getMessageNavigation() {
    return getElement("Message-model-navigation");
  }

  function getMessagePagesContainer() {
    return getElement("Message-model-pages");
  }

  /* =================================================
     CHAT CLEANUP
  ================================================= */

  function stopCurrentChat() {
    if (typeof window.closeChatPage === "function") {
      try {
        window.closeChatPage();
      } catch (error) {
        console.error(
          "U9 Message: Failed to close Chat page.",
          error
        );
      }

      return;
    }

    const chatPage = getChatPage();

    if (chatPage) {
      chatPage.classList.remove("active");
      chatPage.classList.remove("is-active");

      chatPage.hidden = true;

      chatPage.setAttribute(
        "aria-hidden",
        "true"
      );
    }
  }

  /* =================================================
     FOCUS MANAGEMENT
  ================================================= */

  function moveFocusOutOfPages() {
    const activeElement = document.activeElement;

    if (!activeElement) {
      return;
    }

    const pageElements = getMessagePageElements();

    let focusIsInsidePage = false;

    Object.keys(pageElements).forEach(function (key) {
      const page = pageElements[key].page;

      if (
        page &&
        page.contains(activeElement)
      ) {
        focusIsInsidePage = true;
      }
    });

    const chatPage = getChatPage();

    if (
      chatPage &&
      chatPage.contains(activeElement)
    ) {
      focusIsInsidePage = true;
    }

    if (!focusIsInsidePage) {
      return;
    }

    const closeButton = getMessageModalClose();

    if (
      closeButton &&
      !closeButton.disabled
    ) {
      closeButton.focus({
        preventScroll: true
      });

      return;
    }

    if (
      typeof activeElement.blur === "function"
    ) {
      activeElement.blur();
    }
  }

  /* =================================================
     HEADER TITLE
  ================================================= */

  function getMessageHeaderTitle() {
    if (currentMessagePage === "chat") {
      return currentChatUser?.name || "Chat";
    }

    if (
      currentMessagePage &&
      messagePageConfig[currentMessagePage]
    ) {
      return messagePageConfig[currentMessagePage].title;
    }

    return "Message";
  }

  function setMessageHeader(isInnerPage) {
    const titleElement = getMessageModalTitle();
    const titleText = getMessageModalTitleText();
    const closeButton = getMessageModalClose();

    if (!titleElement || !closeButton) {
      return;
    }

    const title = getMessageHeaderTitle();

    if (titleText) {
      titleText.textContent = title;
    } else {
      const existingTitleText = Array.from(
        titleElement.childNodes
      ).find(function (node) {
        return (
          node.nodeType === Node.TEXT_NODE &&
          node.textContent.trim() !== ""
        );
      });

      if (existingTitleText) {
        existingTitleText.textContent = " " + title + " ";
      }
    }

    if (isInnerPage) {
      closeButton.classList.remove(
        "message-home-close"
      );

      closeButton.classList.add(
        "message-back-button"
      );

      closeButton.replaceChildren();

      const backIcon = document.createElement("img");

      backIcon.src = BACK_ICON_URL;
      backIcon.alt = "";

      backIcon.setAttribute(
        "aria-hidden",
        "true"
      );

      closeButton.appendChild(backIcon);

      closeButton.setAttribute(
        "aria-label",
        "Back"
      );

      closeButton.setAttribute(
        "title",
        "Back"
      );
    } else {
      closeButton.classList.remove(
        "message-back-button"
      );

      closeButton.classList.add(
        "message-home-close"
      );

      closeButton.replaceChildren();
      closeButton.textContent = "×";

      closeButton.setAttribute(
        "aria-label",
        "Close Message"
      );

      closeButton.setAttribute(
        "title",
        "Close"
      );
    }
  }

  /* =================================================
     HIDE ALL INNER PAGES
  ================================================= */

  function hideAllMessagePages() {
    moveFocusOutOfPages();

    const pageElements = getMessagePageElements();

    Object.keys(pageElements).forEach(function (key) {
      const page = pageElements[key].page;

      if (!page) {
        return;
      }

      page.classList.remove("active");
      page.hidden = true;

      page.setAttribute(
        "aria-hidden",
        "true"
      );
    });

    const chatPage = getChatPage();

    if (chatPage) {
      chatPage.classList.remove("active");
      chatPage.classList.remove("is-active");

      chatPage.hidden = true;

      chatPage.setAttribute(
        "aria-hidden",
        "true"
      );
    }
  }

  /* =================================================
     NAVIGATION SELECTION
  ================================================= */

  function clearNavigationSelection() {
    const pageElements = getMessagePageElements();

    Object.keys(pageElements).forEach(function (key) {
      const button = pageElements[key].button;

      if (!button) {
        return;
      }

      button.classList.remove("active");

      button.setAttribute(
        "aria-selected",
        "false"
      );
    });
  }

  /* =================================================
     MESSAGE HOME
  ================================================= */

  function showMessageHome() {
    const content = getMessageModalContent();

    if (!content) {
      return false;
    }

    moveFocusOutOfPages();

    if (currentMessagePage === "chat") {
      stopCurrentChat();
    }

    currentMessagePage = null;
    currentChatUser = null;

    window.messageChatReturnPage = null;

    content.classList.add("message-home");

    content.classList.remove(
      "message-inner-page"
    );

    clearNavigationSelection();

    setMessageHeader(false);

    hideAllMessagePages();

    /*
     * Refresh both friends and joined groups whenever
     * the user opens or returns to Message home.
     */
    loadHomeFriends();
    loadHomeGroups();

    return true;
  }

  /* =================================================
     INITIALIZE NORMAL PAGE
  ================================================= */

  function initializeInnerPage(pageKey) {
    const config = messagePageConfig[pageKey];

    if (!config || !config.initializer) {
      return;
    }

    const initializer = window[config.initializer];

    if (typeof initializer !== "function") {
      console.warn(
        "U9 Message: Page initializer is unavailable:",
        config.initializer
      );

      return;
    }

    try {
      const result = initializer();

      if (
        result &&
        typeof result.catch === "function"
      ) {
        result.catch(function (error) {
          console.error(
            "U9 Message: Async page initialization failed:",
            pageKey,
            error
          );
        });
      }
    } catch (error) {
      console.error(
        "U9 Message: Page initialization failed:",
        pageKey,
        error
      );
    }
  }

  /* =================================================
     SWITCH NORMAL PAGE
  ================================================= */

  function switchMessagePage(pageKey) {
    const config = messagePageConfig[pageKey];

    if (!config) {
      console.warn(
        "U9 Message: Unknown page:",
        pageKey
      );

      return false;
    }

    const content = getMessageModalContent();

    if (!content) {
      return false;
    }

    const elements = getMessagePageElements();
    const target = elements[pageKey];

    if (
      !target ||
      !target.button ||
      !target.page
    ) {
      console.warn(
        "U9 Message: Page elements are missing:",
        pageKey
      );

      return false;
    }

    if (currentMessagePage === "chat") {
      moveFocusOutOfPages();
      stopCurrentChat();

      window.messageChatReturnPage = null;
    }

    currentMessagePage = pageKey;
    currentChatUser = null;

    content.classList.remove("message-home");

    content.classList.add("message-inner-page");

    clearNavigationSelection();

    setMessageHeader(true);

    hideAllMessagePages();

    target.button.classList.add("active");

    target.button.setAttribute(
      "aria-selected",
      "true"
    );

    target.page.hidden = false;
    target.page.classList.add("active");

    target.page.setAttribute(
      "aria-hidden",
      "false"
    );

    initializeInnerPage(pageKey);

    return true;
  }

  /* =================================================
     OPEN CHAT PAGE
  ================================================= */

  function openMessageChat(user) {
    const chatPage = getChatPage();
    const content = getMessageModalContent();

    if (!chatPage || !content) {
      console.warn(
        "U9 Message: Chat page elements are missing."
      );

      return false;
    }

    if (
      !user ||
      typeof user !== "object" ||
      !(
        user.id ||
        user.user_id ||
        user.group_id ||
        user.conversation_id
      )
    ) {
      console.warn(
        "U9 Message: A valid chat target is required.",
        user
      );

      return false;
    }

    /*
     * Preserve the page that originally opened Chat.
     */
    if (currentMessagePage !== "chat") {
      const currentReturnPage =
        currentMessagePage &&
        messagePageConfig[currentMessagePage]
          ? currentMessagePage
          : null;

      const requestedReturnPage =
        window.messageChatReturnPage &&
        messagePageConfig[window.messageChatReturnPage]
          ? window.messageChatReturnPage
          : null;

      window.messageChatReturnPage =
        currentReturnPage || requestedReturnPage;
    }

    const avatarURL = getUserAvatarURL(user);

    const avatarFrameURL =
      getUserAvatarFrameURL(user);

    const chatType = String(
      user.type ||
      (user.group_id || user.groupId ? "group" : "friend")
    );

    const chatTargetId = String(
      user.id ||
      user.user_id ||
      user.group_id ||
      user.groupId ||
      user.conversation_id
    );

    currentChatUser = {
      id: chatTargetId,
      group_id: chatType === "group"
        ? String(user.group_id || user.groupId || chatTargetId)
        : null,

      name: String(
        user.name ||
        user.username ||
        user.group_name ||
        (
          chatType === "customer_service"
            ? "Customer Service"
            : chatType === "group"
              ? "Group"
              : "User"
        )
      ),

      avatar: avatarURL,
      avatar_url: avatarURL,

      avatar_type:
        user.avatar_type || "default",

      avatar_id:
        user.avatar_id || null,

      avatar_frame_type:
        user.avatar_frame_type || "default",

      avatar_frame_id:
        user.avatar_frame_id || null,

      avatar_frame_url: avatarFrameURL,
      avatarFrameUrl: avatarFrameURL,

      status: String(
        user.status ||
        (
          user.type === "customer_service"
            ? "Customer service"
            : user.type === "group"
              ? "Group conversation"
              : "Friend"
        )
      ),

      type: chatType,

      conversationId:
        user.conversationId ||
        user.conversation_id ||
        null,

      metadata: user.metadata || null
    };

    currentMessagePage = "chat";

    content.classList.remove("message-home");

    content.classList.add("message-inner-page");

    clearNavigationSelection();

    setMessageHeader(true);

    hideAllMessagePages();

    chatPage.hidden = false;

    chatPage.classList.add(
      "active",
      "is-active"
    );

    chatPage.setAttribute(
      "aria-hidden",
      "false"
    );

    if (
      typeof window.initializeChatPage === "function"
    ) {
      try {
        const result = window.initializeChatPage({
          ...currentChatUser
        });

        if (
          result &&
          typeof result.catch === "function"
        ) {
          result.catch(function (error) {
            console.error(
              "U9 Message: Chat initialization failed.",
              error
            );
          });
        }
      } catch (error) {
        console.error(
          "U9 Message: Chat initialization failed.",
          error
        );
      }
    } else {
      console.warn(
        "U9 Message: chat.js has not registered initializeChatPage()."
      );
    }

    window.dispatchEvent(
      new CustomEvent("u9:message:chat-opened", {
        detail: {
          target: { ...currentChatUser }
        }
      })
    );

    return true;
  }

  /* =================================================
     GROUP CHAT BRIDGE

     group.js emits u9:open-group-chat with a group ID and
     group details. Route that event through the existing
     Chat Page instead of creating a second modal.
  ================================================= */

  function openMessageGroupChat(detail) {
    const input = detail && typeof detail === "object"
      ? detail
      : {};

    const group = input.group && typeof input.group === "object"
      ? input.group
      : input;

    const groupId = String(
      input.groupId ||
      input.group_id ||
      group.id ||
      ""
    ).trim();

    if (!groupId) {
      console.warn("U9 Message: Cannot open group chat without a group ID.");
      return false;
    }

    return openMessageChat({
      id: groupId,
      group_id: groupId,
      group_name: group.name || input.group_name || "Group",
      name: group.name || input.group_name || "Group",
      description: group.description || "",
      avatar_url: group.avatar_url || "",
      type: "group",
      status: "Group chat",
      metadata: {
        group_id: groupId,
        role: input.membership?.role || input.role || null
      }
    });
  }

  function handleOpenGroupChatEvent(event) {
    const opened = openMessageGroupChat(event?.detail);

    if (!opened) {
      console.error("U9 Message: Group chat could not be opened.");
    }
  }

  function bindGroupChatEvents() {
    if (window.__U9MessageGroupChatEventBound) {
      return;
    }

    window.__U9MessageGroupChatEventBound = true;
    window.addEventListener("u9:open-group-chat", handleOpenGroupChatEvent);
  }

  /* =================================================
     CLOSE CHAT PAGE
  ================================================= */

  function closeMessageChat() {
    moveFocusOutOfPages();

    const returnPage = window.messageChatReturnPage;

    window.messageChatReturnPage = null;

    stopCurrentChat();

    currentChatUser = null;
    currentMessagePage = null;

    if (
      returnPage &&
      messagePageConfig[returnPage]
    ) {
      return switchMessagePage(returnPage);
    }

    return showMessageHome();
  }

  /* =================================================
     HEADER BUTTON
  ================================================= */

  function handleMessageHeaderButton() {
    if (currentMessagePage === "chat") {
      closeMessageChat();
      return;
    }

    if (currentMessagePage !== null) {
      showMessageHome();
      return;
    }

    const manager = window.U9WindowManager;

    if (
      manager &&
      typeof manager.close === "function"
    ) {
      manager.close("message");
    } else {
      closeMessageModal();
    }
  }

  /* =================================================
     OPEN MODAL
  ================================================= */

  function openMessageModal() {
    const modal = getMessageModal();
    const content = getMessageModalContent();

    if (!modal || !content) {
      console.warn(
        "U9 Message: Modal elements are missing."
      );

      return false;
    }

    if (closeAnimationTimer !== null) {
      clearTimeout(closeAnimationTimer);
      closeAnimationTimer = null;
    }

    modal.classList.remove("modal-closing");

    showMessageHome();

    modal.classList.add("modal-open");

    return true;
  }

  /* =================================================
     CLOSE MODAL
  ================================================= */

  function closeMessageModal() {
    const modal = getMessageModal();
    const content = getMessageModalContent();

    if (!modal || !content) {
      return false;
    }

    if (!modal.classList.contains("modal-open")) {
      return true;
    }

    if (currentMessagePage === "chat") {
      showMessageHome();
    }

    modal.classList.remove("modal-open");

    modal.classList.add("modal-closing");

    if (closeAnimationTimer !== null) {
      clearTimeout(closeAnimationTimer);
      closeAnimationTimer = null;
    }

    function finishClose() {
      if (!modal.classList.contains("modal-closing")) {
        return;
      }

      modal.classList.remove("modal-closing");

      content.removeEventListener(
        "transitionend",
        handleCloseTransition
      );

      if (closeAnimationTimer !== null) {
        clearTimeout(closeAnimationTimer);
        closeAnimationTimer = null;
      }
    }

    function handleCloseTransition(event) {
      if (
        event.target !== content ||
        event.propertyName !== "transform"
      ) {
        return;
      }

      finishClose();
    }

    content.addEventListener(
      "transitionend",
      handleCloseTransition
    );

    closeAnimationTimer = setTimeout(
      finishClose,
      700
    );

    return true;
  }

  /* =================================================
     NAVIGATION EVENTS
  ================================================= */

  function initializeMessageNavigation() {
    const navigation = getMessageNavigation();
    const pagesContainer = getMessagePagesContainer();

    if (!navigation || !pagesContainer) {
      console.warn(
        "U9 Message: Navigation or page container is missing."
      );

      return false;
    }

    const elements = getMessagePageElements();

    Object.keys(elements).forEach(function (pageKey) {
      const button = elements[pageKey].button;

      if (!button) {
        console.warn(
          "U9 Message: Navigation button is missing:",
          pageKey
        );

        return;
      }

      if (
        button.dataset.messageNavigationBound === "true"
      ) {
        return;
      }

      button.dataset.messageNavigationBound = "true";

      button.addEventListener("click", function () {
        switchMessagePage(pageKey);
      });
    });

    const closeButton = getMessageModalClose();

    if (
      closeButton &&
      closeButton.dataset.messageCloseBound !== "true"
    ) {
      closeButton.dataset.messageCloseBound = "true";

      closeButton.addEventListener(
        "click",
        handleMessageHeaderButton
      );
    }

    showMessageHome();

    return true;
  }

  /* =================================================
     WINDOW MANAGER
  ================================================= */

  function registerMessageWindowManager() {
    const manager = window.U9WindowManager;

    if (
      !manager ||
      typeof manager.register !== "function"
    ) {
      console.warn(
        "U9 Message: U9WindowManager is not available yet."
      );

      return false;
    }

    manager.register("message", {
      open: openMessageModal,

      close: closeMessageModal,

      isOpen: function () {
        const modal = getMessageModal();

        if (!modal) {
          return false;
        }

        return (
          modal.classList.contains("modal-open") ||
          modal.classList.contains("modal-closing")
        );
      }
    });

    return true;
  }

  /* =================================================
     PUBLIC API
  ================================================= */

  window.openMessageModal = openMessageModal;
  window.closeMessageModal = closeMessageModal;

  window.showMessageHome = showMessageHome;
  window.switchMessagePage = switchMessagePage;

  window.openMessageChat = openMessageChat;
  window.openMessageGroupChat = openMessageGroupChat;
  window.closeMessageChat = closeMessageChat;

  window.refreshMessageHomeFriends = function () {
    return loadHomeFriends({ force: true });
  };

  window.refreshMessageUnreadIndicators = refreshMessageUnreadIndicators;

  window.refreshMessageHomeGroups = function () {
    return loadHomeGroups({ force: true });
  };

  window.getCurrentMessageChatUser = function () {
    return currentChatUser
      ? { ...currentChatUser }
      : null;
  };

  window.getCurrentMessagePage = function () {
    return currentMessagePage;
  };

  /* =================================================
     INITIALIZE
  ================================================= */

  function initializeMessageModal() {
    if (messageInitialized) {
      return;
    }

    messageInitialized = true;

    bindHomeFriendsEvents();
    bindGroupChatEvents();
    initializeMessageNavigation();
    startUnreadMessagePolling();

    document.addEventListener("visibilitychange", function () {
      if (!document.hidden) refreshMessageUnreadIndicators();
    });
    registerMessageWindowManager();

    console.log(
      "U9 Message Normal Modal initialized."
    );
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initializeMessageModal,
      { once: true }
    );
  } else {
    initializeMessageModal();
  }

})();
