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
   PAGE SCROLL LOCK
========================= */

function lockMessagePageScroll() {

  document.documentElement.style.overflow =
    "hidden";


  document.body.style.overflow =
    "hidden";

}


function unlockMessagePageScroll() {

  document.documentElement.style.overflow =
    "";


  document.body.style.overflow =
    "";

}


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


  /* =========================
     REMOVE CLOSING
  ========================= */

  messageModal.classList.remove(
    "modal-closing"
  );


  /* =========================
     OPEN
  ========================= */

  messageModal.classList.add(
    "modal-open"
  );


  /* =========================
     LOCK PAGE SCROLL
  ========================= */

  lockMessagePageScroll();


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


  /* =========================
     ALREADY CLOSED
  ========================= */

  if (
    !messageModal.classList.contains(
      "modal-open"
    )
  ) {

    /*
       If it is already closing,
       let the existing animation
       continue.
    */

    return true;

  }


  /* =========================
     REMOVE OPEN
  ========================= */

  messageModal.classList.remove(
    "modal-open"
  );


  /* =========================
     START CLOSING
  ========================= */

  messageModal.classList.add(
    "modal-closing"
  );


  /* =========================
     CLOSE STATE
  ========================= */

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


    /* =========================
       REMOVE CLOSING
    ========================= */

    messageModal.classList.remove(
      "modal-closing"
    );


    /* =========================
       UNLOCK PAGE SCROLL
    ========================= */

    unlockMessagePageScroll();


    /* =========================
       REMOVE EVENT
    ========================= */

    messageModalContent.removeEventListener(
      "transitionend",
      handleCloseAnimation
    );

  }


  function handleCloseAnimation(
    event
  ) {

    /* =========================
       ONLY TRANSFORM
    ========================= */

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


  /* =========================
     SAFETY FALLBACK
  ========================= */

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

      /* =========================
         OPEN
      ========================= */

      open:
        openMessageModal,


      /* =========================
         CLOSE
      ========================= */

      close:
        closeMessageModal,


      /* =========================
         IS OPEN
      ========================= */

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
   OPEN FUNCTION
========================= */

window.openMessageModal =
  openMessageModal;


/* =========================
   CLOSE FUNCTION
========================= */

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

      /*
         Close through the
         Window Manager when
         available.

         This keeps the manager's
         currentWindow state
         synchronized.
      */

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
