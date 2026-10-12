
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


  let closeFinished =
    false;


  function finishClose() {

    if (
      closeFinished
    ) {

      return;

    }


    closeFinished =
      true;


    messageModal.classList.remove(
      "modal-closing"
    );


    messageModalContent.removeEventListener(
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
   WINDOW MANAGER
========================= */

if (
  window.U9WindowManager
) {

  U9WindowManager.register(
    "message",
    {

      open:
        openMessageModal,

      close:
        closeMessageModal,

      isOpen:
        function () {

          if (
            !messageModal
          ) {

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

}

else {

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


/* =========================
   CLOSE BUTTON
========================= */

if (
  messageModalClose
) {

  messageModalClose.addEventListener(
    "click",
    function () {

      if (
        window.U9WindowManager
      ) {

        U9WindowManager.close(
          "message"
        );

      }

      else {

        closeMessageModal();

      }

    }
  );

}
