
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
     CONFIG
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
     ANNOUNCEMENT CONFIG
  ========================= */

  const HOME_ANNOUNCEMENT_CONFIG = {

    icon: "/SSVG/logo/speaker.svg",

    messages: [
      "Unine 最新公告！欢迎来到 Unine。",
      "欢迎浏览 Unine 最新商品与活动。"
    ],

    restartDelay: 3000

  };


  /* =========================
     BANNER ERROR SVG
  ========================= */

  const BANNER_ERROR_SVG = `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      fill="none"
    >
      <circle
        cx="50"
        cy="50"
        r="38"
        stroke="#EF4444"
        stroke-width="6"
      />

      <path
        d="M50 28V55"
        stroke="#EF4444"
        stroke-width="7"
        stroke-linecap="round"
      />

      <circle
        cx="50"
        cy="70"
        r="4"
        fill="#EF4444"
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

  let bannerIsSliding = false;

  let bannerIsLoading = false;

  let bannerHasLoaded = false;


  /* =========================
     ANNOUNCEMENT STATE
  ========================= */

  let announcementContainer = null;

  let announcementTrack = null;

  let announcementText = null;

  let announcementIndex = 0;

  let announcementTimer = null;

  let announcementResizeTimer = null;

  let announcementInitialized = false;

  let announcementAnimationToken = 0;


  /* =========================
     GET BANNER IMAGES
  ========================= */

  function getHomeBannerImages() {

    const isMobile =
      window.innerWidth <=
      HOME_BANNER_CONFIG.breakpoint;

    return isMobile
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
     BANNER LOADING
  ========================= */

  function showBannerLoading() {

    if (!bannerStatus) return;

    hideBannerImages();

    bannerStatus.style.display = "flex";

    bannerStatus.innerHTML = `
      <img
        src="/SSVG/logo/loading.svg"
        alt="Loading"
      >
    `;

  }


  /* =========================
     BANNER ERROR
  ========================= */

  function showBannerError() {

    if (!bannerStatus) return;

    hideBannerImages();

    bannerStatus.style.display = "flex";

    bannerStatus.innerHTML =
      BANNER_ERROR_SVG;

  }


  /* =========================
     HIDE BANNER STATUS
  ========================= */

  function hideBannerStatus() {

    if (!bannerStatus) return;

    bannerStatus.style.display = "none";

    bannerStatus.innerHTML = "";

  }


  /* =========================
     CREATE HOME BANNER
  ========================= */

  function createHomeBanner() {

    if (!homePage || bannerContainer) return;

    bannerContainer =
      document.createElement("div");

    bannerContainer.id =
      "U9-home-banner";


    bannerImage =
      document.createElement("img");

    bannerImage.id =
      "U9-home-banner-image";

    bannerImage.alt = "Unine Banner";

    bannerImage.draggable = false;


    bannerNextImage =
      document.createElement("img");

    bannerNextImage.id =
      "U9-home-banner-next";

    bannerNextImage.alt = "";

    bannerNextImage.draggable = false;


    bannerStatus =
      document.createElement("div");

    bannerStatus.id =
      "U9-home-banner-status";


    bannerContainer.appendChild(
      bannerImage
    );

    bannerContainer.appendChild(
      bannerNextImage
    );

    bannerContainer.appendChild(
      bannerStatus
    );


    bannerImage.style.visibility =
      "hidden";

    bannerNextImage.style.visibility =
      "hidden";


    homePage.insertBefore(
      bannerContainer,
      homePage.firstChild
    );

  }


  /* =========================
     RESET BANNER POSITION
  ========================= */

  function resetBannerPosition() {

    if (!bannerImage || !bannerNextImage) {
      return;
    }

    bannerImage.style.transition = "none";

    bannerNextImage.style.transition = "none";

    bannerImage.style.transform =
      "translateX(0)";

    bannerNextImage.style.transform =
      "translateX(100%)";

    void bannerImage.offsetWidth;

  }


  /* =========================
     CANCEL BANNER ANIMATION
  ========================= */

  function cancelBannerAnimation() {

    bannerIsSliding = false;

    if (bannerSlideTimer) {

      clearTimeout(
        bannerSlideTimer
      );

      bannerSlideTimer = null;

    }

    resetBannerPosition();

  }


  /* =========================
     LOAD BANNER IMAGE
  ========================= */

  function loadHomeBannerImage(
    imageUrl
  ) {

    const currentToken =
      ++bannerLoadToken;

    bannerIsLoading = true;

    showBannerLoading();

    const preloadImage =
      new Image();

    preloadImage.onload = function () {

      if (
        currentToken !==
        bannerLoadToken
      ) {
        return;
      }

      bannerImage.src =
        imageUrl;

      bannerImage.style.visibility =
        "visible";

      bannerNextImage.style.visibility =
        "visible";

      bannerHasLoaded = true;

      bannerIsLoading = false;

      cancelBannerAnimation();

      hideBannerStatus();

    };


    preloadImage.onerror = function () {

      if (
        currentToken !==
        bannerLoadToken
      ) {
        return;
      }

      bannerIsLoading = false;

      bannerHasLoaded = false;

      showBannerError();

    };


    preloadImage.src =
      imageUrl;

  }


  /* =========================
     SWITCH BANNER
  ========================= */

  function switchHomeBanner() {

    if (
      !bannerContainer ||
      !bannerImage ||
      !bannerNextImage
    ) {
      return;
    }

    if (
      bannerIsLoading ||
      bannerIsSliding
    ) {
      return;
    }

    if (!bannerImages.length) {
      return;
    }


    const nextIndex =
      (
        bannerIndex + 1
      ) %
      bannerImages.length;


    const nextUrl =
      bannerImages[nextIndex];


    bannerIsLoading = true;


    const preloadImage =
      new Image();


    preloadImage.onload = function () {

      bannerIsLoading = false;


      if (!bannerHasLoaded) {

        bannerImage.src =
          nextUrl;

        bannerIndex =
          nextIndex;

        bannerHasLoaded = true;

        showBannerImages();

        hideBannerStatus();

        resetBannerPosition();

        return;

      }


      bannerNextImage.src =
        nextUrl;


      bannerIsSliding = true;


      bannerImage.style.transition =
        `transform ${
          HOME_BANNER_CONFIG.slideDuration
        }ms ease`;


      bannerNextImage.style.transition =
        `transform ${
          HOME_BANNER_CONFIG.slideDuration
        }ms ease`;


      bannerImage.style.transform =
        "translateX(-100%)";


      bannerNextImage.style.transform =
        "translateX(0)";


      bannerSlideTimer =
        setTimeout(function () {

          bannerImage.src =
            nextUrl;

          bannerIndex =
            nextIndex;

          bannerIsSliding = false;

          bannerSlideTimer = null;

          resetBannerPosition();

        },
        HOME_BANNER_CONFIG.slideDuration
      );

    };


    preloadImage.onerror =
      function () {

        bannerIsLoading = false;

        bannerHasLoaded = false;

        showBannerError();

      };


    preloadImage.src =
      nextUrl;

  }


  /* =========================
     START BANNER TIMER
  ========================= */

  function startHomeBanner() {

    if (bannerTimer) {

      clearInterval(
        bannerTimer
      );

      bannerTimer = null;

    }


    bannerTimer =
      setInterval(
        switchHomeBanner,
        HOME_BANNER_CONFIG.interval
      );

  }


  /* =========================
     BANNER RESIZE
  ========================= */

  function handleHomeBannerResize() {

    if (bannerResizeTimer) {

      clearTimeout(
        bannerResizeTimer
      );

    }


    bannerResizeTimer =
      setTimeout(function () {

        const newImages =
          getHomeBannerImages();


        if (
          JSON.stringify(newImages) ===
          JSON.stringify(bannerImages)
        ) {
          return;
        }


        bannerImages =
          newImages;


        bannerIndex = 0;

        bannerLoadToken++;

        bannerIsLoading = false;

        bannerHasLoaded = false;


        cancelBannerAnimation();


        loadHomeBannerImage(
          bannerImages[0]
        );

      }, 200);

  }


  /* =========================
     INITIALIZE BANNER
  ========================= */

  function initializeHomeBanner() {

    if (
      bannerInitialized ||
      !homePage
    ) {
      return;
    }


    bannerInitialized = true;


    createHomeBanner();


    bannerImages =
      getHomeBannerImages();


    if (!bannerImages.length) {

      showBannerError();

      return;

    }


    loadHomeBannerImage(
      bannerImages[0]
    );


    startHomeBanner();


    window.addEventListener(
      "resize",
      handleHomeBannerResize
    );

  }


  /* =========================
     CREATE ANNOUNCEMENT
  ========================= */

  function createHomeAnnouncement() {

    if (
      !homePage ||
      announcementContainer
    ) {
      return;
    }


    announcementContainer =
      document.createElement("div");

    announcementContainer.id =
      "U9-home-announcement";


    /* ICON */

    const iconContainer =
      document.createElement("div");

    iconContainer.id =
      "U9-home-announcement-icon";


    const iconImage =
      document.createElement("img");

    iconImage.src =
      HOME_ANNOUNCEMENT_CONFIG.icon;

    iconImage.alt =
      "Announcement";

    iconImage.draggable = false;


    iconContainer.appendChild(
      iconImage
    );


    /* TRACK */

    announcementTrack =
      document.createElement("div");

    announcementTrack.id =
      "U9-home-announcement-track";


    /* TEXT */

    announcementText =
      document.createElement("div");

    announcementText.id =
      "U9-home-announcement-text";


    announcementTrack.appendChild(
      announcementText
    );


    /* APPEND */

    announcementContainer.appendChild(
      iconContainer
    );

    announcementContainer.appendChild(
      announcementTrack
    );


    /* PLACE BELOW BANNER */

    if (bannerContainer) {

      bannerContainer.insertAdjacentElement(
        "afterend",
        announcementContainer
      );

    } else {

      homePage.insertBefore(
        announcementContainer,
        homePage.firstChild
      );

    }

  }


  /* =========================
     STOP ANNOUNCEMENT
  ========================= */

  function stopHomeAnnouncement() {

    announcementAnimationToken++;


    if (announcementTimer) {

      clearTimeout(
        announcementTimer
      );

      announcementTimer = null;

    }


    if (!announcementText) {
      return;
    }


    announcementText.style.animation =
      "none";

    announcementText.style.transform =
      "translateX(0)";

  }


  /* =========================
     START ANNOUNCEMENT
  ========================= */

  function startHomeAnnouncement() {

    if (
      !announcementTrack ||
      !announcementText
    ) {
      return;
    }


    stopHomeAnnouncement();


    const messages =
      HOME_ANNOUNCEMENT_CONFIG.messages;


    if (!messages.length) {
      announcementText.textContent = "";
      return;
    }


    const currentToken =
      announcementAnimationToken;


    announcementText.textContent =
      messages[
        announcementIndex %
        messages.length
      ];


    announcementText.style.animation =
      "none";

    announcementText.style.transform =
      "translateX(0)";


    requestAnimationFrame(function () {

      if (
        currentToken !==
        announcementAnimationToken
      ) {
        return;
      }


      const trackWidth =
        announcementTrack.clientWidth;


      const textWidth =
        announcementText.scrollWidth;


      if (
        trackWidth <= 0 ||
        textWidth <= 0
      ) {
        return;
      }


      const distance =
        trackWidth + textWidth;


      const duration =
        Math.max(
          8,
          distance / 60
        );


      announcementText.style.setProperty(
        "--U9-announcement-distance",
        `${distance}px`
      );


      announcementText.style.setProperty(
        "--U9-announcement-duration",
        `${duration}s`
      );


      announcementText.style.animation =
        `U9-home-announcement-scroll ${
          duration
        }s linear forwards`;


      announcementTimer =
        setTimeout(function () {

          if (
            currentToken !==
            announcementAnimationToken
          ) {
            return;
          }


          announcementText.style.animation =
            "none";


          announcementText.style.transform =
            `translateX(${
              -textWidth
            }px)`;


          announcementTimer =
            setTimeout(function () {

              if (
                currentToken !==
                announcementAnimationToken
              ) {
                return;
              }


              announcementIndex =
                (
                  announcementIndex + 1
                ) %
                messages.length;


              startHomeAnnouncement();

            },
            HOME_ANNOUNCEMENT_CONFIG.restartDelay
          );


        }, duration * 1000);

    });

  }


  /* =========================
     ANNOUNCEMENT RESIZE
  ========================= */

  function handleHomeAnnouncementResize() {

    if (announcementResizeTimer) {

      clearTimeout(
        announcementResizeTimer
      );

    }


    announcementResizeTimer =
      setTimeout(function () {

        startHomeAnnouncement();

      }, 200);

  }


  /* =========================
     INITIALIZE ANNOUNCEMENT
  ========================= */

  function initializeHomeAnnouncement() {

    if (
      announcementInitialized ||
      !homePage
    ) {
      return;
    }


    announcementInitialized = true;


    createHomeAnnouncement();


    startHomeAnnouncement();


    window.addEventListener(
      "resize",
      handleHomeAnnouncementResize
    );

  }


  /* =========================
     OPEN HOME PAGE
  ========================= */

  function openHomePage() {

    if (!homePage) {
      return;
    }


    const pages = [
      shopPage,
      auctionPage,
      test1Page,
      test2Page
    ];


    pages.forEach(function (page) {

      if (page) {

        page.style.display =
          "none";

      }

    });


    homePage.style.display =
      "block";

  }


  /* =========================
     INITIALIZE HOME PAGE
  ========================= */

  function initializeHomePage() {

    if (!homePage) {
      return;
    }


    initializeHomeBanner();

    initializeHomeAnnouncement();

  }


  /* =========================
     GLOBAL
  ========================= */

  window.openHomePage =
    openHomePage;


  /* =========================
     START
  ========================= */

  initializeHomePage();


})();
