/* =========================================================
   U9 SHOP PAGE
   - Reads public.shop_products through the existing Supabase client
   - Uses the shared Home Product Modal
   - Save / Share / Buy buttons are visual only for now
========================================================= */

(function () {
  "use strict";

  const shopPage = document.getElementById("U9-page-shop");
  const homePage = document.getElementById("U9-page-home");
  const auctionPage = document.getElementById("U9-page-auction");
  const test1Page = document.getElementById("U9-page-test1");
  const test2Page = document.getElementById("U9-page-test2");

  if (!shopPage) return;

  const grid = document.getElementById("U9-shop-products-grid");
  const status = document.getElementById("U9-shop-products-status");
  const errorBox = document.getElementById("U9-shop-products-error");
  const sentinel = document.getElementById("U9-shop-products-sentinel");
  const retryButton = document.getElementById("U9-shop-products-retry");

  const CONFIG = {
    table: "shop_products",
    pageSize: 16,
    maxImages: 5,
    currencySymbol: "$",
    loadingImage: "/SSVG/logo/loading.svg",
    storageHost: "vjlpowhxmflpkjlukkfy.supabase.co",
    storagePublicPrefix: "/storage/v1/object/public/",
    storageProxyPrefix: "/storage-2/",
    storageBucket: "U9",
    storageFolder: "Products/Shop"
  };

  let initialized = false;
  let loading = false;
  let hasMore = true;
  let offset = 0;
  let observer = null;
  let clientWaitPromise = null;
  const renderedIds = new Set();

  function createElement(tag, className) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    return element;
  }

  function showStatus(message, showSpinner) {
    if (!status) return;
    status.hidden = false;
    status.style.display = "flex";
    status.textContent = "";
    if (showSpinner) {
      const spinner = createElement("img", "U9-shop-loading-icon");
      spinner.src = CONFIG.loadingImage;
      spinner.alt = "Loading";
      spinner.draggable = false;
      status.appendChild(spinner);
    }
    if (message) {
      const text = createElement("span");
      text.textContent = message;
      status.appendChild(text);
    }
  }

  function hideStatus() {
    if (!status) return;
    status.hidden = true;
    status.style.display = "none";
  }

  function showError() {
    hideStatus();
    if (errorBox) errorBox.hidden = false;
  }

  function hideError() {
    if (errorBox) errorBox.hidden = true;
  }

  function waitForSupabaseClient() {
    if (window.supabaseClient) return Promise.resolve(window.supabaseClient);
    if (clientWaitPromise) return clientWaitPromise;

    clientWaitPromise = new Promise(function (resolve, reject) {
      const startedAt = Date.now();
      (function check() {
        if (window.supabaseClient) {
          resolve(window.supabaseClient);
          return;
        }
        if (Date.now() - startedAt >= 15000) {
          reject(new Error("Supabase client is not ready."));
          return;
        }
        window.setTimeout(check, 150);
      })();
    }).finally(function () {
      clientWaitPromise = null;
    });

    return clientWaitPromise;
  }

  function normalizeImageUrl(value) {
    if (typeof value !== "string" || !value.trim()) return "";
    const raw = value.trim();

    try {
      // Full Supabase public URL: route through the project's existing storage proxy.
      const url = new URL(raw, window.location.origin);
      if (url.hostname === CONFIG.storageHost && url.pathname.startsWith(CONFIG.storagePublicPrefix)) {
        return CONFIG.storageProxyPrefix + url.pathname.slice(CONFIG.storagePublicPrefix.length) + url.search;
      }

      // A path already containing the bucket name.
      if (!/^https?:\/\//i.test(raw)) {
        const cleanPath = raw.replace(/^\/+/, "");
        let objectPath = cleanPath;
        if (!objectPath.includes("/")) {
          objectPath = CONFIG.storageFolder + "/" + objectPath;
        }
        const bucketPath = objectPath.startsWith(CONFIG.storageBucket + "/")
          ? objectPath
          : CONFIG.storageBucket + "/" + objectPath;
        return CONFIG.storageProxyPrefix + bucketPath;
      }

      return raw;
    } catch (error) {
      console.warn("[U9 SHOP] Invalid product image URL:", raw, error);
      return "";
    }
  }

  function getProductImages(product) {
    const images = [];
    for (let i = 1; i <= CONFIG.maxImages; i += 1) {
      const value = product["product_image_" + i];
      if (typeof value === "string" && value.trim()) {
        const url = normalizeImageUrl(value);
        if (url) images.push(url);
      }
    }
    return images;
  }

  function getModalProduct(product) {
    const normalized = Object.assign({}, product, {
      product_discount: 0
    });

    // The shared modal accepts full Storage URLs and converts them to /storage-2/ itself.
    for (let i = 1; i <= CONFIG.maxImages; i += 1) {
      const value = product["product_image_" + i];
      if (typeof value === "string" && value.trim()) {
        const image = normalizeImageUrl(value);
        if (image.startsWith(CONFIG.storageProxyPrefix)) {
          normalized["product_image_" + i] =
            "https://" + CONFIG.storageHost + CONFIG.storagePublicPrefix +
            image.slice(CONFIG.storageProxyPrefix.length);
        }
      }
    }
    return normalized;
  }

  function formatPrice(value) {
    const number = Number(value);
    return CONFIG.currencySymbol + (Number.isFinite(number) ? number.toFixed(2) : "0.00");
  }

  function createProductImage(imageUrl, productName) {
    const wrapper = createElement("div", "U9-shop-product-image-wrap");
    const loadingImage = createElement("img", "U9-shop-product-loading-image");
    loadingImage.src = CONFIG.loadingImage;
    loadingImage.alt = "Loading";
    loadingImage.draggable = false;
    wrapper.appendChild(loadingImage);

    if (!imageUrl) {
      wrapper.innerHTML = '<div class="U9-shop-product-image-placeholder" aria-label="No product image">Image unavailable</div>';
      return wrapper;
    }

    const image = new Image();
    image.onload = function () {
      const displayImage = createElement("img", "U9-shop-product-image");
      displayImage.src = imageUrl;
      displayImage.alt = productName || "Product";
      displayImage.loading = "lazy";
      displayImage.decoding = "async";
      displayImage.draggable = false;
      wrapper.replaceChildren(displayImage);
    };
    image.onerror = function () {
      wrapper.innerHTML = '<div class="U9-shop-product-image-placeholder">Image unavailable</div>';
    };
    image.src = imageUrl;
    return wrapper;
  }

  function createVisualButton(className, label, imagePath) {
    const button = createElement("button", className);
    button.type = "button";
    button.setAttribute("aria-label", label);
    button.setAttribute("title", label);
    if (imagePath) {
      const icon = createElement("img");
      icon.src = imagePath;
      icon.alt = "";
      icon.setAttribute("aria-hidden", "true");
      icon.draggable = false;
      button.appendChild(icon);
    } else {
      button.textContent = label;
    }
    // Intentionally visual only. Do not open the product modal when a button is clicked.
    button.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
    });
    return button;
  }

  function openProductModal(product) {
    if (typeof window.openHomeProductModal !== "function") {
      console.error("[U9 SHOP] Shared Home Product Modal is unavailable.");
      return;
    }
    window.openHomeProductModal(getModalProduct(product));
  }

  function createProductCard(product) {
    const card = createElement("article", "U9-shop-product-card");
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", product.product_name || "Product details");

    const images = getProductImages(product);
    const imageWrap = createProductImage(images[0] || "", product.product_name);
    const info = createElement("div", "U9-shop-product-info");
    const name = createElement("div", "U9-shop-product-name");
    name.textContent = product.product_name || "";
    const price = createElement("div", "U9-shop-product-price");
    price.textContent = formatPrice(product.product_price);

    const actions = createElement("div", "U9-shop-product-actions");
    const saveButton = createVisualButton(
      "U9-shop-product-icon-button U9-shop-product-save",
      "Save",
      "/SSVG/button/save.svg"
    );
    const shareButton = createVisualButton(
      "U9-shop-product-icon-button U9-shop-product-share",
      "Share",
      "/SSVG/button/share.svg"
    );
    const buyButton = createVisualButton(
      "U9-shop-product-buy-button",
      "Buy",
      ""
    );

    actions.append(saveButton, shareButton, buyButton);
    info.append(name, price, actions);
    card.append(imageWrap, info);

    card.addEventListener("click", function () {
      openProductModal(product);
    });
    card.addEventListener("keydown", function (event) {
      if (event.target !== card) return;
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openProductModal(product);
      }
    });

    return card;
  }

  async function fetchProductsPage() {
    const client = await waitForSupabaseClient();
    const from = offset;
    const to = offset + CONFIG.pageSize - 1;

    const result = await client
      .from(CONFIG.table)
      .select("uuid, product_name, product_price, product_description, product_image_1, product_image_2, product_image_3, product_image_4, product_image_5, is_active")
      .eq("is_active", true)
      .order("product_name", { ascending: true })
      .range(from, to);

    if (result.error) throw result.error;
    if (!Array.isArray(result.data)) throw new Error("Invalid Shop Products response.");
    return result.data;
  }

  async function loadProducts() {
    if (!grid || loading || !hasMore) return;
    loading = true;
    hideError();
    showStatus("Loading products…", true);

    try {
      const products = await fetchProductsPage();
      offset += products.length;

      const fragment = document.createDocumentFragment();
      products.forEach(function (product) {
        if (!product || product.is_active !== true || !product.uuid || typeof product.product_name !== "string") return;
        const id = String(product.uuid);
        if (renderedIds.has(id)) return;
        renderedIds.add(id);
        fragment.appendChild(createProductCard(product));
      });
      grid.appendChild(fragment);

      if (products.length < CONFIG.pageSize) hasMore = false;
      hideStatus();

      if (!grid.children.length && !hasMore) {
        showStatus("No products available yet.", false);
      }
    } catch (error) {
      console.error("[U9 SHOP] Product loading failed:", error);
      showError();
    } finally {
      loading = false;
    }
  }

  function retryLoad() {
    if (loading) return;
    hasMore = true;
    loadProducts();
  }

  function initializeObserver() {
    if (observer || !sentinel || !("IntersectionObserver" in window)) return;
    observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && hasMore && !loading) loadProducts();
      });
    }, { root: null, rootMargin: "300px 0px", threshold: 0 });
    observer.observe(sentinel);
  }

  function openShopPage() {
    [homePage, auctionPage, test1Page, test2Page].forEach(function (page) {
      if (page) page.style.display = "none";
    });
    shopPage.style.display = "block";
    if (!initialized) {
      initialized = true;
      initializeObserver();
      loadProducts();
    }
  }

  function initializeShopPage() {
    shopPage.style.display = "none";
    if (retryButton) retryButton.addEventListener("click", retryLoad);
  }

  window.openShopPage = openShopPage;
  initializeShopPage();
})();
