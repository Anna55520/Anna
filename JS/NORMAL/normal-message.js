
/* =================================================
   MESSAGE NORMAL MODAL
================================================= */

(function () {
  "use strict";


  /* =================================================
     ELEMENTS
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

  const messageModalClose = document.getElementById(
    "U9-message-normal-modal-close"
  );

  const messageNavigation = document.getElementById(
    "Message-model-navigation"
  );

  const messagePagesContainer = document.getElementById(
    "Message-model-pages"
  );

  const chatPage = document.getElementById(
    "Message-model-chat-page"
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


  /* =================================================
     CHAT ELEMENTS
  ================================================= */

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

  const chatMessages = document.getElementById(
    "Message-model-chat-messages"
  );

  const chatForm = document.getElementById(
    "Message-model-chat-form"
  );

  const chatInput = document.getElementById(
    "Message-model-chat-input"
  );


  /* =================================================
     STATE

     null = Message home
     page key = an internal page
     "chat" = chat page
  ================================================= */

  let currentMessagePage = null;

  let currentChatUser = null;

  let closeAnimationTimer = null;


  /* =================================================
     GET PAGE ELEMENTS
  ================================================= */

  function getMessagePageElements() {
    const elements = {};

    Object.keys(messagePageConfig).forEach(
      function (pageKey) {
        const config = messagePageConfig[pageKey];

        elements[pageKey] = {
          button: document.getElementById(
            config.buttonId
          ),

          page: document.getElementById(
            config.pageId
          )
        };
      }
    );

    return elements;
  }


  /* =================================================
     SET HEADER TITLE
  ================================================= */

  function setMessageHeader(isInnerPage) {
    if (!messageModalTitle || !messageModalClose) {
      return;
    }

    /*
     * Change only the title text node.
     * Do not replace the close/back button.
     */

    const titleTextNode = Array.from(
      messageModalTitle.childNodes
    ).find(function (node) {
      return (
        node.nodeType === Node.TEXT_NODE &&
        node.textContent.trim() !== ""
      );
    });

    let title = "Message";

    if (
      isInnerPage &&
      messagePageConfig[currentMessagePage]
    ) {
      title =
        messagePageConfig[currentMessagePage].title;
    } else if (
      isInnerPage &&
      currentMessagePage === "chat"
    ) {
      title = chatName
        ? chatName.textContent.trim() || "Chat"
        : "Chat";
    }

    if (titleTextNode) {
      titleTextNode.textContent = " " + title + " ";
    }

    if (isInnerPage) {
      messageModalClose.textContent = "←";

      messageModalClose.setAttribute(
        "aria-label",
        "Back to Message"
      );

      messageModalClose.classList.add(
        "message-back-button"
      );
    } else {
      messageModalClose.textContent = "×";

      messageModalClose.setAttribute(
        "aria-label",
        "Close Message"
      );

      messageModalClose.classList.remove(
        "message-back-button"
      );
    }
  }


  /* =================================================
     HIDE ALL INTERNAL PAGES
  ================================================= */

  function hideAllMessagePages() {
    const pageElements = getMessagePageElements();

    Object.keys(pageElements).forEach(
      function (pageKey) {
        const page = pageElements[pageKey].page;

        if (!page) {
          return;
        }

        page.classList.remove("active");
        page.hidden = true;

        page.setAttribute(
          "aria-hidden",
          "true"
        );
      }
    );

    if (chatPage) {
      chatPage.classList.remove("active");
      chatPage.hidden = true;

      chatPage.setAttribute(
        "aria-hidden",
        "true"
      );
    }
  }


  /* =================================================
     MESSAGE HOME

     Show the four navigation cards.
  ================================================= */

  function showMessageHome() {
    if (!messageModalContent) {
      console.warn(
        "Message Modal content element is missing."
      );

      return false;
    }

    currentMessagePage = null;

    /*
     * Show home layout.
     */

    messageModalContent.classList.add(
      "message-home"
    );

    messageModalContent.classList.remove(
      "message-inner-page"
    );

    /*
     * Remove all active navigation states.
     */

    const pageElements = getMessagePageElements();

    Object.keys(pageElements).forEach(
      function (pageKey) {
        const button = pageElements[pageKey].button;

        if (!button) {
          return;
        }

        button.classList.remove("active");

        button.setAttribute(
          "aria-selected",
          "false"
        );
      }
    );

    /*
     * Hide all pages, including Chat.
     */

    hideAllMessagePages();

    /*
     * Restore the Message title and close button.
     */

    setMessageHeader(false);

    return true;
  }


  /* =================================================
     INITIALIZE INNER PAGE
  ================================================= */

  function initializeInnerPage(pageKey) {
    const config = messagePageConfig[pageKey];

    if (!config || !config.initializer) {
      return;
    }

    const initializer = window[config.initializer];

    if (typeof initializer !== "function") {
      /*
       * The corresponding page JS may not have
       * been loaded yet. This is not fatal.
       */

      return;
    }

    try {
      initializer();
    } catch (error) {
      console.error(
        "Failed to initialize Message page:",
        pageKey,
        error
      );
    }
  }


  /* =================================================
     SWITCH MESSAGE PAGE

     Called when one of the four cards is clicked.
  ================================================= */

  function switchMessagePage(pageKey) {
    const config = messagePageConfig[pageKey];

    if (!config) {
      console.warn(
        "Unknown Message page:",
        pageKey
      );

      return false;
    }

    const pageElements = getMessagePageElements();
    const targetElements = pageElements[pageKey];

    if (
      !targetElements ||
      !targetElements.button ||
      !targetElements.page
    ) {
      console.warn(
        "Message page elements are missing:",
        pageKey
      );

      return false;
    }

    currentMessagePage = pageKey;

    /*
     * Switch from home layout to inner-page layout.
     */

    if (messageModalContent) {
      messageModalContent.classList.remove(
        "message-home"
      );

      messageModalContent.classList.add(
        "message-inner-page"
      );
    }

    /*
     * Update navigation button states.
     */

    Object.keys(pageElements).forEach(
      function (key) {
        const button = pageElements[key].button;

        if (!button) {
          return;
        }

        const isActive = key === pageKey;

        button.classList.toggle(
          "active",
          isActive
        );

        button.setAttribute(
          "aria-selected",
          String(isActive)
        );
      }
    );

    /*
     * Hide all pages first.
     */

    hideAllMessagePages();

    /*
     * Display the selected page.
     */

    targetElements.page.hidden = false;

    targetElements.page.classList.add("active");

    targetElements.page.setAttribute(
      "aria-hidden",
      "false"
    );

    /*
     * Update header title and back button.
     */

    setMessageHeader(true);

    /*
     * Initialize the page if its JS is available.
     */

    initializeInnerPage(pageKey);

    return true;
  }


  /* =================================================
     OPEN CHAT PAGE

     Example:
     openMessageChat({
       id: "friend-uuid",
       name: "Anna",
       avatar: "/path/to/avatar.png"
     });
  ================================================= */

  function openMessageChat(user) {
    if (!chatPage || !messageModalContent) {
      console.warn(
        "Message Chat page is missing."
      );

      return false;
    }

    if (!user || typeof user !== "object") {
      console.warn(
        "A chat user object is required."
      );

      return false;
    }

    /*
     * Remember the current conversation partner.
     */

    currentChatUser = {
      id: user.id || null,
      name: user.name || "Chat",
      avatar: user.avatar || null,
      status: user.status || "Conversation",
      type: user.type || "friend"
    };

    /*
     * Set chat header information.
     */

    if (chatName) {
      chatName.textContent = currentChatUser.name;
    }

    if (chatStatus) {
      chatStatus.textContent = currentChatUser.status;
    }

    if (chatAvatar && currentChatUser.avatar) {
      chatAvatar.src = currentChatUser.avatar;
    }

    /*
     * Show the inner-page layout.
     */

    currentMessagePage = "chat";

    messageModalContent.classList.remove(
      "message-home"
    );

    messageModalContent.classList.add(
      "message-inner-page"
    );

    /*
     * Clear navigation selection because Chat
     * is not one of the four navigation cards.
     */

    const pageElements = getMessagePageElements();

    Object.keys(pageElements).forEach(
      function (pageKey) {
        const button = pageElements[pageKey].button;

        if (!button) {
          return;
        }

        button.classList.remove("active");

        button.setAttribute(
          "aria-selected",
          "false"
        );
      }
    );

    /*
     * Hide all normal pages.
     */

    hideAllMessagePages();

    /*
     * Show Chat.
     */

    chatPage.hidden = false;

    chatPage.classList.add("active");

    chatPage.setAttribute(
      "aria-hidden",
      "false"
    );

    /*
     * The top button becomes a back button.
     */

    setMessageHeader(true);

    /*
     * Call an optional Chat page initializer.
     */

    if (
      typeof window.initializeChatPage === "function"
    ) {
      try {
        window.initializeChatPage(currentChatUser);
      } catch (error) {
        console.error(
          "Failed to initialize Chat page:",
          error
        );
      }
    }

    return true;
  }


  /* =================================================
     CLOSE CHAT AND RETURN TO PREVIOUS MESSAGE PAGE
  ================================================= */

  function closeMessageChat() {
    /*
     * If Chat was opened from Friend, return to Friend.
     * Otherwise return to the four-card home.
     */

    const previousPage = window.messageChatReturnPage;

    window.messageChatReturnPage = null;

    if (
      previousPage &&
      messagePageConfig[previousPage]
    ) {
      return switchMessagePage(previousPage);
    }

    return showMessageHome();
  }


  /* =================================================
     HEADER BUTTON ACTION

     Inner page: return to home.
     Home: close the entire modal.
  ================================================= */

  function handleMessageHeaderButton() {
    if (currentMessagePage !== null) {
      showMessageHome();
      return;
    }

    if (window.U9WindowManager) {
      window.U9WindowManager.close("message");
    } else {
      closeMessageModal();
    }
  }


  /* =================================================
     OPEN MESSAGE MODAL
  ================================================= */

  function openMessageModal() {
    if (!messageModal || !messageModalContent) {
      console.warn(
        "Message Modal elements are missing."
      );

      return false;
    }

    /*
     * Clear any pending closing animation.
     */

    if (closeAnimationTimer !== null) {
      clearTimeout(closeAnimationTimer);
      closeAnimationTimer = null;
    }

    messageModal.classList.remove(
      "modal-closing"
    );

    /*
     * Each opening starts at the four-card home.
     */

    showMessageHome();

    messageModal.classList.add(
      "modal-open"
    );

    return true;
  }


  /* =================================================
     CLOSE MESSAGE MODAL
  ================================================= */

  function closeMessageModal() {
    if (!messageModal || !messageModalContent) {
      return false;
    }

    /*
     * Already closed or closing.
     */

    if (
      !messageModal.classList.contains("modal-open")
    ) {
      return true;
    }

    messageModal.classList.remove(
      "modal-open"
    );

    messageModal.classList.add(
      "modal-closing"
    );

    /*
     * Clear a previous fallback timer.
     */

    if (closeAnimationTimer !== null) {
      clearTimeout(closeAnimationTimer);
    }

    function finishClose() {
      if (
        !messageModal.classList.contains(
          "modal-closing"
        )
      ) {
        return;
      }

      messageModal.classList.remove(
        "modal-closing"
      );

      messageModalContent.removeEventListener(
        "transitionend",
        handleCloseAnimation
      );

      if (closeAnimationTimer !== null) {
        clearTimeout(closeAnimationTimer);
        closeAnimationTimer = null;
      }
    }

    function handleCloseAnimation(event) {
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
      handleCloseAnimation
    );

    /*
     * Fallback if transitionend does not fire.
     */

    closeAnimationTimer = setTimeout(
      finishClose,
      700
    );

    return true;
  }


  /* =================================================
     INITIALIZE NAVIGATION EVENTS
  ================================================= */

  function initializeMessageNavigation() {
    if (
      !messageNavigation ||
      !messagePagesContainer
    ) {
      console.warn(
        "Message navigation or pages container is missing."
      );

      return false;
    }

    const pageElements = getMessagePageElements();

    /*
     * Bind the four navigation buttons.
     */

    Object.keys(pageElements).forEach(
      function (pageKey) {
        const button = pageElements[pageKey].button;

        if (!button) {
          console.warn(
            "Message navigation button is missing:",
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

        button.addEventListener(
          "click",
          function () {
            switchMessagePage(pageKey);
          }
        );
      }
    );

    /*
     * Bind the top close/back button.
     */

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
     * Bind the Chat back button.
     */

    if (
      chatBackButton &&
      chatBackButton.dataset.messageChatBackBound !== "true"
    ) {
      chatBackButton.dataset.messageChatBackBound = "true";

      chatBackButton.addEventListener(
        "click",
        closeMessageChat
      );
    }

    /*
     * Initial state: show the four cards only.
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
        "U9WindowManager is not available when Message Modal was initialized."
      );

      return false;
    }

    window.U9WindowManager.register(
      "message",
      {
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
      }
    );

    return true;
  }


  /* =================================================
     GLOBAL FUNCTIONS
  ================================================= */

  window.openMessageModal = openMessageModal;

  window.closeMessageModal = closeMessageModal;

  window.showMessageHome = showMessageHome;

  window.switchMessagePage = switchMessagePage;

  window.openMessageChat = openMessageChat;

  window.closeMessageChat = closeMessageChat;


  /* =================================================
     INITIALIZE
  ================================================= */

  function initializeMessageModal() {
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
