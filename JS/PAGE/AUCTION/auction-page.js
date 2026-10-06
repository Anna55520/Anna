/* =================================================
   AUCTION PAGE
   U9 ORDER SYSTEM
   Part 1/2
================================================= */

(function () {


/* =================================================
   ELEMENTS
================================================= */


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




/* =================================================
   ORDER ELEMENTS
================================================= */


const orderCoinsValue =
document.getElementById(
  "Order-U9-Coins-Value"
);



const orderStartButton =
document.getElementById(
  "Order-U9-Start-Button"
);



const orderError =
document.getElementById(
  "Order-U9-Error"
);



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






/* =================================================
   API
================================================= */


const U9_ORDER_START_API =
"https://tvtakmswbzawaweytimx.supabase.co/functions/v1/u9-order-start";



const U9_ME_API =
"https://tvtakmswbzawaweytimx.supabase.co/functions/v1/me";







/* =================================================
   CURRENT ORDER DATA
================================================= */


let currentOrder =
null;



let matchingTimer =
null;






/* =================================================
   COINS
================================================= */


function setCoins(
  coins
){


  if(
    !orderCoinsValue
  ){

    return;

  }



  const value =
  Number(
    coins
  );



  if(
    !Number.isFinite(
      value
    )
  ){

    orderCoinsValue.textContent =
    "0.00";


    return;

  }



  orderCoinsValue.textContent =
  value.toFixed(
    2
  );


}






/* =================================================
   ERROR
================================================= */


function showError(
  message
){


  if(
    orderError
  ){

    orderError.textContent =
    message;

  }


}





function clearError(){


  if(
    orderError
  ){

    orderError.textContent =
    "";

  }


}






/* =================================================
   USER LOAD
================================================= */


async function loadAuctionUser(){


  try{


    /*
       优先使用 header.js
    */


    if(
      window.U9User &&
      U9User.get()
    ){


      const user =
      U9User.get();



      setCoins(
        user.coins
      );



      return user;


    }






    /*
       Safari fallback
    */


    const token =
    localStorage.getItem(
      "u9_token"
    );



    if(
      !token
    ){

      return null;

    }





    const response =
    await fetch(

      U9_ME_API,

      {

        method:
        "GET",

        cache:
        "no-store",

        headers:{

          "Authorization":
          `Bearer ${token}`

        }

      }

    );






    const data =
    await response.json();





    if(
      response.ok &&
      data.user
    ){


      setCoins(
        data.user.coins
      );



      return data.user;


    }




  }

  catch(error){


    console.error(
      "loadAuctionUser:",
      error
    );


  }



  return null;


}






/* =================================================
   ROUND UPDATE
================================================= */


function updateRound(
  round
){


  if(
    !round
  ){

    return;

  }



  if(
    orderRoundNumber
  ){

    orderRoundNumber.textContent =
    `Round ${round.roundNumber}`;

  }



  if(
    orderRoundProgress
  ){

    orderRoundProgress.textContent =
    `${round.completed}/${round.target}`;

  }



  if(
    orderRoundStatus
  ){

    orderRoundStatus.textContent =
    round.status;

  }


}






/* =================================================
   STATUS CONTROL
================================================= */


function hideAllStatus(){


  const list = [

    orderStatusReady,

    orderStatusMatching,

    orderStatusPending,

    orderStatusComplete,

    orderStatusCooldown

  ];



  list.forEach(
    item => {

      if(item){

        item.style.display =
        "none";

      }

    }

  );


}





function showMatching(){


  hideAllStatus();



  if(
    orderStatusMatching
  ){

    orderStatusMatching.style.display =
    "block";

  }



  if(
    orderMatching
  ){

    orderMatching.style.display =
    "block";

  }



  if(
    orderMatchingText
  ){

    orderMatchingText.textContent =
    "Matching...";

  }


}






/* =================================================
   MATCHING TIMER
================================================= */


function startMatchingTimer(
  readyAt
){


  if(
    matchingTimer
  ){

    clearInterval(
      matchingTimer
    );

  }



  function update(){


    const target =
    new Date(
      readyAt
    ).getTime();



    const now =
    Date.now();



    const seconds =
    Math.max(
      0,
      Math.ceil(
        (target-now)/1000
      )
    );



    if(
      orderMatchingTime
    ){

      orderMatchingTime.textContent =
      `${seconds}s`;

    }



    if(
      seconds <= 0
    ){

      clearInterval(
        matchingTimer
      );


      if(
        orderMatchingTime
      ){

        orderMatchingTime.textContent =
        "Ready";

      }


    }


  }



  update();



  matchingTimer =
  setInterval(
    update,
    500
  );


}

/* =================================================
   START ORDER
================================================= */


async function startOrder(){


  clearError();



  if(
    orderStartButton
  ){

    orderStartButton.disabled =
    true;

  }





  try{



    /*
       确保用户存在
    */


    let user =
    null;



    if(
      window.U9User &&
      U9User.get()
    ){

      user =
      U9User.get();

    }
    else{

      user =
      await loadAuctionUser();

    }





    if(
      !user
    ){


      showError(
        "Please login first."
      );


      return;


    }







    const token =
    localStorage.getItem(
      "u9_token"
    );




    if(
      !token
    ){


      showError(
        "Session missing."
      );


      return;


    }







    const response =
    await fetch(

      U9_ORDER_START_API,

      {


        method:
        "POST",



        headers:{


          "Authorization":
          `Bearer ${token}`,



          "Content-Type":
          "application/json"


        }


      }

    );







    const data =
    await response.json();






    console.log(
      "ORDER START RESULT:",
      data
    );







    if(
      !response.ok
    ){


      showError(

        data.error ||
        "Order start failed."

      );


      return;


    }







    /*
       保存当前订单
    */


    if(
      data.order
    ){

      currentOrder =
      data.order;

    }







    /*
       更新 Coins
    */


    if(
      data.coins !== undefined
    ){

      setCoins(
        data.coins
      );

    }








    /*
       更新 Round
    */


    if(
      data.round
    ){

      updateRound(
        data.round
      );

    }







    /*
       显示 Matching
    */


    showMatching();








    /*
       开始倒计时
    */


    if(
      data.order &&
      data.order.matchingReadyAt
    ){


      startMatchingTimer(

        data.order.matchingReadyAt

      );


    }





  }


  catch(error){


    console.error(
      "startOrder error:",
      error
    );


    showError(
      "Network error."
    );


  }


  finally{


    if(
      orderStartButton
    ){

      orderStartButton.disabled =
      false;

    }


  }


}







/* =================================================
   RESET PAGE
================================================= */


function resetOrderPage(){



  if(
    matchingTimer
  ){

    clearInterval(
      matchingTimer
    );


    matchingTimer =
    null;

  }




  currentOrder =
  null;





  hideAllStatus();





  if(
    orderMatching
  ){

    orderMatching.style.display =
    "none";

  }





  if(
    orderMatchingTime
  ){

    orderMatchingTime.textContent =
    "";

  }





  if(
    orderRoundNumber
  ){

    orderRoundNumber.textContent =
    "";

  }





  if(
    orderRoundProgress
  ){

    orderRoundProgress.textContent =
    "";

  }





  if(
    orderRoundStatus
  ){

    orderRoundStatus.textContent =
    "";

  }




}








/* =================================================
   OPEN AUCTION PAGE
================================================= */


function openAuctionPage(){


  if(
    !auctionPage
  ){

    return;

  }






  if(
    homePage
  ){

    homePage.style.display =
    "none";

  }





  if(
    shopPage
  ){

    shopPage.style.display =
    "none";

  }







  auctionPage.style.display =
  "block";







  /*
     打开页面刷新 Coins
  */


  loadAuctionUser();




}








/* =================================================
   USER LISTENER
================================================= */


function connectUserListener(){



  if(
    window.U9User &&
    U9User.subscribe
  ){



    U9User.subscribe(

      function(
        user,
        state
      ){



        if(
          state ===
          "AUTHENTICATED"
        ){



          if(
            user &&
            user.coins !== undefined
          ){

            setCoins(
              user.coins
            );

          }



        }





        if(
          state ===
          "UNAUTHENTICATED"
        ){



          setCoins(
            0
          );


        }



      }


    );



  }



}







/* =================================================
   INIT
================================================= */


function initializeAuctionPage(){



  if(
    auctionPage
  ){

    auctionPage.style.display =
    "none";

  }





  resetOrderPage();






  if(
    orderStartButton
  ){


    orderStartButton.addEventListener(

      "click",

      startOrder

    );


  }




}








/* =================================================
   PUBLIC
================================================= */


window.openAuctionPage =
openAuctionPage;







/* =================================================
   START
================================================= */


initializeAuctionPage();



connectUserListener();





})();
