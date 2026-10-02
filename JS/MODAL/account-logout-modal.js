/* =========================
   LOGOUT
========================= */


/* =========================
   LOGOUT CONFIRM
========================= */

const logoutModal =
  document.getElementById(
    "U9-account-logout"
  );


const logoutNo =
  document.getElementById(
    "U9-account-logout-no"
  );


const logoutYes =
  document.getElementById(
    "U9-account-logout-yes"
  );


const logoutCountdown =
  document.getElementById(
    "U9-account-logout-countdown"
  );


/* =========================
   SETTING PAGE LOGOUT BUTTON
========================= */

const accountSettingLogout =
  document.getElementById(
    "Account-U9-account-logout"
  );


/* =========================
   TIMER
========================= */

let logoutTimer =
  null;


/* =========================
   LOGOUT PROCESS
========================= */

let logoutProcessing =
  false;


/* =========================
   OPEN LOGOUT CONFIRM
========================= */

function openLogoutConfirm() {

  if (
    !logoutModal ||
    !logoutYes ||
    !logoutCountdown
  ) {

    return;

  }


  logoutModal.style.display =
    "flex";


  /* =========================
     RESET PROCESS
  ========================= */

  logoutProcessing =
    false;


  logoutYes.disabled =
    true;


  logoutYes.classList.remove(
    "loading"
  );


  let count =
    5;


  logoutCountdown.textContent =
    count;


  logoutYes.textContent =
    `Yes (${count})`;


  /* =========================
     CLEAR OLD TIMER
  ========================= */

  if (
    logoutTimer
  ) {

    clearInterval(
      logoutTimer
    );


    logoutTimer =
      null;

  }


  /* =========================
     COUNTDOWN
  ========================= */

  logoutTimer =
    setInterval(
      () => {

        count--;


        /* =========================
           COUNTDOWN TEXT
        ========================= */

        if (
          count > 0
        ) {

          logoutCountdown.textContent =
            count;


          logoutYes.textContent =
            `Yes (${count})`;

        }


        /* =========================
           COUNTDOWN FINISHED
        ========================= */

        if (
          count <= 0
        ) {

          clearInterval(
            logoutTimer
          );


          logoutTimer =
            null;


          logoutYes.textContent =
            "Yes";


          logoutYes.disabled =
            false;


          logoutYes.classList.add(
            "ready"
          );

        }

      },
      1000
    );

}


/* =========================
   SETTING PAGE LOGOUT BUTTON
========================= */

if (
  accountSettingLogout
) {

  accountSettingLogout.addEventListener(
    "click",
    (event) => {

      event.stopPropagation();


      if (
        typeof closeAccountSetting ===
        "function"
      ) {

        closeAccountSetting();

      }


      openLogoutConfirm();

    }
  );

}


/* =========================
   NO
========================= */

if (
  logoutNo
) {

  logoutNo.addEventListener(
    "click",
    () => {

      logoutModal.style.display =
        "none";


      logoutProcessing =
        false;


      if (
        logoutYes
      ) {

        logoutYes.disabled =
          true;


        logoutYes.classList.remove(
          "loading",
          "ready"
        );

      }


      if (
        logoutTimer
      ) {

        clearInterval(
          logoutTimer
        );


        logoutTimer =
          null;

      }

    }
  );

}


/* =========================
   YES
========================= */

if (
  logoutYes
) {

  logoutYes.addEventListener(
    "click",
    async () => {

      /* =========================
         PREVENT REPEAT CLICK
      ========================= */

      if (
        logoutYes.disabled ||
        logoutProcessing
      ) {

        return;

      }


      /* =========================
         START LOGOUT
      ========================= */

      logoutProcessing =
        true;


      logoutYes.disabled =
        true;


      logoutYes.classList.remove(
        "ready"
      );


      logoutYes.classList.add(
        "loading"
      );


      logoutYes.textContent =
        "Loading...";


      /* =========================
         GET SESSION TOKEN
      ========================= */

      const sessionToken =
        localStorage.getItem(
          "u9_session"
        );


      /* =========================
         NO SESSION
      ========================= */

      if (
        !sessionToken
      ) {

        localStorage.removeItem(
          "u9_session"
        );


        if (
          logoutTimer
        ) {

          clearInterval(
            logoutTimer
          );


          logoutTimer =
            null;

        }


        logoutModal.style.display =
          "none";


        logoutProcessing =
          false;


        window.location.reload();

        return;

      }


      /* =========================
         LOGOUT REQUEST
      ========================= */

      try {

        const response =
          await fetch(
            "https://tvtakmswbzawaweytimx.supabase.co/functions/v1/logout",
            {

              method:
                "POST",

              credentials:
                "include",

              headers: {

                "Authorization":
                  `Bearer ${sessionToken}`

              }

            }
          );


        const result =
          await response.json();


        /* =========================
           LOGOUT ERROR
        ========================= */

        if (
          !response.ok
        ) {

          console.error(
            "Logout failed:",
            result
          );


          alert(
            result.error ||
            "Logout failed."
          );


          logoutProcessing =
            false;


          logoutYes.disabled =
            false;


          logoutYes.classList.remove(
            "loading"
          );


          logoutYes.classList.add(
            "ready"
          );


          logoutYes.textContent =
            "Yes";


          return;

        }


        /* =========================
           REMOVE LOCAL SESSION
        ========================= */

        localStorage.removeItem(
          "u9_session"
        );


        /* =========================
           CLEAR TIMER
        ========================= */

        if (
          logoutTimer
        ) {

          clearInterval(
            logoutTimer
          );


          logoutTimer =
            null;

        }


        /* =========================
           CLOSE MODAL
        ========================= */

        logoutModal.style.display =
          "none";


        /* =========================
           DEBUG
        ========================= */

        console.log(
          "Logout result:",
          result
        );


        /* =========================
           REFRESH PAGE
        ========================= */

        window.location.reload();

      }

      catch (
        error
      ) {

        console.error(
          "Logout error:",
          error
        );


        alert(
          "Unable to connect to the server."
        );


        /* =========================
           RESTORE BUTTON
        ========================= */

        logoutProcessing =
          false;


        logoutYes.disabled =
          false;


        logoutYes.classList.remove(
          "loading"
        );


        logoutYes.classList.add(
          "ready"
        );


        logoutYes.textContent =
          "Yes";

      }

    }
  );

}
