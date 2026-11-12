
/* =================================================
   U9 PROFILE PAGE 2 — WITHDRAWAL
================================================= */

(function () {

  "use strict";


  /* =========================
     ELEMENTS
  ========================= */

  const page =
    document.getElementById(
      "U9-profile-page2"
    );

  const navigation =
    document.getElementById(
      "U9-profile-withdrawal-navigation"
    );

  const information =
    document.getElementById(
      "U9-profile-withdrawal-information"
    );


  /* =========================
     CATEGORY CONFIG
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

    return navigation?.querySelector(
      `[data-category="${category}"]`
    );

  }


  /* =========================
     GET PANEL
  ========================= */

  function getPanel(category) {

    return document.getElementById(
      "U9-profile-withdrawal-panel-" +
      category
    );

  }


  /* =========================
     SWITCH CATEGORY
  ========================= */

  function switchCategory(category) {

    if (!categories.includes(category)) {
      return false;
    }

    const selectedButton =
      getButton(category);

    const selectedPanel =
      getPanel(category);

    if (!selectedButton || !selectedPanel) {
      console.warn(
        "U9 Withdrawal category not found:",
        category
      );

      return false;
    }


    /* =========================
       UPDATE BUTTONS
    ========================= */

    categories.forEach(function (item) {

      const button = getButton(item);

      if (!button) {
        return;
      }

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


    /* =========================
       UPDATE INFORMATION
    ========================= */

    categories.forEach(function (item) {

      const panel = getPanel(item);

      if (!panel) {
        return;
      }

      const isActive =
        item === category;

      panel.hidden = !isActive;

      panel.classList.toggle(
        "active",
        isActive
      );

    });


    /* =========================
       SAVE CURRENT CATEGORY
    ========================= */

    currentCategory = category;

    return true;

  }


  /* =========================
     NAVIGATION CLICK
  ========================= */

  if (navigation) {

    navigation.addEventListener(
      "click",
      function (event) {

        const button =
          event.target.closest(
            ".U9-profile-withdrawal-nav-button"
          );

        if (!button || !navigation.contains(button)) {
          return;
        }

        const category =
          button.dataset.category;

        switchCategory(category);

      }
    );

  }


  /* =========================
     KEYBOARD NAVIGATION
  ========================= */

  if (navigation) {

    navigation.addEventListener(
      "keydown",
      function (event) {

        const button =
          event.target.closest(
            ".U9-profile-withdrawal-nav-button"
          );

        if (!button) {
          return;
        }

        const currentIndex =
          categories.indexOf(
            button.dataset.category
          );

        if (currentIndex === -1) {
          return;
        }

        let nextIndex = currentIndex;

        if (event.key === "ArrowRight") {
          nextIndex =
            (currentIndex + 1) % categories.length;
        }

        else if (event.key === "ArrowLeft") {
          nextIndex =
            (currentIndex - 1 + categories.length) %
            categories.length;
        }

        else {
          return;
        }

        event.preventDefault();

        const nextCategory =
          categories[nextIndex];

        switchCategory(nextCategory);

        const nextButton =
          getButton(nextCategory);

        if (nextButton) {
          nextButton.focus();
        }

      }
    );

  }


  /* =========================
     RESET PAGE
  ========================= */

  function resetPage() {

    switchCategory("crypto");

  }


  /* =========================
     INITIALIZE
  ========================= */

  function initialize() {

    if (!page || !navigation || !information) {

      console.warn(
        "U9 Withdrawal Page 2 elements not found."
      );

      return;

    }

    resetPage();

    console.log(
      "U9 Withdrawal Page 2 initialized."
    );

  }


  /* =========================
     PUBLIC METHODS
  ========================= */

  window.U9ProfileWithdrawal = {

    switchCategory: switchCategory,

    reset: resetPage,

    getCurrentCategory: function () {
      return currentCategory;
    }

  };


  /* =========================
     START
  ========================= */

  initialize();


})();
