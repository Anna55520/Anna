/* =========================
   AUCTION PAGE
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
     OPEN AUCTION PAGE
  ========================= */

  function openAuctionPage() {

    if (
      !auctionPage
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


    auctionPage.style.display =
      "block";

  }


  /* =========================
     INITIALIZE AUCTION PAGE
  ========================= */

  function initializeAuctionPage() {

    if (
      !auctionPage
    ) {

      return;

    }


    auctionPage.style.display =
      "none";

  }


  /* =========================
     PUBLIC FUNCTION
  ========================= */

  window.openAuctionPage =
    openAuctionPage;


  /* =========================
     START AUCTION PAGE
  ========================= */

  initializeAuctionPage();


})();