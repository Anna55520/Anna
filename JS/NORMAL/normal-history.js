/* =========================
   HISTORY NORMAL MODAL
========================= */

(function () {
  "use strict";

  /* =========================
     ELEMENTS
  ========================= */

  const historyModal = document.getElementById(
    "U9-history-normal-modal"
  );

  const historyModalContent = document.getElementById(
    "U9-history-normal-modal-content"
  );

  const historyModalClose = document.getElementById(
    "U9-history-normal-modal-close"
  );

  const historyPageButtons = document.querySelectorAll(
    ".History-model-nav-button"
  );

  const historyPages = {
    shop: document.getElementById(
      "History-model-shop-Page"
    ),

    save: document.getElementById(
      "History-model-Save-Page"
    ),

    order: document.getElementById(
      "History-model-Order-Page"
    )
  };

  let currentHistoryPage = "shop";


  /* =========================
     SWITCH HISTORY PAGE
  ========================= */

  function showHistoryPage(pageName) {
    const targetPage = historyPages[pageName];

    if (!targetPage) {
      console.error(
        "U9 History: Invalid page:",
        pageName
      );

      return false;
    }

    currentHistoryPage = pageName;

    Object.keys(historyPages).forEach(function (key) {
      const page = historyPages[key];

      if (!page) {
        return;
      }

      const isActive = key === pageName;

      page.hidden = !isActive;
      page.setAttribute(
        "aria-hidden",
        String(!isActive)
      );
    });

    historyPageButtons.forEach(function (button) {
      const isActive =
        button.dataset.historyPage === pageName;

      button.classList.toggle(
        "active",
        isActive
      );

      button.setAttribute(
        "aria-current",
        isActive ? "page" : "false"
      );
    });

    return true;
  }


  /* =========================
     OPEN HISTORY MODAL
  ========================= */

  function openHistoryModal() {
    if (
      !historyModal ||
      !historyModalContent
    ) {
      return false;
    }

    historyModal.classList.remove(
      "modal-closing"
    );

    /*
     * If no page is selected, show Shop Page.
     * Do not reset an already selected page.
     */
    showHistoryPage(currentHistoryPage);

    historyModal.classList.add(
      "modal-open"
    );

    return true;
  }


  /* =========================
     CLOSE HISTORY MODAL
  ========================= */

  function closeHistoryModal() {
    if (
      !historyModal ||
      !historyModalContent
    ) {
      return false;
    }

    if (
      !historyModal.classList.contains(
        "modal-open"
      )
    ) {
      return true;
    }

    historyModal.classList.remove(
      "modal-open"
    );

    historyModal.classList.add(
      "modal-closing"
    );

    let finished = false;

    function finishClose() {
      if (finished) {
        return;
      }

      finished = true;

      historyModal.classList.remove(
        "modal-closing"
      );

      historyModalContent.removeEventListener(
        "transitionend",
        handleCloseAnimation
      );
    }

    function handleCloseAnimation(event) {
      if (
        event.target !== historyModalContent ||
        event.propertyName !== "transform"
      ) {
        return;
      }

      finishClose();
    }

    historyModalContent.addEventListener(
      "transitionend",
      handleCloseAnimation
    );

    setTimeout(
      finishClose,
      700
    );

    return true;
  }


  /* =========================
     PAGE BUTTON EVENTS
  ========================= */

  historyPageButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      const pageName =
        button.dataset.historyPage;

      showHistoryPage(pageName);
    });
  });


  /* =========================
     WINDOW MANAGER
  ========================= */

  if (
    window.U9WindowManager
  ) {
    window.U9WindowManager.register(
      "history",
      {
        open: openHistoryModal,

        close: closeHistoryModal,

        isOpen: function () {
          if (!historyModal) {
            return false;
          }

          return (
            historyModal.classList.contains(
              "modal-open"
            ) ||
            historyModal.classList.contains(
              "modal-closing"
            )
          );
        }
      }
    );
  }


  /* =========================
     PUBLIC API
  ========================= */

  window.openHistoryModal = openHistoryModal;

  window.closeHistoryModal = closeHistoryModal;

  window.U9History = {
    openPage: async function (pageName) {
      if (!historyPages[pageName]) {
        console.error(
          "U9 History: Cannot open unknown page:",
          pageName
        );

        return false;
      }

      /*
       * Select the requested page before opening
       * so the correct page appears immediately.
       */
      if (!showHistoryPage(pageName)) {
        return false;
      }

      const manager = window.U9WindowManager;

      if (
        manager &&
        typeof manager.open === "function"
      ) {
        await manager.open("history");
      } else {
        openHistoryModal();
      }

      return true;
    },

    showPage: showHistoryPage,

    getCurrentPage: function () {
      return currentHistoryPage;
    }
  };


  /* =========================
     CLOSE BUTTON
  ========================= */

  if (historyModalClose) {
    historyModalClose.addEventListener(
      "click",
      function () {
        if (window.U9WindowManager) {
          window.U9WindowManager.close("history");
        } else {
          closeHistoryModal();
        }
      }
    );
  }


  /* =========================
     INITIAL PAGE
  ========================= */

  showHistoryPage("shop");

})();
