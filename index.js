/* =========================
   U9 INDEX
========================= */


/* =========================
   ME API
========================= */

const U9_ME_URL =
  "https://tvtakmswbzawaweytimx.supabase.co/functions/v1/me";


/* =========================
   CURRENT USER
========================= */

let U9_CURRENT_USER =
  null;


/* =========================
   GET CURRENT USER
========================= */

async function u9GetCurrentUser() {

  console.log(
    "U9: Requesting /me..."
  );


  try {

    /* =========================
       SESSION TOKEN
    ========================= */

    const sessionToken =
      localStorage.getItem(
        "u9_session"
      );


    console.log(
      "U9: Session token:",
      sessionToken
        ? "FOUND"
        : "NOT FOUND"
    );


    /* =========================
       REQUEST HEADERS
    ========================= */

    const headers = {};


    if (sessionToken) {

      headers.Authorization =
        `Bearer ${sessionToken}`;

    }


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
            "include",

          headers

        }
      );


    console.log(
      "U9: /me status:",
      response.status
    );


    /* =========================
       RESPONSE JSON
    ========================= */

    const result =
      await response.json();


    console.log(
      "U9: /me response:",
      result
    );


    /* =========================
       NOT AUTHENTICATED
    ========================= */

    if (
      !response.ok ||
      result.authenticated !== true
    ) {

      U9_CURRENT_USER =
        null;


      console.log(
        "U9: User is NOT authenticated."
      );


      return null;

    }


    /* =========================
       GET USER
    ========================= */

    const user =
      result.user ||
      null;


    U9_CURRENT_USER =
      user;


    console.log(
      "U9: Current user:",
      user
    );


    return user;

  }

  catch (error) {

    console.error(
      "U9: Failed to get current user:",
      error
    );


    U9_CURRENT_USER =
      null;


    return null;

  }

}


/* =========================
   UPDATE UI
========================= */

function u9UpdateUserUI(
  user
) {

  /* =========================
     LOGGED IN
  ========================= */

  if (user) {

    console.log(
      "U9: Updating UI → Logged In"
    );


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


    return;

  }


  /* =========================
     LOGGED OUT
  ========================= */

  console.log(
    "U9: Updating UI → Logged Out"
  );


  if (
    window.U9Header &&
    typeof
      window.U9Header.showLoggedOut ===
      "function"
  ) {

    window.U9Header.showLoggedOut();

  }


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


/* =========================
   REFRESH USER
========================= */

async function u9RefreshUser() {

  console.log(
    "U9: Refreshing user..."
  );


  const user =
    await u9GetCurrentUser();


  u9UpdateUserUI(
    user
  );


  return user;

}


/* =========================
   GET STORED USER
========================= */

function u9GetStoredUser() {

  return U9_CURRENT_USER;

}


/* =========================
   GLOBAL USER API
========================= */

window.U9User = {

  get:
    u9GetStoredUser,

  fetch:
    u9GetCurrentUser,

  refresh:
    u9RefreshUser

};


/* =========================
   INITIALIZE U9
========================= */

async function u9Initialize() {

  console.log(
    "U9: Initializing..."
  );


  await u9RefreshUser();

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
