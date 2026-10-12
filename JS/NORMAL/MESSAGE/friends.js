
/* =================================================
   U9 MESSAGE - FRIENDS PAGE
   File: JS/NORMAL/MESSAGE/friends.js

   Features:
   1. Load friends through message-api Edge Function
   2. Use the existing login session
   3. Render friend cards
   4. Show avatar initials if no avatar is available
   5. Open the chat page when clicking Chat
   6. Support refreshFriendsPage()
================================================= */

(function () {
  "use strict";

  const MESSAGE_API_URL =
    "https://tvtakmswbzawaweytimx.supabase.co/functions/v1/message-api";

  const FRIENDS_ROOT_ID = "Message-model-friends-root";

  let friendsInitialized = false;
  let isLoading = false;
  let currentLoadId = 0;

  /* =================================================
     ROOT
  ================================================= */

  function getRoot() {
    return document.getElementById(FRIENDS_ROOT_ID);
  }

  /* =================================================
     HTML ESCAPE
  ================================================= */

  function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, function (character) {
      const entities = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      };

      return entities[character];
    });
  }

  /* =================================================
     AVATAR
  ================================================= */

  function getInitials(name) {
    const cleaned = String(name || "Friend").trim();

    if (!cleaned) return "F";

    return cleaned
      .split(/\s+/)
      .slice(0, 2)
      .map(part => part.charAt(0))
      .join("")
      .toUpperCase();
  }

  function getAvatarURL(friend) {
    if (!friend || typeof friend !== "object") {
      return "";
    }

    const possibleURL =
      friend.avatar_url ||
      friend.avatar ||
      friend.profile_image ||
      friend.photo_url ||
      "";

    if (typeof possibleURL !== "string") {
      return "";
    }

    const url = possibleURL.trim();

    // Only allow normal HTTP(S) image URLs.
    if (!/^https?:\/\//i.test(url)) {
      return "";
    }

    return url;
  }

  /* =================================================
     MESSAGE API
  ================================================= */

  function getSessionToken() {
    const possibleKeys = [
      "u9_token",
      "u9_access_token",
      "access_token",
      "authToken",
      "token"
    ];

    for (const key of possibleKeys) {
      try {
        const value = localStorage.getItem(key);

        if (value && value.trim()) {
          return value.trim();
        }
      } catch (error) {
        console.warn(
          "U9 Friends: Could not read localStorage key:",
          key
        );
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
      throw new Error(
        "The message server returned an invalid response."
      );
    }

    if (!response.ok || !result || result.success !== true) {
      const message =
        result && typeof result.error === "string"
          ? result.error
          : "Request failed (" + response.status + ").";

      const apiError = new Error(message);
      apiError.status = response.status;

      throw apiError;
    }

    return result;
  }

  /* =================================================
     STATUS MESSAGE
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
     NORMALIZE FRIEND DATA
  ================================================= */

  function normalizeFriends(items) {
    if (!Array.isArray(items)) {
      return [];
    }

    return items
      .filter(item => item && item.friend && item.friend.id)
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
     RENDER FRIENDS
  ================================================= */

  function renderFriends(friends) {
    const root = getRoot();

    if (!root) return;

    if (!Array.isArray(friends) || friends.length === 0) {
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

        <div class="U9-friends-heading">
          <div class="U9-friends-title">
            Friends
          </div>

          <div class="U9-friends-count">
            ${friends.length}
            ${friends.length === 1 ? "friend" : "friends"}
          </div>
        </div>

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
                    ${
                      account
                        ? "@" + escapeHTML(account)
                        : "Friend"
                    }
                  </div>

                </div>

                <button
                  class="U9-friend-chat-button"
                  type="button"
                  data-chat-friend-id="${escapeHTML(friend.id)}"
                >
                  Chat
                </button>

              </article>
            `;
          }).join("")}

        </div>
      </div>
    `;

    bindChatButtons(friends);
    bindAvatarFallbacks();
  }

  /* =================================================
     CHAT BUTTONS
  ================================================= */

  function bindChatButtons(friends) {
    const root = getRoot();

    if (!root) return;

    root.querySelectorAll("[data-chat-friend-id]").forEach(button => {
      button.addEventListener("click", function () {
        const friendId = button.dataset.chatFriendId;

        const friend = friends.find(
          item => String(item.id) === String(friendId)
        );

        if (!friend) {
          console.error("U9 Friends: Friend profile not found.");
          return;
        }

        if (typeof window.openMessageChat !== "function") {
          console.error(
            "U9 Friends: window.openMessageChat() is unavailable. " +
            "Check that normal-message.js is loaded."
          );

          return;
        }

        // Return to Friends when the chat page's own Back button is used.
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
  }

  /* =================================================
     AVATAR ERROR FALLBACK
  ================================================= */

  function bindAvatarFallbacks() {
    const root = getRoot();

    if (!root) return;

    root.querySelectorAll(".U9-friend-avatar-image").forEach(image => {
      image.addEventListener("error", function () {
        const friendCard = image.closest(".U9-friend-card");

        const nameElement = friendCard
          ? friendCard.querySelector(".U9-friend-name")
          : null;

        const name = nameElement
          ? nameElement.textContent
          : "Friend";

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

    if (!root) {
      console.warn(
        "U9 Friends: #Message-model-friends-root was not found."
      );
      return;
    }

    // Avoid overlapping requests.
    if (isLoading) return;

    isLoading = true;

    const thisLoadId = ++currentLoadId;

    renderMessage("Loading friends...", "loading");

    try {
      // The Edge Function identifies the logged-in user
      // from the validated session. No frontend user ID is required.
      const result = await callMessageAPI("list_friends");

      // Ignore stale results if a newer load has started.
      if (thisLoadId !== currentLoadId) return;

      const friends = normalizeFriends(result.friends);

      renderFriends(friends);

    } catch (error) {
      console.error(
        "U9 Friends: Failed to load friends.",
        error
      );

      if (thisLoadId !== currentLoadId) return;

      const errorText = String(error.message || "").toLowerCase();

      if (
        error.status === 401 ||
        errorText.includes("authentication required") ||
        errorText.includes("invalid session") ||
        errorText.includes("session expired") ||
        errorText.includes("unauthorized")
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
      if (thisLoadId === currentLoadId) {
        isLoading = false;
      }
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

  /* =================================================
     PUBLIC FUNCTIONS
  ================================================= */

  window.initializeFriendsPage = initializeFriendsPage;

  window.refreshFriendsPage = function () {
    if (isLoading) {
      currentLoadId++;
      isLoading = false;
    }

    if (friendsInitialized) {
      return loadFriends();
    }

    initializeFriendsPage();
  };

})();
