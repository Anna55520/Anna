
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
   API
========================= */

const u9ProfileDefaultFrameUrl =
  "https://tvtakmswbzawaweytimx.supabase.co/functions/v1/avatar-frame-default";


const u9ProfileFreeFrameUrl =
  "https://tvtakmswbzawaweytimx.supabase.co/functions/v1/avatar-frame-free";


const u9ProfilePaidFrameUrl =
  "https://tvtakmswbzawaweytimx.supabase.co/functions/v1/avatar-frame-paid";


/* =========================
   FRONTEND DEFAULT AVATAR
========================= */

/*
  Frontend default avatar.

  This SVG is embedded directly into
  the JavaScript as a Data URI.

  Therefore:

  - No network request
  - No dependency on profile.svg
  - Works when offline
  - Works when Vercel is unreachable
*/

const u9ProfileDefaultAvatarSvg =
  `<svg width="199px" height="199px" viewBox="-2.56 -2.56 21.12 21.12" xmlns="http://www.w3.org/2000/svg" fill="#000000" stroke="#000000" stroke-width="0.00016"><g id="SVGRepo_bgCarrier" stroke-width="0"><rect x="-2.56" y="-2.56" width="21.12" height="21.12" rx="0" fill="#ffffff" strokewidth="0"></rect></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="m 8 1 c -1.65625 0 -3 1.34375 -3 3 s 1.34375 3 3 3 s 3 -1.34375 3 -3 s -1.34375 -3 -3 -3 z m -1.5 7 c -2.492188 0 -4.5 2.007812 -4.5 4.5 v 0.5 c 0 1.109375 0.890625 2 2 2 h 8 c 1.109375 0 2 -0.890625 2 -2 v -0.5 c 0 -2.492188 -2.007812 -4.5 -4.5 -4.5 z m 0 0" fill="#357cf1"></path></g></svg>`;


/*
  Convert SVG to Data URI.

  encodeURIComponent()
  makes the SVG safe to use
  inside an image src.
*/

const u9ProfileDefaultAvatar =
  "data:image/svg+xml;charset=UTF-8," +
  encodeURIComponent(
    u9ProfileDefaultAvatarSvg
  );


/* =========================
   FRONTEND DEFAULT FRAME
========================= */

const u9ProfileDefaultFrame =
  "/SSVG/avatar/ordinary.svg";


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

  if (
    !window.U9User
  ) {

    console.warn(
      "U9User is not available."
    );


    return false;

  }


  if (
    !window.U9User.isLoggedIn()
  ) {

    return false;

  }


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

  if (
    !profileModal ||
    !profileModalContent
  ) {

    return false;

  }


  if (
    !u9ProfileCanOpen()
  ) {

    console.warn(
      "Profile cannot open: user is not authenticated."
    );


    return false;

  }


  /* REMOVE CLOSING */

  profileModal.classList.remove(
    "modal-closing"
  );


  /* OPEN */

  profileModal.classList.add(
    "modal-open"
  );


  /* USER BUTTON ACTIVE */

  if (
    profileUserButton
  ) {

    profileUserButton.classList.add(
      "account-open"
    );

  }


  /* LOAD PROFILE */

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


  if (
    !profileModal.classList.contains(
      "modal-open"
    )
  ) {

    return true;

  }


  /* REMOVE OPEN */

  profileModal.classList.remove(
    "modal-open"
  );


  /* START CLOSING */

  profileModal.classList.add(
    "modal-closing"
  );


  /* USER BUTTON INACTIVE */

  if (
    profileUserButton
  ) {

    profileUserButton.classList.remove(
      "account-open"
    );

  }


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


    /* REMOVE CLOSING */

    profileModal.classList.remove(
      "modal-closing"
    );


    /* REMOVE EVENT */

    profileModalContent.removeEventListener(
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


  profileModalContent.addEventListener(
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
   TOGGLE PROFILE MODAL
========================= */

async function toggleProfileModal() {

  if (
    !profileModal
  ) {

    return false;

  }


  if (
    profileModal.classList.contains(
      "modal-open"
    )
  ) {

    if (
      window.U9WindowManager
    ) {

      await window.U9WindowManager.close(
        "profile"
      );

    }

    else {

      closeProfileModal();

    }


    return true;

  }


  if (
    window.U9WindowManager
  ) {

    return await window.U9WindowManager.open(
      "profile"
    );

  }


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

      if (
        window.U9WindowManager
      ) {

        window.U9WindowManager.close(
          "profile"
        );

      }

      else {

        closeProfileModal();

      }

    }
  );

}


/* =========================
   RESET AVATAR
========================= */

function u9ProfileResetAvatar() {

  /* =========================
     RESET AVATAR
  ========================= */

  if (
    u9ProfileAvatarImage
  ) {

    /*
      Allow a future avatar
      to use fallback again.
    */

    u9ProfileAvatarImage.dataset.u9Fallback =
      "false";


    /*
      Frontend default avatar.

      This is now an embedded SVG.

      It does NOT request:

      /SSVG/avatar/profile.svg
    */

    u9ProfileAvatarImage.src =
      u9ProfileDefaultAvatar;

  }


  /* =========================
     RESET FRAME
  ========================= */

  if (
    u9ProfileAvatarFrame
  ) {

    /*
      Allow a future frame
      to use fallback again.
    */

    u9ProfileAvatarFrame.dataset.u9Fallback =
      "false";


    u9ProfileAvatarFrame.src =
      u9ProfileDefaultFrame;

  }

}


/* =========================
   AVATAR ONERROR FALLBACK
========================= */

if (
  u9ProfileAvatarImage
) {

  u9ProfileAvatarImage.addEventListener(
    "error",
    function () {

      /*
        If the frontend default
        has already failed, stop.

        Prevent infinite loop.
      */

      if (
        this.dataset.u9Fallback ===
        "true"
      ) {

        return;

      }


      /*
        Mark fallback as used.
      */

      this.dataset.u9Fallback =
        "true";


      /*
        Use the embedded frontend
        default avatar again.
      */

      this.src =
        u9ProfileDefaultAvatar;

    }
  );

}


/* =========================
   FRAME ONERROR FALLBACK
========================= */

if (
  u9ProfileAvatarFrame
) {

  u9ProfileAvatarFrame.addEventListener(
    "error",
    function () {

      /*
        If ordinary.svg has
        already failed, stop.

        Prevent infinite loop.
      */

      if (
        this.dataset.u9Fallback ===
        "true"
      ) {

        return;

      }


      /*
        Mark fallback as used.
      */

      this.dataset.u9Fallback =
        "true";


      /*
        Frontend default frame.
      */

      this.src =
        u9ProfileDefaultFrame;

    }
  );

}


/* =========================
   LOAD FREE / PAID FRAME
========================= */

async function u9ProfileLoadFrame(
  frameType,
  frameId
) {

  /* =========================
     DATABASE DEFAULT FRAME
  ========================= */

  if (
    !frameType ||
    frameType === "default"
  ) {

    if (
      u9ProfileAvatarFrame
    ) {

      u9ProfileAvatarFrame.dataset.u9Fallback =
        "false";


      u9ProfileAvatarFrame.src =
        u9ProfileDefaultFrame;

    }

    return true;

  }


  /* =========================
     NO FRAME ID
  ========================= */

  if (
    !frameId
  ) {

    if (
      u9ProfileAvatarFrame
    ) {

      u9ProfileAvatarFrame.dataset.u9Fallback =
        "false";


      u9ProfileAvatarFrame.src =
        u9ProfileDefaultFrame;

    }

    return true;

  }


  let requestUrl =
    "";


  /* =========================
     FREE FRAME
  ========================= */

  if (
    frameType === "free"
  ) {

    requestUrl =
      u9ProfileFreeFrameUrl;

  }


  /* =========================
     PAID FRAME
  ========================= */

  else if (
    frameType === "paid"
  ) {

    requestUrl =
      u9ProfilePaidFrameUrl;

  }


  /* =========================
     UNKNOWN FRAME TYPE
  ========================= */

  else {

    u9ProfileResetAvatar();

    return false;

  }


  /* =========================
     REQUEST
  ========================= */

  try {

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

      u9ProfileResetAvatar();

      return false;

    }


    /* =========================
       JSON
    ========================= */

    const result =
      await response.json();


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

      u9ProfileResetAvatar();

      return false;

    }


    /* =========================
       FRAME SVG NOT FOUND
    ========================= */

    if (
      !currentFrame.svg
    ) {

      u9ProfileResetAvatar();

      return false;

    }


    /* =========================
       LOAD REAL FRAME
    ========================= */

    if (
      u9ProfileAvatarFrame
    ) {

      /*
        Allow fallback if
        real frame fails.
      */

      u9ProfileAvatarFrame.dataset.u9Fallback =
        "false";


      u9ProfileAvatarFrame.src =
        currentFrame.svg;

    }


    return true;

  }

  catch (
    error
  ) {

    /*
      Network error
      Offline
      Connection changed
      Fetch failed

      Use frontend defaults.
    */

    u9ProfileResetAvatar();

    return false;

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


  if (
    u9ProfileUsername
  ) {

    u9ProfileUsername.textContent =
      user.username ||
      "";

  }


  if (
    u9ProfileAccount
  ) {

    u9ProfileAccount.textContent =
      user.account ||
      "";

  }


  if (
    u9ProfileBalance
  ) {

    u9ProfileBalance.textContent =
      user.balance ??
      "0.00";

  }


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

  /*
    Always start with
    frontend defaults.

    Avatar:
    embedded SVG

    Frame:
    ordinary.svg
  */

  u9ProfileResetAvatar();


  /* =========================
     NO USER
  ========================= */

  if (
    !user
  ) {

    return false;

  }


  try {

    /* =========================
       USER AVATAR
    ========================= */

    const avatar =
      user.avatar ||
      null;


    const avatarUrl =
      avatar?.url ||
      "";


    /* =========================
       USER HAS AVATAR
    ========================= */

    if (
      avatarUrl &&
      u9ProfileAvatarImage
    ) {

      /*
        Enable fallback again.
      */

      u9ProfileAvatarImage.dataset.u9Fallback =
        "false";


      /*
        Database/user avatar.

        If this URL fails,
        onerror will automatically
        return to embedded default.
      */

      u9ProfileAvatarImage.src =
        avatarUrl;

    }


    /* =========================
       NO USER AVATAR
    ========================= */

    else if (
      u9ProfileAvatarImage
    ) {

      /*
        Frontend default avatar.

        Embedded SVG.
      */

      u9ProfileAvatarImage.dataset.u9Fallback =
        "false";


      u9ProfileAvatarImage.src =
        u9ProfileDefaultAvatar;

    }


    /* =========================
       USER FRAME
    ========================= */

    const frameType =
      user.avatar_frame_type ||
      "default";


    const frameId =
      user.avatar_frame_id ||
      null;


    const frameLoaded =
      await u9ProfileLoadFrame(
        frameType,
        frameId
      );


    /*
      Frame failed:
      use BOTH frontend defaults.
    */

    if (
      !frameLoaded
    ) {

      u9ProfileResetAvatar();

      return false;

    }


    return true;

  }

  catch (
    error
  ) {

    /*
      Unexpected error:
      frontend defaults.
    */

    u9ProfileResetAvatar();

    return false;

  }

}


/* =========================
   LOAD PROFILE
========================= */

async function u9ProfileLoad() {

  /* =========================
     SHOW LOADING
  ========================= */

  u9ProfileShowLoading();


  /*
    Start with frontend defaults.

    Avatar -> embedded profile SVG
    Frame  -> ordinary.svg
  */

  u9ProfileResetAvatar();


  /* =========================
     U9 USER NOT AVAILABLE
  ========================= */

  if (
    !window.U9User
  ) {

    console.warn(
      "U9User is not available."
    );


    u9ProfileResetAvatar();


    u9ProfileHideLoading();


    return;

  }


  /* =========================
     GET USER
  ========================= */

  const user =
    window.U9User.get();


  /* =========================
     NOT LOGGED IN
  ========================= */

  if (
    !window.U9User.isLoggedIn() ||
    !user
  ) {

    u9ProfileResetAvatar();


    u9ProfileHideLoading();


    return;

  }


  /* =========================
     LOAD
  ========================= */

  try {

    /* =========================
       DISPLAY USER
    ========================= */

    u9ProfileDisplayUser(
      user
    );


    /* =========================
       LOAD AVATAR + FRAME
    ========================= */

    const avatarLoaded =
      await u9ProfileLoadAvatarFromUser(
        user
      );


    /*
      Any failure:
      frontend defaults.
    */

    if (
      !avatarLoaded
    ) {

      u9ProfileResetAvatar();

    }


    /* =========================
       HIDE LOADING
    ========================= */

    u9ProfileHideLoading();


    console.log(
      "Profile Loaded:",
      user
    );

  }

  catch (
    error
  ) {

    /*
      Any unexpected profile error.
    */

    console.error(
      "Load profile failed:",
      error
    );


    /*
      Frontend defaults.
    */

    u9ProfileResetAvatar();


    u9ProfileHideLoading();

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

      open:
        openProfileModal,

      close:
        closeProfileModal,

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
