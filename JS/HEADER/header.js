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


const headerLoading =
  document.getElementById(
    "U9-page-header-loading"
  );



const headerToolToggle =
  document.getElementById(
    "U9-page-header-tool-toggle"
  );


/* =========================
   API
========================= */


const U9_ME_API =
"https://tvtakmswbzawaweytimx.supabase.co/functions/v1/me";





/* =========================
   TOKEN
========================= */


function getSessionToken(){

  return localStorage.getItem(
    "u9_token"
  );

}





/* =========================
   USER STATE
========================= */


let currentUser =
null;


let currentUserState =
"CHECKING";


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

  if(!username){

    return "";

  }


  if(username.length <= 8){

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
   HEADER LOADING
========================= */


function showHeaderLoading(){


  if(headerLoading){

    headerLoading.style.display =
    "flex";

  }


  if(headerRegister){

    headerRegister.style.display =
    "none";

  }


  if(headerLogin){

    headerLogin.style.display =
    "none";

  }


  if(headerUser){

    headerUser.style.display =
    "none";

    headerUser.classList.remove(
      "active"
    );

  }


  if(headerUsername){

    headerUsername.textContent =
    "";

  }

  if (headerToolToggle) {
    headerToolToggle.classList.remove("active");
  }


}





/* =========================
   HEADER GUEST
========================= */


function showHeaderGuest(){


  if(headerLoading){

    headerLoading.style.display =
    "none";

  }


  if(headerRegister){

    headerRegister.style.display =
    "block";

  }


  if(headerLogin){

    headerLogin.style.display =
    "block";

  }


  if(headerUser){

    headerUser.style.display =
    "none";

    headerUser.classList.remove(
      "active"
    );

  }


  if(headerUsername){

    headerUsername.textContent =
    "";

  }

  if (headerToolToggle) {
    headerToolToggle.classList.remove("active");
  }

}





/* =========================
   HEADER USER
========================= */


function showHeaderUser(
  user
){


  if(headerLoading){

    headerLoading.style.display =
    "none";

  }


  if(headerRegister){

    headerRegister.style.display =
    "none";

  }


  if(headerLogin){

    headerLogin.style.display =
    "none";

  }



  if(headerUser){

    headerUser.style.display =
    "flex";


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

  if (headerToolToggle) {
    headerToolToggle.classList.add("active");
  }

}





/* =========================
   UPDATE HEADER
========================= */


function updateHeaderUser(
  user
){


  if(user){

    showHeaderUser(
      user
    );

  }

  else{

    showHeaderGuest();

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



  switch(state){


    case "AUTHENTICATED":


      updateHeaderUser(
        user
      );


      break;




    case "UNAUTHENTICATED":


      showHeaderGuest();


      break;




    case "CHECKING":


      showHeaderLoading();


      break;




    case "ERROR":


      showHeaderLoading();


      break;



  }



  notifyUserListeners();


}





/* =========================
   NOTIFY
========================= */


function notifyUserListeners(){


  userListeners.forEach(

    listener => {


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


  const previousUser =
  currentUser;



  setUserState(

    "CHECKING",

    previousUser,

    null

  );



  try{


    const token =
    getSessionToken();



    const headers = {};



    if(token){


      headers[
        "Authorization"
      ] =
      `Bearer ${token}`;


    }





    const response =
    await fetch(

      U9_ME_API,

      {

        method:
        "GET",

        cache:
        "no-store",

        credentials:
        "include",

        headers:
        headers

      }

    );





    /*
       没有登录
       或 token 无效
    */


    if(

      response.status === 401 ||

      response.status === 403

    ){


      localStorage.removeItem(
        "u9_token"
      );



      setUserState(

        "UNAUTHENTICATED",

        null,

        null

      );



      return null;


    }





    /*
       服务器错误
    */


    if(!response.ok){


      const error =
      new Error(

        `GET /me failed: ${response.status}`

      );



      setUserState(

        "ERROR",

        previousUser,

        error

      );



      console.error(

        "U9 /me failed:",

        response.status

      );



      return null;


    }





    const result =
    await response.json();





    const user =
    result?.user ||
    result?.data?.user ||
    null;





    if(!user){


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



    console.log(

      "U9 User Refreshed:",

      user

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

      previousUser,

      error

    );



    return null;


  }



}







/* =========================
   PUBLIC API
========================= */


function getUser(){

  return currentUser;

}




function getUserState(){

  return currentUserState;

}




function isLoggedIn(){

  return (

    currentUserState ===
    "AUTHENTICATED"

    &&

    !!currentUser

  );

}




function isChecking(){

  return (

    currentUserState ===
    "CHECKING"

  );

}




function hasSession(){

  return (

    currentUserState ===
    "AUTHENTICATED"

  );

}





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





async function refreshUser(){


  return await getCurrentUser();


}





function clearCurrentUser(){


  localStorage.removeItem(
    "u9_token"
  );



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


showHeaderLoading();


getCurrentUser();
