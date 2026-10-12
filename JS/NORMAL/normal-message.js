
/* =========================
   MESSAGE NORMAL MODAL
========================= */


/* =========================
   ELEMENTS
========================= */

const messageModal =
  document.getElementById(
    "U9-message-normal-modal"
  );

const messageModalContent =
  document.getElementById(
    "U9-message-normal-modal-content"
  );

const messageModalClose =
  document.getElementById(
    "U9-message-normal-modal-close"
  );


/* =========================
   MESSAGE MODEL NAVIGATION
========================= */

const messageNavigation =
  document.getElementById(
    "Message-model-navigation"
  );

const messagePagesContainer =
  document.getElementById(
    "Message-model-pages"
  );


/* =========================
   PAGE CONFIGURATION
========================= */

const messagePageConfig = {
  "friends": {
    buttonId:
      "Message-model-friends-button",

    pageId:
      "Message-model-friends-page"
  },

  "add-friends": {
    buttonId:
      "Message-model-add-friends-button",

    pageId:
      "Message-model-add-friends-page"
  },

  "group": {
    buttonId:
      "Message-model-group-button",

    pageId:
      "Message-model-group-page"
  },

  "customer-service": {
    buttonId:
      "Message-model-customer-service-button",

    pageId:
      "Message-model-customer-service-page"
  }
};


/* =========================
   GET PAGE ELEMENTS
========================= */

function getMessagePageElements() {
  const elements = {};

  Object.keys(messagePageConfig).forEach(
    function (pageKey) {
      const config =
        messagePageConfig[pageKey];

      elements[pageKey] = {
        button:
          document.getElementById(
            config.buttonId
          ),

        page:
          document.getElementById(
            config.pageId
          )
      };
    }
  );

  return elements;
}


/* =========================
   SWITCH MESSAGE PAGE
========================= */

function switchMessagePage(pageKey) {
  const config =
    messagePageConfig[pageKey];

  if (!config) {
    console.warn(
      "Unknown Message page:",
      pageKey
    );

    return false;
  }

  const pageElements =
    getMessagePageElements();

  const targetElements =
    pageElements[pageKey];

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

  /*
   * Update all navigation buttons
   */

  Object.keys(pageElements).forEach(
    function (key) {
      const elements =
        pageElements[key];

      if (!elements.button) {
        return;
      }

      const isActive =
        key === pageKey;

      elements.button.classList.toggle(
        "active",
        isActive
      );

      elements.button.setAttribute(
        "aria-selected",
        String(isActive)
      );
    }
  );

  /*
   * Update all internal pages
   */

  Object.keys(pageElements).forEach(
    function (key) {
      const elements =
        pageElements[key];

      if (!elements.page) {
        return;
      }

      const isActive =
        key === pageKey;

      elements.page.classList.toggle(
        "active",
        isActive
      );

      elements.page.hidden =
        !isActive;

      elements.page.setAttribute(
        "aria-hidden",
        String(!isActive)
      );
    }
  );

  /*
   * Save the current page in memory
   */

  currentMessagePage =
    pageKey;

  return true;
}


/* =========================
   CURRENT MESSAGE PAGE
========================= */

let currentMessagePage =
  "friends";


/* =========================
   INITIALIZE MESSAGE NAVIGATION
========================= */

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

  const pageElements =
    getMessagePageElements();

  /*
   * Check whether at least one page exists
   */

  const hasPage =
    Object.keys(pageElements).some(
      function (key) {
        return Boolean(
          pageElements[key].page
        );
      }
    );

  if (!hasPage) {
    console.warn(
      "No Message internal pages were found."
    );

    return false;
  }

  /*
   * Bind navigation buttons
   */

  Object.keys(pageElements).forEach(
    function (pageKey) {
      const button =
        pageElements[pageKey].button;

      if (!button) {
        console.warn(
          "Message navigation button is missing:",
          pageKey
        );

        return;
      }

      /*
       * Prevent duplicate event registration
       */

      if (
        button.dataset.messageNavigationBound ===
        "true"
      ) {
        return;
      }

      button.dataset.messageNavigationBound =
        "true";

      button.addEventListener(
        "click",
        function () {
          switchMessagePage(
            pageKey
          );
        }
      );
    }
  );

  /*
   * Restore the default page.
   * Use Friends as the initial page.
   */

  const initialPage =
    pageElements[currentMessagePage] &&
    pageElements[currentMessagePage].page
      ? currentMessagePage
      : "friends";

  if (
    pageElements[initialPage] &&
    pageElements[initialPage].page
  ) {
    switchMessagePage(
      initialPage
    );
  } else {
    /*
     * If Friends is unavailable,
     * activate the first existing page.
     */

    const firstAvailablePage =
      Object.keys(pageElements).find(
        function (key) {
          return Boolean(
            pageElements[key].page
          );
        }
      );

    if (firstAvailablePage) {
      switchMessagePage(
        firstAvailablePage
      );
    }
  }

  return true;
}


/* =========================
   OPEN MESSAGE MODAL
========================= */

function openMessageModal() {
  if (
    !messageModal ||
    !messageModalContent
  ) {
    console.warn(
      "Message Modal elements are missing."
    );

    return false;
  }

  messageModal.classList.remove(
    "modal-closing"
  );

  messageModal.classList.add(
    "modal-open"
  );

  return true;
}


/* =========================
   CLOSE MESSAGE MODAL
========================= */

function closeMessageModal() {
  if (
    !messageModal ||
    !messageModalContent
  ) {
    return false;
  }

  /*
   * Already closed or closing
   */

  if (
    !messageModal.classList.contains(
      "modal-open"
    )
  ) {
    return true;
  }

  messageModal.classList.remove(
    "modal-open"
  );

  messageModal.classList.add(
    "modal-closing"
  );

  let closeFinished = false;

  function finishClose() {
    if (closeFinished) {
      return;
    }

    closeFinished = true;

    messageModal.classList.remove(
      "modal-closing"
    );

    messageModalContent.removeEventListener(
      "transitionend",
      handleCloseAnimation
    );
  }

  function handleCloseAnimation(event) {
    if (
      event.target !==
        messageModalContent ||
      event.propertyName !==
        "transform"
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
   * Fallback in case transitionend
   * does not fire.
   */

  setTimeout(
    finishClose,
    700
  );

  return true;
}


/* =========================
   WINDOW MANAGER
========================= */

if (
  window.U9WindowManager
) {
  window.U9WindowManager.register(
    "message",
    {
      open:
        openMessageModal,

      close:
        closeMessageModal,

      isOpen:
        function () {
          if (!messageModal) {
            return false;
          }

          return (
            messageModal.classList.contains(
              "modal-open"
            ) ||

            messageModal.classList.contains(
              "modal-closing"
            )
          );
        }
    }
  );
} else {
  console.warn(
    "U9WindowManager is not available when Message Modal was initialized."
  );
}


/* =========================
   GLOBAL FUNCTIONS
========================= */

window.openMessageModal =
  openMessageModal;

window.closeMessageModal =
  closeMessageModal;

window.switchMessagePage =
  switchMessagePage;


/* =========================
   CLOSE BUTTON
========================= */

if (messageModalClose) {
  messageModalClose.addEventListener(
    "click",
    function () {
      if (
        window.U9WindowManager
      ) {
        window.U9WindowManager.close(
          "message"
        );
      } else {
        closeMessageModal();
      }
    }
  );
}


/* =========================
   INITIALIZE
========================= */

if (
  document.readyState ===
  "loading"
) {
  document.addEventListener(
    "DOMContentLoaded",
    initializeMessageNavigation,
    { once: true }
  );
} else {
  initializeMessageNavigation();
}
