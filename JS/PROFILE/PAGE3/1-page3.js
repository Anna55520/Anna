
/* =========================================================
   PROFILE PAGE 3
   PART 1/3
   CUSTOM AVATAR
   SELECT → MANUAL CROP → WEBP → UPLOAD
========================================================= */

"use strict";


/* =========================================================
   API
========================================================= */

const U9_PROFILE_PAGE3_UPLOAD_AVATAR_API =
  "https://tvtakmswbzawaweytimx.supabase.co/functions/v1/avatar-upload";


/* =========================================================
   CONSTANTS
========================================================= */

const U9_PROFILE_PAGE3_MAX_AVATAR_SIZE =
  2 * 1024 * 1024;

const U9_PROFILE_PAGE3_CROP_SIZE =
  512;

const U9_PROFILE_PAGE3_MIN_ZOOM =
  1;

const U9_PROFILE_PAGE3_MAX_ZOOM =
  4;

const U9_PROFILE_PAGE3_ZOOM_STEP =
  0.01;


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

  }

  catch (error) {

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
   LOAD AVATAR STATE
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

    return (
      `${days}d ${hours}h`
    );

  }


  if (hours > 0) {

    return (
      `${hours}h ${minutes}m`
    );

  }


  return `${minutes}m`;

}


/* =========================================================
   REFRESH AVATAR STATE
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

  }

  catch (error) {

    console.error(
      "PAGE3 AVATAR REFRESH ERROR:",
      error
    );

    return false;

  }

}


/* =========================================================
   MANUAL AVATAR CROPPER
========================================================= */

function openPage3AvatarCropper(
  file
) {

  return new Promise(
    function(resolve) {

      if (!file) {

        resolve(null);

        return;

      }


      if (
        !file.type ||
        !file.type.startsWith(
          "image/"
        )
      ) {

        resolve(null);

        return;

      }


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


          createPage3AvatarCropModal(
            image,
            resolve
          );

        };


      image.onerror =
        function() {

          URL.revokeObjectURL(
            objectUrl
          );


          resolve(null);

        };


      image.src =
        objectUrl;

    }
  );

}


/* =========================================================
   CREATE CROP MODAL
========================================================= */

function createPage3AvatarCropModal(
  image,
  resolve
) {

  let finished =
    false;


  let zoom =
    U9_PROFILE_PAGE3_MIN_ZOOM;


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


  /* =======================================================
     BASE SCALE
  ======================================================= */

  const baseScale =
    Math.max(
      U9_PROFILE_PAGE3_CROP_SIZE /
        imageWidth,

      U9_PROFILE_PAGE3_CROP_SIZE /
        imageHeight
    );


  /* =======================================================
     MODAL
  ======================================================= */

  const modal =
    document.createElement(
      "div"
    );


  modal.id =
    "U9-page3-avatar-crop-modal";


  Object.assign(
    modal.style,
    {
      position: "fixed",
      inset: "0",
      zIndex: "999999",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "16px",
      boxSizing: "border-box",
      background:
        "rgba(0,0,0,0.78)"
    }
  );


  /* =======================================================
     PANEL
  ======================================================= */

  const panel =
    document.createElement(
      "div"
    );


  Object.assign(
    panel.style,
    {
      width:
        "min(100%, 580px)",

      maxHeight:
        "calc(100vh - 32px)",

      overflowY:
        "auto",

      background:
        "#ffffff",

      borderRadius:
        "18px",

      padding:
        "20px",

      boxSizing:
        "border-box",

      boxShadow:
        "0 20px 60px rgba(0,0,0,0.35)"
    }
  );


  modal.appendChild(
    panel
  );


  /* =======================================================
     TITLE
  ======================================================= */

  const title =
    document.createElement(
      "div"
    );


  title.textContent =
    "Crop Avatar";


  Object.assign(
    title.style,
    {
      fontSize:
        "20px",

      fontWeight:
        "700",

      color:
        "#111111",

      marginBottom:
        "6px"
    }
  );


  panel.appendChild(
    title
  );


  /* =======================================================
     DESCRIPTION
  ======================================================= */

  const description =
    document.createElement(
      "div"
    );


  description.textContent =
    "Drag the image to position it. Use the slider to zoom.";


  Object.assign(
    description.style,
    {
      fontSize:
        "14px",

      lineHeight:
        "1.5",

      color:
        "#666666",

      marginBottom:
        "16px"
    }
  );


  panel.appendChild(
    description
  );


  /* =======================================================
     CROP AREA
  ======================================================= */

  const cropWrapper =
    document.createElement(
      "div"
    );


  Object.assign(
    cropWrapper.style,
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


  panel.appendChild(
    cropWrapper
  );


  const cropArea =
    document.createElement(
      "div"
    );


  Object.assign(
    cropArea.style,
    {
      position:
        "relative",

      width:
        `${U9_PROFILE_PAGE3_CROP_SIZE}px`,

      height:
        `${U9_PROFILE_PAGE3_CROP_SIZE}px`,

      maxWidth:
        "100%",

      maxHeight:
        "70vh",

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


  cropWrapper.appendChild(
    cropArea
  );


  /* =======================================================
     CANVAS
  ======================================================= */

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
      display:
        "block",

      width:
        "100%",

      height:
        "100%",

      pointerEvents:
        "none"
    }
  );


  cropArea.appendChild(
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


  /* =======================================================
     CIRCULAR OVERLAY
  ======================================================= */

  const overlay =
    document.createElement(
      "div"
    );


  Object.assign(
    overlay.style,
    {
      position:
        "absolute",

      inset:
        "0",

      pointerEvents:
        "none",

      border:
        "2px solid rgba(255,255,255,0.95)",

      borderRadius:
        "50%",

      boxShadow:
        "0 0 0 9999px rgba(0,0,0,0.30)",

      boxSizing:
        "border-box"
    }
  );


  cropArea.appendChild(
    overlay
  );


  /* =======================================================
     INITIAL POSITION
  ======================================================= */

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


  /* =======================================================
     CONSTRAIN POSITION
  ======================================================= */

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

    }

    else {

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

    }

    else {

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


  /* =======================================================
     DRAW
  ======================================================= */

  function drawCrop() {

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


  /* =======================================================
     ZOOM
  ======================================================= */

  const zoomContainer =
    document.createElement(
      "div"
    );


  Object.assign(
    zoomContainer.style,
    {
      marginBottom:
        "18px"
    }
  );


  panel.appendChild(
    zoomContainer
  );


  const zoomHeader =
    document.createElement(
      "div"
    );


  Object.assign(
    zoomHeader.style,
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


  zoomContainer.appendChild(
    zoomHeader
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


  zoomHeader.appendChild(
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


  zoomHeader.appendChild(
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
    String(
      U9_PROFILE_PAGE3_ZOOM_STEP
    );


  zoomInput.value =
    String(
      zoom
    );


  zoomInput.style.width =
    "100%";


  zoomContainer.appendChild(
    zoomInput
  );


  zoomInput.addEventListener(
    "input",
    function() {

      const previousZoom =
        zoom;


      zoom =
        Number(
          zoomInput.value
        );


      const center =
        U9_PROFILE_PAGE3_CROP_SIZE /
        2;


      const previousScale =
        baseScale *
        previousZoom;


      const newScale =
        baseScale *
        zoom;


      const imageCenterX =
        (
          center -
          offsetX
        ) /
        previousScale;


      const imageCenterY =
        (
          center -
          offsetY
        ) /
        previousScale;


      offsetX =
        center -
        imageCenterX *
        newScale;


      offsetY =
        center -
        imageCenterY *
        newScale;


      zoomValue.textContent =
        `${Math.round(
          zoom * 100
        )}%`;


      drawCrop();

    }
  );


  /* =======================================================
     MOUSE DRAG
  ======================================================= */

  function startMouseDrag(
    event
  ) {

    if (
      event.button !== 0
    ) {
      return;
    }


    dragging =
      true;


    cropArea.style.cursor =
      "grabbing";


    dragStartX =
      event.clientX;


    dragStartY =
      event.clientY;


    startOffsetX =
      offsetX;


    startOffsetY =
      offsetY;


    event.preventDefault();

  }


  function moveMouseDrag(
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


    drawCrop();

  }


  function stopMouseDrag() {

    dragging =
      false;


    cropArea.style.cursor =
      "grab";

  }


  cropArea.addEventListener(
    "mousedown",
    startMouseDrag
  );


  window.addEventListener(
    "mousemove",
    moveMouseDrag
  );


  window.addEventListener(
    "mouseup",
    stopMouseDrag
  );


  /* =======================================================
     TOUCH DRAG
  ======================================================= */

  function getTouch(
    event
  ) {

    if (
      !event.touches ||
      !event.touches.length
    ) {

      return null;

    }


    return event.touches[0];

  }


  function startTouchDrag(
    event
  ) {

    const touch =
      getTouch(
        event
      );


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

  }


  function moveTouchDrag(
    event
  ) {

    if (!dragging) {
      return;
    }


    const touch =
      getTouch(
        event
      );


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


    drawCrop();


    event.preventDefault();

  }


  function stopTouchDrag() {

    dragging =
      false;

  }


  cropArea.addEventListener(
    "touchstart",
    startTouchDrag,
    {
      passive: false
    }
  );


  cropArea.addEventListener(
    "touchmove",
    moveTouchDrag,
    {
      passive: false
    }
  );


  cropArea.addEventListener(
    "touchend",
    stopTouchDrag
  );


  cropArea.addEventListener(
    "touchcancel",
    stopTouchDrag
  );


  /* =======================================================
     BUTTONS
  ======================================================= */

  const buttonRow =
    document.createElement(
      "div"
    );


  Object.assign(
    buttonRow.style,
    {
      display:
        "flex",

      justifyContent:
        "flex-end",

      gap:
        "10px",

      flexWrap:
        "wrap"
    }
  );


  panel.appendChild(
    buttonRow
  );


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
        "1px solid #d7d7d7",

      background:
        "#ffffff",

      color:
        "#222222",

      padding:
        "10px 18px",

      borderRadius:
        "10px",

      fontSize:
        "14px",

      fontWeight:
        "600",

      cursor:
        "pointer"
    }
  );


  buttonRow.appendChild(
    cancelButton
  );


  const confirmButton =
    document.createElement(
      "button"
    );


  confirmButton.type =
    "button";


  confirmButton.textContent =
    "Use This Avatar";


  Object.assign(
    confirmButton.style,
    {
      border:
        "none",

      background:
        "#111111",

      color:
        "#ffffff",

      padding:
        "10px 18px",

      borderRadius:
        "10px",

      fontSize:
        "14px",

      fontWeight:
        "600",

      cursor:
        "pointer"
    }
  );


  buttonRow.appendChild(
    confirmButton
  );


  /* =======================================================
     CLEANUP
  ======================================================= */

  function cleanup() {

    window.removeEventListener(
      "mousemove",
      moveMouseDrag
    );


    window.removeEventListener(
      "mouseup",
      stopMouseDrag
    );


    document.removeEventListener(
      "keydown",
      handleCropKeyDown
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
    value
  ) {

    if (finished) {
      return;
    }


    finished =
      true;


    cleanup();


    resolve(
      value
    );

  }


  function cancelCrop() {

    finish(
      null
    );

  }


  cancelButton.addEventListener(
    "click",
    cancelCrop
  );


  /* =======================================================
     CROP → WEBP
     
     IMPORTANT:
     The original image is NOT changed before cropping.
     
     First:
       1. Manual position
       2. Manual zoom
       3. Render 512 × 512 crop
     
     Then:
       4. Convert cropped canvas to WebP
       5. Create avatar.webp
  ======================================================= */

  confirmButton.addEventListener(
    "click",
    function() {

      if (finished) {
        return;
      }


      confirmButton.disabled =
        true;


      confirmButton.textContent =
        "Processing...";


      drawCrop();


      canvas.toBlob(
        function(blob) {

          if (!blob) {

            confirmButton.disabled =
              false;

            confirmButton.textContent =
              "Use This Avatar";


            window.alert(
              "Unable to create the cropped image."
            );


            return;

          }


          if (
            blob.size >
            U9_PROFILE_PAGE3_MAX_AVATAR_SIZE
          ) {

            confirmButton.disabled =
              false;

            confirmButton.textContent =
              "Use This Avatar";


            window.alert(
              "The cropped avatar is larger than 2 MB. Please try a different image or reduce the zoom."
            );


            return;

          }


          const croppedFile =
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


          finish(
            croppedFile
          );

        },

        "image/webp",

        0.92

      );

    }
  );


  /* =======================================================
     ESC
  ======================================================= */

  function handleCropKeyDown(
    event
  ) {

    if (
      event.key ===
        "Escape"
    ) {

      cancelCrop();

    }

  }


  document.addEventListener(
    "keydown",
    handleCropKeyDown
  );


  /* =======================================================
     BACKDROP CLICK
  ======================================================= */

  modal.addEventListener(
    "mousedown",
    function(event) {

      if (
        event.target ===
        modal
      ) {

        cancelCrop();

      }

    }
  );


  /* =======================================================
     INITIAL DRAW
  ======================================================= */

  drawCrop();


  /* =======================================================
     SHOW MODAL
  ======================================================= */

  document.body.appendChild(
    modal
  );

}


/* =========================================================
   HANDLE IMAGE SELECTION
========================================================= */

async function handlePage3AvatarFile(
  file,
  previewElement = null
) {

  if (!file) {
    return null;
  }


  if (
    !file.type ||
    !file.type.startsWith(
      "image/"
    )
  ) {

    window.alert(
      "Please choose a valid image file."
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

    /* ================================================
       OPEN MANUAL CROP
    ================================================= */

    const croppedFile =
      await openPage3AvatarCropper(
        file
      );


    if (!croppedFile) {

      return null;

    }


    /* ================================================
       FINAL FILE IS WEBP
    ================================================= */

    if (
      croppedFile.type !==
      "image/webp"
    ) {

      window.alert(
        "The cropped image could not be converted to WebP."
      );

      return null;

    }


    if (
      croppedFile.size >
      U9_PROFILE_PAGE3_MAX_AVATAR_SIZE
    ) {

      window.alert(
        "The cropped avatar must be 2 MB or smaller."
      );

      return null;

    }


    page3UploadAvatarFile =
      croppedFile;


    /* ================================================
       PREVIEW
    ================================================= */

    if (previewElement) {

      const previewUrl =
        URL.createObjectURL(
          croppedFile
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


    return croppedFile;

  }

  catch (error) {

    console.error(
      "PAGE3 AVATAR CROP ERROR:",
      error
    );


    window.alert(
      "Unable to crop the selected image."
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

  if (
    !page3AvatarIsLoggedIn()
  ) {

    window.alert(
      "Please sign in before uploading an avatar."
    );

    return false;

  }


  if (!file) {

    window.alert(
      "Please choose and crop an image first."
    );

    return false;

  }


  /* =======================================================
     FINAL FILE MUST BE WEBP
  ======================================================= */

  if (
    file.type !==
    "image/webp"
  ) {

    window.alert(
      "The cropped avatar must be a WebP image."
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

    }

    catch (
      jsonError
    ) {

      data =
        null;

    }


    /* =====================================================
       HTTP ERROR
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
       API SUCCESS CHECK
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
       SAVE AVATAR STATE
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
       REFRESH USER / PROFILE
    ===================================================== */

    await refreshPage3AvatarState();


    window.alert(
      "Avatar uploaded successfully."
    );


    return true;

  }

  catch (error) {

    console.error(
      "PAGE3 CUSTOM AVATAR UPLOAD ERROR:",
      error
    );


    window.alert(
      "Unable to upload the avatar. Please try again."
    );


    return false;

  }

  finally {

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
   RENDER CUSTOM AVATAR UPLOAD UI
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
    "Choose an image, manually crop it to a square, then upload it as a 512 × 512 WebP avatar. Maximum final size: 2 MB.";


  uploadBox.appendChild(
    description
  );


  /* =======================================================
     CURRENT AVATAR
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

    }

    else {

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
    "Cropped avatar preview";


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
     CHOOSE IMAGE
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
     FILE CHANGE
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


        chooseButton.textContent =
          "Choose Image";


        return;

      }


      fileName.textContent =
        file.name;


      chooseButton.disabled =
        true;


      uploadButton.disabled =
        true;


      const croppedFile =
        await handlePage3AvatarFile(
          file,
          preview
        );


      chooseButton.disabled =
        isPage3AvatarUploadOnCooldown();


      if (!croppedFile) {

        input.value =
          "";


        fileName.textContent =
          "No image selected";


        chooseButton.textContent =
          "Choose Image";


        return;

      }


      fileName.textContent =
        file.name +
        " → Cropped → WebP";


      chooseButton.textContent =
        "Choose Another Image";


      preview.style.display =
        "block";


      uploadButton.disabled =
        false;

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
          "Please choose and crop an image first."
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
          "Avatar uploaded";


        chooseButton.textContent =
          "Choose Another Image";


        updateCooldown();


        chooseButton.disabled =
          true;

        uploadButton.disabled =
          true;

      }

      else {

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
   AUTO STATE LOAD
========================================================= */

loadPage3AvatarState();
