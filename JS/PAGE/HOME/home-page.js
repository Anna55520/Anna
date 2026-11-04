
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
  ========================= */

  const HOME_BANNER_CONFIG = {

    mobile: [

      "https://vjlpowhxmflpkjlukkfy.supabase.co/storage/v1/object/public/U9/Banners/Mobile/Mobile1.jpg",

      "https://vjlpowhxmflpkjlukkfy.supabase.co/storage/v1/object/public/U9/Banners/Mobile/Mobile2.png",

      "https://vjlpowhxmflpkjlukkfy.supabase.co/storage/v1/object/public/U9/Banners/Mobile/Mobile3.png"

    ],

    desktop: [

      "https://vjlpowhxmflpkjlukkfy.supabase.co/storage/v1/object/public/U9/Banners/PC/PC1.jpg",

      "https://vjlpowhxmflpkjlukkfy.supabase.co/storage/v1/object/public/U9/Banners/PC/PC.png",

      "https://vjlpowhxmflpkjlukkfy.supabase.co/storage/v1/object/public/U9/Banners/PC/PC3.png"

    ],

    interval: 5000,

    breakpoint: 768

  };


  /* =========================
     BANNER STATE
  ========================= */

  let bannerContainer = null;

  let bannerImage = null;

  let bannerTimer = null;

  let bannerIndex = 0;

  let bannerImages = [];

  let bannerInitialized = false;


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
     CREATE BANNER CSS
  ========================= */

  function createHomeBannerStyle() {

    if (
      document.getElementById(
        "U9-home-banner-style"
      )
    ) {

      return;

    }

    const style =
      document.createElement("style");

    style.id =
      "U9-home-banner-style";

    style.textContent = `

      #U9-home-banner {

        width: calc(100% - 32px);

        max-width: 1200px;

        margin: 24px auto;

        position: relative;

        overflow: hidden;

        display: flex;

        justify-content: center;

        align-items: center;

        border-radius: 12px;

        background: transparent;

      }

      #U9-home-banner-image {

        display: block;

        width: 100%;

        height: auto;

        max-height: 420px;

        object-fit: contain;

        opacity: 1;

        transition: opacity 0.6s ease;

      }

      #U9-home-banner-image.U9-banner-fade {

        opacity: 0;

      }

      @media (max-width: 768px) {

        #U9-home-banner {

          width: calc(100% - 28px);

          max-width: none;

          margin: 16px auto;

          border-radius: 10px;

        }

        #U9-home-banner-image {

          max-height: none;

        }

      }

    `;

    document.head.appendChild(style);

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

    createHomeBannerStyle();

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

    bannerContainer.appendChild(
      bannerImage
    );

    /*
      插入 Home Page 最顶部
      不修改原有 HTML
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

    const preload =
      new Image();

    preload.onload = function () {

      if (!bannerImage) {

        return;

      }

      bannerImage.src =
        imageUrl;

      bannerImage.classList.remove(
        "U9-banner-fade"
      );

    };

    preload.onerror = function () {

      console.warn(
        "[U9 HOME] Banner load failed:",
        imageUrl
      );

      if (bannerImage) {

        bannerImage.classList.remove(
          "U9-banner-fade"
        );

      }

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

    bannerImage.classList.add(
      "U9-banner-fade"
    );

    setTimeout(
      function () {

        loadHomeBannerImage(
          bannerImages[bannerIndex]
        );

      },
      600
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
      第一次显示第一张
    */

    bannerIndex = 0;

    loadHomeBannerImage(
      bannerImages[bannerIndex]
    );

    /*
      每 5 秒切换
    */

    if (
      bannerTimer
    ) {

      clearInterval(
        bannerTimer
      );

    }

    bannerTimer =
      setInterval(
        switchHomeBanner,
        HOME_BANNER_CONFIG.interval
      );

  }


  /* =========================
     RESPONSIVE BANNER
  ========================= */

  let bannerResizeTimer = null;

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
            JSON.stringify(
              newImages
            ) ===
            JSON.stringify(
              bannerImages
            )
          ) {

            return;

          }

          bannerImages =
            newImages;

          bannerIndex = 0;

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
