
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


  /* =========================
     LOAD PROFILE
  ========================= */

  u9ProfileLoad();

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
   API
========================= */

const u9ProfileMeUrl =
  "https://tvtakmswbzawaweytimx.supabase.co/functions/v1/me";


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

  catch (error) {

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
     GET SESSION
  ========================= */

  const sessionToken =
    localStorage.getItem(
      "u9_session"
    );


  /* =========================
     NO SESSION
  ========================= */

  if (
    !sessionToken
  ) {

    /*
      没有登入时：

      1. 保持 loading.svg
      2. 不显示用户资料
      3. 不执行 hide loading
    */

    return;

  }


  try {

    /* =========================
       REQUEST /ME
    ========================= */

    const response =
      await fetch(
        u9ProfileMeUrl,
        {

          method:
            "GET",

          headers: {

            "Authorization":
              `Bearer ${sessionToken}`

          }

        }
      );


    /* =========================
       ME FAILED
    ========================= */

    if (
      !response.ok
    ) {

      console.warn(
        "Profile /me request failed:",
        response.status
      );

      /*
        /me 失败：

        保持 loading.svg
      */

      return;

    }


    /* =========================
       JSON
    ========================= */

    const result =
      await response.json();


    /* =========================
       GET USER
    ========================= */

    const user =
      result.user ||
      result.data?.user ||
      result;


    /* =========================
       USER NOT FOUND
    ========================= */

    if (
      !user
    ) {

      /*
        没有取得 user：

        保持 loading.svg
      */

      return;

    }


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

  catch (error) {

    console.error(
      "Load profile failed:",
      error
    );


    u9ProfileResetAvatar();


    /*
      网络错误：

      保持 loading.svg
    */

    return;

  }

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
