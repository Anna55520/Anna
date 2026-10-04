/* =========================================================
   PROFILE
   JS/PROFILE/PROFILE/profile.js
========================================================= */


/* =========================================================
   MODAL
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
   PROFILE HOME
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
   PROFILE INFO
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
   BALANCE TOGGLE
========================================================= */

const u9ProfileBalanceToggle =
  document.getElementById(
    "U9-profile-balance-toggle"
  );


/* =========================================================
   AVATAR
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
   PAGE 1 - 7
========================================================= */

for (
  let i = 1;
  i <= 7;
  i++
) {

  u9ProfilePages[i] = {

    page:
      document.getElementById(
        `U9-profile-page-${i}`
      ),

    header:
      document.getElementById(
        `U9-profile-page-${i}-header`
      ),

    title:
      document.getElementById(
        `U9-profile-page-${i}-title`
      ),

    icon:
      document.getElementById(
        `U9-profile-page-${i}-icon`
      ),

    body:
      document.getElementById(
        `U9-profile-page-${i}-body`
      ),

    back:
      document.getElementById(
        `U9-profile-page-${i}-back`
      )

  };

}


/* =========================================================
   PAGE TITLES
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
   PAGE CLASSES
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
   PAGE STATE
========================================================= */

let u9ProfileCurrentPage = 0;

let u9ProfilePageAnimating = false;

let u9ProfileBackActionRunning = false;

const u9ProfilePageAnimationDuration = 380;


/* =========================================================
   DEFAULT FRAME
========================================================= */

const u9ProfileDefaultFrame =
  "/SSVG/avatar/ordinary.svg";


/* =========================================================
   FRAME API
========================================================= */

const u9ProfileDefaultFrameUrl =
  "https://tvtakmswbzawaweytimx.supabase.co/functions/v1/avatar-frame-default";

const u9ProfileFreeFrameUrl =
  "https://tvtakmswbzawaweytimx.supabase.co/functions/v1/avatar-frame-free";

const u9ProfilePaidFrameUrl =
  "https://tvtakmswbzawaweytimx.supabase.co/functions/v1/avatar-frame-paid";


/* =========================================================
   DEFAULT AVATAR
========================================================= */

const u9ProfileDefaultAvatar =
  "data:image/svg+xml;charset=UTF-8," +
  encodeURIComponent(`
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 200"
    >
      <circle
        cx="100"
        cy="100"
        r="100"
        fill="#eeeeee"
      />
      <circle
        cx="100"
        cy="78"
        r="34"
        fill="#aaaaaa"
      />
      <path
        d="
          M42 170
          C42 136 67 116 100 116
          C133 116 158 136 158 170
          Z
        "
        fill="#aaaaaa"
      />
    </svg>
  `);


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
   RESET PAGE CLASSES
========================================================= */

function u9ProfileResetPageClasses() {

  if (profileHome) {

    u9ProfileRemovePageClasses(
      profileHome
    );

  }

  Object.values(
    u9ProfilePages
  ).forEach(
    function (pageData) {

      if (pageData?.page) {

        u9ProfileRemovePageClasses(
          pageData.page
        );

      }

    }
  );

}


/* =========================================================
   RESET PAGE SCROLL
========================================================= */

function u9ProfileResetPageScroll() {

  if (profileHomeBody) {

    profileHomeBody.scrollTop = 0;

  }

  Object.values(
    u9ProfilePages
  ).forEach(
    function (pageData) {

      if (pageData?.body) {

        pageData.body.scrollTop = 0;

      }

    }
  );

}


/* =========================================================
   GO HOME
========================================================= */

function u9ProfileGoHome(
  immediate = false
) {

  if (!profileHome) {
    return false;
  }

  u9ProfileCurrentPage = 0;

  u9ProfilePageAnimating = false;

  u9ProfileBackActionRunning = false;

  u9ProfileResetPageClasses();

  profileHome.classList.add(
    "U9-profile-page-active"
  );

  profileHome.classList.add(
    "U9-profile-page-current"
  );

  if (immediate) {

    profileHome.style.transition =
      "none";

    void profileHome.offsetWidth;

    profileHome.style.transition = "";

  }

  u9ProfileResetPageScroll();

  return true;

}


/* =========================================================
   PREPARE PAGE
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

  u9ProfileRemovePageClasses(
    pageData.page
  );

  pageData.page.classList.add(
    "U9-profile-page-slide-from-right"
  );

  if (pageData.title) {

    pageData.title.textContent =
      u9ProfilePageTitles[
        pageNumber
      ] || "";

  }

  if (pageData.body) {

    pageData.body.scrollTop = 0;

  }

  return true;

}


/* =========================================================
   OPEN PAGE
========================================================= */

function u9ProfileOpenPage(
  pageNumber
) {

  if (
    !u9ProfilePages[
      pageNumber
    ]
  ) {

    return false;

  }

  if (
    u9ProfilePageAnimating
  ) {

    return false;

  }

  if (
    u9ProfileCurrentPage ===
    pageNumber
  ) {

    return false;

  }

  const currentPage =
    u9ProfileCurrentPage === 0
      ? profileHome
      : u9ProfilePages[
          u9ProfileCurrentPage
        ]?.page;

  const nextPage =
    u9ProfilePages[
      pageNumber
    ]?.page;

  if (
    !currentPage ||
    !nextPage
  ) {

    return false;

  }

  u9ProfilePageAnimating = true;

  u9ProfileBackActionRunning = false;

  /*
   * ==========================================
   * NEXT PAGE
   * RIGHT → CENTER
   * ==========================================
   */

  u9ProfileRemovePageClasses(
    nextPage
  );

  nextPage.classList.add(
    "U9-profile-page-slide-from-right"
  );

  /*
   * Force browser to apply
   * the starting position.
   */

  void nextPage.offsetWidth;

  /*
   * ==========================================
   * CURRENT PAGE
   * CENTER → LEFT
   * ==========================================
   */

  u9ProfileRemovePageClasses(
    currentPage
  );

  currentPage.classList.add(
    "U9-profile-page-slide-left"
  );

  /*
   * ==========================================
   * NEXT PAGE
   * RIGHT → CENTER
   * ==========================================
   */

  nextPage.classList.remove(
    "U9-profile-page-slide-from-right"
  );

  nextPage.classList.add(
    "U9-profile-page-active"
  );

  nextPage.classList.add(
    "U9-profile-page-current"
  );

  /*
   * Current page number changes
   * immediately so Back knows
   * which page is currently open.
   */

  u9ProfileCurrentPage =
    pageNumber;

  if (
    nextPage ===
    u9ProfilePages[
      pageNumber
    ]?.page
  ) {

    const body =
      u9ProfilePages[
        pageNumber
      ]?.body;

    if (body) {

      body.scrollTop = 0;

    }

  }

  setTimeout(
    function () {

      /*
       * Remove the old page
       * after animation completes.
       */

      u9ProfileRemovePageClasses(
        currentPage
      );

      /*
       * Make sure the new page
       * remains centered.
       */

      u9ProfileRemovePageClasses(
        nextPage
      );

      nextPage.classList.add(
        "U9-profile-page-active"
      );

      nextPage.classList.add(
        "U9-profile-page-current"
      );

      u9ProfilePageAnimating =
        false;

    },
    u9ProfilePageAnimationDuration
  );

  return true;

}


/* =========================================================
   GO BACK
========================================================= */

function u9ProfileGoBack() {

  if (
    u9ProfileBackActionRunning
  ) {

    return false;

  }

  if (
    u9ProfileCurrentPage === 0
  ) {

    return false;

  }

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

  u9ProfileBackActionRunning =
    true;

  u9ProfilePageAnimating =
    true;

  /*
   * ==========================================
   * IMPORTANT
   *
   * Profile Home must start
   * from LEFT.
   *
   * Button Page is CENTER.
   *
   * ==========================================
   */

  u9ProfileRemovePageClasses(
    previousPage
  );

  previousPage.classList.add(
    "U9-profile-page-slide-from-left"
  );

  /*
   * Force browser to render
   * Profile at -100% first.
   */

  void previousPage.offsetWidth;

  /*
   * ==========================================
   * BUTTON PAGE
   * CENTER → RIGHT
   * ==========================================
   */

  u9ProfileRemovePageClasses(
    currentPage
  );

  currentPage.classList.add(
    "U9-profile-page-slide-right"
  );

  /*
   * ==========================================
   * PROFILE HOME
   * LEFT → CENTER
   * ==========================================
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
   * Current page is now HOME.
   */

  u9ProfileCurrentPage = 0;

  if (profileHomeBody) {

    profileHomeBody.scrollTop = 0;

  }

  /*
   * ==========================================
   * CLEAN UP AFTER ANIMATION
   * ==========================================
   */

  setTimeout(
    function () {

      /*
       * Remove Button Page completely
       * after it reaches the RIGHT.
       */

      u9ProfileRemovePageClasses(
        currentPage
      );

      /*
       * Make sure Profile Home
       * remains centered.
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
   AUTH CHECK
========================================================= */

async function u9ProfileCanOpen() {

  try {

    const response =
      await fetch(
        "/functions/v1/profile",
        {
          method: "GET",
          credentials: "include"
        }
      );

    if (!response.ok) {

      return false;

    }

    return true;

  } catch (error) {

    console.error(
      "Profile auth check failed:",
      error
    );

    return false;

  }

}


/* =========================================================
   MODAL OPEN
========================================================= */

async function openProfileModal() {

  if (
    !profileModal ||
    !profileModalContent
  ) {

    return false;

  }

  const canOpen =
    await u9ProfileCanOpen();

  if (!canOpen) {

    return false;

  }

  /*
   * Always start from Profile Home.
   */

  u9ProfileGoHome(true);

  profileModal.classList.remove(
    "modal-closing"
  );

  profileModal.classList.add(
    "modal-open"
  );

  /*
   * Load profile information.
   */

  u9ProfileLoad();

  return true;

}


/* =========================================================
   MODAL CLOSE
========================================================= */

function closeProfileModal() {

  if (!profileModal) {

    return false;

  }

  profileModal.classList.remove(
    "modal-open"
  );

  profileModal.classList.add(
    "modal-closing"
  );

  setTimeout(
    function () {

      if (
        profileModal.classList.contains(
          "modal-closing"
        )
      ) {

        profileModal.classList.remove(
          "modal-closing"
        );

      }

    },
    450
  );

  return true;

}


/* =========================================================
   TOGGLE MODAL
========================================================= */

function toggleProfileModal() {

  if (
    profileModal?.classList.contains(
      "modal-open"
    )
  ) {

    return closeProfileModal();

  }

  return openProfileModal();

}


/* =========================================================
   CLOSE BUTTON
========================================================= */

if (profileModalClose) {

  profileModalClose.onclick =
    function (event) {

      event.preventDefault();

      event.stopPropagation();

      closeProfileModal();

    };

}


/* =========================================================
   PROFILE HEADER BUTTON
========================================================= */

if (profileUserButton) {

  profileUserButton.onclick =
    function (event) {

      event.preventDefault();

      event.stopPropagation();

      openProfileModal();

    };

}


/* =========================================================
   BALANCE / COINS TOGGLE
========================================================= */

if (u9ProfileBalanceToggle) {

  u9ProfileBalanceToggle.onclick =
    function () {

      const balanceHidden =
        u9ProfileBalance?.classList.contains(
          "U9-profile-value-hidden"
        );

      if (
        u9ProfileBalance &&
        u9ProfileCoins
      ) {

        if (balanceHidden) {

          u9ProfileBalance.classList.remove(
            "U9-profile-value-hidden"
          );

          u9ProfileBalance.classList.add(
            "U9-profile-value-active"
          );

          u9ProfileCoins.classList.remove(
            "U9-profile-value-active"
          );

          u9ProfileCoins.classList.add(
            "U9-profile-value-hidden"
          );

        } else {

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

      }

    };

}


/* =========================================================
   PROFILE BUTTONS
========================================================= */

Object.entries(
  u9ProfileButtons
).forEach(
  function (
    [
      pageNumber,
      button
    ]
  ) {

    if (!button) {
      return;
    }

    button.onclick =
      function (event) {

        event.preventDefault();

        event.stopPropagation();

        u9ProfileOpenPage(
          Number(pageNumber)
        );

      };

  }
);


/* =========================================================
   BACK BUTTONS
========================================================= */

Object.values(
  u9ProfilePages
).forEach(
  function (pageData) {

    if (
      !pageData?.back
    ) {

      return;

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
);


/* =========================================================
   AVATAR FRAME
========================================================= */

function u9ProfileSetDefaultFrame() {

  if (!u9ProfileAvatarFrame) {
    return;
  }

  u9ProfileAvatarFrame.src =
    u9ProfileDefaultFrame;

}


/* =========================================================
   LOAD FRAME
========================================================= */

async function u9ProfileLoadFrame() {

  if (!u9ProfileAvatarFrame) {
    return;
  }

  u9ProfileSetDefaultFrame();

  try {

    const response =
      await fetch(
        u9ProfileDefaultFrameUrl,
        {
          method: "GET",
          credentials: "include"
        }
      );

    if (!response.ok) {

      return;

    }

    const data =
      await response.json();

    if (
      data &&
      data.frame_url
    ) {

      u9ProfileAvatarFrame.src =
        data.frame_url;

    }

  } catch (error) {

    console.error(
      "Failed to load profile frame:",
      error
    );

  }

}


/* =========================================================
   LOAD PROFILE
========================================================= */

async function u9ProfileLoad() {

  if (
    !u9ProfileInfoLoading &&
    !u9ProfileInfo
  ) {

    return;

  }

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

  try {

    const response =
      await fetch(
        "/functions/v1/profile",
        {
          method: "GET",
          credentials: "include"
        }
      );

    if (!response.ok) {

      throw new Error(
        "Profile request failed"
      );

    }

    const data =
      await response.json();

    const user =
      data?.user ||
      data;

    if (
      u9ProfileUsername
    ) {

      u9ProfileUsername.textContent =
        user?.username ||
        "";

    }

    if (
      u9ProfileAccount
    ) {

      u9ProfileAccount.textContent =
        user?.account ||
        "";

    }

    if (
      u9ProfileBalance
    ) {

      u9ProfileBalance.textContent =
        user?.balance ??
        "0";

    }

    if (
      u9ProfileCoins
    ) {

      u9ProfileCoins.textContent =
        user?.coins ??
        "0";

    }

    if (
      u9ProfileAvatarImage
    ) {

      u9ProfileAvatarImage.src =
        user?.avatar_url ||
        u9ProfileDefaultAvatar;

      u9ProfileAvatarImage.onerror =
        function () {

          this.onerror = null;

          this.src =
            u9ProfileDefaultAvatar;

        };

    }

    await u9ProfileLoadFrame();

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

  } catch (error) {

    console.error(
      "Failed to load profile:",
      error
    );

    if (u9ProfileAvatarImage) {

      u9ProfileAvatarImage.src =
        u9ProfileDefaultAvatar;

    }

    u9ProfileSetDefaultFrame();

    if (u9ProfileInfoLoading) {

      u9ProfileInfoLoading.classList.add(
        "hidden"
      );

    }

  }

}


/* =========================================================
   WINDOW MANAGER
========================================================= */

if (
  window.U9WindowManager &&
  typeof window.U9WindowManager.register ===
    "function"
) {

  window.U9WindowManager.register(
    "profile",
    profileModal,
    closeProfileModal
  );

}


/* =========================================================
   INITIAL STATE
========================================================= */

u9ProfileGoHome(true);


/* =========================================================
   GLOBAL API
========================================================= */

window.openProfileModal =
  openProfileModal;

window.closeProfileModal =
  closeProfileModal;

window.toggleProfileModal =
  toggleProfileModal;


window.U9ProfilePages = {

  open:
    u9ProfileOpenPage,

  back:
    u9ProfileGoBack,

  home:
    function () {

      return u9ProfileGoHome(
        true
      );

    },

  current:
    function () {

      return u9ProfileCurrentPage;

    }

};


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

      return u9ProfileGoHome(
        true
      );

    },

  current:
    function () {

      return u9ProfileCurrentPage;

    }

};


window.U9ProfileAvatar = {

  load:
    u9ProfileLoad,

  refresh:
    u9ProfileLoad

};
