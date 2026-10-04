/* =================================================
   PROFILE PAGE 2 JS


   IMPORTANT:

   This file controls:

   #U9-profile-page2


   Profile Header is controlled by:

   CSS/PROFILE/PROFILE/profile.css


================================================= */


const u9ProfilePage2 =
  document.getElementById(
    "U9-profile-page2"
  );


const u9ProfilePage2Content =
  document.getElementById(
    "U9-profile-page2-content"
  );



function openProfilePage2(){

  if(
    u9ProfilePage2
  ){

    u9ProfilePage2.style.display =
      "block";

  }

}



function closeProfilePage2(){

  if(
    u9ProfilePage2
  ){

    u9ProfilePage2.style.display =
      "none";

  }

}



window.U9ProfilePage2 = {

  open:
    openProfilePage2,

  close:
    closeProfilePage2

};
