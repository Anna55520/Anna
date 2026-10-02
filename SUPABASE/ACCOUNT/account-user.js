/* =========================
   U9 USER HEADER
========================= */


window.U9User = {


  async refresh(){


    try{


      const response =
        await fetch(
          "https://tvtakmswbzawaweytimx.supabase.co/functions/v1/me",
          {

            method:"GET",

            credentials:"include"

          }
        );


      const result =
        await response.json();



      console.log(
        "ME USER:",
        result
      );



      if(
        !response.ok ||
        !result.authenticated ||
        !result.user
      ){

        logoutHeader();

        return;

      }



      showUserHeader(
        result.user
      );



    }
    catch(error){


      console.error(
        "USER LOAD ERROR:",
        error
      );


      logoutHeader();


    }


  }


};





/* =========================
   SHOW USER
========================= */


function showUserHeader(
  user
){


  const register =
    document.getElementById(
      "U9-page-header-register"
    );


  const login =
    document.getElementById(
      "U9-page-header-login"
    );


  const userButton =
    document.getElementById(
      "U9-page-header-user"
    );


  const username =
    document.getElementById(
      "U9-page-header-username"
    );



  if(register)
    register.style.display =
      "none";



  if(login)
    login.style.display =
      "none";



  if(userButton)
    userButton.style.display =
      "flex";



  if(username)
    username.textContent =
      user.username;



}





/* =========================
   LOGOUT HEADER
========================= */


function logoutHeader(){


  const register =
    document.getElementById(
      "U9-page-header-register"
    );


  const login =
    document.getElementById(
      "U9-page-header-login"
    );


  const userButton =
    document.getElementById(
      "U9-page-header-user"
    );



  if(register)
    register.style.display =
      "block";



  if(login)
    login.style.display =
      "block";



  if(userButton)
    userButton.style.display =
      "none";


}
