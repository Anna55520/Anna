
/* =================================================
   U9 MESSAGE CHAT
   File: JS/NORMAL/MESSAGE/chat.js

   Features:
   - One-to-one chat
   - Group chat
   - Customer-service chat
   - Load and send text messages
   - Refresh messages every 4 seconds
   - Auto-resizing multiline chat input
   - Mobile virtual-keyboard viewport adjustment
   - Centered loading and empty-state messages
   - Customer-service read / close support
   - Send image messages in one-to-one chats
   - Stop refreshing after leaving Chat
================================================= */

(function () {
  "use strict";

  if (window.__U9ChatPageInitialized) return;
  window.__U9ChatPageInitialized = true;

  /* =================================================
     CONFIGURATION
  ================================================= */

  const MESSAGE_API_URL = "/api/message-api";
  const GROUP_API_URL = "/api/group-api";
  const CUSTOMER_SERVICE_API_URL =
    "/api/customer-service-api";
  const ME_API_URL = "/api/me";

  const DEFAULT_AVATAR = "/SSVG/avatar/profile.svg";

  const POLL_INTERVAL_MS = 4000;
  const MAX_MESSAGE_LENGTH = 5000;
  const CHAT_INPUT_MAX_HEIGHT = 132;

  /* =================================================
     DOM ELEMENTS
  ================================================= */

  const chatPage = document.getElementById(
    "Message-model-chat-page"
  );

  const chatBackButton = document.getElementById(
    "Message-model-chat-back"
  );

  const chatAvatar = document.getElementById(
    "Message-model-chat-avatar"
  );

  const chatName = document.getElementById(
    "Message-model-chat-name"
  );

  const chatStatus = document.getElementById(
    "Message-model-chat-status"
  );

  const chatMoreButton = document.getElementById(
    "Message-model-chat-more"
  );

  const chatMessages = document.getElementById(
    "Message-model-chat-messages"
  );

  const chatForm = document.getElementById(
    "Message-model-chat-form"
  );

  const chatInput = document.getElementById(
    "Message-model-chat-input"
  );

  const chatSendButton = document.getElementById(
    "Message-model-chat-send"
  );

  const chatAttachmentButton = document.getElementById(
    "U9-message-chat-add-button"
  );

  let chatImageFileInput = null;

  /* =================================================
     STATE
  ================================================= */

  let currentChatUser = null;
  let currentUserId = null;

  let currentUserLookupAttempted = false;
  let currentUserLookupPromise = null;

  let isChatActive = false;
  let isLoadingMessages = false;
  let isSendingMessage = false;

  let pollTimer = null;
  let lastRenderedSignature = null;

  let currentRequestVersion = 0;
  let chatEventsBound = false;
  let viewportEventsBound = false;

  let activeMessageLoadPromise = null;

  // In-memory only: survives navigation within this page, resets on reload.
  const conversationMessageCache = new Map();

  function getConversationCacheKey(type, id) {
    const accountId = currentUserId ? String(currentUserId) : "anonymous";
    return accountId + ":" + String(type || "friend") + ":" + String(id || "");
  }

  function getCachedConversationMessages(type, id) {
    const key = getConversationCacheKey(type, id);
    return conversationMessageCache.has(key)
      ? conversationMessageCache.get(key)
      : null;
  }

  function cacheConversationMessages(type, id, messages) {
    if (!Array.isArray(messages)) return;
    const key = getConversationCacheKey(type, id);
    // Keep a shallow copy so callers cannot accidentally mutate the cache array.
    conversationMessageCache.set(key, messages.slice());
  }

  /* =================================================
     IMAGE URL
  ================================================= */
  
  function normalizeImageURL(value, fallback) {
    if (typeof value !== "string") {
      return fallback;
    }

    const url = value.trim();

    if (!url) return fallback;

    // Route signed Supabase Storage URLs through Vercel.
    try {
      const parsed = new URL(url);

      if (
        parsed.protocol === "https:" &&
        parsed.hostname ===
          "vjlpowhxmflpkjlukkfy.supabase.co" &&
        parsed.pathname.startsWith(
          "/storage/v1/object/sign/"
        )
      ) {
        const storagePath = parsed.pathname.slice(
          "/storage/v1/object/sign/".length
        );

        // Preserve the signed URL query string, including token.
        return (
          "/chat-storage/" +
          storagePath +
          parsed.search
        );
      }
    } catch (error) {
      // Continue with normal URL validation.
    }

    if (/^https?:\/\//i.test(url)) {
      return url;
    }

    if (url.startsWith("/") && !url.startsWith("//")) {
      return url;
    }

    if (
      /^data:image\/[a-z0-9.+-]+(?:;[^,]*)?,/i.test(
        url
      )
    ) {
      return url;
    }

    return fallback;
  }


  /* =================================================
     SESSION TOKEN
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
          "U9 Chat: Cannot read session storage."
        );

        return "";
      }
    }

    return "";
  }

  function getRequestHeaders() {
    const headers = {
      "Content-Type": "application/json"
    };

    const token = getSessionToken();

    if (token) {
      headers.Authorization = "Bearer " + token;
    }

    return headers;
  }

  /* =================================================
     SHARED API RESPONSE HANDLING
  ================================================= */

  async function parseAPIResponse(response, serverName) {
    let result;

    try {
      result = await response.json();
    } catch (error) {
      const invalidResponse = new Error(
        `${serverName} returned an invalid response (${response.status}).`
      );

      invalidResponse.status = response.status;

      throw invalidResponse;
    }

    if (
      !response.ok ||
      !result ||
      result.success !== true
    ) {
      const apiError = new Error(
        result?.error ||
        result?.message ||
        `${serverName} request failed.`
      );

      apiError.status = response.status;

      throw apiError;
    }

    return result;
  }

  /* =================================================
     CALL MESSAGE API
  ================================================= */

  async function callMessageAPI(
    action,
    payload = {}
  ) {
    let response;

    try {
      response = await fetch(MESSAGE_API_URL, {
        method: "POST",
        headers: getRequestHeaders(),
        credentials: "include",
        cache: "no-store",
        body: JSON.stringify({
          action,
          ...payload
        })
      });
    } catch (error) {
      console.error(
        "U9 Chat: Cannot reach message-api.",
        error
      );

      const networkError = new Error(
        "Could not connect to the messaging server. Check the message-api deployment and CORS settings."
      );

      networkError.cause = error;

      throw networkError;
    }

    return parseAPIResponse(
      response,
      "The messaging server"
    );
  }

  /* =================================================
     GROUP SESSION TOKEN
  ================================================= */

  function getGroupSessionToken() {
    for (const key of [
      "u9_token",
      "u9_session",
      "session_token",
      "access_token"
    ]) {
      try {
        const value = localStorage.getItem(key);

        if (value && value.trim()) {
          return value.trim();
        }
      } catch (error) {
        // Try the session cookie below.
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
      // group-api will report authentication errors.
    }

    return "";
  }

  /* =================================================
     CALL GROUP API
  ================================================= */

  async function callGroupAPI(
    action,
    payload = {}
  ) {
    const headers = {
      "Content-Type": "application/json"
    };

    const token = getGroupSessionToken();

    if (token) {
      headers.Authorization = "Bearer " + token;
    }

    let response;

    try {
      response = await fetch(GROUP_API_URL, {
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
      const networkError = new Error(
        "Could not connect to the group messaging server. Check the group-api deployment and CORS settings."
      );

      networkError.cause = error;

      throw networkError;
    }

    return parseAPIResponse(
      response,
      "The group server"
    );
  }

  /* =================================================
     CALL CUSTOMER SERVICE API
  ================================================= */

  async function callCustomerServiceAPI(
    action,
    payload = {}
  ) {
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
        CUSTOMER_SERVICE_API_URL,
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
        "Could not connect to customer service. Check the customer-service-api deployment and CORS settings."
      );

      networkError.cause = error;

      throw networkError;
    }

    return parseAPIResponse(
      response,
      "The customer service server"
    );
  }

  /* =================================================
     CUSTOMER SERVICE CONVERSATION
  ================================================= */

  function getCustomerServiceConversationId() {
    return String(
      currentChatUser?.conversationId ||
      currentChatUser?.conversation_id ||
      currentChatUser?.id ||
      ""
    );
  }

  function updateCustomerServiceComposer(
    statusOverride
  ) {
    if (
      currentChatUser?.type !== "customer_service"
    ) {
      if (chatInput) {
        chatInput.disabled = false;

        if (
          /^(This conversation is closed|Message customer service\.\.\.|Reply to customer\.\.\.)$/.test(
            chatInput.placeholder || ""
          )
        ) {
          chatInput.placeholder = "Type a message...";
        }
      }

      if (chatMoreButton) {
        chatMoreButton.disabled = false;

        chatMoreButton.setAttribute(
          "aria-label",
          "More chat options"
        );

        chatMoreButton.removeAttribute("title");
      }

      if (chatSendButton && !isSendingMessage) {
        chatSendButton.disabled = false;
      }

      return;
    }

    if (
      !currentChatUser.metadata ||
      typeof currentChatUser.metadata !== "object"
    ) {
      currentChatUser.metadata = {};
    }

    const status = String(
      statusOverride ||
      currentChatUser.metadata.conversation_status ||
      "open"
    ).toLowerCase();

    currentChatUser.metadata.conversation_status =
      status;

    const closed = status === "closed";

    if (chatInput) {
      chatInput.disabled = closed;

      chatInput.placeholder = closed
        ? "This conversation is closed"
        : (
            currentChatUser.metadata.service_side ===
            "agent"
              ? "Reply to customer..."
              : "Message customer service..."
          );

      resizeChatInput();
    }

    if (chatSendButton) {
      chatSendButton.disabled =
        closed || isSendingMessage;
    }

    if (chatMoreButton) {
      chatMoreButton.setAttribute(
        "aria-label",
        closed
          ? "Conversation closed"
          : "Close customer service conversation"
      );

      chatMoreButton.title = closed
        ? "Conversation closed"
        : "Close conversation";

      chatMoreButton.disabled = closed;
    }

    if (chatStatus) {
      chatStatus.textContent = closed
        ? "Closed · view only"
        : (
            status === "assigned"
              ? "Support agent connected"
              : "Waiting for support agent"
          );
    }
  }

  /* =================================================
     USER ID: READ EXISTING USER STATE
  ================================================= */

  function readCurrentUserId() {
    const userObjects = [];

    try {
      if (
        window.U9User &&
        typeof window.U9User.get === "function"
      ) {
        userObjects.push(window.U9User.get());
      }
    } catch (error) {
      console.warn(
        "U9 Chat: Could not read U9User.",
        error
      );
    }

    userObjects.push(
      window.currentUser,
      window.currentUserData,
      window.U9_CURRENT_USER
    );

    if (window.currentUserUUID) {
      return String(window.currentUserUUID);
    }

    if (window.currentUserId) {
      return String(window.currentUserId);
    }

    for (const user of userObjects) {
      if (
        user &&
        typeof user === "object" &&
        user.id
      ) {
        return String(user.id);
      }
    }

    try {
      const keys = [
        "u9_user_id",
        "currentUserUUID",
        "currentUserId"
      ];

      for (const key of keys) {
        const value = localStorage.getItem(key);

        if (value && value.trim()) {
          return value.trim();
        }
      }

      const jsonKeys = [
        "u9_user",
        "currentUser"
      ];

      for (const key of jsonKeys) {
        const value = localStorage.getItem(key);

        if (!value) continue;

        try {
          const parsed = JSON.parse(value);

          const id =
            parsed?.id ||
            parsed?.uuid ||
            parsed?.user?.id ||
            parsed?.user?.uuid;

          if (id) {
            return String(id);
          }
        } catch (error) {
          // Ignore non-JSON storage values.
        }
      }
    } catch (error) {
      console.warn(
        "U9 Chat: Could not read cached user ID.",
        error
      );
    }

    return null;
  }

  /* =================================================
     USER ID: FALL BACK TO /ME
  ================================================= */

  async function resolveCurrentUserId() {
    const cachedId = readCurrentUserId();

    if (cachedId) {
      currentUserId = cachedId;

      return currentUserId;
    }

    if (currentUserId) {
      return currentUserId;
    }

    if (currentUserLookupPromise) {
      return currentUserLookupPromise;
    }

    if (currentUserLookupAttempted) {
      return null;
    }

    currentUserLookupAttempted = true;

    currentUserLookupPromise = (async function () {
      try {
        const response = await fetch(ME_API_URL, {
          method: "GET",
          headers: getRequestHeaders(),
          credentials: "include",
          cache: "no-store"
        });

        const result = await response.json().catch(
          function () {
            return {};
          }
        );

        if (!response.ok) {
          console.warn(
            "U9 Chat: /me user lookup failed.",
            response.status,
            result?.message
          );

          return null;
        }

        const id =
          result?.user?.id ||
          result?.user?.uuid ||
          result?.id ||
          result?.uuid ||
          null;

        if (id) {
          currentUserId = String(id);
        }

        return currentUserId;
      } catch (error) {
        console.warn(
          "U9 Chat: Could not resolve current user ID.",
          error
        );

        return null;
      } finally {
        currentUserLookupPromise = null;
      }
    })();

    return currentUserLookupPromise;
  }

  /* =================================================
     CHAT HEADER
  ================================================= */

  function updateChatHeader(user) {
    if (chatName) {
      chatName.textContent =
        user?.name ||
        user?.username ||
        user?.title ||
        "Chat";
    }

    if (chatStatus) {
      chatStatus.textContent =
        user?.status ||
        (
          user?.type === "group"
            ? "Group"
            : (
                user?.type === "customer_service"
                  ? "Customer service"
                  : "Friend"
              )
        );
    }

    if (chatAvatar) {
      chatAvatar.onerror = null;

      chatAvatar.dataset.fallbackStage = "0";

      chatAvatar.src = normalizeImageURL(
        user?.avatar_url ||
        user?.avatar ||
        user?.avatarUrl ||
        user?.image_url,
        DEFAULT_AVATAR
      );

      chatAvatar.onerror = function () {
        if (
          chatAvatar.dataset.fallbackStage === "0"
        ) {
          chatAvatar.dataset.fallbackStage = "1";

          if (
            chatAvatar.getAttribute("src") ===
            DEFAULT_AVATAR
          ) {
            chatAvatar.onerror = null;

            return;
          }

          chatAvatar.src = DEFAULT_AVATAR;

          return;
        }

        chatAvatar.onerror = null;
      };
    }
  }

  /* =================================================
     AUTO-RESIZING TEXTAREA
  ================================================= */

  function resizeChatInput() {
    if (!chatInput) return;

    if (
      chatInput.tagName.toLowerCase() !==
      "textarea"
    ) {
      return;
    }

    chatInput.style.height = "auto";

    const computedStyle = window.getComputedStyle(
      chatInput
    );

    const borderTop =
      parseFloat(computedStyle.borderTopWidth) || 0;

    const borderBottom =
      parseFloat(computedStyle.borderBottomWidth) || 0;

    const maxHeight = CHAT_INPUT_MAX_HEIGHT;

    const nextHeight = Math.min(
      chatInput.scrollHeight +
        borderTop +
        borderBottom,
      maxHeight
    );

    chatInput.style.height =
      nextHeight + "px";

    chatInput.style.overflowY =
      chatInput.scrollHeight > maxHeight
        ? "auto"
        : "hidden";
  }

  /* =================================================
     MOBILE KEYBOARD / VIEWPORT
  ================================================= */

  function updateChatViewport() {
    if (!chatPage) return;

    const viewport = window.visualViewport;

    if (
      !viewport ||
      !chatPage.classList.contains("is-active")
    ) {
      return;
    }

    const rect = chatPage.getBoundingClientRect();

    const visibleBottom =
      viewport.offsetTop + viewport.height;

    const availableHeight = Math.max(
      0,
      visibleBottom - Math.max(0, rect.top)
    );

    if (availableHeight > 0) {
      chatPage.style.setProperty(
        "--u9-chat-viewport-height",
        availableHeight + "px"
      );
    }
  }

  function bindChatViewportEvents() {
    if (viewportEventsBound) return;

    viewportEventsBound = true;

    if (window.visualViewport) {
      window.visualViewport.addEventListener(
        "resize",
        updateChatViewport
      );

      window.visualViewport.addEventListener(
        "scroll",
        updateChatViewport
      );
    }

    window.addEventListener(
      "resize",
      updateChatViewport
    );

    window.addEventListener(
      "orientationchange",
      updateChatViewport
    );

    if (chatInput) {
      chatInput.addEventListener(
        "focus",
        function () {
          requestAnimationFrame(
            updateChatViewport
          );

          setTimeout(
            updateChatViewport,
            100
          );

          setTimeout(
            updateChatViewport,
            300
          );
        }
      );

      chatInput.addEventListener(
        "blur",
        function () {
          setTimeout(
            updateChatViewport,
            100
          );
        }
      );
    }
  }

  /* =================================================
     STATUS MESSAGE
  ================================================= */

  function createNotice(
    message,
    type = "info"
  ) {
    const notice = document.createElement("div");

    notice.className =
      "U9-chat-system-message " +
      "U9-chat-system-message-" +
      type;

    notice.textContent = message;

    notice.setAttribute("role", "status");

    return notice;
  }

  function showChatNotice(
    message,
    type = "info"
  ) {
    if (!chatMessages) return;

    chatMessages.innerHTML = "";

    chatMessages.appendChild(
      createNotice(message, type)
    );
  }

  function appendChatNotice(
    message,
    type = "error"
  ) {
    if (!chatMessages) return;

    const existing = chatMessages.querySelector(
      ".U9-chat-temporary-notice"
    );

    if (existing) {
      existing.remove();
    }

    const notice = createNotice(
      message,
      type
    );

    notice.classList.add(
      "U9-chat-temporary-notice"
    );

    chatMessages.appendChild(notice);
  }

  function removeTemporaryNotice() {
    if (!chatMessages) return;

    chatMessages
      .querySelectorAll(
        ".U9-chat-temporary-notice"
      )
      .forEach(function (notice) {
        notice.remove();
      });
  }

  /* =================================================
     TIME FORMAT
  ================================================= */

  function formatMessageTime(value) {
    if (!value) return "";

    const date = new Date(value);

    if (!Number.isFinite(date.getTime())) {
      return "";
    }

    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  /* =================================================
     MESSAGE BUBBLE
  ================================================= */

  function createMessageElement(message) {
    const isOwnMessage = Boolean(
      currentUserId &&
      String(message.sender_id) ===
        String(currentUserId)
    );

    const row = document.createElement("div");

    row.className =
      "U9-chat-message-row " +
      (
        isOwnMessage
          ? "U9-chat-message-own"
          : "U9-chat-message-other"
      );

    const bubble = document.createElement("div");

    bubble.className =
      "U9-chat-message-bubble " +
      (
        isOwnMessage
          ? "U9-chat-bubble-own"
          : "U9-chat-bubble-other"
      );

    if (message.deleted_at) {
      const deleted = document.createElement("div");

      deleted.textContent =
        "This message was deleted.";

      deleted.className = "U9-chat-message-deleted";

      bubble.appendChild(deleted);
    } else if (
      message.message_type === "image"
    ) {
      const mediaURL = normalizeImageURL(
        message.media_url || message.media_path,
        ""
      );

      if (mediaURL) {
        const imageWrap = document.createElement("div");
        imageWrap.className = "U9-chat-image-wrap is-loading";

        const loader = document.createElement("img");
        loader.className = "U9-chat-image-loader";
        loader.src = "/SSVG/logo/loading.svg";
        loader.alt = "Loading image";
        loader.setAttribute("aria-hidden", "true");

        const image = document.createElement("img");
        image.className = "U9-chat-message-image";
        image.alt = "Image message";
        // Do not lazy-load chat images while CSS hides them behind the loader.
        // Some browsers defer hidden lazy images indefinitely, leaving the spinner visible.
        image.loading = "eager";
        image.decoding = "async";

        const errorState = document.createElement("div");
        errorState.className = "U9-chat-image-error";
        errorState.textContent = "Image could not be loaded.";
        errorState.hidden = true;

        const retryButton = document.createElement("button");
        retryButton.type = "button";
        retryButton.className = "U9-chat-image-retry";
        retryButton.textContent = "Retry";
        retryButton.hidden = true;

        function showImageError() {
          imageWrap.classList.remove("is-loading", "is-loaded");
          imageWrap.classList.add("has-error");
          loader.hidden = true;
          image.hidden = true;
          errorState.hidden = false;
          retryButton.hidden = false;
        }

        function showLoadedImage() {
          imageWrap.classList.remove("is-loading", "has-error");
          imageWrap.classList.add("is-loaded");
          loader.hidden = true;
          image.hidden = false;
          errorState.hidden = true;
          retryButton.hidden = true;
        }

        image.addEventListener("load", showLoadedImage);
        image.addEventListener("error", showImageError);
        retryButton.addEventListener("click", function () {
          imageWrap.classList.remove("has-error", "is-loaded");
          imageWrap.classList.add("is-loading");
          loader.hidden = false;
          errorState.hidden = true;
          retryButton.hidden = true;
          image.hidden = true;
          // Reassigning the same URL lets the browser retry its request.
          image.src = mediaURL;
        });

        imageWrap.append(loader, image, errorState, retryButton);
        bubble.appendChild(imageWrap);
        image.src = mediaURL;

        // Cached images can complete before the load handler is observed.
        if (image.complete && image.naturalWidth > 0) {
          showLoadedImage();
        }
      } else {
        const imageLabel =
          document.createElement("div");

        imageLabel.textContent = "Image message";

        bubble.appendChild(imageLabel);
      }

      if (
        message.content &&
        message.content !== "[image]"
      ) {
        const caption =
          document.createElement("div");

        caption.className = "U9-chat-message-caption";
        caption.textContent = message.content;

        bubble.appendChild(caption);
      }
    } else {
      const text = document.createElement("div");

      text.className = "U9-chat-message-text";

      text.textContent = message.content || "";

      bubble.appendChild(text);
    }

    const time = document.createElement("div");

    time.className = "U9-chat-message-time";

    time.textContent = formatMessageTime(
      message.created_at
    );

    bubble.appendChild(time);

    if (
      currentChatUser?.type === "group" &&
      !isOwnMessage
    ) {
      const content =
        document.createElement("div");

      content.className =
        "U9-chat-message-content";

      const sender =
        document.createElement("div");

      sender.className =
        "U9-chat-message-sender";

      sender.textContent = String(
        message.sender_username ||
        message.sender_name ||
        "Group member"
      );

      content.appendChild(sender);
      content.appendChild(bubble);

      row.appendChild(content);
    } else {
      row.appendChild(bubble);
    }

    return row;
  }

  /* =================================================
     RENDER MESSAGES
  ================================================= */

  function getMessagesSignature(messages) {
    return messages.map(function (message) {
      return [
        message.id || "",
        message.sender_id || "",
        message.sender_type || "",
        message.message_type || "text",
        message.content || "",
        message.media_path || "",
        message.created_at || "",
        message.edited_at || "",
        message.deleted_at || "",
        message.read_at || ""
      ].join(":");
    }).join("|");
  }

  function renderMessages(
    messages,
    force = false
  ) {
    if (!chatMessages) return;

    const nextMessages = Array.isArray(messages)
      ? messages
      : [];

    const signature = getMessagesSignature(
      nextMessages
    );

    if (
      !force &&
      signature === lastRenderedSignature
    ) {
      removeTemporaryNotice();

      return;
    }

    const wasNearBottom =
      chatMessages.scrollHeight -
      chatMessages.scrollTop -
      chatMessages.clientHeight < 100;

    const oldScrollTop = chatMessages.scrollTop;

    chatMessages.innerHTML = "";

    const list = document.createElement("div");

    list.className = "U9-chat-message-list";

    if (nextMessages.length === 0) {
      const empty = document.createElement("div");

      empty.className = "U9-chat-empty";

      empty.textContent =
        "No messages yet. Say hello!";

      list.appendChild(empty);
    } else {
      nextMessages.forEach(function (message) {
        list.appendChild(
          createMessageElement(message)
        );
      });
    }

    chatMessages.appendChild(list);

    lastRenderedSignature = signature;

    if (wasNearBottom) {
      chatMessages.scrollTop =
        chatMessages.scrollHeight;
    } else {
      chatMessages.scrollTop = oldScrollTop;
    }
  }

  /* =================================================
     API ERROR TEXT
  ================================================= */

  function getReadableError(error) {
    const message = String(
      error?.message || ""
    );

    if (
      error?.status === 401 ||
      /authentication required|invalid session|session expired|unauthorized/i.test(
        message
      )
    ) {
      return "Your login session has expired. Please sign in again.";
    }

    if (
      error?.status === 403 &&
      /friend/i.test(message)
    ) {
      return "You must be friends before chatting.";
    }

    if (
      error?.status === 403 &&
      /origin/i.test(message)
    ) {
      if (
        currentChatUser?.type === "group"
      ) {
        return "This website is not authorized by group-api. Check the group-api CORS origin list.";
      }

      if (
        currentChatUser?.type ===
        "customer_service"
      ) {
        return "This website is not authorized by customer-service-api. Check its ALLOWED_ORIGINS setting.";
      }

      return "This website is not authorized by message-api. Check the message-api CORS origin list.";
    }

    return message ||
      "Could not load messages. Please try again.";
  }

  /* =================================================
     LOAD CHAT MESSAGES
  ================================================= */

  async function loadChatMessages(
    options = {}
  ) {
    const silent = options.silent === true;

    if (
      !isChatActive ||
      !currentChatUser?.id ||
      !chatMessages
    ) {
      return [];
    }

    /*
     * Prevent overlapping message-list requests.
     * The polling scheduler will try again afterwards.
     */
    if (isLoadingMessages) {
      return activeMessageLoadPromise || [];
    }

    isLoadingMessages = true;

    const requestVersion = currentRequestVersion;
    const targetId = String(currentChatUser.id);

    const targetType = String(
      currentChatUser.type || "friend"
    );

    const requestPromise = (async function () {
      try {
        await resolveCurrentUserId();

        let result;

        if (targetType === "group") {
          result = await callGroupAPI(
            "list_group_messages",
            {
              group_id: String(
                currentChatUser.group_id ||
                targetId
              ),
              limit: 100
            }
          );
        } else if (
          targetType === "customer_service"
        ) {
          result = await callCustomerServiceAPI(
            "list_messages",
            {
              conversation_id:
                getCustomerServiceConversationId(),
              limit: 100
            }
          );
        } else {
          result = await callMessageAPI(
            "list_messages",
            {
              other_user_id: targetId,
              limit: 100
            }
          );
        }

        /*
         * Discard responses belonging to a previous chat.
         */
        if (
          !isChatActive ||
          requestVersion !== currentRequestVersion ||
          String(currentChatUser?.id) !== targetId ||
          String(
            currentChatUser?.type || "friend"
          ) !== targetType
        ) {
          return [];
        }

        const messages = Array.isArray(
          result.messages
        )
          ? result.messages
          : [];

        cacheConversationMessages(targetType, targetId, messages);
        renderMessages(messages);

        // A group is marked read only after its latest messages were fetched
        // successfully and rendered into the currently open chat.
        if (targetType === "group") {
          try {
            const lastSeenGroupMessage = messages.length ? messages[messages.length - 1] : null;
            if (lastSeenGroupMessage && lastSeenGroupMessage.id) {
              await callGroupAPI("mark_group_messages_read", {
                group_id: String(currentChatUser.group_id || targetId),
                last_seen_message_id: String(lastSeenGroupMessage.id)
              });
            }
            if (typeof window.refreshMessageUnreadIndicators === "function") {
              await window.refreshMessageUnreadIndicators();
            }
          } catch (readError) {
            console.warn("U9 Chat: Could not update group-message read status.", readError);
          }
        }

        // Only mark one-to-one friend messages as read after this
        // conversation has loaded and rendered successfully. Image and
        // text messages use the same read_at state.
        const hasUnreadFriendMessages =
          targetType === "friend" &&
          messages.some(function (message) {
            return (
              String(message.sender_id) === targetId &&
              !message.read_at &&
              !message.deleted_at
            );
          });

        if (hasUnreadFriendMessages) {
          try {
            await callMessageAPI("mark_messages_read", {
              other_user_id: targetId
            });
            if (typeof window.refreshMessageUnreadIndicators === "function") {
              await window.refreshMessageUnreadIndicators();
            }
          } catch (readError) {
            console.warn(
              "U9 Chat: Could not update friend-message read status.",
              readError
            );
          }
        }

        if (
          targetType === "customer_service"
        ) {
          const conversationStatus =
            result?.conversation?.status ||
            currentChatUser.metadata
              ?.conversation_status ||
            "open";

          updateCustomerServiceComposer(
            conversationStatus
          );

          const side =
            currentChatUser.metadata
              ?.service_side === "agent"
              ? "agent"
              : "customer";

          const incomingType =
            side === "agent"
              ? "customer"
              : "agent";

          const hasUnreadIncoming =
            messages.some(function (message) {
              return (
                message.sender_type === incomingType &&
                !message.read_at &&
                !message.deleted_at
              );
            });

          if (hasUnreadIncoming) {
            try {
              await callCustomerServiceAPI(
                "mark_read",
                {
                  conversation_id:
                    getCustomerServiceConversationId()
                }
              );
              // Refresh customer-service row and global red dots only after the
              // API confirms the incoming messages were marked as read.
              window.dispatchEvent(new CustomEvent("u9:customer-service:conversation-updated", {
                detail: { conversation_id: getCustomerServiceConversationId(), read: true }
              }));
            } catch (readError) {
              console.warn(
                "U9 Chat: Could not update customer-service read status.",
                readError
              );
            }
          }
        } else if (chatStatus) {
          chatStatus.textContent =
            currentChatUser.status ||
            (
              targetType === "group"
                ? "Group"
                : "Friend"
            );
        }

        return messages;
      } catch (error) {
        console.error(
          "U9 Chat: Failed to load messages.",
          error
        );

        if (
          !isChatActive ||
          requestVersion !== currentRequestVersion
        ) {
          return [];
        }

        const errorMessage =
          getReadableError(error);

        if (lastRenderedSignature !== null) {
          // Keep cached/previous messages visible if a background refresh fails.
          // appendChatNotice replaces the prior temporary notice to avoid duplicates.
          appendChatNotice(
            errorMessage,
            "error"
          );
        } else {
          showChatNotice(
            errorMessage,
            "error"
          );
        }

        return [];
      } finally {
        if (
          requestVersion === currentRequestVersion
        ) {
          isLoadingMessages = false;
        }
      }
    })();

    activeMessageLoadPromise = requestPromise;

    try {
      return await requestPromise;
    } finally {
      if (
        activeMessageLoadPromise === requestPromise
      ) {
        activeMessageLoadPromise = null;
      }

      /*
       * A previous conversation may have finished after
       * the user switched to another conversation.
       */
      if (
        requestVersion !== currentRequestVersion
      ) {
        isLoadingMessages = false;
      }
    }
  }

  /* =================================================
     SEND CHAT MESSAGE
  ================================================= */

  async function sendChatMessage(event) {
    if (event) {
      event.preventDefault();
    }

    if (
      !isChatActive ||
      !currentChatUser?.id ||
      !chatInput
    ) {
      return;
    }

    if (isSendingMessage) return;

    const content = chatInput.value.trim();

    if (!content) {
      chatInput.focus();

      return;
    }

    if (
      content.length > MAX_MESSAGE_LENGTH
    ) {
      appendChatNotice(
        `Messages cannot exceed ${MAX_MESSAGE_LENGTH} characters.`,
        "error"
      );

      return;
    }

    if (
      currentChatUser.type ===
        "customer_service" &&
      String(
        currentChatUser.metadata
          ?.conversation_status || "open"
      ).toLowerCase() === "closed"
    ) {
      appendChatNotice(
        "This conversation is closed.",
        "error"
      );

      return;
    }

    const targetId = String(
      currentChatUser.id
    );

    const targetType = String(
      currentChatUser.type || "friend"
    );

    const requestVersion = currentRequestVersion;

    isSendingMessage = true;

    if (chatSendButton) {
      chatSendButton.disabled = true;

      chatSendButton.setAttribute(
        "aria-busy",
        "true"
      );
    }

    try {
      if (
        targetType === "customer_service"
      ) {
        await callCustomerServiceAPI(
          "send_message",
          {
            conversation_id:
              getCustomerServiceConversationId(),
            message_type: "text",
            content
          }
        );
      } else if (
        targetType === "group"
      ) {
        await callGroupAPI(
          "send_group_message",
          {
            group_id: String(
              currentChatUser.group_id ||
              targetId
            ),
            message_type: "text",
            content
          }
        );
      } else {
        await callMessageAPI(
          "send_message",
          {
            receiver_id: targetId,
            message_type: "text",
            content
          }
        );
      }

      /*
       * Do not clear or refresh another conversation
       * if the user switched chats during the request.
       */
      if (
        !isChatActive ||
        requestVersion !== currentRequestVersion ||
        String(currentChatUser?.id) !== targetId ||
        String(
          currentChatUser?.type || "friend"
        ) !== targetType
      ) {
        return;
      }

      /*
       * Clear only after the API confirms success.
       */
      chatInput.value = "";

      resizeChatInput();

      await loadChatMessages();

      if (
        targetType === "customer_service"
      ) {
        window.dispatchEvent(
          new CustomEvent(
            "u9:customer-service:conversation-updated",
            {
              detail: {
                conversation_id:
                  currentChatUser?.conversationId ||
                  currentChatUser?.conversation_id ||
                  currentChatUser?.id ||
                  ""
              }
            }
          )
        );
      }

      if (
        chatInput &&
        !chatInput.disabled &&
        isChatActive &&
        requestVersion === currentRequestVersion
      ) {
        const isTouchDevice =
          window.matchMedia(
            "(pointer: coarse)"
          ).matches;

        if (!isTouchDevice) {
          chatInput.focus({
            preventScroll: true
          });
        }

        requestAnimationFrame(
          updateChatViewport
        );
      }
    } catch (error) {
      console.error(
        "U9 Chat: Failed to send message.",
        error
      );

      if (
        requestVersion === currentRequestVersion
      ) {
        appendChatNotice(
          getReadableError(error),
          "error"
        );
      }
    } finally {
      isSendingMessage = false;

      if (chatSendButton) {
        chatSendButton.removeAttribute(
          "aria-busy"
        );

        if (
          currentChatUser?.type ===
          "customer_service"
        ) {
          updateCustomerServiceComposer();
        } else {
          chatSendButton.disabled = false;
        }
      }
    }
  }

  /* =================================================
     POLLING
  ================================================= */

  function stopMessagePolling() {
    if (pollTimer !== null) {
      clearTimeout(pollTimer);

      pollTimer = null;
    }
  }

  function scheduleMessagePolling() {
    stopMessagePolling();

    if (
      !isChatActive ||
      !currentChatUser?.id
    ) {
      return;
    }

    const scheduledVersion =
      currentRequestVersion;

    pollTimer = setTimeout(
      async function () {
        pollTimer = null;

        if (
          !isChatActive ||
          scheduledVersion !== currentRequestVersion
        ) {
          return;
        }

        try {
          await loadChatMessages({
            silent: true
          });
        } finally {
          if (
            isChatActive &&
            scheduledVersion === currentRequestVersion
          ) {
            scheduleMessagePolling();
          }
        }
      },
      POLL_INTERVAL_MS
    );
  }

  /* =================================================
     BACK BUTTON
  ================================================= */

  function handleChatBack() {
    if (
      typeof window.closeMessageChat ===
      "function"
    ) {
      window.closeMessageChat();

      return;
    }

    closeChatPage();

    if (
      typeof window.showMessageHome ===
      "function"
    ) {
      window.showMessageHome();
    }
  }

  /* =================================================
     CLOSE CUSTOMER SERVICE CONVERSATION
  ================================================= */

  async function handleChatMoreClick() {
    if (
      currentChatUser?.type !==
      "customer_service"
    ) {
      /*
       * Friend/group More button is not implemented.
       * The attachment button remains separate.
       */
      console.info(
        "U9 Chat: More options are not implemented yet."
      );

      return;
    }

    const status = String(
      currentChatUser.metadata
        ?.conversation_status || "open"
    ).toLowerCase();

    if (status === "closed") return;

    const requestVersion =
      currentRequestVersion;

    const conversationId =
      getCustomerServiceConversationId();

    const confirmText =
      currentChatUser.metadata?.service_side ===
      "agent"
        ? "Close this customer support conversation? The customer will no longer be able to reply in this conversation."
        : "Close this customer support conversation? You can start a new one later.";

    if (!window.confirm(confirmText)) {
      return;
    }

    if (chatMoreButton) {
      chatMoreButton.disabled = true;
    }

    try {
      const result =
        await callCustomerServiceAPI(
          "close_conversation",
          {
            conversation_id: conversationId
          }
        );

      if (
        requestVersion !== currentRequestVersion ||
        currentChatUser?.type !==
          "customer_service" ||
        getCustomerServiceConversationId() !==
          conversationId
      ) {
        return;
      }

      const nextStatus =
        result?.conversation?.status ||
        "closed";

      if (
        !currentChatUser.metadata ||
        typeof currentChatUser.metadata !==
          "object"
      ) {
        currentChatUser.metadata = {};
      }

      currentChatUser.metadata
        .conversation_status = nextStatus;

      updateCustomerServiceComposer(
        nextStatus
      );

      appendChatNotice(
        "This customer service conversation is now closed.",
        "info"
      );

      window.dispatchEvent(
        new CustomEvent(
          "u9:customer-service:conversation-updated",
          {
            detail: {
              conversation_id: conversationId
            }
          }
        )
      );
    } catch (error) {
      console.error(
        "U9 Chat: Could not close customer service conversation.",
        error
      );

      if (
        requestVersion === currentRequestVersion
      ) {
        appendChatNotice(
          getReadableError(error),
          "error"
        );

        if (chatMoreButton) {
          chatMoreButton.disabled = false;
        }
      }
    }
  }

  /* =================================================
     ONE-TO-ONE IMAGE MESSAGES
  ================================================= */

  function bindImageAttachment() {
    if (!chatAttachmentButton || chatImageFileInput) return;

    chatImageFileInput = document.createElement("input");
    chatImageFileInput.type = "file";
    chatImageFileInput.accept = "image/*";
    chatImageFileInput.hidden = true;
    chatImageFileInput.setAttribute("aria-label", "Choose an image");
    document.body.appendChild(chatImageFileInput);

    chatAttachmentButton.addEventListener("click", function () {
      if (isSendingMessage) return;

      if (!currentChatUser || !["friend", "group"].includes(String(currentChatUser.type || "friend"))) {
        appendChatNotice("Image sending is not available in this conversation.", "error");
        return;
      }

      chatImageFileInput.value = "";
      chatImageFileInput.click();
    });

    chatImageFileInput.addEventListener("change", async function () {
      const file = chatImageFileInput.files && chatImageFileInput.files[0];
      if (!file) return;

      if (!file.type || !file.type.startsWith("image/")) {
        appendChatNotice("Please choose an image file.", "error");
        return;
      }

      if (file.size > 12 * 1024 * 1024) {
        appendChatNotice("The image must be smaller than 12 MB.", "error");
        return;
      }

      try {
        await sendImageMessage(file);
      } catch (error) {
        console.error("U9 Chat: Could not send image.", error);
        appendChatNotice(getReadableError(error), "error");
      }
    });
  }

  async function compressImageToBase64(file) {
    const sourceURL = await new Promise(function (resolve, reject) {
      const reader = new FileReader();
      reader.onload = function () { resolve(String(reader.result || "")); };
      reader.onerror = function () { reject(new Error("Could not read the selected image.")); };
      reader.readAsDataURL(file);
    });

    const image = await new Promise(function (resolve, reject) {
      const img = new Image();
      img.onload = function () { resolve(img); };
      img.onerror = function () { reject(new Error("This image could not be opened.")); };
      img.src = sourceURL;
    });

    const maxSide = 1600;
    const scale = Math.min(1, maxSide / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));

    const context = canvas.getContext("2d");
    if (!context) throw new Error("Image processing is not supported by this browser.");

    // Flatten transparent pixels onto white before converting to JPEG.
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    let quality = 0.82;
    let dataURL = canvas.toDataURL("image/jpeg", quality);
    while (dataURL.length > 2_300_000 && quality > 0.48) {
      quality -= 0.08;
      dataURL = canvas.toDataURL("image/jpeg", quality);
    }

    const base64 = dataURL.split(",")[1] || "";
    if (!base64 || base64.length > 2_300_000) {
      throw new Error("The compressed image is too large. Please choose a smaller image.");
    }

    return base64;
  }

  async function sendImageMessage(file) {
    if (!currentChatUser || !["friend", "group"].includes(String(currentChatUser.type || "friend"))) return;

    const targetId = String(currentChatUser.id);
    const requestVersion = currentRequestVersion;
    const targetType = String(currentChatUser.type || "friend");

    isSendingMessage = true;
    if (chatSendButton) chatSendButton.disabled = true;
    if (chatAttachmentButton) chatAttachmentButton.disabled = true;

    appendChatNotice("Preparing image…", "info");

    try {
      await resolveCurrentUserId();
      const fileBase64 = await compressImageToBase64(file);

      if (
        !isChatActive ||
        requestVersion !== currentRequestVersion ||
        String(currentChatUser?.id) !== targetId ||
        String(currentChatUser?.type || "friend") !== targetType
      ) {
        return;
      }

      appendChatNotice("Uploading image…", "info");
      let uploadResult;
      if (targetType === "group") {
        const groupId = String(currentChatUser.group_id || targetId);
        uploadResult = await callGroupAPI("upload_group_image", {
          group_id: groupId,
          content_type: "image/jpeg",
          file_base64: fileBase64
        });
        if (!uploadResult.media_path) {
          throw new Error("The image uploaded, but no storage path was returned.");
        }
        await callGroupAPI("send_group_message", {
          group_id: groupId,
          message_type: "image",
          media_path: uploadResult.media_path
        });
      } else {
        uploadResult = await callMessageAPI("upload_image", {
          receiver_id: targetId,
          content_type: "image/jpeg",
          file_base64: fileBase64
        });
        if (!uploadResult.media_path) {
          throw new Error("The image uploaded, but no storage path was returned.");
        }
        await callMessageAPI("send_message", {
          receiver_id: targetId,
          message_type: "image",
          content: "[image]",
          media_path: uploadResult.media_path
        });
      }

      if (
        isChatActive &&
        requestVersion === currentRequestVersion &&
        String(currentChatUser?.id) === targetId &&
        String(currentChatUser?.type || "friend") === targetType
      ) {
        removeTemporaryNotice();
        lastRenderedSignature = null;
        await loadChatMessages({ silent: true });
      }
    } finally {
      isSendingMessage = false;
      if (chatSendButton) chatSendButton.disabled = false;
      if (chatAttachmentButton) chatAttachmentButton.disabled = false;
    }
  }

  /* =================================================
     BIND UI EVENTS ONCE
  ================================================= */

  function bindChatEvents() {
    if (chatEventsBound) return;

    chatEventsBound = true;

    if (chatForm) {
      chatForm.addEventListener(
        "submit",
        sendChatMessage
      );
    }

    if (chatBackButton) {
      chatBackButton.addEventListener(
        "click",
        handleChatBack
      );
    }

    if (chatInput) {
      chatInput.addEventListener(
        "input",
        function () {
          if (
            chatInput.value.length >
            MAX_MESSAGE_LENGTH
          ) {
            chatInput.value =
              chatInput.value.slice(
                0,
                MAX_MESSAGE_LENGTH
              );
          }

          resizeChatInput();
        }
      );

      /*
       * Enter and Shift+Enter both create new lines.
       * Sending is handled by the send button/form.
       */
      chatInput.addEventListener(
        "keydown",
        function (event) {
          if (
            event.key === "Enter" &&
            !event.shiftKey
          ) {
            // Intentionally allow the newline.
          }
        }
      );
    }

    if (chatAvatar) {
      chatAvatar.onerror = function () {
        if (
          chatAvatar.getAttribute("src") !==
          DEFAULT_AVATAR
        ) {
          chatAvatar.src = DEFAULT_AVATAR;
        } else {
          chatAvatar.onerror = null;
        }
      };
    }

    if (chatMoreButton) {
      chatMoreButton.addEventListener(
        "click",
        handleChatMoreClick
      );
    }

    bindImageAttachment();
  }

  /* =================================================
     INITIALIZE CHAT PAGE
     Called by normal-message.js:
       initializeChatPage(user)
  ================================================= */

  async function initializeChatPage(user) {
    if (
      !chatPage ||
      !chatMessages ||
      !chatForm ||
      !chatInput
    ) {
      console.error(
        "U9 Chat: Required chat HTML elements are missing."
      );

      return false;
    }

    if (
      !user ||
      !(
        user.id ||
        user.user_id ||
        user.group_id ||
        user.groupId ||
        user.conversation_id ||
        user.conversationId
      )
    ) {
      console.error(
        "U9 Chat: A valid chat target ID is required.",
        user
      );

      return false;
    }

    bindChatEvents();
    bindChatViewportEvents();

    const nextUserId = String(
      user.id ||
      user.user_id ||
      user.group_id ||
      user.groupId ||
      user.conversation_id ||
      user.conversationId
    );

    const nextChatType = String(
      user.type ||
      (
        user.group_id || user.groupId
          ? "group"
          : (
              user.conversation_id ||
              user.conversationId
                ? "customer_service"
                : "friend"
            )
      )
    );

    const changedConversation =
      !currentChatUser ||
      String(currentChatUser.id) !==
        nextUserId ||
      String(
        currentChatUser.type || "friend"
      ) !== nextChatType;

    if (changedConversation) {
      currentRequestVersion++;

      stopMessagePolling();

      isLoadingMessages = false;
      activeMessageLoadPromise = null;

      lastRenderedSignature = null;
    }

    currentChatUser = {
      ...user,
      id: nextUserId,
      type: nextChatType,

      group_id:
        nextChatType === "group"
          ? String(
              user.group_id ||
              user.groupId ||
              nextUserId
            )
          : (user.group_id || null),

      metadata:
        user.metadata &&
        typeof user.metadata === "object"
          ? { ...user.metadata }
          : {}
    };

    isChatActive = true;

    chatPage.hidden = false;

    chatPage.classList.add(
      "active",
      "is-active"
    );

    chatPage.setAttribute(
      "aria-hidden",
      "false"
    );

    updateChatHeader(currentChatUser);

    updateCustomerServiceComposer();

    resizeChatInput();

    if (changedConversation) {
      const cachedMessages = getCachedConversationMessages(
        nextChatType,
        nextUserId
      );

      if (cachedMessages !== null) {
        // Render cached messages immediately; loadChatMessages below refreshes them.
        renderMessages(cachedMessages, true);
      } else {
        showChatNotice(
          "Loading conversation...",
          "info"
        );
      }
    }

    requestAnimationFrame(function () {
      updateChatViewport();
      resizeChatInput();
    });

    await loadChatMessages();

    if (
      isChatActive &&
      currentChatUser &&
      String(currentChatUser.id) ===
        nextUserId &&
      String(
        currentChatUser.type || "friend"
      ) === nextChatType
    ) {
      scheduleMessagePolling();

      /*
       * Avoid automatically opening the mobile keyboard
       * every time a conversation is opened.
       */
      const isTouchDevice =
        window.matchMedia(
          "(pointer: coarse)"
        ).matches;

      if (
        !isTouchDevice &&
        document.activeElement !== chatInput &&
        !chatInput.value &&
        !chatInput.disabled
      ) {
        chatInput.focus({
          preventScroll: true
        });
      }

      requestAnimationFrame(
        updateChatViewport
      );
    }

    console.log(
      "U9 Chat Page initialized.",
      {
        chatType: nextChatType,
        targetId: nextUserId,
        targetName:
          currentChatUser?.name ||
          currentChatUser?.username ||
          "User"
      }
    );

    return true;
  }

  /* =================================================
     CLOSE CHAT PAGE
     Called by normal-message.js when leaving Chat.
  ================================================= */

  function closeChatPage() {
    isChatActive = false;

    currentRequestVersion++;

    stopMessagePolling();

    currentChatUser = null;

    isLoadingMessages = false;
    isSendingMessage = false;

    activeMessageLoadPromise = null;
    lastRenderedSignature = null;

    if (chatPage) {
      chatPage.classList.remove(
        "active",
        "is-active"
      );

      chatPage.hidden = true;

      chatPage.setAttribute(
        "aria-hidden",
        "true"
      );

      chatPage.style.removeProperty(
        "--u9-chat-viewport-height"
      );
    }

    if (chatSendButton) {
      chatSendButton.disabled = false;

      chatSendButton.removeAttribute(
        "aria-busy"
      );
    }

    if (chatInput) {
      chatInput.disabled = false;

      chatInput.placeholder =
        "Type a message...";

      chatInput.value = "";

      resizeChatInput();
    }

    if (chatMoreButton) {
      chatMoreButton.disabled = false;

      chatMoreButton.setAttribute(
        "aria-label",
        "More chat options"
      );

      chatMoreButton.removeAttribute("title");
    }

    console.log("U9 Chat Page closed.");
  }

  /* =================================================
     PUBLIC API
  ================================================= */

  window.initializeChatPage =
    initializeChatPage;

  window.closeChatPage =
    closeChatPage;

  window.loadChatMessages =
    loadChatMessages;

  window.sendChatMessage =
    sendChatMessage;

  /* =================================================
     INITIALIZE
  ================================================= */

  function initializeChatModule() {
    bindChatEvents();

    bindChatViewportEvents();

    resizeChatInput();

    console.log(
      "U9 Chat module ready. Waiting for a conversation."
    );
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initializeChatModule,
      { once: true }
    );
  } else {
    initializeChatModule();
  }
})();
