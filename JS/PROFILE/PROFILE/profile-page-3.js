/* =================================================
   U9 PROFILE PAGE 3
   AVATAR FRAME SYSTEM

   SVG SOURCE:
   Supabase Database

   NO LOCAL SVG FILE
================================================= */



/* =================================================
   API
================================================= */

const U9_FRAME_API =
"https://tvtakmswbzawaweytimx.supabase.co/functions/v1";



/* =================================================
   ELEMENTS
================================================= */


const page3 =
document.getElementById(
"U9-profile-page3"
);



const freeContainer =
document.getElementById(
"U9-profile-page3-free-frame"
);



const paidContainer =
document.getElementById(
"U9-profile-page3-paid-frame"
);



const imageInput =
document.getElementById(
"U9-profile-page3-image-input"
);



const preview =
document.getElementById(
"U9-profile-page3-preview"
);



const cancelButton =
document.getElementById(
"U9-profile-page3-cancel"
);



const saveButton =
document.getElementById(
"U9-profile-page3-save"
);



let selectedFile = null;





/* =================================================
   INLINE ICON
================================================= */


const lockSVG = `

<svg
viewBox="0 0 24 24"
fill="none"
xmlns="http://www.w3.org/2000/svg">

<path
d="M7 10V7C7 4.23858 9.23858 2 12 2C14.7614 2 17 4.23858 17 7V10"
stroke="currentColor"
stroke-width="2"
/>

<rect
x="5"
y="10"
width="14"
height="12"
rx="2"
stroke="currentColor"
stroke-width="2"
/>

</svg>

`;



const ownerSVG = `

<svg
viewBox="0 0 24 24"
fill="none"
xmlns="http://www.w3.org/2000/svg">

<circle
cx="12"
cy="12"
r="10"
stroke="currentColor"
stroke-width="2"
/>

<path
d="M8 12L11 15L16 9"
stroke="currentColor"
stroke-width="2"
/>

</svg>

`;






/* =================================================
   LOAD PAGE
================================================= */


async function loadProfilePage3(){


await loadFreeFrames();


await loadPaidFrames();


}







/* =================================================
   FREE FRAME
================================================= */


async function loadFreeFrames(){


try{


const res =
await fetch(

`${U9_FRAME_API}/avatar-frame-free`

);



const data =
await res.json();



freeContainer.innerHTML="";



(data.frames || [])
.forEach(

(frame)=>{


freeContainer.appendChild(

createFrameCard(
frame,
"free"
)

);


}

);



}

catch(error){

console.error(
"FREE FRAME ERROR:",
error
);

}



}









/* =================================================
   PAID FRAME
================================================= */


async function loadPaidFrames(){


try{


const res =
await fetch(

`${U9_FRAME_API}/avatar-frame-paid`,

{
credentials:
"include"
}

);



const data =
await res.json();



paidContainer.innerHTML="";



(data.frames || [])
.forEach(

(frame)=>{


paidContainer.appendChild(

createFrameCard(
frame,
"paid"
)

);


}

);



}

catch(error){

console.error(
"PAID FRAME ERROR:",
error
);


}


}







/* =================================================
   CREATE FRAME CARD
================================================= */


function createFrameCard(
frame,
type
){



const card =
document.createElement(
"div"
);



card.className =
"U9-profile-page3-frame-card";





/* =========================
   FRAME SVG
========================= */


const frameBox =
document.createElement(
"div"
);


frameBox.className =
"U9-profile-page3-frame-svg";



frameBox.innerHTML =
frame.svg || "";



card.appendChild(
frameBox
);





/* =========================
   STATUS
========================= */


if(
type==="paid"
){


const status =
document.createElement(
"div"
);



status.className =
"U9-profile-page3-frame-status";



if(
frame.owned
){


status.innerHTML =
ownerSVG;


}
else{


status.innerHTML =
lockSVG;


}



card.appendChild(
status
);


}







/* =========================
   BUTTON
========================= */


const button =
document.createElement(
"button"
);



button.className =
"U9-profile-page3-frame-button";





if(
type==="paid"
&&
!frame.owned
){


button.textContent =
"buy";



button.onclick =
()=>{


buyFrame(
frame.id
);


};



}

else{


button.textContent =
"use";



button.onclick =
()=>{


equipFrame(

type,

frame.id

);


};



}



card.appendChild(
button
);



return card;



}









/* =================================================
   EQUIP
================================================= */


async function equipFrame(
type,
id
){



try{


const res =
await fetch(

`${U9_FRAME_API}/avatar-frame-equip`,

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

frame_type:
type,

frame_id:
id

})

}

);



const result =
await res.json();



console.log(
result
);



if(
result.success
){

alert(
"Frame equipped"
);


}



}

catch(error){

console.error(
"EQUIP ERROR:",
error
);


}


}









/* =================================================
   BUY PAID FRAME
================================================= */


async function buyFrame(
id
){



try{


const res =
await fetch(

`${U9_FRAME_API}/avatar-frame-paid-purchase`,

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

frame_id:
id

})

}

);



const result =
await res.json();



console.log(
result
);



if(
result.success
){


alert(
"Purchase success"
);


loadPaidFrames();


}
else{


alert(
result.message ||
"Purchase failed"
);


}



}

catch(error){

console.error(
"BUY ERROR:",
error
);


}


}









/* =================================================
   UPLOAD PREVIEW
================================================= */


if(
imageInput
){


imageInput.addEventListener(

"change",

(event)=>{


const file =
event.target.files[0];


if(
!file
)
return;



selectedFile =
file;



const reader =
new FileReader();



reader.onload =
()=>{


preview.src =
reader.result;


};



reader.readAsDataURL(
file
);


}

);


}









/* =================================================
   CANCEL
================================================= */


if(
cancelButton
){


cancelButton.onclick =
()=>{


selectedFile =
null;


imageInput.value =
"";


preview.src =
"";


};


}









/* =================================================
   SAVE UPLOAD
================================================= */


if(
saveButton
){


saveButton.onclick =
async()=>{


if(
!selectedFile
){

alert(
"Select image first"
);


return;

}



const form =
new FormData();



form.append(

"avatar",

selectedFile

);




try{


const res =
await fetch(

`${U9_FRAME_API}/avatar-upload`,

{

method:
"POST",

credentials:
"include",

body:
form

}

);



const result =
await res.json();



console.log(
result
);



if(
result.success
){


alert(
"Avatar uploaded"
);


}


}

catch(error){

console.error(
"UPLOAD ERROR:",
error
);


}



};


}









/* =================================================
   INIT
================================================= */


if(
page3
){


loadProfilePage3();


}
