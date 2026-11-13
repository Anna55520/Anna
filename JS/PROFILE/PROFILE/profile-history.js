
/* =================================================
   U9 PROFILE HISTORY PAGE
================================================= */

(function () {

  /* =================================
     ELEMENTS
  ================================= */

  const historyPage =
    document.getElementById(
      "U9-profile-history-page"
    );

  const historyButton =
    document.getElementById(
      "U9-profile-history-button"
    );

  const historyBack =
    document.getElementById(
      "U9-profile-history-back"
    );


  /* =================================
     OPEN HISTORY
  ================================= */

  function openProfileHistory() {

    if (!historyPage) return;

    historyPage.style.display = "flex";

  }


  /* =================================
     CLOSE HISTORY
  ================================= */

  function closeProfileHistory() {

    if (!historyPage) return;

    historyPage.style.display = "none";

  }


  /* =================================
     EVENTS
  ================================= */

  historyButton?.addEventListener(
    "click",
    openProfileHistory
  );

  historyBack?.addEventListener(
    "click",
    closeProfileHistory
  );


  /* =================================
     PUBLIC API
  ================================= */

  window.openProfileHistory =
    openProfileHistory;

  window.closeProfileHistory =
    closeProfileHistory;

})();
