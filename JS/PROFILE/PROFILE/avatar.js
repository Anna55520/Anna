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


const u9ProfileDefaultFrameURL =
"https://tvtakmswbzawaweytimx.supabase.co/functions/v1/avatar-frame-default";


const u9ProfileFreeFrameURL =
"https://tvtakmswbzawaweytimx.supabase.co/functions/v1/avatar-frame-free";


const u9ProfilePaidFrameURL =
"https://tvtakmswbzawaweytimx.supabase.co/functions/v1/avatar-frame-paid";



/* =========================
   DEFAULT
========================= */


const u9DefaultAvatar =
"SSVG/avatar/profile.svg";


const u9DefaultFrame =
"SSVG/avatar/ordinary.svg";



/* =========================
   LOAD FRAME
========================= */


async function loadU9ProfileFrame(user){


u9ProfileAvatarFrame.src =
u9DefaultFrame;



const frameType =
user.avatar_frame_type ||
"default";


const frameId =
user.avatar_frame_id ||
null;



if(
!frameId
){

return;

}



let apiURL =
u9ProfileDefaultFrameURL;



if(
frameType === "free"
){

apiURL =
u9ProfileFreeFrameURL;

}



else if(
frameType === "paid"
){

apiURL =
u9ProfilePaidFrameURL;

}



try{


const response =
await fetch(
apiURL,
{

method:"GET",

credentials:"include"

}
);



if(
!response.ok
){

return;

}



const result =
await response.json();



const frames =
result.frames ||
result.data?.frames ||
[];




const currentFrame =
frames.find(
(frame)=>
frame.id === frameId
);



if(
!currentFrame
){

console.log(
"Frame not found:",
frameId
);

return;

}



if(
!currentFrame.svg
){

return;

}



u9ProfileAvatarFrame.src =
currentFrame.svg;



console.log(
"Profile Frame Loaded:",
currentFrame
);



}

catch(error){


console.error(
"Load frame failed:",
error
);


}



}



/* =========================
   LOAD AVATAR
========================= */


async function loadU9ProfileAvatar(){


try{


const response =
await fetch(
u9ProfileMeURL,
{

method:"GET",

credentials:"include"

}
);



if(
!response.ok
){

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



u9ProfileAvatarImage.src =
avatar.url ||
u9DefaultAvatar;



/* =========================
   FRAME
========================= */


await loadU9ProfileFrame(
user
);



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
