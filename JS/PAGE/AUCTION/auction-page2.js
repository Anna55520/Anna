/* =================================================
   AUCTION PAGE 2
   U9 ORDER STATUS SYSTEM
   FINAL VERSION
   ONLY: u9-order-status
   Part 1/2
================================================= */


(function(){





/* =================================================
   ELEMENTS
================================================= */


const auctionPage =
document.getElementById(
 "U9-page-auction"
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






/* =================================================
   API
================================================= */


const U9_ORDER_STATUS_API =
"https://tvtakmswbzawaweytimx.supabase.co/functions/v1/u9-order-status";








/* =================================================
   TIMER
================================================= */


let statusTimer =
null;










/* =================================================
   GLOBAL STATE
================================================= */


window.U9Auction =
window.U9Auction || {

 order:null,

 status:"READY"

};












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
   HIDE STATUS
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

 item=>{


  if(item){

   item.style.display =
   "none";

  }


 }


);



}













/* =================================================
   STATUS DISPLAY
================================================= */


function showReady(){


hideAllStatus();



if(
 orderStatusReady
){

 orderStatusReady.style.display =
 "block";

}



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









function showPending(){


hideAllStatus();



if(
 orderMatching
){

 orderMatching.style.display =
 "none";

}




if(
 orderStatusPending
){

 orderStatusPending.style.display =
 "block";

}



}









function showComplete(){


hideAllStatus();



if(
 orderMatching
){

 orderMatching.style.display =
 "none";

}




if(
 orderStatusComplete
){

 orderStatusComplete.style.display =
 "block";

}



}









function showCooldown(){


hideAllStatus();



if(
 orderStatusCooldown
){

 orderStatusCooldown.style.display =
 "block";

}



}












/* =================================================
   APPLY STATUS
================================================= */


function applyStatus(
 status
){



window.U9Auction.status =
status;




switch(
 status
){



case "MATCHING":


showMatching();


break;




case "PENDING":


showPending();


break;




case "COMPLETE":


showComplete();


break;




case "COOLDOWN":


showCooldown();


break;




default:


showReady();


break;



}



}









/* =================================================
   CHECK ORDER STATUS
================================================= */


async function checkOrderStatus(){



try{



const token =
localStorage.getItem(
 "u9_token"
);





if(
 !token
){

 return;

}







const response =
await fetch(

 U9_ORDER_STATUS_API,

 {

  method:"GET",

  cache:"no-store",

  headers:{

   "Authorization":
   `Bearer ${token}`

  }


 }

);








const data =
await response.json();









console.log(
 "ORDER STATUS RESULT:",
 data
);









if(
 !response.ok
){

 return;

}









if(
 data.order
){



window.U9Auction.order =
data.order;





if(
 data.round
){

 updateRound(
  data.round
 );

}







applyStatus(

 data.order.status

);





}



}
catch(error){



console.error(
 "checkOrderStatus:",
 error
);



}



}

/* =================================================
   AUCTION PAGE 2
   U9 ORDER STATUS SYSTEM
   FINAL VERSION
   Part 2/2
================================================= */



/* =================================================
   OPEN PAGE RECOVERY
================================================= */


function recoverOrderState(){


  checkOrderStatus();



}





/* =================================================
   PAGE VISIBILITY
================================================= */


document.addEventListener(

"visibilitychange",

function(){



if(
 document.visibilityState ===
 "visible"
){



 checkOrderStatus();



}



}

);







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



console.log(
 "U9 Auction Status User Ready",
 user
);



checkOrderStatus();



}





if(
 state ===
 "UNAUTHENTICATED"
){



stopPolling();



}



}



);



}



}









/* =================================================
   INIT
================================================= */


function initializeAuctionStatus(){



console.log(
 "U9 Auction Status System Ready"
);





/*
 页面刷新恢复
*/


recoverOrderState();






/*
 用户状态连接
*/


connectUserListener();






/*
 自动轮询
*/


startPolling();





}









/* =================================================
   PUBLIC API
================================================= */


window.U9AuctionStatus = {


 check:
 checkOrderStatus,


 start:
 startPolling,


 stop:
 stopPolling


};









/* =================================================
   START
================================================= */


initializeAuctionStatus();



})();
