```js
/* =========================
   LOGOUT
========================= */


/* =========================
   ELEMENTS
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



const accountSettingLogout =
  document.getElementById(
    "Account-U9-account-logout"
  );




/* =========================
   STATE
========================= */


let logoutTimer =
  null;


let logoutProcessing =
  false;





/* =========================
   OPEN LOGOUT MODAL
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
   OPEN FROM SETTING
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
         CHECK
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
         GET TOKEN
      ========================= */


      const token =
        localStorage.getItem(
          "u9_token"
        );





      const headers = {

        "Content-Type":
          "application/json"

      };





      if(
        token
      ){

        headers.Authorization =
          `Bearer ${token}`;

      }







      /* =========================
         LOGOUT API
      ========================= */


      try{


        const response =
          await fetch(

            "https://tvtakmswbzawaweytimx.supabase.co/functions/v1/logout",

            {

              method:
                "POST",


              credentials:
                "include",


              headers:
                headers


            }

          );






        const result =
          await response.json();





        /* =========================
           ERROR
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
           RESET TIMER
        ========================= */


        if(
          logoutTimer
        ){

          clearInterval(
            logoutTimer
          );


          logoutTimer =
            null;

        }







        /* =========================
           CLOSE MODAL
        ========================= */


        logoutModal.style.display =
          "none";





        logoutProcessing =
          false;






        console.log(
          "Logout success:",
          result
        );





        /* =========================
           REFRESH PAGE
        ========================= */

        window.location.reload();





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
```
