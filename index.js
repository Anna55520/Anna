/* =========================
   U9 INDEX
========================= */


/* =========================
   ME API
========================= */

const U9_ME_URL =
  "https://tvtakmswbzawaweytimx.supabase.co/functions/v1/me";


/* =========================
   GET CURRENT USER
========================= */

async function u9GetCurrentUser() {

  try {

    /* =========================
       REQUEST /ME
    ========================= */

    const response =
      await fetch(
        U9_ME_URL,
        {

          method:
            "GET",

          credentials:
            "include"

        }
      );


    /* =========================
       NOT AUTHENTICATED
    ========================= */

    if (
      !response.ok
    ) {

      return null;

    }


    /* =========================
       JSON
    ========================= */

    const result =
      await response.json();


    /* =========================
       CHECK AUTHENTICATED
    ========================= */

    if (
      result.authenticated !== true
    ) {

      return null;

    }


    /* =========================
       GET USER
    ========================= */

    return (
      result.user ||
      null
    );

  }

  catch (error) {

    console.error(
      "Failed to get current user:",
      error
    );


    return null;

  }

}


/* =========================
   INITIALIZE U9
========================= */

async function u9Initialize() {

  /* =========================
     GET CURRENT USER
  ========================= */

  const user =
    await u9GetCurrentUser();


  /* =========================
     LOGGED IN
  ========================= */

  if (user) {

    /* =========================
       HEADER
    ========================= */

    if (
      window.U9Header &&
      typeof
        window.U9Header.showLoggedIn ===
        "function"
    ) {

      window.U9Header.showLoggedIn(
        user
      );

    }


    /* =========================
       AVATAR
    ========================= */

    if (
      window.U9Avatar &&
      typeof
        window.U9Avatar.load ===
        "function"
    ) {

      window.U9Avatar.load(
        user
      );

    }

  }


  /* =========================
     LOGGED OUT
  ========================= */

  else {

    /* =========================
       HEADER
    ========================= */

    if (
      window.U9Header &&
      typeof
        window.U9Header.showLoggedOut ===
        "function"
    ) {

      window.U9Header.showLoggedOut();

    }


    /* =========================
       AVATAR
    ========================= */

    if (
      window.U9Avatar &&
      typeof
        window.U9Avatar.load ===
        "function"
    ) {

      window.U9Avatar.load(
        null
      );

    }

  }

}


/* =========================
   START
========================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    u9Initialize();

  }
);
