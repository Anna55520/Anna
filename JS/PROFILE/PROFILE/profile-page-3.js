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


    /* =========================
       GET CURRENT SESSION
    ========================= */

    const {
      data: sessionData,
      error: sessionError
    } =
      await supabase.auth.getSession();


    if(sessionError){

      console.error(
        "GET SESSION ERROR:",
        sessionError
      );

      throw new Error(
        "无法获取登录状态"
      );

    }


    const session =
      sessionData?.session;


    if(!session){

      console.error(
        "NO ACTIVE SESSION"
      );

      throw new Error(
        "登录已失效，请重新登录"
      );

    }


    console.log(
      "AVATAR SET SESSION:",
      {
        userId:
          session.user?.id,

        hasAccessToken:
          !!session.access_token
      }
    );


    /* =========================
       SEND REQUEST
    ========================= */

    const response =
      await fetch(

        U9_PROFILE_PAGE3_SET_AVATAR_API,

        {

          method:"POST",

          credentials:"include",

          headers:{

            "Content-Type":
              "application/json",

            "Authorization":
              `Bearer ${session.access_token}`

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
       READ RESPONSE
    ========================= */

    const result =
      await response.json();


    console.log(
      "SET AVATAR HTTP STATUS:",
      response.status
    );


    console.log(
      "SET AVATAR RESULT:",
      result
    );


    /* =========================
       CHECK HTTP ERROR
    ========================= */

    if(!response.ok){

      throw new Error(
        result?.error ||
        `Set avatar failed (${response.status})`
      );

    }


    /* =========================
       CHECK API RESULT
    ========================= */

    if(
      !result.success
    ){

      throw new Error(
        result.error ||
        "Set avatar failed"
      );

    }


    /* =========================
       SUCCESS
    ========================= */

    currentAvatarId =
      avatarId;


    updateAvatarButtons();


    console.log(
      "AVATAR SET SUCCESS:",
      avatarId
    );


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
