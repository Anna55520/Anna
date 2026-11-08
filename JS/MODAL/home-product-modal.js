
/* =================================================
   U9 HOME PRODUCT MODAL
   Full-screen modal + product details + gallery
   Header + Close + Save + Buy
   Focus-safe open / close handling

   HOME PAGE:
   window.openHomeProductModal(product);

   MODAL OWNS:
   - Product detail rendering
   - Product image gallery
   - Product name and prices
   - Fixed header title: Detailed
   - Close handling
   - Save + Buy buttons
================================================= */

(function () {

  "use strict";


  /* =================================================
     MODAL ELEMENTS
  ================================================= */

  const modal =
    document.getElementById(
      "U9-home-product-modal"
    );

  const modalWindow =
    document.getElementById(
      "U9-home-product-modal-window"
    );

  const backdrop =
    document.getElementById(
      "U9-home-product-modal-backdrop"
    );

  const closeButton =
    document.getElementById(
      "U9-home-product-modal-close"
    );

  const modalHeader =
    document.getElementById(
      "U9-home-product-modal-header"
    );

  const modalTitle =
    document.getElementById(
      "U9-home-product-modal-title"
    );

  const detailContent =
    document.getElementById(
      "U9-home-product-detail-content"
    );


  /* =================================================
     VALIDATE MODAL HTML
  ================================================= */

  if (
    !modal ||
    !modalWindow ||
    !detailContent
  ) {

    console.error(
      "[U9 HOME PRODUCT MODAL] Modal HTML not found."
    );

    return;

  }


  /* =================================================
     CONFIG
  ================================================= */

  const MODAL_CONFIG = {

    maxImages: 5,

    loadingImage:
      "/SSVG/logo/loading.svg",

    currencySymbol: "$",

    storageHost:
      "vjlpowhxmflpkjlukkfy.supabase.co",

    storagePrefix:
      "/storage/v1/object/public/",

    storageProxyPrefix:
      "/storage-2/"

  };


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
      aria-hidden="true"
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
     STATE
  ================================================= */

  let currentProduct = null;

  let previousFocus = null;

  let closeTimer = null;

  let imageLoadToken = 0;


  /* =================================================
     ELEMENT HELPER
  ================================================= */

  function createElement(
    tagName,
    className
  ) {

    const element =
      document.createElement(tagName);

    if (className) {

      element.className = className;

    }

    return element;

  }


  /* =================================================
     FOCUS HELPER
  ================================================= */

  function focusElement(element) {

    if (
      !element ||
      typeof element.focus !== "function"
    ) {

      return false;

    }

    try {

      element.focus({
        preventScroll: true
      });

    } catch (_) {

      element.focus();

    }

    return (
      document.activeElement === element
    );

  }


  /* =================================================
     PRODUCT IMAGE URL
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

      if (
        url.hostname ===
          MODAL_CONFIG.storageHost &&
        url.pathname.startsWith(
          MODAL_CONFIG.storagePrefix
        )
      ) {

        const imagePath =
          url.pathname.slice(
            MODAL_CONFIG.storagePrefix.length
          );

        return (
          MODAL_CONFIG.storageProxyPrefix +
          imagePath +
          url.search
        );

      }

      return rawUrl;

    } catch (error) {

      console.warn(
        "[U9 HOME PRODUCT MODAL] Invalid image URL:",
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
      i <= MODAL_CONFIG.maxImages;
      i++
    ) {

      const value =
        product["product_image_" + i];

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

      return (
        MODAL_CONFIG.currencySymbol +
        "0.00"
      );

    }

    return (
      MODAL_CONFIG.currencySymbol +
      number.toFixed(2)
    );

  }


  /* =================================================
     PRODUCT LOADING IMAGE
  ================================================= */

  function createLoadingImage() {

    const image =
      createElement(
        "img",
        "U9-home-product-modal-loading-image"
      );

    image.src =
      MODAL_CONFIG.loadingImage;

    image.alt = "Loading";

    image.draggable = false;

    return image;

  }


  /* =================================================
     PRODUCT IMAGE
     Used by gallery thumbnails.
  ================================================= */

  function createProductImage(
    imageUrl,
    className,
    altText
  ) {

    const wrapper =
      createElement(
        "div",
        "U9-home-product-modal-image-wrap"
      );

    wrapper.appendChild(
      createLoadingImage()
    );

    if (!imageUrl) {

      wrapper.innerHTML =
        PRODUCT_ERROR_SVG;

      return wrapper;

    }

    const preload =
      new Image();

    preload.onload = function () {

      const image =
        createElement(
          "img",
          className || ""
        );

      image.src = imageUrl;

      image.alt =
        altText || "Product";

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
     PRODUCT DETAIL IMAGE GALLERY
  ================================================= */

  function renderProductDetailGallery(product) {

    const gallery =
      createElement(
        "div",
        "U9-home-product-modal-gallery"
      );

    const images =
      getProductImages(product);

    const mainImageWrap =
      createElement(
        "div",
        "U9-home-product-modal-main-image-wrap"
      );

    mainImageWrap.classList.add(
      "U9-home-product-modal-image-wrap"
    );

    const thumbnails =
      createElement(
        "div",
        "U9-home-product-modal-thumbnails"
      );


    /* ==============================================
       SHOW MAIN IMAGE
    ============================================== */

    function showDetailImage(imageUrl) {

      if (
        currentProduct !== product
      ) {

        return;

      }

      const loadToken =
        ++imageLoadToken;

      mainImageWrap.replaceChildren(
        createLoadingImage()
      );

      const preload =
        new Image();

      preload.onload = function () {

        if (
          currentProduct !== product ||
          loadToken !== imageLoadToken
        ) {

          return;

        }

        const image =
          createElement(
            "img",
            "U9-home-product-modal-main-image"
          );

        image.src = imageUrl;

        image.alt =
          product.product_name || "Product";

        image.decoding = "async";

        image.draggable = false;

        mainImageWrap.replaceChildren(
          image
        );

      };


      preload.onerror = function () {

        if (
          currentProduct !== product ||
          loadToken !== imageLoadToken
        ) {

          return;

        }

        mainImageWrap.innerHTML =
          PRODUCT_ERROR_SVG;

      };

      preload.src = imageUrl;

    }


    /* ==============================================
       RENDER IMAGES
    ============================================== */

    if (images.length) {

      showDetailImage(
        images[0]
      );


      images.forEach(function (
        imageUrl,
        index
      ) {

        const thumbnail =
          createElement(
            "button",
            "U9-home-product-modal-thumbnail"
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


        /* ==========================================
           THUMBNAIL CLICK
        ========================================== */

        thumbnail.addEventListener(
          "click",
          function () {

            if (
              currentProduct !== product
            ) {

              return;

            }

            thumbnails
              .querySelectorAll(
                ".U9-home-product-modal-thumbnail"
              )
              .forEach(function (item) {

                item.classList.remove(
                  "is-active"
                );

              });

            thumbnail.classList.add(
              "is-active"
            );

            showDetailImage(
              imageUrl
            );

          }
        );

        thumbnails.appendChild(
          thumbnail
        );

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
     PRODUCT FAVORITE BUTTON
     VISUAL ONLY
  ================================================= */

  function createProductFavoriteButton() {

    const button =
      createElement(
        "button",
        "U9-home-product-modal-detail-favorite"
      );

    button.type = "button";

    button.setAttribute(
      "aria-label",
      "Save product"
    );

    button.setAttribute(
      "aria-pressed",
      "false"
    );

    button.innerHTML = `
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >

        <path
          d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z"
        />

      </svg>
    `;

    button.addEventListener(
      "click",
      function (event) {

        event.preventDefault();

        event.stopPropagation();

      }
    );

    return button;

  }


  /* =================================================
     PRODUCT DETAIL INFORMATION
  ================================================= */

  function renderProductDetailInfo(product) {

    const info =
      createElement(
        "div",
        "U9-home-product-modal-detail-info"
      );


    /* ==============================================
       PRODUCT NAME
    ============================================== */

    const name =
      createElement(
        "h2",
        "U9-home-product-modal-detail-name"
      );

    name.textContent =
      product.product_name || "";


    /* ==============================================
       PRODUCT PRICE
    ============================================== */

    const prices =
      createElement(
        "div",
        "U9-home-product-modal-detail-prices"
      );

    const price =
      Number(product.product_price);

    const discount =
      Number(product.product_discount) || 0;

    const priceMain =
      createElement(
        "div",
        "U9-home-product-modal-price-main"
      );


    if (discount > 0) {

      const discountPrice =
        createElement(
          "span",
          "U9-home-product-modal-discount-price"
        );

      discountPrice.textContent =
        formatProductPrice(
          getProductDiscountPrice(product)
        );


      const originalPrice =
        createElement(
          "span",
          "U9-home-product-modal-original-price"
        );

      originalPrice.textContent =
        formatProductPrice(price);


      const discountLabel =
        createElement(
          "span",
          "U9-home-product-modal-discount-label"
        );

      discountLabel.textContent =
        "-" + discount + "%";


      priceMain.append(
        discountPrice,
        originalPrice
      );

      prices.append(
        priceMain,
        discountLabel
      );

    } else {

      const normalPrice =
        createElement(
          "span",
          "U9-home-product-modal-price"
        );

      normalPrice.textContent =
        formatProductPrice(price);

      priceMain.appendChild(
        normalPrice
      );

      prices.appendChild(
        priceMain
      );

    }


    /* ==============================================
       PRODUCT DESCRIPTION
    ============================================== */

    const description =
      createElement(
        "div",
        "U9-home-product-modal-description"
      );

    description.textContent =
      product.product_description || "";


    info.append(
      name,
      prices,
      description
    );

    return info;

  }


  /* =================================================
     HEADER
     FIXED TITLE: Detailed
     Product name stays inside Modal Body.
  ================================================= */

  function updateModalHeader() {

    if (modalTitle) {

      modalTitle.textContent =
        "Detailed";

    }

    if (modalHeader) {

      modalHeader.setAttribute(
        "aria-label",
        "Detailed"
      );

    }

  }


  /* =================================================
     SAVE + BUY BUTTONS
     Save is visual only.
     Buy is a visual placeholder.
  ================================================= */

  function prepareProductActions() {

    const oldActions =
      document.getElementById(
        "U9-home-product-modal-actions"
      );

    if (oldActions) {

      oldActions.remove();

    }


    const existingSaveButton =
      detailContent.querySelector(
        ".U9-home-product-modal-detail-favorite"
      );


    const actions =
      createElement(
        "div",
        ""
      );

    actions.id =
      "U9-home-product-modal-actions";

    actions.setAttribute(
      "aria-label",
      "Product actions"
    );


    /* ==============================================
       SAVE BUTTON
    ============================================== */

    let saveButton =
      existingSaveButton;

    if (!saveButton) {

      saveButton =
        createProductFavoriteButton();

    }

    saveButton.id =
      "U9-home-product-modal-save";

    saveButton.classList.remove(
      "U9-home-product-modal-detail-favorite"
    );

    saveButton.classList.add(
      "U9-home-product-modal-action-button"
    );

    saveButton.setAttribute(
      "aria-label",
      "Save product"
    );

    saveButton.setAttribute(
      "title",
      "Save"
    );


    let saveLabel =
      saveButton.querySelector("span");

    if (!saveLabel) {

      saveLabel =
        document.createElement("span");

      saveLabel.textContent = "Save";

      saveButton.appendChild(
        saveLabel
      );

    }


    /* ==============================================
       BUY BUTTON
       No purchase action connected yet.
    ============================================== */

    const buyButton =
      createElement(
        "button",
        "U9-home-product-modal-action-button"
      );

    buyButton.type = "button";

    buyButton.id =
      "U9-home-product-modal-buy";

    buyButton.textContent = "Buy";

    buyButton.setAttribute(
      "aria-label",
      "Buy product"
    );


    actions.append(
      saveButton,
      buyButton
    );

    detailContent.appendChild(
      actions
    );

  }


  /* =================================================
     RENDER PRODUCT
     Modal owns all product detail DOM.
  ================================================= */

  function renderProduct(product) {

    if (!product) {
      return false;
    }

    currentProduct = product;

    imageLoadToken++;


    /* ==============================================
       CLEAR OLD PRODUCT CONTENT
    ============================================== */

    detailContent.replaceChildren();


    /* ==============================================
       HEADER
    ============================================== */

    updateModalHeader();


    /* ==============================================
       GALLERY
    ============================================== */

    const gallery =
      renderProductDetailGallery(product);


    /* ==============================================
       PRODUCT INFORMATION
    ============================================== */

    const info =
      renderProductDetailInfo(product);


    detailContent.append(
      gallery,
      info
    );


    /* ==============================================
       SAVE + BUY
    ============================================== */

    prepareProductActions();

    return true;

  }


  /* =================================================
     OPEN MODAL UI
     Called by U9WindowManager.
  ================================================= */

  function openModalUI() {

    if (
      !modal.classList.contains("modal-open")
    ) {

      previousFocus =
        document.activeElement;

    }

    modal.removeAttribute("inert");

    modal.setAttribute(
      "aria-hidden",
      "false"
    );

    modal.classList.remove(
      "modal-closing"
    );

    modal.classList.add(
      "modal-open"
    );


    if (
      !focusElement(modalWindow) &&
      closeButton
    ) {

      focusElement(closeButton);

    }

    return true;

  }


  /* =================================================
     PUBLIC OPEN PRODUCT MODAL
  ================================================= */

  async function openHomeProductModal(product) {

    if (!product) {

      console.warn(
        "[U9 HOME PRODUCT MODAL] Product data is missing."
      );

      return false;

    }

    if (
      !modal ||
      !modalWindow ||
      !detailContent
    ) {

      return false;

    }


    /* ==============================================
       RENDER BEFORE OPENING
    ============================================== */

    const rendered =
      renderProduct(product);

    if (!rendered) {
      return false;
    }


    /* ==============================================
       OPEN THROUGH WINDOW MANAGER
    ============================================== */

    if (
      window.U9WindowManager &&
      typeof window.U9WindowManager.open === "function"
    ) {

      await window.U9WindowManager.open(
        "home-product-modal"
      );

      return true;

    }


    console.error(
      "[U9 HOME PRODUCT MODAL] Window Manager unavailable."
    );

    return false;

  }


  /* =================================================
     CLOSE MODAL UI
     Focus-safe close handling.
  ================================================= */

  function closeHomeProductModal() {

    if (
      !modal.classList.contains("modal-open")
    ) {

      return true;

    }


    modal.classList.remove(
      "modal-open"
    );

    modal.classList.add(
      "modal-closing"
    );


    /* ==============================================
       RESTORE PREVIOUS FOCUS
    ============================================== */

    const focusTarget =
      previousFocus &&
      previousFocus.isConnected &&
      !modal.contains(previousFocus)

        ? previousFocus

        : null;


    if (!focusElement(focusTarget)) {

      const activeElement =
        document.activeElement;

      if (
        activeElement &&
        modal.contains(activeElement) &&
        typeof activeElement.blur === "function"
      ) {

        activeElement.blur();

      }

    }


    modal.setAttribute(
      "aria-hidden",
      "true"
    );

    modal.setAttribute(
      "inert",
      ""
    );

    previousFocus = null;


    /* ==============================================
       CLOSE ANIMATION
    ============================================== */

    if (closeTimer) {

      window.clearTimeout(
        closeTimer
      );

      closeTimer = null;

    }

    let finished = false;

    function finishClose() {

      if (finished) {
        return;
      }

      finished = true;

      modal.classList.remove(
        "modal-closing"
      );

      modalWindow.removeEventListener(
        "transitionend",
        onTransitionEnd
      );

      closeTimer = null;

    }


    function onTransitionEnd(event) {

      if (
        event.target === modalWindow &&
        event.propertyName === "transform"
      ) {

        finishClose();

      }

    }


    modalWindow.addEventListener(
      "transitionend",
      onTransitionEnd
    );

    closeTimer =
      window.setTimeout(
        finishClose,
        500
      );


    return true;

  }


  /* =================================================
     REQUEST CLOSE
  ================================================= */

  function requestClose() {

    if (
      window.U9WindowManager &&
      typeof window.U9WindowManager.close === "function"
    ) {

      window.U9WindowManager.close(
        "home-product-modal"
      );

    } else {

      closeHomeProductModal();

    }

  }


  /* =================================================
     WINDOW MANAGER REGISTRATION
  ================================================= */

  if (
    window.U9WindowManager &&
    typeof window.U9WindowManager.register === "function"
  ) {

    window.U9WindowManager.register(
      "home-product-modal",
      {

        open: openModalUI,

        close: closeHomeProductModal,

        isOpen: function () {

          return (
            modal.classList.contains("modal-open") ||
            modal.classList.contains("modal-closing")
          );

        }

      }
    );

  } else {

    console.error(
      "[U9 HOME PRODUCT MODAL] Window Manager unavailable."
    );

  }


  /* =================================================
     CLOSE BUTTON
  ================================================= */

  if (closeButton) {

    closeButton.addEventListener(
      "click",
      requestClose
    );

  }


  /* =================================================
     BACKDROP CLICK
  ================================================= */

  if (backdrop) {

    backdrop.addEventListener(
      "click",
      requestClose
    );

  }


  /* =================================================
     ESC KEY
  ================================================= */

  document.addEventListener(
    "keydown",
    function (event) {

      if (
        event.key === "Escape" &&
        modal.classList.contains("modal-open")
      ) {

        requestClose();

      }

    }
  );


  /* =================================================
     GLOBAL API
  ================================================= */

  window.openHomeProductModal =
    openHomeProductModal;

  window.closeHomeProductModal =
    requestClose;


  /* =================================================
     INITIALIZED
  ================================================= */

  console.log(
    "[U9 HOME PRODUCT MODAL] Initialized."
  );

})();
