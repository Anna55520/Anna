/* =========================
   REGISTER ELEMENTS
========================= */


const registerButton =
  document.getElementById(
    "U9-page-header-register"
  );


const registerModal =
  document.getElementById(
    "U9-register-modal"
  );


const registerClose =
  document.getElementById(
    "U9-register-modal-close"
  );


const registerForm =
  document.getElementById(
    "U9-register-form"
  );



/* =========================
   OPEN REGISTER
========================= */


if(
  registerButton &&
  registerModal
){

  registerButton.addEventListener(
    "click",
    ()=>{

      registerModal.style.display =
        "flex";

    }
  );

}



/* =========================
   CLOSE REGISTER
========================= */


if(
  registerClose &&
  registerModal
){

  registerClose.addEventListener(
    "click",
    ()=>{

      registerModal.style.display =
        "none";

    }
  );

}





/* =========================
   PASSWORD SHOW / HIDE
========================= */


const registerPassword =
  document.getElementById(
    "U9-register-password"
  );


const registerPasswordToggle =
  document.getElementById(
    "U9-register-password-toggle"
  );



if(
  registerPassword &&
  registerPasswordToggle
){

  registerPasswordToggle.addEventListener(
    "click",
    ()=>{


      if(
        registerPassword.type ===
        "password"
      ){

        registerPassword.type =
          "text";


        registerPasswordToggle.textContent =
          "Hide";


      }

      else{


        registerPassword.type =
          "password";


        registerPasswordToggle.textContent =
          "Show";


      }


    }
  );

}





/* =========================
   CONFIRM PASSWORD
========================= */


const registerConfirmPassword =
  document.getElementById(
    "U9-register-confirm-password"
  );


const registerConfirmPasswordToggle =
  document.getElementById(
    "U9-register-confirm-password-toggle"
  );



if(
  registerConfirmPassword &&
  registerConfirmPasswordToggle
){

  registerConfirmPasswordToggle.addEventListener(
    "click",
    ()=>{


      if(
        registerConfirmPassword.type ===
        "password"
      ){

        registerConfirmPassword.type =
          "text";


        registerConfirmPasswordToggle.textContent =
          "Hide";


      }

      else{


        registerConfirmPassword.type =
          "password";


        registerConfirmPasswordToggle.textContent =
          "Show";


      }


    }
  );

}





/* =========================
   REGISTER FORM
========================= */


if(
  registerForm
){


registerForm.addEventListener(

"submit",

async(event)=>{


event.preventDefault();





/* =========================
   GET DATA
========================= */


const username =
document
.getElementById(
  "U9-register-username"
)
.value
.trim();



const email =
document
.getElementById(
  "U9-register-email"
)
.value
.trim();



const password =
document
.getElementById(
  "U9-register-password"
)
.value;



const confirmPassword =
document
.getElementById(
  "U9-register-confirm-password"
)
.value;





/* =========================
   PASSWORD CHECK
========================= */


if(
  password !==
  confirmPassword
){

alert(
"Passwords do not match."
);


return;

}





/* =========================
   REGISTER REQUEST
========================= */


try{


const response =
await fetch(

"https://tvtakmswbzawaweytimx.supabase.co/functions/v1/register",

{


method:

"POST",



credentials:

"include",



headers:

{

"Content-Type":

"application/json"

},



body:

JSON.stringify({

username:
username,

email:
email,

password:
password

})


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


alert(

result.error ||
"Registration failed."

);



return;

}







/* =========================
   SUCCESS
========================= */


/*
================================

Backend:

Set-Cookie:
u9_session

Browser automatically saves.

No localStorage.

================================
*/



alert(
"Registration successful."
);




registerForm.reset();




if(
  registerModal
){

registerModal.style.display =
"none";

}







/* =========================
   WAIT COOKIE
   SAFARI FIX
========================= */


await new Promise(
resolve =>
setTimeout(
resolve,
300
)
);







/* =========================
   UPDATE USER STATE
========================= */


if(
  window.U9User
){


await window.U9User.refresh();


}






/* =========================
   UPDATE AVATAR
========================= */


if(
  window.U9ProfileAvatar
){


await window.U9ProfileAvatar.refresh();


}







/* =========================
   DEBUG
========================= */


console.log(
"Register result:",
result
);



}



catch(error){


console.error(

"Register error:",

error

);



alert(

"Unable to connect to server."

);



}



}

);

}
