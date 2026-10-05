/* =================================================
   PROFILE PAGE 3
   LOAD FREE AVATAR TEST
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
          method: "GET"
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

    }


  }
  catch(error) {

    console.error(
      "FREE AVATAR ERROR:",
      error
    );

  }

}


/* =================================================
   PAGE 3 LOAD
================================================= */

async function loadProfilePage3() {


  console.log(
    "PROFILE PAGE 3 LOADED"
  );


  await loadFreeAvatarTest();


}


/* =================================================
   AUTO LOAD
================================================= */

loadProfilePage3();
