/* =========================================================
   U9 ORDER START
   JS/PAGE/AUCTION/u9-order-start.js

   Responsibility:

   - Load current U9 round status
   - Bind Order button
   - Start new U9 order
   - Call u9-order-start Edge Function
   - Display matching countdown

   Does NOT:
   - Select product
   - Deduct coins
   - Complete order
========================================================= */


(() => {

"use strict";


/* =========================================================
   API
========================================================= */


const U9_ORDER_START_URL =
"https://tvtakmswbzawaweytimx.supabase.co/functions/v1/u9-order-start";


const U9_ROUND_STATUS_URL =
"https://tvtakmswbzawaweytimx.supabase.co/functions/v1/u9-round-status";



/* =========================================================
   STATE
========================================================= */


let isStartingOrder =
false;


let matchingTimer =
null;



/* =========================================================
   DOM
========================================================= */


let orderButton =
null;


let roundProgress =
null;


let coinsElement =
null;



/* =========================================================
   INIT
========================================================= */


function init(){


orderButton =
document.getElementById(
"U9-order-button"
);


roundProgress =
document.getElementById(
"U9-round-progress"
);


coinsElement =
document.getElementById(
"U9-coins"
);



if(!orderButton){

console.warn(
"[U9] Order button missing"
);

return;

}



/*
 Bind once
*/

if(
orderButton.dataset.u9Bound==="true"
){

return;

}


orderButton.dataset.u9Bound="true";



orderButton.addEventListener(
"click",
handleOrderClick
);



/*
 Load existing state

 Important:
 This fixes:

 Round 0/0

 after refresh.

*/


loadRoundStatus();



console.log(
"[U9] Order Start Ready"
);


}





/* =========================================================
   TOKEN
========================================================= */


function getToken(){


return localStorage.getItem(
"u9_token"
);


}






/* =========================================================
   LOAD CURRENT ROUND
========================================================= */


async function loadRoundStatus(){


const token =
getToken();



if(!token){

return;

}



try{


const response =
await fetch(
U9_ROUND_STATUS_URL,
{

method:"GET",

headers:{

"Authorization":
`Bearer ${token}`,

"Content-Type":
"application/json"

},

credentials:
"include",

cache:
"no-store"

}

);



const result =
await response.json();



console.log(
"[U9] Round Status:",
result
);



if(
!response.ok ||
!result.success
){

return;

}



/*
 Update coins
*/


if(
coinsElement &&
result.user
){

coinsElement.textContent =
formatNumber(
result.user.coins
);

}



/*
 Update round
*/


if(
roundProgress &&
result.round
){

roundProgress.textContent =
`${result.round.completed_orders}/${result.round.target_orders}`;

}



/*
 Save global state
*/


window.U9RoundUser =
result.user;


window.U9CurrentRound =
result.round;



/*
 Existing MATCHING restore

 when browser refreshes

*/


if(
result.order &&
result.order.status==="MATCHING"
){

restoreMatching(
result.order
);

}



}
catch(error){


console.error(
"[U9] Round status error:",
error
);


}



}






/* =========================================================
   FIND ACTIVE ORDER

   Used after refresh
========================================================= */


/* =========================================================
   FIND ACTIVE ORDER

   Used after refresh

   IMPORTANT:
   DO NOT call u9-order-start here.

   u9-order-start = CREATE ORDER

   u9-round-status = QUERY STATUS

========================================================= */


async function findActiveOrder(){


const token =
getToken();



if(!token){

return null;

}



try{


const response =
await fetch(

U9_ROUND_STATUS_URL,

{

method:"GET",

headers:{

"Authorization":
`Bearer ${token}`,

"Content-Type":
"application/json"

},

credentials:
"include",

cache:
"no-store"

}

);



const result =
await response.json();



console.log(
"[U9] Active Order Check:",
result
);



if(

result.success &&

result.order

){

return result.order;

}



return null;



}
catch(error){


console.error(

"[U9] Find active order error:",

error

);


return null;


}


}

/* =========================================================
   ORDER CLICK
========================================================= */


async function handleOrderClick(){


if(isStartingOrder){

return;

}



const token =
getToken();



if(!token){

showError(
"Please login first."
);

return;

}



isStartingOrder =
true;



setButtonLoading(
true
);



try{


const response =
await fetch(
U9_ORDER_START_URL,
{

method:"POST",

headers:{

"Authorization":
`Bearer ${token}`,

"Content-Type":
"application/json"

},

credentials:
"include"

}

);



const result =
await response.json();



console.log(
"[U9] Start response:",
result
);



if(
!response.ok ||
!result.success
){

handleServerError(
result
);

return;

}



handleOrderStarted(
result
);



}
catch(error){


console.error(
"[U9] Start failed:",
error
);


showError(
"Unable to start order."
);



}
finally{


isStartingOrder =
false;



if(
!orderButton.dataset.u9Matching
){

setButtonLoading(
false
);

}


}


}






/* =========================================================
   ORDER STARTED
========================================================= */


function handleOrderStarted(
result
){


const order =
result.order || {};

const round =
result.round || {};

const user =
result.user || {};



if(
coinsElement &&
user.coins !== undefined
){

coinsElement.textContent =
formatNumber(
user.coins
);

}



if(
roundProgress
){

roundProgress.textContent =
`${round.completed_orders}/${round.target_orders}`;

}



window.U9CurrentOrder =
order;


window.U9CurrentRound =
round;



if(
order.status==="MATCHING"
){


orderButton.dataset.u9Matching =
"true";


orderButton.disabled =
true;



startMatchingCountdown(
order.matching_ready_at
);



return;

}



}




/* =========================================================
   RESTORE MATCHING
========================================================= */


function restoreMatching(
order
){


if(!order){

return;

}


console.log(
"[U9] Restore Matching:",
order
);



window.U9CurrentOrder =
order;



orderButton.dataset.u9Matching =
"true";


orderButton.disabled =
true;


startMatchingCountdown(
order.matching_ready_at
);


}





/* =========================================================
   COUNTDOWN
========================================================= */


function startMatchingCountdown(
matchingReadyAt
){


stopMatchingCountdown();



if(!matchingReadyAt){

orderButton.textContent =
"Matching...";

return;

}


/*
 Fix Supabase timestamp

 2026-10-06 19:41:24.624+00

 convert to ISO

*/

let timeString =
matchingReadyAt;


if(
timeString.includes(" ") &&
!timeString.includes("T")
){

timeString =
timeString.replace(
" ",
"T"
);

}



const ready =
new Date(
timeString
).getTime();



if(
Number.isNaN(ready)
){

console.error(
"[U9] Invalid matching time:",
matchingReadyAt
);


orderButton.textContent =
"Matching...";


return;

}



function update(){


const remain =
Math.ceil(
(
ready -
Date.now()
)
/1000
);



if(remain > 0){


orderButton.textContent =
`Matching... ${remain}s`;


return;

}



stopMatchingCountdown();


orderButton.textContent =
"Matching...";


orderButton.disabled =
true;


}



update();


matchingTimer =
setInterval(
update,
250
);


}




function stopMatchingCountdown(){


if(
matchingTimer
){

clearInterval(
matchingTimer
);


matchingTimer =
null;

}


}






/* =========================================================
   SERVER ERROR
========================================================= */


function handleServerError(
result
){


if(!result){

showError(
"Server error."
);

return;

}



switch(
result.error
){


case "UNAUTHORIZED":


localStorage.removeItem(
"u9_token"
);


showError(
"Please login again."
);


break;




case "INSUFFICIENT_COINS":


showError(
`Need ${formatNumber(
result.required_coins
)} coins.`
);


break;




case "ORDER_ALREADY_ACTIVE":


if(
result.order
){


window.U9CurrentOrder =
result.order;



if(
result.order.status==="MATCHING"
){


restoreMatching(
result.order
);


}

}



break;




case "ROUND_COOLDOWN":


showError(
`Cooldown ${result.remaining_seconds}s`
);


break;




default:


showError(
result.message ||
"Unable to start order."
);


break;


}



}






/* =========================================================
   BUTTON
========================================================= */


function setButtonLoading(
loading
){


if(!orderButton){

return;

}



if(loading){


orderButton.disabled =
true;


orderButton.textContent =
"Starting...";


return;

}



if(
orderButton.dataset.u9Matching
){

return;

}



orderButton.disabled =
false;


orderButton.textContent =
"Order";


}






/* =========================================================
   ERROR
========================================================= */


function showError(
message
){


console.error(
"[U9]",
message
);



if(
typeof alert==="function"
){

alert(
message
);

}


}






/* =========================================================
   FORMAT
========================================================= */


function formatNumber(
value
){


const num =
Number(value);



if(
!Number.isFinite(num)
){

return "0.00";

}



return num.toLocaleString(
"en-US",
{

minimumFractionDigits:
2,

maximumFractionDigits:
2

}

);


}






/* =========================================================
   READY
========================================================= */


if(
document.readyState==="loading"
){


document.addEventListener(
"DOMContentLoaded",
init,
{
once:true
}
);


}
else{


init();


}






/* =========================================================
   PUBLIC API
========================================================= */


window.U9OrderStart =
{

start:
handleOrderClick,


stopMatchingCountdown

};



})();
