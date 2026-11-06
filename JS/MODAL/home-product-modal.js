/* =================================================
   U9 HOME PRODUCT MODAL
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

  function openHomeProductModal() {
    modal.classList.remove("modal-closing");
    modal.classList.add("modal-open");
    modal.setAttribute("aria-hidden", "false");
    modal.removeAttribute("inert");
    return true;
  }

  function closeHomeProductModal() {
    if (!modal.classList.contains("modal-open")) return true;

    modal.classList.remove("modal-open");
    modal.classList.add("modal-closing");

    modal.setAttribute("aria-hidden", "true");
    modal.setAttribute("inert", "");

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
    window.setTimeout(finishClose, 650);
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
