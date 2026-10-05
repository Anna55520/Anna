const U9_PROFILE_PAGE3_UPLOAD_AVATAR_API =
  "https://tvtakmswbzawaweytimx.supabase.co/functions/v1/avatar-upload";


const U9_PROFILE_PAGE3_MAX_AVATAR_SIZE =
  2 * 1024 * 1024;

const U9_PROFILE_PAGE3_CROP_SIZE =
  512;


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
   LOAD CURRENT AVATAR STATE
========================================================= */

function loadPage3AvatarState() {

  const user =
    window.U9User &&
    typeof window.U9User.get ===
      "function"
      ? window.U9User.get()
      : null;


  if (!user) {

    return;

  }


  page3AvatarType =
    user?.avatar?.type ||
    user?.avatar?.avatar_type ||
    user?.avatar_type ||
    "free";


  page3AvatarId =
    user?.avatar?.id ||
    user?.avatar?.avatar_id ||
    user?.avatar_id ||
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

  if (
    !page3AvatarCooldownUntil
  ) {

    return false;

  }


  const cooldownTime =
    new Date(
      page3AvatarCooldownUntil
    ).getTime();


  if (
    Number.isNaN(
      cooldownTime
    )
  ) {

    return false;

  }


  return (
    cooldownTime >
    Date.now()
  );

}


/* =========================================================
   FORMAT COOLDOWN
========================================================= */

function formatPage3AvatarCooldown() {

  if (
    !page3AvatarCooldownUntil
  ) {

    return "";

  }


  const cooldownTime =
    new Date(
      page3AvatarCooldownUntil
    ).getTime();


  if (
    Number.isNaN(
      cooldownTime
    )
  ) {

    return "";

  }


  const remaining =
    cooldownTime -
    Date.now();


  if (
    remaining <= 0
  ) {

    return "";

  }


  const totalMinutes =
    Math.ceil(
      remaining /
      (1000 * 60)
    );


  const days =
    Math.floor(
      totalMinutes /
      (60 * 24)
    );


  const hours =
    Math.floor(
      (
        totalMinutes %
        (60 * 24)
      ) /
      60
    );


  const minutes =
    totalMinutes %
    60;


  const parts = [];


  if (
    days > 0
  ) {

    parts.push(
      `${days}d`
    );

  }


  if (
    hours > 0
  ) {

    parts.push(
      `${hours}h`
    );

  }


  if (
    minutes > 0 &&
    days === 0
  ) {

    parts.push(
      `${minutes}m`
    );

  }


  if (
    !parts.length
  ) {

    return "less than 1 minute";

  }


  return parts.join(
    " "
  );

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


    if (user) {

      page3AvatarType =
        user?.avatar?.type ||
        user?.avatar?.avatar_type ||
        user?.avatar_type ||
        page3AvatarType;


      page3AvatarId =
        user?.avatar?.id ||
        user?.avatar?.avatar_id ||
        user?.avatar_id ||
        page3AvatarId;


      page3AvatarUrl =
        user?.avatar?.url ||
        user?.avatar?.avatar_url ||
        user?.avatar_url ||
        page3AvatarUrl;


      page3AvatarCooldownUntil =
        user?.avatar?.cooldown_until ||
        user?.avatar?.cooldownUntil ||
        user?.cooldown_until ||
        user?.avatar_cooldown_until ||
        page3AvatarCooldownUntil;

    }


    if (
      window.U9Profile &&
      typeof window.U9Profile.refreshAvatar ===
        "function"
    ) {

      await window.U9Profile.refreshAvatar();

    }

    else if (
      window.U9Profile &&
      typeof window.U9Profile.refresh ===
        "function"
    ) {

      await window.U9Profile.refresh();

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
   CREATE CUSTOM AVATAR UPLOAD UI
========================================================= */

function renderPage3CustomAvatarUpload(
  panel
) {

  if (!panel) {

    return null;

  }


  loadPage3AvatarState();


  const uploadBox =
    document.createElement(
      "div"
    );

  uploadBox.className =
    "U9-profile-page3-upload";


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
    "Supports PNG, JPG, JPEG, WebP, GIF and other browser-supported image formats. Choose an image, crop it to 1:1, then upload it. Final image: 512 × 512 WebP, max 2 MB. Upload cooldown: 7 days.";

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

    currentImage.alt =
      "Current custom avatar";

    currentImage.src =
      page3AvatarUrl;


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

  const cooldownElement =
    document.createElement(
      "div"
    );

  cooldownElement.className =
    "U9-profile-page3-upload-cooldown";


  function updateCooldownElement() {

    if (
      isPage3AvatarUploadOnCooldown()
    ) {

      cooldownElement.textContent =
        "Upload cooldown: " +
        formatPage3AvatarCooldown();

      cooldownElement.style.display =
        "";

    }

    else {

      cooldownElement.textContent =
        "";

      cooldownElement.style.display =
        "none";

    }

  }


  updateCooldownElement();


  uploadBox.appendChild(
    cooldownElement
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
     CHOOSE IMAGE BUTTON
  ======================================================= */

  const cropButton =
    document.createElement(
      "button"
    );

  cropButton.type =
    "button";

  cropButton.className =
    "U9-profile-page3-upload-button";

  cropButton.textContent =
    "Choose Image";

  cropButton.disabled =
    isPage3AvatarUploadOnCooldown();


  uploadBox.appendChild(
    cropButton
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
     OPEN FILE PICKER
  ======================================================= */

  cropButton.addEventListener(
    "click",
    function() {

      if (
        isPage3AvatarUploadOnCooldown()
      ) {

        alert(
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

        cropButton.textContent =
          "Choose Image";

        return;

      }


      fileName.textContent =
        file.name;


      /* ---------------------------------------------------
         IMAGE TYPE
      --------------------------------------------------- */

      if (
        !file.type ||
        !file.type.startsWith(
          "image/"
        )
      ) {

        alert(
          "Please select a valid image file."
        );

        input.value =
          "";

        fileName.textContent =
          "No image selected";

        return;

      }


      /* ---------------------------------------------------
         EMPTY FILE
      --------------------------------------------------- */

      if (
        file.size <= 0
      ) {

        alert(
          "The selected image is empty or invalid."
        );

        input.value =
          "";

        fileName.textContent =
          "No image selected";

        return;

      }


      /*
       * The original source image is NOT limited to 2 MB.
       *
       * It will be cropped and converted to
       * 512 × 512 WebP before upload.
       */


      /* ---------------------------------------------------
         COOLDOWN
      --------------------------------------------------- */

      if (
        isPage3AvatarUploadOnCooldown()
      ) {

        alert(
          "Upload cooldown: " +
          formatPage3AvatarCooldown()
        );

        input.value =
          "";

        return;

      }


      /* ---------------------------------------------------
         OPEN CROPPER
      --------------------------------------------------- */

      const croppedFile =
        await openPage3AvatarCropper(
          file
        );


      if (!croppedFile) {

        input.value =
          "";

        fileName.textContent =
          "No image selected";

        cropButton.textContent =
          "Choose Image";

        page3UploadAvatarFile =
          null;

        return;

      }


      /* ---------------------------------------------------
         SAVE CROPPED FILE
      --------------------------------------------------- */

      page3UploadAvatarFile =
        croppedFile;


      fileName.textContent =
        file.name +
        " → Cropped";


      cropButton.textContent =
        "Choose Another Image";


      /* ---------------------------------------------------
         PREVIEW
      --------------------------------------------------- */

      const previewUrl =
        URL.createObjectURL(
          croppedFile
        );


      preview.src =
        previewUrl;

      preview.style.display =
        "block";


      preview.onload =
        function() {

          URL.revokeObjectURL(
            previewUrl
          );

        };


      /* ---------------------------------------------------
         ENABLE UPLOAD
      --------------------------------------------------- */

      uploadButton.disabled =
        false;

    }
  );


  /* =======================================================
     UPLOAD BUTTON
  ======================================================= */

  uploadButton.addEventListener(
    "click",
    async function() {

      await uploadPage3CustomAvatar(
        page3UploadAvatarFile,
        uploadButton,
        input,
        cropButton,
        fileName,
        preview,
        updateCooldownElement
      );

    }
  );


  /* =======================================================
     ADD TO PANEL
  ======================================================= */

  panel.appendChild(
    uploadBox
  );


  return uploadBox;

}


/* =========================================================
   END OF PART 1/3
========================================================= */

/* =========================================================
   PROFILE PAGE 3
   PART 2/3
   AVATAR CROPPER
   ========================================================= */

(function () {
  "use strict";

  /* =========================================================
     CONSTANTS
     ========================================================= */

  const CROP_SIZE = 512;
  const MIN_ZOOM = 1;
  const MAX_ZOOM = 4;
  const ZOOM_STEP = 0.01;


  /* =========================================================
     AVATAR CROPPER
     ========================================================= */

  function openPage3AvatarCropper(file) {
    return new Promise((resolve) => {
      if (!file) {
        resolve(null);
        return;
      }

      if (!file.type || !file.type.startsWith("image/")) {
        resolve(null);
        return;
      }

      const objectUrl = URL.createObjectURL(file);

      const image = new Image();

      image.onload = () => {
        URL.revokeObjectURL(objectUrl);

        createPage3AvatarCropModal(
          image,
          resolve
        );
      };

      image.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(null);
      };

      image.src = objectUrl;
    });
  }


  /* =========================================================
     CREATE CROPPER MODAL
     ========================================================= */

  function createPage3AvatarCropModal(image, resolve) {

    let finished = false;

    let zoom = 1;

    let offsetX = 0;
    let offsetY = 0;

    let dragging = false;

    let dragStartX = 0;
    let dragStartY = 0;

    let startOffsetX = 0;
    let startOffsetY = 0;


    /* =======================================================
       IMAGE DIMENSIONS
       ======================================================= */

    const imageWidth = image.naturalWidth || image.width;
    const imageHeight = image.naturalHeight || image.height;

    if (!imageWidth || !imageHeight) {
      resolve(null);
      return;
    }


    /* =======================================================
       BASE SCALE
       Make the shorter image side cover the 512x512 crop.
       ======================================================= */

    const baseScale =
      Math.max(
        CROP_SIZE / imageWidth,
        CROP_SIZE / imageHeight
      );


    /* =======================================================
       MODAL
       ======================================================= */

    const modal = document.createElement("div");

    modal.id = "U9-page3-avatar-crop-modal";

    Object.assign(modal.style, {
      position: "fixed",
      inset: "0",
      zIndex: "999999",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
      background: "rgba(0,0,0,0.78)",
      boxSizing: "border-box"
    });


    /* =======================================================
       PANEL
       ======================================================= */

    const panel = document.createElement("div");

    Object.assign(panel.style, {
      width: "min(100%, 560px)",
      maxHeight: "calc(100vh - 40px)",
      overflow: "auto",
      background: "#ffffff",
      borderRadius: "18px",
      padding: "20px",
      boxSizing: "border-box",
      boxShadow: "0 20px 60px rgba(0,0,0,0.35)"
    });

    modal.appendChild(panel);


    /* =======================================================
       TITLE
       ======================================================= */

    const title = document.createElement("div");

    title.textContent = "Crop Avatar";

    Object.assign(title.style, {
      fontSize: "20px",
      fontWeight: "700",
      lineHeight: "1.3",
      marginBottom: "6px",
      color: "#111111"
    });

    panel.appendChild(title);


    /* =======================================================
       DESCRIPTION
       ======================================================= */

    const description = document.createElement("div");

    description.textContent =
      "Drag the image to reposition it. Use the slider to zoom.";

    Object.assign(description.style, {
      fontSize: "14px",
      lineHeight: "1.5",
      color: "#666666",
      marginBottom: "16px"
    });

    panel.appendChild(description);


    /* =======================================================
       CROP AREA
       ======================================================= */

    const cropWrapper = document.createElement("div");

    Object.assign(cropWrapper.style, {
      width: "100%",
      display: "flex",
      justifyContent: "center",
      marginBottom: "18px"
    });

    panel.appendChild(cropWrapper);


    const cropArea = document.createElement("div");

    Object.assign(cropArea.style, {
      position: "relative",
      width: `${CROP_SIZE}px`,
      height: `${CROP_SIZE}px`,
      maxWidth: "100%",
      aspectRatio: "1 / 1",
      overflow: "hidden",
      background: "#111111",
      borderRadius: "12px",
      cursor: "grab",
      touchAction: "none",
      userSelect: "none"
    });

    cropWrapper.appendChild(cropArea);


    /* =======================================================
       CANVAS
       ======================================================= */

    const canvas = document.createElement("canvas");

    canvas.width = CROP_SIZE;
    canvas.height = CROP_SIZE;

    Object.assign(canvas.style, {
      display: "block",
      width: "100%",
      height: "100%",
      pointerEvents: "none"
    });

    cropArea.appendChild(canvas);

    const ctx = canvas.getContext("2d");


    /* =======================================================
       CROP OVERLAY
       ======================================================= */

    const overlay = document.createElement("div");

    Object.assign(overlay.style, {
      position: "absolute",
      inset: "0",
      pointerEvents: "none",
      boxSizing: "border-box",
      border: "2px solid rgba(255,255,255,0.9)",
      borderRadius: "50%",
      boxShadow: "0 0 0 9999px rgba(0,0,0,0.25)"
    });

    cropArea.appendChild(overlay);


    /* =======================================================
       INITIAL IMAGE POSITION
       ======================================================= */

    const scaledWidth =
      imageWidth * baseScale;

    const scaledHeight =
      imageHeight * baseScale;

    offsetX =
      (CROP_SIZE - scaledWidth) / 2;

    offsetY =
      (CROP_SIZE - scaledHeight) / 2;


    /* =======================================================
       CONSTRAIN IMAGE
       ======================================================= */

    function constrainCropPosition() {

      const scale =
        baseScale * zoom;

      const width =
        imageWidth * scale;

      const height =
        imageHeight * scale;


      const minX =
        CROP_SIZE - width;

      const minY =
        CROP_SIZE - height;


      if (width <= CROP_SIZE) {
        offsetX =
          (CROP_SIZE - width) / 2;
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


      if (height <= CROP_SIZE) {
        offsetY =
          (CROP_SIZE - height) / 2;
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


    /* =======================================================
       DRAW
       ======================================================= */

    function drawCrop() {

      constrainCropPosition();

      ctx.clearRect(
        0,
        0,
        CROP_SIZE,
        CROP_SIZE
      );

      ctx.fillStyle = "#111111";

      ctx.fillRect(
        0,
        0,
        CROP_SIZE,
        CROP_SIZE
      );


      const scale =
        baseScale * zoom;

      const width =
        imageWidth * scale;

      const height =
        imageHeight * scale;


      ctx.drawImage(
        image,
        offsetX,
        offsetY,
        width,
        height
      );
    }


    /* =======================================================
       ZOOM CONTROL
       ======================================================= */

    const zoomContainer =
      document.createElement("div");

    Object.assign(zoomContainer.style, {
      marginBottom: "18px"
    });

    panel.appendChild(zoomContainer);


    const zoomTop =
      document.createElement("div");

    Object.assign(zoomTop.style, {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: "8px"
    });

    zoomContainer.appendChild(zoomTop);


    const zoomLabel =
      document.createElement("span");

    zoomLabel.textContent = "Zoom";

    Object.assign(zoomLabel.style, {
      fontSize: "14px",
      fontWeight: "600",
      color: "#222222"
    });

    zoomTop.appendChild(zoomLabel);


    const zoomValue =
      document.createElement("span");

    zoomValue.textContent = "100%";

    Object.assign(zoomValue.style, {
      fontSize: "13px",
      color: "#666666"
    });

    zoomTop.appendChild(zoomValue);


    const zoomInput =
      document.createElement("input");

    zoomInput.type = "range";

    zoomInput.min = String(MIN_ZOOM);

    zoomInput.max = String(MAX_ZOOM);

    zoomInput.step = String(ZOOM_STEP);

    zoomInput.value = String(zoom);

    Object.assign(zoomInput.style, {
      width: "100%",
      display: "block",
      cursor: "pointer"
    });

    zoomContainer.appendChild(zoomInput);


    zoomInput.addEventListener(
      "input",
      () => {

        const previousZoom =
          zoom;

        zoom =
          Number(zoomInput.value);


        const centerX =
          CROP_SIZE / 2;

        const centerY =
          CROP_SIZE / 2;


        /*
         * Keep the visual center stable
         * while zooming.
         */

        const previousScale =
          baseScale * previousZoom;

        const newScale =
          baseScale * zoom;


        const imageCenterX =
          (centerX - offsetX) /
          previousScale;

        const imageCenterY =
          (centerY - offsetY) /
          previousScale;


        offsetX =
          centerX -
          imageCenterX * newScale;

        offsetY =
          centerY -
          imageCenterY * newScale;


        zoomValue.textContent =
          `${Math.round(zoom * 100)}%`;


        drawCrop();
      }
    );


    /* =======================================================
       MOUSE DRAG
       ======================================================= */

    function beginMouseDrag(event) {

      if (event.button !== 0) {
        return;
      }

      dragging = true;

      cropArea.style.cursor = "grabbing";

      dragStartX = event.clientX;
      dragStartY = event.clientY;

      startOffsetX = offsetX;
      startOffsetY = offsetY;

      event.preventDefault();
    }


    function moveMouseDrag(event) {

      if (!dragging) {
        return;
      }

      offsetX =
        startOffsetX +
        (event.clientX - dragStartX);

      offsetY =
        startOffsetY +
        (event.clientY - dragStartY);

      drawCrop();
    }


    function endMouseDrag() {

      if (!dragging) {
        return;
      }

      dragging = false;

      cropArea.style.cursor = "grab";
    }


    cropArea.addEventListener(
      "mousedown",
      beginMouseDrag
    );

    window.addEventListener(
      "mousemove",
      moveMouseDrag
    );

    window.addEventListener(
      "mouseup",
      endMouseDrag
    );


    /* =======================================================
       TOUCH DRAG
       ======================================================= */

    function getTouchPoint(event) {

      if (
        !event.touches ||
        !event.touches.length
      ) {
        return null;
      }

      return event.touches[0];
    }


    function beginTouchDrag(event) {

      const touch =
        getTouchPoint(event);

      if (!touch) {
        return;
      }

      dragging = true;

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


    function moveTouchDrag(event) {

      if (!dragging) {
        return;
      }

      const touch =
        getTouchPoint(event);

      if (!touch) {
        return;
      }

      offsetX =
        startOffsetX +
        (touch.clientX - dragStartX);

      offsetY =
        startOffsetY +
        (touch.clientY - dragStartY);

      drawCrop();

      event.preventDefault();
    }


    function endTouchDrag() {

      dragging = false;
    }


    cropArea.addEventListener(
      "touchstart",
      beginTouchDrag,
      { passive: false }
    );

    cropArea.addEventListener(
      "touchmove",
      moveTouchDrag,
      { passive: false }
    );

    cropArea.addEventListener(
      "touchend",
      endTouchDrag,
      { passive: false }
    );

    cropArea.addEventListener(
      "touchcancel",
      endTouchDrag,
      { passive: false }
    );


    /* =======================================================
       BUTTON AREA
       ======================================================= */

    const buttonRow =
      document.createElement("div");

    Object.assign(buttonRow.style, {
      display: "flex",
      gap: "10px",
      justifyContent: "flex-end",
      flexWrap: "wrap"
    });

    panel.appendChild(buttonRow);


    /* =======================================================
       CANCEL BUTTON
       ======================================================= */

    const cancelButton =
      document.createElement("button");

    cancelButton.type = "button";

    cancelButton.textContent = "Cancel";

    Object.assign(cancelButton.style, {
      border: "1px solid #d7d7d7",
      background: "#ffffff",
      color: "#222222",
      padding: "10px 18px",
      borderRadius: "10px",
      fontSize: "14px",
      fontWeight: "600",
      cursor: "pointer"
    });

    buttonRow.appendChild(cancelButton);


    /* =======================================================
       CONFIRM BUTTON
       ======================================================= */

    const confirmButton =
      document.createElement("button");

    confirmButton.type = "button";

    confirmButton.textContent = "Use This Avatar";

    Object.assign(confirmButton.style, {
      border: "none",
      background: "#111111",
      color: "#ffffff",
      padding: "10px 18px",
      borderRadius: "10px",
      fontSize: "14px",
      fontWeight: "600",
      cursor: "pointer"
    });

    buttonRow.appendChild(confirmButton);


    /* =======================================================
       CLOSE / CLEANUP
       ======================================================= */

    function cleanup() {

      window.removeEventListener(
        "mousemove",
        moveMouseDrag
      );

      window.removeEventListener(
        "mouseup",
        endMouseDrag
      );

      document.removeEventListener(
        "keydown",
        handleKeyDown
      );

      if (modal.parentNode) {
        modal.parentNode.removeChild(modal);
      }
    }


    function finish(value) {

      if (finished) {
        return;
      }

      finished = true;

      cleanup();

      resolve(value);
    }


    /* =======================================================
       CANCEL
       ======================================================= */

    function cancelCrop() {
      finish(null);
    }


    cancelButton.addEventListener(
      "click",
      cancelCrop
    );


    /* =======================================================
       EXPORT CROPPED IMAGE
       ======================================================= */

    confirmButton.addEventListener(
      "click",
      () => {

        confirmButton.disabled = true;

        confirmButton.textContent =
          "Processing...";


        /*
         * Export directly as WebP because
         * the avatar upload API requires WebP.
         */

        canvas.toBlob(
          (blob) => {

            if (!blob) {

              confirmButton.disabled = false;

              confirmButton.textContent =
                "Use This Avatar";

              return;
            }


            if (
              blob.size >
              2 * 1024 * 1024
            ) {

              confirmButton.disabled = false;

              confirmButton.textContent =
                "Use This Avatar";

              window.alert(
                "The cropped image is larger than 2 MB. Please reduce the zoom or try another image."
              );

              return;
            }


            const croppedFile =
              new File(
                [blob],
                "avatar.webp",
                {
                  type: "image/webp",
                  lastModified:
                    Date.now()
                }
              );


            finish(croppedFile);
          },
          "image/webp",
          0.92
        );
      }
    );


    /* =======================================================
       ESC KEY
       ======================================================= */

    function handleKeyDown(event) {

      if (
        event.key === "Escape" ||
        event.key === "Esc"
      ) {
        cancelCrop();
      }
    }


    document.addEventListener(
      "keydown",
      handleKeyDown
    );


    /* =======================================================
       CLICK BACKDROP TO CLOSE
       ======================================================= */

    modal.addEventListener(
      "mousedown",
      (event) => {

        if (
          event.target === modal
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
       ADD TO DOCUMENT
       ======================================================= */

    document.body.appendChild(modal);
  }


  /* =========================================================
     PUBLIC API
     ========================================================= */

  window.U9ProfilePage3AvatarCropper = {

    open: openPage3AvatarCropper,

    crop: openPage3AvatarCropper

  };

})();


/* =========================================================
   PROFILE PAGE 3
   PART 3/3
   CUSTOM AVATAR UPLOAD
   ========================================================= */

(function () {
  "use strict";


  /* =========================================================
     API
     ========================================================= */

  const U9_PROFILE_PAGE3_UPLOAD_AVATAR_API =
    "https://tvtakmswbzawaweytimx.supabase.co/functions/v1/avatar-upload";


  /* =========================================================
     CONSTANTS
     ========================================================= */

  const MAX_AVATAR_SIZE =
    2 * 1024 * 1024;


  /* =========================================================
     STATE
     ========================================================= */

  let page3UploadAvatarFile = null;

  let page3AvatarType = "free";
  let page3AvatarId = null;
  let page3AvatarUrl = null;
  let page3AvatarCooldownUntil = null;


  /* =========================================================
     TOKEN
     ========================================================= */

  function getPage3AvatarToken() {

    try {
      return localStorage.getItem("u9_token");
    } catch (error) {
      return null;
    }
  }


  /* =========================================================
     LOGIN
     ========================================================= */

  function page3AvatarIsLoggedIn() {
    return !!getPage3AvatarToken();
  }


  /* =========================================================
     LOAD CURRENT AVATAR STATE
     ========================================================= */

  function loadPage3AvatarState(user) {

    if (!user) {
      return;
    }

    const avatar =
      user.avatar || null;

    if (!avatar) {
      return;
    }

    page3AvatarType =
      avatar.type ||
      avatar.avatar_type ||
      "free";

    page3AvatarId =
      avatar.id ??
      avatar.avatar_id ??
      null;

    page3AvatarUrl =
      avatar.url ||
      avatar.avatar_url ||
      null;

    page3AvatarCooldownUntil =
      avatar.cooldown_until ||
      null;
  }


  /* =========================================================
     COOLDOWN
     ========================================================= */

  function isPage3AvatarUploadOnCooldown() {

    if (!page3AvatarCooldownUntil) {
      return false;
    }

    const cooldownTime =
      new Date(
        page3AvatarCooldownUntil
      ).getTime();

    if (!Number.isFinite(cooldownTime)) {
      return false;
    }

    return Date.now() < cooldownTime;
  }


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
     REFRESH AVATAR STATE
     ========================================================= */

  async function refreshPage3AvatarState() {

    try {

      if (
        window.U9User &&
        typeof window.U9User.refresh === "function"
      ) {
        await window.U9User.refresh();
      }


      if (
        window.U9User &&
        typeof window.U9User.get === "function"
      ) {
        const user =
          window.U9User.get();

        loadPage3AvatarState(user);
      }


      if (
        window.U9Profile &&
        typeof window.U9Profile.refreshAvatar === "function"
      ) {
        await window.U9Profile.refreshAvatar();
      }

      return true;

    } catch (error) {

      console.error(
        "Failed to refresh avatar state:",
        error
      );

      return false;
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

    if (!page3AvatarIsLoggedIn()) {

      window.alert(
        "Please sign in before uploading an avatar."
      );

      return false;
    }


    if (!file) {

      window.alert(
        "Please choose an image first."
      );

      return false;
    }


    if (
      !file.type ||
      file.type !== "image/webp"
    ) {

      window.alert(
        "The cropped avatar must be a WebP image."
      );

      return false;
    }


    if (file.size <= 0) {

      window.alert(
        "The image file is empty."
      );

      return false;
    }


    if (
      file.size >
      MAX_AVATAR_SIZE
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

        button.disabled = true;

        button.textContent =
          "Uploading...";
      }


      const formData =
        new FormData();

      formData.append(
        "avatar",
        file,
        "avatar.webp"
      );


      const response =
        await fetch(
          U9_PROFILE_PAGE3_UPLOAD_AVATAR_API,
          {
            method: "POST",

            headers: {
              Authorization:
                `Bearer ${token}`
            },

            body: formData,

            credentials: "omit"
          }
        );


      let data = null;

      try {

        data =
          await response.json();

      } catch (jsonError) {

        data = null;
      }


      if (!response.ok) {

        if (
          response.status === 429
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
                  data.error
                    ? data.error
                    : "Your custom avatar is still on cooldown."
                );


          window.alert(message);

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
         SAVE RESPONSE
         ===================================================== */

      const avatar =
        data.avatar || {};


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
        input.value = "";
      }


      /* =====================================================
         REFRESH PROFILE
         ===================================================== */

      await refreshPage3AvatarState();


      /* =====================================================
         SUCCESS
         ===================================================== */

      window.alert(
        "Avatar uploaded successfully."
      );


      return true;

    } catch (error) {

      console.error(
        "Custom avatar upload failed:",
        error
      );


      window.alert(
        "Unable to upload the avatar. Please try again."
      );


      return false;

    } finally {

      if (button) {

        button.disabled = false;

        button.textContent =
          originalButtonText ||
          "Upload Avatar";
      }
    }
  }


  /* =========================================================
     HANDLE SELECTED FILE
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
      !file.type.startsWith("image/")
    ) {

      window.alert(
        "Please choose a valid image file."
      );

      return null;
    }


    /*
     * The original image may be larger than 2 MB.
     * The 2 MB limit applies to the final WebP crop.
     */


    try {

      const croppedFile =
        await window
          .U9ProfilePage3AvatarCropper
          .open(file);


      if (!croppedFile) {
        return null;
      }


      if (
        croppedFile.size >
        MAX_AVATAR_SIZE
      ) {

        window.alert(
          "The cropped avatar must be 2 MB or smaller."
        );

        return null;
      }


      page3UploadAvatarFile =
        croppedFile;


      if (previewElement) {

        const previewUrl =
          URL.createObjectURL(
            croppedFile
          );


        previewElement.src =
          previewUrl;


        previewElement.onload = () => {

          URL.revokeObjectURL(
            previewUrl
          );
        };
      }


      return croppedFile;

    } catch (error) {

      console.error(
        "Avatar crop failed:",
        error
      );


      window.alert(
        "Unable to process this image."
      );


      return null;
    }
  }


  /* =========================================================
     CREATE UPLOAD UI
     ========================================================= */

  function renderPage3CustomAvatarUpload(
    panel
  ) {

    if (!panel) {
      return null;
    }


    panel.innerHTML = "";


    /* =======================================================
       CONTAINER
       ======================================================= */

    const container =
      document.createElement("div");

    Object.assign(container.style, {
      width: "100%",
      boxSizing: "border-box"
    });

    panel.appendChild(container);


    /* =======================================================
       TITLE
       ======================================================= */

    const title =
      document.createElement("div");

    title.textContent =
      "Custom Avatar";

    Object.assign(title.style, {
      fontSize: "18px",
      fontWeight: "700",
      color: "#111111",
      marginBottom: "6px"
    });

    container.appendChild(title);


    /* =======================================================
       DESCRIPTION
       ======================================================= */

    const description =
      document.createElement("div");

    description.textContent =
      "Upload an image and crop it into a square avatar.";

    Object.assign(description.style, {
      fontSize: "14px",
      color: "#666666",
      lineHeight: "1.5",
      marginBottom: "16px"
    });

    container.appendChild(description);


    /* =======================================================
       PREVIEW
       ======================================================= */

    const previewWrapper =
      document.createElement("div");

    Object.assign(previewWrapper.style, {
      display: "flex",
      justifyContent: "center",
      marginBottom: "16px"
    });

    container.appendChild(
      previewWrapper
    );


    const preview =
      document.createElement("img");

    preview.alt =
      "Avatar preview";

    Object.assign(preview.style, {
      width: "120px",
      height: "120px",
      objectFit: "cover",
      borderRadius: "50%",
      background: "#f1f1f1",
      display: "block"
    });


    if (page3AvatarUrl) {

      preview.src =
        page3AvatarUrl;
    }


    previewWrapper.appendChild(
      preview
    );


    /* =======================================================
       FILE INPUT
       ======================================================= */

    const input =
      document.createElement("input");

    input.type = "file";

    input.accept =
      "image/*";

    input.style.display =
      "none";

    container.appendChild(input);


    /* =======================================================
       BUTTON ROW
       ======================================================= */

    const buttonRow =
      document.createElement("div");

    Object.assign(buttonRow.style, {
      display: "flex",
      gap: "10px",
      flexWrap: "wrap"
    });

    container.appendChild(
      buttonRow
    );


    /* =======================================================
       CHOOSE BUTTON
       ======================================================= */

    const chooseButton =
      document.createElement("button");

    chooseButton.type =
      "button";

    chooseButton.textContent =
      "Choose Image";

    Object.assign(chooseButton.style, {
      border: "1px solid #d7d7d7",
      background: "#ffffff",
      color: "#222222",
      padding: "10px 16px",
      borderRadius: "10px",
      fontSize: "14px",
      fontWeight: "600",
      cursor: "pointer"
    });

    buttonRow.appendChild(
      chooseButton
    );


    /* =======================================================
       UPLOAD BUTTON
       ======================================================= */

    const uploadButton =
      document.createElement("button");

    uploadButton.type =
      "button";

    uploadButton.textContent =
      "Upload Avatar";

    Object.assign(uploadButton.style, {
      border: "none",
      background: "#111111",
      color: "#ffffff",
      padding: "10px 16px",
      borderRadius: "10px",
      fontSize: "14px",
      fontWeight: "600",
      cursor: "pointer"
    });

    buttonRow.appendChild(
      uploadButton
    );


    /* =======================================================
       STATUS
       ======================================================= */

    const status =
      document.createElement("div");

    Object.assign(status.style, {
      marginTop: "12px",
      fontSize: "13px",
      color: "#666666",
      lineHeight: "1.5"
    });

    container.appendChild(
      status
    );


    /* =======================================================
       COOLDOWN STATUS
       ======================================================= */

    function updateCooldownStatus() {

      if (
        isPage3AvatarUploadOnCooldown()
      ) {

        const remaining =
          formatPage3AvatarCooldown();


        status.textContent =
          remaining
            ? `Custom avatar upload is on cooldown. Try again in ${remaining}.`
            : "Custom avatar upload is currently unavailable.";

        status.style.color =
          "#b45309";

        uploadButton.disabled =
          true;

        uploadButton.style.opacity =
          "0.6";

        uploadButton.style.cursor =
          "not-allowed";

        return;
      }


      status.textContent =
        page3UploadAvatarFile
          ? "Avatar is ready to upload."
          : "Select an image to begin.";

      status.style.color =
        "#666666";

      uploadButton.disabled =
        false;

      uploadButton.style.opacity =
        "1";

      uploadButton.style.cursor =
        "pointer";
    }


    /* =======================================================
       CHOOSE IMAGE
       ======================================================= */

    chooseButton.addEventListener(
      "click",
      () => {

        if (
          isPage3AvatarUploadOnCooldown()
        ) {

          const remaining =
            formatPage3AvatarCooldown();

          window.alert(
            remaining
              ? `You can upload another custom avatar in ${remaining}.`
              : "Custom avatar upload is currently unavailable."
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
      async () => {

        const file =
          input.files &&
          input.files[0];

        if (!file) {
          return;
        }


        chooseButton.disabled =
          true;

        uploadButton.disabled =
          true;

        status.textContent =
          "Opening image editor...";


        try {

          await handlePage3AvatarFile(
            file,
            preview
          );

        } finally {

          chooseButton.disabled =
            false;

          updateCooldownStatus();
        }
      }
    );


    /* =======================================================
       UPLOAD
       ======================================================= */

    uploadButton.addEventListener(
      "click",
      async () => {

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

          status.textContent =
            "Avatar uploaded successfully.";

          status.style.color =
            "#15803d";


          if (page3AvatarUrl) {

            preview.src =
              page3AvatarUrl;
          }


          updateCooldownStatus();

        } else {

          updateCooldownStatus();
        }
      }
    );


    /* =======================================================
       INITIAL STATUS
       ======================================================= */

    updateCooldownStatus();


    /* =======================================================
       RETURN REFERENCES
       ======================================================= */

    return {
      container,
      input,
      preview,
      chooseButton,
      uploadButton,
      status
    };
  }


  /* =========================================================
     PUBLIC API
     ========================================================= */

  window.U9ProfilePage3Avatar = {

    getState() {

      return {
        type:
          page3AvatarType,

        id:
          page3AvatarId,

        url:
          page3AvatarUrl,

        cooldown_until:
          page3AvatarCooldownUntil,

        uploadFile:
          page3UploadAvatarFile
      };
    },


    loadState:
      loadPage3AvatarState,


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
     OPTIONAL GLOBAL HELPERS
     ========================================================= */

  window.U9ProfilePage3UploadAvatar =
    uploadPage3CustomAvatar;


  window.U9ProfilePage3RenderCustomAvatar =
    renderPage3CustomAvatarUpload;

})();
