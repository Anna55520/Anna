/* =========================================================
   U9 ORDER
   JS/PAGE/AUCTION/u9-order.js

   Single Frontend Controller

   Handles:

   - Load U9 status
   - Start order
   - Display product
   - Display coins
   - Display round
   - Matching countdown

========================================================= */


(() => {

"use strict";



/* =========================================================
   API
========================================================= */


const U9_ORDER_API =
"https://tvtakmswbzawaweytimx.supabase.co/functions/v1/u9-order";



/* =========================================================
   STATE
========================================================= */


let matchingTimer = null;

let loading = false;



/* =========================================================
   DOM
========================================================= */


let orderButton;

let coinsElement;

let roundElement;

let productElement;

let matchingElement;



/* =========================================================
   INIT
========================================================= */


function init(){


orderButton =
document.getElementById(
"U9-order-button"
);


coinsElement =
document.getElementById(
"U9-coins"
);


roundElement =
document.getElementById(
"U9-round-progress"
);


productElement =
document.getElementById(
"U9-product"
);


matchingElement =
document.getElementById(
"U9-matching"
);



if(!orderButton){

console.warn(
"[U9] Button missing"
);

return;

}



orderButton.addEventListener(
"click",
startOrder
);



loadOrder();



console.log(
"[U9] Order JS Ready"
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
   LOAD STATUS

   GET

========================================================= */


async function loadOrder(){


const token =
getToken();



if(!token){

return;

}



try{


const response =
await fetch(
U9_ORDER_API,
{

method:"GET",

headers:{

Authorization:
`Bearer ${token}`

},

credentials:
"include"

}

);



const data =
await response.json();



console.log(
"[U9] Load:",
data
);



if(
data.success
){

render(data);

}


}
catch(error){


console.error(
"[U9] Load error",
error
);


}



}






/* =========================================================
   START ORDER

   POST

========================================================= */


async function startOrder(){


if(loading){

return;

}



const token =
getToken();



if(!token){

alert(
"Please login"
);

return;

}



loading=true;


orderButton.disabled=true;


orderButton.textContent=
"Starting...";



try{


const response =
await fetch(
U9_ORDER_API,
{

method:"POST",

headers:{

"Content-Type":
"application/json",

Authorization:
`Bearer ${token}`

},

credentials:
"include"

}

);



const data =
await response.json();



console.log(
"[U9] Order:",
data
);



if(!data.success){


handleError(
data
);


return;

}



render(data);



}
catch(error){


console.error(
error
);


alert(
"Order failed"
);


}
finally{


loading=false;


if(
!orderButton.dataset.matching
){

orderButton.disabled=false;

orderButton.textContent=
"Order";

}


}


}






/* =========================================================
   RENDER
========================================================= */


function render(data){



/* USER */

if(
coinsElement &&
data.user
){

coinsElement.textContent =
format(
data.user.coins
);

}




/* ROUND */

if(
roundElement &&
data.round
){

roundElement.textContent =
`${data.round.completed_orders}/${data.round.target_orders}`;

}




/* ORDER */

const order =
data.order;



if(!order){

return;

}



window.U9CurrentOrder =
order;



if(
productElement
){

productElement.innerHTML =

`

<div>
Product:
${order.product_name || "Matching..."}
</div>


<div>
Price:
${format(order.product_price)}
</div>


<div>
Profit:
${format(order.profit)}
</div>

`;

}





if(
order.status==="MATCHING"
){


orderButton.dataset.matching =
"true";


orderButton.disabled =
true;



startCountdown(
order.matching_ready_at
);



}


}






/* =========================================================
   COUNTDOWN
========================================================= */


function startCountdown(
time
){


stopCountdown();



if(!time){

return;

}



let target =
new Date(time)
.getTime();



function update(){


let seconds =
Math.ceil(
(
target -
Date.now()
)
/1000
);



if(seconds>0){


if(
matchingElement
){

matchingElement.textContent =
`Matching ${seconds}s`;

}


orderButton.textContent =
`Matching ${seconds}s`;



return;

}



stopCountdown();



if(
matchingElement
){

matchingElement.textContent =
"Matched";

}



orderButton.textContent =
"Matched";


}



update();



matchingTimer =
setInterval(
update,
500
);



}






function stopCountdown(){


if(matchingTimer){

clearInterval(
matchingTimer
);


matchingTimer=null;

}


}






/* =========================================================
   ERROR
========================================================= */


function handleError(
data
){


switch(
data.error
){


case "INSUFFICIENT_COINS":

alert(
"Not enough coins"
);

break;



case "INVALID_SESSION":

alert(
"Login expired"
);

break;



case "NO_PRODUCTS":

alert(
"No products"
);

break;



default:

alert(
data.error ||
"Error"
);


}



}






/* =========================================================
   FORMAT
========================================================= */


function format(value){


let n =
Number(value);



if(
!Number.isFinite(n)
){

return "0.00";

}



return n.toFixed(2);

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




window.U9Order = {

start:
startOrder,

reload:
loadOrder

};



})();
