
/* =================================================
   U9 PROFILE PAGE 2 — NAVIGATION
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

    return navigation.querySelector(
      `[data-category="${category}"]`
    );

  }


  /* =========================
     SWITCH BUTTON
  ========================= */

  function switchCategory(category) {

    if (!categories.includes(category)) {
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
     CLICK EVENT
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
       INITIALIZE
    ========================= */

    switchCategory("crypto");

  } else {

    console.warn(
      "U9 Profile Withdrawal Navigation not found."
    );

  }


  /* =========================
     PUBLIC API
  ========================= */

  window.U9ProfileWithdrawal = {

    switchCategory: switchCategory,

    getCurrentCategory: function () {
      return currentCategory;
    },

    reset: function () {
      switchCategory("crypto");
    }

  };


})();
