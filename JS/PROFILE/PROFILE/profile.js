
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

    const response =
      await fetch(
        requestUrl,
        {
          method: "GET"
        }
      );


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


    const result =
      await response.json();


    const frames =
      result.frames ||
      result.data?.frames ||
      [];


    const currentFrame =
      frames.find(
        (frame) =>
          frame.id === frameId
      );


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

  u9ProfileResetAvatar();


  if (
    !user
  ) {

    return;

  }


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

  u9ProfileShowLoading();


  u9ProfileResetAvatar();


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


  if (
    !window.U9User.isLoggedIn() ||
    !user
  ) {

    return;

  }


  try {

    u9ProfileDisplayUser(
      user
    );


    await u9ProfileLoadAvatarFromUser(
      user
    );


    u9ProfileHideLoading();


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
