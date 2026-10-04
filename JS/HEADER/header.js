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
   API
========================= */

const U9_ME_API =
  "https://tvtakmswbzawaweytimx.supabase.co/functions/v1/me";


const U9_SESSION_KEY =
  "u9_session";


/* =========================
   USER STATE
========================= */

/*
   Possible states:

   UNAUTHENTICATED
   CHECKING
   AUTHENTICATED
   INVALID
   ERROR
*/

let currentUser =
  null;


let currentUserState =
  "UNAUTHENTICATED";


let currentUserError =
  null;


/* =========================
   USER LISTENERS
========================= */

const userListeners =
  new Set();


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
       HIDE REGISTER
    */

    if (
      headerRegister
    ) {

      headerRegister.style.display =
        "none";

    }


    /*
       HIDE LOGIN
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
   NOTIFY USER LISTENERS
========================= */

function notifyUserListeners() {

  const user =
    currentUser;


  const state =
    currentUserState;


  const error =
    currentUserError;


  userListeners.forEach(
    listener => {

      try {

        listener(
          user,
          state,
          error
        );

      }

      catch (
        error
      ) {

        console.error(
          "U9User listener failed:",
          error
        );

      }

    }
  );

}


/* =========================
   SET USER STATE
========================= */

function setUserState(
  state,
  user = null,
  error = null
) {

  currentUserState =
    state;


  currentUser =
    user;


  currentUserError =
    error;


  /*
     Update Header UI
     only when authenticated
     or unauthenticated.
  */

  if (
    state ===
    "AUTHENTICATED"
  ) {

    updateHeaderUser(
      user
    );

  }


  else if (
    state ===
    "UNAUTHENTICATED"
  ) {

    updateHeaderUser(
      null
    );

  }


  else if (
    state ===
    "INVALID"
  ) {

    updateHeaderUser(
      null
    );

  }


  /*
     CHECKING / ERROR

     Do not force logout UI
     here.

     This is important because
     a network error does NOT
     mean the session is invalid.
  */


  notifyUserListeners();

}


/* =========================
   GET SESSION TOKEN
========================= */

function getSessionToken() {

  try {

    return localStorage.getItem(
      U9_SESSION_KEY
    );

  }

  catch (
    error
  ) {

    console.error(
      "Get U9 session failed:",
      error
    );


    return null;

  }

}


/* =========================
   REMOVE SESSION
========================= */

function removeSession() {

  try {

    localStorage.removeItem(
      U9_SESSION_KEY
    );

  }

  catch (
    error
  ) {

    console.error(
      "Remove U9 session failed:",
      error
    );

  }

}


/* =========================
   CHECK CURRENT USER
========================= */

async function getCurrentUser() {

  /*
     GET SESSION
  */

  const sessionToken =
    getSessionToken();


  /* =========================
     NO SESSION
  ========================= */

  if (
    !sessionToken
  ) {

    setUserState(
      "UNAUTHENTICATED",
      null,
      null
    );


    return null;

  }


  /* =========================
     CHECKING
  ========================= */

  setUserState(
    "CHECKING",
    currentUser,
    null
  );


  try {

    /* =========================
       REQUEST /ME
    ========================= */

    const response =
      await fetch(

        U9_ME_API,

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
       INVALID SESSION
    ========================= */

    if (
      response.status ===
      401 ||

      response.status ===
      403
    ) {

      /*
         Only remove the session
         when the server clearly
         says the authentication
         is invalid.
      */

      removeSession();


      setUserState(
        "INVALID",
        null,
        null
      );


      /*
         After invalid session,
         treat the user as logged out.
      */

      setUserState(
        "UNAUTHENTICATED",
        null,
        null
      );


      return null;

    }


    /* =========================
       OTHER SERVER ERROR
    ========================= */

    if (
      !response.ok
    ) {

      const error =
        new Error(
          `GET /me failed: ${response.status}`
        );


      console.error(
        "Get current user failed:",
        error
      );


      /*
         Do NOT delete session.

         The session may still be valid.
      */

      setUserState(
        "ERROR",
        currentUser,
        error
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

    const user =
      result?.user ||
      result?.data?.user ||
      null;


    /* =========================
       NO USER
    ========================= */

    if (
      !user
    ) {

      const error =
        new Error(
          "GET /me returned no user."
        );


      console.error(
        "Get current user failed:",
        error
      );


      /*
         Do NOT delete session.

         A malformed response is
         not enough evidence that
         the session is invalid.
      */

      setUserState(
        "ERROR",
        currentUser,
        error
      );


      return null;

    }


    /* =========================
       AUTHENTICATED
    ========================= */

    setUserState(
      "AUTHENTICATED",
      user,
      null
    );


    return user;

  }


  /* =========================
     NETWORK / FETCH ERROR
  ========================= */

  catch (
    error
  ) {

    console.error(
      "Get current user failed:",
      error
    );


    /*
       IMPORTANT:

       Network failure does NOT mean
       the session is invalid.

       Keep u9_session.
    */

    setUserState(
      "ERROR",
      currentUser,
      error
    );


    return null;

  }

}


/* =========================
   GET CURRENT USER
========================= */

function getUser() {

  return currentUser;

}


/* =========================
   GET USER STATE
========================= */

function getUserState() {

  return currentUserState;

}


/* =========================
   CHECK LOGGED IN
========================= */

function isLoggedIn() {

  return (
    currentUserState ===
    "AUTHENTICATED" &&
    !!currentUser
  );

}


/* =========================
   CHECKING USER
========================= */

function isChecking() {

  return (
    currentUserState ===
    "CHECKING"
  );

}


/* =========================
   CHECK SESSION
========================= */

function hasSession() {

  return !!getSessionToken();

}


/* =========================
   SUBSCRIBE
========================= */

function subscribeUser(
  listener
) {

  if (
    typeof listener !==
    "function"
  ) {

    return function() {};

  }


  userListeners.add(
    listener
  );


  /*
     Return unsubscribe function
  */

  return function() {

    userListeners.delete(
      listener
    );

  };

}


/* =========================
   REFRESH USER
========================= */

async function refreshUser() {

  return await getCurrentUser();

}


/* =========================
   LOGOUT USER
========================= */

function clearCurrentUser() {

  removeSession();


  setUserState(
    "UNAUTHENTICATED",
    null,
    null
  );

}


/* =========================
   EXPORT
========================= */

window.U9User = {

  /*
     Current user
  */

  get:
    getUser,


  /*
     Refresh /me
  */

  refresh:
    refreshUser,


  /*
     Login state
  */

  isLoggedIn:
    isLoggedIn,


  /*
     Checking state
  */

  isChecking:
    isChecking,


  /*
     Has local session
  */

  hasSession:
    hasSession,


  /*
     Current state
  */

  getState:
    getUserState,


  /*
     Subscribe to changes
  */

  subscribe:
    subscribeUser,


  /*
     Clear session + user
  */

  clear:
    clearCurrentUser

};


/* =========================
   INIT
========================= */

getCurrentUser();
