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

}


/* =========================
   CLOSE MESSAGE MODAL
========================= */

function closeMessageModal() {


  /* ALREADY CLOSED */

  if (
    !messageModal.classList.contains(
      "modal-open"
    )
  ) {

    return;

  }


  /* REMOVE OPEN */

  messageModal.classList.remove(
    "modal-open"
  );


  /* START CLOSING */

  messageModal.classList.add(
    "modal-closing"
  );


  /* WAIT FOR ANIMATION */

  messageModalContent.addEventListener(
    "transitionend",
    function handleCloseAnimation(event) {


      /* ONLY TRANSFORM */

      if (
        event.propertyName !==
        "transform"
      ) {

        return;

      }


      /* REMOVE CLOSING */

      messageModal.classList.remove(
        "modal-closing"
      );


      /* UNLOCK PAGE SCROLL */

      unlockMessagePageScroll();


      /* REMOVE EVENT */

      messageModalContent.removeEventListener(
        "transitionend",
        handleCloseAnimation
      );

    }
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

      closeMessageModal();

    }
  );

}