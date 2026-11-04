/* =========================================================
   U9 HOME PAGE - STATIC ADVERTISEMENT BANNERS
   File: JS/PAGE/HOME/banners.js

   - No database request
   - No Supabase client or API key
   - PC / Mobile images are configured below
   - Automatic rotation every 5 seconds
========================================================= */

(function () {
  "use strict";

  const ROOT_ID = "U9-home-banners";
  const ROTATION_INTERVAL = 5000;
  const MOBILE_QUERY = "(max-width: 767px)";

  // Add, remove, or reorder banner objects here.
  // Leave link as an empty string when the banner should not be clickable.
  const BANNERS = Object.freeze([
    {
      pc: "https://vjlpowhxmflpkjlukkfy.supabase.co/storage/v1/object/public/U9/Banners/PC/PC1.jpg",
      mobile: "https://vjlpowhxmflpkjlukkfy.supabase.co/storage/v1/object/public/U9/Banners/Mobile/Mobile1.jpg",
      link: ""
    },
    {
      pc: "https://vjlpowhxmflpkjlukkfy.supabase.co/storage/v1/object/public/U9/Banners/PC/PC2.png",
      mobile: "https://vjlpowhxmflpkjlukkfy.supabase.co/storage/v1/object/public/U9/Banners/Mobile/Mobile2.png",
      link: ""
    },
    {
      pc: "https://vjlpowhxmflpkjlukkfy.supabase.co/storage/v1/object/public/U9/Banners/PC/PC3.png",
      mobile: "https://vjlpowhxmflpkjlukkfy.supabase.co/storage/v1/object/public/U9/Banners/Mobile/Mobile1.png",
      link: ""
    }
  ]);

  let initialized = false;
  let banners = [];
  let activeIndex = 0;
  let rotationTimer = null;
  let intersectionObserver = null;
  let isPageVisible = !document.hidden;
  let isInViewport = true;
  let isHoverPaused = false;
  let isFocusPaused = false;
  let isUserPaused = false;
  let touchStartX = null;
  let touchStartY = null;
  let suppressClickUntil = 0;

  function getRoot() {
    return document.getElementById(ROOT_ID);
  }

  function safeURL(value) {
    if (typeof value !== "string" || !value.trim()) return "";

    try {
      const parsed = new URL(value.trim(), window.location.href);
      if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return "";
      return parsed.href;
    } catch (_) {
      return "";
    }
  }

  function getValidBanners() {
    return BANNERS.map(function (item) {
      if (!item) return null;

      const pcURL = safeURL(item.pc);
      const mobileURL = safeURL(item.mobile) || pcURL;

      if (!pcURL) return null;

      return {
        pc: pcURL,
        mobile: mobileURL,
        link: safeURL(item.link)
      };
    }).filter(Boolean);
  }

  function createElement(tag, className) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    return element;
  }

  function updateMobileAspectRatio() {
    const root = getRoot();
    if (!root || !window.matchMedia(MOBILE_QUERY).matches) return;

    const activeSlide = root.querySelector(
      '.U9-home-banner-slide[data-index="' + activeIndex + '"]'
    );
    const image = activeSlide && activeSlide.querySelector("img");

    if (!image || !image.naturalWidth || !image.naturalHeight) return;

    root.style.setProperty(
      "--u9-home-banner-mobile-ratio",
      image.naturalWidth + " / " + image.naturalHeight
    );
  }

  function createSlide(banner, index) {
    const slide = createElement("div", "U9-home-banner-slide");
    slide.dataset.index = String(index);
    slide.setAttribute("aria-hidden", index === activeIndex ? "false" : "true");

    const picture = document.createElement("picture");
    picture.className = "U9-home-banner-picture";

    if (banner.mobile && banner.mobile !== banner.pc) {
      const source = document.createElement("source");
      source.media = MOBILE_QUERY;
      source.srcset = banner.mobile;
      picture.appendChild(source);
    }

    const image = document.createElement("img");
    image.className = "U9-home-banner-image";
    image.src = banner.pc;
    image.alt = "U9 promotional banner " + (index + 1);
    image.draggable = false;
    image.decoding = "async";
    image.loading = index === 0 ? "eager" : "lazy";

    if (index === 0) {
      image.fetchPriority = "high";
    }

    image.addEventListener("load", function () {
      if (index === activeIndex) updateMobileAspectRatio();
    });

    image.addEventListener("error", function () {
      slide.classList.add("is-image-error");
      if (index === activeIndex) {
        window.setTimeout(function () {
          const root = getRoot();
          if (!root || !banners.length) return;
          if (banners.length > 1) showSlide(activeIndex + 1, true);
          else root.hidden = true;
        }, 0);
      }
    }, { once: true });

    picture.appendChild(image);

    let visual = picture;
    if (banner.link) {
      const anchor = document.createElement("a");
      anchor.className = "U9-home-banner-link";
      anchor.href = banner.link;
      anchor.setAttribute("aria-label", "Open U9 promotion " + (index + 1));
      anchor.appendChild(picture);
      visual = anchor;
    }

    slide.appendChild(visual);
    return slide;
  }

  function updateControls() {
    const root = getRoot();
    if (!root) return;

    root.querySelectorAll(".U9-home-banner-slide").forEach(function (slide, index) {
      const active = index === activeIndex;
      slide.classList.toggle("is-active", active);
      slide.setAttribute("aria-hidden", active ? "false" : "true");
    });

    root.querySelectorAll(".U9-home-banner-dot").forEach(function (dot, index) {
      const active = index === activeIndex;
      dot.classList.toggle("is-active", active);
      if (active) dot.setAttribute("aria-current", "true");
      else dot.removeAttribute("aria-current");
    });

    updateMobileAspectRatio();
  }

  function canAutoRotate() {
    return (
      banners.length > 1 &&
      isPageVisible &&
      !document.hidden &&
      isInViewport &&
      !isHoverPaused &&
      !isFocusPaused &&
      !isUserPaused &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  }

  function stopRotation() {
    if (rotationTimer !== null) {
      window.clearTimeout(rotationTimer);
      rotationTimer = null;
    }
  }

  function scheduleRotation() {
    stopRotation();
    if (!canAutoRotate()) return;

    rotationTimer = window.setTimeout(function () {
      activeIndex = (activeIndex + 1) % banners.length;
      updateControls();
      scheduleRotation();
    }, ROTATION_INTERVAL);
  }

  function showSlide(index, resetTimer) {
    if (!banners.length) return;

    activeIndex = (index + banners.length) % banners.length;
    updateControls();

    if (resetTimer !== false) scheduleRotation();
  }

  function buildControls(root) {
    if (banners.length <= 1) return;

    const previous = createElement(
      "button",
      "U9-home-banner-arrow U9-home-banner-previous"
    );
    previous.type = "button";
    previous.setAttribute("aria-label", "Previous banner");
    previous.innerHTML = '<span aria-hidden="true">&#8249;</span>';
    previous.addEventListener("click", function () {
      showSlide(activeIndex - 1, true);
    });

    const next = createElement(
      "button",
      "U9-home-banner-arrow U9-home-banner-next"
    );
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
      dot.setAttribute("aria-label", "Show banner " + (index + 1));
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
    root.setAttribute("role", "region");
    root.setAttribute("aria-roledescription", "carousel");
    root.setAttribute("aria-label", "U9 promotional banners");

    const viewport = createElement("div", "U9-home-banner-viewport");
    viewport.setAttribute("aria-live", "off");

    banners.forEach(function (banner, index) {
      viewport.appendChild(createSlide(banner, index));
    });

    root.appendChild(viewport);

    if (banners.length > 1) {
      root.classList.add("has-multiple-banners");
      buildControls(root);
    }

    updateControls();
    scheduleRotation();
  }

  function onMouseEnter() {
    isHoverPaused = true;
    stopRotation();
  }

  function onMouseLeave() {
    isHoverPaused = false;
    scheduleRotation();
  }

  function onFocusIn() {
    isFocusPaused = true;
    stopRotation();
  }

  function onFocusOut(event) {
    const root = getRoot();
    if (root && event.relatedTarget && root.contains(event.relatedTarget)) return;
    isFocusPaused = false;
    scheduleRotation();
  }

  function onVisibilityChange() {
    isPageVisible = !document.hidden;
    if (isPageVisible) scheduleRotation();
    else stopRotation();
  }

  function onPageHide() {
    isPageVisible = false;
    stopRotation();
  }

  function onPageShow() {
    isPageVisible = !document.hidden;
    scheduleRotation();
  }

  function onResize() {
    updateMobileAspectRatio();
  }

  function onTouchStart(event) {
    if (!event.touches || event.touches.length !== 1) return;
    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
  }

  function onTouchEnd(event) {
    if (touchStartX === null || !event.changedTouches || !event.changedTouches.length) return;

    const deltaX = event.changedTouches[0].clientX - touchStartX;
    const deltaY = event.changedTouches[0].clientY - touchStartY;
    touchStartX = null;
    touchStartY = null;

    // Only treat a clear horizontal gesture as a carousel swipe.
    if (Math.abs(deltaX) < 45 || Math.abs(deltaX) <= Math.abs(deltaY) * 1.2) return;

    suppressClickUntil = Date.now() + 350;
    showSlide(activeIndex + (deltaX < 0 ? 1 : -1), true);
  }

  function onClickCapture(event) {
    if (Date.now() > suppressClickUntil) return;
    const anchor = event.target.closest && event.target.closest("a.U9-home-banner-link");
    if (anchor) {
      event.preventDefault();
      event.stopPropagation();
    }
  }

  function onKeyDown(event) {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      showSlide(activeIndex - 1, true);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      showSlide(activeIndex + 1, true);
    }
  }

  function initialize() {
    if (initialized) return;

    const root = getRoot();
    if (!root) return;

    initialized = true;
    banners = getValidBanners();

    root.addEventListener("mouseenter", onMouseEnter);
    root.addEventListener("mouseleave", onMouseLeave);
    root.addEventListener("focusin", onFocusIn);
    root.addEventListener("focusout", onFocusOut);
    root.addEventListener("touchstart", onTouchStart, { passive: true });
    root.addEventListener("touchend", onTouchEnd, { passive: true });
    root.addEventListener("click", onClickCapture, true);
    root.addEventListener("keydown", onKeyDown);

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("pageshow", onPageShow);
    window.addEventListener("pagehide", onPageHide);
    window.addEventListener("resize", onResize, { passive: true });

    render();

    if ("IntersectionObserver" in window && !root.hidden) {
      intersectionObserver = new IntersectionObserver(function (entries) {
        const entry = entries[0];
        isInViewport = Boolean(entry && entry.isIntersecting && !document.hidden);
        if (isInViewport) scheduleRotation();
        else stopRotation();
      }, { threshold: 0.1 });

      intersectionObserver.observe(root);
    }
  }

  window.U9HomeBanners = Object.freeze({
    init: initialize,
    next: function () { showSlide(activeIndex + 1, true); },
    previous: function () { showSlide(activeIndex - 1, true); },
    goTo: function (index) { showSlide(Number(index) || 0, true); },
    pause: function () {
      isUserPaused = true;
      stopRotation();
    },
    resume: function () {
      isUserPaused = false;
      scheduleRotation();
    }
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize, { once: true });
  } else {
    initialize();
  }
})();
