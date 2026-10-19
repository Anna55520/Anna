
/* =========================================================
   U9 INBOX NORMAL MODAL
   Fullscreen Modal / Window Manager Integration
========================================================= */

(function () {
  "use strict";

  /* =======================================================
     ELEMENTS
  ======================================================= */

  const inboxModal = document.getElementById(
    "U9-inbox-normal-modal"
  );

  const inboxModalContent = document.getElementById(
    "U9-inbox-normal-modal-content"
  );

  const inboxModalClose = document.getElementById(
    "U9-inbox-normal-modal-close"
  );

  /* =======================================================
     OPEN INBOX MODAL
  ======================================================= */

  function openInboxModal() {
    if (!inboxModal || !inboxModalContent) {
      return false;
    }

    inboxModal.classList.remove("modal-closing");

    inboxModal.classList.add("modal-open");

    return true;
  }

  /* =======================================================
     CLOSE INBOX MODAL
  ======================================================= */

  function closeInboxModal() {
    if (!inboxModal || !inboxModalContent) {
      return false;
    }

    if (!inboxModal.classList.contains("modal-open")) {
      return true;
    }

    inboxModal.classList.remove("modal-open");

    inboxModal.classList.add("modal-closing");

    let finished = false;
    let fallbackTimer = null;

    function finishClose() {
      if (finished) {
        return;
      }

      finished = true;

      if (fallbackTimer !== null) {
        clearTimeout(fallbackTimer);
      }

      inboxModalContent.removeEventListener(
        "transitionend",
        handleCloseAnimation
      );

      inboxModal.classList.remove("modal-closing");
    }

    function handleCloseAnimation(event) {
      if (event.target !== inboxModalContent) {
        return;
      }

      if (event.propertyName !== "transform") {
        return;
      }

      finishClose();
    }

    inboxModalContent.addEventListener(
      "transitionend",
      handleCloseAnimation
    );

    fallbackTimer = setTimeout(finishClose, 700);

    return true;
  }

  /* =======================================================
     WINDOW MANAGER
  ======================================================= */

  if (
    window.U9WindowManager &&
    typeof window.U9WindowManager.register === "function"
  ) {
    window.U9WindowManager.register("inbox", {
      open: openInboxModal,

      close: closeInboxModal,

      isOpen: function () {
        if (!inboxModal) {
          return false;
        }

        return (
          inboxModal.classList.contains("modal-open") ||
          inboxModal.classList.contains("modal-closing")
        );
      }
    });
  }

  /* =======================================================
     GLOBAL FUNCTIONS
  ======================================================= */

  window.openInboxModal = openInboxModal;

  window.closeInboxModal = closeInboxModal;

  /* =======================================================
     CLOSE BUTTON
  ======================================================= */

  if (inboxModalClose) {
    inboxModalClose.addEventListener("click", function () {
      if (
        window.U9WindowManager &&
        typeof window.U9WindowManager.close === "function"
      ) {
        window.U9WindowManager.close("inbox");
      } else {
        closeInboxModal();
      }
    });
  }
})();
