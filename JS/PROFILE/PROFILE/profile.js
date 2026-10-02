/* =========================
   PROFILE MODAL
========================= */


/* =========================
   ELEMENTS
========================= */

const profileModal =
  document.getElementById(
    "U9-profile-modal"
  );


const profileModalContent =
  document.getElementById(
    "U9-profile-modal-content"
  );


const profileModalClose =
  document.getElementById(
    "U9-profile-modal-close"
  );


const profileUserButton =
  document.getElementById(
    "U9-page-header-user"
  );


/* =========================
   PAGE SCROLL LOCK
========================= */

function lockProfilePageScroll() {

  document.documentElement.style.overflow =
    "hidden";


  document.body.style.overflow =
    "hidden";

}


function unlockProfilePageScroll() {

  document.documentElement.style.overflow =
    "";


  document.body.style.overflow =
    "";

}


/* =========================
   OPEN PROFILE MODAL
========================= */

function openProfileModal() {

  if (
    !profileModal ||
    !profileModalContent
  ) {

    return;

  }


  /* =========================
     REMOVE CLOSING
  ========================= */

  profileModal.classList.remove(
    "modal-closing"
  );


  /* =========================
     OPEN
  ========================= */

  profileModal.classList.add(
    "modal-open"
  );


  /* =========================
     USER BUTTON ACTIVE
  ========================= */

  if (
    profileUserButton
  ) {

    profileUserButton.classList.add(
      "account-open"
    );

  }


  /* =========================
     LOCK PAGE SCROLL
  ========================= */

  lockProfilePageScroll();

}


/* =========================
   CLOSE PROFILE MODAL
========================= */

function closeProfileModal() {

  if (
    !profileModal ||
    !profileModalContent
  ) {

    return;

  }


  /* =========================
     ALREADY CLOSED
  ========================= */

  if (
    !profileModal.classList.contains(
      "modal-open"
    )
  ) {

    return;

  }


  /* =========================
     REMOVE OPEN
  ========================= */

  profileModal.classList.remove(
    "modal-open"
  );


  /* =========================
     START CLOSING
  ========================= */

  profileModal.classList.add(
    "modal-closing"
  );


  /* =========================
     USER BUTTON INACTIVE
  ========================= */

  if (
    profileUserButton
  ) {

    profileUserButton.classList.remove(
      "account-open"
    );

  }


  /* =========================
     WAIT FOR ANIMATION
  ========================= */

  profileModalContent.addEventListener(
    "transitionend",
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


      /* =========================
         REMOVE CLOSING
      ========================= */

      profileModal.classList.remove(
        "modal-closing"
      );


      /* =========================
         UNLOCK PAGE SCROLL
      ========================= */

      unlockProfilePageScroll();


      /* =========================
         REMOVE EVENT
      ========================= */

      profileModalContent.removeEventListener(
        "transitionend",
        handleCloseAnimation
      );

    }
  );

}


/* =========================
   TOGGLE PROFILE MODAL
========================= */

function toggleProfileModal() {

  if (
    !profileModal
  ) {

    return;

  }


  if (
    profileModal.classList.contains(
      "modal-open"
    )
  ) {

    closeProfileModal();

    return;

  }


  openProfileModal();

}


/* =========================
   USER BUTTON
========================= */

if (
  profileUserButton
) {

  profileUserButton.addEventListener(
    "click",
    function (event) {

      event.stopPropagation();


      toggleProfileModal();

    }
  );

}


/* =========================
   CLOSE BUTTON
========================= */

if (
  profileModalClose
) {

  profileModalClose.addEventListener(
    "click",
    function () {

      closeProfileModal();

    }
  );

}


/* =========================
   GLOBAL ACCESS
========================= */

window.openProfileModal =
  openProfileModal;


window.closeProfileModal =
  closeProfileModal;


window.toggleProfileModal =
  toggleProfileModal;