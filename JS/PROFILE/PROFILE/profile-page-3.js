/* =================================================
   PROFILE PAGE 3 JS

   ONLY controls:

   #U9-profile-page3-content

   DO NOT control:
   #U9-profile-page3

   Profile window switching is handled by profile.js

================================================= */


/* =================================================
   ELEMENT
================================================= */


const u9ProfilePage3Content =
document.getElementById(
  "U9-profile-page3-content"
);



if (!u9ProfilePage3Content) {

  console.error(
    "Profile Page3 content not found"
  );

  throw new Error(
    "Missing #U9-profile-page3-content"
  );

}



/* =================================================
   AVATAR DATA
================================================= */


const freeAvatarList = [

  "avatar-1.svg",
  "avatar-2.svg",
  "avatar-3.svg",
  "avatar-4.svg",
  "avatar-5.svg",
  "avatar-6.svg",
  "avatar-7.svg",
  "avatar-8.svg"

];



const freeFrameList = [

  {
    id:"frame1",
    image:"frame-1.svg"
  },

  {
    id:"frame2",
    image:"frame-2.svg"
  },

  {
    id:"frame3",
    image:"frame-3.svg"
  },

  {
    id:"frame4",
    image:"frame-4.svg"
  }

];



const paidFrameList = [

  {
    id:"gold",
    image:"gold-frame.svg",
    owned:false
  },


  {
    id:"diamond",
    image:"diamond-frame.svg",
    owned:true
  }

];



/* =================================================
   CREATE PAGE
================================================= */


function loadProfilePage3(){


u9ProfilePage3Content.innerHTML = `


<div class="U9-avatar-window">


<div class="U9-avatar-upload">


<button
class="U9-avatar-upload-box"
id="U9-avatar-upload-button"
>

+

</button>


<div class="U9-avatar-upload-actions">

<button
id="U9-avatar-cancel"
>
cancel
</button>


<button
id="U9-avatar-save"
>
save
</button>


</div>


</div>





<h3>
Free Avatar
</h3>


<div
class="U9-free-avatar-list"
id="U9-free-avatar-list"
></div>





<h3>
Frame
</h3>



<div class="U9-free-frame">


<h4>
free frame
</h4>


<div
id="U9-free-frame-list"
class="U9-frame-list"
></div>


</div>





<div class="U9-paid-frame">


<h4>
paid frame
</h4>


<div
id="U9-paid-frame-list"
class="U9-frame-list"
></div>


</div>



</div>



`;


renderAvatar();

renderFrame();


}





/* =================================================
   AVATAR
================================================= */


function renderAvatar(){


const box =
document.getElementById(
"U9-free-avatar-list"
);



freeAvatarList.forEach(
(item)=>{


const div =
document.createElement(
"div"
);


div.className =
"U9-avatar-item";


div.innerHTML = `

<img
src="SVG/avatar/${item}"
>


`;



box.appendChild(div);



});


}





/* =================================================
   FRAME
================================================= */


function renderFrame(){


const freeBox =
document.getElementById(
"U9-free-frame-list"
);


const paidBox =
document.getElementById(
"U9-paid-frame-list"
);



freeFrameList.forEach(
(frame)=>{


createFrame(
freeBox,
frame,
"free"
);


});




paidFrameList.forEach(
(frame)=>{


createFrame(
paidBox,
frame,
"paid"
);


});



}





function createFrame(
container,
frame,
type
){


const div =
document.createElement(
"div"
);


div.className =
"U9-frame-item";



let status="use";

let icon="";



if(type==="paid"){


if(frame.owned){

status="use";

icon=`

<img
class="U9-owner-icon"
src="SVG/owner.svg"
>

`;

}
else{

status="buy";


icon=`

<img
class="U9-lock-icon"
src="SVG/lock.svg"
>

`;

}


}




div.innerHTML = `


<div class="U9-frame-image">


<img
src="SVG/frame/${frame.image}"
>


${icon}


</div>



<button>

${status}

</button>



`;



container.appendChild(div);


}






/* =================================================
   START
================================================= */


loadProfilePage3();
