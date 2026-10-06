(function(){

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


const U9_ORDER_STATUS_API =
"https://tvtakmswbzawaweytimx.supabase.co/functions/v1/u9-order-status";


let statusTimer = null;

let isPolling = false;

let checkingStatus = false;

let initialized = false;


window.U9Auction =
window.U9Auction || {

    order:null,

    status:"READY"

};



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

            if(
                item
            ){

                item.style.display =
                "none";

            }

        }

    );

}



function showReady(){

    hideAllStatus();


    if(
        orderMatching
    ){

        orderMatching.style.display =
        "none";

    }


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
        orderMatching
    ){

        orderMatching.style.display =
        "none";

    }


    if(
        orderStatusCooldown
    ){

        orderStatusCooldown.style.display =
        "block";

    }

}



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



async function checkOrderStatus(){

    if(
        checkingStatus
    ){

        return;

    }


    checkingStatus =
    true;


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
        else{

            window.U9Auction.order =
            null;


            applyStatus(
                "READY"
            );

        }


    }
    catch(error){

        console.error(
            "checkOrderStatus:",
            error
        );

    }
    finally{

        checkingStatus =
        false;

    }

}

function startPolling(){

    if(
        isPolling
    ){

        return;

    }


    if(
        statusTimer
    ){

        clearInterval(
            statusTimer
        );

        statusTimer =
        null;

    }


    isPolling =
    true;


    checkOrderStatus();


    statusTimer =
    setInterval(

        function(){

            checkOrderStatus();

        },

        3000

    );

}



function stopPolling(){

    isPolling =
    false;


    if(
        statusTimer
    ){

        clearInterval(
            statusTimer
        );


        statusTimer =
        null;

    }

}



function recoverOrderState(){

    checkOrderStatus();

}



document.addEventListener(

    "visibilitychange",

    function(){

        if(
            document.visibilityState ===
            "visible"
        ){

            checkOrderStatus();


            if(
                !isPolling
            ){

                startPolling();

            }

        }
        else{

            stopPolling();

        }

    }

);



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


                    checkOrderStatus();


                    if(
                        !isPolling
                    ){

                        startPolling();

                    }

                }



                if(
                    state ===
                    "UNAUTHENTICATED"
                ){


                    stopPolling();


                    window.U9Auction.order =
                    null;


                    applyStatus(
                        "READY"
                    );

                }


            }

        );

    }

}



function initializeAuctionStatus(){


    if(
        initialized
    ){

        return;

    }


    initialized =
    true;


    recoverOrderState();


    connectUserListener();


    startPolling();


}



window.U9AuctionStatus = {


    check:
    checkOrderStatus,


    start:
    startPolling,


    stop:
    stopPolling


};



initializeAuctionStatus();



})();
