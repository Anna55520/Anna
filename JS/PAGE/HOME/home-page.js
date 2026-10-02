/* =========================
   HOME PAGE
========================= */

(function () {


  /* =========================
     ELEMENTS
  ========================= */

  const homePage =
    document.getElementById(
      "U9-page-home"
    );


  const shopPage =
    document.getElementById(
      "U9-page-shop"
    );


  const auctionPage =
    document.getElementById(
      "U9-page-auction"
    );


  const test1Page =
    document.getElementById(
      "U9-page-test1"
    );


  const test2Page =
    document.getElementById(
      "U9-page-test2"
    );


  /* =========================
     OPEN HOME PAGE
  ========================= */

  function openHomePage() {

    if (
      !homePage
    ) {

      return;

    }


    if (
      shopPage
    ) {

      shopPage.style.display =
        "none";

    }


    if (
      auctionPage
    ) {

      auctionPage.style.display =
        "none";

    }


    if (
      test1Page
    ) {

      test1Page.style.display =
        "none";

    }


    if (
      test2Page
    ) {

      test2Page.style.display =
        "none";

    }


    homePage.style.display =
      "block";

  }


  /* =========================
     INITIALIZE HOME PAGE
  ========================= */

  function initializeHomePage() {

    if (
      !homePage
    ) {

      return;

    }


    openHomePage();

  }


  /* =========================
     PUBLIC FUNCTION
  ========================= */

  window.openHomePage =
    openHomePage;


  /* =========================
     START HOME PAGE
  ========================= */

  initializeHomePage();


})();