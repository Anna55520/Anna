/* =========================
   HEADER ELEMENTS
========================= */


const headerRegister =
  document.getElementById(
    "U9-page-header-register"
  );


const headerLogin =
  document.getElementById(
    "U9-page-header-login"
  );


const headerUser =
  document.getElementById(
    "U9-page-header-user"
  );


const headerUsername =
  document.getElementById(
    "U9-page-header-username"
  );





/* =========================
   API
========================= */


const U9_ME_API =
"https://tvtakmswbzawaweytimx.supabase.co/functions/v1/me";







/* =========================
   USER STATE
========================= */


let currentUser =
null;


let currentUserState =
"UNAUTHENTICATED";


let currentUserError =
null;






/* =========================
   LISTENERS
========================= */


const userListeners =
new Set();







/* =========================
   USERNAME FORMAT
========================= */


function formatUsername(
username
){


if(
!username
){

return "";

}



if(
username.length <= 8
){

return username;

}



return (

username.substring(
0,
8
)

+

"..."

);


}







/* =========================
   UPDATE HEADER
========================= */


function updateHeaderUser(
user
){


if(user){


if(headerRegister){

headerRegister.style.display =
"none";

}



if(headerLogin){

headerLogin.style.display =
"none";

}



if(headerUser){

headerUser.classList.add(
"active"
);

}



if(headerUsername){

headerUsername.textContent =
formatUsername(
user.username
);

}



}


else{


if(headerRegister){

headerRegister.style.display =
"";

}



if(headerLogin){

headerLogin.style.display =
"";

}



if(headerUser){

headerUser.classList.remove(
"active"
);

}



if(headerUsername){

headerUsername.textContent =
"";

}



}



}








/* =========================
   SET USER STATE
========================= */


function setUserState(
state,
user=null,
error=null
){


currentUserState =
state;


currentUser =
user;


currentUserError =
error;



if(
state ===
"AUTHENTICATED"
){


updateHeaderUser(
user
);


}

else{


updateHeaderUser(
null
);


}



notifyUserListeners();


}








/* =========================
   NOTIFY
========================= */


function notifyUserListeners(){


userListeners.forEach(

listener=>{


try{


listener(

currentUser,

currentUserState,

currentUserError

);


}

catch(error){


console.error(
"U9User listener failed:",
error
);


}


}


);


}










/* =========================
   CHECK CURRENT USER
========================= */


async function getCurrentUser(){



setUserState(

"CHECKING",

currentUser,

null

);




try{





const response =
await fetch(

U9_ME_API,

{


method:
"GET",



/*
 HttpOnly Cookie

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






/* =========================
   NOT LOGIN
========================= */


if(
response.status === 401 ||
response.status === 403
){



setUserState(

"UNAUTHENTICATED",

null,

null

);



return null;


}








if(
!response.ok
){


const error =
new Error(
"GET /me failed"
);



setUserState(

"ERROR",

currentUser,

error

);



return null;


}








const result =
await response.json();





const user =
result?.user ||
null;






if(
!user
){


setUserState(

"UNAUTHENTICATED",

null,

null

);



return null;


}







setUserState(

"AUTHENTICATED",

user,

null

);



return user;



}



catch(error){


console.error(

"Get current user failed:",

error

);



setUserState(

"ERROR",

currentUser,

error

);



return null;


}



}









/* =========================
   GET USER
========================= */


function getUser(){

return currentUser;

}






/* =========================
   GET STATE
========================= */


function getUserState(){

return currentUserState;

}








/* =========================
   LOGIN CHECK
========================= */


function isLoggedIn(){


return (

currentUserState ===
"AUTHENTICATED"

&&

!!currentUser

);


}








/* =========================
   CHECKING
========================= */


function isChecking(){


return (

currentUserState ===
"CHECKING"

);


}








/* =========================
   SESSION CHECK
========================= */


function hasSession(){


return (

currentUserState ===
"AUTHENTICATED"

);


}








/* =========================
   SUBSCRIBE
========================= */


function subscribeUser(
listener
){


if(
typeof listener !==
"function"
){

return ()=>{};

}



userListeners.add(
listener
);



return function(){


userListeners.delete(
listener
);


};


}








/* =========================
   REFRESH
========================= */


async function refreshUser(){

return await getCurrentUser();

}








/* =========================
   LOGOUT CLEAR
========================= */


function clearCurrentUser(){



setUserState(

"UNAUTHENTICATED",

null,

null

);



}








/* =========================
   EXPORT
========================= */


window.U9User = {


get:
getUser,


refresh:
refreshUser,


isLoggedIn:
isLoggedIn,


isChecking:
isChecking,


hasSession:
hasSession,


getState:
getUserState,


subscribe:
subscribeUser,


clear:
clearCurrentUser



};









/* =========================
   INIT
========================= */


getCurrentUser();
