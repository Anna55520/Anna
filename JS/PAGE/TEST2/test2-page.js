/* =========================
   TEST2 PAGE
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
     OPEN TEST2 PAGE
  ========================= */

  function openTest2Page() {

    if (
      !test2Page
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
      test1Page
    ) {

      test1Page.style.display =
        "none";

    }


    test2Page.style.display =
      "block";

  }


  /* =========================
     INITIALIZE TEST2 PAGE
  ========================= */

  function initializeTest2Page() {

    if (
      !test2Page
    ) {

      return;

    }


    test2Page.style.display =
      "none";

  }


  /* =========================
     PUBLIC FUNCTION
  ========================= */

  window.openTest2Page =
    openTest2Page;


  /* =========================
     START TEST2 PAGE
  ========================= */

  initializeTest2Page();


})();