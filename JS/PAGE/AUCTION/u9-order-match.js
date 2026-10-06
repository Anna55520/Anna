
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
       SUCCESS VALIDATION
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


    /* =========================
       DEBUG
    ========================= */

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
   UPDATE AUCTION COINS
========================= */

function updateU9AuctionCoins() {

  const coinsElement =
    document.getElementById(
      "U9-coins"
    );


  if (!coinsElement) {

    return;

  }


  const coins =
    window.U9RoundUser?.coins ?? 0;


  const numericCoins =
    Number(coins);


  if (
    Number.isFinite(
      numericCoins
    )
  ) {

    coinsElement.textContent =
      numericCoins.toFixed(2);

  }
  else {

    coinsElement.textContent =
      "0.00";

  }

}


/* =========================
   GLOBAL U9 API
========================= */

window.U9OrderMatch = {

  getSettings:
    getU9RoundSettings,

  updateCoins:
    updateU9AuctionCoins

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


    /* =========================
       SAVE USER
    ========================= */

    window.U9RoundUser =
      result.user;


    /* =========================
       SAVE SETTINGS
    ========================= */

    window.U9RoundSettings =
      result.settings;


    /* =========================
       UPDATE COINS ONLY
    ========================= */

    updateU9AuctionCoins();


    /* =========================
       DEBUG
    ========================= */

    console.log(
      "[U9] Round settings ready:",
      window.U9RoundSettings
    );


    console.log(
      "[U9] Auction coins ready:",
      window.U9RoundUser?.coins
    );

  }
);
