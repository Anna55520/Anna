
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
   OPEN INBOX MODAL
========================= */

function openInboxModal() {

  if (
    !inboxModal ||
    !inboxModalContent
  ) {

    return false;

  }


  inboxModal.classList.remove(
    "modal-closing"
  );


  inboxModal.classList.add(
    "modal-open"
  );


  return true;

}


/* =========================
   CLOSE INBOX MODAL
========================= */

function closeInboxModal() {

  if (
    !inboxModal ||
    !inboxModalContent
  ) {

    return false;

  }


  if (
    !inboxModal.classList.contains(
      "modal-open"
    )
  ) {

    return true;

  }


  inboxModal.classList.remove(
    "modal-open"
  );


  inboxModal.classList.add(
    "modal-closing"
  );


  let finished =
    false;


  function finishClose() {

    if (
      finished
    ) {

      return;

    }


    finished =
      true;


    inboxModal.classList.remove(
      "modal-closing"
    );


    inboxModalContent.removeEventListener(
      "transitionend",
      handleCloseAnimation
    );

  }


  function handleCloseAnimation(
    event
  ) {

    if (
      event.propertyName !==
      "transform"
    ) {

      return;

    }


    finishClose();

  }


  inboxModalContent.addEventListener(
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

          if (
            !inboxModal
          ) {

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

      }

      else {

        closeInboxModal();

      }

    }
  );

}
