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
   SHOW HEADER LOADING
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

    headerUser.classList.remove(
      "active"
    );

  }


  if(headerUsername){

    headerUsername.textContent =
    "";

  }


}





/* =========================
   UPDATE HEADER
========================= */


function updateHeaderUser(
  user
){


  if(user){


    /* =========================
       AUTHENTICATED
    ========================= */


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


    /* =========================
       UNAUTHENTICATED
    ========================= */


    if(headerLoading){

      headerLoading.style.display =
      "none";

    }


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



  /* =========================
     AUTHENTICATED
  ========================= */


  if(
    state ===
    "AUTHENTICATED"
  ){

    updateHeaderUser(
      user
    );

  }


  /* =========================
     UNAUTHENTICATED
  ========================= */


  else if(
    state ===
    "UNAUTHENTICATED"
  ){

    updateHeaderUser(
      null
    );

  }


  /* =========================
     CHECKING
  ========================= */


  else if(
    state ===
    "CHECKING"
  ){

    showHeaderLoading();

  }


  /* =========================
     ERROR
  ========================= */


  else if(
    state ===
    "ERROR"
  ){

    /*
       网络错误 / API 错误

       不显示 Register / Login

       保持 Loading
    */

    showHeaderLoading();

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


  /*
     保存旧用户

     这样在 CHECKING 状态期间
     其他页面不会突然丢失用户资料
  */

  const previousUser =
  currentUser;



  setUserState(

    "CHECKING",

    previousUser,

    null

  );



  try{


    /* =========================
       GET TOKEN
    ========================= */


    const token =
    getSessionToken();



    const headers = {};



    if(token){


      headers[
        "Authorization"
      ] =
      `Bearer ${token}`;


    }



    /* =========================
       REQUEST /ME
    ========================= */


    const response =
    await fetch(

      U9_ME_API,

      {

        method:
        "GET",


        /*
           不使用浏览器缓存

           每次 refresh 都从服务器
           获取最新 user 数据
        */

        cache:
        "no-store",


        credentials:
        "include",


        headers:
        headers

      }

    );





    /* =========================
       INVALID SESSION
    ========================= */


    if(
      response.status === 401 ||
      response.status === 403
    ){


      /*
         清除失效 token
      */

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





    /* =========================
       OTHER HTTP ERROR
    ========================= */


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

        "U9 /me request failed:",

        response.status

      );



      return null;


    }





    /* =========================
       PARSE RESPONSE
    ========================= */


    const result =
    await response.json();





    const user =
    result?.user ||
    result?.data?.user ||
    null;





    /* =========================
       NO USER
    ========================= */


    if(!user){


      setUserState(

        "UNAUTHENTICATED",

        null,

        null

      );



      return null;


    }





    /* =========================
       AUTHENTICATED
    ========================= */


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



    /*
       网络错误时

       保留之前的 user
       不要直接把用户变成未登录
    */

    setUserState(

      "ERROR",

      previousUser,

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



  /*
     返回 unsubscribe
  */

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


  /*
     这里是真正重新请求 /me

     所以：

     U9User.refresh()

     不只是重新读取 currentUser
     而是重新从服务器获取最新数据
  */


  return await getCurrentUser();


}






/* =========================
   LOGOUT CLEAR
========================= */


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


  /*
     获取当前缓存用户
  */

  get:
  getUser,


  /*
     从服务器重新获取用户
  */

  refresh:
  refreshUser,


  /*
     是否已经登录
  */

  isLoggedIn:
  isLoggedIn,


  /*
     是否正在检查
  */

  isChecking:
  isChecking,


  /*
     是否存在有效 session
  */

  hasSession:
  hasSession,


  /*
     获取当前状态
  */

  getState:
  getUserState,


  /*
     监听用户变化
  */

  subscribe:
  subscribeUser,


  /*
     清除登录状态
  */

  clear:
  clearCurrentUser


};







/* =========================
   INIT
========================= */


/*
   页面第一次加载时
   自动检查当前用户
*/


getCurrentUser();
