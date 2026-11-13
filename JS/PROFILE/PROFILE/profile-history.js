/* =================================================
   U9 PROFILE HISTORY PAGE
   Navigation is managed centrally by profile.js so
   History can return to its correct origin.
================================================= */

(function () {
  window.openProfileHistory = function () {
    if (window.U9Profile?.showHistory) {
      window.U9Profile.showHistory();
    }
  };

  window.closeProfileHistory = function () {
    if (window.U9Profile?.returnFromHistory) {
      window.U9Profile.returnFromHistory();
    }
  };
})();
