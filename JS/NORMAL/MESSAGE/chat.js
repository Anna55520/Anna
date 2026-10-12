
/* =========================================================
   U9 MESSAGE CHAT PAGE
   Shared by:
   - Friend chat
   - Group chat
   - Customer service chat

   Required page:
   #Message-model-chat-page

   Backend integration:
   window.U9ChatAdapter (optional; documented below)
========================================================= */

(function () {
  "use strict";

  if (window.__U9ChatPageInitialized) {
    return;
  }

  window.__U9ChatPageInitialized = true;

  /* =======================================================
     DOM
  ======================================================= */

  const chatPage = document.getElementById(
    "Message-model-chat-page"
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

  const chatMore = document.getElementById(
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

  const chatSend = document.getElementById(
    "Message-model-chat-send"
  );

  const emptyState = document.getElementById(
    "Message-model-chat-empty"
  );

  const emptyAvatar = document.getElementById(
    "Message-model-chat-empty-avatar"
  );

  const emptyName = document.getElementById(
    "Message-model-chat-empty-name"
  );

  const emptyDescription = document.getElementById(
    "Message-model-chat-empty-description"
  );

  /* =======================================================
     STATE
  ======================================================= */

  let currentChatUser = null;
  let currentMessages = [];
  let isSending = false;
  let loadGeneration = 0;
  let unsubscribeRealtime = null;

  const DEFAULT_AVATAR =
    "/SSVG/account/account-edit-button.svg";

  const CHAT_TYPES = {
    friend: {
      status: "Friend",
      emptyDescription: "Start a conversation"
    },

    group: {
      status: "Group conversation",
      emptyDescription: "Start a conversation with the group"
    },

    customer_service: {
      status: "Customer service",
      emptyDescription: "How can we help you?"
    }
  };

  /* =======================================================
     HELPERS
  ======================================================= */

  function normalizeType(type) {
    const value = String(type || "friend")
      .trim()
      .toLowerCase()
      .replace(/[\s-]+/g, "_");

    if (
      value === "group" ||
      value === "groups"
    ) {
      return "group";
    }

    if (
      value === "customer_service" ||
      value === "customer" ||
      value === "support" ||
      value === "service"
    ) {
      return "customer_service";
    }

    return "friend";
  }

  function normalizeUser(user) {
    if (!user || typeof user !== "object") {
      return null;
    }

    const type = normalizeType(user.type);

    const id =
      user.id ||
      user.user_id ||
      user.group_id ||
      user.conversation_id ||
      null;

    if (!id) {
      console.error(
        "U9 Chat: A chat target ID is required.",
        user
      );

      return null;
    }

    const config = CHAT_TYPES[type];

    return {
      id: String(id),
      name: String(
        user.name ||
        user.username ||
        user.group_name ||
        (type === "customer_service"
          ? "Customer Service"
          : type === "group"
            ? "Group"
            : "User")
      ),
      avatar: String(user.avatar || DEFAULT_AVATAR),
      type: type,
      status: String(user.status || config.status),
      conversationId: user.conversationId ||
        user.conversation_id ||
        null,
      metadata: user.metadata || null
    };
  }

  function setImageSource(img, src) {
    if (!img) return;

    img.onerror = function () {
      img.onerror = null;
      img.src = DEFAULT_AVATAR;
    };

    img.src = src || DEFAULT_AVATAR;
  }

  function getAdapter() {
    return window.U9ChatAdapter || null;
  }

  function dispatchChatEvent(name, detail) {
    window.dispatchEvent(
      new CustomEvent(name, {
        detail: detail || {}
      })
    );
  }

  function getEmptyDescription(user) {
    if (!user) {
      return "Start a conversation";
    }

    const config = CHAT_TYPES[user.type];

    return config.emptyDescription;
  }

  function scrollToBottom() {
    if (!chatMessages) return;

    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function setSendingState(sending) {
    isSending = sending;

    if (chatSend) {
      chatSend.disabled = sending;
    }

    if (chatInput) {
      chatInput.disabled = sending;
    }

    if (chatForm) {
      chatForm.setAttribute(
        "aria-busy",
        sending ? "true" : "false"
      );
    }
  }

  /* =======================================================
     HEADER
  ======================================================= */

  function updateChatHeader(user) {
    if (!user) return;

    setImageSource(chatAvatar, user.avatar);
    setImageSource(emptyAvatar, user.avatar);

    if (chatName) {
      chatName.textContent = user.name;
    }

    if (chatStatus) {
      chatStatus.textContent = user.status;
    }

    if (emptyName) {
      emptyName.textContent = user.name;
    }

    if (emptyDescription) {
      emptyDescription.textContent =
        getEmptyDescription(user);
    }

    if (chatPage) {
      chatPage.dataset.chatType = user.type;
      chatPage.dataset.chatTargetId = user.id;
    }
  }

  /* =======================================================
     EMPTY STATE
  ======================================================= */

  function updateEmptyState() {
    if (!chatMessages || !emptyState) {
      return;
    }

    const hasMessages = currentMessages.length > 0;

    emptyState.hidden = hasMessages;

    if (hasMessages) {
      chatMessages.style.alignItems = "stretch";
    } else {
      chatMessages.style.alignItems = "stretch";
    }
  }

  /* =======================================================
     MESSAGE NORMALIZATION
  ======================================================= */

  function normalizeMessage(message) {
    if (!message || typeof message !== "object") {
      return null;
    }

    const text = String(
      message.text ??
      message.content ??
      message.message ??
      ""
    );

    if (!text.trim()) {
      return null;
    }

    return {
      id: String(
        message.id ||
        message.message_id ||
        (
          "local-" +
          Date.now() +
          "-" +
          Math.random().toString(36).slice(2)
        )
      ),

      text: text,

      senderId: String(
        message.senderId ??
        message.sender_id ??
        ""
      ),

      senderName: String(
        message.senderName ??
        message.sender_name ??
        message.username ??
        ""
      ),

      senderAvatar: String(
        message.senderAvatar ??
        message.sender_avatar ??
        DEFAULT_AVATAR
      ),

      createdAt:
        message.createdAt ||
        message.created_at ||
        new Date().toISOString(),

      status: message.status || "sent"
    };
  }

  function isOwnMessage(message) {
    const myId =
      window.currentUserUUID ||
      window.currentUserId ||
      null;

    return Boolean(
      myId &&
      message.senderId &&
      String(myId) === String(message.senderId)
    );
  }

  /* =======================================================
     RENDER MESSAGE
     Use textContent to avoid rendering message text as HTML.
  ======================================================= */

  function createMessageElement(message) {
    const own = isOwnMessage(message);

    const row = document.createElement("div");
    row.className =
      "chat-message-row " +
      (own ? "is-own" : "is-other");

    row.dataset.messageId = message.id;

    if (!own) {
      const avatar = document.createElement("img");
      avatar.className = "chat-message-avatar";
      avatar.alt = "";
      setImageSource(
        avatar,
        message.senderAvatar ||
          (currentChatUser && currentChatUser.avatar) ||
          DEFAULT_AVATAR
      );

      row.appendChild(avatar);
    }

    const content = document.createElement("div");
    content.className = "chat-message-content";

    if (!own && message.senderName) {
      const sender = document.createElement("div");
      sender.className = "chat-message-sender";
      sender.textContent = message.senderName;
      content.appendChild(sender);
    }

    const bubble = document.createElement("div");
    bubble.className = "chat-message-bubble";
    bubble.textContent = message.text;

    content.appendChild(bubble);

    const time = document.createElement("div");
    time.className = "chat-message-time";
    time.textContent = formatMessageTime(message.createdAt);

    content.appendChild(time);
    row.appendChild(content);

    if (own) {
      const avatar = document.createElement("img");
      avatar.className = "chat-message-avatar";
      avatar.alt = "";
      setImageSource(
        avatar,
        window.currentUserAvatar || DEFAULT_AVATAR
      );

      row.appendChild(avatar);
    }

    return row;
  }

  function formatMessageTime(value) {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  function renderMessages(messages, options) {
    if (!chatMessages || !emptyState) {
      return;
    }

    const settings = options || {};
    const shouldScroll = settings.scroll !== false;

    currentMessages = (Array.isArray(messages) ? messages : [])
      .map(normalizeMessage)
      .filter(Boolean);

    /*
      Rebuild the message list without deleting the empty-state
      container, which is also used for the no-message view.
    */
    chatMessages.replaceChildren(emptyState);

    currentMessages.forEach(function (message) {
      chatMessages.appendChild(
        createMessageElement(message)
      );
    });

    updateEmptyState();

    if (shouldScroll) {
      requestAnimationFrame(scrollToBottom);
    }
  }

  /* =======================================================
     PUBLIC: REPLACE MESSAGE LIST
  ======================================================= */

  function setChatMessages(messages) {
    renderMessages(messages);
  }

  /* =======================================================
     PUBLIC: ADD A SINGLE MESSAGE
  ======================================================= */

  function addChatMessage(message) {
    const normalized = normalizeMessage(message);

    if (!normalized) return;

    const exists = currentMessages.some(function (item) {
      return item.id === normalized.id;
    });

    if (exists) return;

    currentMessages.push(normalized);
    renderMessages(currentMessages);
  }

  /* =======================================================
     LOAD MESSAGE HISTORY
     
     Adapter contract:
     U9ChatAdapter.loadMessages(target)
       -> Promise<Array<Message>>
  ======================================================= */

  async function loadChatMessages(user) {
    const generation = ++loadGeneration;
    currentMessages = [];
    renderMessages([]);

    const adapter = getAdapter();

    if (
      !adapter ||
      typeof adapter.loadMessages !== "function"
    ) {
      /*
        UI-only mode. No backend has been configured yet.
      */
      dispatchChatEvent("u9:chat:load-required", {
        target: user
      });

      return;
    }

    try {
      const result = await adapter.loadMessages(user);

      if (
        generation !== loadGeneration ||
        !currentChatUser ||
        currentChatUser.id !== user.id ||
        currentChatUser.type !== user.type
      ) {
        return;
      }

      renderMessages(Array.isArray(result) ? result : []);

    } catch (error) {
      console.error(
        "U9 Chat: Failed to load message history.",
        error
      );

      dispatchChatEvent("u9:chat:load-error", {
        target: user,
        error: error
      });
    }
  }

  /* =======================================================
     REALTIME SUBSCRIPTION

     Adapter contract:
     U9ChatAdapter.subscribe(target, onMessage)
       -> optional unsubscribe function
  ======================================================= */

  function stopRealtimeSubscription() {
    if (typeof unsubscribeRealtime === "function") {
      try {
        unsubscribeRealtime();
      } catch (error) {
        console.warn(
          "U9 Chat: Failed to stop realtime subscription.",
          error
        );
      }
    }

    unsubscribeRealtime = null;
  }

  function startRealtimeSubscription(user) {
    stopRealtimeSubscription();

    const adapter = getAdapter();

    if (
      !adapter ||
      typeof adapter.subscribe !== "function"
    ) {
      return;
    }

    try {
      const unsubscribe = adapter.subscribe(
        user,
        function (message) {
          if (
            !currentChatUser ||
            currentChatUser.id !== user.id ||
            currentChatUser.type !== user.type
          ) {
            return;
          }

          addChatMessage(message);
        }
      );

      if (typeof unsubscribe === "function") {
        unsubscribeRealtime = unsubscribe;
      }
    } catch (error) {
      console.error(
        "U9 Chat: Failed to subscribe to realtime messages.",
        error
      );
    }
  }

  /* =======================================================
     INITIALIZE CHAT PAGE
     Called by normal-message.js:
       window.initializeChatPage(user)
  ======================================================= */

  async function initializeChatPage(userData) {
    const user = normalizeUser(userData);

    if (!user) {
      return false;
    }

    stopRealtimeSubscription();
    currentChatUser = user;
    currentMessages = [];

    updateChatHeader(user);
    renderMessages([]);

    if (chatInput) {
      chatInput.value = "";
      chatInput.placeholder =
        user.type === "customer_service"
          ? "Message customer service..."
          : user.type === "group"
            ? "Message the group..."
            : "Type a message...";
    }

    if (chatPage) {
      chatPage.classList.add("is-active");
      chatPage.hidden = false;
      chatPage.setAttribute("aria-hidden", "false");
    }

    if (chatInput) {
      chatInput.disabled = false;
    }

    if (chatSend) {
      chatSend.disabled = false;
    }

    dispatchChatEvent("u9:chat:opened", {
      target: user
    });

    await loadChatMessages(user);

    if (
      currentChatUser &&
      currentChatUser.id === user.id &&
      currentChatUser.type === user.type
    ) {
      startRealtimeSubscription(user);
    }

    return true;
  }

  /* =======================================================
     SEND MESSAGE
     
     Adapter contract:
     U9ChatAdapter.sendMessage(target, payload)
       -> Promise<Message>
     
     Do not display a message as successfully sent unless the
     adapter confirms success.
  ======================================================= */

  async function sendChatMessage(text) {
    if (!currentChatUser || isSending) {
      return false;
    }

    const messageText = String(text || "").trim();

    if (!messageText) {
      return false;
    }

    const adapter = getAdapter();

    if (
      !adapter ||
      typeof adapter.sendMessage !== "function"
    ) {
      dispatchChatEvent("u9:chat:send-required", {
        target: currentChatUser,
        text: messageText
      });

      showChatNotice(
        "Messaging is not connected to the server yet."
      );

      return false;
    }

    setSendingState(true);

    try {
      const sentMessage = await adapter.sendMessage(
        currentChatUser,
        {
          text: messageText
        }
      );

      if (!sentMessage) {
        throw new Error(
          "The server did not confirm the message."
        );
      }

      addChatMessage(sentMessage);

      dispatchChatEvent("u9:chat:message-sent", {
        target: currentChatUser,
        message: sentMessage
      });

      return true;

    } catch (error) {
      console.error(
        "U9 Chat: Failed to send message.",
        error
      );

      dispatchChatEvent("u9:chat:send-error", {
        target: currentChatUser,
        text: messageText,
        error: error
      });

      showChatNotice(
        "Message failed to send. Please try again."
      );

      return false;

    } finally {
      setSendingState(false);

      if (chatInput) {
        chatInput.focus();
      }
    }
  }

  /* =======================================================
     SMALL NOTICE
  ======================================================= */

  function showChatNotice(message) {
    if (!chatMessages) return;

    let notice = document.getElementById(
      "Message-model-chat-notice"
    );

    if (!notice) {
      notice = document.createElement("div");
      notice.id = "Message-model-chat-notice";

      Object.assign(notice.style, {
        flex: "0 0 auto",
        margin: "0 0 12px",
        padding: "10px 12px",
        color: "#8b5b13",
        background: "#fff4d9",
        borderRadius: "8px",
        fontSize: "12px",
        lineHeight: "1.5",
        overflowWrap: "anywhere"
      });

      chatMessages.appendChild(notice);
    }

    notice.textContent = message;
    notice.hidden = false;
  }

  /* =======================================================
     FORM EVENTS
  ======================================================= */

  if (chatForm) {
    chatForm.addEventListener("submit", async function (event) {
      event.preventDefault();

      if (!chatInput || isSending) {
        return;
      }

      const text = chatInput.value.trim();

      if (!text) return;

      const success = await sendChatMessage(text);

      if (success && chatInput) {
        chatInput.value = "";
      }
    });
  }

  /* =======================================================
     MORE OPTIONS
     Dispatch an event so a menu can be added later.
  ======================================================= */

  if (chatMore) {
    chatMore.addEventListener("click", function () {
      if (!currentChatUser) return;

      dispatchChatEvent("u9:chat:more", {
        target: currentChatUser
      });
    });
  }

  /* =======================================================
     CLEANUP
  ======================================================= */

  function closeChatPage() {
    loadGeneration += 1;
    stopRealtimeSubscription();

    currentChatUser = null;
    currentMessages = [];

    if (chatPage) {
      chatPage.classList.remove("is-active");
      chatPage.hidden = true;
      chatPage.setAttribute("aria-hidden", "true");
      delete chatPage.dataset.chatType;
      delete chatPage.dataset.chatTargetId;
    }
  }

  /* =======================================================
     PUBLIC API
  ======================================================= */

  window.initializeChatPage = initializeChatPage;
  window.renderChatMessages = setChatMessages;
  window.addChatMessage = addChatMessage;
  window.sendChatMessage = sendChatMessage;
  window.closeChatPage = closeChatPage;

  window.getCurrentChatTarget = function () {
    return currentChatUser
      ? { ...currentChatUser }
      : null;
  };

  window.getCurrentChatMessages = function () {
    return currentMessages.map(function (message) {
      return { ...message };
    });
  };

  /* =======================================================
     INITIAL PAGE STATE
  ======================================================= */

  if (chatPage) {
    chatPage.classList.remove("is-active");
    chatPage.hidden = true;
    chatPage.setAttribute("aria-hidden", "true");
  }

  if (chatMessages && emptyState) {
    renderMessages([]);
  }

  console.log("U9 Chat Page initialized.");
})();
