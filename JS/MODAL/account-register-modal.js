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


if(registerButton){

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


if(registerClose){

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



if(registerPasswordToggle){

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


      }else{


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



if(registerConfirmPasswordToggle){

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


      }else{


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


if(registerForm){


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
   REGISTER API
========================= */


try{


const response =
await fetch(

"https://tvtakmswbzawaweytimx.supabase.co/functions/v1/register",

{

method:"POST",

credentials:"include",


headers:{

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


if(!response.ok){


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
 后端已经发送:

 Set-Cookie:
 u9_session

 浏览器自动保存

 不需要 localStorage
*/


alert(
"Registration successful."
);



registerForm.reset();



registerModal.style.display =
"none";



/*
 自动登录

 使用 Cookie 获取当前用户
*/


if(
typeof getCurrentUser ===
"function"
){

await getCurrentUser();

}



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



});


}
