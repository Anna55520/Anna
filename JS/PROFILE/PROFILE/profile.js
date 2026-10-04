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
   PROFILE INFO ELEMENTS
========================= */

const u9ProfileInfoLoading =
  document.getElementById(
    "U9-profile-info-loading"
  );


const u9ProfileInfo =
  document.getElementById(
    "U9-profile-info"
  );


const u9ProfileUsername =
  document.getElementById(
    "U9-profile-username"
  );


const u9ProfileAccount =
  document.getElementById(
    "U9-profile-account"
  );


const u9ProfileBalance =
  document.getElementById(
    "U9-profile-balance"
  );


const u9ProfileCoins =
  document.getElementById(
    "U9-profile-coins"
  );


/* =========================
   AVATAR ELEMENTS
========================= */

const u9ProfileAvatarImage =
  document.getElementById(
    "U9-profile-avatar-image"
  );


const u9ProfileAvatarFrame =
  document.getElementById(
    "U9-profile-avatar-frame"
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
   PROFILE INFO LOADING
========================= */

function u9ProfileShowLoading() {

  if (
    u9ProfileInfoLoading
  ) {

    u9ProfileInfoLoading.classList.remove(
      "hidden"
    );

  }


  if (
    u9ProfileInfo
  ) {

    u9ProfileInfo.classList.remove(
      "loaded"
    );

  }

}


/* =========================
   PROFILE INFO COMPLETE
========================= */

function u9ProfileHideLoading() {

  if (
    u9ProfileInfoLoading
  ) {

    u9ProfileInfoLoading.classList.add(
      "hidden"
    );

  }


  if (
    u9ProfileInfo
  ) {

    u9ProfileInfo.classList.add(
      "loaded"
    );

  }

}


/* =========================
   CHECK PROFILE AUTH
========================= */

function u9ProfileCanOpen() {

  /*
     U9User must already exist.

     header.js is responsible
     for checking /me.
  */

  if (
    !window.U9User
  ) {

    console.warn(
      "U9User is not available."
    );


    return false;

  }


  /*
     Only AUTHENTICATED can
     open Profile.

     CHECKING is not enough.
     ERROR is not enough.
     INVALID is not enough.
  */

  if (
    !window.U9User.isLoggedIn()
  ) {

    return false;

  }


  /*
     User object must exist.
  */

  if (
    !window.U9User.get()
  ) {

    return false;

  }


  return true;

}


/* =========================
   OPEN PROFILE MODAL
========================= */

function openProfileModal() {

  /*
     Profile must be opened
     through Window Manager.

     This function only performs
     the actual Profile opening.
  */

  if (
    !profileModal ||
    !profileModalContent
  ) {

    return false;

  }


  /*
     Double protection.

     Even if another script
     directly calls openProfileModal(),
     Profile still cannot open
     without authentication.
  */

  if (
    !u9ProfileCanOpen()
  ) {

    console.warn(
      "Profile cannot open: user is not authenticated."
    );


    return false;

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


  /* =========================
     LOAD PROFILE
  ========================= */

  u9ProfileLoad();


  return true;

}


/* =========================
   CLOSE PROFILE MODAL
========================= */

function closeProfileModal() {

  if (
    !profileModal ||
    !profileModalContent
  ) {

    return false;

  }


  /* =========================
     ALREADY CLOSED
  ========================= */

  if (
    !profileModal.classList.contains(
      "modal-open"
    )
  ) {

    return true;

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


  function handleCloseAnimation(
    event
  ) {

    /*
       Only wait for transform.
    */

    if (
      event.propertyName !==
      "transform"
    ) {

      return;

    }


    finishClose();

  }


  profileModalContent.addEventListener(
    "transitionend",
    handleCloseAnimation
  );


  /*
     Safety fallback.

     If transitionend is not
     triggered for any reason,
     Profile will still finish
     closing.
  */

  setTimeout(
    finishClose,
    700
  );


  return true;

}


/* =========================
   TOGGLE PROFILE MODAL
========================= */

async function toggleProfileModal() {

  if (
    !profileModal
  ) {

    return false;

  }


  /*
     If Profile is currently
     open, close it directly.
  */

  if (
    profileModal.classList.contains(
      "modal-open"
    )
  ) {

    closeProfileModal();

    return true;

  }


  /*
     Otherwise ask Window Manager
     to open Profile.
  */

  if (
    window.U9WindowManager
  ) {

    return await window.U9WindowManager.open(
      "profile"
    );

  }


  /*
     Fallback.

     This should normally never
     be needed once Window Manager
     is loaded correctly.
  */

  return openProfileModal();

}


/* =========================
   USER BUTTON
========================= */

if (
  profileUserButton
) {

  profileUserButton.addEventListener(
    "click",
    async function (event) {

      event.stopPropagation();


      await toggleProfileModal();

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
   API
========================= */

/*
   These are NOT /me.

   They are only used to load
   the available avatar frame
   resources.

   Current user information
   still comes exclusively from
   header.js / U9User.
*/

const u9ProfileDefaultFrameUrl =
  "https://tvtakmswbzawaweytimx.supabase.co/functions/v1/avatar-frame-default";


const u9ProfileFreeFrameUrl =
  "https://tvtakmswbzawaweytimx.supabase.co/functions/v1/avatar-frame-free";


const u9ProfilePaidFrameUrl =
  "https://tvtakmswbzawaweytimx.supabase.co/functions/v1/avatar-frame-paid";


/* =========================
   DEFAULT AVATAR
========================= */

const u9ProfileDefaultAvatar =
  "SSVG/avatar/profile.svg";


/* =========================
   DEFAULT FRAME
========================= */

const u9ProfileDefaultFrame =
  "SSVG/avatar/ordinary.svg";


/* =========================
   RESET AVATAR
========================= */

function u9ProfileResetAvatar() {

  if (
    u9ProfileAvatarImage
  ) {

    u9ProfileAvatarImage.src =
      u9ProfileDefaultAvatar;

  }


  if (
    u9ProfileAvatarFrame
  ) {

    u9ProfileAvatarFrame.src =
      u9ProfileDefaultFrame;

  }

}


/* =========================
   LOAD FREE / PAID FRAME
========================= */

async function u9ProfileLoadFrame(
  frameType,
  frameId
) {

  /* =========================
     DEFAULT FRAME
  ========================= */

  if (
    !frameType ||
    frameType === "default"
  ) {

    if (
      u9ProfileAvatarFrame
    ) {

      u9ProfileAvatarFrame.src =
        u9ProfileDefaultFrame;

    }

    return;

  }


  /* =========================
     FRAME ID REQUIRED
  ========================= */

  if (
    !frameId
  ) {

    if (
      u9ProfileAvatarFrame
    ) {

      u9ProfileAvatarFrame.src =
        u9ProfileDefaultFrame;

    }

    return;

  }


  /* =========================
     SELECT API
  ========================= */

  let requestUrl =
    "";


  if (
    frameType === "free"
  ) {

    requestUrl =
      u9ProfileFreeFrameUrl;

  }

  else if (
    frameType === "paid"
  ) {

    requestUrl =
      u9ProfilePaidFrameUrl;

  }

  else {

    if (
      u9ProfileAvatarFrame
    ) {

      u9ProfileAvatarFrame.src =
        u9ProfileDefaultFrame;

    }

    return;

  }


  try {

    /* =========================
       REQUEST FRAME
    ========================= */

    const response =
      await fetch(
        requestUrl,
        {
          method: "GET"
        }
      );


    /* =========================
       REQUEST FAILED
    ========================= */

    if (
      !response.ok
    ) {

      console.error(
        "Failed to load profile frame:",
        response.status
      );


      if (
        u9ProfileAvatarFrame
      ) {

        u9ProfileAvatarFrame.src =
          u9ProfileDefaultFrame;

      }


      return;

    }


    /* =========================
       JSON
    ========================= */

    const result =
      await response.json();


    /* =========================
       GET FRAMES
    ========================= */

    const frames =
      result.frames ||
      result.data?.frames ||
      [];


    /* =========================
       FIND CURRENT FRAME
    ========================= */

    const currentFrame =
      frames.find(
        (frame) =>
          frame.id === frameId
      );


    /* =========================
       FRAME NOT FOUND
    ========================= */

    if (
      !currentFrame
    ) {

      console.warn(
        "Profile frame not found:",
        frameId
      );


      if (
        u9ProfileAvatarFrame
      ) {

        u9ProfileAvatarFrame.src =
          u9ProfileDefaultFrame;

      }


      return;

    }


    /* =========================
       SVG REQUIRED
    ========================= */

    if (
      !currentFrame.svg
    ) {

      console.warn(
        "Profile frame SVG not found:",
        frameId
      );


      if (
        u9ProfileAvatarFrame
      ) {

        u9ProfileAvatarFrame.src =
          u9ProfileDefaultFrame;

      }


      return;

    }


    /* =========================
       DISPLAY FRAME
    ========================= */

    if (
      u9ProfileAvatarFrame
    ) {

      u9ProfileAvatarFrame.src =
        currentFrame.svg;

    }

  }

  catch (
    error
  ) {

    console.error(
      "Load profile frame failed:",
      error
    );


    if (
      u9ProfileAvatarFrame
    ) {

      u9ProfileAvatarFrame.src =
        u9ProfileDefaultFrame;

    }

  }

}


/* =========================
   DISPLAY USER INFO
========================= */

function u9ProfileDisplayUser(
  user
) {

  if (
    !user
  ) {

    return;

  }


  /* =========================
     USERNAME
  ========================= */

  if (
    u9ProfileUsername
  ) {

    u9ProfileUsername.textContent =
      user.username ||
      "";

  }


  /* =========================
     ACCOUNT
  ========================= */

  if (
    u9ProfileAccount
  ) {

    u9ProfileAccount.textContent =
      user.account ||
      "";

  }


  /* =========================
     BALANCE
  ========================= */

  if (
    u9ProfileBalance
  ) {

    u9ProfileBalance.textContent =
      user.balance ??
      "0.00";

  }


  /* =========================
     COINS
  ========================= */

  if (
    u9ProfileCoins
  ) {

    u9ProfileCoins.textContent =
      user.coins ??
      "0.00";

  }

}


/* =========================
   LOAD PROFILE AVATAR
========================= */

async function u9ProfileLoadAvatarFromUser(
  user
) {

  /* =========================
     RESET FIRST
  ========================= */

  u9ProfileResetAvatar();


  if (
    !user
  ) {

    return;

  }


  /* =========================
     AVATAR
  ========================= */

  const avatar =
    user.avatar ||
    null;


  const avatarUrl =
    avatar?.url ||
    "";


  if (
    avatarUrl &&
    u9ProfileAvatarImage
  ) {

    u9ProfileAvatarImage.src =
      avatarUrl;

  }

  else if (
    u9ProfileAvatarImage
  ) {

    u9ProfileAvatarImage.src =
      u9ProfileDefaultAvatar;

  }


  /* =========================
     FRAME
  ========================= */

  const frameType =
    user.avatar_frame_type ||
    "default";


  const frameId =
    user.avatar_frame_id ||
    null;


  await u9ProfileLoadFrame(
    frameType,
    frameId
  );

}


/* =========================
   LOAD PROFILE
========================= */

async function u9ProfileLoad() {

  /* =========================
     SHOW LOADING
  ========================= */

  u9ProfileShowLoading();


  /* =========================
     RESET AVATAR
  ========================= */

  u9ProfileResetAvatar();


  /* =========================
     GET CURRENT USER
  ========================= */

  if (
    !window.U9User
  ) {

    console.warn(
      "U9User is not available."
    );


    return;

  }


  const user =
    window.U9User.get();


  /* =========================
     USER NOT AUTHENTICATED
  ========================= */

  if (
    !window.U9User.isLoggedIn() ||
    !user
  ) {

    /*
       Do not show Profile data.

       Keep loading state.
    */

    return;

  }


  try {

    /* =========================
       DISPLAY USER INFO
    ========================= */

    u9ProfileDisplayUser(
      user
    );


    /* =========================
       LOAD AVATAR + FRAME
    ========================= */

    await u9ProfileLoadAvatarFromUser(
      user
    );


    /* =========================
       HIDE LOADING
    ========================= */

    u9ProfileHideLoading();


    /* =========================
       DEBUG
    ========================= */

    console.log(
      "Profile Loaded:",
      user
    );

  }

  catch (
    error
  ) {

    console.error(
      "Load profile failed:",
      error
    );


    u9ProfileResetAvatar();


    /*
       Keep loading state
       when Profile data fails.
    */

    return;

  }

}


/* =========================
   WINDOW MANAGER
========================= */

if (
  window.U9WindowManager
) {

  U9WindowManager.register(
    "profile",
    {

      /* =========================
         OPEN
      ========================= */

      open:
        openProfileModal,


      /* =========================
         CLOSE
      ========================= */

      close:
        closeProfileModal,


      /* =========================
         IS OPEN
      ========================= */

      isOpen:
        function () {

          if (
            !profileModal
          ) {

            return false;

          }


          return (
            profileModal.classList.contains(
              "modal-open"
            ) ||

            profileModal.classList.contains(
              "modal-closing"
            )
          );

        },


      /* =========================
         CAN OPEN
      ========================= */

      canOpen:
        u9ProfileCanOpen

    }
  );

}

else {

  console.warn(
    "U9WindowManager is not available when Profile was initialized."
  );

}


/* =========================
   INITIAL RESET
========================= */

u9ProfileResetAvatar();


/* =========================
   GLOBAL ACCESS
========================= */

window.openProfileModal =
  openProfileModal;


window.closeProfileModal =
  closeProfileModal;


window.toggleProfileModal =
  toggleProfileModal;


/* =========================
   PROFILE GLOBAL API
========================= */

window.U9Profile = {

  load:
    u9ProfileLoad,

  refresh:
    u9ProfileLoad

};


/* =========================
   AVATAR GLOBAL API
========================= */

window.U9ProfileAvatar = {

  load:
    u9ProfileLoad,

  refresh:
    u9ProfileLoad

};
