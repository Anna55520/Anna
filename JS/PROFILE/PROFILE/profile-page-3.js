
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
   GET SESSION TOKEN
========================= */

function getProfilePage3Token(){

  return localStorage.getItem(
    "u9_token"
  );

}



/* =========================
   LOAD CURRENT AVATAR

   TODO:
   后续接你的 avatar-current API
========================= */

async function loadCurrentAvatar(){

  /*
    暂时为空

    等你提供读取当前头像 API

    这里以后会设置：

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

  /* =========================
     PREVENT DUPLICATE CLICK
  ========================= */

  if(
    !button ||
    button.classList.contains(
      "loading"
    )
  ){

    return;

  }



  try{

    /* =========================
       GET TOKEN
    ========================= */

    const token =
      getProfilePage3Token();



    if(!token){

      console.error(
        "SET AVATAR: NO SESSION TOKEN"
      );

      throw new Error(
        "登录已失效，请重新登录"
      );

    }



    /* =========================
       BUTTON LOADING
    ========================= */

    button.classList.add(
      "loading"
    );



    button.disabled =
      true;



    button.textContent =
      "加载中...";



    /* =========================
       DEBUG SESSION
    ========================= */

    console.log(
      "SET AVATAR TOKEN:",
      {
        exists:
          !!token,

        length:
          token.length
      }
    );



    /* =========================
       REQUEST
    ========================= */

    const response =
      await fetch(

        U9_PROFILE_PAGE3_SET_AVATAR_API,

        {

          method:
            "POST",


          credentials:
            "include",


          headers:{

            "Content-Type":
              "application/json",


            "Authorization":
              `Bearer ${token}`

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



    /* =========================
       RESPONSE JSON
    ========================= */

    let result = null;


    try{

      result =
        await response.json();

    }
    catch(jsonError){

      console.error(
        "SET AVATAR JSON ERROR:",
        jsonError
      );

      throw new Error(
        `服务器返回无效数据 (${response.status})`
      );

    }



    /* =========================
       DEBUG RESULT
    ========================= */

    console.log(
      "SET AVATAR HTTP STATUS:",
      response.status
    );


    console.log(
      "SET AVATAR RESULT:",
      result
    );



    /* =========================
       AUTH ERROR
    ========================= */

    if(
      response.status === 401 ||
      response.status === 403
    ){

      console.error(
        "SET AVATAR AUTH ERROR:",
        result
      );

      throw new Error(
        result?.error ||
        "登录 Session 无效，请重新登录"
      );

    }



    /* =========================
       HTTP ERROR
    ========================= */

    if(
      !response.ok
    ){

      throw new Error(
        result?.error ||
        `Set avatar failed (${response.status})`
      );

    }



    /* =========================
       API ERROR
    ========================= */

    if(
      !result ||
      !result.success
    ){

      throw new Error(
        result?.error ||
        "Set avatar failed"
      );

    }



    /* =========================
       UPDATE CURRENT AVATAR
    ========================= */

    currentAvatarId =
      String(
        avatarId
      );



    /* =========================
       UPDATE BUTTONS
    ========================= */

    updateAvatarButtons();



    /* =========================
       SUCCESS
    ========================= */

    console.log(
      "AVATAR SET SUCCESS:",
      avatarId
    );



    /* =========================
       OPTIONAL PROFILE REFRESH
    ========================= */

    if(
      window.U9Profile &&
      typeof window.U9Profile.refresh ===
      "function"
    ){

      /*
        这里刷新 Profile 主资料。

        如果后面的 /me API 已经会返回
        最新 avatar，就会同步更新。
      */

      await window.U9Profile.refresh();

    }



  }
  catch(error){

    console.error(
      "SET AVATAR ERROR:",
      error
    );


    button.textContent =
      "失败";


    /*
      失败后允许重新点击
    */

    button.disabled =
      false;


    /*
      短暂显示失败状态
    */

    setTimeout(
      function(){

        if(
          button &&
          !button.classList.contains(
            "active"
          )
        ){

          button.textContent =
            "使用";

        }

      },
      1500
    );


  }
  finally{

    button.classList.remove(
      "loading"
    );


    /*
      如果当前按钮不是正在使用，
      恢复可点击状态
    */

    if(
      button.dataset.avatarId !==
      String(currentAvatarId)
    ){

      button.disabled =
        false;

    }

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
    function(button){

      const id =
        String(
          button.dataset.avatarId
        );



      if(
        id ===
        String(currentAvatarId)
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

    /* =========================
       REQUEST FREE AVATARS
    ========================= */

    const response =
      await fetch(

        U9_PROFILE_PAGE3_FREE_AVATAR_API,

        {

          method:
            "GET"

        }

      );



    /* =========================
       HTTP CHECK
    ========================= */

    if(
      !response.ok
    ){

      throw new Error(
        `Free avatar request failed (${response.status})`
      );

    }



    /* =========================
       JSON
    ========================= */

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
        result.error ||
        "Free avatar failed"
      );

    }



    /* =========================
       AVATAR LIST
    ========================= */

    const avatars =
      result.avatars ||
      [];



    profilePage3Content.innerHTML =
      "";



    const list =
      document.createElement(
        "div"
      );



    list.className =
      "U9-profile-page3-avatar-list";



    /* =========================
       CREATE CARDS
    ========================= */

    avatars.forEach(
      function(avatar){

        const card =
          document.createElement(
            "div"
          );



        card.className =
          "U9-profile-page3-avatar-card";



        /* =========================
           IMAGE
        ========================= */

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



        /* =========================
           NAME
        ========================= */

        const name =
          document.createElement(
            "div"
          );



        name.className =
          "U9-profile-page3-avatar-name";



        name.textContent =
          avatar.name ||
          "";



        /* =========================
           BUTTON
        ========================= */

        const button =
          document.createElement(
            "button"
          );



        button.className =
          "U9-profile-page3-avatar-button";



        button.dataset.avatarId =
          String(
            avatar.id
          );



        button.textContent =
          "使用";



        /* =========================
           CLICK
        ========================= */

        button.addEventListener(
          "click",
          function(){

            setFreeAvatar(
              avatar.id,
              button
            );

          }
        );



        /* =========================
           APPEND
        ========================= */

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



    /* =========================
       APPEND LIST
    ========================= */

    profilePage3Content.appendChild(
      list
    );



    /* =========================
       UPDATE BUTTONS
    ========================= */

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



  /* =========================
     LOAD CURRENT AVATAR
  ========================= */

  await loadCurrentAvatar();



  /* =========================
     LOAD FREE AVATARS
  ========================= */

  await loadFreeAvatar();

}



/* =========================
   START
========================= */

loadProfilePage3();
