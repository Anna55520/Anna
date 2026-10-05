/* =================================================
   PROFILE PAGE 3
   FREE AVATAR SELECT
================================================= */


/* =========================
   API
========================= */

const U9_PROFILE_PAGE3_FREE_AVATAR_API =
  "https://tvtakmswbzawaweytimx.supabase.co/functions/v1/avatar-free";


const U9_PROFILE_PAGE3_SET_AVATAR_API =
  "https://tvtakmswbzawaweytimx.supabase.co/functions/v1/avatar-set";



/* =========================
   ELEMENTS
========================= */

const profilePage3Content =
  document.getElementById(
    "U9-profile-page3-content"
  );



/* =========================
   CURRENT AVATAR
========================= */

let currentAvatarId = null;



/* =========================
   LOAD CURRENT AVATAR

   TODO:
   后续接你的 avatar-current API

========================= */

async function loadCurrentAvatar(){

  /*
    暂时为空

    等你提供读取当前头像 API

    这里会返回：

    currentAvatarId =
    user_avatar.avatar_id

  */

}



/* =========================
   SET FREE AVATAR
========================= */

async function setFreeAvatar(
  avatarId,
  button
){


  try {


    button.classList.add(
      "loading"
    );


    button.textContent =
      "加载中...";


    const sessionToken =
      localStorage.getItem(
        "u9_session"
      );



    const response =
      await fetch(

        U9_PROFILE_PAGE3_SET_AVATAR_API,

        {

          method:"POST",

          credentials:"include",

          headers:{


            "Content-Type":
              "application/json",



            ...(sessionToken && {

              Authorization:
                `Bearer ${sessionToken}`

            })


          },


          body:
            JSON.stringify({

              type:
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
      !result.success
    ){

      throw new Error(
        result.error ||
        "Set avatar failed"
      );

    }



    currentAvatarId =
      avatarId;



    updateAvatarButtons();



  }
  catch(error){


    console.error(
      "SET AVATAR ERROR:",
      error
    );


    button.textContent =
      "失败";


  }
  finally{


    button.classList.remove(
      "loading"
    );


  }


}



/* =========================
   UPDATE BUTTON STATUS
========================= */

function updateAvatarButtons(){


  const buttons =
    document.querySelectorAll(
      ".U9-profile-page3-avatar-button"
    );



  buttons.forEach(
    (button)=>{


      const id =
        button.dataset.avatarId;



      if(
        id === currentAvatarId
      ){


        button.textContent =
          "正在使用";


        button.classList.add(
          "active"
        );


        button.disabled =
          true;


      }
      else{


        button.textContent =
          "使用";


        button.classList.remove(
          "active"
        );


        button.disabled =
          false;


      }


    }

  );


}



/* =========================
   LOAD FREE AVATAR
========================= */

async function loadFreeAvatar(){


  if(
    !profilePage3Content
  ){

    console.error(
      "PAGE3 CONTENT NOT FOUND"
    );

    return;

  }



  try{


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



    profilePage3Content.innerHTML =
      "";



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



        const button =
          document.createElement(
            "button"
          );



        button.className =
          "U9-profile-page3-avatar-button";



        button.dataset.avatarId =
          avatar.id;



        button.textContent =
          "使用";



        button.addEventListener(
          "click",
          ()=>{


            setFreeAvatar(
              avatar.id,
              button
            );


          }

        );



        card.appendChild(
          img
        );


        card.appendChild(
          name
        );


        card.appendChild(
          button
        );


        list.appendChild(
          card
        );


      }

    );



    profilePage3Content.appendChild(
      list
    );



    updateAvatarButtons();



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


  await loadCurrentAvatar();


  await loadFreeAvatar();


}



/* =========================
   START
========================= */

loadProfilePage3();
