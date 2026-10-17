
/* =================================================
   U9 PLATFORM MAINTENANCE
================================================= */

(() => {
  "use strict";

  const modal = document.getElementById(
    "U9-platform-maintenance-modal"
  );

  if (!modal || modal.dataset.initialized === "true") {
    return;
  }

  modal.dataset.initialized = "true";

  const messageElement = document.getElementById(
    "U9-platform-maintenance-message"
  );

  const durationElement = document.getElementById(
    "U9-platform-maintenance-duration-value"
  );

  let maintenanceEnabled = false;
  let previousBodyOverflow = "";

  function formatDuration(hours) {
    const value = Number(hours);

    if (!Number.isFinite(value) || value < 1 || value > 720) {
      return "Approximately 2 hours";
    }

    if (value === 1) {
      return "Approximately 1 hour";
    }

    if (Number.isInteger(value)) {
      return `Approximately ${value} hours`;
    }

    return `Approximately ${value} hours`;
  }

  function showMaintenance(settings = {}) {
    if (settings.maintenance_enabled !== true) {
      return;
    }

    maintenanceEnabled = true;

    const message =
      typeof settings.maintenance_message === "string" &&
      settings.maintenance_message.trim()
        ? settings.maintenance_message.trim()
        : "We are currently performing maintenance. Please try again later.";

    messageElement.textContent = message;

    durationElement.textContent = formatDuration(
      settings.maintenance_duration_hours
    );

    if (modal.hidden) {
      previousBodyOverflow = document.body.style.overflow;
    }

    modal.hidden = false;
    modal.setAttribute("aria-hidden", "false");

    document.body.style.overflow = "hidden";
  }

  function hideMaintenance() {
    if (maintenanceEnabled) {
      return;
    }

    modal.hidden = true;
    modal.setAttribute("aria-hidden", "true");

    document.body.style.overflow = previousBodyOverflow;
  }

  /*
   * Public methods for the future maintenance-status API.
   * The API integration will call these methods after
   * reading the u9-settings table through the Vercel proxy.
   */
  window.U9PlatformMaintenance = Object.freeze({
    update(settings) {
      if (!settings || typeof settings !== "object") {
        return;
      }

      if (settings.maintenance_enabled === true) {
        showMaintenance(settings);
        return;
      }

      maintenanceEnabled = false;
      hideMaintenance();
    },

    show: showMaintenance,

    isActive() {
      return maintenanceEnabled;
    }
  });

  /*
   * Prevent Escape from dismissing the maintenance modal.
   */
  document.addEventListener(
    "keydown",
    (event) => {
      if (maintenanceEnabled && event.key === "Escape") {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    },
    true
  );

  /*
   * Prevent background interaction while maintenance is active.
   */
  document.addEventListener(
    "click",
    (event) => {
      if (!maintenanceEnabled) {
        return;
      }

      if (!modal.contains(event.target)) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    },
    true
  );
})();
