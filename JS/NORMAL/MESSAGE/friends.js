/* =================================================
   U9 MESSAGE - FRIENDS PAGE
   File: JS/NORMAL/MESSAGE/friends.js

   Features:
   1. Load friends through the Vercel message-api proxy
   2. Keep existing Bearer/cookie session authentication
   3. No duplicate Friends heading
   4. Four SVG action icons
   5. Only Chat opens the chat page
   6. Scrollable friends list (layout controlled by CSS)
   7. Support custom and free avatars
   8. Display selected avatar frames
   9. Independent avatar and frame fallbacks
   10. Route public Supabase Storage images through Vercel
================================================= */

(function () {
  "use strict";

  if (window.__U9FriendsPageInitialized) return;
  window.__U9FriendsPageInitialized = true;

  /* ================= CONFIGURATION ================= */

  const MESSAGE_API_URL = "/api/message-api";
  const FREE_AVATAR_API_URL = "/api/avatar-free";
  const FRIENDS_ROOT_ID = "Message-model-friends-root";
  const ACTION_ICON_URLS = {
    chat: "/SSVG/normal/chat.svg",
    observe: "/SSVG/normal/test1.svg",
    mute: "/SSVG/normal/test2.svg",
    delete: "/SSVG/normal/test3.svg"
  };
  const DEFAULT_AVATAR = "/SSVG/avatar/profile.svg";
  const DEFAULT_AVATAR_FRAME = "/SSVG/avatar/ordinary.svg";

  const SUPABASE_STORAGE_HOSTS = new Map([
    ["tvtakmswbzawaweytimx.supabase.co", "/storage/"],
    ["vjlpowhxmflpkjlukkfy.supabase.co", "/storage-2/"]
  ]);

  /* ================= STATE ================= */

  let friendsInitialized = false;
  let isLoading = false;
  let freeAvatarMapPromise = null;

  /* ================= ROOT / ESCAPING ================= */

  function getRoot() {
    return document.getElementById(FRIENDS_ROOT_ID);
  }

  function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, function (character) {
      return {
        "&": "&amp;", "<": "&lt;", ">": "&gt;",
        '"': "&quot;", "'": "&#39;"
      }[character];
    });
  }

  function getInitials(name) {
    return String(name || "User").trim()
      .split(/\s+/).filter(Boolean).slice(0, 2)
      .map(part => part.charAt(0)).join("").toUpperCase() || "U";
  }

  /* ================= IMAGE URL NORMALIZATION =================
     - Public Storage project A -> /storage/...
     - Public Storage project B -> /storage-2/...
     - Keeps local absolute paths, HTTP(S), and image data URLs
     - Supports raw SVG text returned by avatar APIs
  ============================================================ */

  function normalizeImageURL(value) {
    if (typeof value !== "string") return "";
    const source = value.trim();
    if (!source) return "";

    if (/^<svg\b/i.test(source) || /^<\?xml[\s\S]*?<svg\b/i.test(source)) {
      return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(source);
    }

    if (/^data:image\/[a-z0-9.+-]+(?:;[^,]*)?,/i.test(source)) return source;

    if (source.startsWith("/") && !source.startsWith("//")) return source;

    let parsed;
    try {
      parsed = new URL(source, window.location.origin);
    } catch (_) {
      return "";
    }

    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return "";

    const proxyPrefix = SUPABASE_STORAGE_HOSTS.get(parsed.hostname.toLowerCase());
    const publicStoragePrefix = "/storage/v1/object/public/";

    if (proxyPrefix && parsed.pathname.startsWith(publicStoragePrefix)) {
      const storagePath = parsed.pathname.slice(publicStoragePrefix.length);
      return proxyPrefix + storagePath + parsed.search + parsed.hash;
    }

    return parsed.href;
  }

  function svgToImageSource(source) {
    return normalizeImageURL(source);
  }

  function isDefaultAvatarURL(value) {
    const url = normalizeImageURL(value);
    if (!url) return true;
    return url === DEFAULT_AVATAR ||
      url === "/SSVG/avatar/profile.svg" ||
      url.endsWith("/SSVG/avatar/profile.svg") ||
      url.endsWith("/SSVG/avatar/profile.svg");
  }

  /* ================= FREE AVATAR CATALOGUE ================= */

  async function loadFreeAvatarMap() {
    if (!freeAvatarMapPromise) {
      freeAvatarMapPromise = (async function () {
        const token = getSessionToken();
        const headers = { Accept: "application/json" };
        if (token) headers.Authorization = "Bearer " + token;

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
          throw new Error(result?.error || result?.message ||
            `Could not load free avatars (${response.status}).`);
        }

        const avatars = Array.isArray(result?.avatars) ? result.avatars :
          Array.isArray(result?.data?.avatars) ? result.data.avatars :
          Array.isArray(result?.data) ? result.data : [];
        const map = new Map();

        avatars.forEach(function (avatar) {
          if (!avatar || avatar.id === undefined || avatar.id === null) return;
          const source = svgToImageSource(
            avatar.svg || avatar.image || avatar.image_url || avatar.avatar_url || avatar.url || ""
          );
          if (source) map.set(String(avatar.id), source);
        });
        return map;
      })().catch(function (error) {
        freeAvatarMapPromise = null;
        throw error;
      });
    }
    return freeAvatarMapPromise;
  }

  /* ================= FRIEND AVATAR RESOLUTION ================= */

  function getRawAvatarValue(friend) {
    const avatar = friend?.avatar;
    return friend?.avatar_url || friend?.avatarUrl ||
      (typeof avatar === "string" ? avatar : avatar?.url || avatar?.custom_url) ||
      friend?.profile_image || friend?.photo_url || "";
  }

  async function resolveFriendAvatar(friend) {
    const type = String(friend?.avatar_type || "default").trim().toLowerCase();
    const avatarId = friend?.avatar_id ?? friend?.avatarId ?? null;
    const apiAvatarURL = normalizeImageURL(getRawAvatarValue(friend));

    if (type === "free" && avatarId !== null && avatarId !== "") {
      try {
        const avatarMap = await loadFreeAvatarMap();
        const selected = avatarMap.get(String(avatarId));
        if (selected) return selected;
      } catch (error) {
        console.warn("U9 Friends: Free-avatar catalogue unavailable; trying API avatar URL.", error);
      }

      if (apiAvatarURL && !isDefaultAvatarURL(apiAvatarURL)) return apiAvatarURL;
      console.warn("U9 Friends: Selected free avatar could not be resolved.", {
        friendId: friend?.id, avatarId
      });
      return DEFAULT_AVATAR;
    }

    if (type === "custom") {
      if (apiAvatarURL && !isDefaultAvatarURL(apiAvatarURL)) return apiAvatarURL;
      console.warn("U9 Friends: Custom avatar URL is missing.", friend?.id);
      return DEFAULT_AVATAR;
    }

    if (apiAvatarURL && !isDefaultAvatarURL(apiAvatarURL)) return apiAvatarURL;
    return DEFAULT_AVATAR;
  }

  /* ================= FRAME RESOLUTION ================= */

  function getAvatarFrameURL(friend) {
    const frameType = String(friend?.avatar_frame_type || friend?.avatarFrameType || "default")
      .trim().toLowerCase();

    const frame = friend?.avatar_frame;
    const camelFrame = friend?.avatarFrame;
    const rawValue = friend?.avatar_frame_url || friend?.avatarFrameUrl ||
      (typeof frame === "string" ? frame : frame?.url || frame?.svg || frame?.image) ||
      (typeof camelFrame === "string" ? camelFrame : camelFrame?.url || camelFrame?.svg || camelFrame?.image) ||
      "";
    const url = normalizeImageURL(rawValue);

    if (frameType === "default" || frameType === "") return DEFAULT_AVATAR_FRAME;
    return url || DEFAULT_AVATAR_FRAME;
  }

  function getAvatarURLForRender(friend) {
    return normalizeImageURL(friend?.resolved_avatar_url || friend?.avatar_url) || DEFAULT_AVATAR;
  }

  /* ================= AUTHENTICATION ================= */

  function getSessionToken() {
    const keys = ["u9_token", "u9_access_token", "access_token", "authToken", "token"];
    for (const key of keys) {
      try {
        const value = localStorage.getItem(key);
        if (value && value.trim()) return value.trim();
      } catch (_) {
        console.warn("U9 Friends: Cannot read session storage.");
        return "";
      }
    }
    return "";
  }

  /* ================= MESSAGE API ================= */

  async function callMessageAPI(action, payload = {}) {
    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json"
    };
    const token = getSessionToken();
    if (token) headers.Authorization = "Bearer " + token;

    const response = await fetch(MESSAGE_API_URL, {
      method: "POST",
      headers,
      credentials: "include",
      cache: "no-store",
      body: JSON.stringify({ action, ...payload })
    });

    let result;
    try {
      result = await response.json();
    } catch (_) {
      throw new Error("Invalid response from message server.");
    }

    if (!response.ok || !result || result.success !== true) {
      const error = new Error(result?.error || result?.message ||
        `Request failed (${response.status}).`);
      error.status = response.status;
      throw error;
    }
    return result;
  }

  /* ================= STATUS / EMPTY STATE ================= */

  function renderMessage(message, type = "info") {
    const root = getRoot();
    if (!root) return;
    root.innerHTML = `
      <div class="U9-friends-state U9-friends-state-${escapeHTML(type)}"
           role="${type === "error" ? "alert" : "status"}">
        ${escapeHTML(message)}
      </div>`;
  }

  /* ================= NORMALIZE FRIENDS ================= */

  function normalizeFriends(items) {
    if (!Array.isArray(items)) return [];
    return items.filter(item => Boolean(item?.friend?.id)).map(function (item) {
      const profile = item.friend;
      return {
        id: String(profile.id),
        username: profile.username || "User",
        account: profile.account || "",
        avatar_type: profile.avatar_type || profile.avatarType || "default",
        avatar_id: profile.avatar_id ?? profile.avatarId ?? null,
        avatar_url: profile.avatar_url || profile.avatarUrl || "",
        avatar_frame_type: profile.avatar_frame_type || profile.avatarFrameType || "default",
        avatar_frame_id: profile.avatar_frame_id ?? profile.avatarFrameId ?? null,
        avatar_frame_url: profile.avatar_frame_url || profile.avatarFrameUrl || "",
        avatar_frame: profile.avatar_frame || null,
        avatarFrame: profile.avatarFrame || null,
        friendship_id: item.friendship_id || item.id || "",
        created_at: item.created_at || ""
      };
    });
  }

  /* ================= ACTION BUTTON ================= */

  function renderActionButton(friend, action, label, enabled) {
    const iconURL = ACTION_ICON_URLS[action] || ACTION_ICON_URLS.chat;
    return `
      <button class="U9-friend-action U9-friend-action-${escapeHTML(action)}"
        type="button" data-friend-action="${escapeHTML(action)}"
        data-friend-id="${escapeHTML(friend.id)}"
        aria-label="${escapeHTML(label)}" title="${escapeHTML(label)}"
        ${enabled ? "" : "disabled"}>
        <img src="${escapeHTML(iconURL)}" alt="" aria-hidden="true" draggable="false">
      </button>`;
  }

  /* ================= FRIEND AVATAR HTML ================= */

  function renderFriendAvatar(friend) {
    const avatarURL = getAvatarURLForRender(friend);
    const frameURL = getAvatarFrameURL(friend);
    return `
      <div class="U9-friend-avatar" style="position:relative;overflow:visible;border-radius:0;background:transparent;">
        <img class="U9-friend-avatar-image" src="${escapeHTML(avatarURL)}"
          data-fallback-stage="0" alt="" loading="lazy" referrerpolicy="no-referrer"
          draggable="false" style="position:absolute;inset:5px;z-index:1;display:block;width:calc(100% - 10px);height:calc(100% - 10px);object-fit:cover;object-position:center;border-radius:50%;">
        <img class="U9-friend-avatar-frame-image" src="${escapeHTML(frameURL)}"
          data-fallback-stage="0" alt="" aria-hidden="true" draggable="false"
          style="position:absolute;inset:0;z-index:2;display:block;width:100%;height:100%;object-fit:contain;object-position:center;border:0;pointer-events:none;">
      </div>`;
  }

  /* ================= RENDER FRIEND LIST ================= */

  function renderFriends(friends) {
    const root = getRoot();
    if (!root) return;

    if (!friends.length) {
      root.innerHTML = `
        <div class="U9-friends-empty">
          <div class="U9-friends-empty-icon">♧</div>
          <div class="U9-friends-empty-title">No friends yet</div>
          <div class="U9-friends-empty-description">Your accepted friends will appear here.</div>
        </div>`;
      return;
    }

    root.innerHTML = `
      <div class="U9-friends-page">
        <div class="U9-friends-list">
          ${friends.map(function (friend) {
            const username = friend.username || "User";
            const account = friend.account || "";
            return `
              <article class="U9-friend-card" data-friend-id="${escapeHTML(friend.id)}">
                ${renderFriendAvatar(friend)}
                <div class="U9-friend-info">
                  <div class="U9-friend-name">${escapeHTML(username)}</div>
                  <div class="U9-friend-account">${account ? "@" + escapeHTML(account) : "Friend"}</div>
                </div>
                <div class="U9-friend-actions">
                  ${renderActionButton(friend, "observe", "Observe", true)}
                  ${renderActionButton(friend, "mute", "Mute", true)}
                  ${renderActionButton(friend, "chat", "Chat", true)}
                  ${renderActionButton(friend, "delete", "Delete friend", true)}
                </div>
              </article>`;
          }).join("")}
        </div>
      </div>`;

    bindActionButtons(friends);
    bindAvatarFallbacks();
  }

  /* ================= ACTION EVENTS ================= */

  function bindActionButtons(friends) {
    const root = getRoot();
    if (!root) return;

    root.querySelectorAll('[data-friend-action="chat"]').forEach(function (button) {
      button.addEventListener("click", function () {
        const friend = friends.find(item => String(item.id) === String(button.dataset.friendId));
        if (!friend) return;

        if (typeof window.openMessageChat !== "function") {
          console.error("U9 Friends: window.openMessageChat() is unavailable.");
          return;
        }

        window.messageChatReturnPage = "friends";
        const avatarURL = getAvatarURLForRender(friend);
        const frameURL = getAvatarFrameURL(friend);

        window.openMessageChat({
          id: friend.id,
          name: friend.username || "User",
          avatar: avatarURL,
          avatar_url: avatarURL,
          avatar_frame_url: frameURL,
          avatarFrameUrl: frameURL,
          avatar_type: friend.avatar_type,
          avatar_id: friend.avatar_id,
          avatar_frame_type: friend.avatar_frame_type,
          avatar_frame_id: friend.avatar_frame_id,
          status: "Friend",
          type: "friend"
        });
      });
    });
  }

  /* ================= INDEPENDENT IMAGE FALLBACKS ================= */

  function bindAvatarFallbacks() {
    const root = getRoot();
    if (!root || root.dataset.avatarFallbackBound === "true") return;
    root.dataset.avatarFallbackBound = "true";

    root.addEventListener("error", function (event) {
      const image = event.target;
      if (!(image instanceof HTMLImageElement)) return;

      if (image.classList.contains("U9-friend-avatar-frame-image")) {
        const stage = image.dataset.fallbackStage || "0";
        if (stage === "0" && image.getAttribute("src") !== DEFAULT_AVATAR_FRAME) {
          image.dataset.fallbackStage = "1";
          image.src = DEFAULT_AVATAR_FRAME;
          return;
        }
        image.hidden = true;
        return;
      }

      if (!image.classList.contains("U9-friend-avatar-image")) return;
      const stage = image.dataset.fallbackStage || "0";
      if (stage === "0" && image.getAttribute("src") !== DEFAULT_AVATAR) {
        image.dataset.fallbackStage = "1";
        image.src = DEFAULT_AVATAR;
        return;
      }

      const card = image.closest(".U9-friend-card");
      const name = card?.querySelector(".U9-friend-name")?.textContent || "User";
      const fallback = document.createElement("div");
      fallback.className = "U9-friend-avatar-fallback";
      fallback.textContent = getInitials(name);
      fallback.setAttribute("aria-label", name);
      Object.assign(fallback.style, {
        position: "absolute", inset: "5px", zIndex: "1", display: "flex",
        alignItems: "center", justifyContent: "center", width: "calc(100% - 10px)",
        height: "calc(100% - 10px)", borderRadius: "50%", boxSizing: "border-box"
      });
      image.replaceWith(fallback);
    }, true);
  }

  /* ================= LOAD FRIENDS ================= */

  async function loadFriends() {
    const root = getRoot();
    if (!root || isLoading) return;
    isLoading = true;
    renderMessage("Loading friends...", "loading");

    try {
      const result = await callMessageAPI("list_friends");
      const friends = normalizeFriends(result.friends);

      await Promise.all(friends.map(async function (friend) {
        friend.resolved_avatar_url = await resolveFriendAvatar(friend);
        friend.avatar_frame_url = getAvatarFrameURL(friend);
      }));

      renderFriends(friends);
      console.log("U9 Friends: Friends loaded.", { count: friends.length });
    } catch (error) {
      console.error("U9 Friends: Failed to load friends.", error);
      const message = String(error?.message || "").toLowerCase();
      if (error?.status === 401 || message.includes("authentication required") ||
          message.includes("invalid session") || message.includes("session expired") ||
          message.includes("unauthorized")) {
        renderMessage("Your session may have expired. Please sign in again.", "error");
      } else if (error?.status === 403 && message.includes("origin")) {
        renderMessage("This website is not authorized to access the message service.", "error");
      } else {
        renderMessage("Could not load friends. Please try again.", "error");
      }
    } finally {
      isLoading = false;
    }
  }

  /* ================= INITIALIZATION ================= */

  function initializeFriendsPage() {
    if (!getRoot()) {
      console.warn("U9 Friends: #Message-model-friends-root was not found.");
      return;
    }
    friendsInitialized = true;
    bindAvatarFallbacks();
    loadFriends();
  }

  window.initializeFriendsPage = initializeFriendsPage;
  window.refreshFriendsPage = function () {
    if (isLoading) return;
    if (friendsInitialized) return loadFriends();
    initializeFriendsPage();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindAvatarFallbacks, { once: true });
  } else {
    bindAvatarFallbacks();
  }

  console.log("U9 Friends Page initialized.");
})();
