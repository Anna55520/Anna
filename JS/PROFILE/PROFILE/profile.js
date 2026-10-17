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
