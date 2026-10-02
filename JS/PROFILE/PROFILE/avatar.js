/* =========================
   PROFILE AVATAR
========================= */


/* =========================
   ELEMENTS
========================= */


const u9ProfileAvatarImage =
document.getElementById(
  "U9-profile-avatar-image"
);


const u9ProfileAvatarFrame =
document.getElementById(
  "U9-profile-avatar-frame"
);



/* =========================
   API
========================= */


const u9ProfileMeURL =
"https://tvtakmswbzawaweytimx.supabase.co/functions/v1/me";



/* =========================
   DEFAULT
========================= */


const u9DefaultAvatar =
"SSVG/avatar/profile.svg";


const u9DefaultFrame =
"SSVG/avatar/ordinary.svg";



/* =========================
   LOAD AVATAR
========================= */


async function loadU9ProfileAvatar(){


try{


const response =
await fetch(
  u9ProfileMeURL,
  {

    method:
    "GET",

    credentials:
    "include"

  }
);



if(
!response.ok
){

console.log(
"Not logged in"
);


return;

}



const result =
await response.json();



const user =
result.user;



if(
!user
){

return;

}



/* =========================
   AVATAR
========================= */


const avatar =
user.avatar ||
{};



if(
avatar.url
){

u9ProfileAvatarImage.src =
avatar.url;

}
else{

u9ProfileAvatarImage.src =
u9DefaultAvatar;

}



/* =========================
   FRAME
========================= */


if(
user.avatar_frame_svg
){

u9ProfileAvatarFrame.src =
user.avatar_frame_svg;

}
else{


u9ProfileAvatarFrame.src =
u9DefaultFrame;


}



console.log(
"Profile Avatar Loaded:",
user
);



}

catch(error){


console.error(
"Load avatar failed:",
error
);


}


}



/* =========================
   INIT
========================= */


loadU9ProfileAvatar();
