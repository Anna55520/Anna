(() => {
"use strict";

/* =========================================================
   U9 ORDER FRONTEND
   Compatible with:
   u9-order Edge Function
========================================================= */


/* =========================================================
   API
========================================================= */

const U9_ORDER_URL =
"https://tvtakmswbzawaweytimx.supabase.co/functions/v1/u9-order";


/* =========================================================
   STATE
========================================================= */

const state = {

    user: null,

    settings: null,

    round: null,

    order: null,

    busy: false,

    matchingTimer: null,

    cooldownTimer: null,

};


/* =========================================================
   DOM
========================================================= */

const $ = (id) =>
document.querySelector(id);



const DOM = {

    orderButton:
        $("#U9-order-button"),


    coins:
        $("#U9-coins"),


    roundProgress:
        $("#U9-round-progress"),



    matching:
        $("#U9-matching"),

    matchingTime:
        $("#U9-matching-time"),



    order:
        $("#U9-order"),


    orderImage:
        $("#U9-order-image"),


    orderName:
        $("#U9-order-name"),


    orderPrice:
        $("#U9-order-price"),


    orderProfit:
        $("#U9-order-profit"),


    orderPaid:
        $("#U9-order-paid"),


    orderRemaining:
        $("#U9-order-remaining"),


    orderStatus:
        $("#U9-order-status"),



    payButton:
        $("#U9-pay-button"),


    completeButton:
        $("#U9-complete-button"),



    cooldown:
        $("#U9-cooldown"),


    cooldownTime:
        $("#U9-cooldown-time"),

};



/* =========================================================
   HELPERS
========================================================= */


function number(value){

    const n =
    Number(value);


    return Number.isFinite(n)
        ? n
        : 0;

}



function money(value){

    return number(value)
        .toFixed(2);

}



function setText(
    el,
    value
){

    if(!el)
        return;


    el.textContent =
    value ?? "";

}



function show(el){

    if(!el)
        return;


    el.hidden = false;

    el.style.display = "";

}



function hide(el){

    if(!el)
        return;


    el.hidden = true;

}



function enable(el){

    if(!el)
        return;


    el.disabled = false;

}



function disable(el){

    if(!el)
        return;


    el.disabled = true;

}



function clearTimer(timerName){

    if(state[timerName]){

        clearInterval(
            state[timerName]
        );

        state[timerName] =
        null;
    }

}


/* =========================================================
   AUTH
========================================================= */


function getHeaders(){

    const headers = {

        "Content-Type":
        "application/json",

    };


    const token =
        window.U9AccessToken ||
        window.accessToken ||
        window.authToken ||
        "";


    if(token){

        headers.Authorization =
        `Bearer ${token}`;

    }


    return headers;

}



/* =========================================================
   API REQUEST
========================================================= */


async function api(
    method="GET",
    body=null
){


    const options = {

        method,

        headers:
        getHeaders(),

        credentials:
        "include",

    };


    if(
        method !== "GET" &&
        body
    ){

        options.body =
        JSON.stringify(body);

    }



    const response =
    await fetch(
        U9_ORDER_URL,
        options
    );



    let result;


    try{

        result =
        await response.json();

    }
    catch{

        result = {

            success:false,

            error:
            "INVALID_RESPONSE",

        };

    }



    if(
        !response.ok ||
        result.success === false
    ){

        const error =
        new Error(
            result.error ||
            `HTTP_${response.status}`
        );


        error.result =
        result;


        throw error;

    }



    return result;

}




/* =========================================================
   TIMER CLEAN
========================================================= */


function clearMatching(){

    clearTimer(
        "matchingTimer"
    );

}



function clearCooldown(){

    clearTimer(
        "cooldownTimer"
    );

}



/* =========================================================
   USER STATE
========================================================= */


function updateUser(user){

    if(!user)
        return;


    state.user =
    user;


    setText(
        DOM.coins,
        money(user.coins)
    );


    window.U9RoundUser =
    user;

}



/* =========================================================
   ROUND STATE
========================================================= */


function updateRound(round){

    state.round =
    round || null;


    window.U9CurrentRound =
    state.round;



    if(!round){

        setText(
            DOM.roundProgress,
            "0/0"
        );

        return;

    }



    const completed =
    number(
        round.completed_orders
    );


    const target =
    number(
        round.target_orders
    );



    setText(
        DOM.roundProgress,
        `${completed}/${target}`
    );



    if(
        round.status ===
        "COOLDOWN"
    ){

        startCooldown(
            round.cooldown_until
        );

    }
    else{

        clearCooldown();

        hide(
            DOM.cooldown
        );

    }

}


/* =========================================================
   ORDER STATE
========================================================= */


function updateOrder(order){

    state.order =
    order || null;


    window.U9CurrentOrder =
    state.order;



    if(!order){

        hide(DOM.order);

        hide(DOM.matching);


        clearMatching();


        enable(
            DOM.orderButton
        );


        setText(
            DOM.orderButton,
            "Start Order"
        );


        return;

    }



    show(
        DOM.order
    );



    setText(
        DOM.orderStatus,
        order.status
    );


    setText(
        DOM.orderName,
        order.product_name || ""
    );


    setText(
        DOM.orderPrice,
        order.product_price
        ? money(order.product_price)
        : ""
    );


    setText(
        DOM.orderProfit,
        order.profit
        ? money(order.profit)
        : ""
    );


    setText(
        DOM.orderPaid,
        money(order.paid_amount)
    );


    setText(
        DOM.orderRemaining,
        money(order.remaining_amount)
    );



    if(DOM.orderImage){

        if(order.image_url){

            DOM.orderImage.src =
            order.image_url;


            show(
                DOM.orderImage
            );

        }
        else{

            hide(
                DOM.orderImage
            );

        }

    }


/* PART 2 CONTINUES */
    /* =====================================================
       MATCHING STATE
    ===================================================== */


    if(
        order.status === "MATCHING"
    ){

        show(
            DOM.matching
        );


        disable(
            DOM.orderButton
        );


        setText(
            DOM.orderButton,
            "Matching..."
        );


        hide(
            DOM.payButton
        );


        hide(
            DOM.completeButton
        );


        startMatching(
            order.matching_ready_at
        );


        return;

    }




    clearMatching();


    hide(
        DOM.matching
    );




    /* =====================================================
       PENDING
    ===================================================== */


    if(
        order.status === "PENDING"
    ){

        disable(
            DOM.orderButton
        );


        setText(
            DOM.orderButton,
            "Order Pending"
        );



        const remaining =
        number(
            order.remaining_amount
        );



        if(
            remaining > 0
        ){

            show(
                DOM.payButton
            );


            disable(
                DOM.completeButton
            );

        }
        else{

            hide(
                DOM.payButton
            );


            show(
                DOM.completeButton
            );


            enable(
                DOM.completeButton
            );

        }


        return;

    }





    /* =====================================================
       COMPLETED
    ===================================================== */


    if(
        order.status === "COMPLETED"
    ){

        hide(
            DOM.payButton
        );


        hide(
            DOM.completeButton
        );


        enable(
            DOM.orderButton
        );


        setText(
            DOM.orderButton,
            "Start Order"
        );

    }


}



/* =========================================================
   MATCHING COUNTDOWN
========================================================= */


function startMatching(
    readyAt
){

    clearMatching();


    if(!readyAt)
        return;



    const target =
    new Date(
        readyAt
    ).getTime();



    async function tick(){


        const seconds =
        Math.max(
            0,
            Math.ceil(
                (target - Date.now())
                /
                1000
            )
        );



        setText(
            DOM.matchingTime,
            seconds
        );



        if(seconds <= 0){

            clearMatching();


            await requestMatch();

        }

    }



    tick();


    state.matchingTimer =
    setInterval(
        tick,
        1000
    );

}



/* =========================================================
   MATCH REQUEST
========================================================= */


async function requestMatch(){

    if(state.busy)
        return;


    state.busy =
    true;



    try{


        const result =
        await api(
            "POST",
            {
                action:
                "match"
            }
        );



        updateUser(
            result.user
        );


        updateRound(
            result.round
        );


        updateOrder(
            result.order
        );



    }
    catch(error){


        console.error(
            "[U9 MATCH]",
            error
        );


        /*
          Server time is final.
          Reload state.
        */


        await loadStatus();


    }
    finally{


        state.busy =
        false;

    }

}




/* =========================================================
   LOAD CURRENT STATUS
========================================================= */


async function loadStatus(){

    try{


        const result =
        await api(
            "GET"
        );



        updateUser(
            result.user
        );


        updateRound(
            result.round
        );


        updateOrder(
            result.order
        );



        state.settings =
        result.settings;



        window.U9RoundSettings =
        result.settings;



        return result;


    }
    catch(error){


        handleError(
            error
        );


        return null;

    }

}





/* =========================================================
   START ORDER
========================================================= */


async function startOrder(){

    if(state.busy)
        return;



    state.busy =
    true;



    disable(
        DOM.orderButton
    );


    setText(
        DOM.orderButton,
        "Starting..."
    );



    try{


        const result =
        await api(
            "POST",
            {
                action:
                "start"
            }
        );



        updateUser(
            result.user
        );


        updateRound(
            result.round
        );


        updateOrder(
            result.order
        );



    }
    catch(error){


        handleError(
            error
        );



    }
    finally{


        state.busy =
        false;


    }

}



/* =========================================================
   PAY REMAINING
========================================================= */


async function payRemaining(){

    if(state.busy)
        return;


    state.busy =
    true;



    disable(
        DOM.payButton
    );


    setText(
        DOM.payButton,
        "Processing..."
    );



    try{


        const result =
        await api(
            "POST",
            {
                action:
                "pay"
            }
        );



        updateUser(
            result.user
        );


        updateRound(
            result.round
        );


        updateOrder(
            result.order
        );


    }
    catch(error){


        handleError(
            error
        );


    }
    finally{


        state.busy =
        false;


    }

}




/* =========================================================
   COOLDOWN
========================================================= */


function startCooldown(
    until
){

    clearCooldown();



    if(!until){

        hide(
            DOM.cooldown
        );

        return;

    }



    show(
        DOM.cooldown
    );



    const target =
    new Date(
        until
    ).getTime();




    function tick(){


        const seconds =
        Math.max(
            0,
            Math.ceil(
                (target - Date.now())
                /
                1000
            )
        );



        setText(
            DOM.cooldownTime,
            formatTime(seconds)
        );



        if(seconds <= 0){


            clearCooldown();


            hide(
                DOM.cooldown
            );


            loadStatus();

        }

    }



    tick();



    state.cooldownTimer =
    setInterval(
        tick,
        1000
    );



    disable(
        DOM.orderButton
    );


    setText(
        DOM.orderButton,
        "Cooldown..."
    );

}




/* =========================================================
   TIME FORMAT
========================================================= */


function formatTime(
    seconds
){

    seconds =
    Math.max(
        0,
        Number(seconds)
    );


    const min =
    Math.floor(
        seconds / 60
    );


    const sec =
    seconds % 60;



    if(min <= 0)
        return `${sec}s`;


    return `${min}m ${sec}s`;

}



/* PART 3 CONTINUES */

 
/* =========================================================
   COMPLETE ORDER
========================================================= */


async function completeOrder(){

    if(state.busy)
        return;


    state.busy =
    true;



    disable(
        DOM.completeButton
    );


    setText(
        DOM.completeButton,
        "Completing..."
    );



    try{


        const result =
        await api(
            "POST",
            {
                action:
                "complete"
            }
        );



        updateUser(
            result.user
        );


        updateRound(
            result.round
        );


        updateOrder(
            result.order
        );



        /*
          Do not immediately GET again.
          Server response is already latest.
        */


    }
    catch(error){


        handleError(
            error
        );


    }
    finally{


        state.busy =
        false;


    }

}





/* =========================================================
   ERROR HANDLER
========================================================= */


function handleError(error){

    const code =
    error?.message ||
    "UNKNOWN_ERROR";



    console.error(
        "[U9 ERROR]",
        code,
        error
    );



    switch(code){


        case "UNAUTHORIZED":


            disable(
                DOM.orderButton
            );


            setText(
                DOM.orderButton,
                "Login Required"
            );

            break;




        case "INSUFFICIENT_START_COINS":


            enable(
                DOM.orderButton
            );


            setText(
                DOM.orderButton,
                "Insufficient Coins"
            );


            break;




        case "ORDER_ALREADY_ACTIVE":


            disable(
                DOM.orderButton
            );


            setText(
                DOM.orderButton,
                "Order Active"
            );


            loadStatus();


            break;




        case "ROUND_COOLDOWN":


            disable(
                DOM.orderButton
            );


            setText(
                DOM.orderButton,
                "Cooldown..."
            );


            loadStatus();


            break;




        case "INSUFFICIENT_COINS":


            enable(
                DOM.payButton
            );


            setText(
                DOM.payButton,
                "Insufficient Coins"
            );


            break;




        case "ORDER_PAYMENT_REQUIRED":


            show(
                DOM.payButton
            );


            disable(
                DOM.completeButton
            );


            break;




        case "NO_PRODUCTS":


            setText(
                DOM.orderStatus,
                "No Product"
            );


            break;




        case "U9_DISABLED":


            disable(
                DOM.orderButton
            );


            setText(
                DOM.orderButton,
                "Unavailable"
            );


            break;




        default:


            if(
                !state.order
            ){

                enable(
                    DOM.orderButton
                );


                setText(
                    DOM.orderButton,
                    "Start Order"
                );

            }


            break;


    }

}





/* =========================================================
   EVENTS
========================================================= */


function bindEvents(){



    if(DOM.orderButton){


        DOM.orderButton.addEventListener(
            "click",
            function(e){


                e.preventDefault();


                startOrder();


            }
        );


    }




    if(DOM.payButton){


        DOM.payButton.addEventListener(
            "click",
            function(e){


                e.preventDefault();


                payRemaining();


            }
        );


    }




    if(DOM.completeButton){


        DOM.completeButton.addEventListener(
            "click",
            function(e){


                e.preventDefault();


                completeOrder();


            }
        );


    }


}






/* =========================================================
   PUBLIC API
========================================================= */


window.U9Order = {


    start:
    startOrder,


    match:
    requestMatch,


    pay:
    payRemaining,


    complete:
    completeOrder,


    refresh:
    loadStatus,


    getState:
    function(){

        return {
            ...state
        };

    }


};







/* =========================================================
   INIT
========================================================= */


async function init(){


    bindEvents();


    await loadStatus();


}





if(
    document.readyState ===
    "loading"
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




})();
