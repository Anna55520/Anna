/* =================================================
   U9 HOME PRODUCT MODAL
   Full-screen modal + product action buttons
   Focus-safe open / close handling
================================================= */

(function () {
  "use strict";

  const modal = document.getElementById("U9-home-product-modal");
  const modalWindow = document.getElementById("U9-home-product-modal-window");
  const backdrop = document.getElementById("U9-home-product-modal-backdrop");
  const closeButton = document.getElementById("U9-home-product-modal-close");
  const detailContent = document.getElementById("U9-home-product-detail-content");

  if (!modal || !modalWindow || !detailContent) {
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

  /* =================================================
     SAVE + BUY BUTTONS
     Save reuses the existing SVG button (visual only).
     Buy is intentionally not connected to any action yet.
  ================================================= */

  function prepareProductActions() {
    // Remove an old row if the selected product has just changed.
    const oldActions = document.getElementById("U9-home-product-modal-actions");
    if (oldActions) oldActions.remove();

    const existingSaveButton =
      detailContent.querySelector(".U9-home-product-detail-favorite");

    const actions = document.createElement("div");
    actions.id = "U9-home-product-modal-actions";
    actions.setAttribute("aria-label", "Product actions");

    let saveButton = existingSaveButton;

    if (!saveButton) {
      saveButton = document.createElement("button");
      saveButton.type = "button";
      saveButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" stroke-width="1.8"
          stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" />
        </svg>
      `;
    }

    saveButton.id = "U9-home-product-modal-save";
    saveButton.classList.remove("U9-home-product-detail-favorite");
    saveButton.classList.add("U9-home-product-modal-action-button");
    saveButton.setAttribute("aria-label", "Save product");
    saveButton.setAttribute("title", "Save");

    // Add a visible label while retaining the original SVG artwork.
    let saveLabel = saveButton.querySelector("span");
    if (!saveLabel) {
      saveLabel = document.createElement("span");
      saveLabel.textContent = "Save";
      saveButton.appendChild(saveLabel);
    }

    const buyButton = document.createElement("button");
    buyButton.type = "button";
    buyButton.id = "U9-home-product-modal-buy";
    buyButton.className = "U9-home-product-modal-action-button";
    buyButton.textContent = "Buy";
    buyButton.setAttribute("aria-label", "Buy product");
    // Intentionally no click handler: Buy is a visual placeholder for now.

    actions.append(saveButton, buyButton);
    detailContent.appendChild(actions);
  }

  function openHomeProductModal() {
    if (!modal.classList.contains("modal-open")) {
      previousFocus = document.activeElement;
    }

    // Reposition the Save button and create the unbound Buy button
    // after Home Page has rendered the selected product content.
    prepareProductActions();

    modal.removeAttribute("inert");
    modal.setAttribute("aria-hidden", "false");
    modal.classList.remove("modal-closing");
    modal.classList.add("modal-open");

    if (!focusElement(modalWindow) && closeButton) {
      focusElement(closeButton);
    }

    return true;
  }

  function closeHomeProductModal() {
    if (!modal.classList.contains("modal-open")) return true;

    modal.classList.remove("modal-open");
    modal.classList.add("modal-closing");

    const focusTarget =
      previousFocus &&
      previousFocus.isConnected &&
      !modal.contains(previousFocus)
        ? previousFocus
        : null;

    if (!focusElement(focusTarget)) {
      const activeElement = document.activeElement;
      if (activeElement && modal.contains(activeElement) && typeof activeElement.blur === "function") {
        activeElement.blur();
      }
    }

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
