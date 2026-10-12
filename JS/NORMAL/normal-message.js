
/* =================================================
   U9 MESSAGE NORMAL MODAL
   File: JS/NORMAL/normal-message.js

   Responsibilities:
   - Open and close Message modal
   - Navigate between Message pages
   - Open Chat page
   - Manage Message header and back navigation
   - Pass the selected user to chat.js

   Chat UI and message operations belong in:
   JS/NORMAL/MESSAGE/chat.js
================================================= */

(function () {
  "use strict";

  /* =================================================
     MODAL ELEMENTS
  ================================================= */

  const messageModal = document.getElementById(
    "U9-message-normal-modal"
  );

  const messageModalContent = document.getElementById(
    "U9-message-normal-modal-content"
  );

  const messageModalTitle = document.getElementById(
    "U9-message-normal-modal-title"
  );

  const messageModalTitleText = document.getElementById(
    "U9-message-normal-modal-title-text"
  );

  const messageModalClose = document.getElementById(
    "U9-message-normal-modal-close"
  );

  const messageNavigation = document.getElementById(
    "Message-model-navigation"
  );

  const messagePagesContainer = document.getElementById(
    "Message-model-pages"
  );

  /* =================================================
     PAGE CONFIGURATION
  ================================================= */

  const messagePageConfig = {
    "friends": {
      buttonId: "Message-model-friends-button",
      pageId: "Message-model-friends-page",
      title: "Friend",
      initializer: "initializeFriendsPage"
    },

    "add-friends": {
      buttonId: "Message-model-add-friends-button",
      pageId: "Message-model-add-friends-page",
      title: "Add Friend",
      initializer: "initializeAddFriendsPage"
    },

    "group": {
      buttonId: "Message-model-group-button",
      pageId: "Message-model-group-page",
      title: "Group",
      initializer: "initializeGroupPage"
    },

    "customer-service": {
      buttonId: "Message-model-customer-service-button",
      pageId: "Message-model-customer-service-page",
      title: "Customer Service",
      initializer: "initializeCustomerServicePage"
    }
  };

  const BACK_ICON_URL = "/SSVG/account/back.svg";

  /* =================================================
     STATE

     null  = Message home
     key   = normal inner page
     chat  = Chat page
  ================================================= */

  let currentMessagePage = null;
  let currentChatUser = null;
  let closeAnimationTimer = null;
  let messageInitialized = false;

  /* =================================================
     PAGE ELEMENTS
  ================================================= */

  function getMessagePageElements() {
    const elements = {};

    Object.keys(messagePageConfig).forEach(function (key) {
      const config = messagePageConfig[key];

      elements[key] = {
        button: document.getElementById(config.buttonId),
        page: document.getElementById(config.pageId)
      };
    });

    return elements;
  }

  function getChatPage() {
    return document.getElementById(
      "Message-model-chat-page"
    );
  }

  function getMessageHome() {
    return document.getElementById(
      "Message-model-home"
    );
  }

  /* =================================================
     HEADER TITLE
  ================================================= */

  function getMessageHeaderTitle() {
    if (currentMessagePage === "chat") {
      return (
        currentChatUser?.name ||
        "Chat"
      );
    }

    if (
      currentMessagePage &&
      messagePageConfig[currentMessagePage]
    ) {
      return messagePageConfig[currentMessagePage].title;
    }

    return "Message";
  }

  function setMessageHeader(isInnerPage) {
    if (!messageModalTitle || !messageModalClose) {
      return;
    }

    const title = getMessageHeaderTitle();

    /*
     * Prefer the dedicated title span in the updated HTML.
     * Keep a fallback for older HTML structures.
     */
    if (messageModalTitleText) {
      messageModalTitleText.textContent = title;
    } else {
      const existingTitleText = Array.from(
        messageModalTitle.childNodes
      ).find(function (node) {
        return (
          node.nodeType === Node.TEXT_NODE &&
          node.textContent.trim() !== ""
        );
      });

      if (existingTitleText) {
        existingTitleText.textContent = " " + title + " ";
      }
    }

    if (isInnerPage) {
      messageModalClose.classList.remove(
        "message-home-close"
      );

      messageModalClose.classList.add(
        "message-back-button"
      );

      messageModalClose.replaceChildren();

      const backIcon = document.createElement("img");
      backIcon.src = BACK_ICON_URL;
      backIcon.alt = "";
      backIcon.setAttribute("aria-hidden", "true");

      messageModalClose.appendChild(backIcon);

      messageModalClose.setAttribute(
        "aria-label",
        "Back"
      );

      messageModalClose.setAttribute(
        "title",
        "Back"
      );
    } else {
      messageModalClose.classList.remove(
        "message-back-button"
      );

      messageModalClose.classList.add(
        "message-home-close"
      );

      messageModalClose.replaceChildren();
      messageModalClose.textContent = "×";

      messageModalClose.setAttribute(
        "aria-label",
        "Close Message"
      );

      messageModalClose.setAttribute(
        "title",
        "Close"
      );
    }
  }

  /* =================================================
     HIDE ALL PAGES
  ================================================= */

  function hideAllMessagePages() {
    const pageElements = getMessagePageElements();

    Object.keys(pageElements).forEach(function (key) {
      const page = pageElements[key].page;

      if (!page) return;

      page.classList.remove("active");
      page.hidden = true;
      page.setAttribute("aria-hidden", "true");
    });

    const chatPage = getChatPage();

    if (chatPage) {
      chatPage.classList.remove("active");
      chatPage.hidden = true;
      chatPage.setAttribute("aria-hidden", "true");
    }
  }

  /* =================================================
     NAVIGATION SELECTION
  ================================================= */

  function clearNavigationSelection() {
    const pageElements = getMessagePageElements();

    Object.keys(pageElements).forEach(function (key) {
      const button = pageElements[key].button;

      if (!button) return;

      button.classList.remove("active");
      button.setAttribute("aria-selected", "false");
    });
  }

  /* =================================================
     MESSAGE HOME
  ================================================= */

  function showMessageHome() {
    if (!messageModalContent) {
      return false;
    }

    currentMessagePage = null;
    currentChatUser = null;

    messageModalContent.classList.add("message-home");
    messageModalContent.classList.remove("message-inner-page");

    clearNavigationSelection();
    hideAllMessagePages();
    setMessageHeader(false);

    return true;
  }

  /* =================================================
     INITIALIZE NORMAL PAGE
  ================================================= */

  function initializeInnerPage(pageKey) {
    const config = messagePageConfig[pageKey];

    if (!config || !config.initializer) {
      return;
    }

    const initializer = window[config.initializer];

    if (typeof initializer !== "function") {
      return;
    }

    try {
      initializer();
    } catch (error) {
      console.error(
        "U9 Message: Page initialization failed:",
        pageKey,
        error
      );
    }
  }

  /* =================================================
     SWITCH NORMAL PAGE
  ================================================= */

  function switchMessagePage(pageKey) {
    const config = messagePageConfig[pageKey];

    if (!config) {
      console.warn(
        "U9 Message: Unknown page:",
        pageKey
      );
      return false;
    }

    if (!messageModalContent) {
      console.warn(
        "U9 Message: Modal content is missing."
      );
      return false;
    }

    const elements = getMessagePageElements();
    const target = elements[pageKey];

    if (!target || !target.button || !target.page) {
      console.warn(
        "U9 Message: Page elements are missing:",
        pageKey
      );
      return false;
    }

    currentMessagePage = pageKey;
    currentChatUser = null;

    messageModalContent.classList.remove("message-home");
    messageModalContent.classList.add("message-inner-page");

    clearNavigationSelection();
    hideAllMessagePages();

    target.button.classList.add("active");
    target.button.setAttribute("aria-selected", "true");

    target.page.hidden = false;
    target.page.classList.add("active");
    target.page.setAttribute("aria-hidden", "false");

    setMessageHeader(true);
    initializeInnerPage(pageKey);

    return true;
  }

  /* =================================================
     OPEN CHAT PAGE

     Chat UI and message operations belong in chat.js.
  ================================================= */

  function openMessageChat(user) {
    const chatPage = getChatPage();

    if (!chatPage || !messageModalContent) {
      console.warn(
        "U9 Message: #Message-model-chat-page was not found."
      );
      return false;
    }

    if (!user || typeof user !== "object" || !user.id) {
      console.warn(
        "U9 Message: A valid chat user is required."
      );
      return false;
    }

    /*
     * Remember the page that opened the chat.
     * Chat header back will return to this page.
     */
    if (currentMessagePage !== "chat") {
      window.messageChatReturnPage =
        currentMessagePage &&
        messagePageConfig[currentMessagePage]
          ? currentMessagePage
          : null;
    }

    currentChatUser = {
      id: String(user.id),
      name: user.name || "User",
      avatar: user.avatar || "",
      status: user.status || "Friend",
      type: user.type || "friend"
    };

    currentMessagePage = "chat";

    messageModalContent.classList.remove("message-home");
    messageModalContent.classList.add("message-inner-page");

    clearNavigationSelection();
    hideAllMessagePages();

    chatPage.hidden = false;
    chatPage.classList.add("active");
    chatPage.setAttribute("aria-hidden", "false");

    setMessageHeader(true);

    /*
     * chat.js owns the conversation UI and data.
     */
    if (typeof window.initializeChatPage === "function") {
      try {
        window.initializeChatPage({
          ...currentChatUser
        });
      } catch (error) {
        console.error(
          "U9 Message: Chat initialization failed.",
          error
        );
      }
    } else {
      console.warn(
        "U9 Message: chat.js has not registered initializeChatPage()."
      );
    }

    return true;
  }

  /* =================================================
     CLOSE CHAT PAGE

     Can be called by chat.js if needed.
     The visible header back button also uses this logic.
  ================================================= */

  function closeMessageChat() {
    const returnPage = window.messageChatReturnPage;

    window.messageChatReturnPage = null;
    currentChatUser = null;

    if (
      returnPage &&
      messagePageConfig[returnPage]
    ) {
      return switchMessagePage(returnPage);
    }

    return showMessageHome();
  }

  /* =================================================
     HEADER BUTTON

     Home:
       Close the Message modal.

     Inner page:
       Go back to Message home.

     Chat page:
       Return to the page that opened Chat, if known.
  ================================================= */

  function handleMessageHeaderButton() {
    if (currentMessagePage === "chat") {
      closeMessageChat();
      return;
    }

    if (currentMessagePage !== null) {
      showMessageHome();
      return;
    }

    if (
      window.U9WindowManager &&
      typeof window.U9WindowManager.close === "function"
    ) {
      window.U9WindowManager.close("message");
    } else {
      closeMessageModal();
    }
  }

  /* =================================================
     OPEN MODAL
  ================================================= */

  function openMessageModal() {
    if (!messageModal || !messageModalContent) {
      console.warn(
        "U9 Message: Modal elements are missing."
      );
      return false;
    }

    if (closeAnimationTimer !== null) {
      clearTimeout(closeAnimationTimer);
      closeAnimationTimer = null;
    }

    messageModal.classList.remove("modal-closing");

    showMessageHome();
    messageModal.classList.add("modal-open");

    return true;
  }

  /* =================================================
     CLOSE MODAL
  ================================================= */

  function closeMessageModal() {
    if (!messageModal || !messageModalContent) {
      return false;
    }

    if (!messageModal.classList.contains("modal-open")) {
      return true;
    }

    messageModal.classList.remove("modal-open");
    messageModal.classList.add("modal-closing");

    if (closeAnimationTimer !== null) {
      clearTimeout(closeAnimationTimer);
      closeAnimationTimer = null;
    }

    function finishClose() {
      if (!messageModal.classList.contains("modal-closing")) {
        return;
      }

      messageModal.classList.remove("modal-closing");

      messageModalContent.removeEventListener(
        "transitionend",
        handleCloseTransition
      );

      if (closeAnimationTimer !== null) {
        clearTimeout(closeAnimationTimer);
        closeAnimationTimer = null;
      }
    }

    function handleCloseTransition(event) {
      if (
        event.target !== messageModalContent ||
        event.propertyName !== "transform"
      ) {
        return;
      }

      finishClose();
    }

    messageModalContent.addEventListener(
      "transitionend",
      handleCloseTransition
    );

    closeAnimationTimer = setTimeout(
      finishClose,
      700
    );

    return true;
  }

  /* =================================================
     NAVIGATION EVENTS
  ================================================= */

  function initializeMessageNavigation() {
    if (!messageNavigation || !messagePagesContainer) {
      console.warn(
        "U9 Message: Navigation or page container is missing."
      );
      return false;
    }

    const elements = getMessagePageElements();

    Object.keys(elements).forEach(function (pageKey) {
      const button = elements[pageKey].button;

      if (!button) {
        console.warn(
          "U9 Message: Navigation button is missing:",
          pageKey
        );
        return;
      }

      if (
        button.dataset.messageNavigationBound === "true"
      ) {
        return;
      }

      button.dataset.messageNavigationBound = "true";

      button.addEventListener("click", function () {
        switchMessagePage(pageKey);
      });
    });

    if (
      messageModalClose &&
      messageModalClose.dataset.messageCloseBound !== "true"
    ) {
      messageModalClose.dataset.messageCloseBound = "true";

      messageModalClose.addEventListener(
        "click",
        handleMessageHeaderButton
      );
    }

    /*
     * The Chat page no longer needs its own back button.
     * The main Message header handles all back navigation.
     */

    showMessageHome();

    return true;
  }

  /* =================================================
     WINDOW MANAGER
  ================================================= */

  function registerMessageWindowManager() {
    if (
      !window.U9WindowManager ||
      typeof window.U9WindowManager.register !== "function"
    ) {
      console.warn(
        "U9 Message: U9WindowManager is not available yet."
      );
      return false;
    }

    window.U9WindowManager.register("message", {
      open: openMessageModal,
      close: closeMessageModal,

      isOpen: function () {
        if (!messageModal) {
          return false;
        }

        return (
          messageModal.classList.contains("modal-open") ||
          messageModal.classList.contains("modal-closing")
        );
      }
    });

    return true;
  }

  /* =================================================
     PUBLIC API
  ================================================= */

  window.openMessageModal = openMessageModal;
  window.closeMessageModal = closeMessageModal;
  window.showMessageHome = showMessageHome;
  window.switchMessagePage = switchMessagePage;
  window.openMessageChat = openMessageChat;
  window.closeMessageChat = closeMessageChat;

  window.getCurrentMessageChatUser = function () {
    return currentChatUser
      ? { ...currentChatUser }
      : null;
  };

  window.getCurrentMessagePage = function () {
    return currentMessagePage;
  };

  /* =================================================
     INITIALIZE
  ================================================= */

  function initializeMessageModal() {
    if (messageInitialized) {
      return;
    }

    messageInitialized = true;

    initializeMessageNavigation();
    registerMessageWindowManager();
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initializeMessageModal,
      { once: true }
    );
  } else {
    initializeMessageModal();
  }

})();
