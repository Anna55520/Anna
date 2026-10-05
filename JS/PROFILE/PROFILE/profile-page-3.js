/* =================================================
   PROFILE PAGE 3
   FREE AVATAR LOAD + RENDER
================================================= */


/* =========================
   API
========================= */

const U9_PROFILE_PAGE3_FREE_AVATAR_API =
  "https://tvtakmswbzawaweytimx.supabase.co/functions/v1/avatar-free";



/* =========================
   LOAD FREE AVATAR
========================= */

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



    if (
      result.success
    ) {


      console.log(
        "FREE AVATAR LIST:",
        result.avatars
      );



      renderFreeAvatars(
        result.avatars
      );


    }



  }


  catch(error) {


    console.error(
      "FREE AVATAR ERROR:",
      error
    );


  }


}




/* =========================
   RENDER FREE AVATAR
========================= */

function renderFreeAvatars(
  avatars
) {


  const container =
    document.getElementById(
      "U9-profile-page3-content"
    );



  if(
    !container
  ) {


    console.error(
      "PAGE 3 CONTENT NOT FOUND"
    );


    return;


  }



  container.innerHTML = "";




  avatars.forEach(
    (avatar)=>{


      const item =
        document.createElement(
          "div"
        );


      item.className =
        "U9-profile-page3-avatar-item";




      const img =
        document.createElement(
          "img"
        );



      /*
        Supabase svg 字段
        直接读取
      */

      const svgBlob =
        new Blob(
          [
            avatar.svg
          ],
          {
            type:
              "image/svg+xml"
          }
        );



      const svgUrl =
        URL.createObjectURL(
          svgBlob
        );



      img.src =
        svgUrl;



      img.alt =
        avatar.name;



      item.appendChild(
        img
      );



      container.appendChild(
        item
      );



    }
  );


}




/* =========================
   PAGE 3 LOAD
========================= */

async function loadProfilePage3() {


  console.log(
    "PROFILE PAGE 3 LOADED"
  );



  await loadFreeAvatarTest();


}





/* =========================
   AUTO LOAD
========================= */

loadProfilePage3();
