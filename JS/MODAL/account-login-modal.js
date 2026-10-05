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



/* =========================
   OPEN LOGIN
========================= */


if(
  loginButton
){

  loginButton.addEventListener(
    "click",
    () => {

      loginModal.style.display =
        "flex";

    }
  );

}



/* =========================
   CLOSE LOGIN
========================= */


if(
  loginClose
){

  loginClose.addEventListener(
    "click",
    () => {

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
    () => {


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
   GET DATA
========================= */


const email =
document
.getElementById(
  "U9-login-email"
)
.value
.trim();



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


/*
 Cookie 自动保存
*/

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


alert(
"Login successful."
);



loginForm.reset();



loginModal.style.display =
"none";




/*
 =========================

 u9_session Cookie

 已由浏览器自动保存

 不需要:

 localStorage.setItem()

 不需要:

 Authorization Token

 =========================
*/





/* =========================
   UPDATE USER STATE
========================= */


if(
window.U9User
){

await window.U9User.refresh();

}




/* =========================
   UPDATE PROFILE AVATAR
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
"Login result:",
result
);



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



});

}
