/* =========================================================
   U9 PROFILE PAGE 3
   AVATAR + FRAME
========================================================= */


/* =========================================================
   PAGE
========================================================= */

const u9ProfilePage3 =
  document.getElementById(
    "U9-profile-page3"
  );


const u9ProfilePage3Content =
  document.getElementById(
    "U9-profile-page3-content"
  );


/* =========================================================
   API
========================================================= */

const u9Page3MeFunction =
  "https://tvtakmswbzawaweytimx.supabase.co/functions/v1/me";


const u9Page3AvatarFreeFunction =
  "https://tvtakmswbzawaweytimx.supabase.co/functions/v1/avatar-free";


const u9Page3AvatarSetFunction =
  "https://tvtakmswbzawaweytimx.supabase.co/functions/v1/avatar-set";


const u9Page3AvatarUploadFunction =
  "https://tvtakmswbzawaweytimx.supabase.co/functions/v1/avatar-upload";


const u9Page3DefaultFrameFunction =
  "https://tvtakmswbzawaweytimx.supabase.co/functions/v1/avatar-frame-default";


const u9Page3FreeFrameFunction =
  "https://tvtakmswbzawaweytimx.supabase.co/functions/v1/avatar-frame-free";


const u9Page3PaidFrameFunction =
  "https://tvtakmswbzawaweytimx.supabase.co/functions/v1/avatar-frame-paid";


const u9Page3EquipFrameFunction =
  "https://tvtakmswbzawaweytimx.supabase.co/functions/v1/avatar-frame-equip";


const u9Page3PaidFramePurchaseFunction =
  "https://tvtakmswbzawaweytimx.supabase.co/functions/v1/avatar-frame-paid-purchase";


/* =========================================================
   SVG
========================================================= */

const u9Page3LockSvg =
  "SSVG/account/lock.svg";


const u9Page3OwnedSvg =
  "SSVG/account/owned.svg";


/* =========================================================
   AVATAR STATE
========================================================= */

let u9Page3SelectedImage =
  null;


let u9Page3ImageObjectUrl =
  null;


let u9Page3ImageLoaded =
  false;


let u9Page3Dragging =
  false;


let u9Page3DragStartX =
  0;


let u9Page3DragStartY =
  0;


let u9Page3StartOffsetX =
  0;


let u9Page3StartOffsetY =
  0;


let u9Page3OffsetX =
  0;


let u9Page3OffsetY =
  0;


let u9Page3BaseScale =
  1;


let u9Page3Zoom =
  1;


let u9Page3CurrentAvatarType =
  null;


let u9Page3CurrentAvatarId =
  null;


let u9Page3CurrentAvatarUrl =
  null;


/* =========================================================
   FRAME STATE
========================================================= */

let u9Page3CurrentFrameType =
  null;


let u9Page3CurrentFrameId =
  null;


let u9Page3SelectedFrameType =
  null;


let u9Page3SelectedFrameId =
  null;


let u9Page3DefaultFrames =
  [];


let u9Page3FreeFrames =
  [];


let u9Page3PaidFrames =
  [];


let u9Page3AllFrames =
  [];


let u9Page3PurchaseModal =
  null;


let u9Page3PurchasingFrame =
  false;


/* =========================================================
   DOM REFERENCES
========================================================= */

let u9Page3AvatarInput =
  null;


let u9Page3AvatarImage =
  null;


let u9Page3AvatarPreview =
  null;


let u9Page3AvatarZoom =
  null;


let u9Page3AvatarSave =
  null;


let u9Page3AvatarCancel =
  null;


let u9Page3AvatarStatus =
  null;


let u9Page3FreeAvatarList =
  null;


let u9Page3FreeFrameList =
  null;


let u9Page3PaidFrameList =
  null;


/* =========================================================
   FETCH HELPER
========================================================= */

async function u9Page3Fetch(
  url,
  options = {}
) {

  const response =
    await fetch(
      url,
      {
        credentials: "include",
        ...options
      }
    );


  let result = null;


  try {

    result =
      await response.json();

  } catch {

    result = null;

  }


  if (!response.ok) {

    throw new Error(
      result?.message ||
      result?.error ||
      `Request failed: ${response.status}`
    );

  }


  return result;

}


/* =========================================================
   CREATE PAGE 3
========================================================= */

function createU9Page3() {

  if (
    !u9ProfilePage3Content
  ) {

    return;

  }


  u9ProfilePage3Content.innerHTML =
    "";


  /* =====================================================
     AVATAR EDITOR
  ===================================================== */

  const avatarEditor =
    document.createElement(
      "div"
    );


  avatarEditor.id =
    "U9-profile-page3-avatar-editor";


  /* =====================================================
     IMAGE CHOOSE AREA
  ===================================================== */

  const chooseArea =
    document.createElement(
      "div"
    );


  chooseArea.id =
    "U9-profile-page3-avatar-choose-area";


  const preview =
    document.createElement(
      "div"
    );


  preview.id =
    "U9-profile-page3-avatar-preview";


  const previewImage =
    document.createElement(
      "img"
    );


  previewImage.id =
    "U9-profile-page3-avatar-image";


  previewImage.alt =
    "";


  previewImage.draggable =
    false;


  previewImage.hidden =
    true;


  const plus =
    document.createElement(
      "span"
    );


  plus.id =
    "U9-profile-page3-avatar-plus";


  plus.textContent =
    "+";


  preview.appendChild(
    previewImage
  );


  preview.appendChild(
    plus
  );


  chooseArea.appendChild(
    preview
  );


  const fileInput =
    document.createElement(
      "input"
    );


  fileInput.type =
    "file";


  fileInput.id =
    "U9-profile-page3-avatar-file";


  fileInput.accept =
    "image/*";


  fileInput.hidden =
    true;


  chooseArea.appendChild(
    fileInput
  );


  avatarEditor.appendChild(
    chooseArea
  );


  /* =====================================================
     ZOOM
  ===================================================== */

  const zoomArea =
    document.createElement(
      "div"
    );


  zoomArea.id =
    "U9-profile-page3-avatar-zoom-area";


  const zoomInput =
    document.createElement(
      "input"
    );


  zoomInput.id =
    "U9-profile-page3-avatar-zoom";


  zoomInput.type =
    "range";


  zoomInput.min =
    "1";


  zoomInput.max =
    "3";


  zoomInput.step =
    "0.01";


  zoomInput.value =
    "1";


  const zoomValue =
    document.createElement(
      "span"
    );


  zoomValue.id =
    "U9-profile-page3-avatar-zoom-value";


  zoomValue.textContent =
    "100%";


  zoomArea.appendChild(
    zoomInput
  );


  zoomArea.appendChild(
    zoomValue
  );


  avatarEditor.appendChild(
    zoomArea
  );


  /* =====================================================
     ACTIONS
  ===================================================== */

  const actions =
    document.createElement(
      "div"
    );


  actions.id =
    "U9-profile-page3-avatar-actions";


  const cancelButton =
    document.createElement(
      "button"
    );


  cancelButton.id =
    "U9-profile-page3-avatar-cancel";


  cancelButton.type =
    "button";


  cancelButton.textContent =
    "Cancel";


  const saveButton =
    document.createElement(
      "button"
    );


  saveButton.id =
    "U9-profile-page3-avatar-save";


  saveButton.type =
    "button";


  saveButton.textContent =
    "Save";


  saveButton.disabled =
    true;


  actions.appendChild(
    cancelButton
  );


  actions.appendChild(
    saveButton
  );


  avatarEditor.appendChild(
    actions
  );


  /* =====================================================
     STATUS
  ===================================================== */

  const status =
    document.createElement(
      "div"
    );


  status.id =
    "U9-profile-page3-avatar-status";


  avatarEditor.appendChild(
    status
  );


  /* =====================================================
     FREE AVATAR
  ===================================================== */

  const freeAvatarSection =
    document.createElement(
      "section"
    );


  freeAvatarSection.id =
    "U9-profile-page3-free-avatar-section";


  const freeAvatarTitle =
    document.createElement(
      "h3"
    );


  freeAvatarTitle.id =
    "U9-profile-page3-free-avatar-title";


  freeAvatarTitle.textContent =
    "Free Avatar";


  freeAvatarList =
    document.createElement(
      "div"
    );


  freeAvatarList.id =
    "U9-profile-page3-free-avatar-list";


  freeAvatarSection.appendChild(
    freeAvatarTitle
  );


  freeAvatarSection.appendChild(
    freeAvatarList
  );


  /* =====================================================
     FREE FRAME
  ===================================================== */

  const freeFrameSection =
    document.createElement(
      "section"
    );


  freeFrameSection.id =
    "U9-profile-page3-free-frame-section";


  const freeFrameTitle =
    document.createElement(
      "h3"
    );


  freeFrameTitle.id =
    "U9-profile-page3-free-frame-title";


  freeFrameTitle.textContent =
    "Free Frame";


  freeFrameList =
    document.createElement(
      "div"
    );


  freeFrameList.id =
    "U9-profile-page3-free-frame-list";


  freeFrameSection.appendChild(
    freeFrameTitle
  );


  freeFrameSection.appendChild(
    freeFrameList
  );


  /* =====================================================
     PAID FRAME
  ===================================================== */

  const paidFrameSection =
    document.createElement(
      "section"
    );


  paidFrameSection.id =
    "U9-profile-page3-paid-frame-section";


  const paidFrameTitle =
    document.createElement(
      "h3"
    );


  paidFrameTitle.id =
    "U9-profile-page3-paid-frame-title";


  paidFrameTitle.textContent =
    "Paid Frame";


  paidFrameList =
    document.createElement(
      "div"
    );


  paidFrameList.id =
    "U9-profile-page3-paid-frame-list";


  paidFrameSection.appendChild(
    paidFrameTitle
  );


  paidFrameSection.appendChild(
    paidFrameList
  );


  /* =====================================================
     APPEND
  ===================================================== */

  u9ProfilePage3Content.appendChild(
    avatarEditor
  );


  u9ProfilePage3Content.appendChild(
    freeAvatarSection
  );


  u9ProfilePage3Content.appendChild(
    freeFrameSection
  );


  u9ProfilePage3Content.appendChild(
    paidFrameSection
  );


  /* =====================================================
     SAVE REFERENCES
  ===================================================== */

  u9Page3AvatarInput =
    fileInput;


  u9Page3AvatarImage =
    previewImage;


  u9Page3AvatarPreview =
    preview;


  u9Page3AvatarZoom =
    zoomInput;


  u9Page3AvatarSave =
    saveButton;


  u9Page3AvatarCancel =
    cancelButton;


  u9Page3AvatarStatus =
    status;


  /* =====================================================
     EVENTS
  ===================================================== */

  chooseArea.addEventListener(
    "click",
    function(event) {

      if (
        event.target ===
        fileInput
      ) {

        return;

      }


      if (
        event.target ===
        saveButton
      ) {

        return;

      }


      fileInput.click();

    }
  );


  fileInput.addEventListener(
    "change",
    handleU9Page3AvatarFileChange
  );


  zoomInput.addEventListener(
    "input",
    function() {

      u9Page3Zoom =
        Number(
          zoomInput.value
        );


      zoomValue.textContent =
        `${Math.round(
          u9Page3Zoom * 100
        )}%`;


      updateU9Page3AvatarTransform();

    }
  );


  cancelButton.addEventListener(
    "click",
    cancelU9Page3Avatar
  );


  saveButton.addEventListener(
    "click",
    saveU9Page3Avatar
  );


  preview.addEventListener(
    "wheel",
    handleU9Page3AvatarWheel,
    {
      passive: false
    }
  );


  preview.addEventListener(
    "pointerdown",
    handleU9Page3PointerDown
  );


  preview.addEventListener(
    "pointermove",
    handleU9Page3PointerMove
  );


  preview.addEventListener(
    "pointerup",
    handleU9Page3PointerUp
  );


  preview.addEventListener(
    "pointercancel",
    handleU9Page3PointerUp
  );

}


/* =========================================================
   AVATAR FILE CHANGE
========================================================= */

function handleU9Page3AvatarFileChange(
  event
) {

  const file =
    event.target.files?.[0];


  if (!file) {

    return;

  }


  if (
    !file.type.startsWith(
      "image/"
    )
  ) {

    setU9Page3AvatarStatus(
      "Please select an image."
    );


    return;

  }


  if (
    u9Page3ImageObjectUrl
  ) {

    URL.revokeObjectURL(
      u9Page3ImageObjectUrl
    );

  }


  u9Page3SelectedImage =
    file;


  u9Page3ImageObjectUrl =
    URL.createObjectURL(
      file
    );


  u9Page3OffsetX =
    0;


  u9Page3OffsetY =
    0;


  u9Page3Zoom =
    1;


  u9Page3AvatarZoom.value =
    "1";


  const image =
    new Image();


  image.onload =
    function() {

      u9Page3ImageLoaded =
        true;


      u9Page3AvatarImage.src =
        u9Page3ImageObjectUrl;


      u9Page3AvatarImage.hidden =
        false;


      u9Page3AvatarPreview.classList.add(
        "has-image"
      );


      calculateU9Page3BaseScale();


      updateU9Page3AvatarTransform();


      u9Page3AvatarSave.disabled =
        false;


      setU9Page3AvatarStatus(
        ""
      );

    };


  image.onerror =
    function() {

      u9Page3ImageLoaded =
        false;


      u9Page3AvatarSave.disabled =
        true;


      setU9Page3AvatarStatus(
        "Unable to load image."
      );

    };


  image.src =
    u9Page3ImageObjectUrl;

}


/* =========================================================
   BASE SCALE
========================================================= */

function calculateU9Page3BaseScale() {

  if (
    !u9Page3AvatarImage.naturalWidth ||
    !u9Page3AvatarImage.naturalHeight
  ) {

    return;

  }


  const previewSize =
    u9Page3AvatarPreview.clientWidth;


  const imageWidth =
    u9Page3AvatarImage.naturalWidth;


  const imageHeight =
    u9Page3AvatarImage.naturalHeight;


  const scaleX =
    previewSize /
    imageWidth;


  const scaleY =
    previewSize /
    imageHeight;


  u9Page3BaseScale =
    Math.max(
      scaleX,
      scaleY
    );

}


/* =========================================================
   AVATAR TRANSFORM
========================================================= */

function updateU9Page3AvatarTransform() {

  if (
    !u9Page3AvatarImage ||
    !u9Page3ImageLoaded
  ) {

    return;

  }


  const scale =
    u9Page3BaseScale *
    u9Page3Zoom;


  u9Page3AvatarImage.style.transform =
    `translate(-50%, -50%) ` +
    `translate(${u9Page3OffsetX}px, ${u9Page3OffsetY}px) ` +
    `scale(${scale})`;

}


/* =========================================================
   AVATAR WHEEL ZOOM
========================================================= */

function handleU9Page3AvatarWheel(
  event
) {

  if (
    !u9Page3ImageLoaded
  ) {

    return;

  }


  event.preventDefault();


  const direction =
    event.deltaY < 0
      ? 0.05
      : -0.05;


  u9Page3Zoom =
    Math.min(
      3,
      Math.max(
        1,
        u9Page3Zoom +
        direction
      )
    );


  u9Page3AvatarZoom.value =
    u9Page3Zoom;


  document.getElementById(
    "U9-profile-page3-avatar-zoom-value"
  ).textContent =
    `${Math.round(
      u9Page3Zoom * 100
    )}%`;


  updateU9Page3AvatarTransform();

}


/* =========================================================
   AVATAR DRAG START
========================================================= */

function handleU9Page3PointerDown(
  event
) {

  if (
    !u9Page3ImageLoaded
  ) {

    return;

  }


  u9Page3Dragging =
    true;


  u9Page3DragStartX =
    event.clientX;


  u9Page3DragStartY =
    event.clientY;


  u9Page3StartOffsetX =
    u9Page3OffsetX;


  u9Page3StartOffsetY =
    u9Page3OffsetY;


  u9Page3AvatarPreview.setPointerCapture(
    event.pointerId
  );


  u9Page3AvatarPreview.classList.add(
    "dragging"
  );

}


/* =========================================================
   AVATAR DRAG MOVE
========================================================= */

function handleU9Page3PointerMove(
  event
) {

  if (
    !u9Page3Dragging
  ) {

    return;

  }


  u9Page3OffsetX =
    u9Page3StartOffsetX +
    (
      event.clientX -
      u9Page3DragStartX
    );


  u9Page3OffsetY =
    u9Page3StartOffsetY +
    (
      event.clientY -
      u9Page3DragStartY
    );


  updateU9Page3AvatarTransform();

}


/* =========================================================
   AVATAR DRAG END
========================================================= */

function handleU9Page3PointerUp(
  event
) {

  if (
    !u9Page3Dragging
  ) {

    return;

  }


  u9Page3Dragging =
    false;


  try {

    u9Page3AvatarPreview.releasePointerCapture(
      event.pointerId
    );

  } catch {

  }


  u9Page3AvatarPreview.classList.remove(
    "dragging"
  );

}


/* =========================================================
   CREATE AVATAR CROP
========================================================= */

function createU9Page3AvatarCropBlob() {

  return new Promise(
    function(resolve) {

      if (
        !u9Page3ImageLoaded ||
        !u9Page3AvatarImage.naturalWidth
      ) {

        resolve(
          null
        );


        return;

      }


      const canvas =
        document.createElement(
          "canvas"
        );


      canvas.width =
        300;


      canvas.height =
        300;


      const context =
        canvas.getContext(
          "2d"
        );


      const imageWidth =
        u9Page3AvatarImage.naturalWidth;


      const imageHeight =
        u9Page3AvatarImage.naturalHeight;


      const previewSize =
        u9Page3AvatarPreview.clientWidth;


      const scale =
        u9Page3BaseScale *
        u9Page3Zoom;


      const displayedWidth =
        imageWidth *
        scale;


      const displayedHeight =
        imageHeight *
        scale;


      const imageLeft =
        (
          previewSize -
          displayedWidth
        ) /
        2 +
        u9Page3OffsetX;


      const imageTop =
        (
          previewSize -
          displayedHeight
        ) /
        2 +
        u9Page3OffsetY;


      const sourceX =
        -imageLeft /
        scale;


      const sourceY =
        -imageTop /
        scale;


      const sourceSize =
        300 /
        scale *
        (
          previewSize /
          300
        );


      context.drawImage(
        u9Page3AvatarImage,
        sourceX,
        sourceY,
        sourceSize,
        sourceSize,
        0,
        0,
        300,
        300
      );


      canvas.toBlob(
        function(blob) {

          resolve(
            blob
          );

        },
        "image/webp",
        0.9
      );

    }
  );

}


/* =========================================================
   SAVE AVATAR
========================================================= */

async function saveU9Page3Avatar() {

  if (
    !u9Page3ImageLoaded ||
    !u9Page3SelectedImage
  ) {

    return;

  }


  u9Page3AvatarSave.disabled =
    true;


  setU9Page3AvatarStatus(
    "Saving..."
  );


  try {

    const blob =
      await createU9Page3AvatarCropBlob();


    if (!blob) {

      throw new Error(
        "Unable to crop image."
      );

    }


    const formData =
      new FormData();


    formData.append(
      "avatar",
      blob,
      "avatar.webp"
    );


    const result =
      await u9Page3Fetch(
        u9Page3AvatarUploadFunction,
        {
          method: "POST",
          body: formData
        }
      );


    const customUrl =
      result?.custom_url ||
      result?.avatar?.custom_url ||
      result?.user?.avatar?.custom_url;


    if (
      customUrl
    ) {

      u9Page3CurrentAvatarUrl =
        customUrl;

    }


    u9Page3CurrentAvatarType =
      "custom";


    u9Page3CurrentAvatarId =
      null;


    setU9Page3AvatarStatus(
      "Saved."
    );


    renderU9Page3FreeAvatarList();


    await loadU9Page3CurrentAvatar();


    window.U9ProfilePage3 =
      window.U9ProfilePage3 || {};


    window.U9ProfilePage3.lastBlob =
      blob;


    window.U9ProfilePage3.lastFile =
      new File(
        [blob],
        "avatar.webp",
        {
          type: "image/webp"
        }
      );


  } catch (error) {

    console.error(
      "U9 Page 3 Avatar Save Error:",
      error
    );


    setU9Page3AvatarStatus(
      error.message ||
      "Failed to save avatar."
    );


  } finally {

    u9Page3AvatarSave.disabled =
      false;

  }

}


/* =========================================================
   CANCEL AVATAR
========================================================= */

function cancelU9Page3Avatar() {

  if (
    u9Page3ImageObjectUrl
  ) {

    URL.revokeObjectURL(
      u9Page3ImageObjectUrl
    );

  }


  u9Page3ImageObjectUrl =
    null;


  u9Page3SelectedImage =
    null;


  u9Page3ImageLoaded =
    false;


  u9Page3OffsetX =
    0;


  u9Page3OffsetY =
    0;


  u9Page3Zoom =
    1;


  if (
    u9Page3AvatarInput
  ) {

    u9Page3AvatarInput.value =
      "";

  }


  if (
    u9Page3AvatarImage
  ) {

    u9Page3AvatarImage.src =
      "";


    u9Page3AvatarImage.hidden =
      true;

  }


  if (
    u9Page3AvatarPreview
  ) {

    u9Page3AvatarPreview.classList.remove(
      "has-image"
    );

  }


  if (
    u9Page3AvatarZoom
  ) {

    u9Page3AvatarZoom.value =
      "1";

  }


  if (
    u9Page3AvatarSave
  ) {

    u9Page3AvatarSave.disabled =
      true;

  }


  setU9Page3AvatarStatus(
    ""
  );

}


/* =========================================================
   AVATAR STATUS
========================================================= */

function setU9Page3AvatarStatus(
  message
) {

  if (
    u9Page3AvatarStatus
  ) {

    u9Page3AvatarStatus.textContent =
      message || "";

  }

}


/* =========================================================
   LOAD CURRENT AVATAR
========================================================= */

async function loadU9Page3CurrentAvatar() {

  try {

    const result =
      await u9Page3Fetch(
        u9Page3MeFunction
      );


    const user =
      result?.user;


    const avatar =
      user?.avatar;


    if (
      avatar
    ) {

      u9Page3CurrentAvatarType =
        avatar.type ||
        null;


      u9Page3CurrentAvatarId =
        avatar.id ||
        null;


      u9Page3CurrentAvatarUrl =
        avatar.custom_url ||
        null;

    }


    renderU9Page3FreeAvatarList();


  } catch (error) {

    console.error(
      "Failed to load current avatar:",
      error
    );

  }

}


/* =========================================================
   LOAD FREE AVATARS
========================================================= */

async function loadU9Page3FreeAvatars() {

  try {

    const result =
      await u9Page3Fetch(
        u9Page3AvatarFreeFunction
      );


    const avatars =
      Array.isArray(
        result?.avatars
      )
        ? result.avatars
        : [];


    window.U9Page3FreeAvatars =
      avatars;


    renderU9Page3FreeAvatarList();


  } catch (error) {

    console.error(
      "Failed to load free avatars:",
      error
    );

  }

}


/* =========================================================
   RENDER FREE AVATARS
========================================================= */

function renderU9Page3FreeAvatarList() {

  if (
    !u9Page3FreeAvatarList
  ) {

    return;

  }


  u9Page3FreeAvatarList.innerHTML =
    "";


  const avatars =
    window.U9Page3FreeAvatars ||
    [];


  avatars.forEach(
    function(avatar) {

      const card =
        document.createElement(
          "button"
        );


      card.type =
        "button";


      card.className =
        "U9-profile-page3-avatar-card";


      card.dataset.avatarId =
        avatar.id ?? "";


      card.dataset.avatarType =
        "free";


      const image =
        document.createElement(
          "img"
        );


      image.src =
        avatar.svg ||
        avatar.image_url ||
        avatar.url ||
        "";


      image.alt =
        avatar.name ||
        "";


      const name =
        document.createElement(
          "span"
        );


      name.textContent =
        avatar.name ||
        "";


      card.appendChild(
        image
      );


      card.appendChild(
        name
      );


      if (
        u9Page3CurrentAvatarType ===
          "free" &&
        String(
          u9Page3CurrentAvatarId
        ) ===
        String(
          avatar.id
        )
      ) {

        card.classList.add(
          "selected"
        );

      }


      card.addEventListener(
        "click",
        function() {

          selectU9Page3FreeAvatar(
            avatar
          );

        }
      );


      u9Page3FreeAvatarList.appendChild(
        card
      );

    }
  );

}


/* =========================================================
   SELECT FREE AVATAR
========================================================= */

async function selectU9Page3FreeAvatar(
  avatar
) {

  if (
    !avatar?.id
  ) {

    return;

  }


  try {

    setU9Page3AvatarStatus(
      "Selecting..."
    );


    const result =
      await u9Page3Fetch(
        u9Page3AvatarSetFunction,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json"
          },
          body: JSON.stringify(
            {
              type: "free",
              avatar_id:
                avatar.id
            }
          )
        }
      );


    u9Page3CurrentAvatarType =
      "free";


    u9Page3CurrentAvatarId =
      avatar.id;


    u9Page3CurrentAvatarUrl =
      null;


    setU9Page3AvatarStatus(
      result?.message ||
      ""
    );


    renderU9Page3FreeAvatarList();


  } catch (error) {

    console.error(
      "Failed to select free avatar:",
      error
    );


    setU9Page3AvatarStatus(
      error.message ||
      "Failed to select avatar."
    );

  }

}


/* =========================================================
   LOAD DEFAULT FRAMES
========================================================= */

async function loadU9Page3DefaultFrames() {

  try {

    const result =
      await u9Page3Fetch(
        u9Page3DefaultFrameFunction
      );


    const frames =
      Array.isArray(
        result?.frames
      )
        ? result.frames
        : [];


    u9Page3DefaultFrames =
      frames.map(
        function(frame) {

          return {
            ...frame,
            type: "default"
          };

        }
      );


  } catch (error) {

    console.error(
      "Failed to load default frames:",
      error
    );


    u9Page3DefaultFrames =
      [];

  }

}


/* =========================================================
   LOAD FREE FRAMES
========================================================= */

async function loadU9Page3FreeFrames() {

  try {

    const result =
      await u9Page3Fetch(
        u9Page3FreeFrameFunction
      );


    const frames =
      Array.isArray(
        result?.frames
      )
        ? result.frames
        : [];


    u9Page3FreeFrames =
      frames
        .filter(
          function(frame) {

            return (
              frame.is_active !==
              false
            );

          }
        )
        .map(
          function(frame) {

            return {
              ...frame,
              type: "free"
            };

          }
        );


  } catch (error) {

    console.error(
      "Failed to load free frames:",
      error
    );


    u9Page3FreeFrames =
      [];

  }

}


/* =========================================================
   LOAD PAID FRAMES
========================================================= */

async function loadU9Page3PaidFrames() {

  try {

    const result =
      await u9Page3Fetch(
        u9Page3PaidFrameFunction
      );


    const frames =
      Array.isArray(
        result?.frames
      )
        ? result.frames
        : [];


    u9Page3PaidFrames =
      frames
        .filter(
          function(frame) {

            return (
              frame.is_active !==
              false
            );

          }
        )
        .map(
          function(frame) {

            return {
              ...frame,
              type: "paid",
              owned:
                Boolean(
                  frame.owned
                )
            };

          }
        );


  } catch (error) {

    console.error(
      "Failed to load paid frames:",
      error
    );


    u9Page3PaidFrames =
      [];

  }

}


/* =========================================================
   LOAD CURRENT FRAME
========================================================= */

async function loadU9Page3CurrentFrame() {

  try {

    const result =
      await u9Page3Fetch(
        u9Page3MeFunction
      );


    const user =
      result?.user;


    u9Page3CurrentFrameType =
      user?.avatar_frame_type ||
      null;


    u9Page3CurrentFrameId =
      user?.avatar_frame_id ||
      null;


    u9Page3SelectedFrameType =
      u9Page3CurrentFrameType;


    u9Page3SelectedFrameId =
      u9Page3CurrentFrameId;


    updateU9Page3FrameSelection();


  } catch (error) {

    console.error(
      "Failed to load current frame:",
      error
    );

  }

}


/* =========================================================
   BUILD ALL FRAMES
========================================================= */

function buildU9Page3AllFrames() {

  u9Page3AllFrames = [
    ...u9Page3DefaultFrames,
    ...u9Page3FreeFrames,
    ...u9Page3PaidFrames
  ];

}


/* =========================================================
   RENDER FREE FRAMES
========================================================= */

function renderU9Page3FreeFrames() {

  if (
    !u9Page3FreeFrameList
  ) {

    return;

  }


  u9Page3FreeFrameList.innerHTML =
    "";


  u9Page3FreeFrames.forEach(
    function(frame) {

      const card =
        createU9Page3FrameCard(
          frame
        );


      u9Page3FreeFrameList.appendChild(
        card
      );

    }
  );

}


/* =========================================================
   RENDER PAID FRAMES
========================================================= */

function renderU9Page3PaidFrames() {

  if (
    !u9Page3PaidFrameList
  ) {

    return;

  }


  u9Page3PaidFrameList.innerHTML =
    "";


  u9Page3PaidFrames.forEach(
    function(frame) {

      const card =
        createU9Page3FrameCard(
          frame
        );


      u9Page3PaidFrameList.appendChild(
        card
      );

    }
  );

}


/* =========================================================
   CREATE FRAME CARD
========================================================= */

function createU9Page3FrameCard(
  frame
) {

  const wrapper =
    document.createElement(
      "div"
    );


  wrapper.className =
    "U9-profile-page3-frame-item";


  const card =
    document.createElement(
      "div"
    );


  card.className =
    "U9-profile-page3-frame-card";


  card.dataset.frameType =
    frame.type;


  card.dataset.frameId =
    frame.id ?? "";


  /* =====================================================
     FRAME IMAGE
  ===================================================== */

  const image =
    document.createElement(
      "img"
    );


  image.className =
    "U9-profile-page3-frame-image";


  image.src =
    frame.svg ||
    frame.image_url ||
    frame.url ||
    "";


  image.alt =
    frame.name ||
    "";


  card.appendChild(
    image
  );


  /* =====================================================
     PAID STATUS ICON
  ===================================================== */

  if (
    frame.type ===
    "paid"
  ) {

    const statusIcon =
      document.createElement(
        "img"
      );


    statusIcon.className =
      "U9-profile-page3-frame-status-icon";


    if (
      frame.owned
    ) {

      statusIcon.src =
        u9Page3OwnedSvg;


      statusIcon.alt =
        "Owned";


      card.classList.add(
        "owned"
      );

    } else {

      statusIcon.src =
        u9Page3LockSvg;


      statusIcon.alt =
        "Locked";


      card.classList.add(
        "locked"
      );

    }


    card.appendChild(
      statusIcon
    );

  }


  /* =====================================================
     NAME
  ===================================================== */

  const name =
    document.createElement(
      "div"
    );


  name.className =
    "U9-profile-page3-frame-name";


  name.textContent =
    frame.name ||
    "";


  card.appendChild(
    name
  );


  /* =====================================================
     ACTION
  ===================================================== */

  const action =
    document.createElement(
      "button"
    );


  action.type =
    "button";


  action.className =
    "U9-profile-page3-frame-action";


  if (
    frame.type ===
    "paid" &&
    !frame.owned
  ) {

    action.textContent =
      "Buy";


    action.addEventListener(
      "click",
      function() {

        openU9Page3PurchaseModal(
          frame
        );

      }
    );

  } else {

    action.textContent =
      "Use";


    action.addEventListener(
      "click",
      function() {

        selectU9Page3Frame(
          frame.type,
          frame.id
        );

      }
    );

  }


  wrapper.appendChild(
    card
  );


  wrapper.appendChild(
    action
  );


  if (
    u9Page3SelectedFrameType ===
      frame.type &&
    String(
      u9Page3SelectedFrameId
    ) ===
    String(
      frame.id
    )
  ) {

    card.classList.add(
      "selected"
    );

  }


  return wrapper;

}


/* =========================================================
   SELECT FRAME
========================================================= */

function selectU9Page3Frame(
  type,
  id
) {

  u9Page3SelectedFrameType =
    type;


  u9Page3SelectedFrameId =
    id;


  updateU9Page3FrameSelection();


  equipU9Page3SelectedFrame();

}


/* =========================================================
   UPDATE FRAME SELECTION
========================================================= */

function updateU9Page3FrameSelection() {

  const cards =
    document.querySelectorAll(
      ".U9-profile-page3-frame-card"
    );


  cards.forEach(
    function(card) {

      const isSelected =
        card.dataset.frameType ===
          String(
            u9Page3SelectedFrameType
          ) &&
        card.dataset.frameId ===
          String(
            u9Page3SelectedFrameId
          );


      card.classList.toggle(
        "selected",
        isSelected
      );

    }
  );

}


/* =========================================================
   EQUIP FRAME
========================================================= */

async function equipU9Page3SelectedFrame() {

  if (
    !u9Page3SelectedFrameType
  ) {

    return;

  }


  try {

    const result =
      await u9Page3Fetch(
        u9Page3EquipFrameFunction,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json"
          },
          body: JSON.stringify(
            {
              frame_type:
                u9Page3SelectedFrameType,

              frame_id:
                u9Page3SelectedFrameId
            }
          )
        }
      );


    u9Page3CurrentFrameType =
      u9Page3SelectedFrameType;


    u9Page3CurrentFrameId =
      u9Page3SelectedFrameId;


    updateU9Page3FrameSelection();


    console.log(
      "Frame equipped:",
      result
    );


  } catch (error) {

    console.error(
      "Failed to equip frame:",
      error
    );


    u9Page3SelectedFrameType =
      u9Page3CurrentFrameType;


    u9Page3SelectedFrameId =
      u9Page3CurrentFrameId;


    updateU9Page3FrameSelection();

  }

}


/* =========================================================
   PURCHASE MODAL
========================================================= */

function openU9Page3PurchaseModal(
  frame
) {

  closeU9Page3PurchaseModal();


  const modal =
    document.createElement(
      "div"
    );


  modal.id =
    "U9-profile-page3-frame-purchase-modal";


  const content =
    document.createElement(
      "div"
    );


  content.id =
    "U9-profile-page3-frame-purchase-content";


  const title =
    document.createElement(
      "h3"
    );


  title.id =
    "U9-profile-page3-frame-purchase-title";


  title.textContent =
    "Purchase Frame";


  const image =
    document.createElement(
      "img"
    );


  image.id =
    "U9-profile-page3-frame-purchase-image";


  image.src =
    frame.svg ||
    frame.image_url ||
    frame.url ||
    "";


  const name =
    document.createElement(
      "div"
    );


  name.id =
    "U9-profile-page3-frame-purchase-name";


  name.textContent =
    frame.name ||
    "";


  const price =
    document.createElement(
      "div"
    );


  price.id =
    "U9-profile-page3-frame-purchase-price";


  price.textContent =
    `${frame.coins_price || 0} Coins`;


  const message =
    document.createElement(
      "div"
    );


  message.id =
    "U9-profile-page3-frame-purchase-message";


  message.textContent =
    `Purchase ${frame.name || "this frame"} for ${frame.coins_price || 0} Coins?`;


  const actions =
    document.createElement(
      "div"
    );


  actions.id =
    "U9-profile-page3-frame-purchase-actions";


  const cancel =
    document.createElement(
      "button"
    );


  cancel.id =
    "U9-profile-page3-frame-purchase-cancel";


  cancel.type =
    "button";


  cancel.textContent =
    "Cancel";


  const confirm =
    document.createElement(
      "button"
    );


  confirm.id =
    "U9-profile-page3-frame-purchase-confirm";


  confirm.type =
    "button";


  confirm.textContent =
    "Confirm";


  actions.appendChild(
    cancel
  );


  actions.appendChild(
    confirm
  );


  content.appendChild(
    title
  );


  content.appendChild(
    image
  );


  content.appendChild(
    name
  );


  content.appendChild(
    price
  );


  content.appendChild(
    message
  );


  content.appendChild(
    actions
  );


  modal.appendChild(
    content
  );


  document.body.appendChild(
    modal
  );


  u9Page3PurchaseModal =
    modal;


  cancel.addEventListener(
    "click",
    closeU9Page3PurchaseModal
  );


  confirm.addEventListener(
    "click",
    function() {

      purchaseU9Page3PaidFrame(
        frame,
        confirm
      );

    }
  );


  modal.addEventListener(
    "click",
    function(event) {

      if (
        event.target ===
        modal
      ) {

        closeU9Page3PurchaseModal();

      }

    }
  );

}


/* =========================================================
   CLOSE PURCHASE MODAL
========================================================= */

function closeU9Page3PurchaseModal() {

  if (
    u9Page3PurchaseModal
  ) {

    u9Page3PurchaseModal.remove();

    u9Page3PurchaseModal =
      null;

  }

}


/* =========================================================
   PURCHASE PAID FRAME
========================================================= */

async function purchaseU9Page3PaidFrame(
  frame,
  confirmButton
) {

  if (
    u9Page3PurchasingFrame
  ) {

    return;

  }


  u9Page3PurchasingFrame =
    true;


  confirmButton.disabled =
    true;


  confirmButton.textContent =
    "Buying...";


  try {

    const result =
      await u9Page3Fetch(
        u9Page3PaidFramePurchaseFunction,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json"
          },
          body: JSON.stringify(
            {
              frame_id:
                frame.id
            }
          )
        }
      );


    const paidFrame =
      u9Page3PaidFrames.find(
        function(item) {

          return String(
            item.id
          ) ===
          String(
            frame.id
          );

        }
      );


    if (
      paidFrame
    ) {

      paidFrame.owned =
        true;

    }


    buildU9Page3AllFrames();


    renderU9Page3PaidFrames();


    closeU9Page3PurchaseModal();


    console.log(
      "Frame purchased:",
      result
    );


  } catch (error) {

    console.error(
      "Failed to purchase frame:",
      error
    );


    const message =
      error.message ||
      "";


    if (
      message ===
      "Not enough coins."
    ) {

      confirmButton.disabled =
        false;


      confirmButton.textContent =
        "Confirm";


      const errorElement =
        document.createElement(
          "div"
        );


      errorElement.className =
        "U9-profile-page3-purchase-error";


      errorElement.textContent =
        "Not enough coins.";


      const content =
        u9Page3PurchaseModal?.querySelector(
          "#U9-profile-page3-frame-purchase-content"
        );


      if (
        content
      ) {

        const oldError =
          content.querySelector(
            ".U9-profile-page3-purchase-error"
          );


        if (
          oldError
        ) {

          oldError.remove();

        }


        content.appendChild(
          errorElement
        );

      }


    } else if (
      message ===
      "Paid frame already purchased."
    ) {

      const paidFrame =
        u9Page3PaidFrames.find(
          function(item) {

            return String(
              item.id
            ) ===
            String(
              frame.id
            );

          }
        );


      if (
        paidFrame
      ) {

        paidFrame.owned =
          true;

      }


      buildU9Page3AllFrames();


      renderU9Page3PaidFrames();


      closeU9Page3PurchaseModal();


    } else {

      confirmButton.disabled =
        false;


      confirmButton.textContent =
        "Confirm";


      const errorElement =
        document.createElement(
          "div"
        );


      errorElement.className =
        "U9-profile-page3-purchase-error";


      errorElement.textContent =
        message ||
        "Purchase failed.";


      const content =
        u9Page3PurchaseModal?.querySelector(
          "#U9-profile-page3-frame-purchase-content"
        );


      if (
        content
      ) {

        const oldError =
          content.querySelector(
            ".U9-profile-page3-purchase-error"
          );


        if (
          oldError
        ) {

          oldError.remove();

        }


        content.appendChild(
          errorElement
        );

      }

    }

  } finally {

    u9Page3PurchasingFrame =
      false;

  }

}


/* =========================================================
   LOAD PAGE 3 DATA
========================================================= */

async function loadU9Page3Data() {

  try {

    await Promise.all(
      [
        loadU9Page3CurrentAvatar(),
        loadU9Page3FreeAvatars(),

        loadU9Page3DefaultFrames(),
        loadU9Page3FreeFrames(),
        loadU9Page3PaidFrames(),
        loadU9Page3CurrentFrame()
      ]
    );


    buildU9Page3AllFrames();


    renderU9Page3FreeAvatarList();


    renderU9Page3FreeFrames();


    renderU9Page3PaidFrames();


    updateU9Page3FrameSelection();


  } catch (error) {

    console.error(
      "Failed to load U9 Profile Page 3:",
      error
    );

  }

}


/* =========================================================
   INIT
========================================================= */

function initU9ProfilePage3() {

  if (
    !u9ProfilePage3Content
  ) {

    return;

  }


  createU9Page3();


  loadU9Page3Data();

}


/* =========================================================
   GLOBAL API
========================================================= */

window.U9ProfilePage3 = {

  lastBlob: null,

  lastFile: null,

  getCroppedBlob:
    createU9Page3AvatarCropBlob,

  getCroppedFile:
    async function() {

      const blob =
        await createU9Page3AvatarCropBlob();


      if (!blob) {

        return null;

      }


      return new File(
        [
          blob
        ],
        "avatar.webp",
        {
          type:
            "image/webp"
        }
      );

    },

  loadCurrentAvatar:
    loadU9Page3CurrentAvatar,

  loadFreeAvatars:
    loadU9Page3FreeAvatars,

  loadCurrentFrame:
    loadU9Page3CurrentFrame,

  loadFrames:
    loadU9Page3Data

};


/* =========================================================
   START
========================================================= */

if (
  u9ProfilePage3Content
) {

  initU9ProfilePage3();

}
