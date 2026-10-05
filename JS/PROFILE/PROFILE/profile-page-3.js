/* =================================================
   PROFILE PAGE 3

   LOAD FREE AVATAR

   DATA SOURCE:

   Supabase Edge Function

   /avatar-free


   avatar_free.svg

   is STORAGE URL

   NOT SVG CODE


================================================= */


/* =================================================
   API
================================================= */

const U9_PROFILE_PAGE3_FREE_AVATAR_API =
  "https://tvtakmswbzawaweytimx.supabase.co/functions/v1/avatar-free";



/* =================================================
   LOAD FREE AVATAR
================================================= */

async function loadFreeAvatarTest() {


  try {


    const response =
      await fetch(

        U9_PROFILE_PAGE3_FREE_AVATAR_API,

        {
          method:
            "GET"
        }

      );



    const result =
      await response.json();



    console.log(
      "FREE AVATAR RESULT:",
      result
    );



    if(
      result.success
    ){


      console.log(
        "FREE AVATAR LIST:",
        result.avatars
      );



      renderFreeAvatars(
        result.avatars
      );


    }



  }


  catch(error){


    console.error(
      "FREE AVATAR ERROR:",
      error
    );


  }


}



/* =================================================
   RENDER FREE AVATAR
================================================= */

function renderFreeAvatars(
  avatars
){


  const container =
    document.getElementById(
      "U9-profile-page3-content"
    );



  if(
    !container
  ){


    console.error(
      "PAGE 3 CONTENT NOT FOUND"
    );


    return;


  }



  container.innerHTML =
    "";



  avatars.forEach(
    (avatar)=>{


      /* =========================
         ITEM
      ========================= */

      const item =
        document.createElement(
          "div"
        );



      item.className =
        "U9-profile-page3-avatar-item";




      /* =========================
         IMAGE

         avatar.svg

         = Storage URL

      ========================= */

      const img =
        document.createElement(
          "img"
        );



      img.src =
        avatar.svg;



      img.alt =
        avatar.name;



      img.loading =
        "lazy";



      img.onload =
        ()=>{


          console.log(
            "SVG LOADED:",
            avatar.name
          );


        };



      img.onerror =
        ()=>{


          console.error(
            "SVG LOAD ERROR:",
            avatar.svg
          );


        };




      item.appendChild(
        img
      );



      container.appendChild(
        item
      );



    }
  );


}




/* =================================================
   PAGE 3 LOAD
================================================= */

async function loadProfilePage3(){


  console.log(
    "PROFILE PAGE 3 LOADED"
  );



  await loadFreeAvatarTest();


}



/* =================================================
   AUTO LOAD
================================================= */

loadProfilePage3();
