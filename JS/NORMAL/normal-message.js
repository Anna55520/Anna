
/* =========================
   MESSAGE NORMAL MODAL
========================= */


/* =========================
   ELEMENTS
========================= */

const messageModal =
  document.getElementById(
    "Message-model-modal"
  );

const messageModalContent =
  document.getElementById(
    "Message-model-modal-content"
  );

const messageModalClose =
  document.getElementById(
    "Message-model-close"
  );

const messageNavigation =
  document.getElementById(
    "Message-model-navigation"
  );

const messagePages =
  document.querySelectorAll(
    "#Message-model-pages .Message-model-page"
  );


/* =========================
   OPEN MESSAGE MODAL
========================= */

function openMessageModal() {

  if (
    !messageModal ||
    !messageModalContent
  ) {
    return false;
  }

  messageModal.classList.remove(
    "Message-model-closing"
  );

  messageModal.classList.add(
    "Message-model-open"
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

  if (
    !messageModal.classList.contains(
      "Message-model-open"
    )
  ) {
    return true;
  }

  messageModal.classList.remove(
    "Message-model-open"
  );

  messageModal.classList.add(
    "Message-model-closing"
  );

  let closeFinished = false;

  function finishClose() {

    if (closeFinished) {
      return;
    }

    closeFinished = true;

    messageModal.classList.remove(
      "Message-model-closing"
    );

    messageModalContent.removeEventListener(
      "transitionend",
      handleCloseAnimation
    );

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

  setTimeout(
    finishClose,
    700
  );

  return true;
}


/* =========================
   SWITCH MESSAGE PAGE
========================= */

function switchMessagePage(pageName) {

  if (
    !messageNavigation ||
    !messagePages.length
  ) {
    console.warn(
      "Message navigation or pages not found."
    );

    return false;
  }

  const targetPage =
    document.getElementById(
      "Message-model-" + pageName + "-page"
    );

  if (
    !targetPage ||
    !targetPage.classList.contains(
      "Message-model-page"
    )
  ) {
    console.warn(
      "Message page not found:",
      pageName
    );

    return false;
  }


  /* UPDATE NAVIGATION BUTTONS */

  const navigationButtons =
    messageNavigation.querySelectorAll(
      ".Message-model-nav-button"
    );

  navigationButtons.forEach(function (button) {

    const isActive =
      button.dataset.page === pageName;

    button.classList.toggle(
      "active",
      isActive
    );

    button.setAttribute(
      "aria-pressed",
      String(isActive)
    );

  });


  /* UPDATE PAGES */

  messagePages.forEach(function (page) {

    page.classList.toggle(
      "active",
      page === targetPage
    );

  });

  return true;
}


/* =========================
   NAVIGATION CLICK EVENTS
========================= */

if (messageNavigation) {

  messageNavigation.addEventListener(
    "click",
    function (event) {

      const button =
        event.target.closest(
          ".Message-model-nav-button"
        );

      if (
        !button ||
        !messageNavigation.contains(button)
      ) {
        return;
      }

      const pageName =
        button.dataset.page;

      if (!pageName) {
        return;
      }

      switchMessagePage(pageName);

    }
  );

}


/* =========================
   WINDOW MANAGER
========================= */

if (window.U9WindowManager) {

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
          messageModal.classList.contains(
            "Message-model-open"
          ) ||

          messageModal.classList.contains(
            "Message-model-closing"
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

      if (window.U9WindowManager) {

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
   DEFAULT PAGE
========================= */

switchMessagePage("friend");
