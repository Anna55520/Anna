
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
   - Attachment button reserved for future add.js
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

  const CHAT_BLUE = "#78ace9";
  const CHAT_BLUE_LIGHT = "#dcecff";
  const CHAT_GRAY = "#f0f2f5";

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

  /*
   * Reserved for future add.js.
   * This button intentionally has no click handler.
   */
  const chatAttachmentButton = document.getElementById(
    "U9-message-chat-attachment-button"
  );

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

  /* =================================================
     IMAGE URL
  ================================================= */

  function normalizeImageURL(value, fallback) {
    if (typeof value !== "string") {
      return fallback;
    }

    const url = value.trim();

    if (!url) return fallback;

    if (/^https?:\/\//i.test(url)) {
      return url;
    }

    if (
      url.startsWith("/") &&
      !url.startsWith("//")
    ) {
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

    notice.style.boxSizing = "border-box";
    notice.style.maxWidth = "100%";
    notice.style.padding = "12px 14px";
    notice.style.borderRadius = "10px";
    notice.style.fontSize = "13px";
    notice.style.lineHeight = "1.5";
    notice.style.overflowWrap = "anywhere";

    if (type === "error") {
      notice.style.margin = "10px 0";
      notice.style.background = "#fff1f1";
      notice.style.color = "#b42318";
    } else {
      notice.style.margin = "auto";
      notice.style.alignSelf = "center";
      notice.style.textAlign = "center";
      notice.style.background = "#f3f6fb";
      notice.style.color = "#687080";
    }

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

    row.style.display = "flex";
    row.style.width = "100%";
    row.style.margin = "5px 0";

    row.style.justifyContent =
      isOwnMessage
        ? "flex-end"
        : "flex-start";

    row.style.boxSizing = "border-box";

    const bubble = document.createElement("div");

    bubble.className =
      "U9-chat-message-bubble " +
      (
        isOwnMessage
          ? "U9-chat-bubble-own"
          : "U9-chat-bubble-other"
      );

    bubble.style.maxWidth =
      currentChatUser?.type === "group"
        ? "min(78%, 520px)"
        : "min(78%, 520px)";

    bubble.style.padding = "10px 13px";
    bubble.style.borderRadius = "15px";
    bubble.style.overflowWrap = "anywhere";
    bubble.style.boxSizing = "border-box";

    bubble.style.background =
      isOwnMessage
        ? CHAT_BLUE_LIGHT
        : CHAT_GRAY;

    bubble.style.color = "#222222";

    if (message.deleted_at) {
      const deleted = document.createElement("div");

      deleted.textContent =
        "This message was deleted.";

      deleted.style.fontStyle = "italic";
      deleted.style.opacity = "0.65";

      bubble.appendChild(deleted);
    } else if (
      message.message_type === "image"
    ) {
      const mediaURL = normalizeImageURL(
        message.media_path,
        ""
      );

      if (mediaURL) {
        const image = document.createElement("img");

        image.src = mediaURL;
        image.alt = "Image message";
        image.loading = "lazy";

        image.style.display = "block";
        image.style.maxWidth = "100%";
        image.style.maxHeight = "280px";
        image.style.borderRadius = "8px";
        image.style.objectFit = "contain";

        bubble.appendChild(image);
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

        caption.textContent = message.content;
        caption.style.marginTop = "6px";
        caption.style.whiteSpace = "pre-wrap";

        bubble.appendChild(caption);
      }
    } else {
      const text = document.createElement("div");

      text.className = "U9-chat-message-text";

      text.textContent = message.content || "";

      text.style.whiteSpace = "pre-wrap";
      text.style.overflowWrap = "anywhere";
      text.style.fontSize = "14px";
      text.style.lineHeight = "1.5";

      bubble.appendChild(text);
    }

    const time = document.createElement("div");

    time.className = "U9-chat-message-time";

    time.textContent = formatMessageTime(
      message.created_at
    );

    time.style.marginTop = "5px";
    time.style.fontSize = "10px";
    time.style.lineHeight = "1.3";
    time.style.opacity = "0.62";
    time.style.textAlign = "right";

    bubble.appendChild(time);

    if (
      currentChatUser?.type === "group" &&
      !isOwnMessage
    ) {
      const content =
        document.createElement("div");

      content.className =
        "U9-chat-message-content";

      content.style.display = "flex";
      content.style.flexDirection = "column";
      content.style.alignItems = "flex-start";
      content.style.gap = "4px";
      content.style.flex = "0 1 auto";
      content.style.minWidth = "0";
      content.style.maxWidth = "min(78%, 520px)";

      const sender =
        document.createElement("div");

      sender.className =
        "U9-chat-message-sender";

      sender.textContent = String(
        message.sender_username ||
        message.sender_name ||
        "Group member"
      );

      sender.style.maxWidth = "100%";
      sender.style.color = "#7e899a";
      sender.style.fontSize = "11px";
      sender.style.lineHeight = "1.3";
      sender.style.overflowWrap = "anywhere";

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

    list.style.display = "flex";
    list.style.flexDirection = "column";
    list.style.width = "100%";
    list.style.minHeight = "100%";
    list.style.boxSizing = "border-box";
    list.style.padding = "12px 14px";

    if (nextMessages.length === 0) {
      const empty = document.createElement("div");

      empty.className = "U9-chat-empty";

      empty.textContent =
        "No messages yet. Say hello!";

      empty.style.margin = "auto";
      empty.style.padding = "24px 12px";
      empty.style.textAlign = "center";
      empty.style.color = "#858b96";
      empty.style.fontSize = "13px";
      empty.style.lineHeight = "1.6";

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

        renderMessages(messages);

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

        if (
          silent &&
          lastRenderedSignature !== null
        ) {
          /*
           * Replace the previous temporary notice instead
           * of appending one error every four seconds.
           */
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

    /*
     * Intentionally do not add a click listener to
     * chatAttachmentButton. Future add.js can own it.
     */
    void chatAttachmentButton;
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
      showChatNotice(
        "Loading conversation...",
        "info"
      );
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
          currentChatUser.name ||
          currentChatUser.username ||
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
