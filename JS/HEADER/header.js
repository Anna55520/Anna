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
   UPDATE HEADER
========================= */


function updateHeaderUser(
  user
){

if(
  user
){

  /*
     HIDE LOGIN REGISTER
  */

  if(headerRegister){

    headerRegister.style.display =
    "none";

  }


  if(headerLogin){

    headerLogin.style.display =
    "none";

  }



  /*
     SHOW USER
  */


  if(headerUser){

    headerUser.classList.add(
      "active"
    );

  }


  if(headerUsername){

    headerUsername.textContent =
    user.username;

  }



}
else{


  /*
     SHOW LOGIN REGISTER
  */


  if(headerRegister){

    headerRegister.style.display =
    "";

  }


  if(headerLogin){

    headerLogin.style.display =
    "";

  }



  /*
     HIDE USER
  */


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
   CHECK USER
========================= */


async function getCurrentUser(){


try{


const response =
await fetch(

"https://tvtakmswbzawaweytimx.supabase.co/functions/v1/me",

{

method:"GET",

credentials:"include"

}

);



if(
!response.ok
){

updateHeaderUser(
null
);

return null;

}



const result =
await response.json();



updateHeaderUser(
result.user
);



return result.user;



}
catch(error){


console.error(
error
);


updateHeaderUser(
null
);


return null;


}



}



/* =========================
   EXPORT
========================= */


window.U9User = {

refresh:
getCurrentUser

};



/* =========================
   INIT
========================= */


getCurrentUser();
