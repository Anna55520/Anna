/* =========================
   PROFILE PAGE 3
   FREE AVATAR
========================= */


/* =========================
   API
========================= */


const U9_AVATAR_FREE_API =
"https://tvtakmswbzawaweytimx.supabase.co/functions/v1/avatar-free";


const U9_AVATAR_SET_API =
"https://tvtakmswbzawaweytimx.supabase.co/functions/v1/avatar-set";






/* =========================
   ELEMENTS
========================= */


const profilePage3 =
document.getElementById(
"U9-profile-page-3"
);



const freeAvatarContainer =
document.getElementById(
"U9-profile-free-avatar-list"
);



const freeAvatarStatus =
document.getElementById(
"U9-profile-free-avatar-status"
);






/* =========================
   TOKEN
========================= */


function getToken(){

return localStorage.getItem(
"u9_token"
);

}







/* =========================
   AUTH HEADERS
========================= */


function getAuthHeaders(){


const headers = {

"Content-Type":
"application/json"

};



const token =
getToken();



if(token){

headers.Authorization =
`Bearer ${token}`;

}



return headers;

}









/* =========================
   LOAD FREE AVATAR
========================= */


async function loadFreeAvatar(){


try{


const response =
await fetch(

U9_AVATAR_FREE_API,

{

method:
"GET",


credentials:
"include",


headers:
getAuthHeaders()

}

);





const result =
await response.json();






console.log(
"FREE AVATAR RESULT:",
result
);







if(
!response.ok ||
!result.success
){

throw new Error(
result.error ||
"Unable to load avatar"
);

}






renderFreeAvatar(
result.avatars || []
);





}

catch(error){


console.error(

"Load free avatar error:",

error

);



if(freeAvatarStatus){

freeAvatarStatus.textContent =
"Unable to load avatar";

}



}



}









/* =========================
   RENDER AVATAR
========================= */


function renderFreeAvatar(
avatars
){



if(
!freeAvatarContainer
){

return;

}




freeAvatarContainer.innerHTML =
"";





avatars.forEach(

avatar=>{



const item =
document.createElement(
"div"
);



item.className =
"U9-profile-free-avatar-item";



item.dataset.avatarId =
avatar.id;





const image =
document.createElement(
"img"
);



image.className =
"U9-profile-free-avatar-image";



image.src =
avatar.svg;



image.alt =
avatar.name || "avatar";





item.appendChild(
image
);






item.addEventListener(
"click",
()=>{


setFreeAvatar(
avatar.id
);



}

);






freeAvatarContainer.appendChild(
item
);



}

);



}









/* =========================
   SET FREE AVATAR
========================= */


async function setFreeAvatar(
avatarId
){



try{


document.body.classList.add(
"U9-avatar-loading"
);






const response =
await fetch(

U9_AVATAR_SET_API,

{

method:
"POST",


credentials:
"include",


headers:
getAuthHeaders(),



body:
JSON.stringify({

avatar_type:
"free",


avatar_id:
avatarId


})

}

);







const result =
await response.json();





console.log(

"SET AVATAR RESULT:",

result

);






if(
!response.ok ||
!result.success
){


throw new Error(

result.error ||
"Set avatar failed."

);


}







console.log(
"Avatar updated"
);






/* =========================
   REFRESH USER
========================= */


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






}

catch(error){


console.error(

"SET AVATAR ERROR:",

error

);



alert(
error.message
);



}

finally{


document.body.classList.remove(
"U9-avatar-loading"
);



}



}









/* =========================
   INIT
========================= */


function initProfilePage3(){



if(
!profilePage3
){

return;

}



console.log(
"PROFILE PAGE 3 LOADED"
);



loadFreeAvatar();



}







/* =========================
   START
========================= */


if(
document.readyState ===
"loading"
){


document.addEventListener(

"DOMContentLoaded",

initProfilePage3

);


}

else{


initProfilePage3();


}
