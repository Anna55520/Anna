/* =========================
   SHOP PAGE
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
     OPEN SHOP PAGE
  ========================= */

  function openShopPage() {

    if (
      !shopPage
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


    shopPage.style.display =
      "block";

  }


  /* =========================
     INITIALIZE SHOP PAGE
  ========================= */

  function initializeShopPage() {

    if (
      !shopPage
    ) {

      return;

    }


    shopPage.style.display =
      "none";

  }


  /* =========================
     PUBLIC FUNCTION
  ========================= */

  window.openShopPage =
    openShopPage;


  /* =========================
     START SHOP PAGE
  ========================= */

  initializeShopPage();


})();