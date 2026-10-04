
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
   OPEN GIFT MODAL
========================= */

function openGiftModal() {

  if (
    !giftModal ||
    !giftModalContent
  ) {

    return false;

  }


  giftModal.classList.remove(
    "modal-closing"
  );


  giftModal.classList.add(
    "modal-open"
  );


  return true;

}


/* =========================
   CLOSE GIFT MODAL
========================= */

function closeGiftModal() {

  if (
    !giftModal ||
    !giftModalContent
  ) {

    return false;

  }


  if (
    !giftModal.classList.contains(
      "modal-open"
    )
  ) {

    return true;

  }


  giftModal.classList.remove(
    "modal-open"
  );


  giftModal.classList.add(
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


    giftModal.classList.remove(
      "modal-closing"
    );


    giftModalContent.removeEventListener(
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


  giftModalContent.addEventListener(
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
    "gift",
    {

      open:
        openGiftModal,

      close:
        closeGiftModal,

      isOpen:
        function () {

          if (
            !giftModal
          ) {

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

      }

      else {

        closeGiftModal();

      }

    }
  );

}
