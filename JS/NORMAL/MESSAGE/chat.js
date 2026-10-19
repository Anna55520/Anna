
/* =================================================
   U9 MESSAGE CHAT
   File: JS/NORMAL/MESSAGE/chat.js

   Features:
   - One-to-one chat through message-api
   - Group chat through group-api
   - Customer-service chat through customer-service-api
   - Load and send text messages
   - Refresh messages every 4 seconds
   - Sender / receiver message bubbles
   - Preserve existing chat HTML IDs
   - Stop refreshing after leaving Chat
   - Prevent stale requests from affecting a new chat
   - Support U9 custom session and u9_session cookie
   - Show useful API and authentication errors

   APIs:
   - message-api: list_messages, send_message
   - group-api: list_group_messages, send_group_message
   - customer-service-api:
       list_messages
       send_message
       mark_read
       close_conversation
   - me: GET current user
================================================= */

(function () {
  "use strict";

  if (window.__U9ChatPageInitialized) {
    return;
  }

  window.__U9ChatPageInitialized = true;

  /* =================================================
     CONFIGURATION

     These are same-origin Vercel API routes.
     Do not replace them with direct Supabase URLs
     unless you intentionally change the proxy design.
  ================================================= */

  const MESSAGE_API_URL = "/api/message-api";
  const GROUP_API_URL = "/api/group-api";
  const CUSTOMER_SERVICE_API_URL =
    "/api/customer-service-api";
  const ME_API_URL = "/api/me";

  const DEFAULT_AVATAR = "/SSVG/avatar/profile.svg";

  const POLL_INTERVAL_MS = 4000;
  const MAX_MESSAGE_LENGTH = 5000;
  const MESSAGE_LIMIT = 100;

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
  let isSendingMessage = false;

  let activeLoadCount = 0;
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

     Keep compatibility with the U9 custom session.
     The backend remains responsible for validating
     and authorizing every request.
  ================================================= */

  function readStorageValue(key) {
    try {
      const value = localStorage.getItem(key);

      if (
        typeof value === "string" &&
        value.trim()
      ) {
        return value.trim();
      }
    } catch (error) {
      console.warn(
        "U9 Chat: Cannot read localStorage.",
        error
      );
    }

    return "";
  }

  function readSessionCookie() {
    try {
      const match = document.cookie.match(
        /(?:^|;\s*)u9_session=([^;]+)/
      );

      if (match && match[1]) {
        return decodeURIComponent(match[1]);
      }
    } catch (error) {
      console.warn(
        "U9 Chat: Cannot read u9_session cookie.",
        error
      );
    }

    return "";
  }

  function getSessionToken() {
    const keys = [
      "u9_token",
      "u9_access_token",
      "u9_session",
      "session_token",
      "access_token",
      "authToken",
      "token"
    ];

    for (const key of keys) {
      const value = readStorageValue(key);

      if (value) {
        return value;
      }
    }

    return readSessionCookie();
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
     SHARED API REQUEST
  ================================================= */

  async function postAPI(
    apiURL,
    action,
    payload = {},
    serviceName = "messaging"
  ) {
    let response;

    try {
      response = await fetch(apiURL, {
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
        "U9 Chat: Cannot reach " + serviceName + ".",
        error
      );

      const networkError = new Error(
        "Could not connect to " +
          serviceName +
          ". Check the same-origin API route and Vercel deployment."
      );

      networkError.cause = error;

      throw networkError;
    }

    let result;

    try {
      result = await response.json();
    } catch (error) {
      const invalidResponse = new Error(
        serviceName +
          " returned an invalid response (HTTP " +
          response.status +
          ")."
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
          serviceName + " request failed."
      );

      apiError.status = response.status;
      apiError.code = result?.code || null;

      throw apiError;
    }

    return result;
  }

  /* =================================================
     CALL MESSAGE API
  ================================================= */

  function callMessageAPI(action, payload = {}) {
    return postAPI(
      MESSAGE_API_URL,
      action,
      payload,
      "message-api"
    );
  }

  /* =================================================
     CALL GROUP API
  ================================================= */

  function callGroupAPI(action, payload = {}) {
    return postAPI(
      GROUP_API_URL,
      action,
      payload,
      "group-api"
    );
  }

  /* =================================================
     CALL CUSTOMER SERVICE API
  ================================================= */

  function callCustomerServiceAPI(
    action,
    payload = {}
  ) {
    return postAPI(
      CUSTOMER_SERVICE_API_URL,
      action,
      payload,
      "customer-service-api"
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
        : currentChatUser.metadata.service_side ===
            "agent"
          ? "Reply to customer..."
          : "Message customer service...";
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
        : status === "assigned"
          ? "Support agent connected"
          : "Waiting for support agent";
    }
  }

  /* =================================================
     CURRENT USER ID
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
        const value = readStorageValue(key);

        if (value) {
          return value;
        }
      }

      const jsonKeys = [
        "u9_user",
        "currentUser"
      ];

      for (const key of jsonKeys) {
        const value = readStorageValue(key);

        if (!value) {
          continue;
        }

        try {
          const parsed = JSON.parse(value);

          const id =
            parsed?.id ||
            parsed?.user?.id ||
            parsed?.user_id ||
            null;

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
     CURRENT USER ID: FALL BACK TO /ME
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

        const result = await response
          .json()
          .catch(function () {
            return {};
          });

        if (!response.ok) {
          console.warn(
            "U9 Chat: /me lookup failed.",
            response.status,
            result?.message || result?.error
          );

          return null;
        }

        const id =
          result?.user?.id ||
          result?.id ||
          result?.user_id ||
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
        user?.group_name ||
        "Chat";
    }

    if (chatStatus) {
      chatStatus.textContent =
        user?.status ||
        (user?.type === "group" ? "Group chat" : "Friend");
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

          if (
            chatAvatar.src.endsWith(DEFAULT_AVATAR)
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
     STATUS MESSAGE
  ================================================= */

  function createNotice(message, type = "info") {
    const notice = document.createElement("div");

    notice.className =
      "U9-chat-system-message U9-chat-system-message-" +
      type;

    notice.textContent = String(message || "");

    notice.setAttribute("role", "status");

    notice.style.padding = "12px 14px";
    notice.style.margin = "10px 0";
    notice.style.borderRadius = "10px";
    notice.style.fontSize = "13px";
    notice.style.lineHeight = "1.5";
    notice.style.overflowWrap = "anywhere";
    notice.style.boxSizing = "border-box";

    if (type === "error") {
      notice.style.background = "#fff1f1";
      notice.style.color = "#b42318";
    } else {
      notice.style.background = "#f3f6fb";
      notice.style.color = "#687080";
    }

    return notice;
  }

  function showChatNotice(
    message,
    type = "info"
  ) {
    if (!chatMessages) {
      return;
    }

    chatMessages.replaceChildren(
      createNotice(message, type)
    );

    lastRenderedSignature = null;
  }

  function appendChatNotice(
    message,
    type = "error"
  ) {
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

    if (chatMessages.scrollHeight) {
      chatMessages.scrollTop =
        chatMessages.scrollHeight;
    }
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
    const isOwnMessage = Boolean(
      currentUserId &&
        String(message.sender_id) ===
          String(currentUserId)
    );

    const isGroup =
      currentChatUser?.type === "group";

    const row = document.createElement("div");

    row.className =
      "U9-chat-message-row " +
      (isOwnMessage
        ? "U9-chat-message-own"
        : "U9-chat-message-other");

    row.style.display = "flex";
    row.style.width = "100%";
    row.style.margin = "5px 0";
    row.style.justifyContent = isOwnMessage
      ? "flex-end"
      : "flex-start";

    const bubble = document.createElement("div");

    bubble.className =
      "U9-chat-message-bubble " +
      (isOwnMessage
        ? "U9-chat-bubble-own"
        : "U9-chat-bubble-other");

    bubble.style.maxWidth = isGroup
      ? "100%"
      : "min(78%, 520px)";

    bubble.style.padding = "10px 13px";
    bubble.style.borderRadius = "15px";
    bubble.style.overflowWrap = "anywhere";
    bubble.style.boxSizing = "border-box";

    bubble.style.background = isOwnMessage
      ? "#dcecff"
      : "#f0f2f5";

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
        image.decoding = "async";

        image.style.display = "block";
        image.style.maxWidth = "100%";
        image.style.maxHeight = "280px";
        image.style.borderRadius = "8px";
        image.style.objectFit = "contain";

        image.onerror = function () {
          image.onerror = null;

          const label = document.createElement("div");
          label.textContent = "Image unavailable";

          image.replaceWith(label);
        };

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
        const caption = document.createElement("div");

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

    if (isGroup && !isOwnMessage) {
      const content = document.createElement("div");

      content.className =
        "U9-chat-message-content";

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
     MESSAGE SIGNATURE
  ================================================= */

  function getMessagesSignature(messages) {
    return messages
      .map(function (message) {
        return [
          message.id || "",
          message.edited_at || "",
          message.deleted_at || "",
          message.content || "",
          message.read_at || "",
          message.media_path || ""
        ].join(":");
      })
      .join("|");
  }

  /* =================================================
     RENDER MESSAGES
  ================================================= */

  function renderMessages(
    messages,
    force = false
  ) {
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
        chatMessages.clientHeight <
      100;

    const oldScrollTop = chatMessages.scrollTop;

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

    chatMessages.replaceChildren(list);

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
        return "This website is not authorized by group-api. Check the API origin configuration.";
      }

      if (
        currentChatUser?.type ===
        "customer_service"
      ) {
        return "This website is not authorized by customer-service-api. Check its origin configuration.";
      }

      return "This website is not authorized by message-api. Check its origin configuration.";
    }

    if (
      error?.status === 404 &&
      /conversation/i.test(message)
    ) {
      return "This customer-service conversation could not be found.";
    }

    if (
      /this conversation is closed/i.test(message)
    ) {
      return "This conversation is closed. You cannot send more messages.";
    }

    return (
      message ||
      "Could not load messages. Please try again."
    );
  }

  /* =================================================
     REQUEST IDENTITY CHECK
  ================================================= */

  function isCurrentConversation(
    requestVersion,
    targetId,
    targetType
  ) {
    return (
      isChatActive &&
      requestVersion === currentRequestVersion &&
      String(currentChatUser?.id || "") ===
        String(targetId) &&
      String(currentChatUser?.type || "friend") ===
        String(targetType)
    );
  }

  /* =================================================
     LOAD CHAT MESSAGES

     Concurrent calls are allowed. Each response is
     checked against the conversation version before
     it updates the UI.
  ================================================= */

  async function loadChatMessages(options = {}) {
    const silent = options.silent === true;
    const force = options.force === true;

    if (
      !isChatActive ||
      !currentChatUser?.id ||
      !chatMessages
    ) {
      return [];
    }

    const requestVersion = currentRequestVersion;
    const targetId = String(currentChatUser.id);
    const targetType = String(
      currentChatUser.type || "friend"
    );

    activeLoadCount++;

    try {
      await resolveCurrentUserId();

      if (
        !isCurrentConversation(
          requestVersion,
          targetId,
          targetType
        )
      ) {
        return [];
      }

      let result;

      if (targetType === "group") {
        result = await callGroupAPI(
          "list_group_messages",
          {
            group_id: String(
              currentChatUser.group_id || targetId
            ),
            limit: MESSAGE_LIMIT
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
            limit: MESSAGE_LIMIT
          }
        );
      } else {
        result = await callMessageAPI(
          "list_messages",
          {
            other_user_id: targetId,
            limit: MESSAGE_LIMIT
          }
        );
      }

      if (
        !isCurrentConversation(
          requestVersion,
          targetId,
          targetType
        )
      ) {
        return [];
      }

      const messages = Array.isArray(result.messages)
        ? result.messages
        : [];

      renderMessages(messages, force);

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
          currentChatUser.metadata?.service_side ===
          "agent"
            ? "agent"
            : "customer";

        const incomingType =
          side === "agent" ? "customer" : "agent";

        const hasUnreadIncoming = messages.some(
          function (message) {
            return (
              message.sender_type === incomingType &&
              !message.read_at &&
              !message.deleted_at
            );
          }
        );

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
          (targetType === "group"
            ? "Group chat"
            : "Friend");
      }

      return messages;
    } catch (error) {
      console.error(
        "U9 Chat: Failed to load messages.",
        error
      );

      if (
        !isCurrentConversation(
          requestVersion,
          targetId,
          targetType
        )
      ) {
        return [];
      }

      const errorMessage =
        getReadableError(error);

      if (
        silent &&
        lastRenderedSignature !== null
      ) {
        appendChatNotice(errorMessage, "error");
      } else {
        showChatNotice(errorMessage, "error");
      }

      return [];
    } finally {
      activeLoadCount = Math.max(
        0,
        activeLoadCount - 1
      );
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
        "Messages cannot exceed " +
          MAX_MESSAGE_LENGTH +
          " characters.",
        "error"
      );

      return;
    }

    const requestVersion = currentRequestVersion;
    const targetId = String(currentChatUser.id);
    const targetType = String(
      currentChatUser.type || "friend"
    );

    if (
      targetType === "customer_service" &&
      String(
        currentChatUser.metadata
          ?.conversation_status || "open"
      ).toLowerCase() === "closed"
    ) {
      appendChatNotice(
        "This conversation is closed. You cannot send more messages.",
        "error"
      );

      return;
    }

    isSendingMessage = true;

    if (chatSendButton) {
      chatSendButton.disabled = true;

      chatSendButton.setAttribute(
        "aria-busy",
        "true"
      );
    }

    if (chatInput) {
      chatInput.disabled = true;
    }

    try {
      if (targetType === "customer_service") {
        await callCustomerServiceAPI(
          "send_message",
          {
            conversation_id:
              getCustomerServiceConversationId(),
            message_type: "text",
            content
          }
        );
      } else if (targetType === "group") {
        await callGroupAPI(
          "send_group_message",
          {
            group_id: String(
              currentChatUser.group_id || targetId
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
       * Only clear the composer if the send succeeded
       * and the user is still in the same conversation.
       */
      if (
        isCurrentConversation(
          requestVersion,
          targetId,
          targetType
        )
      ) {
        chatInput.value = "";

        await loadChatMessages({
          force: true
        });

        if (
          targetType === "customer_service"
        ) {
          window.dispatchEvent(
            new CustomEvent(
              "u9:customer-service:conversation-updated",
              {
                detail: {
                  conversation_id:
                    getCustomerServiceConversationId()
                }
              }
            )
          );
        }

        if (
          chatInput &&
          !chatInput.disabled
        ) {
          chatInput.focus();
        }
      }
    } catch (error) {
      console.error(
        "U9 Chat: Failed to send message.",
        error
      );

      if (
        isCurrentConversation(
          requestVersion,
          targetId,
          targetType
        )
      ) {
        appendChatNotice(
          getReadableError(error),
          "error"
        );
      }
    } finally {
      isSendingMessage = false;

      if (
        isCurrentConversation(
          requestVersion,
          targetId,
          targetType
        )
      ) {
        if (chatInput) {
          chatInput.disabled = false;
        }

        if (chatSendButton) {
          chatSendButton.removeAttribute(
            "aria-busy"
          );
        }

        if (
          targetType === "customer_service"
        ) {
          updateCustomerServiceComposer();
        } else if (chatSendButton) {
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

    const scheduledVersion = currentRequestVersion;

    pollTimer = setTimeout(
      async function () {
        pollTimer = null;

        if (
          !isChatActive ||
          scheduledVersion !== currentRequestVersion
        ) {
          return;
        }

        await loadChatMessages({
          silent: true
        });

        if (
          isChatActive &&
          scheduledVersion === currentRequestVersion
        ) {
          scheduleMessagePolling();
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
      typeof window.closeMessageChat === "function"
    ) {
      window.closeMessageChat();
      return;
    }

    closeChatPage();

    if (
      typeof window.showMessageHome === "function"
    ) {
      window.showMessageHome();
    }
  }

  /* =================================================
     CLOSE CUSTOMER SERVICE CONVERSATION
  ================================================= */

  async function handleCustomerServiceClose() {
    if (
      currentChatUser?.type !== "customer_service"
    ) {
      console.info(
        "U9 Chat: More options are not implemented yet."
      );

      return;
    }

    const status = String(
      currentChatUser.metadata
        ?.conversation_status || "open"
    ).toLowerCase();

    if (status === "closed") {
      return;
    }

    const confirmText =
      currentChatUser.metadata?.service_side ===
      "agent"
        ? "Close this customer support conversation? The customer will no longer be able to reply in this conversation."
        : "Close this customer support conversation? You can start a new one later.";

    if (!window.confirm(confirmText)) {
      return;
    }

    const requestVersion = currentRequestVersion;
    const targetId = String(currentChatUser.id);

    if (chatMoreButton) {
      chatMoreButton.disabled = true;
    }

    try {
      const result = await callCustomerServiceAPI(
        "close_conversation",
        {
          conversation_id:
            getCustomerServiceConversationId()
        }
      );

      if (
        !isCurrentConversation(
          requestVersion,
          targetId,
          "customer_service"
        )
      ) {
        return;
      }

      const nextStatus =
        result?.conversation?.status || "closed";

      if (
        !currentChatUser.metadata ||
        typeof currentChatUser.metadata !== "object"
      ) {
        currentChatUser.metadata = {};
      }

      currentChatUser.metadata.conversation_status =
        nextStatus;

      updateCustomerServiceComposer(nextStatus);

      appendChatNotice(
        "This customer service conversation is now closed.",
        "info"
      );

      window.dispatchEvent(
        new CustomEvent(
          "u9:customer-service:conversation-updated",
          {
            detail: {
              conversation_id:
                getCustomerServiceConversationId()
            }
          }
        )
      );
    } catch (error) {
      console.error(
        "U9 Chat: Could not close customer-service conversation.",
        error
      );

      if (
        isCurrentConversation(
          requestVersion,
          targetId,
          "customer_service"
        )
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
        handleCustomerServiceClose
      );
    }
  }

  /* =================================================
     INITIALIZE CHAT PAGE

     Called by normal-message.js:
       initializeChatPage(user)

     Accepted examples:
       { id: "USER_UUID", name: "Username" }

       {
         id: "GROUP_UUID",
         group_id: "GROUP_UUID",
         type: "group",
         name: "Group name"
       }

       {
         id: "CONVERSATION_UUID",
         type: "customer_service",
         conversation_id: "CONVERSATION_UUID",
         metadata: { service_side: "customer" }
       }
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
        "U9 Chat: A valid conversation identifier is required.",
        user
      );

      return false;
    }

    bindChatEvents();

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
        (user.group_id || user.groupId
          ? "group"
          : user.conversation_id ||
              user.conversationId
            ? "customer_service"
            : "friend")
    );

    const changedConversation =
      !currentChatUser ||
      String(currentChatUser.id) !== nextUserId ||
      String(
        currentChatUser.type || "friend"
      ) !== nextChatType;

    if (changedConversation) {
      currentRequestVersion++;

      stopMessagePolling();

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
          : user.group_id || null,

      conversation_id:
        nextChatType === "customer_service"
          ? String(
              user.conversation_id ||
                user.conversationId ||
                nextUserId
            )
          : user.conversation_id || null,

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
      String(
        currentChatUser.type || "friend"
      ) === nextChatType
    ) {
      scheduleMessagePolling();

      if (
        document.activeElement !== chatInput &&
        !chatInput.value &&
        !chatInput.disabled
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
        targetName:
          currentChatUser.name || "User"
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

    isSendingMessage = false;
    activeLoadCount = 0;

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

      chatSendButton.removeAttribute(
        "aria-busy"
      );
    }

    if (chatInput) {
      chatInput.disabled = false;
      chatInput.value = "";
      chatInput.placeholder = "Type a message...";
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
     INITIALIZE MODULE
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
