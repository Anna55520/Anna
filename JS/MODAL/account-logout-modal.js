/* =========================
   LOGOUT
========================= */


/* =========================
   LOGOUT CONFIRM ELEMENTS
========================= */


const logoutModal =
  document.getElementById(
    "U9-account-logout"
  );


const logoutNo =
  document.getElementById(
    "U9-account-logout-no"
  );


const logoutYes =
  document.getElementById(
    "U9-account-logout-yes"
  );


const logoutCountdown =
  document.getElementById(
    "U9-account-logout-countdown"
  );



/* =========================
   SETTING LOGOUT BUTTON
========================= */


const accountSettingLogout =
  document.getElementById(
    "Account-U9-account-logout"
  );




/* =========================
   TIMER
========================= */


let logoutTimer =
null;



let logoutProcessing =
false;




/* =========================
   OPEN LOGOUT CONFIRM
========================= */


function openLogoutConfirm(){


if(
!logoutModal ||
!logoutYes ||
!logoutCountdown
){

return;

}



logoutModal.style.display =
"flex";



logoutProcessing =
false;



logoutYes.disabled =
true;



logoutYes.classList.remove(
"loading",
"ready"
);



let count =
5;



logoutCountdown.textContent =
count;



logoutYes.textContent =
`Yes (${count})`;




if(
logoutTimer
){

clearInterval(
logoutTimer
);


logoutTimer =
null;

}





logoutTimer =
setInterval(
()=>{


count--;



if(
count > 0
){

logoutCountdown.textContent =
count;


logoutYes.textContent =
`Yes (${count})`;

}





if(
count <= 0
){

clearInterval(
logoutTimer
);



logoutTimer =
null;



logoutYes.textContent =
"Yes";



logoutYes.disabled =
false;



logoutYes.classList.add(
"ready"
);



}



},
1000
);



}






/* =========================
   OPEN FROM SETTING PAGE
========================= */


if(
accountSettingLogout
){

accountSettingLogout.addEventListener(
"click",
(event)=>{


event.stopPropagation();



if(
typeof closeAccountSetting ===
"function"
){

closeAccountSetting();

}



openLogoutConfirm();



}

);

}






/* =========================
   NO BUTTON
========================= */


if(
logoutNo
){

logoutNo.addEventListener(
"click",
()=>{



logoutModal.style.display =
"none";



logoutProcessing =
false;




logoutYes.disabled =
true;



logoutYes.classList.remove(
"loading",
"ready"
);




if(
logoutTimer
){

clearInterval(
logoutTimer
);


logoutTimer =
null;

}



}

);

}






/* =========================
   YES BUTTON
========================= */


if(
logoutYes
){

logoutYes.addEventListener(
"click",
async()=>{



/* =========================
   PREVENT DOUBLE CLICK
========================= */


if(
logoutYes.disabled ||
logoutProcessing
){

return;

}




logoutProcessing =
true;



logoutYes.disabled =
true;



logoutYes.classList.remove(
"ready"
);



logoutYes.classList.add(
"loading"
);



logoutYes.textContent =
"Loading...";





/* =========================
   LOGOUT REQUEST
========================= */


try{


const response =
await fetch(

"https://tvtakmswbzawaweytimx.supabase.co/functions/v1/logout",

{

method:
"POST",


/*
 Cookie:

 u9_session

 自动发送

*/

credentials:
"include",



headers:{

"Content-Type":
"application/json"

}


}

);





const result =
await response.json();





/* =========================
   LOGOUT ERROR
========================= */


if(
!response.ok
){


console.error(
"Logout failed:",
result
);



alert(

result.error ||
"Logout failed."

);



logoutProcessing =
false;



logoutYes.disabled =
false;



logoutYes.classList.remove(
"loading"
);



logoutYes.classList.add(
"ready"
);



logoutYes.textContent =
"Yes";



return;

}







/* =========================
   CLEAR USER STATE
========================= */


if(
window.U9User
){

window.U9User.clear();

}






/* =========================
   CLOSE MODAL
========================= */


logoutModal.style.display =
"none";





/* =========================
   DEBUG
========================= */


console.log(
"Logout result:",
result
);





}

catch(error){


console.error(
"Logout error:",
error
);



alert(
"Unable to connect to the server."
);



logoutProcessing =
false;



logoutYes.disabled =
false;



logoutYes.classList.remove(
"loading"
);



logoutYes.classList.add(
"ready"
);



logoutYes.textContent =
"Yes";



}



}

);

}
