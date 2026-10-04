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

  if (!historyModal) {

    return false;

  }


  /* REMOVE CLOSING */

  historyModal.classList.remove(
    "modal-closing"
  );


  /* OPEN */

  historyModal.classList.add(
    "modal-open"
  );


  /* LOCK PAGE SCROLL */

  lockHistoryPageScroll();


  return true;

}


/* =========================
   CLOSE HISTORY MODAL
========================= */

function closeHistoryModal() {

  if (!historyModal) {

    return false;

  }


  /* ALREADY CLOSED */

  if (
    !historyModal.classList.contains(
      "modal-open"
    )
  ) {

    return false;

  }


  /* REMOVE OPEN */

  historyModal.classList.remove(
    "modal-open"
  );


  /* START CLOSING */

  historyModal.classList.add(
    "modal-closing"
  );


  let finished = false;


  function finishClose() {

    if (finished) {

      return;

    }


    finished = true;


    historyModal.classList.remove(
      "modal-closing"
    );


    unlockHistoryPageScroll();


    if (historyModalContent) {

      historyModalContent.removeEventListener(
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


  if (historyModalContent) {

    historyModalContent.addEventListener(
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
    "history",
    {

      open:
        openHistoryModal,

      close:
        closeHistoryModal,

      isOpen:
        function () {

          if (!historyModal) {

            return false;

          }


          return (
            historyModal.classList.contains(
              "modal-open"
            ) ||
            historyModal.classList.contains(
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

window.openHistoryModal =
  openHistoryModal;


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

      if (
        window.U9WindowManager
      ) {

        window.U9WindowManager.close(
          "history"
        );

      } else {

        closeHistoryModal();

      }

    }
  );

}
