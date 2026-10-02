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

}


/* =========================
   CLOSE INBOX MODAL
========================= */

function closeInboxModal() {


  /* ALREADY CLOSED */

  if (
    !inboxModal.classList.contains(
      "modal-open"
    )
  ) {

    return;

  }


  /* REMOVE OPEN */

  inboxModal.classList.remove(
    "modal-open"
  );


  /* START CLOSING */

  inboxModal.classList.add(
    "modal-closing"
  );


  /* WAIT FOR TRANSITION */

  inboxModalContent.addEventListener(
    "transitionend",
    function handleCloseAnimation(event) {


      if (
        event.propertyName !==
        "transform"
      ) {

        return;

      }


      inboxModal.classList.remove(
        "modal-closing"
      );


      unlockInboxPageScroll();


      inboxModalContent.removeEventListener(
        "transitionend",
        handleCloseAnimation
      );

    }
  );

}


/* =========================
   OPEN FUNCTION
========================= */

window.openInboxModal =
  openInboxModal;


/* =========================
   CLOSE FUNCTION
========================= */

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

      closeInboxModal();

    }
  );

}