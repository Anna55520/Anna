
/* =========================
   HEADER ELEMENTS
========================= */


const headerRegister =
  document.getElementById(
    "U9-page-header-register"
  );


const headerLogin =
  document.getElementById(
    "U9-page-header-login"
  );


const headerUser =
  document.getElementById(
    "U9-page-header-user"
  );


const headerUsername =
  document.getElementById(
    "U9-page-header-username"
  );


/* =========================
   UPDATE HEADER
========================= */

function updateHeaderUser(
  user
) {

  /* =========================
     LOGGED IN
  ========================= */

  if (
    user
  ) {

    /*
       HIDE LOGIN
    */

    if (
      headerRegister
    ) {

      headerRegister.style.display =
        "none";

    }


    /*
       HIDE REGISTER
    */

    if (
      headerLogin
    ) {

      headerLogin.style.display =
        "none";

    }


    /*
       SHOW USER
    */

    if (
      headerUser
    ) {

      headerUser.classList.add(
        "active"
      );

    }


    /*
       USERNAME
    */

    if (
      headerUsername
    ) {

      headerUsername.textContent =
        user.username || "";

    }

  }


  /* =========================
     LOGGED OUT
  ========================= */

  else {

    /*
       SHOW REGISTER
    */

    if (
      headerRegister
    ) {

      headerRegister.style.display =
        "";

    }


    /*
       SHOW LOGIN
    */

    if (
      headerLogin
    ) {

      headerLogin.style.display =
        "";

    }


    /*
       HIDE USER
    */

    if (
      headerUser
    ) {

      headerUser.classList.remove(
        "active"
      );

    }


    /*
       CLEAR USERNAME
    */

    if (
      headerUsername
    ) {

      headerUsername.textContent =
        "";

    }

  }

}


/* =========================
   CHECK USER
========================= */

async function getCurrentUser() {

  try {

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

      updateHeaderUser(
        null
      );

      return null;

    }


    /* =========================
       REQUEST /ME
    ========================= */

    const response =
      await fetch(

        "https://tvtakmswbzawaweytimx.supabase.co/functions/v1/me",

        {

          method:
            "GET",

          headers: {

            "Authorization":
              `Bearer ${sessionToken}`

          }

        }

      );


    /* =========================
       SESSION INVALID
    ========================= */

    if (
      !response.ok
    ) {

      /*
         REMOVE INVALID SESSION
      */

      localStorage.removeItem(
        "u9_session"
      );


      updateHeaderUser(
        null
      );


      return null;

    }


    /* =========================
       JSON
    ========================= */

    const result =
      await response.json();


    /* =========================
       USER
    ========================= */

    if (
      !result.user
    ) {

      updateHeaderUser(
        null
      );

      return null;

    }


    /* =========================
       UPDATE HEADER
    ========================= */

    updateHeaderUser(
      result.user
    );


    /* =========================
       RETURN USER
    ========================= */

    return result.user;

  }


  /* =========================
     ERROR
  ========================= */

  catch (
    error
  ) {

    console.error(
      "Get current user failed:",
      error
    );


    updateHeaderUser(
      null
    );


    return null;

  }

}


/* =========================
   EXPORT
========================= */

window.U9User = {

  refresh:
    getCurrentUser

};


/* =========================
   INIT
========================= */

getCurrentUser();
