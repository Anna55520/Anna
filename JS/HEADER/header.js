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
   PROFILE MODAL
========================= */

const u9ProfileModal =
document.getElementById(
  "U9-profile-modal"
);



/* =========================
   LOADING TEXT
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


const u9HeaderLoading =
() =>
document.getElementById(
  "U9-page-header-loading"
);



/* =========================
   INITIAL STATE
========================= */

function u9HeaderLoadingState(){

  createHeaderLoading();


  u9HeaderRegister.style.display =
  "none";


  u9HeaderLogin.style.display =
  "none";


  u9HeaderUser.style.display =
  "none";


  u9HeaderLoading().style.display =
  "block";


  u9HeaderActions.style.display =
  "flex";

}



u9HeaderLoadingState();



/* =========================
   SHOW LOGIN STATE
========================= */

function u9HeaderShowGuest(){

  u9HeaderRegister.style.display =
  "block";


  u9HeaderLogin.style.display =
  "block";


  u9HeaderUser.style.display =
  "none";


  u9HeaderUsername.textContent =
  "";


  u9HeaderLoading().style.display =
  "none";


}



/* =========================
   SHOW USER STATE
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


  u9HeaderLoading().style.display =
  "none";


  let username =
  user?.username ||
  "";


  if(
    username.length > 8
  ){

    username =
    username.slice(
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


  u9HeaderLoading().style.display =
  "block";

}



/* =========================
   PROFILE OPEN
========================= */

function openHeaderProfile(){

  if(
    window.openProfileModal
  ){

    window.openProfileModal();

  }


  u9HeaderUser.classList.add(
    "account-open"
  );

}



/* =========================
   PROFILE CLOSE
========================= */

function closeHeaderProfile(){

  if(
    window.closeProfileModal
  ){

    window.closeProfileModal();

  }


  u9HeaderUser.classList.remove(
    "account-open"
  );

}



/* =========================
   USER BUTTON
========================= */

u9HeaderUser.addEventListener(
"click",
function(event){


  event.stopPropagation();


  if(
    u9ProfileModal &&
    u9ProfileModal.classList.contains(
      "modal-open"
    )
  ){

    closeHeaderProfile();

  }

  else{

    openHeaderProfile();

  }


});



/* =========================
   PROFILE CLOSE SYNC
========================= */

if(
  u9ProfileModal
){

  u9ProfileModal.addEventListener(
  "click",
  function(event){


    if(
      event.target.id ===
      "U9-profile-modal-close"
    ){

      u9HeaderUser.classList.remove(
        "account-open"
      );

    }


  });

}



/* =========================
   RECEIVE INDEX USER
========================= */

function u9HeaderUpdateUser(){

  if(
    !window.U9User
  ){

    return;

  }


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

}



/* =========================
   WAIT INDEX.JS
========================= */

let u9HeaderWait =
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
      u9HeaderWait
    );


  }


},
100);



/* =========================
   GLOBAL
========================= */

window.U9Header = {

  showLoggedIn:
  u9HeaderShowUser,


  showLoggedOut:
  u9HeaderShowGuest,


  loading:
  u9HeaderKeepLoading

};
