/* =========================
   GIFT NORMAL MODAL
========================= */


/* =========================
   ELEMENTS
========================= */

const giftModal =
  document.getElementById(
    "U9-gift-normal-modal"
  );


const giftModalContent =
  document.getElementById(
    "U9-gift-normal-modal-content"
  );


const giftModalClose =
  document.getElementById(
    "U9-gift-normal-modal-close"
  );


/* =========================
   PAGE SCROLL LOCK
========================= */

function lockGiftPageScroll() {

  document.documentElement.style.overflow =
    "hidden";

  document.body.style.overflow =
    "hidden";

}


function unlockGiftPageScroll() {

  document.documentElement.style.overflow =
    "";

  document.body.style.overflow =
    "";

}


/* =========================
   OPEN GIFT MODAL
========================= */

function openGiftModal() {

  if (!giftModal) {

    return false;

  }


  /* REMOVE CLOSING */

  giftModal.classList.remove(
    "modal-closing"
  );


  /* OPEN */

  giftModal.classList.add(
    "modal-open"
  );


  /* LOCK PAGE SCROLL */

  lockGiftPageScroll();


  return true;

}


/* =========================
   CLOSE GIFT MODAL
========================= */

function closeGiftModal() {

  if (!giftModal) {

    return false;

  }


  /* ALREADY CLOSED */

  if (
    !giftModal.classList.contains(
      "modal-open"
    )
  ) {

    return false;

  }


  /* REMOVE OPEN */

  giftModal.classList.remove(
    "modal-open"
  );


  /* START CLOSING */

  giftModal.classList.add(
    "modal-closing"
  );


  let finished = false;


  function finishClose() {

    if (finished) {

      return;

    }


    finished = true;


    giftModal.classList.remove(
      "modal-closing"
    );


    unlockGiftPageScroll();


    if (giftModalContent) {

      giftModalContent.removeEventListener(
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


  if (giftModalContent) {

    giftModalContent.addEventListener(
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
    "gift",
    {

      open:
        openGiftModal,

      close:
        closeGiftModal,

      isOpen:
        function () {

          if (!giftModal) {

            return false;

          }


          return (
            giftModal.classList.contains(
              "modal-open"
            ) ||
            giftModal.classList.contains(
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

window.openGiftModal =
  openGiftModal;


window.closeGiftModal =
  closeGiftModal;


/* =========================
   CLOSE BUTTON
========================= */

if (
  giftModalClose
) {

  giftModalClose.addEventListener(
    "click",
    function () {

      if (
        window.U9WindowManager
      ) {

        window.U9WindowManager.close(
          "gift"
        );

      } else {

        closeGiftModal();

      }

    }
  );

}
