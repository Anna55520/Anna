
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
   7. Support custom and free avatars
   8. Display selected avatar frames
   9. Independent avatar and frame fallbacks
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

  const MESSAGE_API_URL = "/api/message-api";
   
  const FREE_AVATAR_API_URL = "/api/avatar-free";

  const FRIENDS_ROOT_ID =
    "Message-model-friends-root";

  const ACTION_ICON_URL =
    "/SSVG/account/account-edit-button.svg";

  /*
   * Chat fallback avatar.
   * This is only a fallback, not the selected avatar.
   */
  const DEFAULT_AVATAR =
    "/SSVG/account/account-edit-button.svg";

  /*
   * Default avatar frame is a separate image.
   */
  const DEFAULT_AVATAR_FRAME =
    "/SSVG/avatar/ordinary.svg";

  /* =================================================
     STATE
  ================================================= */

  let friendsInitialized = false;
  let isLoading = false;

  /*
   * Cache the free-avatar catalogue during this page
   * session. It is loaded only when a friend uses a free
   * avatar that needs resolving.
   */
  let freeAvatarMapPromise = null;

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
     NORMALIZE IMAGE URL

     Supports:
     - HTTPS URLs
     - Local absolute paths
     - SVG Data URLs
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
      /^data:image\/[a-z0-9.+-]+(?:;[^,]*)?,/i.test(url)
    ) {
      return url;
    }

    return "";
  }

  /* =================================================
     SVG SOURCE -> IMAGE SOURCE

     avatar-free returns SVG source text in its svg field.
     Convert raw SVG text to a Data URL before rendering.
  ================================================= */

  function svgToImageSource(source) {
    if (typeof source !== "string") {
      return "";
    }

    const value = source.trim();

    if (!value) {
      return "";
    }

    if (
      /^<svg\b/i.test(value) ||
      /^<\?xml\b/i.test(value)
    ) {
      return (
        "data:image/svg+xml;charset=UTF-8," +
        encodeURIComponent(value)
      );
    }

    return normalizeImageURL(value);
  }

  /* =================================================
     DEFAULT URL DETECTION
  ================================================= */

  function isDefaultAvatarURL(value) {
    const url = normalizeImageURL(value);

    if (!url) {
      return true;
    }

    return (
      url === DEFAULT_AVATAR ||
      url === "/SSVG/avatar/profile.svg" ||
      url.endsWith("/SSVG/account/account-edit-button.svg") ||
      url.endsWith("/SSVG/avatar/profile.svg")
    );
  }

  /* =================================================
     FREE AVATAR CATALOGUE

     Existing API:
       GET /functions/v1/avatar-free

     Expected response:
       {
         "avatars": [
           {
             "id": "...",
             "svg": "<svg>...</svg>"
           }
         ]
       }
  ================================================= */

  async function loadFreeAvatarMap() {
    if (!freeAvatarMapPromise) {
      freeAvatarMapPromise = (async function () {
        const response = await fetch(
          FREE_AVATAR_API_URL,
          {
            method: "GET",
            cache: "no-store"
          }
        );

        let result;

        try {
          result = await response.json();
        } catch (error) {
          throw new Error(
            "Invalid response from the free-avatar service."
          );
        }

        if (
          !response.ok ||
          result?.success === false
        ) {
          throw new Error(
            result?.error ||
            result?.message ||
            "Could not load free avatars."
          );
        }

        const avatars = Array.isArray(result?.avatars)
          ? result.avatars
          : [];

        const map = new Map();

        avatars.forEach(function (avatar) {
          if (
            !avatar ||
            avatar.id === undefined ||
            avatar.id === null
          ) {
            return;
          }

          const source = svgToImageSource(
            avatar.svg ||
            avatar.image ||
            avatar.url
          );

          if (source) {
            map.set(
              String(avatar.id),
              source
            );
          }
        });

        return map;
      })().catch(function (error) {
        /*
         * Permit retry after a failed request.
         */
        freeAvatarMapPromise = null;
        throw error;
      });
    }

    return freeAvatarMapPromise;
  }

  /* =================================================
     RESOLVE SELECTED AVATAR

     1. Free avatar:
        Resolve avatar_id from avatar-free.
     2. Custom avatar:
        Use user_avatar.avatar_url.
     3. Default avatar:
        Use DEFAULT_AVATAR.

     If the catalogue cannot be loaded, use a valid
     non-default avatar_url supplied by message-api.
  ================================================= */

  async function resolveFriendAvatar(friend) {
    const type = String(
      friend?.avatar_type || "default"
    ).trim().toLowerCase();

    const avatarId =
      friend?.avatar_id || null;

    const apiAvatarURL = normalizeImageURL(
      friend?.avatar_url ||
      friend?.avatarUrl ||
      (
        typeof friend?.avatar === "string"
          ? friend.avatar
          : friend?.avatar?.url
      ) ||
      friend?.profile_image ||
      friend?.photo_url ||
      ""
    );

    /*
     * Resolve the chosen free avatar by its database ID.
     */
    if (
      type === "free" &&
      avatarId
    ) {
      try {
        const avatarMap = await loadFreeAvatarMap();

        const selectedSource = avatarMap.get(
          String(avatarId)
        );

        if (selectedSource) {
          return selectedSource;
        }
      } catch (error) {
        console.warn(
          "U9 Friends: Free-avatar catalogue unavailable; trying API avatar URL.",
          error
        );
      }

      /*
       * message-api may already have resolved the SVG.
       * Prefer that value when it is not a default image.
       */
      if (
        apiAvatarURL &&
        !isDefaultAvatarURL(apiAvatarURL)
      ) {
        return apiAvatarURL;
      }

      console.warn(
        "U9 Friends: Selected free avatar could not be resolved.",
        {
          friendId: friend?.id,
          avatarId: avatarId
        }
      );

      return DEFAULT_AVATAR;
    }

    /*
     * Custom avatar uploaded by the user.
     */
    if (type === "custom") {
      if (
        apiAvatarURL &&
        !isDefaultAvatarURL(apiAvatarURL)
      ) {
        return apiAvatarURL;
      }

      console.warn(
        "U9 Friends: Custom avatar URL is missing.",
        friend?.id
      );

      return DEFAULT_AVATAR;
    }

    /*
     * A URL supplied by the API may already contain a
     * resolved selected image, even if the type field
     * is omitted by an older API response.
     */
    if (
      apiAvatarURL &&
      !isDefaultAvatarURL(apiAvatarURL)
    ) {
      return apiAvatarURL;
    }

    return DEFAULT_AVATAR;
  }

  /* =================================================
     RESOLVE SELECTED AVATAR FRAME

     The message-api resolves free/paid frame SVGs into
     Data URLs. The default frame is a local SVG path.
  ================================================= */

  function getAvatarFrameURL(friend) {
    const frameType = String(
      friend?.avatar_frame_type || "default"
    ).trim().toLowerCase();

    const value =
      friend?.avatar_frame_url ||
      friend?.avatarFrameUrl ||
      friend?.avatarFrame ||
      "";

    const url = normalizeImageURL(value);

    if (frameType === "default") {
      return DEFAULT_AVATAR_FRAME;
    }

    if (url) {
      return url;
    }

    /*
     * If a selected frame is unavailable, show the default
     * frame without altering the base avatar image.
     */
    return DEFAULT_AVATAR_FRAME;
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

     Keep avatar_type and avatar_id.
     They are needed to resolve the actual free avatar.
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

          avatar_type:
            profile.avatar_type || "default",

          avatar_id:
            profile.avatar_id || null,

          avatar_url:
            profile.avatar_url || "",

          avatar_frame_type:
            profile.avatar_frame_type || "default",

          avatar_frame_id:
            profile.avatar_frame_id || null,

          avatar_frame_url:
            profile.avatar_frame_url || "",

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

     Base avatar:
       slightly smaller, centered in the frame.

     Frame:
       independent overlay at the full wrapper size.

     overflow:visible prevents the outer frame artwork
     from being cropped by the wrapper.
  ================================================= */

  function renderFriendAvatar(friend) {
    const avatarURL = getAvatarURLForRender(friend);
    const frameURL = getAvatarFrameURL(friend);

    return `
      <div
        class="U9-friend-avatar"
        style="
          position:relative;
          overflow:visible;
          border-radius:0;
          background:transparent;
        "
      >
        <img
          class="U9-friend-avatar-image"
          src="${escapeHTML(avatarURL)}"
          data-fallback-stage="0"
          alt=""
          loading="lazy"
          referrerpolicy="no-referrer"
          draggable="false"
          style="
            position:absolute;
            inset:5px;
            z-index:1;
            display:block;
            width:calc(100% - 10px);
            height:calc(100% - 10px);
            object-fit:cover;
            object-position:center;
            border-radius:50%;
          "
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
            object-position:center;
            border:0;
            pointer-events:none;
          "
        >
      </div>
    `;
  }

  /*
   * renderFriends() resolves the avatar before rendering.
   * This helper preserves the resolved value and makes
   * rendering safe if a friend object is passed directly.
   */
  function getAvatarURLForRender(friend) {
    const value = normalizeImageURL(
      friend?.resolved_avatar_url ||
      friend?.avatar_url
    );

    return value || DEFAULT_AVATAR;
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
             * Return to the Friends page after leaving Chat.
             */
            window.messageChatReturnPage = "friends";

            const avatarURL =
              getAvatarURLForRender(friend);

            const frameURL =
              getAvatarFrameURL(friend);

            window.openMessageChat({
              id: friend.id,

              name:
                friend.username || "User",

              avatar: avatarURL,
              avatar_url: avatarURL,

              avatar_frame_url: frameURL,
              avatarFrameUrl: frameURL,

              avatar_type:
                friend.avatar_type,

              avatar_id:
                friend.avatar_id,

              avatar_frame_type:
                friend.avatar_frame_type,

              avatar_frame_id:
                friend.avatar_frame_id,

              status: "Friend",
              type: "friend"
            });
          }
        );
      });

    /*
     * Observe, Mute and Delete intentionally remain disabled.
     */
  }

  /* =================================================
     IMAGE FALLBACKS

     Avatar:
       selected image -> DEFAULT_AVATAR -> initials

     Frame:
       selected frame -> DEFAULT_AVATAR_FRAME -> hide

     Avatar and frame failures are independent.
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
           FRAME FALLBACK
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

          image.hidden = true;
          return;
        }

        /* -------------------------------------------
           AVATAR FALLBACK
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

        if (
          stage === "0" &&
          image.getAttribute("src") !== DEFAULT_AVATAR
        ) {
          image.dataset.fallbackStage = "1";
          image.src = DEFAULT_AVATAR;
          return;
        }

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

        fallback.setAttribute(
          "aria-label",
          name
        );

        fallback.style.position = "absolute";
        fallback.style.inset = "5px";
        fallback.style.zIndex = "1";
        fallback.style.display = "flex";
        fallback.style.alignItems = "center";
        fallback.style.justifyContent = "center";
        fallback.style.width = "calc(100% - 10px)";
        fallback.style.height = "calc(100% - 10px)";
        fallback.style.borderRadius = "50%";
        fallback.style.boxSizing = "border-box";

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

      /*
       * Resolve each selected avatar.
       *
       * For free avatars, avatar_id is used to obtain
       * the actual SVG from avatar-free. This prevents
       * the API's default placeholder URL from replacing
       * a selected free avatar.
       */
      await Promise.all(
        friends.map(async function (friend) {
          friend.resolved_avatar_url =
            await resolveFriendAvatar(friend);

          friend.avatar_frame_url =
            getAvatarFrameURL(friend);
        })
      );

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

    bindAvatarFallbacks();

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
     INITIALIZE IMAGE FALLBACKS
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
