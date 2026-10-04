
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
   DEFAULT AVATAR
========================= */

const u9ProfileDefaultAvatar =
  "/SSVG/avatar/profile.svg";


/* =========================
   DEFAULT FRAME
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
      Remove fallback lock so a
      future real avatar can load.
    */

    u9ProfileAvatarImage.dataset.u9Fallback =
      "false";


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
      Remove fallback lock so a
      future real frame can load.
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
        If the default avatar itself
        has already failed, stop here.

        This prevents an infinite loop:
        profile.svg
        -> error
        -> profile.svg
        -> error
        -> ...
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
        Always fall back to the
        default profile avatar.
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
        If ordinary.svg itself has
        already failed, stop here.

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
        Always fall back to the
        default ordinary frame.
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
     DEFAULT FRAME
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
       LOAD FRAME
    ========================= */

    if (
      u9ProfileAvatarFrame
    ) {

      /*
        New real frame:
        allow onerror fallback again.
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
      Network error / offline /
      fetch failed.

      Reset BOTH avatar and frame.
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
    Always start from defaults.
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


    if (
      avatarUrl &&
      u9ProfileAvatarImage
    ) {

      /*
        Allow avatar onerror fallback.
      */

      u9ProfileAvatarImage.dataset.u9Fallback =
        "false";


      u9ProfileAvatarImage.src =
        avatarUrl;

    }

    else if (
      u9ProfileAvatarImage
    ) {

      /*
        No user avatar:
        use default.
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
      If frame loading failed,
      reset BOTH avatar and frame.
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
      default avatar + frame.
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
    Always begin with:
    Avatar -> profile.svg
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
      Any loading failure:
      default avatar + frame.
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
