/* =========================
   REGISTER FORM
========================= */

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
password !== confirmPassword
){

alert(
"Passwords do not match."
);

return;

}




try{


/* =========================
   REGISTER API
========================= */


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


alert(
"Registration successful."
);



/*
 Cookie:

 u9_session

 浏览器自动保存

*/



registerForm.reset();



registerModal.style.display =
"none";





/* =========================
   AUTO LOGIN
========================= */


/*
 等 Cookie 写入完成
 再获取用户
*/


setTimeout(
async()=>{


await getCurrentUser();


},
300
);



}



catch(error){


console.error(
"Register error:",
error
);



alert(
"Unable to connect to the server."
);



}



});
