
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


/* =========================
   PROFILE SINGLE HEADER
========================= */

const profileModalHeader =
  document.getElementById(
    "U9-profile-modal-header"
  );


const profileModalClose =
  document.getElementById(
    "U9-profile-modal-close"
  );


const profileModalCloseIcon =
  document.getElementById(
    "U9-profile-modal-close-icon"
  );


const profileModalTitle =
  document.getElementById(
    "U9-profile-modal-title"
  );


const profileModalIcon =
  document.getElementById(
    "U9-profile-modal-icon"
  );


const profileUserButton =
  document.getElementById(
    "U9-page-header-user"
  );


/* =========================
   PROFILE HEADER DEFAULT
========================= */

const u9ProfileMainTitle =
  "Profile";


const u9ProfileMainIcon =
  "SSVG/logo/U9website.svg";


const u9ProfileMainCloseIcon =
  "SSVG/account/close.svg";


const u9ProfileBackIcon =
  "SSVG/account/back.svg";


const u9ProfilePageTitles = {

  1: "buttonpage1",

  2: "buttonpage2",

  3: "buttonpage3",

  4: "buttonpage4",

  5: "buttonpage5"

};


const u9ProfilePageIcon =
  "SSVG/account/account-edit-button.svg";


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
   PROFILE MAIN PAGE
========================= */

const u9ProfileMain =
  document.getElementById(
    "U9-profile-main"
  );


/* =========================
   PROFILE PAGE BUTTONS
========================= */

const u9ProfileButton1 =
  document.getElementById(
    "U9-profile-button-1"
  );


const u9ProfileButton2 =
  document.getElementById(
    "U9-profile-button-2"
  );


const u9ProfileButton3 =
  document.getElementById(
    "U9-profile-button-3"
  );


const u9ProfileButton4 =
  document.getElementById(
    "U9-profile-button-4"
  );


const u9ProfileButton5 =
  document.getElementById(
    "U9-profile-button-5"
  );


const u9ProfileButton6 =
  document.getElementById(
    "U9-profile-button-6"
  );


/* =========================
   PROFILE INTERNAL PAGES
========================= */

const u9ProfilePage1 =
  document.getElementById(
    "U9-profile-page1"
  );


const u9ProfilePage2 =
  document.getElementById(
    "U9-profile-page2"
  );


const u9ProfilePage3 =
  document.getElementById(
    "U9-profile-page3"
  );


const u9ProfilePage4 =
  document.getElementById(
    "U9-profile-page4"
  );


const u9ProfilePage5 =
  document.getElementById(
    "U9-profile-page5"
  );


const u9ProfilePages = [

  u9ProfilePage1,

  u9ProfilePage2,

  u9ProfilePage3,

  u9ProfilePage4,

  u9ProfilePage5

];


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

const u9ProfileDefaultAvatarSvg =
  `<svg width="199px" height="199px" viewBox="-2.56 -2.56 21.12 21.12" xmlns="http://www.w3.org/2000/svg" fill="#000000" stroke="#000000" stroke-width="0.00016"><g id="SVGRepo_bgCarrier" stroke-width="0"><rect x="-2.56" y="-2.56" width="21.12" height="21.12" rx="0" fill="#ffffff" stroke-width="0"></rect></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="m 8 1 c -1.65625 0 -3 1.34375 -3 3 s 1.34375 3 3 3 s 3 -1.34375 3 -3 s -1.34375 -3 -3 -3 z m -1.5 7 c -2.492188 0 -4.5 2.007812 -4.5 4.5 v 0.5 c 0 1.109375 0.890625 2 2 2 h 8 c 1.109375 0 2 -0.890625 2 -2 v -0.5 c 0 -2.492188 -2.007812 -4.5 -4.5 -4.5 z m 0 0" fill="#357cf1"></path></g></svg>`;


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
   PROFILE INTERNAL PAGE STATE
========================= */

let u9ProfileCurrentPage =
  "main";


/* =========================
   SET PROFILE HEADER
========================= */

function u9ProfileSetHeader(
  page
) {

  /* =========================
     MAIN PROFILE HEADER
  ========================= */

  if (
    page === "main"
  ) {

    if (
      profileModalCloseIcon
    ) {

      profileModalCloseIcon.src =
        u9ProfileMainCloseIcon;

    }


    if (
      profileModalClose
    ) {

      profileModalClose.setAttribute(
        "aria-label",
        "Close"
      );

    }


    if (
      profileModalTitle
    ) {

      profileModalTitle.textContent =
        u9ProfileMainTitle;

    }


    if (
      profileModalIcon
    ) {

      profileModalIcon.src =
        u9ProfileMainIcon;

    }


    return;

  }


  /* =========================
     INTERNAL PROFILE PAGE
  ========================= */

  const pageNumber =
    Number(
      String(page).replace(
        "page",
        ""
      )
    );


  const pageTitle =
    u9ProfilePageTitles[
      pageNumber
    ];


  if (
    !pageTitle
  ) {

    return;

  }


  /* =========================
     BACK BUTTON
  ========================= */

  if (
    profileModalCloseIcon
  ) {

    profileModalCloseIcon.src =
      u9ProfileBackIcon;

  }


  if (
    profileModalClose
  ) {

    profileModalClose.setAttribute(
      "aria-label",
      "Back"
    );

  }


  /* =========================
     PAGE TITLE
  ========================= */

  if (
    profileModalTitle
  ) {

    profileModalTitle.textContent =
      pageTitle;

  }


  /* =========================
     PAGE ICON
  ========================= */

  if (
    profileModalIcon
  ) {

    profileModalIcon.src =
      u9ProfilePageIcon;

  }

}


/* =========================
   HIDE ALL PROFILE PAGES
========================= */

function u9ProfileHideAllPages() {

  /* =========================
     MAIN
  ========================= */

  if (
    u9ProfileMain
  ) {

    u9ProfileMain.classList.remove(
      "profile-page-active"
    );

    u9ProfileMain.style.display =
      "none";

  }


  /* =========================
     INTERNAL PAGES
  ========================= */

  u9ProfilePages.forEach(
    function(page) {

      if (
        !page
      ) {

        return;

      }


      page.classList.remove(
        "profile-page-active"
      );

      page.style.display =
        "none";

    }
  );

}


/* =========================
   SHOW PROFILE MAIN PAGE
========================= */

function u9ProfileShowMainPage() {

  u9ProfileHideAllPages();


  if (
    u9ProfileMain
  ) {

    u9ProfileMain.style.display =
      "block";

    u9ProfileMain.classList.add(
      "profile-page-active"
    );

  }


  u9ProfileCurrentPage =
    "main";


  u9ProfileSetHeader(
    "main"
  );

}


/* =========================
   SHOW PROFILE INTERNAL PAGE
========================= */

function u9ProfileShowPage(
  pageNumber
) {

  const page =
    document.getElementById(
      "U9-profile-page" +
      pageNumber
    );


  if (
    !page ||
    pageNumber < 1 ||
    pageNumber > 5
  ) {

    console.warn(
      "U9 Profile page not found:",
      pageNumber
    );

    return false;

  }


  /* =========================
     HIDE EVERYTHING
  ========================= */

  u9ProfileHideAllPages();


  /* =========================
     SHOW TARGET PAGE
  ========================= */

  page.style.display =
    "block";

  page.classList.add(
    "profile-page-active"
  );


  /* =========================
     SAVE CURRENT PAGE
  ========================= */

  u9ProfileCurrentPage =
    "page" + pageNumber;


  /* =========================
     CHANGE SINGLE HEADER
  ========================= */

  u9ProfileSetHeader(
    u9ProfileCurrentPage
  );


  return true;

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


  /* =========================
     ALWAYS OPEN MAIN
  ========================= */

  u9ProfileShowMainPage();


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
     HEADER USER ACTIVE
  ========================= */

  if (
    profileUserButton
  ) {

    profileUserButton.classList.add(
      "account-open"
    );

  }


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


  if (
    !profileModal.classList.contains(
      "modal-open"
    )
  ) {

    return true;

  }


  /* =========================
     RESET TO MAIN
  ========================= */

  u9ProfileShowMainPage();


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
     HEADER USER INACTIVE
  ========================= */

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


    profileModal.classList.remove(
      "modal-closing"
    );


    profileModalContent.removeEventListener(
      "transitionend",
      handleCloseAnimation
    );

  }


  function handleCloseAnimation(
    event
  ) {

    if (
      event.propertyName !== "transform"
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


  /* =========================
     CLOSE
  ========================= */

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


  /* =========================
     OPEN
  ========================= */

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
   HEADER USER BUTTON
========================= */

if (
  profileUserButton
) {

  profileUserButton.addEventListener(
    "click",
    async function(event) {

      event.stopPropagation();

      await toggleProfileModal();

    }
  );

}


/* =========================
   PROFILE HEADER BUTTON
========================= */

if (
  profileModalClose
) {

  profileModalClose.addEventListener(
    "click",
    async function() {

      /* =========================
         MAIN PROFILE
      ========================= */

      if (
        u9ProfileCurrentPage === "main"
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


        return;

      }


      /* =========================
         INTERNAL PAGE
         SVG = BACK
      ========================= */

      u9ProfileShowMainPage();

    }
  );

}


/* =========================
   PROFILE BUTTON 1
========================= */

if (
  u9ProfileButton1
) {

  u9ProfileButton1.addEventListener(
    "click",
    function() {

      u9ProfileShowPage(1);

    }
  );

}


/* =========================
   PROFILE BUTTON 2
========================= */

if (
  u9ProfileButton2
) {

  u9ProfileButton2.addEventListener(
    "click",
    function() {

      u9ProfileShowPage(2);

    }
  );

}


/* =========================
   PROFILE BUTTON 3
========================= */

if (
  u9ProfileButton3
) {

  u9ProfileButton3.addEventListener(
    "click",
    function() {

      u9ProfileShowPage(3);

    }
  );

}


/* =========================
   PROFILE BUTTON 4
========================= */

if (
  u9ProfileButton4
) {

  u9ProfileButton4.addEventListener(
    "click",
    function() {

      u9ProfileShowPage(4);

    }
  );

}


/* =========================
   PROFILE BUTTON 5
========================= */

if (
  u9ProfileButton5
) {

  u9ProfileButton5.addEventListener(
    "click",
    function() {

      u9ProfileShowPage(5);

    }
  );

}


/* =========================
   PROFILE BUTTON 6
   LOGOUT
========================= */

if (
  u9ProfileButton6
) {

  u9ProfileButton6.addEventListener(
    "click",
    function(event) {

      event.stopPropagation();


      /* =========================
         OPEN LOGOUT MODAL

         IMPORTANT:
         DO NOT CLOSE PROFILE
      ========================= */

      if (
        typeof window.openLogoutConfirm ===
        "function"
      ) {

        window.openLogoutConfirm();

      }

      else if (
        typeof openLogoutConfirm ===
        "function"
      ) {

        openLogoutConfirm();

      }

      else {

        console.warn(
          "openLogoutConfirm is not available."
        );

      }

    }
  );

}


/* =========================
   RESET AVATAR
========================= */

function u9ProfileResetAvatar() {

  /* =========================
     AVATAR
  ========================= */

  if (
    u9ProfileAvatarImage
  ) {

    u9ProfileAvatarImage.dataset.u9Fallback =
      "false";

    u9ProfileAvatarImage.src =
      u9ProfileDefaultAvatar;

  }


  /* =========================
     FRAME
  ========================= */

  if (
    u9ProfileAvatarFrame
  ) {

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
    function() {

      if (
        this.dataset.u9Fallback === "true"
      ) {

        return;

      }


      this.dataset.u9Fallback =
        "true";


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
    function() {

      if (
        this.dataset.u9Fallback === "true"
      ) {

        return;

      }


      this.dataset.u9Fallback =
        "true";


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
        function(frame) {

          return (
            frame.id === frameId
          );

        }
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

      u9ProfileAvatarFrame.dataset.u9Fallback =
        "false";

      u9ProfileAvatarFrame.src =
        currentFrame.svg;

    }


    return true;

  }

  catch(error) {

    console.error(
      "Load profile frame failed:",
      error
    );

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
      user.username || "";

  }


  if (
    u9ProfileAccount
  ) {

    u9ProfileAccount.textContent =
      user.account || "";

  }


  if (
    u9ProfileBalance
  ) {

    u9ProfileBalance.textContent =
      user.balance ?? "0.00";

  }


  if (
    u9ProfileCoins
  ) {

    u9ProfileCoins.textContent =
      user.coins ?? "0.00";

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
      user.avatar || null;


    const avatarUrl =
      avatar?.url || "";


    /* =========================
       USER HAS AVATAR
    ========================= */

    if (
      avatarUrl &&
      u9ProfileAvatarImage
    ) {

      u9ProfileAvatarImage.dataset.u9Fallback =
        "false";

      u9ProfileAvatarImage.src =
        avatarUrl;

    }


    /* =========================
       NO USER AVATAR
    ========================= */

    else if (
      u9ProfileAvatarImage
    ) {

      u9ProfileAvatarImage.dataset.u9Fallback =
        "false";

      u9ProfileAvatarImage.src =
        u9ProfileDefaultAvatar;

    }


    /* =========================
       USER FRAME
    ========================= */

    const frameType =
      user.avatar_frame_type || "default";


    const frameId =
      user.avatar_frame_id || null;


    const frameLoaded =
      await u9ProfileLoadFrame(
        frameType,
        frameId
      );


    /* =========================
       FRAME FAILED
    ========================= */

    if (
      !frameLoaded
    ) {

      u9ProfileResetAvatar();

      return false;

    }


    return true;

  }

  catch(error) {

    console.error(
      "Load profile avatar failed:",
      error
    );

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


  /* =========================
     RESET AVATAR
  ========================= */

  u9ProfileResetAvatar();


  /* =========================
     RESET TO MAIN
  ========================= */

  u9ProfileShowMainPage();


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


    /* =========================
       FAILURE
    ========================= */

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

  catch(error) {

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

  window.U9WindowManager.register(
    "profile",
    {

      open:
        openProfileModal,

      close:
        closeProfileModal,

      isOpen:
        function() {

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
   INITIAL MAIN PAGE
========================= */

u9ProfileShowMainPage();


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
    u9ProfileLoad,

  showMain:
    u9ProfileShowMainPage,

  showPage:
    u9ProfileShowPage,

  getCurrentPage:
    function() {

      return u9ProfileCurrentPage;

    }

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
