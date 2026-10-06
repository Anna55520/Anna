/* =================================================
   AUCTION PAGE
   U9 ORDER SYSTEM
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



/* =========================
   ORDER ELEMENTS
========================= */


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
   USER COINS
================================================= */


function setCoins(
  coins
){

  if(!orderCoinsValue){

    return;

  }


  const value =
  Number(coins);


  if(
    !Number.isFinite(value)
  ){

    orderCoinsValue.textContent =
    "0.00";

    return;

  }


  orderCoinsValue.textContent =
  value.toFixed(2);


}





/* =================================================
   LOAD CURRENT USER
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
       fallback:
       直接请求 /me

       给 Safari 使用
    */


    const token =
    localStorage.getItem(
      "u9_token"
    );



    if(!token){


      showError(
        "Please login first."
      );


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
      !response.ok
    ){

      showError(
        "Session expired."
      );


      return null;

    }




    if(
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
      "loadAuctionUser error:",
      error
    );


    showError(
      "Unable to load account."
    );


  }


  return null;


}






/* =================================================
   ERROR
================================================= */


function showError(
  text
){

  if(
    orderError
  ){

    orderError.textContent =
    text;

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
   ORDER STATUS
================================================= */


function showMatching(){


  if(orderStatusReady){

    orderStatusReady.style.display =
    "none";

  }



  if(orderStatusMatching){

    orderStatusMatching.style.display =
    "block";

  }



  if(orderMatching){

    orderMatching.style.display =
    "block";

  }



  if(orderMatchingText){

    orderMatchingText.textContent =
    "Matching...";

  }



}




function resetStatus(){


  if(orderStatusReady){

    orderStatusReady.style.display =
    "block";

  }


  if(orderStatusMatching){

    orderStatusMatching.style.display =
    "none";

  }


  if(orderMatching){

    orderMatching.style.display =
    "none";

  }


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
   不再自己检查 token

   header.js 已经验证用户
*/


if(
 !window.U9User ||
 !U9User.get()
){

  await loadAuctionUser();

}




const user =
U9User?.get();





if(!user){


  showError(
    "Please login first."
  );


  orderStartButton.disabled =
  false;


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
    `Bearer ${localStorage.getItem("u9_token")}`,

    "Content-Type":
    "application/json"

  }


 }

);





const data =
await response.json();





if(!response.ok){


 showError(
   data.error ||
   "Order start failed."
 );


 orderStartButton.disabled =
 false;


 return;


}




console.log(
 "ORDER START RESULT:",
 data
);





if(
 data.coins !== undefined
){

 setCoins(
   data.coins
 );

}




showMatching();



if(
 data.round
){

 if(orderRoundNumber){

 orderRoundNumber.textContent =
 `Round ${data.round.roundNumber}`;

 }


 if(orderRoundProgress){

 orderRoundProgress.textContent =
 `${data.round.completed}/${data.round.target}`;

 }


}





}
catch(error){


console.error(
 error
);


showError(
 "Network error."
);



}
finally{


 if(orderStartButton){

 orderStartButton.disabled =
 false;

 }


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



  if(homePage){

    homePage.style.display =
    "none";

  }



  if(shopPage){

    shopPage.style.display =
    "none";

  }



  auctionPage.style.display =
  "block";



  /*
     打开 Auction 时
     自动刷新用户 Coins
  */


  loadAuctionUser();



}







/* =================================================
   INITIALIZE AUCTION
================================================= */


function initializeAuctionPage(){


  if(
    auctionPage
  ){

    auctionPage.style.display =
    "none";

  }



  resetStatus();



  /*
     Start Order Button
  */


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
   USER UPDATE LISTENER
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



          setCoins(
            user.coins
          );



        }



        else if(
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
