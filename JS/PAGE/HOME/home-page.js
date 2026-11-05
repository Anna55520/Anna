
/* =========================
   HOME PAGE
========================= */

(function () {

  "use strict";


  /* =========================
     ELEMENTS
  ========================= */

  const homePage =
    document.getElementById("U9-page-home");

  const shopPage =
    document.getElementById("U9-page-shop");

  const auctionPage =
    document.getElementById("U9-page-auction");

  const test1Page =
    document.getElementById("U9-page-test1");

  const test2Page =
    document.getElementById("U9-page-test2");


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
      "/storage-2/U9/Banners/PC/PC2.png",
      "/storage-2/U9/Banners/PC/PC3.png"
    ],

    interval: 5000,

    breakpoint: 768,

    slideDuration: 600

  };


  /* =========================
     BANNER ERROR SVG
  ========================= */

  const BANNER_ERROR_SVG = `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 120 120"
      width="120"
      height="120"
      fill="none"
    >
      <circle
        cx="60"
        cy="60"
        r="43"
        stroke="#D1D5DB"
        stroke-width="5"
      />

      <path
        d="M60 35V65"
        stroke="#9CA3AF"
        stroke-width="6"
        stroke-linecap="round"
      />

      <circle
        cx="60"
        cy="81"
        r="3.5"
        fill="#9CA3AF"
      />

      <path
        d="M91 91L105 105"
        stroke="#EF4444"
        stroke-width="6"
        stroke-linecap="round"
      />

      <path
        d="M105 91L91 105"
        stroke="#EF4444"
        stroke-width="6"
        stroke-linecap="round"
      />
    </svg>
  `;


  /* =========================
     BANNER STATE
  ========================= */

  let bannerContainer = null;

  let bannerImage = null;

  let bannerNextImage = null;

  let bannerStatus = null;

  let bannerTimer = null;

  let bannerResizeTimer = null;

  let bannerSlideTimer = null;

  let bannerIndex = 0;

  let bannerImages = [];

  let bannerInitialized = false;

  let bannerLoadToken = 0;

  let isSliding = false;

  let isLoading = false;

  let bannerHasLoaded = false;


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
     BANNER IMAGE VISIBILITY
  ========================= */

  function hideBannerImages() {

    if (bannerImage) {
      bannerImage.style.visibility = "hidden";
    }

    if (bannerNextImage) {
      bannerNextImage.style.visibility = "hidden";
    }

  }


  function showBannerImages() {

    if (bannerImage) {
      bannerImage.style.visibility = "visible";
    }

    if (bannerNextImage) {
      bannerNextImage.style.visibility = "visible";
    }

  }


  /* =========================
     BANNER STATUS
  ========================= */

  function showBannerLoading() {

    if (!bannerStatus) {
      return;
    }

    // Loading 和广告图片不能同时显示
    hideBannerImages();

    bannerStatus.innerHTML = `
      <img
        src="/SSVG/logo/loading.svg"
        alt="Loading"
        draggable="false"
      >
    `;

    bannerStatus.style.display = "flex";

  }


  function showBannerError() {

    if (!bannerStatus) {
      return;
    }

    // Error 和广告图片不能同时显示
    hideBannerImages();

    bannerStatus.innerHTML =
      BANNER_ERROR_SVG;

    bannerStatus.style.display = "flex";

  }


  function hideBannerStatus() {

    if (!bannerStatus) {
      return;
    }

    bannerStatus.style.display = "none";

    bannerStatus.innerHTML = "";

  }


  /* =========================
     CREATE BANNER ELEMENTS
  ========================= */

  function createHomeBanner() {

    if (!homePage || bannerInitialized) {
      return;
    }

    bannerContainer =
      document.createElement("div");

    bannerContainer.id =
      "U9-home-banner";


    /* CURRENT IMAGE */

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

    bannerImage.style.visibility =
      "hidden";


    /* NEXT IMAGE */

    bannerNextImage =
      document.createElement("img");

    bannerNextImage.id =
      "U9-home-banner-next";

    bannerNextImage.alt =
      "U9 Banner";

    bannerNextImage.draggable =
      false;

    bannerNextImage.style.visibility =
      "hidden";


    /* STATUS ELEMENT */

    bannerStatus =
      document.createElement("div");

    bannerStatus.id =
      "U9-home-banner-status";

    bannerStatus.style.display =
      "none";


    /* APPEND ELEMENTS */

    bannerContainer.appendChild(
      bannerImage
    );

    bannerContainer.appendChild(
      bannerNextImage
    );

    bannerContainer.appendChild(
      bannerStatus
    );


    /* INSERT INTO HOME PAGE */

    homePage.insertBefore(
      bannerContainer,
      homePage.firstChild
    );

    bannerInitialized = true;

  }


  /* =========================
     RESET SLIDE POSITION
  ========================= */

  function resetBannerPosition() {

    if (!bannerImage || !bannerNextImage) {
      return;
    }

    bannerImage.style.transition = "none";

    bannerImage.style.transform =
      "translateX(0)";

    bannerNextImage.style.transition = "none";

    bannerNextImage.style.transform =
      "translateX(100%)";

  }


  /* =========================
     CANCEL BANNER ANIMATION
  ========================= */

  function cancelBannerAnimation() {

    clearTimeout(bannerSlideTimer);

    bannerSlideTimer = null;

    isSliding = false;

    resetBannerPosition();

    if (bannerNextImage) {
      bannerNextImage.removeAttribute("src");
      bannerNextImage.style.visibility = "hidden";
    }

  }


  /* =========================
     LOAD FIRST BANNER IMAGE
  ========================= */

  function loadHomeBannerImage(imageUrl) {

    if (
      !bannerImage ||
      !bannerNextImage ||
      !imageUrl
    ) {
      return;
    }

    // 使之前尚未完成的请求失效
    const loadToken =
      ++bannerLoadToken;

    isLoading = true;

    isSliding = false;

    bannerHasLoaded = false;

    clearTimeout(bannerSlideTimer);

    bannerSlideTimer = null;

    resetBannerPosition();

    bannerNextImage.removeAttribute("src");

    showBannerLoading();


    const preload =
      new Image();


    /* IMAGE LOAD SUCCESS */

    preload.onload = function () {

      if (
        loadToken !== bannerLoadToken ||
        !bannerImage
      ) {
        return;
      }

      bannerImage.src = imageUrl;

      bannerNextImage.removeAttribute("src");

      resetBannerPosition();

      bannerIndex =
        Math.max(0, bannerImages.indexOf(imageUrl));

      isLoading = false;

      isSliding = false;

      bannerHasLoaded = true;

      // 先显示图片，再关闭状态层
      showBannerImages();

      hideBannerStatus();

    };


    /* IMAGE LOAD FAILED */

    preload.onerror = function () {

      if (loadToken !== bannerLoadToken) {
        return;
      }

      console.warn(
        "[U9 HOME] Banner load failed:",
        imageUrl
      );

      isLoading = false;

      isSliding = false;

      bannerHasLoaded = false;

      cancelBannerAnimation();

      showBannerError();

    };


    // 最后设置 src，确保事件监听已经绑定
    preload.src = imageUrl;

  }


  /* =========================
     SWITCH BANNER
     RIGHT TO LEFT
  ========================= */

  function switchHomeBanner() {

    if (
      !bannerImage ||
      !bannerNextImage ||
      !bannerImages.length ||
      isLoading ||
      isSliding
    ) {
      return;
    }


    /*
      如果当前图片尚未成功加载，
      定时器负责重新尝试当前图片。
    */

    if (!bannerHasLoaded) {

      loadHomeBannerImage(
        bannerImages[bannerIndex] ||
        bannerImages[0]
      );

      return;

    }


    const nextIndex =
      (bannerIndex + 1) % bannerImages.length;

    const nextUrl =
      bannerImages[nextIndex];


    const loadToken =
      ++bannerLoadToken;

    isLoading = true;


    const preload =
      new Image();


    /* =========================
       NEXT IMAGE LOAD SUCCESS
    ========================= */

    preload.onload = function () {

      if (
        loadToken !== bannerLoadToken ||
        !bannerImage ||
        !bannerNextImage
      ) {
        return;
      }

      isLoading = false;


      /*
        如果当前处于 Error 状态，
        不执行滑动动画，直接恢复图片。
      */

      if (
        !bannerHasLoaded ||
        bannerImage.style.visibility === "hidden"
      ) {

        bannerImage.src = nextUrl;

        bannerIndex = nextIndex;

        bannerHasLoaded = true;

        resetBannerPosition();

        bannerNextImage.removeAttribute("src");

        showBannerImages();

        hideBannerStatus();

        return;

      }


      /* START SLIDE */

      isSliding = true;

      bannerNextImage.src = nextUrl;

      bannerNextImage.style.visibility =
        "visible";

      bannerImage.style.visibility =
        "visible";

      bannerNextImage.style.transition = "none";

      bannerNextImage.style.transform =
        "translateX(100%)";

      bannerImage.style.transition = "none";

      bannerImage.style.transform =
        "translateX(0)";


      /* FORCE REFLOW */

      bannerNextImage.offsetWidth;


      /* START ANIMATION */

      requestAnimationFrame(function () {

        if (
          loadToken !== bannerLoadToken ||
          !isSliding
        ) {
          return;
        }

        const duration =
          HOME_BANNER_CONFIG.slideDuration;

        bannerImage.style.transition =
          `transform ${duration}ms ease`;

        bannerNextImage.style.transition =
          `transform ${duration}ms ease`;

        bannerImage.style.transform =
          "translateX(-100%)";

        bannerNextImage.style.transform =
          "translateX(0)";

      });


      /* FINISH SLIDE */

      clearTimeout(bannerSlideTimer);

      bannerSlideTimer = setTimeout(function () {

        if (
          loadToken !== bannerLoadToken ||
          !bannerImage ||
          !bannerNextImage
        ) {
          return;
        }

        // 更新当前图片
        bannerImage.src = nextUrl;

        bannerIndex = nextIndex;

        bannerHasLoaded = true;

        // 重置位置
        resetBannerPosition();

        bannerNextImage.removeAttribute("src");

        bannerNextImage.style.visibility =
          "hidden";

        bannerImage.style.visibility =
          "visible";

        isSliding = false;

        hideBannerStatus();

      }, HOME_BANNER_CONFIG.slideDuration + 30);

    };


    /* =========================
       NEXT IMAGE LOAD FAILED
    ========================= */

    preload.onerror = function () {

      if (loadToken !== bannerLoadToken) {
        return;
      }

      console.warn(
        "[U9 HOME] Banner load failed:",
        nextUrl
      );

      isLoading = false;

      isSliding = false;

      bannerHasLoaded = false;

      cancelBannerAnimation();

      // 失败时只显示 Error，不保留旧广告图片
      showBannerError();

    };


    // 最后设置 src
    preload.src = nextUrl;

  }


  /* =========================
     START BANNER
  ========================= */

  function startHomeBanner() {

    if (!homePage) {
      return;
    }

    createHomeBanner();

    bannerImages =
      getHomeBannerImages();

    if (!bannerImages.length) {
      return;
    }


    /* RESET STATE */

    bannerIndex = 0;

    isSliding = false;

    isLoading = false;

    bannerHasLoaded = false;


    /* LOAD FIRST IMAGE */

    loadHomeBannerImage(
      bannerImages[0]
    );


    /* CLEAR OLD TIMER */

    if (bannerTimer) {

      clearInterval(bannerTimer);

      bannerTimer = null;

    }


    /* AUTO SWITCH */

    bannerTimer = setInterval(

      switchHomeBanner,

      HOME_BANNER_CONFIG.interval

    );

  }


  /* =========================
     RESPONSIVE BANNER
  ========================= */

  function handleHomeBannerResize() {

    clearTimeout(bannerResizeTimer);

    bannerResizeTimer = setTimeout(function () {

      const newImages =
        getHomeBannerImages();


      // 设备类型没有变化，不重新加载
      if (
        JSON.stringify(newImages) ===
        JSON.stringify(bannerImages)
      ) {
        return;
      }


      /* CANCEL OLD REQUESTS */

      bannerLoadToken++;

      isLoading = false;

      isSliding = false;

      bannerHasLoaded = false;

      cancelBannerAnimation();


      /* UPDATE IMAGE LIST */

      bannerImages = newImages;

      bannerIndex = 0;


      /* LOAD NEW DEVICE IMAGE */

      loadHomeBannerImage(
        bannerImages[0]
      );

    }, 200);

  }


  window.addEventListener(
    "resize",
    handleHomeBannerResize
  );


  /* =========================
     OPEN HOME PAGE
  ========================= */

  function openHomePage() {

    if (!homePage) {
      return;
    }

    if (shopPage) {
      shopPage.style.display = "none";
    }

    if (auctionPage) {
      auctionPage.style.display = "none";
    }

    if (test1Page) {
      test1Page.style.display = "none";
    }

    if (test2Page) {
      test2Page.style.display = "none";
    }

    homePage.style.display = "block";

  }


  /* =========================
     INITIALIZE HOME PAGE
  ========================= */

  function initializeHomePage() {

    if (!homePage) {
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
