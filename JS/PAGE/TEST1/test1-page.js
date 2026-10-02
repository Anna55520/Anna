/* =========================
   TEST1 PAGE
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
     OPEN TEST1 PAGE
  ========================= */

  function openTest1Page() {

    if (
      !test1Page
    ) {

      return;

    }


    if (
      homePage
    ) {

      homePage.style.display =
        "none";

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
      test2Page
    ) {

      test2Page.style.display =
        "none";

    }


    test1Page.style.display =
      "block";

  }


  /* =========================
     INITIALIZE TEST1 PAGE
  ========================= */

  function initializeTest1Page() {

    if (
      !test1Page
    ) {

      return;

    }


    test1Page.style.display =
      "none";

  }


  /* =========================
     PUBLIC FUNCTION
  ========================= */

  window.openTest1Page =
    openTest1Page;


  /* =========================
     START TEST1 PAGE
  ========================= */

  initializeTest1Page();


})();