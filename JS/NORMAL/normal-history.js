
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
   OPEN HISTORY MODAL
========================= */

function openHistoryModal() {

  if (
    !historyModal ||
    !historyModalContent
  ) {

    return false;

  }


  historyModal.classList.remove(
    "modal-closing"
  );


  historyModal.classList.add(
    "modal-open"
  );


  return true;

}


/* =========================
   CLOSE HISTORY MODAL
========================= */

function closeHistoryModal() {

  if (
    !historyModal ||
    !historyModalContent
  ) {

    return false;

  }


  if (
    !historyModal.classList.contains(
      "modal-open"
    )
  ) {

    return true;

  }


  historyModal.classList.remove(
    "modal-open"
  );


  historyModal.classList.add(
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


    historyModal.classList.remove(
      "modal-closing"
    );


    historyModalContent.removeEventListener(
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


  historyModalContent.addEventListener(
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
    "history",
    {

      open:
        openHistoryModal,

      close:
        closeHistoryModal,

      isOpen:
        function () {

          if (
            !historyModal
          ) {

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

      }

      else {

        closeHistoryModal();

      }

    }
  );

}
