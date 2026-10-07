
(() => {
"use strict";

/*
=========================================================
 U9 ORDER FRONTEND

 API:
 GET  /u9-order
 POST {action:"start"}
 POST {action:"match"}
 POST {action:"pay"}

 Backend:
 u9-order Edge Function

 Completion:
 u9-complete.js

 Safari Fix:
 1. Read localStorage.u9_token
 2. Wait for token before first API request
=========================================================
*/


/* ========================================================
   API
======================================================== */

const U9_ORDER_URL =
"https://tvtakmswbzawaweytimx.supabase.co/functions/v1/u9-order";



/* ========================================================
   STATE
======================================================== */

const state = {

    user:null,

    settings:null,

    round:null,

    order:null,

    busy:false,

    matchingTimer:null,

    cooldownTimer:null

};



/* ========================================================
   DOM
======================================================== */

const $ = id =>
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

    cooldown:
    $("#U9-cooldown"),

    cooldownTime:
    $("#U9-cooldown-time")

};



/* ========================================================
   HELPERS
======================================================== */

function num(v){

    const n =
    Number(v);

    return Number.isFinite(n)
    ? n
    : 0;

}



function money(v){

    return num(v)
    .toFixed(2);

}



function text(el,value){

    if(!el)
    return;

    el.textContent =
    value ?? "";

}



function show(el){

    if(!el)
    return;

    el.hidden=false;
    el.style.display="";

}



function hide(el){

    if(!el)
    return;

    el.hidden=true;

}



function enable(el){

    if(el)
    el.disabled=false;

}



function disable(el){

    if(el)
    el.disabled=true;

}



function clearTimer(name){

    if(state[name]){

        clearInterval(
            state[name]
        );

        state[name]=null;

    }

}



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



/* ========================================================
   AUTH HEADER
======================================================== */

function getAuthToken(){

    /*
    --------------------------------------------------------
    U9 primary session token

    The U9 login system stores the session token in:

    localStorage:
    u9_token
    --------------------------------------------------------
    */

    let token = "";



    try{

        token =
        localStorage.getItem(
            "u9_token"
        ) ||
        "";

    }
    catch(error){

        console.warn(
            "[U9 AUTH] Unable to read localStorage",
            error
        );

    }



    /*
    --------------------------------------------------------
    Fallbacks
    --------------------------------------------------------
    */

    if(!token){

        token =
        window.U9AccessToken ||
        window.accessToken ||
        window.authToken ||
        "";

    }



    return token.trim();

}



function headers(){

    const h = {

        "Content-Type":
        "application/json"

    };



    const token =
    getAuthToken();



    if(token){

        h.Authorization =
        `Bearer ${token}`;

    }



    return h;

}



/* ========================================================
   WAIT FOR AUTH TOKEN
======================================================== */

async function waitForAuthToken(
    timeout = 5000
){

    /*
    --------------------------------------------------------
    If token already exists, continue immediately.
    --------------------------------------------------------
    */

    const existingToken =
    getAuthToken();



    if(existingToken){

        return existingToken;

    }



    /*
    --------------------------------------------------------
    Safari / page restore protection

    Header.js may still be restoring the session when
    Auction initializes.

    Check several times before giving up.
    --------------------------------------------------------
    */

    const start =
    Date.now();



    while(
        Date.now() - start <
        timeout
    ){

        await new Promise(
            resolve =>
            setTimeout(
                resolve,
                100
            )
        );



        const token =
        getAuthToken();



        if(token){

            return token;

        }

    }



    return null;

}



/* ========================================================
   API
======================================================== */

async function api(
    method="GET",
    body=null
){

    const options={

        method,

        headers:
        headers(),

        credentials:
        "include"

    };



    if(
        method!=="GET" &&
        body
    ){

        options.body =
        JSON.stringify(body);

    }



    const res =
    await fetch(
        U9_ORDER_URL,
        options
    );



    let data;



    try{

        data =
        await res.json();

    }
    catch{

        data={
            success:false,
            error:"INVALID_RESPONSE"
        };

    }



    if(
        !res.ok ||
        data.success===false
    ){

        const e =
        new Error(
            data.error ||
            `HTTP_${res.status}`
        );


        e.data=data;

        throw e;

    }



    return data;

}



/* ========================================================
   USER UPDATE
======================================================== */

function updateUser(user){

    if(!user)
    return;



    state.user =
    user;



    text(
        DOM.coins,
        money(
            user.coins
        )
    );



    window.U9RoundUser =
    user;

}



/* ========================================================
   ROUND UPDATE
======================================================== */

function updateRound(round){

    state.round =
    round || null;



    window.U9CurrentRound =
    state.round;



    if(!round){

        text(
            DOM.roundProgress,
            "0/0"
        );

        return;

    }



    text(
        DOM.roundProgress,
        `${num(round.completed_orders)}/${num(round.target_orders)}`
    );



    if(
        round.status === "COOLDOWN"
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



/* ========================================================
   ORDER UPDATE
======================================================== */

function updateOrder(order){

    state.order =
    order || null;



    window.U9CurrentOrder =
    state.order;



    if(!order){

        hide(
            DOM.order
        );



        hide(
            DOM.matching
        );



        hide(
            DOM.payButton
        );



        clearMatching();



        enable(
            DOM.orderButton
        );



        text(
            DOM.orderButton,
            "Start Order"
        );



        return;

    }



    show(
        DOM.order
    );



    text(
        DOM.orderStatus,
        order.status
    );



    text(
        DOM.orderName,
        order.product_name || ""
    );



    text(
        DOM.orderPrice,
        money(
            order.product_price
        )
    );



    text(
        DOM.orderProfit,
        money(
            order.profit
        )
    );



    text(
        DOM.orderPaid,
        money(
            order.paid_amount
        )
    );



    text(
        DOM.orderRemaining,
        money(
            order.remaining_amount
        )
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
    ======================================================
       MATCHING
    ======================================================
    */

    if(
        order.status === "MATCHING"
    ){

        show(
            DOM.matching
        );



        disable(
            DOM.orderButton
        );



        text(
            DOM.orderButton,
            "Matching..."
        );



        hide(
            DOM.payButton
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



    /*
    ======================================================
       PENDING
    ======================================================
    */

    if(
        order.status === "PENDING"
    ){

        disable(
            DOM.orderButton
        );



        text(
            DOM.orderButton,
            "Order Pending"
        );



        const remaining =
        num(
            order.remaining_amount
        );



        if(
            remaining > 0
        ){

            show(
                DOM.payButton
            );



            enable(
                DOM.payButton
            );

        }
        else{

            hide(
                DOM.payButton
            );

        }



        return;

    }



    /*
    ======================================================
       COMPLETED
    ======================================================
    */

    if(
        order.status === "COMPLETED"
    ){

        enable(
            DOM.orderButton
        );



        text(
            DOM.orderButton,
            "Start Order"
        );

    }

}



/* ========================================================
   LOAD STATUS
======================================================== */

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

        console.error(
            "[U9 STATUS ERROR]",
            error
        );



        handleError(
            error
        );



        return null;

    }

}



/* ========================================================
   START ORDER
======================================================== */

async function startOrder(){

    if(
        state.busy
    )
    return;



    state.busy=true;



    disable(
        DOM.orderButton
    );



    text(
        DOM.orderButton,
        "Starting..."
    );



    try{

        const result =
        await api(
            "POST",
            {
                action:"start"
            }
        );



        updateRound(
            result.round
        );



        updateOrder(
            result.order
        );



        await loadStatus();

    }
    catch(error){

        console.error(
            "[U9 START ERROR]",
            error
        );



        handleError(
            error
        );

    }
    finally{

        state.busy=false;

    }

}



/* ========================================================
   MATCH REQUEST
======================================================== */

async function matchOrder(){

    if(
        state.busy
    )
    return;



    state.busy=true;



    try{

        const result =
        await api(
            "POST",
            {
                action:"match"
            }
        );



        if(
            result.order
        ){

            updateOrder(
                result.order
            );

        }



        await loadStatus();

    }
    catch(error){

        console.error(
            "[U9 MATCH ERROR]",
            error
        );



        await loadStatus();

    }
    finally{

        state.busy=false;

    }

}



/* ========================================================
   MATCHING TIMER
======================================================== */

function startMatching(
    readyAt
){

    clearMatching();



    if(
        !readyAt
    )
    return;



    const target =
    new Date(
        readyAt
    ).getTime();



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



        text(
            DOM.matchingTime,
            seconds
        );



        if(
            seconds <= 0
        ){

            clearMatching();



            matchOrder();

        }

    }



    tick();



    state.matchingTimer =
    setInterval(
        tick,
        1000
    );

}



/* ========================================================
   PAY REMAINING
======================================================== */

async function payRemaining(){

    if(
        state.busy
    )
    return;



    state.busy=true;



    disable(
        DOM.payButton
    );



    text(
        DOM.payButton,
        "Processing..."
    );



    try{

        const result =
        await api(
            "POST",
            {
                action:"pay"
            }
        );



        updateUser(
            result.user
        );



        updateOrder(
            result.order
        );



        await loadStatus();

    }
    catch(error){

        console.error(
            "[U9 PAY ERROR]",
            error
        );



        handleError(
            error
        );

    }
    finally{

        state.busy=false;

    }

}



/* ========================================================
   COOLDOWN
======================================================== */

function startCooldown(
    until
){

    clearCooldown();



    if(
        !until
    ){

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
                (
                    target -
                    Date.now()
                )
                /
                1000
            )
        );



        text(
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



            loadStatus();

        }

    }



    tick();



    state.cooldownTimer =
    setInterval(
        tick,
        1000
    );

}



/* ========================================================
   TIME FORMAT
======================================================== */

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



    if(
        min <= 0
    ){

        return `${sec}s`;

    }



    return `${min}m ${sec}s`;

}



/* ========================================================
   ERROR HANDLER
======================================================== */

function handleError(
    error
){

    const code =
    error?.message ||
    "UNKNOWN_ERROR";



    console.error(
        "[U9 ERROR]",
        code
    );



    switch(code){

        case "UNAUTHORIZED":

            disable(
                DOM.orderButton
            );



            text(
                DOM.orderButton,
                "Login Required"
            );



        break;



        case "INSUFFICIENT_START_COINS":

            enable(
                DOM.orderButton
            );



            text(
                DOM.orderButton,
                "Insufficient Coins"
            );



        break;



        case "ORDER_ALREADY_ACTIVE":

            disable(
                DOM.orderButton
            );



            text(
                DOM.orderButton,
                "Order Active"
            );



            loadStatus();



        break;



        case "ROUND_COOLDOWN":

            disable(
                DOM.orderButton
            );



            text(
                DOM.orderButton,
                "Cooldown..."
            );



            loadStatus();



        break;



        case "INSUFFICIENT_COINS":

            enable(
                DOM.payButton
            );



            text(
                DOM.payButton,
                "Insufficient Coins"
            );



        break;



        case "NO_PRODUCTS":

            text(
                DOM.orderStatus,
                "No Product"
            );



        break;



        case "U9_DISABLED":

            disable(
                DOM.orderButton
            );



            text(
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



                text(
                    DOM.orderButton,
                    "Start Order"
                );

            }

        break;

    }

}



/* ========================================================
   EVENTS
======================================================== */

function bindEvents(){

    if(
        DOM.orderButton
    ){

        DOM.orderButton.addEventListener(
            "click",
            e=>{

                e.preventDefault();



                startOrder();

            }
        );

    }



    if(
        DOM.payButton
    ){

        DOM.payButton.addEventListener(
            "click",
            e=>{

                e.preventDefault();



                payRemaining();

            }
        );

    }

}



/* ========================================================
   PUBLIC API
======================================================== */

window.U9Order = {

    start:
    startOrder,

    match:
    matchOrder,

    pay:
    payRemaining,

    refresh:
    loadStatus,

    getState(){

        return {
            ...state
        };

    }

};



/* ========================================================
   INIT
======================================================== */

async function init(){

    bindEvents();



    /*
    --------------------------------------------------------
    IMPORTANT

    Do NOT call loadStatus immediately.

    Safari can initialize this script before Header.js
    has restored the U9 session token.

    Wait for u9_token first.
    --------------------------------------------------------
    */

    const token =
    await waitForAuthToken(
        5000
    );



    if(!token){

        console.warn(
            "[U9 AUTH] No session token found."
        );



        /*
        Do not send an unauthenticated request.
        */

        handleError(
            new Error(
                "UNAUTHORIZED"
            )
        );



        return;

    }



    /*
    --------------------------------------------------------
    Token is available.
    Now it is safe to load Auction status.
    --------------------------------------------------------
    */

    await loadStatus();

}



/* ========================================================
   START
======================================================== */

if(
    document.readyState === "loading"
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
