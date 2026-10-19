
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


/* =================================================
   U9 PLATFORM MAINTENANCE API
================================================= */

(() => {
  "use strict";

  const API_URL = "/api/u9-settings";
  const REFRESH_INTERVAL_MS = 200000;

  async function loadPlatformSettings() {
    try {
      const response = await fetch(API_URL, {
        method: "GET",
        cache: "no-store",
        credentials: "same-origin",
        headers: {
          Accept: "application/json"
        }
      });

      if (!response.ok) {
        throw new Error(`Platform settings request failed: ${response.status}`);
      }

      const result = await response.json();

      // Accept a single row, an array containing one row,
      // or a response wrapped in a "data" property.
      const settings = Array.isArray(result)
        ? result[0]
        : result?.data
          ? Array.isArray(result.data)
            ? result.data[0]
            : result.data
          : result;

      if (
        !settings ||
        typeof settings.maintenance_enabled !== "boolean"
      ) {
        throw new Error("Invalid platform settings response.");
      }

      if (window.U9PlatformMaintenance) {
        window.U9PlatformMaintenance.update({
          maintenance_enabled: settings.maintenance_enabled,
          maintenance_duration_hours:
            settings.maintenance_duration_hours,
          maintenance_message:
            typeof settings.maintenance_message === "string" &&
            settings.maintenance_message.trim()
              ? settings.maintenance_message.trim()
              : "We are currently performing maintenance. Please try again later."
        });
      }
    } catch (error) {
      // Do not incorrectly dismiss an already-active maintenance modal
      // if the API temporarily becomes unavailable.
      console.error("Unable to load platform maintenance settings:", error);
    }
  }

  // Read the current status as soon as the page is ready.
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadPlatformSettings, {
      once: true
    });
  } else {
    loadPlatformSettings();
  }

  // Refresh periodically so Admin changes reach the user interface.
  window.setInterval(loadPlatformSettings, REFRESH_INTERVAL_MS);
})();
