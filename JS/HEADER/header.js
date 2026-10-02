/* =========================
   U9 HEADER
========================= */


/* =========================
   ELEMENTS
========================= */

const u9HeaderActions =
document.getElementById(
  "U9-page-header-actions"
);


const u9HeaderRegister =
document.getElementById(
  "U9-page-header-register"
);


const u9HeaderLogin =
document.getElementById(
  "U9-page-header-login"
);


const u9HeaderUser =
document.getElementById(
  "U9-page-header-user"
);


const u9HeaderUsername =
document.getElementById(
  "U9-page-header-username"
);



/* =========================
   LOADING
========================= */

function createHeaderLoading(){

  if(
    document.getElementById(
      "U9-page-header-loading"
    )
  ){

    return;

  }


  const loading =
  document.createElement(
    "span"
  );


  loading.id =
  "U9-page-header-loading";


  loading.textContent =
  "Loading...";


  u9HeaderActions.appendChild(
    loading
  );

}



function getHeaderLoading(){

  return document.getElementById(
    "U9-page-header-loading"
  );

}



/* =========================
   INITIAL LOADING STATE
========================= */

function u9HeaderLoadingState(){

  createHeaderLoading();


  u9HeaderActions.style.display =
  "flex";


  u9HeaderRegister.style.display =
  "none";


  u9HeaderLogin.style.display =
  "none";


  u9HeaderUser.style.display =
  "none";


  getHeaderLoading().style.display =
  "block";

}


u9HeaderLoadingState();



/* =========================
   SHOW GUEST
========================= */

function u9HeaderShowGuest(){

  u9HeaderRegister.style.display =
  "flex";


  u9HeaderLogin.style.display =
  "flex";


  u9HeaderUser.style.display =
  "none";


  u9HeaderUsername.textContent =
  "";


  getHeaderLoading().style.display =
  "none";


}



/* =========================
   SHOW USER
========================= */

function u9HeaderShowUser(
  user
){

  u9HeaderRegister.style.display =
  "none";


  u9HeaderLogin.style.display =
  "none";


  u9HeaderUser.style.display =
  "flex";


  getHeaderLoading().style.display =
  "none";



  let username =
  user?.username ||
  "";



  /*
     LIMIT USERNAME LENGTH
  */

  if(
    username.length > 8
  ){

    username =
    username.substring(
      0,
      8
    )
    +
    "...";

  }



  u9HeaderUsername.textContent =
  username;


}



/* =========================
   KEEP LOADING
========================= */

function u9HeaderKeepLoading(){

  u9HeaderRegister.style.display =
  "none";


  u9HeaderLogin.style.display =
  "none";


  u9HeaderUser.style.display =
  "none";


  getHeaderLoading().style.display =
  "block";

}



/* =========================
   WAIT U9 USER
========================= */

function waitForU9User(){

  const timer =
  setInterval(
    function(){

      if(
        window.U9User
      ){


        const user =
        window.U9User.get();



        if(
          user
        ){

          u9HeaderShowUser(
            user
          );

        }
        else{

          u9HeaderShowGuest();

        }



        clearInterval(
          timer
        );


      }


    },
    100
  );

}


waitForU9User();



/* =========================
   UPDATE FROM OTHER FILES
========================= */

function u9HeaderUpdateUser(
  user
){

  if(
    user
  ){

    u9HeaderShowUser(
      user
    );

  }
  else{

    u9HeaderShowGuest();

  }

}



/* =========================
   GLOBAL
========================= */

window.U9Header = {


  showLoggedIn:
  u9HeaderShowUser,


  showLoggedOut:
  u9HeaderShowGuest,


  loading:
  u9HeaderKeepLoading,


  update:
  u9HeaderUpdateUser


};
