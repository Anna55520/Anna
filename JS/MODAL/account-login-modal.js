/* =========================
   LOGIN ELEMENTS
========================= */


const loginButton =
  document.getElementById(
    "U9-page-header-login"
  );


const loginModal =
  document.getElementById(
    "U9-login-modal"
  );


const loginClose =
  document.getElementById(
    "U9-login-modal-close"
  );


const loginForm =
  document.getElementById(
    "U9-login-form"
  );


const loginSubmit =
  document.getElementById(
    "U9-login-submit"
  );



let loginProcessing =
false;





/* =========================
   OPEN LOGIN
========================= */


if(
  loginButton &&
  loginModal
){

  loginButton.addEventListener(
    "click",
    ()=>{


      loginModal.style.display =
        "flex";


    }
  );

}






/* =========================
   CLOSE LOGIN
========================= */


if(
  loginClose &&
  loginModal
){

  loginClose.addEventListener(
    "click",
    ()=>{


      loginModal.style.display =
        "none";


    }
  );

}








/* =========================
   PASSWORD SHOW / HIDE
========================= */


const loginPassword =
document.getElementById(
  "U9-login-password"
);



const loginPasswordToggle =
document.getElementById(
  "U9-login-password-toggle"
);




if(
  loginPassword &&
  loginPasswordToggle
){

  loginPasswordToggle.addEventListener(
    "click",
    ()=>{


      if(
        loginPassword.type ===
        "password"
      ){


        loginPassword.type =
          "text";


        loginPasswordToggle.textContent =
          "Hide";


      }

      else{


        loginPassword.type =
          "password";


        loginPasswordToggle.textContent =
          "Show";


      }


    }
  );

}








/* =========================
   LOGIN FORM
========================= */


if(
  loginForm
){


loginForm.addEventListener(

"submit",

async(event)=>{


event.preventDefault();






/* =========================
   PREVENT DOUBLE CLICK
========================= */


if(
  loginProcessing
){

return;

}



loginProcessing =
true;







/* =========================
   BUTTON LOADING
========================= */


if(
  loginSubmit
){

  loginSubmit.disabled =
    true;


  loginSubmit.classList.add(
    "loading"
  );


  loginSubmit.textContent =
    "Loading...";

}









/* =========================
   GET DATA
========================= */


const email =
document
.getElementById(
  "U9-login-email"
)
.value
.trim()
.toLowerCase();



const password =
document
.getElementById(
  "U9-login-password"
)
.value;







/* =========================
   LOGIN REQUEST
========================= */


try{


const response =
await fetch(

"https://tvtakmswbzawaweytimx.supabase.co/functions/v1/login",

{


method:
"POST",



credentials:
"include",



headers:{

"Content-Type":
"application/json"

},



body:
JSON.stringify({

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
   LOGIN ERROR
========================= */


if(
  !response.ok
){


alert(

result.error ||
"Login failed."

);


return;

}








/* =========================
   LOGIN SUCCESS
========================= */


/*

Backend:

Set-Cookie:
u9_session


Browser:
Chrome
Safari
Telegram WebView

自动保存


*/





console.log(
"Login success:",
result
);






loginForm.reset();





if(
  loginModal
){

loginModal.style.display =
"none";

}








/* =========================
   WAIT COOKIE SAVE
   Safari FIX
========================= */


await new Promise(

resolve=>

setTimeout(
resolve,
500
)

);









/* =========================
   REFRESH USER
========================= */


if(
  window.U9User
){


const user =
await window.U9User.refresh();



console.log(
"Current user:",
user
);



}









/* =========================
   REFRESH AVATAR
========================= */


if(
  window.U9ProfileAvatar
){

await window.U9ProfileAvatar.refresh();


}






}

catch(error){


console.error(

"Login error:",

error

);



alert(

"Unable to connect to the server."

);



}

finally{



loginProcessing =
false;





if(
  loginSubmit
){

loginSubmit.disabled =
false;



loginSubmit.classList.remove(
"loading"
);



loginSubmit.textContent =
"Login";


}





}



}

);


}
