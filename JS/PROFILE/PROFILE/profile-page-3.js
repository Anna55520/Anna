/* =================================================
   PROFILE PAGE 3
   FREE AVATAR DISPLAY TEST
================================================= */


/* =========================
   API
========================= */

const U9_PROFILE_PAGE3_FREE_AVATAR_API =
  "https://tvtakmswbzawaweytimx.supabase.co/functions/v1/avatar-free";


/* =========================
   ELEMENTS
========================= */

const profilePage3Content =
  document.getElementById(
    "U9-profile-page3-content"
  );


/* =========================
   LOAD FREE AVATAR
========================= */

async function loadFreeAvatar() {


  if(
    !profilePage3Content
  ){

    console.error(
      "PAGE3 CONTENT NOT FOUND"
    );

    return;

  }


  try {


    const response =
      await fetch(
        U9_PROFILE_PAGE3_FREE_AVATAR_API,
        {
          method:"GET"
        }
      );


    const result =
      await response.json();


    console.log(
      "FREE AVATAR RESULT:",
      result
    );


    if(
      !result.success
    ){

      throw new Error(
        "Free avatar failed"
      );

    }


    const avatars =
      result.avatars || [];


    console.log(
      "FREE AVATAR LIST:",
      avatars
    );


    /*
       CLEAR
    */

    profilePage3Content.innerHTML =
      "";


    /*
       CREATE LIST
    */

    const list =
      document.createElement(
        "div"
      );


    list.className =
      "U9-profile-page3-avatar-list";



    avatars.forEach(
      (avatar)=>{


        const card =
          document.createElement(
            "div"
          );


        card.className =
          "U9-profile-page3-avatar-card";



        const img =
          document.createElement(
            "img"
          );


        img.className =
          "U9-profile-page3-avatar-image";


        /*
          IMPORTANT

          USE SUPABASE SVG URL

        */

        img.src =
          avatar.svg;


        img.alt =
          avatar.name ||
          "avatar";


        img.draggable =
          false;



        const name =
          document.createElement(
            "div"
          );


        name.className =
          "U9-profile-page3-avatar-name";


        name.textContent =
          avatar.name;



        card.appendChild(
          img
        );


        card.appendChild(
          name
        );


        list.appendChild(
          card
        );


      }
    );



    profilePage3Content.appendChild(
      list
    );


  }
  catch(error){


    console.error(
      "FREE AVATAR ERROR:",
      error
    );


  }


}



/* =========================
   LOAD PAGE
========================= */

async function loadProfilePage3(){


  console.log(
    "PROFILE PAGE 3 LOADED"
  );


  await loadFreeAvatar();


}



/* =========================
   START
========================= */

loadProfilePage3();
