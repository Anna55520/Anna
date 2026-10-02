
/* =========================
   U9 PROFILE AVATAR
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
   DEFAULT
========================= */

const u9ProfileAvatarPlaceholder =
  "SSVG/avatar/profile.svg";


const u9ProfileAvatarFramePlaceholder =
  "SSVG/avatar/ordinary.svg";


/* =========================
   API
========================= */

const u9ProfileAvatarDefaultFrameUrl =
  "https://tvtakmswbzawaweytimx.supabase.co/functions/v1/avatar-frame-default";


const u9ProfileAvatarFreeFrameUrl =
  "https://tvtakmswbzawaweytimx.supabase.co/functions/v1/avatar-frame-free";


const u9ProfileAvatarPaidFrameUrl =
  "https://tvtakmswbzawaweytimx.supabase.co/functions/v1/avatar-frame-paid";


/* =========================
   RESET AVATAR
========================= */

function u9ProfileResetAvatar() {

  if (!u9ProfileAvatarImage) {
    return;
  }


  u9ProfileAvatarImage.src =
    u9ProfileAvatarPlaceholder;

}


/* =========================
   RESET AVATAR FRAME
========================= */

function u9ProfileResetAvatarFrame() {

  if (!u9ProfileAvatarFrame) {
    return;
  }


  u9ProfileAvatarFrame.src =
    u9ProfileAvatarFramePlaceholder;

}


/* =========================
   SET AVATAR
========================= */

function u9ProfileSetAvatar(
  user
) {

  if (!u9ProfileAvatarImage) {
    return;
  }


  /* =========================
     DEFAULT AVATAR
  ========================= */

  u9ProfileAvatarImage.src =
    u9ProfileAvatarPlaceholder;


  if (!user) {
    return;
  }


  /* =========================
     USER AVATAR
  ========================= */

  const avatar =
    user.avatar ||
    null;


  const avatarUrl =
    avatar?.url ||
    "";


  if (!avatarUrl) {
    return;
  }


  /* =========================
     SET USER AVATAR
  ========================= */

  u9ProfileAvatarImage.src =
    avatarUrl;

}


/* =========================
   LOAD CURRENT FRAME
========================= */

async function u9ProfileLoadCurrentFrame(
  user
) {

  if (!u9ProfileAvatarFrame) {
    return;
  }


  /* =========================
     DEFAULT FRAME
  ========================= */

  u9ProfileAvatarFrame.src =
    u9ProfileAvatarFramePlaceholder;


  if (!user) {
    return;
  }


  /* =========================
     DIRECT FRAME URL
  ========================= */

  const directFrameUrl =
    user.avatar_frame_svg ||
    user.avatar_frame_url ||
    user.frame_url ||
    "";


  if (directFrameUrl) {

    u9ProfileAvatarFrame.src =
      directFrameUrl;

    return;

  }


  /* =========================
     FRAME TYPE / ID
  ========================= */

  const frameType =
    user.avatar_frame_type ||
    "default";


  const frameId =
    user.avatar_frame_id ||
    null;


  if (!frameId) {
    return;
  }


  /* =========================
     REQUEST
  ========================= */

  try {

    let requestUrl =
      u9ProfileAvatarDefaultFrameUrl;


    let headers = {};


    /* =========================
       DEFAULT
    ========================= */

    if (
      frameType ===
      "default"
    ) {

      requestUrl =
        u9ProfileAvatarDefaultFrameUrl;

    }


    /* =========================
       FREE
    ========================= */

    else if (
      frameType ===
      "free"
    ) {

      requestUrl =
        u9ProfileAvatarFreeFrameUrl;

    }


    /* =========================
       PAID
    ========================= */

    else if (
      frameType ===
      "paid"
    ) {

      requestUrl =
        u9ProfileAvatarPaidFrameUrl;


      const sessionToken =
        localStorage.getItem(
          "u9_session"
        );


      if (sessionToken) {

        headers = {

          "Authorization":
            `Bearer ${sessionToken}`

        };

      }

    }


    /* =========================
       FETCH FRAME DATA
    ========================= */

    const response =
      await fetch(
        requestUrl,
        {

          method:
            "GET",

          headers

        }
      );


    /* =========================
       REQUEST FAILED
    ========================= */

    if (!response.ok) {
      return;
    }


    /* =========================
       JSON
    ========================= */

    const result =
      await response.json();


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


    if (!currentFrame) {
      return;
    }


    if (!currentFrame.svg) {
      return;
    }


    /* =========================
       SET FRAME
    ========================= */

    u9ProfileAvatarFrame.src =
      currentFrame.svg;

  }

  catch (error) {

    console.error(
      "Failed to load profile avatar frame:",
      error
    );

  }

}


/* =========================
   LOAD AVATAR + FRAME
========================= */

async function u9ProfileLoadAvatar(
  user
) {

  /* =========================
     AVATAR
  ========================= */

  u9ProfileSetAvatar(
    user
  );


  /* =========================
     FRAME
  ========================= */

  await u9ProfileLoadCurrentFrame(
    user
  );

}


/* =========================
   GLOBAL PROFILE AVATAR API
========================= */

window.U9Avatar = {

  load:
    u9ProfileLoadAvatar,

  loadAvatar:
    u9ProfileSetAvatar,

  loadFrame:
    u9ProfileLoadCurrentFrame,

  resetAvatar:
    u9ProfileResetAvatar,

  resetFrame:
    u9ProfileResetAvatarFrame

};
