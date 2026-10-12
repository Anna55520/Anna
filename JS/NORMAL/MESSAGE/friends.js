
/* =================================================
   U9 MESSAGE - FRIENDS PAGE
   File: JS/NORMAL/MESSAGE/friends.js

   Features:
   1. Load friends through message-api
   2. Keep existing session authentication
   3. No duplicate Friends heading
   4. Four SVG action icons
   5. Only Chat opens the chat page
   6. Scrollable friends list
================================================= */

(function () {
  "use strict";

  const MESSAGE_API_URL =
    "https://tvtakmswbzawaweytimx.supabase.co/functions/v1/message-api";

  const FRIENDS_ROOT_ID = "Message-model-friends-root";

  const ACTION_ICON_URL =
    "SSVG/account/account-edit-button.svg";

  let friendsInitialized = false;
  let isLoading = false;

  function getRoot() {
    return document.getElementById(FRIENDS_ROOT_ID);
  }

  /* =================================================
     HELPERS
  ================================================= */

  function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[character]);
  }

  function getInitials(name) {
    const value = String(name || "User").trim();

    return value
      .split(/\s+/)
      .slice(0, 2)
      .map(part => part.charAt(0))
      .join("")
      .toUpperCase() || "U";
  }

  function getAvatarURL(friend) {
    const value =
      friend?.avatar_url ||
      friend?.avatar ||
      friend?.profile_image ||
      friend?.photo_url ||
      "";

    if (typeof value !== "string") return "";

    const url = value.trim();

    return /^https?:\/\//i.test(url) ? url : "";
  }

  /* =================================================
     AUTHENTICATION
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
        console.warn("U9 Friends: Cannot read session storage.");
      }
    }

    return "";
  }

  async function callMessageAPI(action, payload = {}) {
    const headers = {
      "Content-Type": "application/json"
    };

    const token = getSessionToken();

    if (token) {
      headers.Authorization = "Bearer " + token;
    }

    const response = await fetch(MESSAGE_API_URL, {
      method: "POST",
      headers,
      credentials: "include",
      body: JSON.stringify({
        action,
        ...payload
      })
    });

    let result;

    try {
      result = await response.json();
    } catch (error) {
      throw new Error("Invalid response from message server.");
    }

    if (!response.ok || !result || result.success !== true) {
      const apiError = new Error(
        result?.error || `Request failed (${response.status}).`
      );

      apiError.status = response.status;

      throw apiError;
    }

    return result;
  }

  /* =================================================
     STATUS
  ================================================= */

  function renderMessage(message, type = "info") {
    const root = getRoot();

    if (!root) return;

    root.innerHTML = `
      <div class="U9-friends-state U9-friends-state-${escapeHTML(type)}">
        ${escapeHTML(message)}
      </div>
    `;
  }

  /* =================================================
     NORMALIZE FRIENDS
  ================================================= */

  function normalizeFriends(items) {
    if (!Array.isArray(items)) return [];

    return items
      .filter(item => item?.friend?.id)
      .map(item => {
        const profile = item.friend;

        return {
          id: String(profile.id),
          username: profile.username || "User",
          account: profile.account || "",
          avatar_url: profile.avatar_url || "",
          avatar: profile.avatar || "",
          profile_image: profile.profile_image || "",
          photo_url: profile.photo_url || "",
          friendship_id: item.friendship_id || item.id || "",
          created_at: item.created_at || ""
        };
      });
  }

  /* =================================================
     SVG ACTION BUTTON
  ================================================= */

  function renderActionButton(friend, action, label, enabled) {
    const disabledAttribute = enabled ? "" : "disabled";

    return `
      <button
        class="U9-friend-action U9-friend-action-${action}"
        type="button"
        data-friend-action="${action}"
        data-friend-id="${escapeHTML(friend.id)}"
        aria-label="${escapeHTML(label)}"
        title="${escapeHTML(label)}"
        ${disabledAttribute}
      >
        <img
          src="${ACTION_ICON_URL}"
          alt=""
          aria-hidden="true"
          draggable="false"
        >
      </button>
    `;
  }

  /* =================================================
     RENDER FRIEND LIST
  ================================================= */

  function renderFriends(friends) {
    const root = getRoot();

    if (!root) return;

    if (!friends.length) {
      root.innerHTML = `
        <div class="U9-friends-empty">
          <div class="U9-friends-empty-icon">♧</div>

          <div class="U9-friends-empty-title">
            No friends yet
          </div>

          <div class="U9-friends-empty-description">
            Your accepted friends will appear here.
          </div>
        </div>
      `;

      return;
    }

    root.innerHTML = `
      <div class="U9-friends-page">
        <div class="U9-friends-list">

          ${friends.map(friend => {
            const username = friend.username || "User";
            const account = friend.account || "";
            const avatarURL = getAvatarURL(friend);

            const avatarHTML = avatarURL
              ? `
                <img
                  class="U9-friend-avatar-image"
                  src="${escapeHTML(avatarURL)}"
                  alt=""
                  loading="lazy"
                  referrerpolicy="no-referrer"
                >
              `
              : `
                <div class="U9-friend-avatar-fallback">
                  ${escapeHTML(getInitials(username))}
                </div>
              `;

            return `
              <article
                class="U9-friend-card"
                data-friend-id="${escapeHTML(friend.id)}"
              >

                <div class="U9-friend-avatar">
                  ${avatarHTML}
                </div>

                <div class="U9-friend-info">
                  <div class="U9-friend-name">
                    ${escapeHTML(username)}
                  </div>

                  <div class="U9-friend-account">
                    ${account ? "@" + escapeHTML(account) : "Friend"}
                  </div>
                </div>

                <div class="U9-friend-actions">

                  ${renderActionButton(
                    friend, "observe", "Observe", false
                  )}

                  ${renderActionButton(
                    friend, "mute", "Mute", false
                  )}

                  ${renderActionButton(
                    friend, "chat", "Chat", true
                  )}

                  ${renderActionButton(
                    friend, "delete", "Delete friend", false
                  )}

                </div>

              </article>
            `;
          }).join("")}

        </div>
      </div>
    `;

    bindActionButtons(friends);
    bindAvatarFallbacks();
  }

  /* =================================================
     ACTION BUTTONS
  ================================================= */

  function bindActionButtons(friends) {
    const root = getRoot();

    if (!root) return;

    root.querySelectorAll('[data-friend-action="chat"]').forEach(button => {
      button.addEventListener("click", function () {
        const friendId = button.dataset.friendId;

        const friend = friends.find(
          item => String(item.id) === String(friendId)
        );

        if (!friend) return;

        if (typeof window.openMessageChat !== "function") {
          console.error(
            "U9 Friends: window.openMessageChat() is unavailable."
          );
          return;
        }

        window.messageChatReturnPage = "friends";

        window.openMessageChat({
          id: friend.id,
          name: friend.username || "User",
          avatar: getAvatarURL(friend),
          status: "Friend",
          type: "friend"
        });
      });
    });

    // Observe, Mute and Delete are intentionally disabled for now.
  }

  /* =================================================
     AVATAR FALLBACK
  ================================================= */

  function bindAvatarFallbacks() {
    const root = getRoot();

    if (!root) return;

    root.querySelectorAll(".U9-friend-avatar-image").forEach(image => {
      image.addEventListener("error", function () {
        const card = image.closest(".U9-friend-card");

        const name = card?.querySelector(".U9-friend-name")
          ?.textContent || "User";

        const fallback = document.createElement("div");

        fallback.className = "U9-friend-avatar-fallback";
        fallback.textContent = getInitials(name);

        image.replaceWith(fallback);
      }, { once: true });
    });
  }

  /* =================================================
     LOAD FRIENDS
  ================================================= */

  async function loadFriends() {
    const root = getRoot();

    if (!root || isLoading) return;

    isLoading = true;
    renderMessage("Loading friends...", "loading");

    try {
      const result = await callMessageAPI("list_friends");
      const friends = normalizeFriends(result.friends);

      renderFriends(friends);

    } catch (error) {
      console.error("U9 Friends: Failed to load friends.", error);

      const message = String(error.message || "").toLowerCase();

      if (
        error.status === 401 ||
        message.includes("authentication required") ||
        message.includes("invalid session") ||
        message.includes("session expired") ||
        message.includes("unauthorized")
      ) {
        renderMessage(
          "Your session may have expired. Please sign in again.",
          "error"
        );
      } else {
        renderMessage(
          "Could not load friends. Please try again.",
          "error"
        );
      }
    } finally {
      isLoading = false;
    }
  }

  /* =================================================
     INITIALIZE
  ================================================= */

  function initializeFriendsPage() {
    if (!getRoot()) {
      console.warn(
        "U9 Friends: #Message-model-friends-root was not found."
      );
      return;
    }

    friendsInitialized = true;
    loadFriends();
  }

  window.initializeFriendsPage = initializeFriendsPage;

  window.refreshFriendsPage = function () {
    if (isLoading) return;

    if (friendsInitialized) {
      return loadFriends();
    }

    initializeFriendsPage();
  };

})();
