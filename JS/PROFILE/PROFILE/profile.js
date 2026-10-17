
/* =========================
   PROFILE MODAL
========================= */

/* =========================
   ELEMENTS
========================= */

const profileModal =
  document.getElementById("U9-profile-modal");

const profileModalContent =
  document.getElementById("U9-profile-modal-content");

const profileModalHeader =
  document.getElementById("U9-profile-modal-header");

const profileModalClose =
  document.getElementById("U9-profile-modal-close");

const profileModalCloseIcon =
  document.getElementById("U9-profile-modal-close-icon");

const profileModalTitle =
  document.getElementById("U9-profile-modal-title");

const profileModalIcon =
  document.getElementById("U9-profile-modal-icon");

const profileUserButton =
  document.getElementById("U9-page-header-user");


/* =========================
   PROFILE HEADER DEFAULT
========================= */

const u9ProfileMainTitle = "Profile";

const u9ProfileMainIcon = "SSVG/logo/U9website.svg";

const u9ProfileMainCloseIcon = "SSVG/account/close.svg";

const u9ProfileBackIcon = "SSVG/account/back.svg";

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
  document.getElementById("U9-profile-info-loading");

const u9ProfileInfo =
  document.getElementById("U9-profile-info");

const u9ProfileUsername =
  document.getElementById("U9-profile-username");

const u9ProfileAccount =
  document.getElementById("U9-profile-account");

const u9ProfileBalanceContainer =
  document.getElementById("U9-profile-balance-container");

const u9ProfileBalanceTitle =
  document.getElementById("U9-profile-balance-title");

const u9ProfileBalanceValueRow =
  document.getElementById("U9-profile-balance-value-row");

const u9ProfileBalance =
  document.getElementById("U9-profile-balance");

const u9ProfileCoins =
  document.getElementById("U9-profile-coins");

const u9ProfileBalanceToggle =
  document.getElementById("U9-profile-balance-toggle");


/* =========================
   BALANCE / COINS STATE
========================= */

let u9ProfileBalanceMode = "balance";

let u9ProfileBalanceRefreshPromise = null;

/* =========================
   PROFILE INITIAL LOAD STATE
========================= */

let u9ProfileHasLoaded = false;
let u9ProfileLoadPromise = null;


/* =========================
   PROFILE MAIN PAGE
========================= */

const u9ProfileMain =
  document.getElementById("U9-profile-main");


/* =========================
   PROFILE PAGE BUTTONS
========================= */

const u9ProfileButton1 =
  document.getElementById("U9-profile-button-1");

const u9ProfileButton2 =
  document.getElementById("U9-profile-button-2");

const u9ProfileButton3 =
  document.getElementById("U9-profile-button-3");

const u9ProfileButton4 =
  document.getElementById("U9-profile-button-4");

const u9ProfileButton5 =
  document.getElementById("U9-profile-button-5");

const u9ProfileButton6 =
  document.getElementById("U9-profile-button-6");


/* =========================
   PROFILE INTERNAL PAGES
========================= */

const u9ProfilePage1 =
  document.getElementById("U9-profile-page1");

const u9ProfilePage2 =
  document.getElementById("U9-profile-page2");

const u9ProfilePage3 =
  document.getElementById("U9-profile-page3");

const u9ProfilePage4 =
  document.getElementById("U9-profile-page4");

const u9ProfilePage5 =
  document.getElementById("U9-profile-page5");

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
  document.getElementById("U9-profile-avatar-image");

const u9ProfileAvatarFrame =
  document.getElementById("U9-profile-avatar-frame");


/* =========================
   API
========================= */

const u9ProfileFreeFrameUrl = "/api/avatar-frame-free";

const u9ProfilePaidFrameUrl =
  "https://tvtakmswbzawaweytimx.supabase.co/functions/v1/avatar-frame-paid";


/* =========================
   FRONTEND DEFAULT AVATAR
========================= */

const u9ProfileDefaultAvatarSvg =
  `<svg width="199px" height="199px" viewBox="-2.56 -2.56 21.12 21.12" xmlns="http://www.w3.org/2000/svg" fill="#000000" stroke="#000000" stroke-width="0.00016"><g id="SVGRepo_bgCarrier" stroke-width="0"><rect x="-2.56" y="-2.56" width="21.12" height="21.12" rx="0" fill="#ffffff" stroke-width="0"></rect></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="m 8 1 c -1.65625 0 -3 1.34375 -3 3 s 1.34375 3 3 3 s 3 -1.34375 3 -3 s -1.34375 -3 -3 -3 z m -1.5 7 c -2.492188 0 -4.5 2.007812 -4.5 4.5 v 0.5 c 0 1.109375 0.890625 2 2 2 h 8 c 1.109375 0 2 -0.890625 2 -2 v -0.5 c 0 -2.492188 -2.007812 -4.5 -4.5 -4.5 z m 0 0" fill="#357cf1"></path></g></svg>`;

const u9ProfileDefaultAvatar =
  "data:image/svg+xml;charset=UTF-8," +
  encodeURIComponent(u9ProfileDefaultAvatarSvg);


/* =========================
   FRONTEND DEFAULT FRAME
========================= */

const u9ProfileDefaultFrame =
  "/SSVG/avatar/ordinary.svg";


/* =========================
   PROFILE INTERNAL PAGE STATE
========================= */

let u9ProfileCurrentPage = "main";


/* =========================
   GET AUTH TOKEN
========================= */

function u9ProfileGetToken() {
  try {
    return localStorage.getItem("u9_token");
  } catch (error) {
    console.error("Get U9 token failed:", error);
    return null;
  }
}


/* =========================
   BUILD AUTH HEADERS
========================= */

function u9ProfileAuthHeaders() {
  const token = u9ProfileGetToken();
  const headers = {};

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}


}


/* =========================
   FORMAT MONEY / COINS
========================= */

function u9ProfileFormatValue(value) {
  if (value === null || value === undefined || value === "") {
    return "0.00";
  }

  const number = Number(value);

  if (!Number.isFinite(number)) {
    return String(value);
  }

  return number.toFixed(2);
}


/* =========================
   UPDATE BALANCE / COINS
========================= */

function u9ProfileUpdateBalanceCoins(user) {
  if (!user) {
    return false;
  }

  if (
    u9ProfileBalance &&
    user.balance !== undefined &&
    user.balance !== null
  ) {
    u9ProfileBalance.textContent =
      u9ProfileFormatValue(user.balance);
  }

  if (
    u9ProfileCoins &&
    user.coins !== undefined &&
    user.coins !== null
  ) {
    u9ProfileCoins.textContent =
      u9ProfileFormatValue(user.coins);
  }

  return true;
}


/* =========================
   RESET BALANCE / COINS
========================= */

function u9ProfileResetBalanceMode() {
  u9ProfileBalanceMode = "balance";

  if (u9ProfileBalanceTitle) {
    u9ProfileBalanceTitle.textContent = "Balance";
  }

  if (u9ProfileBalance) {
    u9ProfileBalance.hidden = false;
  }

  if (u9ProfileCoins) {
    u9ProfileCoins.hidden = true;
  }

  if (u9ProfileBalanceToggle) {
    u9ProfileBalanceToggle.setAttribute(
      "aria-label",
      "Refresh balance and coins, then show coins"
    );
  }
}


/* =========================
   REFRESH BALANCE / COINS
========================= */

async function u9ProfileRefreshBalanceCoins() {
  if (u9ProfileBalanceRefreshPromise) {
    return u9ProfileBalanceRefreshPromise;
  }

  if (
    !window.U9User ||
    typeof window.U9User.isLoggedIn !== "function" ||
    !window.U9User.isLoggedIn()
  ) {
    console.warn(
      "Cannot refresh Balance / Coins: user is logged out."
    );

    return false;
  }

  u9ProfileBalanceRefreshPromise = (async function() {
    try {
      const response = await fetch("/api/me", {
        method: "GET",
        headers: u9ProfileAuthHeaders(),
        credentials: "omit",
        cache: "no-store"
      });

      if (!response.ok) {
        console.warn(
          "Balance / Coins request failed:",
          response.status
        );
        return false;
      }

      const result = await response.json();

      // Support common API response shapes.
      const user =
        result.user ||
        result.data?.user ||
        result.data ||
        result;

      if (
        !user ||
        user.balance === undefined ||
        user.coins === undefined
      ) {
        console.warn(
          "Balance / Coins response is missing values."
        );
        return false;
      }

      // Update only Profile's Balance and Coins.
      u9ProfileUpdateBalanceCoins(user);

      return true;
    } catch (error) {
      console.error(
        "Refresh Balance / Coins failed:",
        error
      );

      return false;
    } finally {
      u9ProfileBalanceRefreshPromise = null;
    }
  })();

  return u9ProfileBalanceRefreshPromise;
}



/* =========================
   TOGGLE BALANCE / COINS
   ALSO REFRESH DATA
========================= */

async function u9ProfileToggleBalanceCoins() {
  if (
    !u9ProfileBalanceTitle ||
    !u9ProfileBalance ||
    !u9ProfileCoins ||
    !u9ProfileBalanceToggle
  ) {
    return false;
  }

  /*
   * Toggle the display immediately.
   * Do not make the user wait for the network.
   */

  if (u9ProfileBalanceMode === "balance") {
    u9ProfileBalanceMode = "coins";

    u9ProfileBalanceTitle.textContent = "Coins";
    u9ProfileBalance.hidden = true;
    u9ProfileCoins.hidden = false;

    u9ProfileBalanceToggle.setAttribute(
      "aria-label",
      "Refresh balance and coins, then show balance"
    );
  } else {
    u9ProfileBalanceMode = "balance";

    u9ProfileBalanceTitle.textContent = "Balance";
    u9ProfileBalance.hidden = false;
    u9ProfileCoins.hidden = true;

    u9ProfileBalanceToggle.setAttribute(
      "aria-label",
      "Refresh balance and coins, then show coins"
    );
  }

  /*
   * Refresh both values after switching.
   * If the request fails, retain the displayed values.
   */

  await u9ProfileRefreshBalanceCoins();

  return true;
}


/* =========================
   BALANCE / COINS TOGGLE
========================= */

if (u9ProfileBalanceToggle) {
  u9ProfileBalanceToggle.addEventListener(
    "click",
    function(event) {
      event.preventDefault();
      event.stopPropagation();

      u9ProfileToggleBalanceCoins();
    }
  );
}


/* =========================
   SET PROFILE HEADER
========================= */

function u9ProfileSetHeader(page) {
  if (page === "main") {
    if (profileModalCloseIcon) {
      profileModalCloseIcon.src = u9ProfileMainCloseIcon;
    }

    if (profileModalClose) {
      profileModalClose.setAttribute("aria-label", "Close");
    }

    if (profileModalTitle) {
      profileModalTitle.textContent = u9ProfileMainTitle;
    }

    if (profileModalIcon) {
      profileModalIcon.src = u9ProfileMainIcon;
    }

    return;
  }

  const pageNumber = Number(
    String(page).replace("page", "")
  );

  const pageTitle = u9ProfilePageTitles[pageNumber];

  if (!pageTitle) {
    return;
  }

  if (profileModalCloseIcon) {
    profileModalCloseIcon.src = u9ProfileBackIcon;
  }

  if (profileModalClose) {
    profileModalClose.setAttribute("aria-label", "Back");
  }

  if (profileModalTitle) {
    profileModalTitle.textContent = pageTitle;
  }

  if (profileModalIcon) {
    profileModalIcon.src = u9ProfilePageIcon;
  }
}


/* =========================
   HIDE ALL PROFILE PAGES
========================= */

function u9ProfileHideAllPages() {
  if (u9ProfileMain) {
    u9ProfileMain.classList.remove("profile-page-active");
    u9ProfileMain.style.display = "none";
  }

  u9ProfilePages.forEach(function(page) {
    if (!page) {
      return;
    }

    page.classList.remove("profile-page-active");
    page.style.display = "none";
  });
}


/* =========================
   SHOW PROFILE MAIN PAGE
========================= */

function u9ProfileShowMainPage() {
  u9ProfileHideAllPages();

  if (u9ProfileMain) {
    u9ProfileMain.style.display = "block";
    u9ProfileMain.classList.add("profile-page-active");
  }

  u9ProfileCurrentPage = "main";

  u9ProfileSetHeader("main");

  u9ProfileResetBalanceMode();
}


/* =========================
   SHOW PROFILE INTERNAL PAGE
========================= */

function u9ProfileShowPage(pageNumber) {
  const page = document.getElementById(
    "U9-profile-page" + pageNumber
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

  u9ProfileHideAllPages();

  page.style.display = "block";
  page.classList.add("profile-page-active");

  u9ProfileCurrentPage = "page" + pageNumber;

  u9ProfileSetHeader(u9ProfileCurrentPage);

  return true;
}


/* =========================
   PROFILE INFO LOADING
   DO NOT HIDE PROFILE INFO
========================= */

function u9ProfileShowLoading() {
  if (u9ProfileInfoLoading) {
    u9ProfileInfoLoading.classList.remove("hidden");
  }

  /*
   * IMPORTANT:
   * Do not remove "loaded" here.
   *
   * Removing it can hide the whole profile info area,
   * including #U9-profile-balance-container.
   */
}


/* =========================
   PROFILE INFO COMPLETE
========================= */

function u9ProfileHideLoading() {
  if (u9ProfileInfoLoading) {
    u9ProfileInfoLoading.classList.add("hidden");
  }

  if (u9ProfileInfo) {
    u9ProfileInfo.classList.add("loaded");
  }

  /*
   * Keep the balance container visible.
   */

  if (u9ProfileBalanceContainer) {
    u9ProfileBalanceContainer.style.display = "flex";
  }
}


/* =========================
   CHECK PROFILE AUTH
========================= */

function u9ProfileCanOpen() {
  if (!window.U9User) {
    console.warn("U9User is not available.");
    return false;
  }

  if (!window.U9User.isLoggedIn()) {
    return false;
  }

  if (!window.U9User.get()) {
    return false;
  }

  return true;
}


/* =========================
   LOAD PROFILE ONCE
========================= */

async function u9ProfileLoadOnce() {
  if (u9ProfileHasLoaded) {
    return true;
  }

  // Prevent duplicate requests if Profile is opened repeatedly
  // while the first load is still in progress.
  if (u9ProfileLoadPromise) {
    return u9ProfileLoadPromise;
  }

  u9ProfileLoadPromise = (async function() {
    try {
      const loaded = await u9ProfileLoad();

      if (loaded) {
        u9ProfileHasLoaded = true;
      }

      return loaded;
    } finally {
      u9ProfileLoadPromise = null;
    }
  })();

  return u9ProfileLoadPromise;
}


/* =========================
   OPEN PROFILE MODAL
========================= */

function openProfileModal() {
  if (!profileModal || !profileModalContent) {
    return false;
  }

  if (!u9ProfileCanOpen()) {
    console.warn(
      "Profile cannot open: user is not authenticated."
    );

    return false;
  }

  u9ProfileShowMainPage();

  profileModal.classList.remove("modal-closing");
  profileModal.classList.add("modal-open");

  if (profileUserButton) {
    profileUserButton.classList.add("account-open");
  }

  // Load profile data only on the first successful open.
  // Reopening the modal keeps the existing user/avatar/frame content.
  u9ProfileLoadOnce();

  return true;
}


/* =========================
   CLOSE PROFILE MODAL
========================= */

function closeProfileModal() {
  if (!profileModal || !profileModalContent) {
    return false;
  }

  if (!profileModal.classList.contains("modal-open")) {
    return true;
  }

  u9ProfileShowMainPage();

  profileModal.classList.remove("modal-open");
  profileModal.classList.add("modal-closing");

  if (profileUserButton) {
    profileUserButton.classList.remove("account-open");
  }

  let closeFinished = false;

  function finishClose() {
    if (closeFinished) {
      return;
    }

    closeFinished = true;

    profileModal.classList.remove("modal-closing");

    profileModalContent.removeEventListener(
      "transitionend",
      handleCloseAnimation
    );
  }

  function handleCloseAnimation(event) {
    if (event.propertyName !== "transform") {
      return;
    }

    finishClose();
  }

  profileModalContent.addEventListener(
    "transitionend",
    handleCloseAnimation
  );

  setTimeout(finishClose, 700);

  return true;
}


/* =========================
   TOGGLE PROFILE MODAL
========================= */

async function toggleProfileModal() {
  if (!profileModal) {
    return false;
  }

  if (profileModal.classList.contains("modal-open")) {
    if (window.U9WindowManager) {
      await window.U9WindowManager.close("profile");
    } else {
      closeProfileModal();
    }

    return true;
  }

  if (window.U9WindowManager) {
    return await window.U9WindowManager.open("profile");
  }

  return openProfileModal();
}


/* =========================
   HEADER USER BUTTON
========================= */

if (profileUserButton) {
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

if (profileModalClose) {
  profileModalClose.addEventListener(
    "click",
    async function() {
      if (u9ProfileCurrentPage === "main") {
        if (window.U9WindowManager) {
          await window.U9WindowManager.close("profile");
        } else {
          closeProfileModal();
        }

        return;
      }

      u9ProfileShowMainPage();
    }
  );
}


/* =========================
   PROFILE BUTTON 1
========================= */

if (u9ProfileButton1) {
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

if (u9ProfileButton2) {
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

if (u9ProfileButton3) {
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

if (u9ProfileButton4) {
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

if (u9ProfileButton5) {
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

if (u9ProfileButton6) {
  u9ProfileButton6.addEventListener(
    "click",
    function(event) {
      event.stopPropagation();

      if (typeof window.openLogoutConfirm === "function") {
        window.openLogoutConfirm();
      } else if (typeof openLogoutConfirm === "function") {
        openLogoutConfirm();
      } else {
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
  if (u9ProfileAvatarImage) {
    u9ProfileAvatarImage.dataset.u9Fallback = "false";
    u9ProfileAvatarImage.src = u9ProfileDefaultAvatar;
  }

  if (u9ProfileAvatarFrame) {
    u9ProfileAvatarFrame.dataset.u9Fallback = "false";
    u9ProfileAvatarFrame.src = u9ProfileDefaultFrame;
  }
}


/* =========================
   AVATAR ONERROR FALLBACK
========================= */

if (u9ProfileAvatarImage) {
  u9ProfileAvatarImage.addEventListener(
    "error",
    function() {
      if (this.dataset.u9Fallback === "true") {
        return;
      }

      this.dataset.u9Fallback = "true";
      this.src = u9ProfileDefaultAvatar;
    }
  );
}


/* =========================
   FRAME ONERROR FALLBACK
========================= */

if (u9ProfileAvatarFrame) {
  u9ProfileAvatarFrame.addEventListener(
    "error",
    function() {
      if (this.dataset.u9Fallback === "true") {
        return;
      }

      this.dataset.u9Fallback = "true";
      this.src = u9ProfileDefaultFrame;
    }
  );
}


/* =========================
   LOAD FREE / PAID FRAME
========================= */

async function u9ProfileLoadFrame(frameType, frameId) {
  if (!frameType || frameType === "default") {
    if (u9ProfileAvatarFrame) {
      u9ProfileAvatarFrame.dataset.u9Fallback = "false";
      u9ProfileAvatarFrame.src = u9ProfileDefaultFrame;
    }

    return true;
  }

  if (!frameId) {
    if (u9ProfileAvatarFrame) {
      u9ProfileAvatarFrame.dataset.u9Fallback = "false";
      u9ProfileAvatarFrame.src = u9ProfileDefaultFrame;
    }

    return true;
  }

  let requestUrl = "";

  if (frameType === "free") {
    requestUrl = u9ProfileFreeFrameUrl;
  } else if (frameType === "paid") {
    requestUrl = u9ProfilePaidFrameUrl;
  } else {
    u9ProfileResetAvatar();
    return false;
  }

  try {
    const headers = u9ProfileAuthHeaders();

    const response = await fetch(
      requestUrl,
      {
        method: "GET",
        headers,
        credentials: "omit",
        cache: "no-store"
      }
    );

    if (!response.ok) {
      console.warn(
        "Profile frame request failed:",
        response.status,
        frameType
      );

      u9ProfileResetAvatar();
      return false;
    }

    const result = await response.json();

    const frames =
      result.frames ||
      result.data?.frames ||
      [];

    const currentFrame = frames.find(function(frame) {
      return frame.id === frameId;
    });

    if (!currentFrame || !currentFrame.svg) {
      console.warn(
        "Current profile frame not found or SVG missing:",
        frameId
      );

      u9ProfileResetAvatar();
      return false;
    }

    if (u9ProfileAvatarFrame) {
      u9ProfileAvatarFrame.dataset.u9Fallback = "false";
      u9ProfileAvatarFrame.src = currentFrame.svg;
    }

    return true;
  } catch (error) {
    console.error("Load profile frame failed:", error);
    u9ProfileResetAvatar();
    return false;
  }
}


/* =========================
   DISPLAY USER INFO
========================= */

function u9ProfileDisplayUser(user) {
  if (!user) {
    return;
  }

  if (u9ProfileUsername) {
    u9ProfileUsername.textContent = user.username || "";
  }

  if (u9ProfileAccount) {
    u9ProfileAccount.textContent = user.account || "";
  }

  /*
   * Update both values without clearing existing values.
   */

  u9ProfileUpdateBalanceCoins(user);

  /*
   * Make sure the profile and balance area are visible.
   */

  if (u9ProfileInfo) {
    u9ProfileInfo.classList.add("loaded");
  }

  if (u9ProfileBalanceContainer) {
    u9ProfileBalanceContainer.style.display = "flex";
  }

  u9ProfileResetBalanceMode();
}


/* =========================
   LOAD PROFILE AVATAR
========================= */

async function u9ProfileLoadAvatarFromUser(user) {
  u9ProfileResetAvatar();

  if (!user) {
    return false;
  }

  try {
    const avatar = user.avatar || null;
    const avatarUrl = avatar?.url || "";

    if (avatarUrl && u9ProfileAvatarImage) {
      u9ProfileAvatarImage.dataset.u9Fallback = "false";
      u9ProfileAvatarImage.src = avatarUrl;
    } else if (u9ProfileAvatarImage) {
      u9ProfileAvatarImage.dataset.u9Fallback = "false";
      u9ProfileAvatarImage.src = u9ProfileDefaultAvatar;
    }

    const frameType = user.avatar_frame_type || "default";
    const frameId = user.avatar_frame_id || null;

    const frameLoaded = await u9ProfileLoadFrame(
      frameType,
      frameId
    );

    if (!frameLoaded) {
      u9ProfileResetAvatar();
      return false;
    }

    return true;
  } catch (error) {
    console.error("Load profile avatar failed:", error);
    u9ProfileResetAvatar();
    return false;
  }
}


/* =========================
   REFRESH ONLY AVATAR
========================= */

async function u9ProfileRefreshAvatar() {
  if (
    !window.U9User ||
    !window.U9User.isLoggedIn()
  ) {
    return false;
  }

  try {
    const user = await window.U9User.refresh();

    if (!user) {
      return false;
    }

    return await u9ProfileLoadAvatarFromUser(user);
  } catch (error) {
    console.error("Refresh profile avatar failed:", error);
    return false;
  }
}


/* =========================
   LOAD PROFILE
========================= */

async function u9ProfileLoad() {
  /*
   * Show loading indicator but keep profile info visible.
   */

  u9ProfileShowLoading();

  /*
   * Reset avatar and return to main page.
   */

  u9ProfileResetAvatar();
  u9ProfileShowMainPage();

  if (!window.U9User) {
    console.warn("U9User is not available.");

    u9ProfileHideLoading();
    return false;
  }

  if (!window.U9User.isLoggedIn()) {
    u9ProfileResetAvatar();
    u9ProfileHideLoading();
    return false;
  }

  try {
    /*
     * Display cached user information immediately.
     */

    const cachedUser = window.U9User.get();

    if (cachedUser) {
      u9ProfileDisplayUser(cachedUser);
    }

    /*
     * Fetch refreshed user data.
     * If refresh fails, cached information remains visible.
     */

    let latestUser = null;

    if (typeof window.U9User.refresh === "function") {
      try {
        latestUser = await window.U9User.refresh();
      } catch (refreshError) {
        console.warn(
          "Could not refresh profile data; keeping existing values:",
          refreshError
        );
      }
    }

    const user = latestUser || cachedUser;

    if (user) {
      u9ProfileDisplayUser(user);

      /*
       * Load avatar/frame from the latest available user data.
       */

      const avatarLoaded =
        await u9ProfileLoadAvatarFromUser(user);

      if (!avatarLoaded) {
        u9ProfileResetAvatar();
      }
    } else {
      u9ProfileResetAvatar();
    }

    console.log("Profile Loaded:", user);
    return Boolean(user);
  } catch (error) {
    console.error("Load profile failed:", error);
    u9ProfileResetAvatar();
    return false;
  } finally {
    u9ProfileHideLoading();
  }
}


/* =========================
   WINDOW MANAGER
========================= */

if (window.U9WindowManager) {
  window.U9WindowManager.register(
    "profile",
    {
      open: openProfileModal,

      close: closeProfileModal,

      isOpen: function() {
        if (!profileModal) {
          return false;
        }

        return (
          profileModal.classList.contains("modal-open") ||
          profileModal.classList.contains("modal-closing")
        );
      },

      canOpen: u9ProfileCanOpen
    }
  );
} else {
  console.warn(
    "U9WindowManager is not available when Profile was initialized."
  );
}


/* =========================
   INITIAL RESET
========================= */

u9ProfileResetAvatar();


/* =========================
   INITIAL BALANCE / COINS
========================= */

u9ProfileResetBalanceMode();


/* =========================
   INITIAL PROFILE VISIBILITY
========================= */

if (u9ProfileInfo) {
  u9ProfileInfo.classList.add("loaded");
}

if (u9ProfileBalanceContainer) {
  u9ProfileBalanceContainer.style.display = "flex";
}


/* =========================
   INITIAL MAIN PAGE
========================= */

u9ProfileShowMainPage();


/* =========================
   GLOBAL ACCESS
========================= */

window.openProfileModal = openProfileModal;

window.closeProfileModal = closeProfileModal;

window.toggleProfileModal = toggleProfileModal;


/* =========================
   PROFILE GLOBAL API
========================= */

window.U9Profile = {
  load: u9ProfileLoad,

  refresh: u9ProfileLoad,

  refreshBalanceCoins: u9ProfileRefreshBalanceCoins,

  refreshAvatar: u9ProfileRefreshAvatar,

  showMain: u9ProfileShowMainPage,

  showPage: u9ProfileShowPage,

  toggleBalanceCoins: u9ProfileToggleBalanceCoins,

  resetBalanceMode: u9ProfileResetBalanceMode,

  getCurrentPage: function() {
    return u9ProfileCurrentPage;
  }
};


/* =========================
   AVATAR GLOBAL API
========================= */

window.U9ProfileAvatar = {
  load: u9ProfileLoad,

  refresh: u9ProfileRefreshAvatar
};
