
/* =================================================
   U9 HOME PAGE
================================================= */

(function () {

  "use strict";


  /* =================================================
     ELEMENTS
  ================================================= */

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


  /* =================================================
     HOME BANNER CONFIG
     EXISTING STORAGE-2 PROXY
================================================= */

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


  /* =================================================
     HOME PRODUCTS CONFIG
================================================= */

  const HOME_PRODUCTS_CONFIG = {

    edgeFunctionUrl: "/api/get-home-products",

    pageSize: 16,

    maxImages: 5,

    loadingImage: "/SSVG/logo/loading.svg",

    currencySymbol: "$",

    observerRootMargin: "300px 0px",

    requestTimeout: 20000,

    storageHost:
      "vjlpowhxmflpkjlukkfy.supabase.co",

    storagePrefix:
      "/storage/v1/object/public/",

    storageProxyPrefix:
      "/storage-2/"

  };


  /* =================================================
     BANNER ERROR SVG
================================================= */

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


  /* =================================================
     PRODUCT ERROR SVG
================================================= */

  const PRODUCT_ERROR_SVG = `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 120 120"
      width="100%"
      height="100%"
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
    </svg>
  `;


  /* =================================================
     BANNER STATE
================================================= */

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


  /* =================================================
     GET BANNER IMAGES
================================================= */

  function getHomeBannerImages() {

    return window.innerWidth <=
      HOME_BANNER_CONFIG.breakpoint

      ? HOME_BANNER_CONFIG.mobile

      : HOME_BANNER_CONFIG.desktop;

  }


  /* =================================================
     GET EXISTING BANNER ELEMENTS
================================================= */

  function createHomeBanner() {

    if (!homePage || bannerInitialized) {
      return;
    }

    bannerContainer =
      document.getElementById("U9-home-banner");

    bannerImage =
      document.getElementById("U9-home-banner-image");

    bannerNextImage =
      document.getElementById("U9-home-banner-next");

    bannerStatus =
      document.getElementById("U9-home-banner-status");


    if (
      !bannerContainer ||
      !bannerImage ||
      !bannerNextImage ||
      !bannerStatus ||
      !homePage.contains(bannerContainer)
    ) {

      console.error(
        "[U9 HOME] Banner HTML elements are missing."
      );

      return;

    }


    bannerImage.style.visibility = "hidden";

    bannerNextImage.style.visibility = "hidden";

    bannerStatus.style.display = "none";

    bannerInitialized = true;

  }


  /* =================================================
     BANNER IMAGE VISIBILITY
================================================= */

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


  /* =================================================
     BANNER STATUS
================================================= */

  function showBannerLoading() {

    if (!bannerStatus) {
      return;
    }

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


  /* =================================================
     RESET SLIDE POSITION
================================================= */

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


  /* =================================================
     CANCEL BANNER ANIMATION
================================================= */

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


  /* =================================================
     LOAD FIRST BANNER IMAGE
================================================= */

  function loadHomeBannerImage(imageUrl) {

    if (
      !bannerImage ||
      !bannerNextImage ||
      !imageUrl
    ) {
      return;
    }

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

      showBannerImages();

      hideBannerStatus();

    };


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


    preload.src = imageUrl;

  }


  /* =================================================
     SWITCH BANNER
     RIGHT TO LEFT
================================================= */

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


    preload.onload = function () {

      if (
        loadToken !== bannerLoadToken ||
        !bannerImage ||
        !bannerNextImage
      ) {
        return;
      }

      isLoading = false;

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

      bannerNextImage.offsetWidth;

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

      clearTimeout(bannerSlideTimer);

      bannerSlideTimer = setTimeout(function () {

        if (
          loadToken !== bannerLoadToken ||
          !bannerImage ||
          !bannerNextImage
        ) {
          return;
        }

        bannerImage.src = nextUrl;

        bannerIndex = nextIndex;

        bannerHasLoaded = true;

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

      showBannerError();

    };


    preload.src = nextUrl;

  }


  /* =================================================
     START BANNER
================================================= */

  function startHomeBanner() {

    if (!homePage) {
      return;
    }

    createHomeBanner();

    if (!bannerInitialized) {
      return;
    }

    bannerImages =
      getHomeBannerImages();

    if (!bannerImages.length) {
      return;
    }

    bannerIndex = 0;

    isSliding = false;

    isLoading = false;

    bannerHasLoaded = false;

    loadHomeBannerImage(
      bannerImages[0]
    );

    if (bannerTimer) {

      clearInterval(bannerTimer);

      bannerTimer = null;

    }

    bannerTimer = setInterval(
      switchHomeBanner,
      HOME_BANNER_CONFIG.interval
    );

  }


  /* =================================================
     RESPONSIVE BANNER
================================================= */

  function handleHomeBannerResize() {

    clearTimeout(bannerResizeTimer);

    bannerResizeTimer = setTimeout(function () {

      const newImages =
        getHomeBannerImages();

      if (
        JSON.stringify(newImages) ===
        JSON.stringify(bannerImages)
      ) {
        return;
      }

      bannerLoadToken++;

      isLoading = false;

      isSliding = false;

      bannerHasLoaded = false;

      cancelBannerAnimation();

      bannerImages = newImages;

      bannerIndex = 0;

      loadHomeBannerImage(
        bannerImages[0]
      );

    }, 200);

  }


  window.addEventListener(
    "resize",
    handleHomeBannerResize
  );


  /* =================================================
     HOME PRODUCTS ELEMENTS
================================================= */

  const homeProductsSection =
    document.getElementById("U9-home-products");

  const homeProductsGrid =
    document.getElementById("U9-home-products-grid");

  const homeProductsStatus =
    document.getElementById("U9-home-products-status");

  const homeProductsError =
    document.getElementById("U9-home-products-error");

  const homeProductsSentinel =
    document.getElementById("U9-home-products-sentinel");


  /* =================================================
     PRODUCT DETAIL ELEMENTS
================================================= */

  const homeProductDetail =
    document.getElementById("U9-home-product-detail");

  const homeProductBack =
    document.getElementById("U9-home-product-back");

  const homeProductDetailContent =
    document.getElementById("U9-home-product-detail-content");


  /* =================================================
     HOME PRODUCTS STATE
================================================= */

  let homeProductsInitialized = false;

  let homeProductsObserver = null;

  let homeProductsLoading = false;

  let homeProductsHasMore = true;

  let homeProductsOffset = 0;

  let homeProductsScrollPosition = 0;

  let currentHomeProduct = null;

  let homeProductsRequestController = null;

  const homeProducts = [];

  const homeProductsById = new Map();


  /* =================================================
     PRODUCT HELPERS
================================================= */

  function createElement(tagName, className) {

    const element =
      document.createElement(tagName);

    if (className) {
      element.className = className;
    }

    return element;

  }


  function getProductId(product) {

    return product &&
      product.uuid != null

      ? String(product.uuid)

      : "";

  }


  /* =================================================
     CONVERT PRODUCT IMAGE URL
     USE EXISTING STORAGE-2 PROXY
================================================= */

  function getProductImageProxyUrl(imageUrl) {

    if (
      typeof imageUrl !== "string" ||
      !imageUrl.trim()
    ) {
      return "";
    }

    const rawUrl =
      imageUrl.trim();

    try {

      const url = new URL(
        rawUrl,
        window.location.origin
      );

      const storageHost =
        HOME_PRODUCTS_CONFIG.storageHost;

      const storagePrefix =
        HOME_PRODUCTS_CONFIG.storagePrefix;

      if (
        url.hostname === storageHost &&
        url.pathname.startsWith(storagePrefix)
      ) {

        const imagePath =
          url.pathname.slice(storagePrefix.length);

        return (
          HOME_PRODUCTS_CONFIG.storageProxyPrefix +
          imagePath +
          url.search
        );

      }

      /*
        Other image URLs remain unchanged.
      */

      return rawUrl;

    } catch (error) {

      console.warn(
        "[U9 HOME PRODUCTS] Invalid image URL:",
        rawUrl
      );

      return "";

    }

  }


  /* =================================================
     GET PRODUCT IMAGES
================================================= */

  function getProductImages(product) {

    if (!product) {
      return [];
    }

    const images = [];

    for (
      let i = 1;
      i <= HOME_PRODUCTS_CONFIG.maxImages;
      i++
    ) {

      const value =
        product[`product_image_${i}`];

      if (
        typeof value === "string" &&
        value.trim()
      ) {

        const proxyUrl =
          getProductImageProxyUrl(value);

        if (proxyUrl) {
          images.push(proxyUrl);
        }

      }

    }

    return images;

  }


  /* =================================================
     PRODUCT PRICE
================================================= */

  function getProductDiscountPrice(product) {

    const price =
      Number(product.product_price);

    const discount =
      Number(product.product_discount) || 0;

    if (!Number.isFinite(price)) {
      return 0;
    }

    return price * (1 - discount / 100);

  }


  function formatProductPrice(value) {

    const number =
      Number(value);

    if (!Number.isFinite(number)) {
      return HOME_PRODUCTS_CONFIG.currencySymbol + "0.00";
    }

    return HOME_PRODUCTS_CONFIG.currencySymbol +
      number.toFixed(2);

  }


  function isValidActiveProduct(product) {

    return Boolean(
      product &&
      product.is_active === true &&
      getProductId(product) &&
      typeof product.product_name === "string"
    );

  }


  /* =================================================
     PRODUCT STATUS
================================================= */

  function showProductsLoading() {

    if (!homeProductsStatus) {
      return;
    }

    homeProductsStatus.hidden = false;

    homeProductsStatus.style.display = "flex";

    homeProductsStatus.innerHTML = `
      <img
        src="${HOME_PRODUCTS_CONFIG.loadingImage}"
        alt="Loading"
        draggable="false"
      >
    `;

  }


  function hideProductsStatus() {

    if (!homeProductsStatus) {
      return;
    }

    homeProductsStatus.hidden = true;

    homeProductsStatus.style.display = "none";

    homeProductsStatus.innerHTML = "";

  }


  function showProductsError() {

    if (!homeProductsError) {
      return;
    }

    homeProductsError.hidden = false;

    homeProductsError.style.display = "block";

  }


  function hideProductsError() {

    if (!homeProductsError) {
      return;
    }

    homeProductsError.hidden = true;

    homeProductsError.style.display = "none";

  }


  /* =================================================
     FETCH HOME PRODUCTS PAGE
     VERCEL -> SUPABASE EDGE FUNCTION
================================================= */

  async function fetchHomeProductsPage(limit, offset) {

    const requestUrl = new URL(
      HOME_PRODUCTS_CONFIG.edgeFunctionUrl,
      window.location.origin
    );

    requestUrl.searchParams.set(
      "limit",
      String(limit)
    );

    requestUrl.searchParams.set(
      "offset",
      String(offset)
    );

    const controller =
      new AbortController();

    homeProductsRequestController =
      controller;

    const timeoutId =
      setTimeout(function () {

        controller.abort();

      }, HOME_PRODUCTS_CONFIG.requestTimeout);

    try {

      const response = await fetch(
        requestUrl.toString(),
        {
          method: "GET",

          headers: {
            "Accept": "application/json"
          },

          credentials: "same-origin",

          cache: "no-store",

          signal: controller.signal
        }
      );

      if (!response.ok) {

        const errorText =
          await response.text();

        console.error(
          "[U9 HOME PRODUCTS] API request failed:",
          response.status,
          errorText
        );

        throw new Error(
          "Home Products request failed: " +
          response.status
        );

      }

      const result =
        await response.json();

      if (!Array.isArray(result)) {

        console.error(
          "[U9 HOME PRODUCTS] Invalid API response:",
          result
        );

        throw new Error(
          "Invalid Home Products response."
        );

      }

      return result;

    } finally {

      clearTimeout(timeoutId);

      if (
        homeProductsRequestController === controller
      ) {
        homeProductsRequestController = null;
      }

    }

  }


  /* =================================================
     PRODUCT IMAGE
================================================= */

  function createProductImage(
    imageUrl,
    className,
    altText
  ) {

    const wrapper =
      createElement(
        "div",
        "U9-home-product-image-wrap"
      );

    const loadingImage =
      createElement(
        "img",
        "U9-home-product-loading-image"
      );

    loadingImage.src =
      HOME_PRODUCTS_CONFIG.loadingImage;

    loadingImage.alt = "Loading";

    loadingImage.draggable = false;

    wrapper.appendChild(loadingImage);

    if (!imageUrl) {

      wrapper.innerHTML =
        PRODUCT_ERROR_SVG;

      return wrapper;

    }

    const preload =
      new Image();

    preload.onload = function () {

      const image =
        createElement("img", className || "");

      image.src = imageUrl;

      image.alt = altText || "Product";

      image.loading = "lazy";

      image.decoding = "async";

      image.draggable = false;

      wrapper.replaceChildren(image);

    };

    preload.onerror = function () {

      wrapper.innerHTML =
        PRODUCT_ERROR_SVG;

    };

    preload.src = imageUrl;

    return wrapper;

  }


  /* =================================================
     PRODUCT FAVORITE BUTTON
     VISUAL ONLY
================================================= */

  function createProductFavoriteButton() {

    const button =
      createElement(
        "button",
        "U9-home-product-favorite"
      );

    button.type = "button";

    button.setAttribute(
      "aria-label",
      "Favorite product"
    );

    button.setAttribute(
      "aria-pressed",
      "false"
    );

    button.innerHTML = `
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="22"
        height="22"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path
          d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z"
        />
      </svg>
    `;

    button.addEventListener("click", function (event) {

      event.preventDefault();

      event.stopPropagation();

    });

    return button;

  }


  /* =================================================
     CREATE PRODUCT CARD
================================================= */

  function createHomeProductCard(product) {

    const card =
      createElement(
        "article",
        "U9-home-product-card"
      );

    card.tabIndex = 0;

    card.setAttribute(
      "role",
      "button"
    );

    card.setAttribute(
      "aria-label",
      product.product_name
    );

    const images =
      getProductImages(product);

    const imageWrap =
      createProductImage(
        images[0] || "",
        "U9-home-product-image",
        product.product_name
      );

    const favoriteButton =
      createProductFavoriteButton();

    const info =
      createElement(
        "div",
        "U9-home-product-info"
      );

    const name =
      createElement(
        "div",
        "U9-home-product-name"
      );

    name.textContent =
      product.product_name;

    const prices =
      createElement(
        "div",
        "U9-home-product-prices"
      );

    const price =
      Number(product.product_price);

    const discount =
      Number(product.product_discount) || 0;

    if (discount > 0) {

      const discountPrice =
        createElement(
          "span",
          "U9-home-product-discount-price"
        );

      discountPrice.textContent =
        formatProductPrice(
          getProductDiscountPrice(product)
        );

      const originalPrice =
        createElement(
          "span",
          "U9-home-product-original-price"
        );

      originalPrice.textContent =
        formatProductPrice(price);

      prices.append(
        discountPrice,
        originalPrice
      );

    } else {

      const normalPrice =
        createElement(
          "span",
          "U9-home-product-price"
        );

      normalPrice.textContent =
        formatProductPrice(price);

      prices.appendChild(normalPrice);

    }

    info.append(
      name,
      prices
    );

    card.append(
      imageWrap,
      favoriteButton,
      info
    );

    card.addEventListener("click", function () {

      openHomeProductDetail(product);

    });

    card.addEventListener("keydown", function (event) {

      if (
        event.key === "Enter" ||
        event.key === " "
      ) {

        event.preventDefault();

        openHomeProductDetail(product);

      }

    });

    return card;

  }


  /* =================================================
     RENDER HOME PRODUCTS
================================================= */

  function renderHomeProducts(products) {

    if (!homeProductsGrid) {
      return;
    }

    const fragment =
      document.createDocumentFragment();

    products.forEach(function (product) {

      if (!isValidActiveProduct(product)) {
        return;
      }

      const productId =
        getProductId(product);

      if (homeProductsById.has(productId)) {
        return;
      }

      homeProductsById.set(
        productId,
        product
      );

      homeProducts.push(product);

      fragment.appendChild(
        createHomeProductCard(product)
      );

    });

    homeProductsGrid.appendChild(fragment);

  }


  /* =================================================
     LOAD HOME PRODUCTS
================================================= */

  async function loadHomeProducts() {

    if (
      !homeProductsSection ||
      !homeProductsGrid ||
      homeProductsLoading ||
      !homeProductsHasMore
    ) {
      return;
    }

    homeProductsLoading = true;

    hideProductsError();

    showProductsLoading();

    const requestOffset =
      homeProductsOffset;

    try {

      const products =
        await fetchHomeProductsPage(
          HOME_PRODUCTS_CONFIG.pageSize,
          requestOffset
        );

      homeProductsOffset +=
        products.length;

      renderHomeProducts(products);

      if (
        products.length <
        HOME_PRODUCTS_CONFIG.pageSize
      ) {

        homeProductsHasMore = false;

      }

      hideProductsStatus();

    } catch (error) {

      console.error(
        "[U9 HOME PRODUCTS] Load error:",
        error
      );

      hideProductsStatus();

      showProductsError();

    } finally {

      homeProductsLoading = false;

    }

  }


  /* =================================================
     RETRY HOME PRODUCTS
================================================= */

  function retryLoadHomeProducts() {

    if (homeProductsLoading) {
      return;
    }

    homeProductsHasMore = true;

    hideProductsError();

    loadHomeProducts();

  }


  /* =================================================
     PRODUCT DETAIL IMAGE GALLERY
================================================= */

  function renderProductDetailGallery(product) {

    const gallery =
      createElement(
        "div",
        "U9-home-product-gallery"
      );

    const images =
      getProductImages(product);

    const mainImageWrap =
      createElement(
        "div",
        "U9-home-product-main-image-wrap"
      );

    mainImageWrap.classList.add(
      "U9-home-product-image-wrap"
    );

    const thumbnails =
      createElement(
        "div",
        "U9-home-product-thumbnails"
      );

    function showDetailImage(imageUrl) {

      if (
        currentHomeProduct !== product
      ) {
        return;
      }

      const loadingImage =
        createElement(
          "img",
          "U9-home-product-loading-image"
        );

      loadingImage.src =
        HOME_PRODUCTS_CONFIG.loadingImage;

      loadingImage.alt = "Loading";

      loadingImage.draggable = false;

      mainImageWrap.replaceChildren(
        loadingImage
      );

      const preload =
        new Image();

      preload.onload = function () {

        if (
          currentHomeProduct !== product
        ) {
          return;
        }

        const image =
          createElement(
            "img",
            "U9-home-product-main-image"
          );

        image.src = imageUrl;

        image.alt =
          product.product_name;

        image.decoding = "async";

        image.draggable = false;

        mainImageWrap.replaceChildren(
          image
        );

      };

      preload.onerror = function () {

        if (
          currentHomeProduct !== product
        ) {
          return;
        }

        mainImageWrap.innerHTML =
          PRODUCT_ERROR_SVG;

      };

      preload.src = imageUrl;

    }

    if (images.length) {

      showDetailImage(images[0]);

      images.forEach(function (imageUrl, index) {

        const thumbnail =
          createElement(
            "button",
            "U9-home-product-thumbnail"
          );

        thumbnail.type = "button";

        thumbnail.setAttribute(
          "aria-label",
          "View product image " + (index + 1)
        );

        if (index === 0) {

          thumbnail.classList.add(
            "is-active"
          );

        }

        const thumbnailImage =
          createProductImage(
            imageUrl,
            "",
            product.product_name
          );

        thumbnail.appendChild(
          thumbnailImage
        );

        thumbnail.addEventListener("click", function () {

          thumbnails
            .querySelectorAll(".U9-home-product-thumbnail")
            .forEach(function (item) {

              item.classList.remove("is-active");

            });

          thumbnail.classList.add(
            "is-active"
          );

          showDetailImage(imageUrl);

        });

        thumbnails.appendChild(thumbnail);

      });

    } else {

      mainImageWrap.innerHTML =
        PRODUCT_ERROR_SVG;

    }

    gallery.append(
      mainImageWrap,
      thumbnails
    );

    return gallery;

  }


  /* =================================================
     PRODUCT DETAIL INFORMATION
================================================= */

  function renderProductDetailInfo(product) {

    const info =
      createElement(
        "div",
        "U9-home-product-detail-info"
      );

    const name =
      createElement(
        "h2",
        "U9-home-product-detail-name"
      );

    name.textContent =
      product.product_name;

    const prices =
      createElement(
        "div",
        "U9-home-product-detail-prices"
      );

    const price =
      Number(product.product_price);

    const discount =
      Number(product.product_discount) || 0;

    if (discount > 0) {

      const discountPrice =
        createElement(
          "span",
          "U9-home-product-discount-price"
        );

      discountPrice.textContent =
        formatProductPrice(
          getProductDiscountPrice(product)
        );

      const originalPrice =
        createElement(
          "span",
          "U9-home-product-original-price"
        );

      originalPrice.textContent =
        formatProductPrice(price);

      const discountLabel =
        createElement(
          "span",
          "U9-home-product-discount-label"
        );

      discountLabel.textContent =
        "-" + discount + "%";

      prices.append(
        discountPrice,
        originalPrice,
        discountLabel
      );

    } else {

      const normalPrice =
        createElement(
          "span",
          "U9-home-product-price"
        );

      normalPrice.textContent =
        formatProductPrice(price);

      prices.appendChild(normalPrice);

    }

    const description =
      createElement(
        "div",
        "U9-home-product-description"
      );

    description.textContent =
      product.product_description || "";

    const favoriteButton =
      createProductFavoriteButton();

    info.append(
      name,
      prices,
      description,
      favoriteButton
    );

    return info;

  }


  /* =================================================
     OPEN PRODUCT DETAIL
================================================= */

  function openHomeProductDetail(product) {

    if (
      !product ||
      !homeProductsSection ||
      !homeProductDetail ||
      !homeProductDetailContent
    ) {
      return;
    }

    currentHomeProduct = product;

    homeProductsScrollPosition =
      window.scrollY;

    homeProductDetailContent.replaceChildren();

    const layout =
      createElement(
        "div",
        "U9-home-product-detail-layout"
      );

    const gallery =
      renderProductDetailGallery(product);

    const info =
      renderProductDetailInfo(product);

    layout.append(
      gallery,
      info
    );

    homeProductDetailContent.appendChild(
      layout
    );

    homeProductsSection.hidden = true;

    homeProductDetail.hidden = false;

    window.scrollTo({
      top: 0,
      behavior: "instant"
    });

  }


  /* =================================================
     CLOSE PRODUCT DETAIL
================================================= */

  function closeHomeProductDetail() {

    if (
      !homeProductsSection ||
      !homeProductDetail
    ) {
      return;
    }

    currentHomeProduct = null;

    homeProductDetail.hidden = true;

    homeProductsSection.hidden = false;

    window.requestAnimationFrame(function () {

      window.scrollTo({
        top: homeProductsScrollPosition,
        behavior: "instant"
      });

    });

  }


  /* =================================================
     INITIALIZE PRODUCT SCROLL OBSERVER
================================================= */

  function initializeHomeProductsObserver() {

    if (
      homeProductsObserver ||
      !homeProductsSentinel
    ) {
      return;
    }

    if (!("IntersectionObserver" in window)) {

      console.warn(
        "[U9 HOME PRODUCTS] IntersectionObserver is unavailable."
      );

      return;

    }

    homeProductsObserver =
      new IntersectionObserver(
        function (entries) {

          entries.forEach(function (entry) {

            if (
              entry.isIntersecting &&
              homeProductsHasMore &&
              !homeProductsLoading
            ) {

              loadHomeProducts();

            }

          });

        },
        {
          root: null,

          rootMargin:
            HOME_PRODUCTS_CONFIG.observerRootMargin,

          threshold: 0
        }
      );

    homeProductsObserver.observe(
      homeProductsSentinel
    );

  }


  /* =================================================
     INITIALIZE HOME PRODUCTS
================================================= */

  function initializeHomeProducts() {

    if (
      homeProductsInitialized ||
      !homeProductsSection ||
      !homeProductsGrid
    ) {
      return;
    }

    homeProductsInitialized = true;

    hideProductsError();

    hideProductsStatus();

    if (homeProductsError) {

      homeProductsError.addEventListener(
        "click",
        retryLoadHomeProducts
      );

    }

    if (homeProductBack) {

      homeProductBack.addEventListener(
        "click",
        closeHomeProductDetail
      );

    }

    initializeHomeProductsObserver();

    loadHomeProducts();

  }


  /* =================================================
     OPEN HOME PAGE
================================================= */

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

    initializeHomeProducts();

  }


  /* =================================================
     INITIALIZE HOME PAGE
================================================= */

  function initializeHomePage() {

    if (!homePage) {
      return;
    }

    openHomePage();

    startHomeBanner();

  }


  /* =================================================
     PUBLIC FUNCTION
================================================= */

  window.openHomePage =
    openHomePage;


  /* =================================================
     START HOME PAGE
================================================= */

  initializeHomePage();


})();
