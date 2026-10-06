
/* =========================
   API
========================= */

const U9_ORDER_MATCH_API =
  "https://tvtakmswbzawaweytimx.supabase.co/functions/v1/u9-order-match";


/* =========================
   GET SESSION TOKEN
========================= */

function getU9SessionToken() {

  return localStorage.getItem(
    "u9_token"
  );

}


/* =========================
   GET ROUND SETTINGS
========================= */

async function getU9RoundSettings() {

  try {

    const token =
      getU9SessionToken();


    const headers = {
      "Content-Type":
        "application/json"
    };


    if (token) {

      headers[
        "Authorization"
      ] =
        `Bearer ${token}`;

    }


    const response =
      await fetch(
        U9_ORDER_MATCH_API,
        {
          method:
            "GET",

          cache:
            "no-store",

          credentials:
            "include",

          headers:
            headers
        }
      );


    const result =
      await response.json();


    /* =========================
       AUTH ERROR
    ========================= */

    if (
      response.status === 401 ||
      response.status === 403
    ) {

      console.error(
        "[U9] Not authenticated"
      );

      return null;

    }


    /* =========================
       SERVER ERROR
    ========================= */

    if (!response.ok) {

      console.error(
        "[U9] u9-order-match failed:",
        result
      );

      return null;

    }


    /* =========================
       SUCCESS
    ========================= */

    if (
      !result ||
      result.success !== true
    ) {

      console.error(
        "[U9] Invalid response:",
        result
      );

      return null;

    }


    console.log(
      "[U9] Round Settings:",
      result.settings
    );


    console.log(
      "[U9] Current User:",
      result.user
    );


    return result;


  }
  catch (error) {

    console.error(
      "[U9] Request failed:",
      error
    );

    return null;

  }

}


/* =========================
   GLOBAL U9 API
========================= */

window.U9OrderMatch = {

  getSettings:
    getU9RoundSettings

};


/* =========================
   AUTO LOAD
========================= */

document.addEventListener(
  "DOMContentLoaded",
  async () => {

    const result =
      await getU9RoundSettings();


    if (!result) {

      return;

    }


    window.U9RoundSettings =
      result.settings;


    window.U9RoundUser =
      result.user;


    console.log(
      "[U9] Round settings ready:",
      window.U9RoundSettings
    );

  }
);


/* =========================
   AUCTION PAGE UI
========================= */

function updateU9AuctionUI() {
  const roundProgress =
    document.getElementById("U9-round-progress");

  const coinsElement =
    document.getElementById("U9-coins");

  if (!roundProgress || !coinsElement) {
    return;
  }

  /* -------------------------
     TARGET ORDERS
  ------------------------- */

  const targetOrders =
    window.U9RoundSettings?.default_target_orders ?? 0;

  /* -------------------------
     COMPLETED ORDERS
     暂时固定为 0
  ------------------------- */

  const completedOrders = 0;

  roundProgress.textContent =
    `${completedOrders}/${targetOrders}`;

  /* -------------------------
     COINS
  ------------------------- */

  const coins =
    window.U9RoundUser?.coins ?? 0;

  coinsElement.textContent =
    Number(coins).toFixed(2);
}


/* =========================
   UPDATE AFTER SETTINGS LOAD
========================= */

document.addEventListener(
  "DOMContentLoaded",
  async () => {
    const result =
      await getU9RoundSettings();

    if (!result) {
      return;
    }

    window.U9RoundSettings =
      result.settings;

    window.U9RoundUser =
      result.user;

    updateU9AuctionUI();

    console.log(
      "[U9] Round settings ready:",
      window.U9RoundSettings
    );
  }
);
