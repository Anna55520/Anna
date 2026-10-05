/* =========================================================
   PROFILE PAGE 3
   Avatar / Custom Avatar / Free Avatar Frame / Paid Avatar Frame
========================================================= */


/* =========================================================
   API
========================================================= */

const U9_PROFILE_PAGE3_FREE_AVATAR_API =
  "https://tvtakmswbzawaweytimx.supabase.co/functions/v1/avatar-free";

const U9_PROFILE_PAGE3_SET_AVATAR_API =
  "https://tvtakmswbzawaweytimx.supabase.co/functions/v1/avatar-set";

const U9_PROFILE_PAGE3_UPLOAD_AVATAR_API =
  "https://tvtakmswbzawaweytimx.supabase.co/functions/v1/avatar-upload";

const U9_PROFILE_PAGE3_FREE_FRAME_API =
  "https://tvtakmswbzawaweytimx.supabase.co/functions/v1/avatar-frame-free";

const U9_PROFILE_PAGE3_PAID_FRAME_API =
  "https://tvtakmswbzawaweytimx.supabase.co/functions/v1/avatar-frame-paid";

const U9_PROFILE_PAGE3_EQUIP_FRAME_API =
  "https://tvtakmswbzawaweytimx.supabase.co/functions/v1/avatar-frame-equip";

const U9_PROFILE_PAGE3_PURCHASE_FRAME_API =
  "https://tvtakmswbzawaweytimx.supabase.co/functions/v1/avatar-frame-paid-purchase";


/* =========================================================
   ELEMENTS
========================================================= */

const profilePage3Content =
  document.getElementById(
    "U9-profile-page3-content"
  );


/* =========================================================
   STATE
========================================================= */

let currentAvatarId = null;

let currentAvatarType = "free";

let currentAvatarUrl = null;

let currentAvatarCooldownUntil = null;

let currentFrameType = "default";

let currentFrameId = null;

let freeFrames = [];

let paidFrames = [];

let activePage3Tab = "avatar";

let page3Initialized = false;

let uploadAvatarFile = null;


/* =========================================================
   CONSTANTS
========================================================= */

const U9_PROFILE_PAGE3_MAX_AVATAR_SIZE =
  2 * 1024 * 1024;


/* =========================================================
   TOKEN
========================================================= */

function getPage3Token() {

  try {

    return localStorage.getItem(
      "u9_token"
    );

  }

  catch(error) {

    console.error(
      "PAGE3 TOKEN ERROR:",
      error
    );

    return null;

  }

}


/* =========================================================
   AUTH CHECK
========================================================= */

function page3IsLoggedIn() {

  if (
    window.U9User &&
    typeof window.U9User.isLoggedIn ===
      "function"
  ) {

    return window.U9User.isLoggedIn();

  }

  return !!getPage3Token();

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapePage3HTML(value) {

  if (
    value === null ||
    value === undefined
  ) {

    return "";

  }

  return String(value)
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );

}


/* =========================================================
   IMAGE / SVG
========================================================= */

function setPage3ImageSource(
  image,
  source
) {

  if (
    !image ||
    !source
  ) {

    return;

  }

  const value =
    String(source).trim();


  if (
    value.startsWith("<svg") ||
    value.startsWith("<?xml")
  ) {

    image.src =
      "data:image/svg+xml;charset=UTF-8," +
      encodeURIComponent(value);

    return;

  }


  image.src =
    value;

}


/* =========================================================
   CURRENT USER EQUIPMENT
========================================================= */

function loadCurrentEquipment() {

  const user =
    window.U9User &&
    typeof window.U9User.get ===
      "function"
      ? window.U9User.get()
      : null;


  /* -------------------------------------------------------
     AVATAR TYPE
  ------------------------------------------------------- */

  currentAvatarType =
    user?.avatar?.type ||
    user?.avatar?.avatar_type ||
    user?.avatar_type ||
    "free";


  /* -------------------------------------------------------
     AVATAR ID
  ------------------------------------------------------- */

  currentAvatarId =
    user?.avatar?.id ||
    user?.avatar?.avatar_id ||
    user?.avatar_id ||
    null;


  /* -------------------------------------------------------
     CUSTOM AVATAR URL
  ------------------------------------------------------- */

  currentAvatarUrl =
    user?.avatar?.url ||
    user?.avatar?.avatar_url ||
    user?.avatar_url ||
    null;


  /* -------------------------------------------------------
     COOLDOWN
  ------------------------------------------------------- */

  currentAvatarCooldownUntil =
    user?.avatar?.cooldown_until ||
    user?.avatar?.cooldownUntil ||
    user?.cooldown_until ||
    user?.avatar_cooldown_until ||
    null;


  /* -------------------------------------------------------
     FRAME TYPE
  ------------------------------------------------------- */

  currentFrameType =
    user?.avatar_frame_type ||
    user?.avatarFrameType ||
    user?.frame_type ||
    "default";


  /* -------------------------------------------------------
     FRAME ID
  ------------------------------------------------------- */

  currentFrameId =
    user?.avatar_frame_id ||
    user?.avatarFrameId ||
    user?.frame_id ||
    null;


  console.log(
    "PAGE3 CURRENT USER DATA:",
    {
      avatarType:
        currentAvatarType,

      avatarId:
        currentAvatarId,

      avatarUrl:
        currentAvatarUrl,

      cooldownUntil:
        currentAvatarCooldownUntil,

      frameType:
        currentFrameType,

      frameId:
        currentFrameId
    }
  );

}


/* =========================================================
   CHECK AVATAR UPLOAD COOLDOWN
========================================================= */

function isAvatarUploadOnCooldown() {

  if (
    !currentAvatarCooldownUntil
  ) {

    return false;

  }

  const cooldownTime =
    new Date(
      currentAvatarCooldownUntil
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

function formatAvatarCooldown() {

  if (
    !currentAvatarCooldownUntil
  ) {

    return "";

  }


  const cooldownTime =
    new Date(
      currentAvatarCooldownUntil
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
      `${days}天`
    );

  }


  if (
    hours > 0
  ) {

    parts.push(
      `${hours}小时`
    );

  }


  if (
    minutes > 0 &&
    days === 0
  ) {

    parts.push(
      `${minutes}分钟`
    );

  }


  if (
    !parts.length
  ) {

    return "即将结束";

  }


  return parts.join("");

}


/* =========================================================
   REFRESH USER + PROFILE
========================================================= */

async function refreshProfileAfterChange() {

  try {

    let user = null;


    /* -----------------------------------------------------
       REFRESH U9 USER
    ----------------------------------------------------- */

    if (
      window.U9User &&
      typeof window.U9User.refresh ===
        "function"
    ) {

      user =
        await window.U9User.refresh();

    }


    /* -----------------------------------------------------
       UPDATE LOCAL STATE
    ----------------------------------------------------- */

    if (user) {

      currentAvatarType =
        user?.avatar?.type ||
        user?.avatar?.avatar_type ||
        user?.avatar_type ||
        currentAvatarType;


      currentAvatarId =
        user?.avatar?.id ||
        user?.avatar?.avatar_id ||
        user?.avatar_id ||
        currentAvatarId;


      currentAvatarUrl =
        user?.avatar?.url ||
        user?.avatar?.avatar_url ||
        user?.avatar_url ||
        currentAvatarUrl;


      currentAvatarCooldownUntil =
        user?.avatar?.cooldown_until ||
        user?.avatar?.cooldownUntil ||
        user?.cooldown_until ||
        user?.avatar_cooldown_until ||
        currentAvatarCooldownUntil;


      currentFrameType =
        user?.avatar_frame_type ||
        user?.avatarFrameType ||
        user?.frame_type ||
        currentFrameType ||
        "default";


      currentFrameId =
        user?.avatar_frame_id ||
        user?.avatarFrameId ||
        user?.frame_id ||
        currentFrameId;

    }


    /* -----------------------------------------------------
       UPDATE BUTTONS
    ----------------------------------------------------- */

    updateAvatarButtons();

    updateFrameButtons();


    /* -----------------------------------------------------
       REFRESH PROFILE AVATAR
    ----------------------------------------------------- */

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

  catch(error) {

    console.error(
      "PAGE3 PROFILE REFRESH ERROR:",
      error
    );

    return false;

  }

}


/* =========================================================
   CREATE BASE UI
========================================================= */

function createPage3UI() {

  if (
    !profilePage3Content
  ) {

    console.error(
      "U9-profile-page3-content not found."
    );

    return;

  }


  profilePage3Content.innerHTML =
    "";


  /* =======================================================
     TABS
  ======================================================= */

  const tabs =
    document.createElement(
      "div"
    );

  tabs.className =
    "U9-profile-page3-tabs";


  const avatarTab =
    createPage3Tab(
      "avatar",
      "头像"
    );


  const freeFrameTab =
    createPage3Tab(
      "free-frame",
      "免费头像框"
    );


  const paidFrameTab =
    createPage3Tab(
      "paid-frame",
      "付费头像框"
    );


  tabs.appendChild(
    avatarTab
  );

  tabs.appendChild(
    freeFrameTab
  );

  tabs.appendChild(
    paidFrameTab
  );


  profilePage3Content.appendChild(
    tabs
  );


  /* =======================================================
     PANEL
  ======================================================= */

  const panel =
    document.createElement(
      "div"
    );

  panel.id =
    "U9-profile-page3-panel";

  panel.className =
    "U9-profile-page3-panel";


  profilePage3Content.appendChild(
    panel
  );


  page3Initialized =
    true;

}


/* =========================================================
   CREATE TAB
========================================================= */

function createPage3Tab(
  tabName,
  text
) {

  const button =
    document.createElement(
      "button"
    );

  button.type =
    "button";

  button.className =
    "U9-profile-page3-tab";

  button.dataset.tab =
    tabName;

  button.textContent =
    text;


  button.addEventListener(
    "click",
    async function() {

      await switchPage3Tab(
        tabName
      );

    }
  );


  return button;

}


/* =========================================================
   UPDATE TAB STATE
========================================================= */

function updatePage3Tabs() {

  const tabs =
    document.querySelectorAll(
      ".U9-profile-page3-tab"
    );


  tabs.forEach(
    function(tab) {

      const active =
        tab.dataset.tab ===
        activePage3Tab;


      tab.classList.toggle(
        "active",
        active
      );

    }
  );

}


/* =========================================================
   SWITCH TAB
========================================================= */

async function switchPage3Tab(
  tabName
) {

  activePage3Tab =
    tabName;


  updatePage3Tabs();


  const panel =
    document.getElementById(
      "U9-profile-page3-panel"
    );


  if (!panel) {

    return;

  }


  panel.innerHTML =
    "";


  /* -------------------------------------------------------
     AVATAR
  ------------------------------------------------------- */

  if (
    tabName === "avatar"
  ) {

    /*
     * IMPORTANT:
     * Custom avatar upload is rendered FIRST.
     */

    renderCustomAvatarUpload(
      panel
    );


    await renderFreeAvatars(
      panel,
      true
    );


    return;

  }


  /* -------------------------------------------------------
     FREE FRAME
  ------------------------------------------------------- */

  if (
    tabName === "free-frame"
  ) {

    await renderFreeFrames(
      panel
    );

    return;

  }


  /* -------------------------------------------------------
     PAID FRAME
  ------------------------------------------------------- */

  if (
    tabName === "paid-frame"
  ) {

    await renderPaidFrames(
      panel
    );

    return;

  }

}


/* =========================================================
   MESSAGE
========================================================= */

function showPage3Message(
  panel,
  message,
  type = "info"
) {

  if (!panel) {

    return;

  }


  const messageElement =
    document.createElement(
      "div"
    );

  messageElement.className =
    "U9-profile-page3-message " +
    type;

  messageElement.textContent =
    message;


  panel.appendChild(
    messageElement
  );

}


/* =========================================================
   LOGIN MESSAGE
========================================================= */

function requirePage3Login(
  panel
) {

  if (
    page3IsLoggedIn()
  ) {

    return true;

  }


  showPage3Message(
    panel,
    "请先登录后再使用此功能。",
    "error"
  );


  return false;

}


/* =========================================================
   CUSTOM AVATAR UPLOAD UI
   PNG / JPG / JPEG / WEBP / GIF ...
   + 1:1 CROP
========================================================= */

function renderCustomAvatarUpload(panel) {

  if (!panel) {
    return;
  }

  const uploadBox =
    document.createElement("div");

  uploadBox.className =
    "U9-profile-page3-upload";


  /* =======================================================
     TITLE
  ======================================================= */

  const title =
    document.createElement("div");

  title.className =
    "U9-profile-page3-upload-title";

  title.textContent =
    "自定义头像";

  uploadBox.appendChild(title);


  /* =======================================================
     DESCRIPTION
  ======================================================= */

  const description =
    document.createElement("div");

  description.className =
    "U9-profile-page3-upload-description";

  description.textContent =
    "支持 PNG、JPG、JPEG、WebP、GIF 等图片。选择后可以裁剪头像，最终会自动裁剪为 1:1。最大 2MB，每次上传后有 7 天冷却时间。";

  uploadBox.appendChild(description);


  /* =======================================================
     CURRENT CUSTOM AVATAR
  ======================================================= */

  if (
    currentAvatarUrl &&
    currentAvatarType === "custom"
  ) {

    const current =
      document.createElement("div");

    current.className =
      "U9-profile-page3-upload-current";


    const currentImage =
      document.createElement("img");

    currentImage.alt =
      "当前自定义头像";

    currentImage.src =
      currentAvatarUrl;


    current.appendChild(
      currentImage
    );


    const currentText =
      document.createElement("div");

    currentText.className =
      "U9-profile-page3-upload-current-text";

    currentText.textContent =
      "当前正在使用自定义头像";


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

  if (
    isAvatarUploadOnCooldown()
  ) {

    const cooldown =
      document.createElement("div");

    cooldown.className =
      "U9-profile-page3-upload-cooldown";

    cooldown.textContent =
      "头像上传冷却中，还剩 " +
      formatAvatarCooldown() +
      "。";

    uploadBox.appendChild(
      cooldown
    );

  }


  /* =======================================================
     FILE INPUT
  ======================================================= */

  const input =
    document.createElement("input");

  input.type =
    "file";

  /*
   * IMPORTANT:
   * 不再限制 WebP。
   *
   * image/* = 浏览器支持的图片格式
   */
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
    document.createElement("div");

  fileName.className =
    "U9-profile-page3-upload-file-name";

  fileName.textContent =
    "尚未选择图片";


  uploadBox.appendChild(
    fileName
  );


  /* =======================================================
     CROPPED PREVIEW
  ======================================================= */

  const preview =
    document.createElement("img");

  preview.className =
    "U9-profile-page3-upload-preview";

  preview.alt =
    "头像预览";

  preview.style.display =
    "none";


  uploadBox.appendChild(
    preview
  );


  /* =======================================================
     UPLOAD BUTTON
  ======================================================= */

  const uploadButton =
    document.createElement("button");

  uploadButton.type =
    "button";

  uploadButton.className =
    "U9-profile-page3-upload-button";

  uploadButton.textContent =
    "上传头像";


  if (
    isAvatarUploadOnCooldown()
  ) {

    uploadButton.disabled =
      true;

  }


  uploadBox.appendChild(
    uploadButton
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


      uploadAvatarFile =
        null;


      if (!file) {

        fileName.textContent =
          "尚未选择图片";

        preview.style.display =
          "none";

        preview.removeAttribute(
          "src"
        );

        return;
      }


      fileName.textContent =
        file.name;


      /* ---------------------------------------------------
         FILE TYPE
      --------------------------------------------------- */

      if (
        !file.type ||
        !file.type.startsWith("image/")
      ) {

        alert(
          "请选择图片文件，例如 PNG、JPG、JPEG、WebP 等。"
        );

        input.value =
          "";

        return;
      }


      /* ---------------------------------------------------
         FILE SIZE
      --------------------------------------------------- */

      if (
        file.size <= 0
      ) {

        alert(
          "图片文件无效。"
        );

        input.value =
          "";

        return;
      }


      if (
        file.size >
        U9_PROFILE_PAGE3_MAX_AVATAR_SIZE
      ) {

        alert(
          "原始图片不能超过 2MB。"
        );

        input.value =
          "";

        return;
      }


      /* ---------------------------------------------------
         COOLDOWN
      --------------------------------------------------- */

      if (
        isAvatarUploadOnCooldown()
      ) {

        alert(
          "头像还在冷却中，还剩 " +
          formatAvatarCooldown() +
          "。"
        );

        input.value =
          "";

        return;
      }


      /* ---------------------------------------------------
         OPEN CROP
      --------------------------------------------------- */

      const croppedFile =
        await openAvatarCropper(file);


      /*
       * 用户取消裁剪
       */
      if (!croppedFile) {

        input.value =
          "";

        fileName.textContent =
          "尚未选择图片";

        preview.style.display =
          "none";

        preview.removeAttribute(
          "src"
        );

        uploadAvatarFile =
          null;

        return;
      }


      /* ---------------------------------------------------
         SAVE CROPPED FILE
      --------------------------------------------------- */

      uploadAvatarFile =
        croppedFile;


      fileName.textContent =
        file.name +
        " → 已裁剪";


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

    }
  );


  /* =======================================================
     UPLOAD CLICK
  ======================================================= */

  uploadButton.addEventListener(
    "click",
    async function() {

      await uploadCustomAvatar(
        uploadAvatarFile,
        uploadButton,
        input
      );

    }
  );


  panel.appendChild(
    uploadBox
  );

}


/* =========================================================
   AVATAR CROPPER
   1:1 SQUARE
========================================================= */

function openAvatarCropper(file) {

  return new Promise(
    function(resolve) {

      const objectUrl =
        URL.createObjectURL(file);


      const image =
        new Image();


      image.onload =
        function() {

          URL.revokeObjectURL(
            objectUrl
          );


          createAvatarCropModal(
            image,
            resolve
          );

        };


      image.onerror =
        function() {

          URL.revokeObjectURL(
            objectUrl
          );

          alert(
            "无法读取这张图片。"
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

function createAvatarCropModal(
  image,
  resolve
) {

  const modal =
    document.createElement("div");

  modal.className =
    "U9-avatar-crop-modal";


  const box =
    document.createElement("div");

  box.className =
    "U9-avatar-crop-box";


  /* =======================================================
     TITLE
  ======================================================= */

  const title =
    document.createElement("div");

  title.className =
    "U9-avatar-crop-title";

  title.textContent =
    "调整头像";

  box.appendChild(
    title
  );


  /* =======================================================
     DESCRIPTION
  ======================================================= */

  const description =
    document.createElement("div");

  description.className =
    "U9-avatar-crop-description";

  description.textContent =
    "拖动图片调整位置，使用滑块调整大小";

  box.appendChild(
    description
  );


  /* =======================================================
     CROP AREA
  ======================================================= */

  const cropArea =
    document.createElement("div");

  cropArea.className =
    "U9-avatar-crop-area";


  const canvas =
    document.createElement("canvas");

  canvas.className =
    "U9-avatar-crop-canvas";

  canvas.width =
    512;

  canvas.height =
    512;


  cropArea.appendChild(
    canvas
  );


  box.appendChild(
    cropArea
  );


  const ctx =
    canvas.getContext("2d");


  /* =======================================================
     IMAGE STATE
  ======================================================= */

  const canvasSize =
    512;


  const imageRatio =
    image.width /
    image.height;


  let scale =
    Math.max(
      canvasSize / image.width,
      canvasSize / image.height
    );


  const minScale =
    scale;


  let maxScale =
    minScale * 4;


  let offsetX =
    (canvasSize -
      image.width * scale) / 2;


  let offsetY =
    (canvasSize -
      image.height * scale) / 2;


  let dragging =
    false;


  let startX =
    0;


  let startY =
    0;


  let startOffsetX =
    0;


  let startOffsetY =
    0;


  /* =======================================================
     DRAW
  ======================================================= */

  function draw() {

    ctx.clearRect(
      0,
      0,
      canvasSize,
      canvasSize
    );


    /*
     * Background
     */
    ctx.fillStyle =
      "#ffffff";

    ctx.fillRect(
      0,
      0,
      canvasSize,
      canvasSize
    );


    /*
     * Draw image
     */
    ctx.drawImage(
      image,
      offsetX,
      offsetY,
      image.width * scale,
      image.height * scale
    );


    /*
     * Crop border
     */
    ctx.save();

    ctx.strokeStyle =
      "#ffffff";

    ctx.lineWidth =
      4;

    ctx.strokeRect(
      2,
      2,
      canvasSize - 4,
      canvasSize - 4
    );

    ctx.restore();

  }


  /* =======================================================
     ZOOM
  ======================================================= */

  const zoom =
    document.createElement("input");

  zoom.type =
    "range";

  zoom.min =
    String(minScale);

  zoom.max =
    String(maxScale);

  zoom.step =
    String(minScale / 100);

  zoom.value =
    String(scale);

  zoom.className =
    "U9-avatar-crop-zoom";


  box.appendChild(
    zoom
  );


  zoom.addEventListener(
    "input",
    function() {

      const oldScale =
        scale;


      scale =
        Number(
          zoom.value
        );


      /*
       * Keep image centered
       * while zooming.
       */
      const centerX =
        canvasSize / 2;

      const centerY =
        canvasSize / 2;


      offsetX =
        centerX -
        (
          centerX -
          offsetX
        ) *
        (
          scale /
          oldScale
        );


      offsetY =
        centerY -
        (
          centerY -
          offsetY
        ) *
        (
          scale /
          oldScale
        );


      constrainCrop();

      draw();

    }
  );


  /* =======================================================
     KEEP IMAGE INSIDE CROP
  ======================================================= */

  function constrainCrop() {

    const width =
      image.width *
      scale;

    const height =
      image.height *
      scale;


    /*
     * Image must completely
     * cover the square.
     */

    if (
      width <= canvasSize
    ) {

      offsetX =
        (canvasSize -
          width) / 2;

    }

    else {

      const minX =
        canvasSize -
        width;

      const maxX =
        0;


      if (
        offsetX < minX
      ) {

        offsetX =
          minX;

      }


      if (
        offsetX > maxX
      ) {

        offsetX =
          maxX;

      }

    }


    if (
      height <= canvasSize
    ) {

      offsetY =
        (canvasSize -
          height) / 2;

    }

    else {

      const minY =
        canvasSize -
        height;

      const maxY =
        0;


      if (
        offsetY < minY
      ) {

        offsetY =
          minY;

      }


      if (
        offsetY > maxY
      ) {

        offsetY =
          maxY;

      }

    }

  }


  /* =======================================================
     MOUSE DRAG
  ======================================================= */

  canvas.addEventListener(
    "mousedown",
    function(event) {

      dragging =
        true;


      startX =
        event.clientX;


      startY =
        event.clientY;


      startOffsetX =
        offsetX;


      startOffsetY =
        offsetY;


      canvas.classList.add(
        "dragging"
      );

    }
  );


  window.addEventListener(
    "mousemove",
    function(event) {

      if (!dragging) {
        return;
      }


      offsetX =
        startOffsetX +
        (
          event.clientX -
          startX
        );


      offsetY =
        startOffsetY +
        (
          event.clientY -
          startY
        );


      constrainCrop();

      draw();

    }
  );


  window.addEventListener(
    "mouseup",
    function() {

      dragging =
        false;


      canvas.classList.remove(
        "dragging"
      );

    }
  );


  /* =======================================================
     TOUCH DRAG
  ======================================================= */

  canvas.addEventListener(
    "touchstart",
    function(event) {

      if (
        !event.touches.length
      ) {
        return;
      }


      const touch =
        event.touches[0];


      dragging =
        true;


      startX =
        touch.clientX;


      startY =
        touch.clientY;


      startOffsetX =
        offsetX;


      startOffsetY =
        offsetY;

    },
    {
      passive: true
    }
  );


  canvas.addEventListener(
    "touchmove",
    function(event) {

      if (
        !dragging ||
        !event.touches.length
      ) {
        return;
      }


      const touch =
        event.touches[0];


      offsetX =
        startOffsetX +
        (
          touch.clientX -
          startX
        );


      offsetY =
        startOffsetY +
        (
          touch.clientY -
          startY
        );


      constrainCrop();

      draw();

      event.preventDefault();

    },
    {
      passive: false
    }
  );


  canvas.addEventListener(
    "touchend",
    function() {

      dragging =
        false;

    }
  );


  /* =======================================================
     BUTTONS
  ======================================================= */

  const buttons =
    document.createElement("div");

  buttons.className =
    "U9-avatar-crop-buttons";


  const cancelButton =
    document.createElement("button");

  cancelButton.type =
    "button";

  cancelButton.className =
    "U9-avatar-crop-cancel";

  cancelButton.textContent =
    "取消";


  const confirmButton =
    document.createElement("button");

  confirmButton.type =
    "button";

  confirmButton.className =
    "U9-avatar-crop-confirm";

  confirmButton.textContent =
    "使用这个头像";


  buttons.appendChild(
    cancelButton
  );

  buttons.appendChild(
    confirmButton
  );


  box.appendChild(
    buttons
  );


  /* =======================================================
     CLOSE MODAL
  ======================================================= */

  function closeCrop(
    result
  ) {

    modal.remove();

    document.body.style.overflow =
      "";

    resolve(
      result
    );

  }


  cancelButton.addEventListener(
    "click",
    function() {

      closeCrop(
        null
      );

    }
  );


  /* =======================================================
     EXPORT CROPPED IMAGE
  ======================================================= */

  confirmButton.addEventListener(
    "click",
    function() {

      confirmButton.disabled =
        true;

      confirmButton.textContent =
        "处理中...";


      /*
       * Export:
       *
       * 512 x 512
       * WebP
       *
       * 所以不管用户选择 PNG、
       * JPG、JPEG、WebP，
       * 最后上传格式统一。
       */

      canvas.toBlob(
        function(blob) {

          if (!blob) {

            confirmButton.disabled =
              false;

            confirmButton.textContent =
              "使用这个头像";

            alert(
              "头像裁剪失败，请重新选择图片。"
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


          closeCrop(
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

  function escHandler(
    event
  ) {

    if (
      event.key ===
      "Escape"
    ) {

      closeCrop(
        null
      );


      document.removeEventListener(
        "keydown",
        escHandler
      );

    }

  }


  document.addEventListener(
    "keydown",
    escHandler
  );


  /* =======================================================
     SHOW
  ======================================================= */

  modal.appendChild(
    box
  );


  document.body.appendChild(
    modal
  );


  document.body.style.overflow =
    "hidden";


  draw();

  cropArea.style.touchAction =
    "none";

}


/* =========================================================
   UPLOAD CUSTOM AVATAR
========================================================= */

async function uploadCustomAvatar(
  file,
  button,
  input
) {

  /* =======================================================
     LOGIN
  ======================================================= */

  if (
    !page3IsLoggedIn()
  ) {

    alert(
      "请先登录。"
    );

    return;

  }


  /* =======================================================
     COOLDOWN
  ======================================================= */

  if (
    isAvatarUploadOnCooldown()
  ) {

    alert(
      "头像还在冷却中，还剩 " +
      formatAvatarCooldown() +
      "。"
    );

    return;

  }


  /* =======================================================
     FILE
  ======================================================= */

  if (!file) {

    alert(
      "请先选择并裁剪一张图片。"
    );

    return;

  }


  /*
   * 注意：
   * 这里收到的 file 已经是
   * crop 后的 avatar.webp。
   *
   * 所以后端仍然可以使用
   * image/webp。
   */

  if (
    file.type !==
    "image/webp"
  ) {

    alert(
      "头像裁剪结果无效，请重新选择图片。"
    );

    return;

  }


  /* =======================================================
     SIZE
  ======================================================= */

  if (
    file.size <= 0
  ) {

    alert(
      "图片文件无效。"
    );

    return;

  }


  if (
    file.size >
    U9_PROFILE_PAGE3_MAX_AVATAR_SIZE
  ) {

    alert(
      "裁剪后的头像不能超过 2MB。"
    );

    return;

  }


  /* =======================================================
     TOKEN
  ======================================================= */

  const token =
    getPage3Token();


  if (!token) {

    alert(
      "登录状态已失效，请重新登录。"
    );

    return;

  }


  /* =======================================================
     BUTTON
  ======================================================= */

  if (button) {

    button.disabled =
      true;

    button.classList.add(
      "loading"
    );

    button.textContent =
      "上传中...";

  }


  try {

    /* =====================================================
       FORMDATA
    ===================================================== */

    const formData =
      new FormData();


    formData.append(
      "avatar",
      file
    );


    /* =====================================================
       REQUEST
    ===================================================== */

    const response =
      await fetch(
        U9_PROFILE_PAGE3_UPLOAD_AVATAR_API,
        {
          method:
            "POST",

          headers: {
            Authorization:
              `Bearer ${token}`
          },

          /*
           * IMPORTANT:
           * 不要手动设置 Content-Type
           */
          body:
            formData,

          credentials:
            "omit",

          cache:
            "no-store"
        }
      );


    const result =
      await response.json()
        .catch(
          () => ({})
        );


    console.log(
      "CUSTOM AVATAR UPLOAD RESULT:",
      result
    );


    /* =====================================================
       AUTH ERROR
    ===================================================== */

    if (
      response.status === 401 ||
      response.status === 403
    ) {

      throw new Error(
        result?.error ||
        result?.message ||
        "登录状态已失效，请重新登录。"
      );

    }


    /* =====================================================
       COOLDOWN
    ===================================================== */

    if (
      response.status === 429
    ) {

      currentAvatarCooldownUntil =
        result?.cooldown_until ||
        null;


      const remaining =
        result?.remaining_hours;


      throw new Error(
        result?.error ||
        result?.message ||
        (
          Number.isFinite(
            Number(remaining)
          )
            ? `头像还在冷却中，还剩约 ${remaining} 小时。`
            : "头像还在冷却中。"
        )
      );

    }


    /* =====================================================
       OTHER ERROR
    ===================================================== */

    if (!response.ok) {

      throw new Error(
        result?.error ||
        result?.message ||
        "头像上传失败。"
      );

    }


    if (
      result?.success === false
    ) {

      throw new Error(
        result?.error ||
        result?.message ||
        "头像上传失败。"
      );

    }


    /* =====================================================
       SUCCESS
    ===================================================== */

    if (
      result?.avatar
    ) {

      currentAvatarType =
        result.avatar.type ||
        "custom";


      currentAvatarId =
        result.avatar.id ||
        null;


      currentAvatarUrl =
        result.avatar.url ||
        null;


      currentAvatarCooldownUntil =
        result.avatar.cooldown_until ||
        null;

    }

    else {

      currentAvatarType =
        "custom";

    }


    /* =====================================================
       REFRESH PROFILE
    ===================================================== */

    await refreshProfileAfterChange();


    /* =====================================================
       RESET
    ===================================================== */

    uploadAvatarFile =
      null;


    if (input) {

      input.value =
        "";

    }


    /* =====================================================
       SUCCESS
    ===================================================== */

    alert(
      "头像上传成功！7天内不能再次上传头像。"
    );


    /* =====================================================
       RE-RENDER
    ===================================================== */

    const panel =
      document.getElementById(
        "U9-profile-page3-panel"
      );


    if (
      panel &&
      activePage3Tab ===
        "avatar"
    ) {

      await switchPage3Tab(
        "avatar"
      );

    }

  }

  catch(error) {

    console.error(
      "CUSTOM AVATAR UPLOAD ERROR:",
      error
    );


    alert(
      error?.message ||
      "头像上传失败，请稍后重试。"
    );

  }

  finally {

    if (button) {

      button.classList.remove(
        "loading"
      );

      button.disabled =
        isAvatarUploadOnCooldown();


      if (
        !isAvatarUploadOnCooldown()
      ) {

        button.textContent =
          "上传头像";

      }

    }

  }

}


/* =========================================================
   UPLOAD CUSTOM AVATAR
========================================================= */

async function uploadCustomAvatar(
  file,
  button,
  input
) {

  /* =======================================================
     LOGIN
  ======================================================= */

  if (
    !page3IsLoggedIn()
  ) {

    alert(
      "请先登录。"
    );

    return;

  }


  /* =======================================================
     COOLDOWN
  ======================================================= */

  if (
    isAvatarUploadOnCooldown()
  ) {

    alert(
      "头像还在冷却中，还剩 " +
      formatAvatarCooldown() +
      "。"
    );

    return;

  }


  /* =======================================================
     FILE
  ======================================================= */

  if (!file) {

    alert(
      "请先选择一张 WebP 图片。"
    );

    return;

  }


  /* =======================================================
     MIME
  ======================================================= */

  if (
    file.type !==
      "image/webp"
  ) {

    alert(
      "只能上传 WebP 图片。"
    );

    return;

  }


  /* =======================================================
     SIZE
  ======================================================= */

  if (
    file.size <= 0
  ) {

    alert(
      "图片文件无效。"
    );

    return;

  }


  if (
    file.size >
      U9_PROFILE_PAGE3_MAX_AVATAR_SIZE
  ) {

    alert(
      "图片不能超过 2MB。"
    );

    return;

  }


  /* =======================================================
     TOKEN
  ======================================================= */

  const token =
    getPage3Token();


  if (!token) {

    alert(
      "登录状态已失效，请重新登录。"
    );

    return;

  }


  /* =======================================================
     BUTTON
  ======================================================= */

  if (button) {

    button.disabled =
      true;

    button.classList.add(
      "loading"
    );

    button.textContent =
      "上传中...";

  }


  try {

    /* =====================================================
       FORMDATA

       IMPORTANT:
       Field name MUST be "avatar"
    ===================================================== */

    const formData =
      new FormData();


    formData.append(
      "avatar",
      file
    );


    /* =====================================================
       REQUEST

       IMPORTANT:
       DO NOT set Content-Type manually.

       Browser must create:
       multipart/form-data; boundary=...
    ===================================================== */

    const response =
      await fetch(
        U9_PROFILE_PAGE3_UPLOAD_AVATAR_API,
        {
          method: "POST",

          headers: {
            Authorization:
              `Bearer ${token}`
          },

          body:
            formData,

          credentials:
            "omit",

          cache:
            "no-store"
        }
      );


    const result =
      await response.json()
        .catch(
          () => ({})
        );


    console.log(
      "CUSTOM AVATAR UPLOAD RESULT:",
      result
    );


    /* =====================================================
       AUTH ERROR
    ===================================================== */

    if (
      response.status === 401 ||
      response.status === 403
    ) {

      throw new Error(
        result?.error ||
        result?.message ||
        "登录状态已失效，请重新登录。"
      );

    }


    /* =====================================================
       COOLDOWN
    ===================================================== */

    if (
      response.status === 429
    ) {

      currentAvatarCooldownUntil =
        result?.cooldown_until ||
        null;


      const remaining =
        result?.remaining_hours;


      throw new Error(
        result?.error ||
        result?.message ||
        (
          Number.isFinite(
            Number(remaining)
          )
            ? `头像还在冷却中，还剩约 ${remaining} 小时。`
            : "头像还在冷却中。"
        )
      );

    }


    /* =====================================================
       OTHER ERROR
    ===================================================== */

    if (!response.ok) {

      throw new Error(
        result?.error ||
        result?.message ||
        "头像上传失败。"
      );

    }


    if (
      result?.success === false
    ) {

      throw new Error(
        result?.error ||
        result?.message ||
        "头像上传失败。"
      );

    }


    /* =====================================================
       SUCCESS
    ===================================================== */

    if (
      result?.avatar
    ) {

      currentAvatarType =
        result.avatar.type ||
        "custom";


      currentAvatarId =
        result.avatar.id ||
        null;


      currentAvatarUrl =
        result.avatar.url ||
        null;


      currentAvatarCooldownUntil =
        result.avatar.cooldown_until ||
        null;

    }

    else {

      currentAvatarType =
        "custom";

    }


    /* =====================================================
       REFRESH PROFILE
    ===================================================== */

    await refreshProfileAfterChange();


    /* =====================================================
       RESET FILE
    ===================================================== */

    uploadAvatarFile =
      null;


    if (input) {

      input.value =
        "";

    }


    /* =====================================================
       SUCCESS MESSAGE
    ===================================================== */

    alert(
      "头像上传成功！7天内不能再次上传头像。"
    );


    /* =====================================================
       RE-RENDER
    ===================================================== */

    const panel =
      document.getElementById(
        "U9-profile-page3-panel"
      );


    if (
      panel &&
      activePage3Tab ===
        "avatar"
    ) {

      await switchPage3Tab(
        "avatar"
      );

    }


  }

  catch(error) {

    console.error(
      "CUSTOM AVATAR UPLOAD ERROR:",
      error
    );


    alert(
      error?.message ||
      "头像上传失败，请稍后重试。"
    );

  }

  finally {

    if (button) {

      button.classList.remove(
        "loading"
      );

      button.disabled =
        isAvatarUploadOnCooldown();


      if (
        !isAvatarUploadOnCooldown()
      ) {

        button.textContent =
          "上传头像";

      }

    }

  }

}


/* =========================================================
   AVATAR
========================================================= */

async function renderFreeAvatars(
  panel,
  keepUpload = false
) {

  if (!panel) {

    return;

  }


  /*
   * When keepUpload=true, do NOT clear panel.
   *
   * The custom upload area has already been
   * inserted at the top.
   */

  let loading = null;


  if (!keepUpload) {

    panel.innerHTML =
      "";

  }


  loading =
    document.createElement(
      "div"
    );

  loading.className =
    "U9-profile-page3-loading";

  loading.textContent =
    "正在加载头像...";


  panel.appendChild(
    loading
  );


  try {

    const response =
      await fetch(
        U9_PROFILE_PAGE3_FREE_AVATAR_API,
        {
          method: "GET",
          cache: "no-store"
        }
      );


    const result =
      await response.json()
        .catch(
          () => ({})
        );


    if (!response.ok) {

      throw new Error(
        result?.message ||
        "加载头像失败"
      );

    }


    const avatars =
      Array.isArray(
        result?.avatars
      )
        ? result.avatars
        : [];


    /*
     * Remove loading only.
     */

    if (loading) {

      loading.remove();

    }


    if (!avatars.length) {

      showPage3Message(
        panel,
        "暂无免费头像。",
        "empty"
      );

      return;

    }


    const title =
      document.createElement(
        "div"
      );

    title.className =
      "U9-profile-page3-section-title";

    title.textContent =
      "免费头像";


    panel.appendChild(
      title
    );


    const list =
      document.createElement(
        "div"
      );

    list.className =
      "U9-profile-page3-avatar-list";


    avatars.forEach(
      function(avatar) {

        const card =
          document.createElement(
            "div"
          );

        card.className =
          "U9-profile-page3-avatar-card";


        /* -------------------------------------------------
           IMAGE
        ------------------------------------------------- */

        const image =
          document.createElement(
            "img"
          );

        image.className =
          "U9-profile-page3-avatar-image";

        image.alt =
          avatar?.name ||
          "Avatar";


        setPage3ImageSource(
          image,
          avatar?.svg ||
          avatar?.image ||
          avatar?.url
        );


        card.appendChild(
          image
        );


        /* -------------------------------------------------
           NAME
        ------------------------------------------------- */

        const name =
          document.createElement(
            "div"
          );

        name.className =
          "U9-profile-page3-avatar-name";

        name.textContent =
          avatar?.name ||
          "Avatar";


        card.appendChild(
          name
        );


        /* -------------------------------------------------
           BUTTON
        ------------------------------------------------- */

        const button =
          document.createElement(
            "button"
          );

        button.type =
          "button";

        button.className =
          "U9-profile-page3-avatar-button";


        button.dataset.avatarId =
          avatar?.id || "";


        const active =
          String(currentAvatarId) ===
          String(avatar?.id) &&
          currentAvatarType !==
            "custom";


        button.textContent =
          active
            ? "正在使用"
            : "使用";


        if (active) {

          button.classList.add(
            "active"
          );

          button.disabled =
            true;

        }


        button.addEventListener(
          "click",
          function() {

            setFreeAvatar(
              avatar?.id,
              button
            );

          }
        );


        card.appendChild(
          button
        );


        list.appendChild(
          card
        );

      }
    );


    panel.appendChild(
      list
    );


  }

  catch(error) {

    console.error(
      "FREE AVATAR ERROR:",
      error
    );


    if (loading) {

      loading.remove();

    }


    showPage3Message(
      panel,
      error?.message ||
      "免费头像加载失败。",
      "error"
    );

  }

}


/* =========================================================
   SET FREE AVATAR
========================================================= */

async function setFreeAvatar(
  avatarId,
  button
) {

  if (!avatarId) {

    return;

  }


  const token =
    getPage3Token();


  if (!token) {

    alert(
      "请先登录。"
    );

    return;

  }


  if (button) {

    button.classList.add(
      "loading"
    );

    button.disabled =
      true;

    button.textContent =
      "处理中...";

  }


  try {

    const response =
      await fetch(
        U9_PROFILE_PAGE3_SET_AVATAR_API,
        {
          method: "POST",

          headers: {
            Authorization:
              `Bearer ${token}`,

            "Content-Type":
              "application/json"
          },

          body:
            JSON.stringify({
              type:
                "free",

              avatar_id:
                avatarId
            }),

          credentials:
            "omit",

          cache:
            "no-store"
        }
      );


    const result =
      await response.json()
        .catch(
          () => ({})
        );


    if (
      response.status === 401 ||
      response.status === 403
    ) {

      throw new Error(
        result?.message ||
        "登录状态已失效，请重新登录。"
      );

    }


    if (!response.ok) {

      throw new Error(
        result?.message ||
        "头像设置失败"
      );

    }


    if (
      result?.success === false
    ) {

      throw new Error(
        result?.message ||
        "头像设置失败"
      );

    }


    currentAvatarType =
      "free";


    currentAvatarId =
      result?.avatar?.id ||
      avatarId;


    currentAvatarUrl =
      null;


    updateAvatarButtons();


    await refreshProfileAfterChange();


    console.log(
      "AVATAR SET SUCCESS:",
      currentAvatarId
    );

  }

  catch(error) {

    console.error(
      "SET AVATAR ERROR:",
      error
    );


    alert(
      error?.message ||
      "头像设置失败，请稍后重试。"
    );

  }

  finally {

    if (button) {

      button.classList.remove(
        "loading"
      );

      updateAvatarButtons();

    }

  }

}


/* =========================================================
   UPDATE AVATAR BUTTONS
========================================================= */

function updateAvatarButtons() {

  const buttons =
    document.querySelectorAll(
      ".U9-profile-page3-avatar-button"
    );


  buttons.forEach(
    function(button) {

      const avatarId =
        button.dataset.avatarId;


      const active =
        String(avatarId) ===
          String(currentAvatarId) &&
        currentAvatarType !==
          "custom";


      button.classList.toggle(
        "active",
        active
      );


      button.disabled =
        active;


      if (active) {

        button.textContent =
          "正在使用";

      }

      else if (
        !button.classList.contains(
          "loading"
        )
      ) {

        button.textContent =
          "使用";

      }

    }
  );

}


/* =========================================================
   FREE FRAME
========================================================= */

async function renderFreeFrames(
  panel
) {

  if (!panel) {

    return;

  }


  panel.innerHTML =
    "";


  const loading =
    document.createElement(
      "div"
    );

  loading.className =
    "U9-profile-page3-loading";

  loading.textContent =
    "正在加载免费头像框...";


  panel.appendChild(
    loading
  );


  try {

    const response =
      await fetch(
        U9_PROFILE_PAGE3_FREE_FRAME_API,
        {
          method: "GET",
          cache: "no-store"
        }
      );


    const result =
      await response.json()
        .catch(
          () => ({})
        );


    if (!response.ok) {

      throw new Error(
        result?.message ||
        "加载免费头像框失败"
      );

    }


    freeFrames =
      Array.isArray(
        result?.frames
      )
        ? result.frames
        : [];


    panel.innerHTML =
      "";


    if (!freeFrames.length) {

      showPage3Message(
        panel,
        "暂无免费头像框。",
        "empty"
      );

      return;

    }


    const list =
      document.createElement(
        "div"
      );

    list.className =
      "U9-profile-page3-frame-list";


    freeFrames.forEach(
      function(frame) {

        const card =
          createFrameCard(
            frame,
            "free"
          );


        list.appendChild(
          card
        );

      }
    );


    panel.appendChild(
      list
    );

  }

  catch(error) {

    console.error(
      "FREE FRAME ERROR:",
      error
    );


    showPage3Message(
      panel,
      error?.message ||
      "免费头像框加载失败。",
      "error"
    );

  }

}


/* =========================================================
   PAID FRAME
========================================================= */

async function loadPaidFrames() {

  const token =
    getPage3Token();


  if (!token) {

    throw new Error(
      "请先登录后查看付费头像框。"
    );

  }


  const response =
    await fetch(
      U9_PROFILE_PAGE3_PAID_FRAME_API,
      {
        method: "GET",

        headers: {
          Authorization:
            `Bearer ${token}`
        },

        credentials:
          "omit",

        cache:
          "no-store"
      }
    );


  const result =
    await response.json()
      .catch(
        () => ({})
      );


  if (
    response.status === 401 ||
    response.status === 403
  ) {

    throw new Error(
      "登录状态已失效，请重新登录。"
    );

  }


  if (!response.ok) {

    throw new Error(
      result?.message ||
      "加载付费头像框失败"
    );

  }


  if (
    result?.success === false
  ) {

    throw new Error(
      result?.message ||
      "加载付费头像框失败"
    );

  }


  paidFrames =
    Array.isArray(
      result?.frames
    )
      ? result.frames
      : [];


  return paidFrames;

}


/* =========================================================
   RENDER PAID FRAMES
========================================================= */

async function renderPaidFrames(
  panel
) {

  if (!panel) {

    return;

  }


  if (
    !requirePage3Login(
      panel
    )
  ) {

    return;

  }


  panel.innerHTML =
    "";


  const loading =
    document.createElement(
      "div"
    );

  loading.className =
    "U9-profile-page3-loading";

  loading.textContent =
    "正在加载付费头像框...";


  panel.appendChild(
    loading
  );


  try {

    await loadPaidFrames();


    panel.innerHTML =
      "";


    if (!paidFrames.length) {

      showPage3Message(
        panel,
        "暂无付费头像框。",
        "empty"
      );

      return;

    }


    const list =
      document.createElement(
        "div"
      );

    list.className =
      "U9-profile-page3-frame-list";


    paidFrames.forEach(
      function(frame) {

        const card =
          createFrameCard(
            frame,
            "paid"
          );


        list.appendChild(
          card
        );

      }
    );


    panel.appendChild(
      list
    );

  }

  catch(error) {

    console.error(
      "PAID FRAME ERROR:",
      error
    );


    showPage3Message(
      panel,
      error?.message ||
      "付费头像框加载失败。",
      "error"
    );

  }

}


/* =========================================================
   CREATE FRAME CARD
========================================================= */

function createFrameCard(
  frame,
  frameType
) {

  const card =
    document.createElement(
      "div"
    );

  card.className =
    "U9-profile-page3-frame-card";


  card.dataset.frameId =
    frame?.id || "";


  /* -------------------------------------------------------
     IMAGE
  ------------------------------------------------------- */

  const image =
    document.createElement(
      "img"
    );

  image.className =
    "U9-profile-page3-frame-image";

  image.alt =
    frame?.name ||
    "Avatar Frame";


  setPage3ImageSource(
    image,
    frame?.svg ||
    frame?.image ||
    frame?.url
  );


  card.appendChild(
    image
  );


  /* -------------------------------------------------------
     NAME
  ------------------------------------------------------- */

  const name =
    document.createElement(
      "div"
    );

  name.className =
    "U9-profile-page3-frame-name";

  name.textContent =
    frame?.name ||
    "Avatar Frame";


  card.appendChild(
    name
  );


  /* -------------------------------------------------------
     PAID PRICE
  ------------------------------------------------------- */

  if (
    frameType ===
    "paid"
  ) {

    const price =
      document.createElement(
        "div"
      );

    price.className =
      "U9-profile-page3-frame-price";


    const coins =
      Number(
        frame?.coins_price
      );


    price.textContent =
      Number.isFinite(coins)
        ? `${coins} Coins`
        : "付费头像框";


    card.appendChild(
      price
    );

  }


  /* -------------------------------------------------------
     BUTTON
  ------------------------------------------------------- */

  const button =
    document.createElement(
      "button"
    );

  button.type =
    "button";

  button.className =
    "U9-profile-page3-frame-button";


  button.dataset.frameId =
    frame?.id || "";

  button.dataset.frameType =
    frameType;


  const equipped =
    currentFrameType ===
      frameType &&
    String(currentFrameId) ===
      String(frame?.id);


  /* =======================================================
     FREE FRAME
  ======================================================= */

  if (
    frameType ===
    "free"
  ) {

    if (equipped) {

      button.textContent =
        "正在使用";

      button.classList.add(
        "active"
      );

      button.disabled =
        true;

    }

    else {

      button.textContent =
        "使用";


      button.addEventListener(
        "click",
        function() {

          equipFrame(
            "free",
            frame?.id,
            button
          );

        }
      );

    }

  }


  /* =======================================================
     PAID FRAME
  ======================================================= */

  if (
    frameType ===
    "paid"
  ) {

    const owned =
      frame?.owned === true ||
      frame?.purchased === true ||
      frame?.is_owned === true;


    if (equipped) {

      button.textContent =
        "正在使用";

      button.classList.add(
        "active"
      );

      button.disabled =
        true;

    }

    else if (owned) {

      button.textContent =
        "使用";

      button.classList.add(
        "use"
      );


      button.addEventListener(
        "click",
        function() {

          equipFrame(
            "paid",
            frame?.id,
            button
          );

        }
      );

    }

    else {

      const coins =
        Number(
          frame?.coins_price
        );


      button.textContent =
        Number.isFinite(coins)
          ? `购买 ${coins}`
          : "购买";


      button.classList.add(
        "buy"
      );


      button.addEventListener(
        "click",
        function() {

          purchasePaidFrame(
            frame?.id,
            button
          );

        }
      );

    }

  }


  card.appendChild(
    button
  );


  return card;

}


/* =========================================================
   EQUIP FRAME
========================================================= */

async function equipFrame(
  frameType,
  frameId,
  button
) {

  if (!frameId) {

    return;

  }


  const token =
    getPage3Token();


  if (!token) {

    alert(
      "请先登录。"
    );

    return;

  }


  if (button) {

    button.classList.add(
      "loading"
    );

    button.disabled =
      true;

    button.textContent =
      "处理中...";

  }


  try {

    const response =
      await fetch(
        U9_PROFILE_PAGE3_EQUIP_FRAME_API,
        {
          method: "POST",

          headers: {
            Authorization:
              `Bearer ${token}`,

            "Content-Type":
              "application/json"
          },

          body:
            JSON.stringify({
              frame_type:
                frameType,

              frame_id:
                frameId
            }),

          credentials:
            "omit",

          cache:
            "no-store"
        }
      );


    const result =
      await response.json()
        .catch(
          () => ({})
        );


    if (
      response.status === 401 ||
      response.status === 403
    ) {

      throw new Error(
        result?.message ||
        "登录状态已失效，请重新登录。"
      );

    }


    if (!response.ok) {

      throw new Error(
        result?.message ||
        "头像框使用失败"
      );

    }


    if (
      result?.success === false
    ) {

      throw new Error(
        result?.message ||
        "头像框使用失败"
      );

    }


    currentFrameType =
      frameType;


    currentFrameId =
      result?.frame?.id ||
      result?.updatedUser?.avatar_frame_id ||
      frameId;


    updateFrameButtons();


    await refreshProfileAfterChange();


    /* -----------------------------------------------------
       RE-RENDER
    ----------------------------------------------------- */

    const panel =
      document.getElementById(
        "U9-profile-page3-panel"
      );


    if (
      panel &&
      activePage3Tab ===
        "free-frame"
    ) {

      await renderFreeFrames(
        panel
      );

    }


    if (
      panel &&
      activePage3Tab ===
        "paid-frame"
    ) {

      await renderPaidFrames(
        panel
      );

    }

  }

  catch(error) {

    console.error(
      "EQUIP FRAME ERROR:",
      error
    );


    alert(
      error?.message ||
      "头像框使用失败，请稍后重试。"
    );

  }

  finally {

    if (button) {

      button.classList.remove(
        "loading"
      );

    }

  }

}


/* =========================================================
   UPDATE FRAME BUTTONS
========================================================= */

function updateFrameButtons() {

  const buttons =
    document.querySelectorAll(
      ".U9-profile-page3-frame-button"
    );


  buttons.forEach(
    function(button) {

      const frameType =
        button.dataset.frameType;


      const frameId =
        button.dataset.frameId;


      const active =
        currentFrameType ===
          frameType &&
        String(currentFrameId) ===
          String(frameId);


      button.classList.toggle(
        "active",
        active
      );


      if (active) {

        button.textContent =
          "正在使用";

        button.disabled =
          true;

      }

    }
  );

}


/* =========================================================
   PURCHASE PAID FRAME
========================================================= */

async function purchasePaidFrame(
  frameId,
  button
) {

  if (!frameId) {

    return;

  }


  const token =
    getPage3Token();


  if (!token) {

    alert(
      "请先登录。"
    );

    return;

  }


  const frame =
    paidFrames.find(
      function(item) {

        return (
          String(
            item?.id
          ) ===
          String(
            frameId
          )
        );

      }
    );


  if (!frame) {

    alert(
      "找不到这个头像框。"
    );

    return;

  }


  const price =
    Number(
      frame?.coins_price
    );


  const confirmMessage =
    Number.isFinite(price)
      ? `确定要购买「${frame?.name || "头像框"}」吗？\n需要 ${price} Coins。`
      : `确定要购买「${frame?.name || "头像框"}」吗？`;


  const confirmed =
    window.confirm(
      confirmMessage
    );


  if (!confirmed) {

    return;

  }


  if (button) {

    button.classList.add(
      "loading"
    );

    button.disabled =
      true;

    button.textContent =
      "购买中...";

  }


  try {

    const response =
      await fetch(
        U9_PROFILE_PAGE3_PURCHASE_FRAME_API,
        {
          method: "POST",

          headers: {
            Authorization:
              `Bearer ${token}`,

            "Content-Type":
              "application/json"
          },

          body:
            JSON.stringify({
              frame_id:
                frameId
            }),

          credentials:
            "omit",

          cache:
            "no-store"
        }
      );


    const result =
      await response.json()
        .catch(
          () => ({})
        );


    if (
      response.status === 401 ||
      response.status === 403
    ) {

      throw new Error(
        result?.message ||
        "登录状态已失效，请重新登录。"
      );

    }


    if (!response.ok) {

      throw new Error(
        result?.message ||
        "头像框购买失败"
      );

    }


    if (
      result?.success === false
    ) {

      throw new Error(
        result?.message ||
        "头像框购买失败"
      );

    }


    const purchasedFrame =
      paidFrames.find(
        function(item) {

          return (
            String(
              item?.id
            ) ===
            String(
              frameId
            )
          );

        }
      );


    if (purchasedFrame) {

      purchasedFrame.owned =
        true;

    }


    /* -----------------------------------------------------
       AUTO EQUIP
    ----------------------------------------------------- */

    await equipFrame(
      "paid",
      frameId,
      null
    );


    /* -----------------------------------------------------
       RELOAD
    ----------------------------------------------------- */

    await loadPaidFrames();


    const panel =
      document.getElementById(
        "U9-profile-page3-panel"
      );


    if (
      panel &&
      activePage3Tab ===
        "paid-frame"
    ) {

      await renderPaidFrames(
        panel
      );

    }

  }

  catch(error) {

    console.error(
      "PURCHASE FRAME ERROR:",
      error
    );


    alert(
      error?.message ||
      "头像框购买失败，请稍后重试。"
    );

  }

  finally {

    if (button) {

      button.classList.remove(
        "loading"
      );

    }

  }

}


/* =========================================================
   LOAD PROFILE PAGE 3
========================================================= */

async function loadProfilePage3() {

  if (
    !profilePage3Content
  ) {

    console.error(
      "PROFILE PAGE 3 CONTENT NOT FOUND"
    );

    return;

  }


  try {

    /* -----------------------------------------------------
       REFRESH CURRENT USER
    ----------------------------------------------------- */

    if (
      window.U9User &&
      typeof window.U9User.refresh ===
        "function"
    ) {

      await window.U9User.refresh();

    }


    /* -----------------------------------------------------
       LOAD EQUIPMENT
    ----------------------------------------------------- */

    loadCurrentEquipment();


    /* -----------------------------------------------------
       CREATE UI
    ----------------------------------------------------- */

    createPage3UI();


    /* -----------------------------------------------------
       DEFAULT TAB
    ----------------------------------------------------- */

    await switchPage3Tab(
      "avatar"
    );


    console.log(
      "PROFILE PAGE 3 LOADED"
    );

  }

  catch(error) {

    console.error(
      "PROFILE PAGE 3 LOAD ERROR:",
      error
    );

  }

}


/* =========================================================
   INIT
========================================================= */

if (
  document.readyState ===
  "loading"
) {

  document.addEventListener(
    "DOMContentLoaded",
    loadProfilePage3
  );

}

else {

  loadProfilePage3();

}
