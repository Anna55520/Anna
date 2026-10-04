/* =========================
   INBOX NORMAL MODAL
========================= */


/* =========================
   ELEMENTS
========================= */

const inboxModal =
  document.getElementById(
    "U9-inbox-normal-modal"
  );


const inboxModalContent =
  document.getElementById(
    "U9-inbox-normal-modal-content"
  );


const inboxModalClose =
  document.getElementById(
    "U9-inbox-normal-modal-close"
  );


/* =========================
   PAGE SCROLL LOCK
========================= */

function lockInboxPageScroll() {

  document.documentElement.style.overflow =
    "hidden";

  document.body.style.overflow =
    "hidden";

}


function unlockInboxPageScroll() {

  document.documentElement.style.overflow =
    "";

  document.body.style.overflow =
    "";

}


/* =========================
   OPEN INBOX MODAL
========================= */

function openInboxModal() {

  if (!inboxModal) {

    return false;

  }


  /* REMOVE CLOSING */

  inboxModal.classList.remove(
    "modal-closing"
  );


  /* OPEN */

  inboxModal.classList.add(
    "modal-open"
  );


  /* LOCK PAGE SCROLL */

  lockInboxPageScroll();


  return true;

}


/* =========================
   CLOSE INBOX MODAL
========================= */

function closeInboxModal() {

  if (!inboxModal) {

    return false;

  }


  /* ALREADY CLOSED */

  if (
    !inboxModal.classList.contains(
      "modal-open"
    )
  ) {

    return false;

  }


  /* REMOVE OPEN */

  inboxModal.classList.remove(
    "modal-open"
  );


  /* START CLOSING */

  inboxModal.classList.add(
    "modal-closing"
  );


  let finished = false;


  function finishClose() {

    if (finished) {

      return;

    }


    finished = true;


    inboxModal.classList.remove(
      "modal-closing"
    );


    unlockInboxPageScroll();


    if (inboxModalContent) {

      inboxModalContent.removeEventListener(
        "transitionend",
        handleCloseAnimation
      );

    }

  }


  function handleCloseAnimation(event) {

    if (
      event.propertyName !==
      "transform"
    ) {

      return;

    }


    finishClose();

  }


  if (inboxModalContent) {

    inboxModalContent.addEventListener(
      "transitionend",
      handleCloseAnimation
    );

  }


  /* FALLBACK */

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
    "inbox",
    {

      open:
        openInboxModal,

      close:
        closeInboxModal,

      isOpen:
        function () {

          if (!inboxModal) {

            return false;

          }


          return (
            inboxModal.classList.contains(
              "modal-open"
            ) ||
            inboxModal.classList.contains(
              "modal-closing"
            )
          );

        }

    }
  );

}


/* =========================
   GLOBAL FUNCTIONS
========================= */

window.openInboxModal =
  openInboxModal;


window.closeInboxModal =
  closeInboxModal;


/* =========================
   CLOSE BUTTON
========================= */

if (
  inboxModalClose
) {

  inboxModalClose.addEventListener(
    "click",
    function () {

      if (
        window.U9WindowManager
      ) {

        window.U9WindowManager.close(
          "inbox"
        );

      } else {

        closeInboxModal();

      }

    }
  );

}
