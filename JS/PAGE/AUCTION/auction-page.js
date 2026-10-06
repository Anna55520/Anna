
/* =========================
   AUCTION PAGE
========================= */

(function () {


  /* =========================
     ELEMENTS
  ========================= */

  const homePage =
    document.getElementById(
      "U9-page-home"
    );


  const shopPage =
    document.getElementById(
      "U9-page-shop"
    );


  const auctionPage =
    document.getElementById(
      "U9-page-auction"
    );


  const test1Page =
    document.getElementById(
      "U9-page-test1"
    );


  const test2Page =
    document.getElementById(
      "U9-page-test2"
    );


  /* =========================
     ORDER ELEMENTS
  ========================= */

  const orderRoundNumber =
    document.getElementById(
      "Order-U9-Round-Number"
    );


  const orderRoundProgress =
    document.getElementById(
      "Order-U9-Round-Progress"
    );


  const orderRoundStatus =
    document.getElementById(
      "Order-U9-Round-Status"
    );


  const orderCoinsValue =
    document.getElementById(
      "Order-U9-Coins-Value"
    );


  const orderStartButton =
    document.getElementById(
      "Order-U9-Start-Button"
    );


  const orderStatusReady =
    document.getElementById(
      "Order-U9-Status-Ready"
    );


  const orderStatusMatching =
    document.getElementById(
      "Order-U9-Status-Matching"
    );


  const orderStatusPending =
    document.getElementById(
      "Order-U9-Status-Pending"
    );


  const orderStatusComplete =
    document.getElementById(
      "Order-U9-Status-Complete"
    );


  const orderStatusCooldown =
    document.getElementById(
      "Order-U9-Status-Cooldown"
    );


  const orderMatching =
    document.getElementById(
      "Order-U9-Matching"
    );


  const orderMatchingText =
    document.getElementById(
      "Order-U9-Matching-Text"
    );


  const orderMatchingTime =
    document.getElementById(
      "Order-U9-Matching-Time"
    );


  const orderError =
    document.getElementById(
      "Order-U9-Error"
    );


  /* =========================
     API
  ========================= */

  const U9_ORDER_START_API =
    "https://tvtakmswbzawaweytimx.supabase.co/functions/v1/u9-order-start";


  /* =========================
     HIDE ORDER STATUS
  ========================= */

  function hideOrderStatus() {


    if (
      orderStatusReady
    ) {

      orderStatusReady.style.display =
        "none";

    }


    if (
      orderStatusMatching
    ) {

      orderStatusMatching.style.display =
        "none";

    }


    if (
      orderStatusPending
    ) {

      orderStatusPending.style.display =
        "none";

    }


    if (
      orderStatusComplete
    ) {

      orderStatusComplete.style.display =
        "none";

    }


    if (
      orderStatusCooldown
    ) {

      orderStatusCooldown.style.display =
        "none";

    }


  }


  /* =========================
     SHOW READY STATUS
  ========================= */

  function showReadyStatus() {


    hideOrderStatus();


    if (
      orderStatusReady
    ) {

      orderStatusReady.style.display =
        "block";

    }


  }


  /* =========================
     SHOW MATCHING STATUS
  ========================= */

  function showMatchingStatus() {


    hideOrderStatus();


    if (
      orderStatusMatching
    ) {

      orderStatusMatching.style.display =
        "block";

    }


    if (
      orderMatching
    ) {

      orderMatching.style.display =
        "block";

    }


  }


  /* =========================
     HIDE MATCHING
  ========================= */

  function hideMatching() {


    if (
      orderMatching
    ) {

      orderMatching.style.display =
        "none";

    }


  }


  /* =========================
     CLEAR ERROR
  ========================= */

  function clearOrderError() {


    if (
      orderError
    ) {

      orderError.textContent =
        "";

    }


  }


  /* =========================
     SHOW ERROR
  ========================= */

  function showOrderError(
    message
  ) {


    if (
      orderError
    ) {

      orderError.textContent =
        message;

    }


  }


  /* =========================
     GET TOKEN
  ========================= */

  function getSessionToken() {


    const token =
      localStorage.getItem(
        "u9_token"
      );


    if (
      !token
    ) {

      return null;

    }


    return token;

  }


  /* =========================
     SET COINS
  ========================= */

  function setCoins(
    coins
  ) {


    if (
      !orderCoinsValue
    ) {

      return;

    }


    const numericCoins =
      Number(
        coins
      );


    if (
      !Number.isFinite(
        numericCoins
      )
    ) {

      orderCoinsValue.textContent =
        "0";

      return;

    }


    orderCoinsValue.textContent =
      numericCoins.toFixed(
        2
      );

  }


  /* =========================
     SET ROUND
  ========================= */

  function setRound(
    round
  ) {


    if (
      !round
    ) {

      return;

    }


    if (
      orderRoundNumber
    ) {

      orderRoundNumber.textContent =
        `Round ${round.roundNumber}`;

    }


    if (
      orderRoundProgress
    ) {

      orderRoundProgress.textContent =
        `${round.completed} / ${round.target}`;

    }


    if (
      orderRoundStatus
    ) {

      orderRoundStatus.textContent =
        round.status;

    }


  }


  /* =========================
     FORMAT MATCHING TIME
  ========================= */

  function formatMatchingTime(
    readyAt
  ) {


    if (
      !readyAt
    ) {

      return "";

    }


    const readyTime =
      new Date(
        readyAt
      ).getTime();


    if (
      !Number.isFinite(
        readyTime
      )
    ) {

      return "";

    }


    const now =
      Date.now();


    const remaining =
      Math.max(
        0,
        Math.ceil(
          (
            readyTime -
            now
          ) / 1000
        )
      );


    return `${remaining}s`;

  }


  /* =========================
     UPDATE MATCHING TIME
  ========================= */

  function updateMatchingTime(
    readyAt
  ) {


    if (
      !orderMatchingTime
    ) {

      return;

    }


    const text =
      formatMatchingTime(
        readyAt
      );


    if (
      text
    ) {

      orderMatchingTime.textContent =
        text;

    }

  }


  /* =========================
     MATCHING TIMER
  ========================= */

  let matchingTimer =
    null;


  function startMatchingTimer(
    readyAt
  ) {


    if (
      matchingTimer
    ) {

      clearInterval(
        matchingTimer
      );

      matchingTimer =
        null;

    }


    updateMatchingTime(
      readyAt
    );


    matchingTimer =
      setInterval(

        function () {


          updateMatchingTime(
            readyAt
          );


          const readyTime =
            new Date(
              readyAt
            ).getTime();


          if (
            !Number.isFinite(
              readyTime
            )
          ) {

            return;

          }


          if (
            Date.now() >=
            readyTime
          ) {


            clearInterval(
              matchingTimer
            );


            matchingTimer =
              null;


            if (
              orderMatchingTime
            ) {

              orderMatchingTime.textContent =
                "Ready";

            }

          }


        },

        250

      );

  }


  /* =========================
     STOP MATCHING TIMER
  ========================= */

  function stopMatchingTimer() {


    if (
      matchingTimer
    ) {

      clearInterval(
        matchingTimer
      );

      matchingTimer =
        null;

    }

  }


  /* =========================
     RESET ORDER UI
  ========================= */

  function resetOrderUI() {


    stopMatchingTimer();


    clearOrderError();


    hideOrderStatus();


    hideMatching();


    if (
      orderRoundNumber
    ) {

      orderRoundNumber.textContent =
        "";

    }


    if (
      orderRoundProgress
    ) {

      orderRoundProgress.textContent =
        "";

    }


    if (
      orderRoundStatus
    ) {

      orderRoundStatus.textContent =
        "";

    }


    if (
      orderMatchingTime
    ) {

      orderMatchingTime.textContent =
        "";

    }


    if (
      orderStartButton
    ) {

      orderStartButton.disabled =
        false;

    }


  }


  /* =========================
     START ORDER API
  ========================= */

  async function startOrder() {


    clearOrderError();


    const token =
      getSessionToken();


    /* =========================
       NO TOKEN
    ========================= */

    if (
      !token
    ) {

      showOrderError(
        "Please login first."
      );

      return;

    }


    /* =========================
       BUTTON LOCK
    ========================= */

    if (
      orderStartButton
    ) {

      orderStartButton.disabled =
        true;

    }


    /* =========================
       SHOW LOADING STATE
    ========================= */

    hideOrderStatus();


    if (
      orderMatching
    ) {

      orderMatching.style.display =
        "none";

    }


    if (
      orderRoundStatus
    ) {

      orderRoundStatus.textContent =
        "STARTING";

    }


    try {


      /* =========================
         API REQUEST
      ========================= */

      const response =
        await fetch(

          U9_ORDER_START_API,

          {

            method:
              "POST",

            headers: {

              "Authorization":
                `Bearer ${token}`,

              "Content-Type":
                "application/json"

            },

            /*
               Authorization 是主要认证方式。

               credentials include
               保留是为了兼容现有
               u9_session Cookie fallback。
            */

            credentials:
              "include"

          }

        );


      /* =========================
         READ RESPONSE
      ========================= */

      let data =
        null;


      try {

        data =
          await response.json();

      }

      catch (
        jsonError
      ) {

        data =
          null;

      }


      /* =========================
         HTTP ERROR
      ========================= */

      if (
        !response.ok
      ) {


        if (
          response.status ===
          401
        ) {

          localStorage.removeItem(
            "u9_token"
          );

          showOrderError(
            "Session expired. Please login again."
          );

        }

        else if (
          data &&
          data.error
        ) {

          showOrderError(
            data.error
          );

        }

        else {

          showOrderError(
            `Order start failed (${response.status}).`
          );

        }


        if (
          orderStartButton
        ) {

          orderStartButton.disabled =
            false;

        }


        return;

      }


      /* =========================
         API SUCCESS CHECK
      ========================= */

      if (
        !data ||
        data.success !==
        true
      ) {

        showOrderError(
          data &&
          data.error
            ? data.error
            : "Unable to start Order."
        );


        if (
          orderStartButton
        ) {

          orderStartButton.disabled =
            false;

        }


        return;

      }


      /* =========================
         UPDATE COINS
      ========================= */

      if (
        data.coins !==
        undefined
      ) {

        setCoins(
          data.coins
        );

      }


      /* =========================
         UPDATE ROUND
      ========================= */

      if (
        data.round
      ) {

        setRound(
          data.round
        );

      }


      /* =========================
         SHOW MATCHING
      ========================= */

      showMatchingStatus();


      if (
        orderRoundStatus
      ) {

        orderRoundStatus.textContent =
          "MATCHING";

      }


      if (
        orderMatchingText
      ) {

        orderMatchingText.textContent =
          "Matching...";

      }


      /* =========================
         MATCHING READY TIME
      ========================= */

      if (
        data.order &&
        data.order.matchingReadyAt
      ) {


        startMatchingTimer(
          data.order.matchingReadyAt
        );

      }


      /* =========================
         START BUTTON
      ========================= */

      if (
        orderStartButton
      ) {

        orderStartButton.disabled =
          true;

      }


    }

    catch (
      error
    ) {


      console.error(
        "u9-order-start error:",
        error
      );


      showOrderError(
        "Network error. Please try again."
      );


      if (
        orderStartButton
      ) {

        orderStartButton.disabled =
          false;

      }


    }

  }


  /* =========================
     OPEN AUCTION PAGE
  ========================= */

  function openAuctionPage() {

    if (
      !auctionPage
    ) {

      return;

    }


    if (
      homePage
    ) {

      homePage.style.display =
        "none";

    }


    if (
      shopPage
    ) {

      shopPage.style.display =
        "none";

    }


    if (
      test1Page
    ) {

      test1Page.style.display =
        "none";

    }


    if (
      test2Page
    ) {

      test2Page.style.display =
        "none";

    }


    auctionPage.style.display =
      "block";


    /* =========================
       RESET PAGE STATE
    ========================= */

    resetOrderUI();


  }


  /* =========================
     INITIALIZE AUCTION PAGE
  ========================= */

  function initializeAuctionPage() {

    if (
      !auctionPage
    ) {

      return;

    }


    auctionPage.style.display =
      "none";


    /* =========================
       INITIAL ORDER STATE
    ========================= */

    resetOrderUI();


    /* =========================
       START ORDER BUTTON
    ========================= */

    if (
      orderStartButton
    ) {

      orderStartButton.addEventListener(

        "click",

        startOrder

      );

    }

  }


  /* =========================
     PUBLIC FUNCTION
  ========================= */

  window.openAuctionPage =
    openAuctionPage;


  /* =========================
     START AUCTION PAGE
  ========================= */

  initializeAuctionPage();


})();
