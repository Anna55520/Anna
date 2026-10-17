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
   PASSWORD
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
   REGISTER
========================= */


if(registerForm){


registerForm.addEventListener(

"submit",

async(event)=>{


event.preventDefault();





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






if(
password !== confirmPassword
){

alert(
"Passwords do not match."
);


return;

}







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

username,

email,

password

})


}

);





const result =
await response.json();







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
   SAVE TOKEN
========================= */


if(
result.session &&
result.session.token
){


localStorage.setItem(

"u9_token",

result.session.token

);


console.log(
"U9 token saved"
);


}







/* =========================
   SUCCESS
========================= */


alert(
"Registration successful."
);



registerForm.reset();




if(registerModal){

registerModal.style.display =
"none";

}







/* =========================
   REFRESH USER
========================= */


await new Promise(
resolve=>
setTimeout(
resolve,
200
)
);





if(
window.U9User
){


await window.U9User.refresh();


}







/* =========================
   REFRESH AVATAR
========================= */


if(
window.U9ProfileAvatar
){


await window.U9ProfileAvatar.refresh();


}







console.log(
"Register success:",
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
