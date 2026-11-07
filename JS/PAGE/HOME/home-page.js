
/* =================================================
   U9 HOME PRODUCT MODAL
   Full-screen modal + product action buttons
   Focus-safe open / close handling
================================================= */

(function () {
  "use strict";

  const modal =
    document.getElementById("U9-home-product-modal");

  const modalWindow =
    document.getElementById("U9-home-product-modal-window");

  const backdrop =
    document.getElementById("U9-home-product-modal-backdrop");

  const closeButton =
    document.getElementById("U9-home-product-modal-close");

  const detailContent =
    document.getElementById("U9-home-product-detail-content");

  if (!modal || !modalWindow || !detailContent) {
    console.error("[U9 HOME PRODUCT MODAL] Modal HTML not found.");
    return;
  }

  let previousFocus = null;


  /* =================================================
     FOCUS ELEMENT
  ================================================= */

  function focusElement(element) {

    if (!element || typeof element.focus !== "function") {
      return false;
    }

    try {

      element.focus({
        preventScroll: true
      });

    } catch (_) {

      element.focus();

    }

    return document.activeElement === element;

  }


  /* =================================================
     PRODUCT ACTIONS
     SAVE REMOVED
     BUY VISUAL ONLY
  ================================================= */

  function prepareProductActions() {

    // Remove previous actions.

    const oldActions =
      document.getElementById("U9-home-product-modal-actions");

    if (oldActions) {
      oldActions.remove();
    }

    // Remove any existing Save button from product details.

    detailContent
      .querySelectorAll(
        "#U9-home-product-modal-save, .U9-home-product-detail-favorite"
      )
      .forEach(function (button) {

        button.remove();

      });

    // Create actions container.

    const actions =
      document.createElement("div");

    actions.id =
      "U9-home-product-modal-actions";

    actions.setAttribute(
      "aria-label",
      "Product actions"
    );

    // Buy button.

    const buyButton =
      document.createElement("button");

    buyButton.type = "button";

    buyButton.id =
      "U9-home-product-modal-buy";

    buyButton.className =
      "U9-home-product-modal-action-button";

    buyButton.textContent = "Buy";

    buyButton.setAttribute(
      "aria-label",
      "Buy product"
    );

    // Intentionally no click handler.

    actions.appendChild(buyButton);

    detailContent.appendChild(actions);

  }


  /* =================================================
     OPEN MODAL
  ================================================= */

  function openHomeProductModal() {

    if (!modal.classList.contains("modal-open")) {

      previousFocus = document.activeElement;

    }

    // Prepare Buy only. No Save button.

    prepareProductActions();

    modal.removeAttribute("inert");

    modal.setAttribute(
      "aria-hidden",
      "false"
    );

    modal.classList.remove("modal-closing");

    modal.classList.add("modal-open");

    if (!focusElement(modalWindow) && closeButton) {

      focusElement(closeButton);

    }

    return true;

  }


  /* =================================================
     CLOSE MODAL
  ================================================= */

  function closeHomeProductModal() {

    if (!modal.classList.contains("modal-open")) {
      return true;
    }

    modal.classList.remove("modal-open");

    modal.classList.add("modal-closing");

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

    modal.setAttribute("inert", "");

    previousFocus = null;

    let finished = false;

    function finishClose() {

      if (finished) return;

      finished = true;

      modal.classList.remove("modal-closing");

      modalWindow.removeEventListener(
        "transitionend",
        onTransitionEnd
      );

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

    window.setTimeout(
      finishClose,
      500
    );

    return true;

  }


  /* =================================================
     WINDOW MANAGER
  ================================================= */

  if (window.U9WindowManager) {

    window.U9WindowManager.register(
      "home-product-modal",
      {

        open: openHomeProductModal,

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
     REQUEST CLOSE
  ================================================= */

  function requestClose() {

    if (window.U9WindowManager) {

      window.U9WindowManager.close(
        "home-product-modal"
      );

    } else {

      closeHomeProductModal();

    }

  }


  /* =================================================
     EVENTS
  ================================================= */

  if (closeButton) {

    closeButton.addEventListener(
      "click",
      requestClose
    );

  }

  if (backdrop) {

    backdrop.addEventListener(
      "click",
      requestClose
    );

  }

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

})();
