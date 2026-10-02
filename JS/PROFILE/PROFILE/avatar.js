```js
/* =========================
   U9 PROFILE AVATAR
   AVATAR + FRAME ONLY
========================= */


/* =========================
   ELEMENTS
========================= */

const u9ProfileAvatarImage =
  document.getElementById(
    "U9-profile-avatar-image"
  );


const u9ProfileAvatarFrame =
  document.getElementById(
    "U9-profile-avatar-frame"
  );


/* =========================
   API
========================= */

const u9ProfileMeUrl =
  "https://tvtakmswbzawaweytimx.supabase.co/functions/v1/me";


const u9ProfileDefaultFrameUrl =
  "https://tvtakmswbzawaweytimx.supabase.co/functions/v1/avatar-frame-default";


const u9ProfileFreeFrameUrl =
  "https://tvtakmswbzawaweytimx.supabase.co/functions/v1/avatar-frame-free";


const u9ProfilePaidFrameUrl =
  "https://tvtakmswbzawaweytimx.supabase.co/functions/v1/avatar-frame-paid";


/* =========================
   DEFAULT AVATAR
========================= */

const u9ProfileDefaultAvatar =
  "SSVG/avatar/profile.svg";


/* =========================
   DEFAULT FRAME
========================= */

const u9ProfileDefaultFrame =
  "SSVG/avatar/ordinary.svg";


/* =========================
   RESET AVATAR
========================= */

function u9ProfileResetAvatar() {

  if (
    u9ProfileAvatarImage
  ) {

    u9ProfileAvatarImage.src =
      u9ProfileDefaultAvatar;

  }


  if (
    u9ProfileAvatarFrame
  ) {

    u9ProfileAvatarFrame.src =
      u9ProfileDefaultFrame;

  }

}


/* =========================
   LOAD FREE / PAID FRAME
========================= */

async function u9ProfileLoadFrame(
  frameType,
  frameId
) {

  /* =========================
     DEFAULT FRAME
  ========================= */

  if (
    !frameType ||
    frameType === "default"
  ) {

    u9ProfileAvatarFrame.src =
      u9ProfileDefaultFrame;

    return;

  }


  /* =========================
     FRAME ID REQUIRED
  ========================= */

  if (!frameId) {

    u9ProfileAvatarFrame.src =
      u9ProfileDefaultFrame;

    return;

  }


  /* =========================
     SELECT API
  ========================= */

  let requestUrl =
    "";


  if (
    frameType === "free"
  ) {

    requestUrl =
      u9ProfileFreeFrameUrl;

  }


  else if (
    frameType === "paid"
  ) {

    requestUrl =
      u9ProfilePaidFrameUrl;

  }


  else {

    u9ProfileAvatarFrame.src =
      u9ProfileDefaultFrame;

    return;

  }


  try {

    /* =========================
       REQUEST FRAME

       不使用 credentials
       避免 wildcard CORS
    ========================= */

    const response =
      await fetch(
        requestUrl,
        {
          method: "GET"
        }
      );


    /* =========================
       REQUEST FAILED
    ========================= */

    if (
      !response.ok
    ) {

      console.error(
        "Failed to load profile frame:",
        response.status
      );

      u9ProfileAvatarFrame.src =
        u9ProfileDefaultFrame;

      return;

    }


    /* =========================
       JSON
    ========================= */

    const result =
      await response.json();


    /* =========================
       GET FRAMES
    ========================= */

    const frames =
      result.frames ||
      result.data?.frames ||
      [];


    /* =========================
       FIND CURRENT FRAME
    ========================= */

    const currentFrame =
      frames.find(
        (frame) =>
          frame.id === frameId
      );


    /* =========================
       FRAME NOT FOUND
    ========================= */

    if (
      !currentFrame
    ) {

      console.warn(
        "Profile frame not found:",
        frameId
      );

      u9ProfileAvatarFrame.src =
        u9ProfileDefaultFrame;

      return;

    }


    /* =========================
       SVG REQUIRED
    ========================= */

    if (
      !currentFrame.svg
    ) {

      console.warn(
        "Profile frame SVG not found:",
        frameId
      );

      u9ProfileAvatarFrame.src =
        u9ProfileDefaultFrame;

      return;

    }


    /* =========================
       DISPLAY FRAME
    ========================= */

    u9ProfileAvatarFrame.src =
      currentFrame.svg;


    console.log(
      "Profile Frame Loaded:",
      currentFrame
    );

  }

  catch (error) {

    console.error(
      "Load profile frame failed:",
      error
    );


    u9ProfileAvatarFrame.src =
      u9ProfileDefaultFrame;

  }

}


/* =========================
   LOAD PROFILE AVATAR
========================= */

async function u9ProfileLoadAvatar() {

  /* =========================
     RESET FIRST
  ========================= */

  u9ProfileResetAvatar();


  /* =========================
     GET SESSION
  ========================= */

  const sessionToken =
    localStorage.getItem(
      "u9_session"
    );


  /* =========================
     NO SESSION
  ========================= */

  if (
    !sessionToken
  ) {

    return;

  }


  try {

    /* =========================
       REQUEST /ME
    ========================= */

    const response =
      await fetch(
        u9ProfileMeUrl,
        {

          method:
            "GET",

          headers: {

            "Authorization":
              `Bearer ${sessionToken}`

          }

        }
      );


    /* =========================
       ME FAILED
    ========================= */

    if (
      !response.ok
    ) {

      console.warn(
        "Profile /me request failed:",
        response.status
      );

      return;

    }


    /* =========================
       JSON
    ========================= */

    const result =
      await response.json();


    /* =========================
       GET USER
    ========================= */

    const user =
      result.user ||
      result.data?.user ||
      result;


    if (
      !user
    ) {

      return;

    }


    /* =========================
       AVATAR
    ========================= */

    const avatar =
      user.avatar ||
      null;


    const avatarUrl =
      avatar?.url ||
      "";


    if (
      avatarUrl
    ) {

      u9ProfileAvatarImage.src =
        avatarUrl;

    }

    else {

      u9ProfileAvatarImage.src =
        u9ProfileDefaultAvatar;

    }


    /* =========================
       FRAME
    ========================= */

    const frameType =
      user.avatar_frame_type ||
      "default";


    const frameId =
      user.avatar_frame_id ||
      null;


    await u9ProfileLoadFrame(
      frameType,
      frameId
    );


    /* =========================
       DEBUG
    ========================= */

    console.log(
      "Profile Avatar Loaded:",
      user
    );

  }

  catch (error) {

    console.error(
      "Load profile avatar failed:",
      error
    );


    u9ProfileResetAvatar();

  }

}


/* =========================
   INITIAL LOAD
========================= */

u9ProfileLoadAvatar();


/* =========================
   GLOBAL API
========================= */

window.U9ProfileAvatar = {

  load:
    u9ProfileLoadAvatar

};
```
