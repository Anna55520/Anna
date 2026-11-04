
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
     HOME BANNER CONFIG
     STORE 2 PROXY
  ========================= */

  const HOME_BANNER_CONFIG = {

    mobile: [

      "/storage-2/U9/Banners/Mobile/Mobile1.jpg",

      "/storage-2/U9/Banners/Mobile/Mobile2.png",

      "/storage-2/U9/Banners/Mobile/Mobile3.png"

    ],

    desktop: [

      "/storage-2/U9/Banners/PC/PC1.jpg",

      "/storage-2/U9/Banners/PC/PC.png",

      "/storage-2/U9/Banners/PC/PC3.png"

    ],

    interval: 5000,

    breakpoint: 768,

    fadeDuration: 600

  };


  /* =========================
     BANNER STATE
  ========================= */

  let bannerContainer = null;

  let bannerImage = null;

  let bannerTimer = null;

  let bannerResizeTimer = null;

  let bannerIndex = 0;

  let bannerImages = [];

  let bannerInitialized = false;

  let bannerLoadToken = 0;


  /* =========================
     GET BANNER IMAGES
  ========================= */

  function getHomeBannerImages() {

    return window.innerWidth <=
      HOME_BANNER_CONFIG.breakpoint

      ? HOME_BANNER_CONFIG.mobile

      : HOME_BANNER_CONFIG.desktop;

  }


  /* =========================
     PRELOAD BANNER IMAGES
  ========================= */

  function preloadHomeBannerImages(images) {

    images.forEach(function (url) {

      const img = new Image();

      img.src = url;

    });

  }


  /* =========================
     CREATE BANNER ELEMENTS
  ========================= */

  function createHomeBanner() {

    if (
      !homePage ||
      bannerInitialized
    ) {

      return;

    }

    bannerContainer =
      document.createElement("div");

    bannerContainer.id =
      "U9-home-banner";

    bannerImage =
      document.createElement("img");

    bannerImage.id =
      "U9-home-banner-image";

    bannerImage.alt =
      "U9 Banner";

    bannerImage.loading =
      "eager";

    bannerImage.decoding =
      "async";

    bannerImage.draggable =
      false;

    bannerContainer.appendChild(
      bannerImage
    );

    /*
      INSERT BANNER
      HOME PAGE TOP
    */

    homePage.insertBefore(
      bannerContainer,
      homePage.firstChild
    );

    bannerInitialized = true;

  }


  /* =========================
     LOAD BANNER IMAGE
  ========================= */

  function loadHomeBannerImage(
    imageUrl
  ) {

    if (
      !bannerImage ||
      !imageUrl
    ) {

      return;

    }

    const loadToken =
      ++bannerLoadToken;

    const preload =
      new Image();

    preload.onload = function () {

      /*
        Prevent old image requests
        from replacing newer images
      */

      if (
        loadToken !== bannerLoadToken ||
        !bannerImage
      ) {

        return;

      }

      bannerImage.src =
        imageUrl;

      bannerImage.classList.remove(
        "U9-banner-fade"
      );

    };

    preload.onerror = function () {

      if (
        loadToken !== bannerLoadToken
      ) {

        return;

      }

      console.warn(
        "[U9 HOME] Banner load failed:",
        imageUrl
      );

      bannerImage.classList.remove(
        "U9-banner-fade"
      );

    };

    preload.src =
      imageUrl;

  }


  /* =========================
     SWITCH BANNER
  ========================= */

  function switchHomeBanner() {

    if (
      !bannerImage
    ) {

      return;

    }

    bannerImages =
      getHomeBannerImages();

    if (
      !bannerImages.length
    ) {

      return;

    }

    bannerIndex++;

    if (
      bannerIndex >=
      bannerImages.length
    ) {

      bannerIndex = 0;

    }

    /*
      FADE OUT
    */

    bannerImage.classList.add(
      "U9-banner-fade"
    );

    /*
      LOAD NEXT IMAGE
    */

    setTimeout(

      function () {

        loadHomeBannerImage(
          bannerImages[bannerIndex]
        );

      },

      HOME_BANNER_CONFIG.fadeDuration

    );

  }


  /* =========================
     START BANNER
  ========================= */

  function startHomeBanner() {

    if (
      !homePage
    ) {

      return;

    }

    createHomeBanner();

    bannerImages =
      getHomeBannerImages();

    if (
      !bannerImages.length
    ) {

      return;

    }

    /*
      FIRST IMAGE
    */

    bannerIndex = 0;

    loadHomeBannerImage(
      bannerImages[bannerIndex]
    );

    /*
      PRELOAD ALL IMAGES
    */

    preloadHomeBannerImages(
      bannerImages
    );

    /*
      CLEAR OLD TIMER
    */

    if (
      bannerTimer
    ) {

      clearInterval(
        bannerTimer
      );

    }

    /*
      AUTO SWITCH EVERY 5 SECONDS
    */

    bannerTimer =
      setInterval(

        switchHomeBanner,

        HOME_BANNER_CONFIG.interval

      );

  }


  /* =========================
     RESPONSIVE BANNER
  ========================= */

  function handleHomeBannerResize() {

    clearTimeout(
      bannerResizeTimer
    );

    bannerResizeTimer =
      setTimeout(

        function () {

          const newImages =
            getHomeBannerImages();

          if (

            JSON.stringify(newImages) ===

            JSON.stringify(bannerImages)

          ) {

            return;

          }

          /*
            UPDATE IMAGE LIST
          */

          bannerImages =
            newImages;

          bannerIndex = 0;

          /*
            PRELOAD NEW DEVICE IMAGES
          */

          preloadHomeBannerImages(
            bannerImages
          );

          /*
            SHOW FIRST IMAGE
          */

          loadHomeBannerImage(
            bannerImages[bannerIndex]
          );

        },

        200

      );

  }

  window.addEventListener(
    "resize",
    handleHomeBannerResize
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

    startHomeBanner();

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
