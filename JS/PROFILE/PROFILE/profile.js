/* =========================================================
   PROFILE MODAL
========================================================= */


/* =========================================================
   ELEMENTS
========================================================= */

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


/* =========================================================
   PROFILE HOME ELEMENTS
========================================================= */

const profileHome =
  document.getElementById(
    "U9-profile-home"
  );


const profileHomeHeader =
  document.getElementById(
    "U9-profile-home-header"
  );


const profileHomeTitle =
  document.getElementById(
    "U9-profile-home-title"
  );


const profileHomeIcon =
  document.getElementById(
    "U9-profile-home-icon"
  );


const profileHomeBody =
  document.getElementById(
    "U9-profile-home-body"
  );


/* =========================================================
   PROFILE INFO ELEMENTS
========================================================= */

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


/* =========================================================
   BALANCE / COINS TOGGLE
========================================================= */

const u9ProfileBalanceToggle =
  document.getElementById(
    "U9-profile-balance-toggle"
  );


/* =========================================================
   AVATAR ELEMENTS
========================================================= */

const u9ProfileAvatarImage =
  document.getElementById(
    "U9-profile-avatar-image"
  );


const u9ProfileAvatarFrame =
  document.getElementById(
    "U9-profile-avatar-frame"
  );


/* =========================================================
   PROFILE BUTTONS
========================================================= */

const u9ProfileButtons = {

  1:
    document.getElementById(
      "U9-profile-button-1"
    ),

  2:
    document.getElementById(
      "U9-profile-button-2"
    ),

  3:
    document.getElementById(
      "U9-profile-button-3"
    ),

  4:
    document.getElementById(
      "U9-profile-button-4"
    ),

  5:
    document.getElementById(
      "U9-profile-button-5"
    ),

  6:
    document.getElementById(
      "U9-profile-button-6"
    ),

  7:
    document.getElementById(
      "U9-profile-button-7"
    )

};


/* =========================================================
   PROFILE PAGES
========================================================= */

const u9ProfilePages = {};


/* =========================================================
   PAGE 1
========================================================= */

u9ProfilePages[1] = {

  page:
    document.getElementById(
      "U9-profile-page-1"
    ),

  header:
    document.getElementById(
      "U9-profile-page-1-header"
    ),

  title:
    document.getElementById(
      "U9-profile-page-1-title"
    ),

  icon:
    document.getElementById(
      "U9-profile-page-1-icon"
    ),

  body:
    document.getElementById(
      "U9-profile-page-1-body"
    ),

  back:
    document.getElementById(
      "U9-profile-page-1-back"
    )

};


/* =========================================================
   PAGE 2
========================================================= */

u9ProfilePages[2] = {

  page:
    document.getElementById(
      "U9-profile-page-2"
    ),

  header:
    document.getElementById(
      "U9-profile-page-2-header"
    ),

  title:
    document.getElementById(
      "U9-profile-page-2-title"
    ),

  icon:
    document.getElementById(
      "U9-profile-page-2-icon"
    ),

  body:
    document.getElementById(
      "U9-profile-page-2-body"
    ),

  back:
    document.getElementById(
      "U9-profile-page-2-back"
    )

};


/* =========================================================
   PAGE 3
========================================================= */

u9ProfilePages[3] = {

  page:
    document.getElementById(
      "U9-profile-page-3"
    ),

  header:
    document.getElementById(
      "U9-profile-page-3-header"
    ),

  title:
    document.getElementById(
      "U9-profile-page-3-title"
    ),

  icon:
    document.getElementById(
      "U9-profile-page-3-icon"
    ),

  body:
    document.getElementById(
      "U9-profile-page-3-body"
    ),

  back:
    document.getElementById(
      "U9-profile-page-3-back"
    )

};


/* =========================================================
   PAGE 4
========================================================= */

u9ProfilePages[4] = {

  page:
    document.getElementById(
      "U9-profile-page-4"
    ),

  header:
    document.getElementById(
      "U9-profile-page-4-header"
    ),

  title:
    document.getElementById(
      "U9-profile-page-4-title"
    ),

  icon:
    document.getElementById(
      "U9-profile-page-4-icon"
    ),

  body:
    document.getElementById(
      "U9-profile-page-4-body"
    ),

  back:
    document.getElementById(
      "U9-profile-page-4-back"
    )

};


/* =========================================================
   PAGE 5
========================================================= */

u9ProfilePages[5] = {

  page:
    document.getElementById(
      "U9-profile-page-5"
    ),

  header:
    document.getElementById(
      "U9-profile-page-5-header"
    ),

  title:
    document.getElementById(
      "U9-profile-page-5-title"
    ),

  icon:
    document.getElementById(
      "U9-profile-page-5-icon"
    ),

  body:
    document.getElementById(
      "U9-profile-page-5-body"
    ),

  back:
    document.getElementById(
      "U9-profile-page-5-back"
    )

};


/* =========================================================
   PAGE 6
========================================================= */

u9ProfilePages[6] = {

  page:
    document.getElementById(
      "U9-profile-page-6"
    ),

  header:
    document.getElementById(
      "U9-profile-page-6-header"
    ),

  title:
    document.getElementById(
      "U9-profile-page-6-title"
    ),

  icon:
    document.getElementById(
      "U9-profile-page-6-icon"
    ),

  body:
    document.getElementById(
      "U9-profile-page-6-body"
    ),

  back:
    document.getElementById(
      "U9-profile-page-6-back"
    )

};


/* =========================================================
   PAGE 7
========================================================= */

u9ProfilePages[7] = {

  page:
    document.getElementById(
      "U9-profile-page-7"
    ),

  header:
    document.getElementById(
      "U9-profile-page-7-header"
    ),

  title:
    document.getElementById(
      "U9-profile-page-7-title"
    ),

  icon:
    document.getElementById(
      "U9-profile-page-7-icon"
    ),

  body:
    document.getElementById(
      "U9-profile-page-7-body"
    ),

  back:
    document.getElementById(
      "U9-profile-page-7-back"
    )

};


/* =========================================================
   PROFILE PAGE STATE
========================================================= */

let u9ProfileCurrentPage =
  0;


let u9ProfilePageAnimating =
  false;


let u9ProfileBackActionRunning =
  false;


const u9ProfilePageAnimationDuration =
  380;


/*
  0 = Profile Home

  1 = Profile Page 1
  2 = Profile Page 2
  3 = Profile Page 3
  4 = Profile Page 4
  5 = Profile Page 5
  6 = Profile Page 6
  7 = Profile Page 7
*/


/* =========================================================
   PROFILE PAGE TITLES
========================================================= */

const u9ProfilePageTitles = {

  1: "Button 1",

  2: "Button 2",

  3: "Button 3",

  4: "Button 4",

  5: "Button 5",

  6: "Button 6",

  7: "Button 7"

};


/* =========================================================
   PAGE CLASS LIST
========================================================= */

const u9ProfilePageClasses = [

  "U9-profile-page-active",

  "U9-profile-page-current",

  "U9-profile-page-slide-left",

  "U9-profile-page-slide-right",

  "U9-profile-page-slide-from-left",

  "U9-profile-page-slide-from-right"

];


/* =========================================================
   REMOVE PAGE CLASSES
========================================================= */

function u9ProfileRemovePageClasses(
  page
) {

  if (!page) {

    return;

  }


  page.classList.remove(
    ...u9ProfilePageClasses
  );

}


/* =========================================================
   RESET ALL INTERNAL PAGE CLASSES
========================================================= */

function u9ProfileResetPageClasses() {

  for (
    let pageNumber = 1;
    pageNumber <= 7;
    pageNumber++
  ) {

    const pageData =
      u9ProfilePages[
        pageNumber
      ];


    if (
      !pageData ||
      !pageData.page
    ) {

      continue;

    }


    u9ProfileRemovePageClasses(
      pageData.page
    );

  }

}


/* =========================================================
   RESET PAGE SCROLL
========================================================= */

function u9ProfileResetPageScroll() {

  if (profileHomeBody) {

    profileHomeBody.scrollTop =
      0;

  }


  for (
    let pageNumber = 1;
    pageNumber <= 7;
    pageNumber++
  ) {

    const pageData =
      u9ProfilePages[
        pageNumber
      ];


    if (pageData?.body) {

      pageData.body.scrollTop =
        0;

    }

  }

}


/* =========================================================
   RESET TO PROFILE HOME
========================================================= */

function u9ProfileGoHome(
  immediate = false
) {

  if (!profileHome) {

    return false;

  }


  u9ProfilePageAnimating =
    false;


  u9ProfileBackActionRunning =
    false;


  u9ProfileResetPageClasses();


  u9ProfileRemovePageClasses(
    profileHome
  );


  profileHome.classList.add(
    "U9-profile-page-active"
  );


  profileHome.classList.add(
    "U9-profile-page-current"
  );


  u9ProfileCurrentPage =
    0;


  u9ProfileResetPageScroll();


  return true;

}


/* =========================================================
   PREPARE INTERNAL PAGE
========================================================= */

function u9ProfilePreparePage(
  pageNumber
) {

  const pageData =
    u9ProfilePages[
      pageNumber
    ];


  if (
    !pageData ||
    !pageData.page
  ) {

    return false;

  }


  if (pageData.title) {

    pageData.title.textContent =
      u9ProfilePageTitles[
        pageNumber
      ] ||
      `Button ${pageNumber}`;

  }


  if (pageData.body) {

    pageData.body.scrollTop =
      0;

  }


  return true;

}


/* =========================================================
   OPEN PROFILE PAGE
========================================================= */

function u9ProfileOpenPage(
  pageNumber
) {

  if (u9ProfilePageAnimating) {

    return false;

  }


  if (
    !Number.isInteger(pageNumber) ||
    pageNumber < 1 ||
    pageNumber > 7
  ) {

    return false;

  }


  const nextPage =
    u9ProfilePages[
      pageNumber
    ];


  if (
    !nextPage ||
    !nextPage.page
  ) {

    console.warn(
      "Profile page not found:",
      pageNumber
    );

    return false;

  }


  if (
    u9ProfileCurrentPage ===
    pageNumber
  ) {

    return true;

  }


  const currentPageNumber =
    u9ProfileCurrentPage;


  let currentPage =
    null;


  if (
    currentPageNumber === 0
  ) {

    currentPage =
      profileHome;

  }

  else {

    currentPage =
      u9ProfilePages[
        currentPageNumber
      ]?.page || null;

  }


  if (!currentPage) {

    u9ProfileGoHome(true);

    currentPage =
      profileHome;

  }


  if (!currentPage) {

    return false;

  }


  u9ProfilePreparePage(
    pageNumber
  );


  u9ProfilePageAnimating =
    true;


  u9ProfileBackActionRunning =
    false;


  /*
   ========================================================
   FORWARD ANIMATION

   Current Page:
     CENTER → LEFT

   Destination:
     RIGHT → CENTER
   ========================================================
  */


  /*
   --------------------------------------------------------
   STEP 1

   Clean destination.
   --------------------------------------------------------
  */

  u9ProfileRemovePageClasses(
    nextPage.page
  );


  /*
   --------------------------------------------------------
   STEP 2

   Put destination on RIGHT.
   --------------------------------------------------------
  */

  nextPage.page.classList.add(
    "U9-profile-page-slide-from-right"
  );


  /*
   Force browser to render
   destination at RIGHT first.
  */

  void nextPage.page.offsetWidth;


  /*
   --------------------------------------------------------
   STEP 3

   Make sure current page is
   definitely CENTER first.

   This is important.

   We do NOT directly remove all
   classes and then slide-left,
   because the default CSS state
   may already be RIGHT.
   --------------------------------------------------------
  */

  u9ProfileRemovePageClasses(
    currentPage
  );


  currentPage.classList.add(
    "U9-profile-page-current"
  );


  /*
   Force browser to render
   current page at CENTER.
  */

  void currentPage.offsetWidth;


  /*
   --------------------------------------------------------
   STEP 4

   Current:
     CENTER → LEFT
   --------------------------------------------------------
  */

  currentPage.classList.add(
    "U9-profile-page-slide-left"
  );


  /*
   --------------------------------------------------------
   STEP 5

   Destination:
     RIGHT → CENTER
   --------------------------------------------------------
  */

  nextPage.page.classList.remove(
    "U9-profile-page-slide-from-right"
  );


  nextPage.page.classList.add(
    "U9-profile-page-active"
  );


  nextPage.page.classList.add(
    "U9-profile-page-current"
  );


  /*
   Update state immediately.
  */

  u9ProfileCurrentPage =
    pageNumber;


  /*
   --------------------------------------------------------
   STEP 6

   Finish animation.
   --------------------------------------------------------
  */

  setTimeout(
    function () {

      u9ProfileRemovePageClasses(
        currentPage
      );


      u9ProfilePageAnimating =
        false;

    },
    u9ProfilePageAnimationDuration
  );


  return true;

}


/* =========================================================
   BACK TO PROFILE HOME
========================================================= */

function u9ProfileGoBack() {

  /*
   --------------------------------------------------------
   HARD BACK LOCK
   --------------------------------------------------------
  */

  if (
    u9ProfileBackActionRunning
  ) {

    return false;

  }


  /*
   Already on Home.
  */

  if (
    u9ProfileCurrentPage === 0
  ) {

    return false;

  }


  /*
   Another animation is running.
  */

  if (
    u9ProfilePageAnimating
  ) {

    return false;

  }


  const currentPageNumber =
    u9ProfileCurrentPage;


  const currentPage =
    u9ProfilePages[
      currentPageNumber
    ]?.page || null;


  const previousPage =
    profileHome;


  if (
    !currentPage ||
    !previousPage
  ) {

    u9ProfileGoHome(true);

    return false;

  }


  /*
   --------------------------------------------------------
   LOCK IMMEDIATELY
   --------------------------------------------------------
  */

  u9ProfileBackActionRunning =
    true;


  u9ProfilePageAnimating =
    true;


  /*
   Change state immediately.

   This prevents another Back
   action from being accepted.
  */

  u9ProfileCurrentPage =
    0;


  /*
   ========================================================
   BACK ANIMATION

   Home:
     LEFT → CENTER

   Current Page:
     CENTER → RIGHT
   ========================================================
  */


  /*
   --------------------------------------------------------
   STEP 1

   Clean Home.
   --------------------------------------------------------
  */

  u9ProfileRemovePageClasses(
    previousPage
  );


  /*
   --------------------------------------------------------
   STEP 2

   Put Home on LEFT.
   --------------------------------------------------------
  */

  previousPage.classList.add(
    "U9-profile-page-slide-from-left"
  );


  /*
   IMPORTANT:
   Force Home to actually render
   at LEFT before starting the
   transition to CENTER.
  */

  void previousPage.offsetWidth;


  /*
   --------------------------------------------------------
   STEP 3

   Clean current Page.
   --------------------------------------------------------
  */

  u9ProfileRemovePageClasses(
    currentPage
  );


  /*
   IMPORTANT:

   The default .U9-profile-page
   position is RIGHT.

   Therefore we must explicitly
   put the current page at CENTER
   before asking it to move RIGHT.
  */

  currentPage.classList.add(
    "U9-profile-page-current"
  );


  /*
   Force browser to render
   current Page at CENTER.
  */

  void currentPage.offsetWidth;


  /*
   --------------------------------------------------------
   STEP 4

   Current Page:
     CENTER → RIGHT
   --------------------------------------------------------
  */

  currentPage.classList.add(
    "U9-profile-page-slide-right"
  );


  /*
   --------------------------------------------------------
   STEP 5

   Home:
     LEFT → CENTER
   --------------------------------------------------------
  */

  previousPage.classList.remove(
    "U9-profile-page-slide-from-left"
  );


  previousPage.classList.add(
    "U9-profile-page-active"
  );


  previousPage.classList.add(
    "U9-profile-page-current"
  );


  /*
   Reset Home scroll.
  */

  if (profileHomeBody) {

    profileHomeBody.scrollTop =
      0;

  }


  /*
   --------------------------------------------------------
   STEP 6

   Finish animation.
   --------------------------------------------------------
  */

  setTimeout(
    function () {

      /*
       Completely clean
       the old internal page.
      */

      u9ProfileRemovePageClasses(
        currentPage
      );


      /*
       Make sure Home remains
       the final active page.
      */

      u9ProfileRemovePageClasses(
        previousPage
      );


      previousPage.classList.add(
        "U9-profile-page-active"
      );


      previousPage.classList.add(
        "U9-profile-page-current"
      );


      u9ProfilePageAnimating =
        false;


      u9ProfileBackActionRunning =
        false;

    },
    u9ProfilePageAnimationDuration
  );


  return true;

}


/* =========================================================
   BALANCE / COINS DISPLAY
========================================================= */

let u9ProfileShowingCoins =
  false;


/* =========================================================
   UPDATE BALANCE / COINS DISPLAY
========================================================= */

function u9ProfileUpdateBalanceDisplay() {

  if (
    !u9ProfileBalance ||
    !u9ProfileCoins
  ) {

    return;

  }


  if (u9ProfileShowingCoins) {

    u9ProfileBalance.classList.remove(
      "U9-profile-value-active"
    );

    u9ProfileBalance.classList.add(
      "U9-profile-value-hidden"
    );


    u9ProfileCoins.classList.remove(
      "U9-profile-value-hidden"
    );

    u9ProfileCoins.classList.add(
      "U9-profile-value-active"
    );

  }

  else {

    u9ProfileCoins.classList.remove(
      "U9-profile-value-active"
    );

    u9ProfileCoins.classList.add(
      "U9-profile-value-hidden"
    );


    u9ProfileBalance.classList.remove(
      "U9-profile-value-hidden"
    );

    u9ProfileBalance.classList.add(
      "U9-profile-value-active"
    );

  }

}


/* =========================================================
   TOGGLE BALANCE / COINS
========================================================= */

function u9ProfileToggleBalance() {

  u9ProfileShowingCoins =
    !u9ProfileShowingCoins;


  u9ProfileUpdateBalanceDisplay();


  return u9ProfileShowingCoins;

}


/* =========================================================
   BALANCE TOGGLE EVENT
========================================================= */

if (u9ProfileBalanceToggle) {

  u9ProfileBalanceToggle.addEventListener(
    "click",
    function (event) {

      event.preventDefault();

      event.stopPropagation();


      u9ProfileToggleBalance();

    }
  );

}


/* =========================================================
   PROFILE BUTTON EVENTS
========================================================= */

for (
  let pageNumber = 1;
  pageNumber <= 7;
  pageNumber++
) {

  const button =
    u9ProfileButtons[
      pageNumber
    ];


  if (!button) {

    continue;

  }


  button.addEventListener(
    "click",
    function (event) {

      event.preventDefault();

      event.stopPropagation();


      u9ProfileOpenPage(
        pageNumber
      );

    }
  );

}


/* =========================================================
   PROFILE PAGE BACK BUTTON EVENTS
========================================================= */

for (
  let pageNumber = 1;
  pageNumber <= 7;
  pageNumber++
) {

  const pageData =
    u9ProfilePages[
      pageNumber
    ];


  if (
    !pageData ||
    !pageData.back
  ) {

    continue;

  }


  pageData.back.onclick =
    function (event) {

      event.preventDefault();

      event.stopPropagation();

      event.stopImmediatePropagation();


      if (
        u9ProfileBackActionRunning
      ) {

        return false;

      }


      if (
        u9ProfilePageAnimating
      ) {

        return false;

      }


      if (
        u9ProfileCurrentPage === 0
      ) {

        return false;

      }


      u9ProfileGoBack();


      return false;

    };

}


/* =========================================================
   PROFILE INFO LOADING
========================================================= */

function u9ProfileShowLoading() {

  if (u9ProfileInfoLoading) {

    u9ProfileInfoLoading.classList.remove(
      "hidden"
    );

  }


  if (u9ProfileInfo) {

    u9ProfileInfo.classList.remove(
      "loaded"
    );

  }

}


/* =========================================================
   PROFILE INFO COMPLETE
========================================================= */

function u9ProfileHideLoading() {

  if (u9ProfileInfoLoading) {

    u9ProfileInfoLoading.classList.add(
      "hidden"
    );

  }


  if (u9ProfileInfo) {

    u9ProfileInfo.classList.add(
      "loaded"
    );

  }

}


/* =========================================================
   CHECK PROFILE AUTH
========================================================= */

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
    typeof window.U9User.isLoggedIn !==
    "function"
  ) {

    return false;

  }


  if (
    typeof window.U9User.get !==
    "function"
  ) {

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


/* =========================================================
   PROFILE CLOSE TIMER
========================================================= */

let u9ProfileCloseTimer =
  null;


let u9ProfileCloseHandler =
  null;


/* =========================================================
   CANCEL PROFILE CLOSE
========================================================= */

function u9ProfileCancelClose() {

  if (u9ProfileCloseTimer) {

    clearTimeout(
      u9ProfileCloseTimer
    );

    u9ProfileCloseTimer =
      null;

  }


  if (
    profileModalContent &&
    u9ProfileCloseHandler
  ) {

    profileModalContent.removeEventListener(
      "transitionend",
      u9ProfileCloseHandler
    );

  }


  u9ProfileCloseHandler =
    null;

}


/* =========================================================
   OPEN PROFILE MODAL
========================================================= */

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


  u9ProfileCancelClose();


  /*
   Always start from Profile Home.
  */

  u9ProfileGoHome(true);


  /*
   Balance is always the first
   displayed value.
  */

  u9ProfileShowingCoins =
    false;


  u9ProfileUpdateBalanceDisplay();


  profileModal.classList.remove(
    "modal-closing"
  );


  profileModal.classList.add(
    "modal-open"
  );


  if (profileUserButton) {

    profileUserButton.classList.add(
      "account-open"
    );

  }


  u9ProfileLoad();


  return true;

}


/* =========================================================
   CLOSE PROFILE MODAL
========================================================= */

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


  u9ProfileCancelClose();


  profileModal.classList.remove(
    "modal-open"
  );


  profileModal.classList.add(
    "modal-closing"
  );


  if (profileUserButton) {

    profileUserButton.classList.remove(
      "account-open"
    );

  }


  let closeFinished =
    false;


  function finishClose() {

    if (closeFinished) {

      return;

    }


    if (
      !profileModal.classList.contains(
        "modal-closing"
      )
    ) {

      return;

    }


    closeFinished =
      true;


    profileModal.classList.remove(
      "modal-closing"
    );


    u9ProfileGoHome(true);


    u9ProfileCancelClose();

  }


  u9ProfileCloseHandler =
    function (event) {

      if (
        event.target !==
        profileModalContent
      ) {

        return;

      }


      if (
        event.propertyName !==
        "transform"
      ) {

        return;

      }


      finishClose();

    };


  profileModalContent.addEventListener(
    "transitionend",
    u9ProfileCloseHandler
  );


  u9ProfileCloseTimer =
    setTimeout(
      finishClose,
      700
    );


  return true;

}


/* =========================================================
   TOGGLE PROFILE MODAL
========================================================= */

async function toggleProfileModal() {

  if (!profileModal) {

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


/* =========================================================
   USER BUTTON
========================================================= */

if (profileUserButton) {

  profileUserButton.addEventListener(
    "click",
    async function (event) {

      event.stopPropagation();


      await toggleProfileModal();

    }
  );

}


/* =========================================================
   CLOSE BUTTON
========================================================= */

if (profileModalClose) {

  profileModalClose.addEventListener(
    "click",
    function (event) {

      event.stopPropagation();


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


/* =========================================================
   RESET AVATAR
========================================================= */

function u9ProfileResetAvatar() {

  if (u9ProfileAvatarImage) {

    u9ProfileAvatarImage.dataset.u9Fallback =
      "false";


    u9ProfileAvatarImage.src =
      u9ProfileDefaultAvatar;

  }


  if (u9ProfileAvatarFrame) {

    u9ProfileAvatarFrame.dataset.u9Fallback =
      "false";


    u9ProfileAvatarFrame.src =
      u9ProfileDefaultFrame;

  }

}


/* =========================================================
   AVATAR ONERROR FALLBACK
========================================================= */

if (u9ProfileAvatarImage) {

  u9ProfileAvatarImage.addEventListener(
    "error",
    function () {

      if (
        this.dataset.u9Fallback ===
        "true"
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


/* =========================================================
   FRAME ONERROR FALLBACK
========================================================= */

if (u9ProfileAvatarFrame) {

  u9ProfileAvatarFrame.addEventListener(
    "error",
    function () {

      if (
        this.dataset.u9Fallback ===
        "true"
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


/* =========================================================
   API
========================================================= */

const u9ProfileDefaultFrameUrl =
  "https://tvtakmswbzawaweytimx.supabase.co/functions/v1/avatar-frame-default";


const u9ProfileFreeFrameUrl =
  "https://tvtakmswbzawaweytimx.supabase.co/functions/v1/avatar-frame-free";


const u9ProfilePaidFrameUrl =
  "https://tvtakmswbzawaweytimx.supabase.co/functions/v1/avatar-frame-paid";


/* =========================================================
   FRONTEND DEFAULT AVATAR
========================================================= */

const u9ProfileDefaultAvatarSvg =

  `<svg
    width="199px"
    height="199px"
    viewBox="-2.56 -2.56 21.12 21.12"
    xmlns="http://www.w3.org/2000/svg"
    fill="#000000"
    stroke="#000000"
    stroke-width="0.00016"
  >

    <g
      id="SVGRepo_bgCarrier"
      stroke-width="0"
    >

      <rect
        x="-2.56"
        y="-2.56"
        width="21.12"
        height="21.12"
        rx="0"
        fill="#ffffff"
        stroke-width="0"
      ></rect>

    </g>


    <g
      id="SVGRepo_tracerCarrier"
      stroke-linecap="round"
      stroke-linejoin="round"
    ></g>


    <g
      id="SVGRepo_iconCarrier"
    >

      <path
        d="m 8 1 c -1.65625 0 -3 1.34375 -3 3 s 1.34375 3 3 3 s 3 -1.34375 3 -3 s -1.34375 -3 -3 -3 z m -1.5 7 c -2.492188 0 -4.5 2.007812 -4.5 4.5 v 0.5 c 0 1.109375 0.890625 2 2 2 h 8 c 1.109375 0 2 -0.890625 2 -2 v -0.5 c 0 -2.492188 -2.007812 -4.5 -4.5 -4.5 z m 0 0"
        fill="#357cf1"
      ></path>

    </g>

  </svg>`;


/* =========================================================
   CONVERT DEFAULT AVATAR TO DATA URI
========================================================= */

const u9ProfileDefaultAvatar =

  "data:image/svg+xml;charset=UTF-8," +

  encodeURIComponent(
    u9ProfileDefaultAvatarSvg
  );


/* =========================================================
   FRONTEND DEFAULT FRAME
========================================================= */

const u9ProfileDefaultFrame =
  "/SSVG/avatar/ordinary.svg";


/* =========================================================
   LOAD FREE / PAID FRAME
========================================================= */

async function u9ProfileLoadFrame(
  frameType,
  frameId
) {

  if (
    !frameType ||
    frameType === "default"
  ) {

    if (u9ProfileAvatarFrame) {

      u9ProfileAvatarFrame.dataset.u9Fallback =
        "false";


      u9ProfileAvatarFrame.src =
        u9ProfileDefaultFrame;

    }


    return true;

  }


  if (!frameId) {

    if (u9ProfileAvatarFrame) {

      u9ProfileAvatarFrame.dataset.u9Fallback =
        "false";


      u9ProfileAvatarFrame.src =
        u9ProfileDefaultFrame;

    }


    return true;

  }


  let requestUrl =
    "";


  if (frameType === "free") {

    requestUrl =
      u9ProfileFreeFrameUrl;

  }

  else if (frameType === "paid") {

    requestUrl =
      u9ProfilePaidFrameUrl;

  }

  else {

    u9ProfileResetAvatar();

    return false;

  }


  try {

    const response =
      await fetch(
        requestUrl,
        {
          method: "GET"
        }
      );


    if (!response.ok) {

      u9ProfileResetAvatar();

      return false;

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


    if (!currentFrame) {

      u9ProfileResetAvatar();

      return false;

    }


    if (!currentFrame.svg) {

      u9ProfileResetAvatar();

      return false;

    }


    if (u9ProfileAvatarFrame) {

      u9ProfileAvatarFrame.dataset.u9Fallback =
        "false";


      u9ProfileAvatarFrame.src =
        currentFrame.svg;

    }


    return true;

  }

  catch (error) {

    console.error(
      "Load avatar frame failed:",
      error
    );


    u9ProfileResetAvatar();

    return false;

  }

}


/* =========================================================
   DISPLAY USER INFO
========================================================= */

function u9ProfileDisplayUser(
  user
) {

  if (!user) {

    return;

  }


  if (u9ProfileUsername) {

    u9ProfileUsername.textContent =
      user.username ||
      "";

  }


  if (u9ProfileAccount) {

    u9ProfileAccount.textContent =
      user.account ||
      "";

  }


  if (u9ProfileBalance) {

    u9ProfileBalance.textContent =
      user.balance ??
      "0.00";

  }


  if (u9ProfileCoins) {

    u9ProfileCoins.textContent =
      user.coins ??
      "0.00";

  }


  /*
   Keep Balance as default.
  */

  u9ProfileShowingCoins =
    false;


  u9ProfileUpdateBalanceDisplay();

}


/* =========================================================
   LOAD PROFILE AVATAR
========================================================= */

async function u9ProfileLoadAvatarFromUser(
  user
) {

  u9ProfileResetAvatar();


  if (!user) {

    return false;

  }


  try {

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

      u9ProfileAvatarImage.dataset.u9Fallback =
        "false";


      u9ProfileAvatarImage.src =
        avatarUrl;

    }

    else if (u9ProfileAvatarImage) {

      u9ProfileAvatarImage.dataset.u9Fallback =
        "false";


      u9ProfileAvatarImage.src =
        u9ProfileDefaultAvatar;

    }


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


    if (!frameLoaded) {

      u9ProfileResetAvatar();

      return false;

    }


    return true;

  }

  catch (error) {

    console.error(
      "Load profile avatar failed:",
      error
    );


    u9ProfileResetAvatar();

    return false;

  }

}


/* =========================================================
   LOAD PROFILE
========================================================= */

async function u9ProfileLoad() {

  u9ProfileShowLoading();


  u9ProfileResetAvatar();


  if (!window.U9User) {

    console.warn(
      "U9User is not available."
    );


    u9ProfileResetAvatar();

    u9ProfileHideLoading();

    return;

  }


  const user =
    window.U9User.get();


  if (
    !window.U9User.isLoggedIn() ||
    !user
  ) {

    u9ProfileResetAvatar();

    u9ProfileHideLoading();

    return;

  }


  try {

    u9ProfileDisplayUser(
      user
    );


    const avatarLoaded =
      await u9ProfileLoadAvatarFromUser(
        user
      );


    if (!avatarLoaded) {

      u9ProfileResetAvatar();

    }


    u9ProfileHideLoading();


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

    u9ProfileHideLoading();

  }

}


/* =========================================================
   WINDOW MANAGER
========================================================= */

if (window.U9WindowManager) {

  window.U9WindowManager.register(
    "profile",
    {

      open:
        openProfileModal,

      close:
        closeProfileModal,

      isOpen:
        function () {

          if (!profileModal) {

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


/* =========================================================
   INITIAL RESET
========================================================= */

u9ProfileGoHome(true);


u9ProfileResetAvatar();


/*
  Balance is the default value.
*/

u9ProfileShowingCoins =
  false;


u9ProfileUpdateBalanceDisplay();


/* =========================================================
   GLOBAL ACCESS
========================================================= */

window.openProfileModal =
  openProfileModal;


window.closeProfileModal =
  closeProfileModal;


window.toggleProfileModal =
  toggleProfileModal;


/* =========================================================
   PROFILE PAGE API
========================================================= */

window.U9ProfilePages = {

  open:
    u9ProfileOpenPage,

  back:
    u9ProfileGoBack,

  home:
    function () {

      return u9ProfileGoHome(true);

    },

  current:
    function () {

      return u9ProfileCurrentPage;

    }

};


/* =========================================================
   PROFILE GLOBAL API
========================================================= */

window.U9Profile = {

  load:
    u9ProfileLoad,

  refresh:
    u9ProfileLoad,

  openPage:
    u9ProfileOpenPage,

  back:
    u9ProfileGoBack,

  home:
    function () {

      return u9ProfileGoHome(true);

    },

  current:
    function () {

      return u9ProfileCurrentPage;

    }

};


/* =========================================================
   AVATAR GLOBAL API
========================================================= */

window.U9ProfileAvatar = {

  load:
    u9ProfileLoad,

  refresh:
    u9ProfileLoad

};
