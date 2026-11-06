/* =================================================
   U9 HOME PRODUCT MODAL
   Focus-safe open / close handling
================================================= */

(function () {
  "use strict";

  const modal = document.getElementById("U9-home-product-modal");
  const modalWindow = document.getElementById("U9-home-product-modal-window");
  const backdrop = document.getElementById("U9-home-product-modal-backdrop");
  const closeButton = document.getElementById("U9-home-product-modal-close");

  if (!modal || !modalWindow) {
    console.error("[U9 HOME PRODUCT MODAL] Modal HTML not found.");
    return;
  }

  let previousFocus = null;

  function focusElement(element) {
    if (!element || typeof element.focus !== "function") return false;

    try {
      element.focus({ preventScroll: true });
    } catch (_) {
      element.focus();
    }

    return document.activeElement === element;
  }

  function openHomeProductModal() {
    // Remember the product card/button that opened this modal.
    if (!modal.classList.contains("modal-open")) {
      previousFocus = document.activeElement;
    }

    // Make the modal available to assistive technology before moving focus into it.
    modal.removeAttribute("inert");
    modal.setAttribute("aria-hidden", "false");
    modal.classList.remove("modal-closing");
    modal.classList.add("modal-open");

    // Keep keyboard focus inside the newly opened dialog.
    if (!focusElement(modalWindow) && closeButton) {
      focusElement(closeButton);
    }

    return true;
  }

  function closeHomeProductModal() {
    if (!modal.classList.contains("modal-open")) return true;

    modal.classList.remove("modal-open");
    modal.classList.add("modal-closing");

    // IMPORTANT:
    // Move focus out of the modal BEFORE applying aria-hidden/inert.
    // Otherwise Chrome reports that a focused descendant is being hidden.
    const focusTarget =
      previousFocus &&
      previousFocus.isConnected &&
      !modal.contains(previousFocus)
        ? previousFocus
        : null;

    if (!focusElement(focusTarget)) {
      // Fallback: explicitly blur the focused modal control.
      const activeElement = document.activeElement;
      if (activeElement && modal.contains(activeElement) && typeof activeElement.blur === "function") {
        activeElement.blur();
      }
    }

    // It is now safe to hide and disable the dialog for accessibility/focus.
    modal.setAttribute("aria-hidden", "true");
    modal.setAttribute("inert", "");

    previousFocus = null;

    let finished = false;

    function finishClose() {
      if (finished) return;
      finished = true;
      modal.classList.remove("modal-closing");
      modalWindow.removeEventListener("transitionend", onTransitionEnd);
    }

    function onTransitionEnd(event) {
      if (event.target === modalWindow && event.propertyName === "transform") {
        finishClose();
      }
    }

    modalWindow.addEventListener("transitionend", onTransitionEnd);
    window.setTimeout(finishClose, 500);

    return true;
  }

  if (window.U9WindowManager) {
    window.U9WindowManager.register("home-product-modal", {
      open: openHomeProductModal,
      close: closeHomeProductModal,
      isOpen: function () {
        return modal.classList.contains("modal-open") ||
          modal.classList.contains("modal-closing");
      }
    });
  } else {
    console.error("[U9 HOME PRODUCT MODAL] Window Manager unavailable.");
  }

  function requestClose() {
    if (window.U9WindowManager) {
      window.U9WindowManager.close("home-product-modal");
    } else {
      closeHomeProductModal();
    }
  }

  if (closeButton) closeButton.addEventListener("click", requestClose);
  if (backdrop) backdrop.addEventListener("click", requestClose);

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && modal.classList.contains("modal-open")) {
      requestClose();
    }
  });

  window.openHomeProductModal = openHomeProductModal;
  window.closeHomeProductModal = requestClose;
})();
