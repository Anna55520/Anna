
/* =================================================
   U9 PROFILE PAGE 2 — WITHDRAWAL
================================================= */

(function () {

  "use strict";


  /* =========================
     ELEMENTS
  ========================= */

  const navigation =
    document.getElementById(
      "U9-profile-withdrawal-navigation"
    );

  const balanceElement =
    document.getElementById(
      "U9-profile-withdrawal-balance-value"
    );

  const verifiedIcon =
    document.getElementById(
      "U9-profile-withdrawal-verified-icon"
    );


  /* =========================
     CATEGORIES
  ========================= */

  const categories = [
    "crypto",
    "epayment",
    "bank",
    "card"
  ];


  /* =========================
     CURRENT CATEGORY
  ========================= */

  let currentCategory = "crypto";


  /* =========================
     GET BUTTON
  ========================= */

  function getButton(category) {

    if (!navigation) return null;

    return navigation.querySelector(
      `[data-category="${category}"]`
    );

  }


  /* =========================
     SWITCH CATEGORY
  ========================= */

  function switchCategory(category) {

    if (!categories.includes(category)) {
      return;
    }

    if (!navigation) {
      return;
    }

    categories.forEach(function (item) {

      const button = getButton(item);

      if (!button) return;

      const isActive =
        item === category;

      button.classList.toggle(
        "active",
        isActive
      );

      button.setAttribute(
        "aria-selected",
        String(isActive)
      );

      button.tabIndex =
        isActive ? 0 : -1;

    });

    currentCategory = category;

  }


  /* =========================
     NAVIGATION CLICK
  ========================= */

  if (navigation) {

    navigation.addEventListener(
      "click",
      function (event) {

        const button = event.target.closest(
          ".U9-profile-withdrawal-nav-button"
        );

        if (!button || !navigation.contains(button)) {
          return;
        }

        switchCategory(
          button.dataset.category
        );

      }
    );


    /* =========================
       KEYBOARD NAVIGATION
    ========================= */

    navigation.addEventListener(
      "keydown",
      function (event) {

        const button = event.target.closest(
          ".U9-profile-withdrawal-nav-button"
        );

        if (!button) return;

        const index = categories.indexOf(
          button.dataset.category
        );

        if (index === -1) return;

        let nextIndex = index;

        if (event.key === "ArrowRight") {

          nextIndex =
            (index + 1) % categories.length;

        } else if (event.key === "ArrowLeft") {

          nextIndex =
            (index - 1 + categories.length) %
            categories.length;

        } else {
          return;
        }

        event.preventDefault();

        const nextCategory =
          categories[nextIndex];

        switchCategory(nextCategory);

        getButton(nextCategory)?.focus();

      }
    );


    /* =========================
       INITIALIZE NAVIGATION
    ========================= */

    switchCategory("crypto");

  } else {

    console.warn(
      "U9 Profile Withdrawal Navigation not found."
    );

  }


  /* =================================================
     USER BALANCE
  ================================================= */

  function setBalance(balance) {

    if (!balanceElement) return;

    const amount = Number(balance);

    if (!Number.isFinite(amount)) {
      console.warn(
        "Invalid withdrawal balance:",
        balance
      );

      return;
    }

    balanceElement.textContent =
      amount.toFixed(2);

  }


  /* =================================================
     EMAIL VERIFIED STATUS
  ================================================= */

  function setEmailVerified(verified) {

    if (!verifiedIcon) return;

    if (typeof verified !== "boolean") {
      console.warn(
        "Invalid email_verified value:",
        verified
      );

      return;
    }

    if (verified) {

      verifiedIcon.src =
        "/SSVG/Withdraw/verified.svg";

      verifiedIcon.alt =
        "Verified";

    } else {

      verifiedIcon.src =
        "/SSVG/Withdraw/unverified.svg";

      verifiedIcon.alt =
        "Unverified";

    }

  }


  /* =================================================
     UPDATE USER INFO
  ================================================= */

  function updateUserInfo(user) {

    if (!user || typeof user !== "object") {
      console.warn(
        "Invalid withdrawal user data."
      );

      return;
    }

    if (user.balance !== undefined) {
      setBalance(user.balance);
    }

    if (user.email_verified !== undefined) {
      setEmailVerified(user.email_verified);
    }

  }


  /* =================================================
     PUBLIC API
  ================================================= */

  window.U9ProfileWithdrawal = {

    /* CATEGORY */

    switchCategory: switchCategory,

    getCurrentCategory: function () {
      return currentCategory;
    },

    reset: function () {
      switchCategory("crypto");
    },


    /* USER INFO */

    setBalance: setBalance,

    setEmailVerified: setEmailVerified,

    updateUserInfo: updateUserInfo

  };


})();
