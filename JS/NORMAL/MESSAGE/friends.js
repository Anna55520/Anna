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
   7. Display the selected avatar and avatar frame
   8. Use fallback images when avatar images fail
================================================= */

(function () {
  "use strict";

  if (window.__U9FriendsPageInitialized) {
    return;
  }

  window.__U9FriendsPageInitialized = true;

  /* =================================================
     CONFIGURATION
  ================================================= */

  const MESSAGE_API_URL =
    "https://tvtakmswbzawaweytimx.supabase.co/functions/v1/message-api";

  const FRIENDS_ROOT_ID =
    "Message-model-friends-root";

  const ACTION_ICON_URL =
    "SSVG/account/account-edit-button.svg";

  /*
   * Keep the existing default avatar requested for Chat.
   *
   * Default avatar and default avatar frame are separate
   * images and must not replace each other.
   */
  const DEFAULT_AVATAR =
    "/SSVG/account/account-edit-button.svg";

  const DEFAULT_AVATAR_FRAME =
    "/SSVG/avatar/ordinary.svg";

  /* =================================================
     STATE
  ================================================= */

  let friendsInitialized = false;
  let isLoading = false;

  /* =================================================
     ROOT
  ================================================= */

  function getRoot() {
    return document.getElementById(
      FRIENDS_ROOT_ID
    );
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
     INITIALS FALLBACK
  ================================================= */

  function getInitials(name) {
    const value = String(name || "User").trim();

    return value
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(function (part) {
        return part.charAt(0);
      })
      .join("")
      .toUpperCase() || "U";
  }

  /* =================================================
     IMAGE URL VALIDATION

     Supports:
     - HTTPS image URLs
     - Local absolute paths
     - SVG Data URLs produced by message-api
  ================================================= */

  function normalizeImageURL(value) {
    if (typeof value !== "string") {
      return "";
    }

    const url = value.trim();

    if (!url) {
      return "";
    }

    if (/^https:\/\//i.test(url)) {
      return url;
    }

    if (
      url.startsWith("/") &&
      !url.startsWith("//")
    ) {
      return url;
    }

    if (
      /^data:image\/svg\+xml;charset=UTF-8,/i.test(url)
    ) {
      return url;
    }

    return "";
  }

  /* =================================================
     GET AVATAR URL

     The current message-api returns:
       avatar_url
       avatar_type
  ================================================= */

  function getAvatarURL(friend) {
    const value =
      friend?.avatar_url ||
      friend?.avatarUrl ||
      (
        typeof friend?.avatar === "string"
          ? friend.avatar
          : friend?.avatar?.url
      ) ||
      friend?.profile_image ||
      friend?.photo_url ||
      "";

    return (
      normalizeImageURL(value) ||
      DEFAULT_AVATAR
    );
  }

  /* =================================================
     GET AVATAR FRAME URL

     The current message-api returns:
       avatar_frame_url
       avatar_frame_type
  ================================================= */

  function getAvatarFrameURL(friend) {
    const value =
      friend?.avatar_frame_url ||
      friend?.avatarFrameUrl ||
      friend?.avatarFrame ||
      "";

    return (
      normalizeImageURL(value) ||
      DEFAULT_AVATAR_FRAME
    );
  }

  /* =================================================
     AUTHENTICATION

     Keep the existing U9 token keys and session cookie.
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

        if (
          value &&
          value.trim()
        ) {
          return value.trim();
        }
      } catch (error) {
        console.warn(
          "U9 Friends: Cannot read session storage."
        );

        return "";
      }
    }

    return "";
  }

  /* =================================================
     CALL MESSAGE API
  ================================================= */

  async function callMessageAPI(
    action,
    payload = {}
  ) {
    const headers = {
      "Content-Type": "application/json"
    };

    const token = getSessionToken();

    if (token) {
      headers.Authorization =
        "Bearer " + token;
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
      const apiError = new Error(
        result?.error ||
        `Request failed (${response.status}).`
      );

      apiError.status = response.status;

      throw apiError;
    }

    return result;
  }

  /* =================================================
     STATUS
  ================================================= */

  function renderMessage(
    message,
    type = "info"
  ) {
    const root = getRoot();

    if (!root) {
      return;
    }

    root.innerHTML = `
      <div
        class="U9-friends-state U9-friends-state-${escapeHTML(type)}"
        role="${type === "error" ? "alert" : "status"}"
      >
        ${escapeHTML(message)}
      </div>
    `;
  }

  /* =================================================
     NORMALIZE FRIENDS

     API response:
       result.friends[].friend

     Friend profile includes:
       id
       username
       account
       avatar_url
       avatar_frame_url
       avatar_type
       avatar_frame_type
  ================================================= */

  function normalizeFriends(items) {
    if (!Array.isArray(items)) {
      return [];
    }

    return items
      .filter(function (item) {
        return Boolean(item?.friend?.id);
      })
      .map(function (item) {
        const profile = item.friend;

        return {
          id: String(profile.id),

          username:
            profile.username || "User",

          account:
            profile.account || "",

          avatar_url:
            getAvatarURL(profile),

          avatar_frame_url:
            getAvatarFrameURL(profile),

          avatar_type:
            profile.avatar_type || "default",

          avatar_id:
            profile.avatar_id || null,

          avatar_frame_type:
            profile.avatar_frame_type || "default",

          avatar_frame_id:
            profile.avatar_frame_id || null,

          friendship_id:
            item.friendship_id ||
            item.id ||
            "",

          created_at:
            item.created_at || ""
        };
      });
  }

  /* =================================================
     ACTION BUTTON
  ================================================= */

  function renderActionButton(
    friend,
    action,
    label,
    enabled
  ) {
    const disabledAttribute =
      enabled ? "" : "disabled";

    return `
      <button
        class="U9-friend-action U9-friend-action-${escapeHTML(action)}"
        type="button"
        data-friend-action="${escapeHTML(action)}"
        data-friend-id="${escapeHTML(friend.id)}"
        aria-label="${escapeHTML(label)}"
        title="${escapeHTML(label)}"
        ${disabledAttribute}
      >
        <img
          src="${escapeHTML(ACTION_ICON_URL)}"
          alt=""
          aria-hidden="true"
          draggable="false"
        >
      </button>
    `;
  }

  /* =================================================
     FRIEND AVATAR HTML

     The avatar frame overlays the avatar image.
     The wrapper is positioned relatively so the frame
     remains aligned with the avatar.
  ================================================= */

  function renderFriendAvatar(friend) {
    const avatarURL =
      getAvatarURL(friend);

    const frameURL =
      getAvatarFrameURL(friend);

    return `
      <div
        class="U9-friend-avatar"
        style="position:relative;"
      >
        <img
          class="U9-friend-avatar-image"
          src="${escapeHTML(avatarURL)}"
          data-fallback-stage="0"
          alt=""
          loading="lazy"
          referrerpolicy="no-referrer"
          draggable="false"
        >

        <img
          class="U9-friend-avatar-frame-image"
          src="${escapeHTML(frameURL)}"
          data-fallback-stage="0"
          alt=""
          aria-hidden="true"
          draggable="false"
          style="
            position:absolute;
            inset:0;
            z-index:2;
            display:block;
            width:100%;
            height:100%;
            object-fit:contain;
            pointer-events:none;
          "
        >
      </div>
    `;
  }

  /* =================================================
     RENDER FRIEND LIST
  ================================================= */

  function renderFriends(friends) {
    const root = getRoot();

    if (!root) {
      return;
    }

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

          ${friends.map(function (friend) {
            const username =
              friend.username || "User";

            const account =
              friend.account || "";

            return `
              <article
                class="U9-friend-card"
                data-friend-id="${escapeHTML(friend.id)}"
              >

                ${renderFriendAvatar(friend)}

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

                <div class="U9-friend-actions">

                  ${renderActionButton(
                    friend,
                    "observe",
                    "Observe",
                    false
                  )}

                  ${renderActionButton(
                    friend,
                    "mute",
                    "Mute",
                    false
                  )}

                  ${renderActionButton(
                    friend,
                    "chat",
                    "Chat",
                    true
                  )}

                  ${renderActionButton(
                    friend,
                    "delete",
                    "Delete friend",
                    false
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
     ACTION BUTTON EVENTS

     Only Chat is enabled.
  ================================================= */

  function bindActionButtons(friends) {
    const root = getRoot();

    if (!root) {
      return;
    }

    root
      .querySelectorAll(
        '[data-friend-action="chat"]'
      )
      .forEach(function (button) {
        button.addEventListener(
          "click",
          function () {
            const friendId =
              button.dataset.friendId;

            const friend = friends.find(
              function (item) {
                return (
                  String(item.id) ===
                  String(friendId)
                );
              }
            );

            if (!friend) {
              return;
            }

            if (
              typeof window.openMessageChat !==
              "function"
            ) {
              console.error(
                "U9 Friends: window.openMessageChat() is unavailable."
              );

              return;
            }

            /*
             * Remember that Chat was opened from Friends.
             */
            window.messageChatReturnPage = "friends";

            const avatarURL =
              getAvatarURL(friend);

            const frameURL =
              getAvatarFrameURL(friend);

            window.openMessageChat({
              id: friend.id,

              name:
                friend.username || "User",

              /*
               * Pass both existing avatar aliases
               * and the explicit API field names.
               */
              avatar: avatarURL,
              avatar_url: avatarURL,

              avatar_frame_url: frameURL,
              avatarFrameUrl: frameURL,

              avatar_type:
                friend.avatar_type,

              avatar_frame_type:
                friend.avatar_frame_type,

              status: "Friend",
              type: "friend"
            });
          }
        );
      });

    /*
     * Observe, Mute and Delete remain disabled.
     */
  }

  /* =================================================
     AVATAR FALLBACK

     Avatar image:
       1. Try the API-provided image.
       2. Try DEFAULT_AVATAR.
       3. Use the initials fallback.

     Frame image:
       1. Try the API-provided frame.
       2. Try DEFAULT_AVATAR_FRAME.
       3. Hide the frame if its default image fails.
  ================================================= */

  function bindAvatarFallbacks() {
    const root = getRoot();

    if (!root) {
      return;
    }

    if (
      root.dataset.avatarFallbackBound === "true"
    ) {
      return;
    }

    root.dataset.avatarFallbackBound = "true";

    /*
     * Use a capturing error listener because image error
     * events do not bubble normally.
     */
    root.addEventListener(
      "error",
      function (event) {
        const image = event.target;

        if (
          !(image instanceof HTMLImageElement)
        ) {
          return;
        }

        /* -------------------------------------------
           AVATAR FRAME ERROR
        ------------------------------------------- */

        if (
          image.classList.contains(
            "U9-friend-avatar-frame-image"
          )
        ) {
          const stage =
            image.dataset.fallbackStage || "0";

          if (stage === "0") {
            image.dataset.fallbackStage = "1";
            image.src = DEFAULT_AVATAR_FRAME;
            return;
          }

          /*
           * Avoid repeatedly requesting a missing
           * default frame image.
           */
          image.hidden = true;
          return;
        }

        /* -------------------------------------------
           AVATAR IMAGE ERROR
        ------------------------------------------- */

        if (
          !image.classList.contains(
            "U9-friend-avatar-image"
          )
        ) {
          return;
        }

        const stage =
          image.dataset.fallbackStage || "0";

        if (stage === "0") {
          image.dataset.fallbackStage = "1";
          image.src = DEFAULT_AVATAR;
          return;
        }

        /*
         * The default avatar itself failed.
         * Replace only the base avatar image with
         * the existing initials fallback.
         *
         * The frame overlay remains in place.
         */
        const card =
          image.closest(".U9-friend-card");

        const name =
          card?.querySelector(".U9-friend-name")
            ?.textContent || "User";

        const fallback =
          document.createElement("div");

        fallback.className =
          "U9-friend-avatar-fallback";

        fallback.textContent =
          getInitials(name);

        image.replaceWith(fallback);
      },
      true
    );
  }

  /* =================================================
     LOAD FRIENDS
  ================================================= */

  async function loadFriends() {
    const root = getRoot();

    if (!root || isLoading) {
      return;
    }

    isLoading = true;

    renderMessage(
      "Loading friends...",
      "loading"
    );

    try {
      const result =
        await callMessageAPI("list_friends");

      const friends =
        normalizeFriends(result.friends);

      renderFriends(friends);

      console.log(
        "U9 Friends: Friends loaded.",
        {
          count: friends.length
        }
      );
    } catch (error) {
      console.error(
        "U9 Friends: Failed to load friends.",
        error
      );

      const message =
        String(
          error?.message || ""
        ).toLowerCase();

      if (
        error?.status === 401 ||
        message.includes("authentication required") ||
        message.includes("invalid session") ||
        message.includes("session expired") ||
        message.includes("unauthorized")
      ) {
        renderMessage(
          "Your session may have expired. Please sign in again.",
          "error"
        );
      } else if (
        error?.status === 403 &&
        message.includes("origin")
      ) {
        renderMessage(
          "This website is not authorized to access the message service.",
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

  /* =================================================
     PUBLIC API
  ================================================= */

  window.initializeFriendsPage =
    initializeFriendsPage;

  window.refreshFriendsPage = function () {
    if (isLoading) {
      return;
    }

    if (friendsInitialized) {
      return loadFriends();
    }

    initializeFriendsPage();
  };

  /* =================================================
     INITIALIZE AVATAR FALLBACK HANDLER
  ================================================= */

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      bindAvatarFallbacks,
      { once: true }
    );
  } else {
    bindAvatarFallbacks();
  }

  console.log("U9 Friends Page initialized.");

})();
