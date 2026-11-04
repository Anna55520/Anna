/* =========================
   HOME PAGE
========================= */

(function () {
  "use strict";

  const homePage = document.getElementById("U9-page-home");
  const shopPage = document.getElementById("U9-page-shop");
  const auctionPage = document.getElementById("U9-page-auction");
  const test1Page = document.getElementById("U9-page-test1");
  const test2Page = document.getElementById("U9-page-test2");

  /* =========================
     RESPONSIVE AD BANNER
  ========================= */

  const bannerImage = document.getElementById("U9-home-banner-image");
  const bannerIndicators = Array.from(
    document.querySelectorAll(".U9-home-banner-indicator")
  );

  const mobileBanners = [
    "https://vjlpowhxmflpkjlukkfy.supabase.co/storage/v1/object/public/U9/Banners/Mobile/Mobile1.jpg",
    "https://vjlpowhxmflpkjlukkfy.supabase.co/storage/v1/object/public/U9/Banners/Mobile/Mobile2.png",
    "https://vjlpowhxmflpkjlukkfy.supabase.co/storage/v1/object/public/U9/Banners/Mobile/Mobile3.png"
  ];

  const desktopBanners = [
    "https://vjlpowhxmflpkjlukkfy.supabase.co/storage/v1/object/public/U9/Banners/PC/PC1.jpg",
    "https://vjlpowhxmflpkjlukkfy.supabase.co/storage/v1/object/public/U9/Banners/PC/PC.png",
    "https://vjlpowhxmflpkjlukkfy.supabase.co/storage/v1/object/public/U9/Banners/PC/PC3.png"
  ];

  let currentBannerIndex = 0;
  let bannerTimer = null;
  let isMobileLayout = window.matchMedia("(max-width: 600px)").matches;
  let activeBannerList = isMobileLayout ? mobileBanners : desktopBanners;

  function preloadBannerList(list) {
    list.forEach((url) => {
      const image = new Image();
      image.src = url;
    });
  }

  function updateBannerIndicators(index) {
    bannerIndicators.forEach((indicator, indicatorIndex) => {
      indicator.classList.toggle("active", indicatorIndex === index);
    });
  }

  function showBanner(index) {
    if (!bannerImage || !activeBannerList.length) return;

    const nextIndex = (index + activeBannerList.length) % activeBannerList.length;
    const nextUrl = activeBannerList[nextIndex];

    bannerImage.classList.add("is-changing");

    const nextImage = new Image();

    nextImage.onload = function () {
      bannerImage.src = nextUrl;
      bannerImage.classList.remove("is-changing");
      currentBannerIndex = nextIndex;
      updateBannerIndicators(currentBannerIndex);
    };

    nextImage.onerror = function () {
      bannerImage.classList.remove("is-changing");
      showBanner(nextIndex + 1);
    };

    nextImage.src = nextUrl;
  }

  function startBannerRotation() {
    if (!bannerImage) return;

    if (bannerTimer) {
      window.clearInterval(bannerTimer);
    }

    bannerTimer = window.setInterval(function () {
      showBanner(currentBannerIndex + 1);
    }, 5000);
  }

  function switchBannerSet() {
    const nowMobile = window.matchMedia("(max-width: 600px)").matches;
    if (nowMobile === isMobileLayout) return;

    isMobileLayout = nowMobile;
    activeBannerList = isMobileLayout ? mobileBanners : desktopBanners;
    currentBannerIndex = 0;
    showBanner(0);
    startBannerRotation();
  }

  if (bannerImage) {
    preloadBannerList(mobileBanners);
    preloadBannerList(desktopBanners);

    // Set the correct device-specific first banner.
    bannerImage.src = activeBannerList[0];
    updateBannerIndicators(0);
    startBannerRotation();

    window.addEventListener("resize", switchBannerSet, { passive: true });
  }

  /* =========================
     OPEN HOME PAGE
  ========================= */

  function openHomePage() {
    if (!homePage) return;

    if (shopPage) shopPage.style.display = "none";
    if (auctionPage) auctionPage.style.display = "none";
    if (test1Page) test1Page.style.display = "none";
    if (test2Page) test2Page.style.display = "none";

    homePage.style.display = "block";
  }

  /* =========================
     INITIALIZE HOME PAGE
  ========================= */

  function initializeHomePage() {
    if (!homePage) return;
    openHomePage();
  }

  window.openHomePage = openHomePage;
  initializeHomePage();
})();
