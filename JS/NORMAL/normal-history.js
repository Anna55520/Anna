/* =========================
   HISTORY NORMAL MODAL
========================= */


/* =========================
   ELEMENTS
========================= */

const historyModal =
  document.getElementById(
    "U9-history-normal-modal"
  );


const historyModalContent =
  document.getElementById(
    "U9-history-normal-modal-content"
  );


const historyModalClose =
  document.getElementById(
    "U9-history-normal-modal-close"
  );


/* =========================
   PAGE SCROLL LOCK
========================= */

function lockHistoryPageScroll() {

  document.documentElement.style.overflow =
    "hidden";

  document.body.style.overflow =
    "hidden";

}


function unlockHistoryPageScroll() {

  document.documentElement.style.overflow =
    "";

  document.body.style.overflow =
    "";

}


/* =========================
   OPEN HISTORY MODAL
========================= */

function openHistoryModal() {

  historyModal.classList.remove(
    "modal-closing"
  );


  historyModal.classList.add(
    "modal-open"
  );


  lockHistoryPageScroll();

}


/* =========================
   CLOSE HISTORY MODAL
========================= */

function closeHistoryModal() {


  if (
    !historyModal.classList.contains(
      "modal-open"
    )
  ) {

    return;

  }


  historyModal.classList.remove(
    "modal-open"
  );


  historyModal.classList.add(
    "modal-closing"
  );


  historyModalContent.addEventListener(
    "transitionend",
    function handleCloseAnimation(event) {


      if (
        event.propertyName !==
        "transform"
      ) {

        return;

      }


      historyModal.classList.remove(
        "modal-closing"
      );


      unlockHistoryPageScroll();


      historyModalContent.removeEventListener(
        "transitionend",
        handleCloseAnimation
      );

    }
  );

}


/* =========================
   OPEN FUNCTION
========================= */

window.openHistoryModal =
  openHistoryModal;


/* =========================
   CLOSE FUNCTION
========================= */

window.closeHistoryModal =
  closeHistoryModal;


/* =========================
   CLOSE BUTTON
========================= */

if (
  historyModalClose
) {

  historyModalClose.addEventListener(
    "click",
    function () {

      closeHistoryModal();

    }
  );

}