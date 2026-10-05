
/* =========================================================
   PROFILE PAGE 3
   PART 1/3
   CUSTOM AVATAR

   FLOW:
   Choose Image
        ↓
   Manual Crop Editor
        ↓
   Drag / Zoom
        ↓
   Confirm Crop
        ↓
   Crop Canvas
        ↓
   Convert Cropped Result to WebP
        ↓
   Upload avatar.webp
========================================================= */

"use strict";


/* =========================================================
   API
========================================================= */

const U9_PROFILE_PAGE3_UPLOAD_AVATAR_API =
  "https://tvtakmswbzawaweytimx.supabase.co/functions/v1/avatar-upload";


/* =========================================================
   CONFIG
========================================================= */

const U9_PROFILE_PAGE3_MAX_AVATAR_SIZE =
  2 * 1024 * 1024;

const U9_PROFILE_PAGE3_CROP_SIZE =
  512;

const U9_PROFILE_PAGE3_MIN_ZOOM =
  1;

const U9_PROFILE_PAGE3_MAX_ZOOM =
  4;


/* =========================================================
   STATE
========================================================= */

let page3AvatarType =
  "free";

let page3AvatarId =
  null;

let page3AvatarUrl =
  null;

let page3AvatarCooldownUntil =
  null;

let page3UploadAvatarFile =
  null;


/* =========================================================
   TOKEN
========================================================= */

function getPage3AvatarToken() {

  try {

    return localStorage.getItem(
      "u9_token"
    );

  } catch (error) {

    console.error(
      "PAGE3 AVATAR TOKEN ERROR:",
      error
    );

    return null;

  }

}


/* =========================================================
   LOGIN
========================================================= */

function page3AvatarIsLoggedIn() {

  if (
    window.U9User &&
    typeof window.U9User.isLoggedIn ===
      "function"
  ) {

    return window.U9User.isLoggedIn();

  }

  return !!getPage3AvatarToken();

}


/* =========================================================
   LOAD CURRENT AVATAR STATE
========================================================= */

function loadPage3AvatarState(
  user = null
) {

  if (!user) {

    if (
      window.U9User &&
      typeof window.U9User.get ===
        "function"
    ) {

      user =
        window.U9User.get();

    }

  }


  if (!user) {
    return;
  }


  page3AvatarType =
    user?.avatar?.type ||
    user?.avatar?.avatar_type ||
    user?.avatar_type ||
    "free";


  page3AvatarId =
    user?.avatar?.id ??
    user?.avatar?.avatar_id ??
    user?.avatar_id ??
    null;


  page3AvatarUrl =
    user?.avatar?.url ||
    user?.avatar?.avatar_url ||
    user?.avatar_url ||
    null;


  page3AvatarCooldownUntil =
    user?.avatar?.cooldown_until ||
    user?.avatar?.cooldownUntil ||
    user?.cooldown_until ||
    user?.avatar_cooldown_until ||
    null;

}


/* =========================================================
   COOLDOWN
========================================================= */

function isPage3AvatarUploadOnCooldown() {

  if (!page3AvatarCooldownUntil) {
    return false;
  }


  const time =
    new Date(
      page3AvatarCooldownUntil
    ).getTime();


  if (!Number.isFinite(time)) {
    return false;
  }


  return Date.now() < time;

}


/* =========================================================
   FORMAT COOLDOWN
========================================================= */

function formatPage3AvatarCooldown() {

  if (!page3AvatarCooldownUntil) {
    return "";
  }


  const cooldownTime =
    new Date(
      page3AvatarCooldownUntil
    ).getTime();


  if (!Number.isFinite(cooldownTime)) {
    return "";
  }


  const remaining =
    Math.max(
      0,
      cooldownTime - Date.now()
    );


  if (remaining <= 0) {
    return "";
  }


  const totalMinutes =
    Math.ceil(
      remaining / 60000
    );


  const days =
    Math.floor(
      totalMinutes / 1440
    );


  const hours =
    Math.floor(
      (totalMinutes % 1440) / 60
    );


  const minutes =
    totalMinutes % 60;


  if (days > 0) {

    return `${days}d ${hours}h`;

  }


  if (hours > 0) {

    return `${hours}h ${minutes}m`;

  }


  return `${minutes}m`;

}


/* =========================================================
   REFRESH USER / AVATAR
========================================================= */

async function refreshPage3AvatarState() {

  try {

    let user = null;


    if (
      window.U9User &&
      typeof window.U9User.refresh ===
        "function"
    ) {

      user =
        await window.U9User.refresh();

    }


    loadPage3AvatarState(
      user
    );


    if (
      window.U9Profile &&
      typeof window.U9Profile.refreshAvatar ===
        "function"
    ) {

      await window.U9Profile.refreshAvatar();

    }


    return true;

  } catch (error) {

    console.error(
      "PAGE3 AVATAR REFRESH ERROR:",
      error
    );

    return false;

  }

}


/* =========================================================
   IMAGE LOADER
========================================================= */

function loadPage3Image(
  file
) {

  return new Promise(
    function(resolve, reject) {

      const objectUrl =
        URL.createObjectURL(
          file
        );


      const image =
        new Image();


      image.onload =
        function() {

          URL.revokeObjectURL(
            objectUrl
          );


          resolve(
            image
          );

        };


      image.onerror =
        function(error) {

          URL.revokeObjectURL(
            objectUrl
          );


          reject(
            error
          );

        };


      image.src =
        objectUrl;

    }
  );

}


/* =========================================================
   MANUAL CROP EDITOR
========================================================= */

function openPage3AvatarCropper(
  file
) {

  return new Promise(
    async function(resolve) {

      let image;

      try {

        image =
          await loadPage3Image(
            file
          );

      } catch (error) {

        console.error(
          "PAGE3 IMAGE LOAD ERROR:",
          error
        );

        resolve(null);

        return;

      }


      const imageWidth =
        image.naturalWidth ||
        image.width;


      const imageHeight =
        image.naturalHeight ||
        image.height;


      if (
        !imageWidth ||
        !imageHeight
      ) {

        resolve(null);

        return;

      }


      /* ===================================================
         CROP EDITOR STATE
      =================================================== */

      let zoom =
        1;

      let offsetX =
        0;

      let offsetY =
        0;

      let dragging =
        false;

      let dragStartX =
        0;

      let dragStartY =
        0;

      let startOffsetX =
        0;

      let startOffsetY =
        0;

      let completed =
        false;


      /* ===================================================
         BASE SCALE

         Make sure the entire 512 × 512 crop area
         is covered by the image.
      =================================================== */

      const baseScale =
        Math.max(
          U9_PROFILE_PAGE3_CROP_SIZE /
            imageWidth,

          U9_PROFILE_PAGE3_CROP_SIZE /
            imageHeight
        );


      const initialWidth =
        imageWidth *
        baseScale;


      const initialHeight =
        imageHeight *
        baseScale;


      offsetX =
        (
          U9_PROFILE_PAGE3_CROP_SIZE -
          initialWidth
        ) / 2;


      offsetY =
        (
          U9_PROFILE_PAGE3_CROP_SIZE -
          initialHeight
        ) / 2;


      /* ===================================================
         MODAL
      =================================================== */

      const modal =
        document.createElement(
          "div"
        );


      modal.id =
        "U9-profile-page3-avatar-cropper";


      Object.assign(
        modal.style,
        {
          position:
            "fixed",

          inset:
            "0",

          zIndex:
            "999999",

          display:
            "flex",

          alignItems:
            "center",

          justifyContent:
            "center",

          padding:
            "16px",

          boxSizing:
            "border-box",

          background:
            "rgba(0, 0, 0, 0.82)"
        }
      );


      /* ===================================================
         EDITOR PANEL
      =================================================== */

      const editor =
        document.createElement(
          "div"
        );


      Object.assign(
        editor.style,
        {
          width:
            "min(560px, 100%)",

          maxHeight:
            "calc(100vh - 32px)",

          overflowY:
            "auto",

          boxSizing:
            "border-box",

          padding:
            "20px",

          background:
            "#ffffff",

          borderRadius:
            "18px",

          boxShadow:
            "0 20px 70px rgba(0,0,0,0.45)"
        }
      );


      modal.appendChild(
        editor
      );


      /* ===================================================
         TITLE
      =================================================== */

      const title =
        document.createElement(
          "div"
        );


      title.textContent =
        "Edit Avatar";


      Object.assign(
        title.style,
        {
          fontSize:
            "21px",

          fontWeight:
            "700",

          color:
            "#111111",

          marginBottom:
            "6px"
        }
      );


      editor.appendChild(
        title
      );


      /* ===================================================
         INSTRUCTION
      =================================================== */

      const instruction =
        document.createElement(
          "div"
        );


      instruction.textContent =
        "Drag the image to adjust the position. Use the zoom control to adjust the size.";


      Object.assign(
        instruction.style,
        {
          fontSize:
            "14px",

          lineHeight:
            "1.5",

          color:
            "#666666",

          marginBottom:
            "18px"
        }
      );


      editor.appendChild(
        instruction
      );


      /* ===================================================
         CROP VIEWPORT
      =================================================== */

      const viewportWrapper =
        document.createElement(
          "div"
        );


      Object.assign(
        viewportWrapper.style,
        {
          width:
            "100%",

          display:
            "flex",

          justifyContent:
            "center",

          marginBottom:
            "18px"
        }
      );


      editor.appendChild(
        viewportWrapper
      );


      const viewport =
        document.createElement(
          "div"
        );


      Object.assign(
        viewport.style,
        {
          position:
            "relative",

          width:
            "min(512px, 100%)",

          aspectRatio:
            "1 / 1",

          overflow:
            "hidden",

          background:
            "#111111",

          borderRadius:
            "12px",

          cursor:
            "grab",

          touchAction:
            "none",

          userSelect:
            "none"
        }
      );


      viewportWrapper.appendChild(
        viewport
      );


      /* ===================================================
         CANVAS
      =================================================== */

      const canvas =
        document.createElement(
          "canvas"
        );


      canvas.width =
        U9_PROFILE_PAGE3_CROP_SIZE;


      canvas.height =
        U9_PROFILE_PAGE3_CROP_SIZE;


      Object.assign(
        canvas.style,
        {
          width:
            "100%",

          height:
            "100%",

          display:
            "block",

          pointerEvents:
            "none"
        }
      );


      viewport.appendChild(
        canvas
      );


      const ctx =
        canvas.getContext(
          "2d"
        );


      if (!ctx) {

        resolve(null);

        return;

      }


      /* ===================================================
         CROP CIRCLE
      =================================================== */

      const cropCircle =
        document.createElement(
          "div"
        );


      Object.assign(
        cropCircle.style,
        {
          position:
            "absolute",

          inset:
            "0",

          borderRadius:
            "50%",

          border:
            "2px solid rgba(255,255,255,0.95)",

          boxShadow:
            "0 0 0 9999px rgba(0,0,0,0.38)",

          pointerEvents:
            "none",

          boxSizing:
            "border-box"
        }
      );


      viewport.appendChild(
        cropCircle
      );


      /* ===================================================
         DRAW
      =================================================== */

      function constrainPosition() {

        const scale =
          baseScale *
          zoom;


        const width =
          imageWidth *
          scale;


        const height =
          imageHeight *
          scale;


        const minX =
          U9_PROFILE_PAGE3_CROP_SIZE -
          width;


        const minY =
          U9_PROFILE_PAGE3_CROP_SIZE -
          height;


        if (
          width <=
          U9_PROFILE_PAGE3_CROP_SIZE
        ) {

          offsetX =
            (
              U9_PROFILE_PAGE3_CROP_SIZE -
              width
            ) / 2;

        } else {

          offsetX =
            Math.min(
              0,
              Math.max(
                minX,
                offsetX
              )
            );

        }


        if (
          height <=
          U9_PROFILE_PAGE3_CROP_SIZE
        ) {

          offsetY =
            (
              U9_PROFILE_PAGE3_CROP_SIZE -
              height
            ) / 2;

        } else {

          offsetY =
            Math.min(
              0,
              Math.max(
                minY,
                offsetY
              )
            );

        }

      }


      function draw() {

        constrainPosition();


        ctx.clearRect(
          0,
          0,
          U9_PROFILE_PAGE3_CROP_SIZE,
          U9_PROFILE_PAGE3_CROP_SIZE
        );


        ctx.fillStyle =
          "#111111";


        ctx.fillRect(
          0,
          0,
          U9_PROFILE_PAGE3_CROP_SIZE,
          U9_PROFILE_PAGE3_CROP_SIZE
        );


        const scale =
          baseScale *
          zoom;


        const width =
          imageWidth *
          scale;


        const height =
          imageHeight *
          scale;


        ctx.drawImage(
          image,
          offsetX,
          offsetY,
          width,
          height
        );

      }


      /* ===================================================
         ZOOM CONTROL
      =================================================== */

      const zoomSection =
        document.createElement(
          "div"
        );


      editor.appendChild(
        zoomSection
      );


      const zoomTop =
        document.createElement(
          "div"
        );


      Object.assign(
        zoomTop.style,
        {
          display:
            "flex",

          alignItems:
            "center",

          justifyContent:
            "space-between",

          marginBottom:
            "8px"
        }
      );


      zoomSection.appendChild(
        zoomTop
      );


      const zoomLabel =
        document.createElement(
          "span"
        );


      zoomLabel.textContent =
        "Zoom";


      Object.assign(
        zoomLabel.style,
        {
          fontSize:
            "14px",

          fontWeight:
            "600",

          color:
            "#222222"
        }
      );


      zoomTop.appendChild(
        zoomLabel
      );


      const zoomValue =
        document.createElement(
          "span"
        );


      zoomValue.textContent =
        "100%";


      Object.assign(
        zoomValue.style,
        {
          fontSize:
            "13px",

          color:
            "#666666"
        }
      );


      zoomTop.appendChild(
        zoomValue
      );


      const zoomInput =
        document.createElement(
          "input"
        );


      zoomInput.type =
        "range";


      zoomInput.min =
        String(
          U9_PROFILE_PAGE3_MIN_ZOOM
        );


      zoomInput.max =
        String(
          U9_PROFILE_PAGE3_MAX_ZOOM
        );


      zoomInput.step =
        "0.01";


      zoomInput.value =
        String(
          zoom
        );


      zoomInput.style.width =
        "100%";


      zoomSection.appendChild(
        zoomInput
      );


      zoomInput.addEventListener(
        "input",
        function() {

          const oldZoom =
            zoom;


          const newZoom =
            Number(
              zoomInput.value
            );


          const center =
            U9_PROFILE_PAGE3_CROP_SIZE /
            2;


          const oldScale =
            baseScale *
            oldZoom;


          const newScale =
            baseScale *
            newZoom;


          /*
           * Keep the image point under
           * the crop center while zooming.
           */

          const imagePointX =
            (
              center -
              offsetX
            ) /
            oldScale;


          const imagePointY =
            (
              center -
              offsetY
            ) /
            oldScale;


          offsetX =
            center -
            imagePointX *
            newScale;


          offsetY =
            center -
            imagePointY *
            newScale;


          zoom =
            newZoom;


          zoomValue.textContent =
            `${Math.round(
              zoom * 100
            )}%`;


          draw();

        }
      );


      /* ===================================================
         MOUSE DRAG
      =================================================== */

      viewport.addEventListener(
        "mousedown",
        function(event) {

          if (
            event.button !== 0
          ) {
            return;
          }


          dragging =
            true;


          dragStartX =
            event.clientX;


          dragStartY =
            event.clientY;


          startOffsetX =
            offsetX;


          startOffsetY =
            offsetY;


          viewport.style.cursor =
            "grabbing";


          event.preventDefault();

        }
      );


      function mouseMove(
        event
      ) {

        if (!dragging) {
          return;
        }


        offsetX =
          startOffsetX +
          (
            event.clientX -
            dragStartX
          );


        offsetY =
          startOffsetY +
          (
            event.clientY -
            dragStartY
          );


        draw();

      }


      function mouseUp() {

        dragging =
          false;


        viewport.style.cursor =
          "grab";

      }


      window.addEventListener(
        "mousemove",
        mouseMove
      );


      window.addEventListener(
        "mouseup",
        mouseUp
      );


      /* ===================================================
         TOUCH DRAG
      =================================================== */

      viewport.addEventListener(
        "touchstart",
        function(event) {

          const touch =
            event.touches[0];


          if (!touch) {
            return;
          }


          dragging =
            true;


          dragStartX =
            touch.clientX;


          dragStartY =
            touch.clientY;


          startOffsetX =
            offsetX;


          startOffsetY =
            offsetY;


          event.preventDefault();

        },
        {
          passive:
            false
        }
      );


      viewport.addEventListener(
        "touchmove",
        function(event) {

          if (!dragging) {
            return;
          }


          const touch =
            event.touches[0];


          if (!touch) {
            return;
          }


          offsetX =
            startOffsetX +
            (
              touch.clientX -
              dragStartX
            );


          offsetY =
            startOffsetY +
            (
              touch.clientY -
              dragStartY
            );


          draw();


          event.preventDefault();

        },
        {
          passive:
            false
        }
      );


      viewport.addEventListener(
        "touchend",
        function() {

          dragging =
            false;

        }
      );


      viewport.addEventListener(
        "touchcancel",
        function() {

          dragging =
            false;

        }
      );


      /* ===================================================
         BUTTON AREA
      =================================================== */

      const buttons =
        document.createElement(
          "div"
        );


      Object.assign(
        buttons.style,
        {
          display:
            "flex",

          justifyContent:
            "flex-end",

          gap:
            "10px",

          marginTop:
            "20px",

          flexWrap:
            "wrap"
        }
      );


      editor.appendChild(
        buttons
      );


      /* ===================================================
         CANCEL
      =================================================== */

      const cancelButton =
        document.createElement(
          "button"
        );


      cancelButton.type =
        "button";


      cancelButton.textContent =
        "Cancel";


      Object.assign(
        cancelButton.style,
        {
          border:
            "1px solid #d5d5d5",

          background:
            "#ffffff",

          color:
            "#222222",

          borderRadius:
            "10px",

          padding:
            "10px 18px",

          fontSize:
            "14px",

          fontWeight:
            "600",

          cursor:
            "pointer"
        }
      );


      buttons.appendChild(
        cancelButton
      );


      /* ===================================================
         CONFIRM CROP
      =================================================== */

      const confirmButton =
        document.createElement(
          "button"
        );


      confirmButton.type =
        "button";


      confirmButton.textContent =
        "Confirm Crop";


      Object.assign(
        confirmButton.style,
        {
          border:
            "none",

          background:
            "#111111",

          color:
            "#ffffff",

          borderRadius:
            "10px",

          padding:
            "10px 18px",

          fontSize:
            "14px",

          fontWeight:
            "600",

          cursor:
            "pointer"
        }
      );


      buttons.appendChild(
        confirmButton
      );


      /* ===================================================
         CLEANUP
      =================================================== */

      function cleanup() {

        window.removeEventListener(
          "mousemove",
          mouseMove
        );


        window.removeEventListener(
          "mouseup",
          mouseUp
        );


        document.removeEventListener(
          "keydown",
          handleEscape
        );


        if (
          modal.parentNode
        ) {

          modal.parentNode.removeChild(
            modal
          );

        }

      }


      function finish(
        result
      ) {

        if (completed) {
          return;
        }


        completed =
          true;


        cleanup();


        resolve(
          result
        );

      }


      /* ===================================================
         CANCEL
      =================================================== */

      function cancel() {

        finish(
          null
        );

      }


      cancelButton.addEventListener(
        "click",
        cancel
      );


      /* ===================================================
         ESC
      =================================================== */

      function handleEscape(
        event
      ) {

        if (
          event.key ===
          "Escape"
        ) {

          cancel();

        }

      }


      document.addEventListener(
        "keydown",
        handleEscape
      );


      /* ===================================================
         CONFIRM CROP

         IMPORTANT:

         Nothing is converted to WebP before this point.

         The user's manual position and zoom are used
         to create the final 512 × 512 crop.
      =================================================== */

      confirmButton.addEventListener(
        "click",
        function() {

          if (completed) {
            return;
          }


          confirmButton.disabled =
            true;


          cancelButton.disabled =
            true;


          confirmButton.textContent =
            "Processing...";


          /* ===============================================
             DRAW EXACT MANUAL POSITION
          =============================================== */

          draw();


          /* ===============================================
             CONVERT ONLY AFTER MANUAL CROP
          =============================================== */

          canvas.toBlob(
            function(blob) {

              if (!blob) {

                confirmButton.disabled =
                  false;

                cancelButton.disabled =
                  false;

                confirmButton.textContent =
                  "Confirm Crop";


                window.alert(
                  "Unable to create the cropped image."
                );


                return;

              }


              /* =========================================
                 WEBP SIZE CHECK
              ========================================= */

              if (
                blob.size >
                U9_PROFILE_PAGE3_MAX_AVATAR_SIZE
              ) {

                confirmButton.disabled =
                  false;

                cancelButton.disabled =
                  false;

                confirmButton.textContent =
                  "Confirm Crop";


                window.alert(
                  "The cropped image is larger than 2 MB. Please zoom out or choose another image."
                );


                return;

              }


              /* =========================================
                 CREATE FINAL WEBP FILE
              ========================================= */

              const webpFile =
                new File(
                  [blob],
                  "avatar.webp",
                  {
                    type:
                      "image/webp",

                    lastModified:
                      Date.now()
                  }
                );


              /* =========================================
                 RETURN CROPPED WEBP
              ========================================= */

              finish(
                webpFile
              );

            },

            "image/webp",

            0.92
          );

        }
      );


      /* ===================================================
         CLOSE WHEN CLICKING BACKDROP
      =================================================== */

      modal.addEventListener(
        "mousedown",
        function(event) {

          if (
            event.target ===
            modal
          ) {

            cancel();

          }

        }
      );


      /* ===================================================
         INITIAL DRAW
      =================================================== */

      draw();


      /* ===================================================
         SHOW EDITOR
      =================================================== */

      document.body.appendChild(
        modal
      );

    }
  );

}


/* =========================================================
   SELECT IMAGE
========================================================= */

async function handlePage3AvatarFile(
  file,
  previewElement = null
) {

  if (!file) {
    return null;
  }


  /* =======================================================
     IMAGE VALIDATION
  ======================================================= */

  if (
    !file.type ||
    !file.type.startsWith(
      "image/"
    )
  ) {

    window.alert(
      "Please choose an image file."
    );

    return null;

  }


  if (
    file.size <= 0
  ) {

    window.alert(
      "The selected image is empty."
    );

    return null;

  }


  /* =======================================================
     COOLDOWN
  ======================================================= */

  if (
    isPage3AvatarUploadOnCooldown()
  ) {

    const remaining =
      formatPage3AvatarCooldown();


    window.alert(
      remaining
        ? `You can upload another custom avatar in ${remaining}.`
        : "Your custom avatar is currently on cooldown."
    );


    return null;

  }


  try {

    /* =====================================================
       OPEN MANUAL EDITOR
    ===================================================== */

    const croppedWebP =
      await openPage3AvatarCropper(
        file
      );


    if (!croppedWebP) {

      return null;

    }


    /* =====================================================
       VERIFY FINAL RESULT
    ===================================================== */

    if (
      croppedWebP.type !==
      "image/webp"
    ) {

      window.alert(
        "The cropped image could not be converted to WebP."
      );

      return null;

    }


    if (
      croppedWebP.size >
      U9_PROFILE_PAGE3_MAX_AVATAR_SIZE
    ) {

      window.alert(
        "The final WebP image must be 2 MB or smaller."
      );

      return null;

    }


    /* =====================================================
       SAVE FILE
    ===================================================== */

    page3UploadAvatarFile =
      croppedWebP;


    /* =====================================================
       SHOW PREVIEW
    ===================================================== */

    if (previewElement) {

      const previewUrl =
        URL.createObjectURL(
          croppedWebP
        );


      previewElement.src =
        previewUrl;


      previewElement.style.display =
        "block";


      previewElement.onload =
        function() {

          URL.revokeObjectURL(
            previewUrl
          );

        };

    }


    return croppedWebP;

  } catch (error) {

    console.error(
      "PAGE3 AVATAR CROP ERROR:",
      error
    );


    window.alert(
      "Unable to edit the selected image."
    );


    return null;

  }

}


/* =========================================================
   UPLOAD CUSTOM AVATAR
========================================================= */

async function uploadPage3CustomAvatar(
  file,
  button = null,
  input = null
) {

  /* =======================================================
     LOGIN
  ======================================================= */

  if (
    !page3AvatarIsLoggedIn()
  ) {

    window.alert(
      "Please sign in before uploading an avatar."
    );

    return false;

  }


  /* =======================================================
     FILE
  ======================================================= */

  if (!file) {

    window.alert(
      "Please choose and edit an image first."
    );

    return false;

  }


  /* =======================================================
     WEBP CHECK
  ======================================================= */

  if (
    file.type !==
    "image/webp"
  ) {

    window.alert(
      "The edited avatar must be a WebP image."
    );

    return false;

  }


  if (
    file.size <= 0
  ) {

    window.alert(
      "The image file is empty."
    );

    return false;

  }


  if (
    file.size >
    U9_PROFILE_PAGE3_MAX_AVATAR_SIZE
  ) {

    window.alert(
      "The avatar image must be 2 MB or smaller."
    );

    return false;

  }


  /* =======================================================
     COOLDOWN
  ======================================================= */

  if (
    isPage3AvatarUploadOnCooldown()
  ) {

    const remaining =
      formatPage3AvatarCooldown();


    window.alert(
      remaining
        ? `You can upload another custom avatar in ${remaining}.`
        : "Your custom avatar is still on cooldown."
    );


    return false;

  }


  /* =======================================================
     TOKEN
  ======================================================= */

  const token =
    getPage3AvatarToken();


  if (!token) {

    window.alert(
      "Your session has expired. Please sign in again."
    );

    return false;

  }


  const originalButtonText =
    button
      ? button.textContent
      : "";


  try {

    if (button) {

      button.disabled =
        true;

      button.textContent =
        "Uploading...";

    }


    /* =====================================================
       FORM DATA
    ===================================================== */

    const formData =
      new FormData();


    formData.append(
      "avatar",
      file,
      "avatar.webp"
    );


    /* =====================================================
       UPLOAD
    ===================================================== */

    const response =
      await fetch(
        U9_PROFILE_PAGE3_UPLOAD_AVATAR_API,
        {
          method:
            "POST",

          headers:
            {
              Authorization:
                `Bearer ${token}`
            },

          body:
            formData,

          credentials:
            "omit"
        }
      );


    let data =
      null;


    try {

      data =
        await response.json();

    } catch (
      jsonError
    ) {

      data =
        null;

    }


    /* =====================================================
       ERROR
    ===================================================== */

    if (
      !response.ok
    ) {

      if (
        response.status ===
        429
      ) {

        if (
          data &&
          data.cooldown_until
        ) {

          page3AvatarCooldownUntil =
            data.cooldown_until;

        }


        const remainingHours =
          data &&
          Number.isFinite(
            Number(
              data.remaining_hours
            )
          )
            ? Number(
                data.remaining_hours
              )
            : null;


        const message =
          remainingHours !== null

            ? `Your custom avatar is still on cooldown. Please try again in approximately ${Math.ceil(remainingHours)} hours.`

            : (
                data &&
                (
                  data.error ||
                  data.message
                )
                  ? (
                      data.error ||
                      data.message
                    )
                  : "Your custom avatar is still on cooldown."
              );


        window.alert(
          message
        );


        return false;

      }


      const errorMessage =
        data &&
        (
          data.error ||
          data.message
        )

          ? (
              data.error ||
              data.message
            )

          : `Upload failed (${response.status}).`;


      window.alert(
        errorMessage
      );


      return false;

    }


    /* =====================================================
       SUCCESS
    ===================================================== */

    if (
      !data ||
      data.success !== true
    ) {

      window.alert(
        data &&
        (
          data.error ||
          data.message
        )

          ? (
              data.error ||
              data.message
            )

          : "Avatar upload failed."
      );


      return false;

    }


    /* =====================================================
       SAVE AVATAR
    ===================================================== */

    const avatar =
      data.avatar ||
      {};


    page3AvatarType =
      avatar.type ||
      "custom";


    page3AvatarId =
      avatar.id ??
      null;


    page3AvatarUrl =
      avatar.url ||
      null;


    page3AvatarCooldownUntil =
      avatar.cooldown_until ||
      null;


    page3UploadAvatarFile =
      null;


    if (input) {

      input.value =
        "";

    }


    /* =====================================================
       REFRESH GLOBAL USER
    ===================================================== */

    await refreshPage3AvatarState();


    window.alert(
      "Avatar uploaded successfully."
    );


    return true;

  } catch (error) {

    console.error(
      "PAGE3 CUSTOM AVATAR UPLOAD ERROR:",
      error
    );


    window.alert(
      "Unable to upload the avatar. Please try again."
    );


    return false;

  } finally {

    if (button) {

      button.disabled =
        false;

      button.textContent =
        originalButtonText ||
        "Upload Avatar";

    }

  }

}


/* =========================================================
   RENDER CUSTOM AVATAR UI
========================================================= */

function renderPage3CustomAvatarUpload(
  panel
) {

  if (!panel) {
    return null;
  }


  loadPage3AvatarState();


  panel.innerHTML =
    "";


  /* =======================================================
     CONTAINER
  ======================================================= */

  const uploadBox =
    document.createElement(
      "div"
    );


  uploadBox.className =
    "U9-profile-page3-upload";


  panel.appendChild(
    uploadBox
  );


  /* =======================================================
     TITLE
  ======================================================= */

  const title =
    document.createElement(
      "div"
    );


  title.className =
    "U9-profile-page3-upload-title";


  title.textContent =
    "Custom Avatar";


  uploadBox.appendChild(
    title
  );


  /* =======================================================
     DESCRIPTION
  ======================================================= */

  const description =
    document.createElement(
      "div"
    );


  description.className =
    "U9-profile-page3-upload-description";


  description.textContent =
    "Choose an image, edit the crop manually, then convert the cropped result to WebP and upload it.";


  uploadBox.appendChild(
    description
  );


  /* =======================================================
     CURRENT CUSTOM AVATAR
  ======================================================= */

  if (
    page3AvatarUrl &&
    page3AvatarType ===
      "custom"
  ) {

    const current =
      document.createElement(
        "div"
      );


    current.className =
      "U9-profile-page3-upload-current";


    const currentImage =
      document.createElement(
        "img"
      );


    currentImage.src =
      page3AvatarUrl;


    currentImage.alt =
      "Current custom avatar";


    current.appendChild(
      currentImage
    );


    const currentText =
      document.createElement(
        "div"
      );


    currentText.className =
      "U9-profile-page3-upload-current-text";


    currentText.textContent =
      "Currently using your custom avatar";


    current.appendChild(
      currentText
    );


    uploadBox.appendChild(
      current
    );

  }


  /* =======================================================
     COOLDOWN
  ======================================================= */

  const cooldown =
    document.createElement(
      "div"
    );


  cooldown.className =
    "U9-profile-page3-upload-cooldown";


  function updateCooldown() {

    if (
      isPage3AvatarUploadOnCooldown()
    ) {

      cooldown.textContent =
        "Upload cooldown: " +
        formatPage3AvatarCooldown();


      cooldown.style.display =
        "";

    } else {

      cooldown.textContent =
        "";


      cooldown.style.display =
        "none";

    }

  }


  updateCooldown();


  uploadBox.appendChild(
    cooldown
  );


  /* =======================================================
     FILE INPUT
  ======================================================= */

  const input =
    document.createElement(
      "input"
    );


  input.type =
    "file";


  input.accept =
    "image/*";


  input.className =
    "U9-profile-page3-upload-input";


  uploadBox.appendChild(
    input
  );


  /* =======================================================
     FILE NAME
  ======================================================= */

  const fileName =
    document.createElement(
      "div"
    );


  fileName.className =
    "U9-profile-page3-upload-file-name";


  fileName.textContent =
    "No image selected";


  uploadBox.appendChild(
    fileName
  );


  /* =======================================================
     PREVIEW
  ======================================================= */

  const preview =
    document.createElement(
      "img"
    );


  preview.className =
    "U9-profile-page3-upload-preview";


  preview.alt =
    "Edited avatar preview";


  preview.style.display =
    "none";


  uploadBox.appendChild(
    preview
  );


  /* =======================================================
     CHOOSE BUTTON
  ======================================================= */

  const chooseButton =
    document.createElement(
      "button"
    );


  chooseButton.type =
    "button";


  chooseButton.className =
    "U9-profile-page3-upload-button";


  chooseButton.textContent =
    "Choose Image";


  chooseButton.disabled =
    isPage3AvatarUploadOnCooldown();


  uploadBox.appendChild(
    chooseButton
  );


  /* =======================================================
     UPLOAD BUTTON
  ======================================================= */

  const uploadButton =
    document.createElement(
      "button"
    );


  uploadButton.type =
    "button";


  uploadButton.className =
    "U9-profile-page3-upload-button";


  uploadButton.textContent =
    "Upload Avatar";


  uploadButton.disabled =
    true;


  uploadBox.appendChild(
    uploadButton
  );


  /* =======================================================
     CHOOSE
  ======================================================= */

  chooseButton.addEventListener(
    "click",
    function() {

      if (
        isPage3AvatarUploadOnCooldown()
      ) {

        window.alert(
          "Upload cooldown: " +
          formatPage3AvatarCooldown()
        );


        return;

      }


      input.click();

    }
  );


  /* =======================================================
     FILE SELECTED
  ======================================================= */

  input.addEventListener(
    "change",
    async function() {

      const file =
        input.files &&
        input.files[0]
          ? input.files[0]
          : null;


      page3UploadAvatarFile =
        null;


      uploadButton.disabled =
        true;


      preview.style.display =
        "none";


      preview.removeAttribute(
        "src"
      );


      if (!file) {

        fileName.textContent =
          "No image selected";


        return;

      }


      fileName.textContent =
        file.name;


      chooseButton.disabled =
        true;


      /* ================================================
         THIS OPENS THE MANUAL EDITOR
      ================================================= */

      const croppedWebP =
        await handlePage3AvatarFile(
          file,
          preview
        );


      chooseButton.disabled =
        isPage3AvatarUploadOnCooldown();


      if (!croppedWebP) {

        input.value =
          "";


        fileName.textContent =
          "No image selected";


        chooseButton.textContent =
          "Choose Image";


        return;

      }


      /* ================================================
         EDITING COMPLETE
      ================================================= */

      fileName.textContent =
        "Image edited → WebP ready";


      chooseButton.textContent =
        "Choose Another Image";


      uploadButton.disabled =
        false;


      preview.style.display =
        "block";

    }
  );


  /* =======================================================
     UPLOAD
  ======================================================= */

  uploadButton.addEventListener(
    "click",
    async function() {

      if (!page3UploadAvatarFile) {

        window.alert(
          "Please choose and edit an image first."
        );


        return;

      }


      const success =
        await uploadPage3CustomAvatar(
          page3UploadAvatarFile,
          uploadButton,
          input
        );


      if (success) {

        if (
          page3AvatarUrl
        ) {

          preview.src =
            page3AvatarUrl;

          preview.style.display =
            "block";

        }


        fileName.textContent =
          "Avatar uploaded successfully";


        chooseButton.textContent =
          "Choose Another Image";


        uploadButton.disabled =
          true;


        chooseButton.disabled =
          true;


        updateCooldown();

      }

    }
  );


  return uploadBox;

}


/* =========================================================
   PUBLIC API
========================================================= */

window.U9ProfilePage3Avatar = {

  getState:
    function() {

      return {

        type:
          page3AvatarType,

        id:
          page3AvatarId,

        url:
          page3AvatarUrl,

        cooldownUntil:
          page3AvatarCooldownUntil,

        uploadFile:
          page3UploadAvatarFile

      };

    },


  loadState:
    function() {

      loadPage3AvatarState();

      return this.getState();

    },


  refresh:
    refreshPage3AvatarState,


  render:
    renderPage3CustomAvatarUpload,


  selectFile:
    handlePage3AvatarFile,


  upload:
    uploadPage3CustomAvatar,


  isCooldown:
    isPage3AvatarUploadOnCooldown,


  getCooldown:
    formatPage3AvatarCooldown

};


/* =========================================================
   OPTIONAL GLOBAL FUNCTIONS
========================================================= */

window.U9ProfilePage3UploadAvatar =
  uploadPage3CustomAvatar;


window.U9ProfilePage3RenderCustomAvatar =
  renderPage3CustomAvatarUpload;


window.U9ProfilePage3AvatarCropper = {

  open:
    openPage3AvatarCropper,

  crop:
    openPage3AvatarCropper

};


/* =========================================================
   INITIAL STATE
========================================================= */

loadPage3AvatarState();
