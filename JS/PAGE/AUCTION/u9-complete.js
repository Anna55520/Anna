
(() => {
"use strict";

/* =========================================================
   U9 ORDER COMPLETE FRONTEND

   Responsible for:
   - Complete current pending order
   - Call u9-order-complete Edge Function
   - Update user coins
   - Update round progress
   - Update current order
   - Handle cooldown
   - Synchronize UI

   Backend:
   /functions/v1/u9-order-complete
========================================================= */


/* =========================================================
   API
========================================================= */

const U9_ORDER_COMPLETE_URL =
"https://tvtakmswbzawaweytimx.supabase.co/functions/v1/u9-order-complete";


/* =========================================================
   STATE
========================================================= */

const state = {

    busy: false,

    cooldownTimer: null,

};


/* =========================================================
   DOM
========================================================= */

const $ = (id) =>
document.querySelector(id);


const DOM = {

    completeButton:
        $("#U9-complete-button"),

    payButton:
        $("#U9-pay-button"),

    orderButton:
        $("#U9-order-button"),

    order:
        $("#U9-order"),

    orderStatus:
        $("#U9-order-status"),

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

    orderImage:
        $("#U9-order-image"),

    coins:
        $("#U9-coins"),

    roundProgress:
        $("#U9-round-progress"),

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
    element,
    value
){

    if(!element)
        return;

    element.textContent =
    value ?? "";

}


function show(element){

    if(!element)
        return;

    element.hidden =
    false;

    element.style.display =
    "";

}


function hide(element){

    if(!element)
        return;

    element.hidden =
    true;

}


function enable(element){

    if(!element)
        return;

    element.disabled =
    false;

}


function disable(element){

    if(!element)
        return;

    element.disabled =
    true;

}


function clearCooldown(){

    if(
        state.cooldownTimer
    ){

        clearInterval(
            state.cooldownTimer
        );

        state.cooldownTimer =
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

async function completeRequest(){

    const response =
    await fetch(
        U9_ORDER_COMPLETE_URL,
        {
            method:
            "POST",

            headers:
            getHeaders(),

            credentials:
            "include",
        }
    );


    let result;


    try{

        result =
        await response.json();

    }
    catch{

        result = {

            success:
            false,

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
   UPDATE USER
========================================================= */

function updateUser(user){

    if(!user)
        return;


    window.U9RoundUser =
    user;


    setText(
        DOM.coins,
        money(user.coins)
    );

}


/* =========================================================
   UPDATE ROUND
========================================================= */

function updateRound(round){

    if(!round){

        window.U9CurrentRound =
        null;

        setText(
            DOM.roundProgress,
            "0/0"
        );

        hide(
            DOM.cooldown
        );

        clearCooldown();

        return;

    }


    window.U9CurrentRound =
    round;


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
   UPDATE ORDER
========================================================= */

function updateOrder(order){

    window.U9CurrentOrder =
    order || null;


    if(!order){

        hide(
            DOM.order
        );


        hide(
            DOM.completeButton
        );


        hide(
            DOM.payButton
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
        order.product_price != null
            ? money(order.product_price)
            : ""
    );


    setText(
        DOM.orderProfit,
        order.profit != null
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


    if(
        DOM.orderImage
    ){

        if(
            order.image_url
        ){

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


    /*
      Completion succeeded.
    */

    if(
        order.status ===
        "COMPLETED"
    ){

        hide(
            DOM.completeButton
        );


        hide(
            DOM.payButton
        );


        enable(
            DOM.orderButton
        );


        setText(
            DOM.orderButton,
            "Start Order"
        );


        return;

    }


    /*
      Pending order with no remaining payment.
    */

    if(
        order.status ===
        "PENDING"
    ){

        const remaining =
        number(
            order.remaining_amount
        );


        if(
            remaining <= 0
        ){

            show(
                DOM.completeButton
            );


            enable(
                DOM.completeButton
            );


            setText(
                DOM.completeButton,
                "Complete Order"
            );

        }
        else{

            hide(
                DOM.completeButton
            );

        }

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


    const target =
    new Date(
        until
    ).getTime();


    if(
        !Number.isFinite(target)
    ){

        hide(
            DOM.cooldown
        );

        return;

    }


    show(
        DOM.cooldown
    );


    disable(
        DOM.orderButton
    );


    setText(
        DOM.orderButton,
        "Cooldown..."
    );


    function tick(){

        const seconds =
        Math.max(
            0,
            Math.ceil(
                (
                    target -
                    Date.now()
                )
                /
                1000
            )
        );


        setText(
            DOM.cooldownTime,
            formatTime(seconds)
        );


        if(
            seconds <= 0
        ){

            clearCooldown();


            hide(
                DOM.cooldown
            );


            /*
              Ask u9-order.js to reload
              the complete current state.
            */

            if(
                window.U9Order &&
                typeof window.U9Order.refresh ===
                "function"
            ){

                window.U9Order.refresh();

            }

        }

    }


    tick();


    state.cooldownTimer =
    setInterval(
        tick,
        1000
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
        Math.floor(
            Number(seconds)
        )
    );


    const minutes =
    Math.floor(
        seconds / 60
    );


    const remainingSeconds =
    seconds % 60;


    if(
        minutes <= 0
    ){

        return `${remainingSeconds}s`;

    }


    return `${minutes}m ${remainingSeconds}s`;

}


/* =========================================================
   COMPLETE ORDER
========================================================= */

async function completeOrder(){

    if(
        state.busy
    ){

        return;

    }


    const order =
    window.U9CurrentOrder;


    /*
      Frontend validation only.
      Backend remains the final authority.
    */

    if(!order){

        return;

    }


    if(
        order.status !==
        "PENDING"
    ){

        return;

    }


    const remaining =
    number(
        order.remaining_amount
    );


    if(
        remaining > 0
    ){

        handleError(
            new Error(
                "ORDER_PAYMENT_REQUIRED"
            )
        );

        return;

    }


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
        await completeRequest();


        /*
          Server response is authoritative.
        */

        if(
            result.user
        ){

            updateUser(
                result.user
            );

        }


        if(
            result.round
        ){

            updateRound(
                result.round
            );

        }


        if(
            result.order
        ){

            updateOrder(
                result.order
            );

        }


        /*
          Keep the main order controller
          synchronized with the backend.

          This is especially important after:
          - Round completion
          - COOLDOWN
          - New round creation
        */

        if(
            window.U9Order &&
            typeof window.U9Order.refresh ===
            "function"
        ){

            await window.U9Order.refresh();

        }

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
        "[U9 COMPLETE]",
        code,
        error
    );


    switch(code){

        case "UNAUTHORIZED":

            disable(
                DOM.completeButton
            );


            setText(
                DOM.completeButton,
                "Login Required"
            );

            break;


        case "ORDER_NOT_FOUND":

            hide(
                DOM.completeButton
            );


            refreshOrderState();

            break;


        case "ORDER_NOT_PENDING":

            hide(
                DOM.completeButton
            );


            refreshOrderState();

            break;


        case "ORDER_PAYMENT_REQUIRED":

        case "PAYMENT_REQUIRED":

            hide(
                DOM.completeButton
            );


            show(
                DOM.payButton
            );


            break;


        case "ALREADY_COMPLETED":

            hide(
                DOM.completeButton
            );


            refreshOrderState();

            break;


        case "ROUND_COOLDOWN":

            hide(
                DOM.completeButton
            );


            startCooldown(
                error?.result?.round?.cooldown_until
            );


            refreshOrderState();

            break;


        default:

            enable(
                DOM.completeButton
            );


            setText(
                DOM.completeButton,
                "Complete Order"
            );

            break;

    }

}


/* =========================================================
   REFRESH ORDER STATE
========================================================= */

async function refreshOrderState(){

    if(
        window.U9Order &&
        typeof window.U9Order.refresh ===
        "function"
    ){

        try{

            await window.U9Order.refresh();

        }
        catch(error){

            console.error(
                "[U9 COMPLETE REFRESH]",
                error
            );

        }

    }

}


/* =========================================================
   BUTTON SYNC
========================================================= */

function syncButton(){

    const button =
    DOM.completeButton;


    if(!button)
        return;


    const order =
    window.U9CurrentOrder;


    if(!order){

        hide(
            button
        );

        return;

    }


    if(
        order.status !==
        "PENDING"
    ){

        hide(
            button
        );

        return;

    }


    const remaining =
    number(
        order.remaining_amount
    );


    if(
        remaining > 0
    ){

        hide(
            button
        );

        return;

    }


    show(
        button
    );


    enable(
        button
    );


    setText(
        button,
        "Complete Order"
    );

}


/* =========================================================
   EVENT
========================================================= */

function bindEvents(){

    if(
        !DOM.completeButton
    ){

        console.warn(
            "[U9 COMPLETE] #U9-complete-button not found."
        );

        return;

    }


    DOM.completeButton.addEventListener(
        "click",
        function(event){

            event.preventDefault();


            completeOrder();

        }
    );

}


/* =========================================================
   PUBLIC API
========================================================= */

window.U9Complete = {

    complete:
    completeOrder,

    refresh:
    syncButton,

    getState:
    function(){

        return {
            ...state
        };

    }

};


/* =========================================================
   WATCH U9 ORDER STATE
========================================================= */

let lastOrderId =
null;

let lastOrderStatus =
null;

let lastRemaining =
null;


function watchOrderState(){

    const order =
    window.U9CurrentOrder;


    const orderId =
    order?.id ||
    null;


    const status =
    order?.status ||
    null;


    const remaining =
    order?.remaining_amount ??
    null;


    if(
        orderId !==
        lastOrderId ||

        status !==
        lastOrderStatus ||

        remaining !==
        lastRemaining
    ){

        lastOrderId =
        orderId;

        lastOrderStatus =
        status;

        lastRemaining =
        remaining;


        syncButton();

    }

}


/* =========================================================
   INIT
========================================================= */

function init(){

    bindEvents();

    syncButton();

}


if(
    document.readyState ===
    "loading"
){

    document.addEventListener(
        "DOMContentLoaded",
        init,
        {
            once:
            true
        }
    );

}
else{

    init();

}


/*
  Watch the state written by
  JS/PAGE/AUCTION/u9-order.js.
*/

setInterval(
    watchOrderState,
    300
);


})();
