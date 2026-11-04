/* =========================================================
   U9 HOME PAGE - ADVERTISEMENT BANNERS
   File: JS/PAGE/HOME/banners.js

   Data source:
   Supabase Project: vjlpowhxmflpkjlukkfy
   Table: public.u9_home_banners

   Required public key:
   Set the project's anon/publishable key below.
   NEVER use a service_role key in browser code.
========================================================= */

(function () {
  "use strict";

  if (window.U9HomeBanners) return;

  const CONFIG = Object.freeze({
    SUPABASE_URL: "https://vjlpowhxmflpkjlukkfy.supabase.co",
    SUPABASE_ANON_KEY: "PASTE_VJLP_ANON_OR_PUBLISHABLE_KEY_HERE",
    TABLE: "u9_home_banners",
    ROTATION_INTERVAL: 5000,
    REQUEST_TIMEOUT: 12000,
    SELECT: "id,image_path,mobile_image_path,link_url,is_active"
  });

  const ROOT_ID = "U9-home-banners";
  let initialized = false;
  let loadingPromise = null;
  let banners = [];
  let activeIndex = 0;
  let rotationTimer = null;
  let observer = null;
  let pageVisible = !document.hidden;
  let hoverPaused = false;
  let focusPaused = false;
  let userPaused = false;
  let lastErrorLogged = false;

  function getRoot() {
    return document.getElementById(ROOT_ID);
  }

  function isConfigured() {
    return Boolean(
      CONFIG.SUPABASE_ANON_KEY &&
      CONFIG.SUPABASE_ANON_KEY !== "PASTE_VJLP_ANON_OR_PUBLISHABLE_KEY_HERE"
    );
  }

  function safeURL(value) {
    if (typeof value !== "string" || !value.trim()) return "";

    try {
      const url = new URL(value.trim(), window.location.origin);
      if (url.protocol !== "https:" && url.protocol !== "http:") return "";
      return url.href;
    } catch (_) {
      return "";
    }
  }

  function normalizeBanner(row) {
    if (!row || row.is_active !== true) return null;

    const desktopURL = safeURL(row.image_path);
    const mobileURL = safeURL(row.mobile_image_path) || desktopURL;

    if (!desktopURL) return null;

    return {
      id: String(row.id || ""),
      desktopURL,
      mobileURL,
      linkURL: safeURL(row.link_url)
    };
  }

  async function fetchBanners() {
    if (!isConfigured()) {
      console.warn(
        "U9 Home Banners: Add the vjlp Supabase anon/publishable key in banners.js."
      );
      return [];
    }

    const endpoint = new URL(
      "/rest/v1/" + CONFIG.TABLE,
      CONFIG.SUPABASE_URL
    );

    endpoint.searchParams.set("select", CONFIG.SELECT);
    endpoint.searchParams.set("is_active", "eq.true");
    endpoint.searchParams.set("order", "id.asc");

    const controller = new AbortController();
    const timeoutId = window.setTimeout(
      () => controller.abort(),
      CONFIG.REQUEST_TIMEOUT
    );

    try {
      const response = await fetch(endpoint.href, {
        method: "GET",
        headers: {
          apikey: CONFIG.SUPABASE_ANON_KEY,
          Authorization: "Bearer " + CONFIG.SUPABASE_ANON_KEY,
          Accept: "application/json"
        },
        cache: "no-store",
        signal: controller.signal
      });

      if (!response.ok) {
        const detail = await response.text().catch(() => "");
        throw new Error(
          "Home banners request failed (" + response.status + ") " + detail.slice(0, 240)
        );
      }

      const rows = await response.json();
      if (!Array.isArray(rows)) return [];

      return rows.map(normalizeBanner).filter(Boolean);
    } finally {
      window.clearTimeout(timeoutId);
    }
  }

  function createElement(tag, className) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    return element;
  }

  function createSlide(banner, index) {
    const slide = createElement("div", "U9-home-banner-slide");
    slide.dataset.index = String(index);
    slide.setAttribute("aria-hidden", index === activeIndex ? "false" : "true");

    const picture = document.createElement("picture");
    picture.className = "U9-home-banner-picture";

    if (banner.mobileURL && banner.mobileURL !== banner.desktopURL) {
      const source = document.createElement("source");
      source.media = "(max-width: 767px)";
      source.srcset = banner.mobileURL;
      picture.appendChild(source);
    }

    const image = document.createElement("img");
    image.className = "U9-home-banner-image";
    image.src = banner.desktopURL;
    image.alt = "U9 promotional banner " + (index + 1);
    image.draggable = false;
    image.decoding = "async";
    image.loading = index === 0 ? "eager" : "lazy";
    if (index === 0) image.fetchPriority = "high";

    image.addEventListener("load", function () {
      if (window.matchMedia("(max-width: 767px)").matches && image.naturalWidth && image.naturalHeight) {
        const root = getRoot();
        if (root) {
          root.style.setProperty(
            "--u9-home-banner-mobile-ratio",
            image.naturalWidth + " / " + image.naturalHeight
          );
        }
      }
    }, { once: true });

    image.addEventListener("error", function () {
      slide.classList.add("is-image-error");
    }, { once: true });

    picture.appendChild(image);

    let visual = picture;
    if (banner.linkURL) {
      const link = document.createElement("a");
      link.className = "U9-home-banner-link";
      link.href = banner.linkURL;
      link.setAttribute("aria-label", "Open U9 promotion " + (index + 1));
      link.appendChild(picture);
      visual = link;
    }

    slide.appendChild(visual);
    return slide;
  }

  function stopRotation() {
    if (rotationTimer !== null) {
      window.clearInterval(rotationTimer);
      rotationTimer = null;
    }
  }

  function shouldRotate() {
    return (
      banners.length > 1 &&
      pageVisible &&
      !document.hidden &&
      !hoverPaused &&
      !focusPaused &&
      !userPaused &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  }

  function startRotation() {
    stopRotation();
    if (!shouldRotate()) return;

    rotationTimer = window.setInterval(function () {
      showSlide((activeIndex + 1) % banners.length, false);
    }, CONFIG.ROTATION_INTERVAL);
  }

  function restartRotation() {
    stopRotation();
    startRotation();
  }

  function updateControls(root) {
    const dots = root.querySelectorAll(".U9-home-banner-dot");
    dots.forEach(function (dot, index) {
      const active = index === activeIndex;
      dot.classList.toggle("is-active", active);
      dot.setAttribute("aria-current", active ? "true" : "false");
      dot.setAttribute("aria-label", "Show banner " + (index + 1));
    });

    const slides = root.querySelectorAll(".U9-home-banner-slide");
    slides.forEach(function (slide, index) {
      const active = index === activeIndex;
      slide.classList.toggle("is-active", active);
      slide.setAttribute("aria-hidden", active ? "false" : "true");
    });
  }

  function showSlide(nextIndex, restartTimer) {
    if (!banners.length) return;

    activeIndex = (nextIndex + banners.length) % banners.length;
    const root = getRoot();
    if (!root) return;

    updateControls(root);
    if (restartTimer !== false) restartRotation();
  }

  function render() {
    const root = getRoot();
    if (!root) return;

    stopRotation();
    root.replaceChildren();
    root.hidden = true;
    root.classList.remove("has-multiple-banners");

    if (!banners.length) return;

    activeIndex = 0;
    root.hidden = false;
    root.setAttribute("aria-label", "U9 promotional banners");

    const viewport = createElement("div", "U9-home-banner-viewport");
    viewport.setAttribute("aria-live", "off");

    banners.forEach(function (banner, index) {
      viewport.appendChild(createSlide(banner, index));
    });

    root.appendChild(viewport);

    if (banners.length > 1) {
      root.classList.add("has-multiple-banners");

      const previous = createElement("button", "U9-home-banner-arrow U9-home-banner-previous");
      previous.type = "button";
      previous.setAttribute("aria-label", "Previous banner");
      previous.innerHTML = '<span aria-hidden="true">&#8249;</span>';
      previous.addEventListener("click", function () {
        showSlide(activeIndex - 1, true);
      });

      const next = createElement("button", "U9-home-banner-arrow U9-home-banner-next");
      next.type = "button";
      next.setAttribute("aria-label", "Next banner");
      next.innerHTML = '<span aria-hidden="true">&#8250;</span>';
      next.addEventListener("click", function () {
        showSlide(activeIndex + 1, true);
      });

      const controls = createElement("div", "U9-home-banner-controls");
      const dots = createElement("div", "U9-home-banner-dots");
      dots.setAttribute("role", "group");
      dots.setAttribute("aria-label", "Choose banner");

      banners.forEach(function (_, index) {
        const dot = createElement("button", "U9-home-banner-dot");
        dot.type = "button";
        dot.addEventListener("click", function () {
          showSlide(index, true);
        });
        dots.appendChild(dot);
      });

      controls.appendChild(dots);
      root.appendChild(previous);
      root.appendChild(next);
      root.appendChild(controls);
    }

    updateControls(root);
    startRotation();
  }

  function onMouseEnter() {
    hoverPaused = true;
    stopRotation();
  }

  function onMouseLeave() {
    hoverPaused = false;
    startRotation();
  }

  function onFocusIn() {
    focusPaused = true;
    stopRotation();
  }

  function onFocusOut(event) {
    const root = getRoot();
    if (root && event.relatedTarget && root.contains(event.relatedTarget)) return;
    focusPaused = false;
    startRotation();
  }

  function onVisibilityChange() {
    pageVisible = !document.hidden;
    if (pageVisible) startRotation();
    else stopRotation();
  }

  function onPageShow() {
    pageVisible = !document.hidden;
    if (pageVisible) startRotation();
  }

  function onPageHide() {
    pageVisible = false;
    stopRotation();
  }

  function initialize() {
    if (initialized || !getRoot()) return;
    initialized = true;

    const root = getRoot();
    root.addEventListener("mouseenter", onMouseEnter);
    root.addEventListener("mouseleave", onMouseLeave);
    root.addEventListener("focusin", onFocusIn);
    root.addEventListener("focusout", onFocusOut);

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("pageshow", onPageShow);
    window.addEventListener("pagehide", onPageHide);

    if ("IntersectionObserver" in window) {
      observer = new IntersectionObserver(function (entries) {
        const entry = entries[0];
        pageVisible = Boolean(entry && entry.isIntersecting && !document.hidden);
        if (pageVisible) startRotation();
        else stopRotation();
      }, { threshold: 0.15 });
      observer.observe(getRoot());
    }

    load();
  }

  function load(force) {
    if (loadingPromise && !force) return loadingPromise;

    loadingPromise = fetchBanners()
      .then(function (items) {
        banners = items;
        render();
        lastErrorLogged = false;
        return banners;
      })
      .catch(function (error) {
        banners = [];
        render();
        if (!lastErrorLogged) {
          console.error("U9 Home Banners: Unable to load banners.", error);
          lastErrorLogged = true;
        }
        return [];
      })
      .finally(function () {
        loadingPromise = null;
      });

    return loadingPromise;
  }

  window.U9HomeBanners = Object.freeze({
    init: initialize,
    reload: function () { return load(true); },
    pause: function () { userPaused = true; stopRotation(); },
    resume: function () { userPaused = false; startRotation(); }
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize, { once: true });
  } else {
    initialize();
  }

})();
