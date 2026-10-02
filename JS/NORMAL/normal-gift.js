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

  giftModal.classList.remove(
    "modal-closing"
  );


  giftModal.classList.add(
    "modal-open"
  );


  lockGiftPageScroll();

}


/* =========================
   CLOSE GIFT MODAL
========================= */

function closeGiftModal() {


  if (
    !giftModal.classList.contains(
      "modal-open"
    )
  ) {

    return;

  }


  giftModal.classList.remove(
    "modal-open"
  );


  giftModal.classList.add(
    "modal-closing"
  );


  giftModalContent.addEventListener(
    "transitionend",
    function handleCloseAnimation(event) {


      if (
        event.propertyName !==
        "transform"
      ) {

        return;

      }


      giftModal.classList.remove(
        "modal-closing"
      );


      unlockGiftPageScroll();


      giftModalContent.removeEventListener(
        "transitionend",
        handleCloseAnimation
      );

    }
  );

}


/* =========================
   OPEN FUNCTION
========================= */

window.openGiftModal =
  openGiftModal;


/* =========================
   CLOSE FUNCTION
========================= */

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

      closeGiftModal();

    }
  );

}