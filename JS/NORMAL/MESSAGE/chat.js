
/* =================================================
   U9 MESSAGE CHAT
   File: JS/NORMAL/MESSAGE/chat.js

   Features:
   - Connect one-to-one chat to message-api
   - Connect group chat to group-api
   - Connect customer-service chat to customer-service-api
   - Load and send text messages in all modes
   - Refresh messages every 4 seconds
   - Show sender / receiver message bubbles
   - Keep existing chat HTML IDs
   - Stop refreshing after leaving Chat
   - Show useful API and authentication errors

   APIs:
   - message-api: list_messages, send_message
   - group-api: list_group_messages, send_group_message
   - customer-service-api: list_messages, send_message, mark_read, close_conversation
================================================= */

(function () {
  "use strict";

  if (window.__U9ChatPageInitialized) {
    return;
  }

  window.__U9ChatPageInitialized = true;

  /* =================================================
     CONFIGURATION
  ================================================= */

  // All browser API calls use the site's Vercel same-origin proxy.
  const MESSAGE_API_URL = "/api/functions/message-api";
  const GROUP_API_URL = "/api/functions/group-api";
  const CUSTOMER_SERVICE_API_URL = "/api/functions/customer-service-api";
  const ME_API_URL = "/api/me";

  const DEFAULT_AVATAR =
    "/SSVG/account/account-edit-button.svg";

  const POLL_INTERVAL_MS = 4000;

  const MAX_MESSAGE_LENGTH = 5000;

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

  /* =================================================
     IMAGE URL
  ================================================= */

  function normalizeImageURL(value, fallback) {
    if (typeof value !== "string") {
      return fallback;
    }

    const url = value.trim();

    if (!url) {
      return fallback;
    }

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
      /^data:image\/[a-z0-9.+-]+(?:;[^,]*)?,/i.test(url)
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

  /* =================================================
     REQUEST HEADERS
  ================================================= */

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
     CALL MESSAGE API
  ================================================= */

  async function callMessageAPI(action, payload = {}) {
    let response;

    try {
      response = await fetch(
        MESSAGE_API_URL,
        {
          method: "POST",
          headers: getRequestHeaders(),
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
        "U9 Chat: Cannot reach message-api.",
        error
      );

      const networkError = new Error(
        "Could not connect to the messaging server. Check the message-api deployment and CORS settings."
      );

      networkError.cause = error;

      throw networkError;
    }

    let result;

    try {
      result = await response.json();
    } catch (error) {
      throw new Error(
        "The messaging server returned an invalid response."
      );
    }

    if (
      !response.ok ||
      !result ||
      result.success !== true
    ) {
      const apiError = new Error(
        result?.error ||
        "The messaging request failed."
      );

      apiError.status = response.status;

      throw apiError;
    }

    return result;
  }

  /* =================================================
     CALL GROUP API

     Group messages use the separate group-api function.
     Never pass a group UUID to message-api as receiver_id.
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
        if (value && value.trim()) return value.trim();
      } catch (_) {
        // Try the U9 session cookie below.
      }
    }

    try {
      const match = document.cookie.match(/(?:^|;\s*)u9_session=([^;]+)/);
      if (match?.[1]) return decodeURIComponent(match[1]);
    } catch (_) {
      // group-api will report an authentication error if needed.
    }

    return "";
  }

  async function callGroupAPI(action, payload = {}) {
    const headers = { "Content-Type": "application/json" };
    const token = getGroupSessionToken();
    if (token) headers.Authorization = "Bearer " + token;

    let response;
    try {
      response = await fetch(GROUP_API_URL, {
        method: "POST",
        headers,
        credentials: "include",
        cache: "no-store",
        body: JSON.stringify({ action, ...payload })
      });
    } catch (error) {
      const networkError = new Error(
        "Could not connect to the group messaging server. Check the group-api deployment and CORS settings."
      );
      networkError.cause = error;
      throw networkError;
    }

    let result;
    try {
      result = await response.json();
    } catch (_) {
      const invalidResponse = new Error(
        `The group server returned an invalid response (${response.status}).`
      );
      invalidResponse.status = response.status;
      throw invalidResponse;
    }

    if (!response.ok || !result || result.success !== true) {
      const apiError = new Error(
        result?.error || "The group messaging request failed."
      );
      apiError.status = response.status;
      throw apiError;
    }

    return result;
  }

  /* =================================================
     CALL CUSTOMER SERVICE API

     Customer-service conversations have their own API and
     use conversation_id, never a friend receiver_id.
  ================================================= */

  async function callCustomerServiceAPI(action, payload = {}) {
    const headers = { "Content-Type": "application/json" };
    const token = getGroupSessionToken();
    if (token) headers.Authorization = "Bearer " + token;

    let response;
    try {
      response = await fetch(CUSTOMER_SERVICE_API_URL, {
        method: "POST",
        headers,
        credentials: "include",
        cache: "no-store",
        body: JSON.stringify({ action, ...payload })
      });
    } catch (error) {
      const networkError = new Error(
        "Could not connect to customer service. Check the customer-service-api deployment and CORS settings."
      );
      networkError.cause = error;
      throw networkError;
    }

    let result;
    try {
      result = await response.json();
    } catch (_) {
      const invalidResponse = new Error(
        `The customer service server returned an invalid response (${response.status}).`
      );
      invalidResponse.status = response.status;
      throw invalidResponse;
    }

    if (!response.ok || !result || result.success !== true) {
      const apiError = new Error(
        result?.error || "The customer service request failed."
      );
      apiError.status = response.status;
      throw apiError;
    }

    return result;
  }

  function getCustomerServiceConversationId() {
    return String(
      currentChatUser?.conversationId ||
      currentChatUser?.conversation_id ||
      currentChatUser?.id ||
      ""
    );
  }

  function updateCustomerServiceComposer(statusOverride) {
    if (currentChatUser?.type !== "customer_service") {
      if (chatInput) {
        chatInput.disabled = false;
        if (/^(This conversation is closed|Message customer service\.\.\.|Reply to customer\.\.\.)$/.test(chatInput.placeholder || "")) {
          chatInput.placeholder = "Type a message...";
        }
      }
      if (chatMoreButton) {
        chatMoreButton.disabled = false;
        chatMoreButton.setAttribute("aria-label", "More chat options");
        chatMoreButton.removeAttribute("title");
      }
      if (chatSendButton && !isSendingMessage) chatSendButton.disabled = false;
      return;
    }

    if (!currentChatUser.metadata || typeof currentChatUser.metadata !== "object") {
      currentChatUser.metadata = {};
    }

    const status = String(
      statusOverride || currentChatUser.metadata.conversation_status || "open"
    ).toLowerCase();
    currentChatUser.metadata.conversation_status = status;

    const closed = status === "closed";
    if (chatInput) {
      chatInput.disabled = closed;
      chatInput.placeholder = closed
        ? "This conversation is closed"
        : (currentChatUser.metadata.service_side === "agent"
          ? "Reply to customer..."
          : "Message customer service...");
    }
    if (chatSendButton) {
      chatSendButton.disabled = closed || isSendingMessage;
    }
    if (chatMoreButton) {
      chatMoreButton.setAttribute("aria-label", closed ? "Conversation closed" : "Close customer service conversation");
      chatMoreButton.title = closed ? "Conversation closed" : "Close conversation";
      chatMoreButton.disabled = closed;
    }
    if (chatStatus) {
      chatStatus.textContent = closed
        ? "Closed · view only"
        : (status === "assigned" ? "Support agent connected" : "Waiting for support agent");
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

        if (!value) {
          continue;
        }

        try {
          const parsed = JSON.parse(value);

          const id =
            parsed?.id ||
            parsed?.user?.id;

          if (id) {
            return String(id);
          }
        } catch {
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

    if (currentUserLookupAttempted) {
      return null;
    }

    if (currentUserLookupPromise) {
      return currentUserLookupPromise;
    }

    currentUserLookupAttempted = true;

    currentUserLookupPromise = (async function () {
      try {
        const response = await fetch(
          ME_API_URL,
          {
            method: "GET",
            headers: getRequestHeaders(),
            credentials: "include",
            cache: "no-store"
          }
        );

        const result = await response.json()
          .catch(function () {
            return {};
          });

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
          result?.id ||
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
        "Chat";
    }

    if (chatStatus) {
      chatStatus.textContent =
        user?.status ||
        "Friend";
    }

    if (chatAvatar) {
      chatAvatar.onerror = null;

      chatAvatar.dataset.fallbackStage = "0";

      chatAvatar.src = normalizeImageURL(
        user?.avatar_url ||
        user?.avatar ||
        user?.avatarUrl,
        DEFAULT_AVATAR
      );

      chatAvatar.onerror = function () {
        if (
          chatAvatar.dataset.fallbackStage === "0"
        ) {
          chatAvatar.dataset.fallbackStage = "1";

          if (chatAvatar.src.endsWith(DEFAULT_AVATAR)) {
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
     STATUS MESSAGE
  ================================================= */

  function createNotice(message, type = "info") {
    const notice = document.createElement("div");

    notice.className =
      "U9-chat-system-message U9-chat-system-message-" +
      type;

    notice.textContent = message;

    notice.setAttribute("role", "status");

    notice.style.padding = "12px 14px";
    notice.style.margin = "10px 0";
    notice.style.borderRadius = "10px";
    notice.style.fontSize = "13px";
    notice.style.lineHeight = "1.5";
    notice.style.overflowWrap = "anywhere";

    if (type === "error") {
      notice.style.background = "#fff1f1";
      notice.style.color = "#b42318";
    } else {
      notice.style.background = "#f3f6fb";
      notice.style.color = "#687080";
    }

    return notice;
  }

  function showChatNotice(message, type = "info") {
    if (!chatMessages) {
      return;
    }

    chatMessages.innerHTML = "";

    chatMessages.appendChild(
      createNotice(message, type)
    );
  }

  function appendChatNotice(message, type = "error") {
    if (!chatMessages) {
      return;
    }

    const existing = chatMessages.querySelector(
      ".U9-chat-temporary-notice"
    );

    if (existing) {
      existing.remove();
    }

    const notice = createNotice(message, type);

    notice.classList.add(
      "U9-chat-temporary-notice"
    );

    chatMessages.appendChild(notice);
  }

  /* =================================================
     TIME FORMAT
  ================================================= */

  function formatMessageTime(value) {
    if (!value) {
      return "";
    }

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
    const isOwnMessage =
      Boolean(
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
      isOwnMessage ? "flex-end" : "flex-start";

    const bubble = document.createElement("div");

    bubble.className =
      "U9-chat-message-bubble " +
      (
        isOwnMessage
          ? "U9-chat-bubble-own"
          : "U9-chat-bubble-other"
      );

    bubble.style.maxWidth = currentChatUser?.type === "group"
      ? "100%"
      : "min(78%, 520px)";
    bubble.style.padding = "10px 13px";
    bubble.style.borderRadius = "15px";
    bubble.style.overflowWrap = "anywhere";
    bubble.style.boxSizing = "border-box";

    bubble.style.background =
      isOwnMessage ? "#dcecff" : "#f0f2f5";

    bubble.style.color = "#222222";

    if (message.deleted_at) {
      const deleted = document.createElement("div");

      deleted.textContent = "This message was deleted.";
      deleted.style.fontStyle = "italic";
      deleted.style.opacity = "0.65";

      bubble.appendChild(deleted);
    } else if (message.message_type === "image") {
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
        const imageLabel = document.createElement("div");

        imageLabel.textContent = "Image message";
        bubble.appendChild(imageLabel);
      }

      if (message.content && message.content !== "[image]") {
        const caption = document.createElement("div");

        caption.textContent = message.content;
        caption.style.marginTop = "6px";

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

    time.textContent =
      formatMessageTime(message.created_at);

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
      const content = document.createElement("div");
      content.className = "U9-chat-message-content";
      content.style.display = "flex";
      content.style.flexDirection = "column";
      content.style.alignItems = "flex-start";
      content.style.gap = "4px";
      content.style.flex = "0 1 auto";
      content.style.minWidth = "0";
      content.style.maxWidth = "min(78%, 520px)";

      const sender = document.createElement("div");
      sender.className = "U9-chat-message-sender";
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
    return messages
      .map(function (message) {
        return [
          message.id,
          message.edited_at || "",
          message.deleted_at || ""
        ].join(":");
      })
      .join("|");
  }

  function renderMessages(messages, force = false) {
    if (!chatMessages) {
      return;
    }

    const nextMessages = Array.isArray(messages)
      ? messages
      : [];

    const signature =
      getMessagesSignature(nextMessages);

    if (
      !force &&
      signature === lastRenderedSignature
    ) {
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
      if (currentChatUser?.type === "group") {
        return "This website is not authorized by group-api. Check the group-api CORS origin list.";
      }
      if (currentChatUser?.type === "customer_service") {
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

  async function loadChatMessages(options = {}) {
    const silent = options.silent === true;

    if (
      !isChatActive ||
      !currentChatUser?.id ||
      !chatMessages
    ) {
      return [];
    }

    if (isLoadingMessages) {
      return [];
    }

    isLoadingMessages = true;

    const requestVersion = currentRequestVersion;

    const targetId = String(currentChatUser.id);
    const targetType = String(currentChatUser.type || "friend");

    try {
      await resolveCurrentUserId();

      let result;
      if (targetType === "group") {
        result = await callGroupAPI(
          "list_group_messages",
          {
            group_id: String(currentChatUser.group_id || targetId),
            limit: 100
          }
        );
      } else if (targetType === "customer_service") {
        result = await callCustomerServiceAPI(
          "list_messages",
          {
            conversation_id: getCustomerServiceConversationId(),
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

      if (
        !isChatActive ||
        requestVersion !== currentRequestVersion ||
        String(currentChatUser?.id) !== targetId ||
        String(currentChatUser?.type || "friend") !== targetType
      ) {
        return [];
      }

      const messages = Array.isArray(result.messages)
        ? result.messages
        : [];

      renderMessages(messages);

      if (targetType === "customer_service") {
        const conversationStatus = result?.conversation?.status ||
          currentChatUser.metadata?.conversation_status || "open";
        updateCustomerServiceComposer(conversationStatus);

        const side = currentChatUser.metadata?.service_side === "agent" ? "agent" : "customer";
        const incomingType = side === "agent" ? "customer" : "agent";
        const hasUnreadIncoming = messages.some((message) =>
          message.sender_type === incomingType && !message.read_at && !message.deleted_at
        );
        if (hasUnreadIncoming) {
          try {
            await callCustomerServiceAPI("mark_read", {
              conversation_id: getCustomerServiceConversationId()
            });
          } catch (readError) {
            console.warn("U9 Chat: Could not update customer-service read status.", readError);
          }
        }
      } else if (chatStatus) {
        chatStatus.textContent = currentChatUser.status || "Friend";
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

      if (silent && lastRenderedSignature !== null) {
        appendChatNotice(errorMessage, "error");
      } else {
        showChatNotice(errorMessage, "error");
      }

      return [];
    } finally {
      isLoadingMessages = false;
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

    if (isSendingMessage) {
      return;
    }

    const content = chatInput.value.trim();

    if (!content) {
      chatInput.focus();
      return;
    }

    if (content.length > MAX_MESSAGE_LENGTH) {
      appendChatNotice(
        `Messages cannot exceed ${MAX_MESSAGE_LENGTH} characters.`,
        "error"
      );

      return;
    }

    const targetId = String(currentChatUser.id);
    const targetType = String(currentChatUser.type || "friend");

    isSendingMessage = true;

    if (chatSendButton) {
      chatSendButton.disabled = true;
      chatSendButton.setAttribute(
        "aria-busy",
        "true"
      );
    }

    try {
      if (targetType === "customer_service") {
        if (String(currentChatUser.metadata?.conversation_status || "open").toLowerCase() === "closed") {
          throw new Error("This conversation is closed.");
        }
        await callCustomerServiceAPI(
          "send_message",
          {
            conversation_id: getCustomerServiceConversationId(),
            message_type: "text",
            content
          }
        );
      } else if (targetType === "group") {
        await callGroupAPI(
          "send_group_message",
          {
            group_id: String(currentChatUser.group_id || targetId),
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
       * Clear the input only after the server confirms
       * the message was accepted.
       */
      chatInput.value = "";

      await loadChatMessages();

      if (targetType === "customer_service") {
        window.dispatchEvent(new CustomEvent("u9:customer-service:conversation-updated", {
          detail: { conversation_id: getCustomerServiceConversationId() }
        }));
      }

      if (chatInput && !chatInput.disabled) chatInput.focus();
    } catch (error) {
      console.error(
        "U9 Chat: Failed to send message.",
        error
      );

      appendChatNotice(
        getReadableError(error),
        "error"
      );
    } finally {
      isSendingMessage = false;

      if (chatSendButton) {
        chatSendButton.removeAttribute("aria-busy");
        if (currentChatUser?.type === "customer_service") {
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

    pollTimer = setTimeout(
      async function () {
        pollTimer = null;

        if (!isChatActive) {
          return;
        }

        await loadChatMessages({
          silent: true
        });

        scheduleMessagePolling();
      },
      POLL_INTERVAL_MS
    );
  }

  /* =================================================
     BACK BUTTON
  ================================================= */

  function handleChatBack() {
    if (
      typeof window.closeMessageChat === "function"
    ) {
      window.closeMessageChat();
      return;
    }

    window.closeChatPage();

    if (
      typeof window.showMessageHome === "function"
    ) {
      window.showMessageHome();
    }
  }

  /* =================================================
     BIND UI EVENTS ONCE
  ================================================= */

  function bindChatEvents() {
    if (chatEventsBound) {
      return;
    }

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
          if (chatInput.value.length > MAX_MESSAGE_LENGTH) {
            chatInput.value =
              chatInput.value.slice(
                0,
                MAX_MESSAGE_LENGTH
              );
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
      chatMoreButton.addEventListener("click", async function () {
        if (currentChatUser?.type !== "customer_service") {
          console.info("U9 Chat: More options are not implemented yet.");
          return;
        }

        const status = String(currentChatUser.metadata?.conversation_status || "open").toLowerCase();
        if (status === "closed") return;

        const confirmText = currentChatUser.metadata?.service_side === "agent"
          ? "Close this customer support conversation? The customer will no longer be able to reply in this conversation."
          : "Close this customer support conversation? You can start a new one later.";
        if (!window.confirm(confirmText)) return;

        chatMoreButton.disabled = true;
        try {
          const result = await callCustomerServiceAPI("close_conversation", {
            conversation_id: getCustomerServiceConversationId()
          });
          const nextStatus = result?.conversation?.status || "closed";
          if (!currentChatUser.metadata || typeof currentChatUser.metadata !== "object") {
            currentChatUser.metadata = {};
          }
          currentChatUser.metadata.conversation_status = nextStatus;
          updateCustomerServiceComposer(nextStatus);
          appendChatNotice("This customer service conversation is now closed.", "info");
          window.dispatchEvent(new CustomEvent("u9:customer-service:conversation-updated", {
            detail: { conversation_id: getCustomerServiceConversationId() }
          }));
        } catch (error) {
          console.error("U9 Chat: Could not close customer service conversation.", error);
          appendChatNotice(getReadableError(error), "error");
          chatMoreButton.disabled = false;
        }
      });
    }
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
        user.user_id
      )
    ) {
      console.error(
        "U9 Chat: A valid chat user ID is required.",
        user
      );

      return false;
    }

    bindChatEvents();

    const nextUserId = String(
      user.id || user.user_id || user.group_id || user.groupId
    );
    const nextChatType = String(
      user.type ||
      (user.group_id || user.groupId ? "group" : "friend")
    );

    const changedConversation =
      !currentChatUser ||
      String(currentChatUser.id) !== nextUserId ||
      String(currentChatUser.type || "friend") !== nextChatType;

    if (changedConversation) {
      currentRequestVersion++;

      stopMessagePolling();

      isLoadingMessages = false;

      lastRenderedSignature = null;
    }

    currentChatUser = {
      ...user,
      id: nextUserId,
      type: nextChatType,
      group_id: nextChatType === "group"
        ? String(user.group_id || user.groupId || nextUserId)
        : (user.group_id || null)
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

    if (changedConversation) {
      showChatNotice(
        "Loading conversation...",
        "info"
      );
    }

    await loadChatMessages();

    if (
      isChatActive &&
      currentChatUser &&
      String(currentChatUser.id) === nextUserId &&
      String(currentChatUser.type || "friend") === nextChatType
    ) {
      scheduleMessagePolling();

      if (
        document.activeElement !== chatInput &&
        !chatInput.value
      ) {
        chatInput.focus({
          preventScroll: true
        });
      }
    }

    console.log(
      "U9 Chat Page initialized.",
      {
        chatType: nextChatType,
        targetId: nextUserId,
        targetName: currentChatUser.name || "User"
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
    }

    if (chatSendButton) {
      chatSendButton.disabled = false;
      chatSendButton.removeAttribute("aria-busy");
    }
    if (chatInput) {
      chatInput.disabled = false;
      chatInput.placeholder = "Type a message...";
    }
    if (chatMoreButton) {
      chatMoreButton.disabled = false;
      chatMoreButton.setAttribute("aria-label", "More chat options");
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
