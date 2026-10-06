/* =========================================================
   PROFILE PICTURE MODAL
   Upload / Crop / Zoom / Drag / Confirm
========================================================= */


/* =========================================================
   API
========================================================= */

const U9_PROFILE_PICTURE_UPLOAD_API =
  "https://tvtakmswbzawaweytimx.supabase.co/functions/v1/avatar-upload";


/* =========================================================
   ELEMENTS
========================================================= */

const profilePictureModal =
  document.getElementById(
    "U9-profile-picture-modal"
  );


const profilePictureOverlay =
  document.getElementById(
    "U9-profile-picture-modal-overlay"
  );


const profilePictureClose =
  document.getElementById(
    "U9-profile-picture-modal-close"
  );


const profilePictureSelect =
  document.getElementById(
    "U9-profile-picture-select"
  );


const profilePictureSelectButton =
  document.getElementById(
    "U9-profile-picture-select-button"
  );


const profilePictureFileInput =
  document.getElementById(
    "U9-profile-picture-file"
  );


const profilePictureEditor =
  document.getElementById(
    "U9-profile-picture-editor"
  );


const profilePictureCropArea =
  document.getElementById(
    "U9-profile-picture-crop-area"
  );


const profilePictureImageContainer =
  document.getElementById(
    "U9-profile-picture-image-container"
  );


const profilePictureImage =
  document.getElementById(
    "U9-profile-picture-image"
  );


const profilePictureZoomOut =
  document.getElementById(
    "U9-profile-picture-zoom-out"
  );


const profilePictureZoomIn =
  document.getElementById(
    "U9-profile-picture-zoom-in"
  );


const profilePictureZoomRange =
  document.getElementById(
    "U9-profile-picture-zoom-range"
  );


const profilePictureReset =
  document.getElementById(
    "U9-profile-picture-reset"
  );


const profilePictureChange =
  document.getElementById(
    "U9-profile-picture-change"
  );


const profilePictureConfirm =
  document.getElementById(
    "U9-profile-picture-confirm"
  );


const profilePictureLoading =
  document.getElementById(
    "U9-profile-picture-loading"
  );


const profilePictureLoadingText =
  document.getElementById(
    "U9-profile-picture-loading-text"
  );


const profilePictureMessage =
  document.getElementById(
    "U9-profile-picture-message"
  );


/* =========================================================
   STATE
========================================================= */

let profilePictureFile =
  null;


let profilePictureObjectURL =
  null;


let profilePictureNaturalWidth =
  0;


let profilePictureNaturalHeight =
  0;


let profilePictureBaseScale =
  1;


let profilePictureZoom =
  1;


let profilePictureX =
  0;


let profilePictureY =
  0;


let profilePictureDragging =
  false;


let profilePictureDragStartX =
  0;


let profilePictureDragStartY =
  0;


let profilePictureStartX =
  0;


let profilePictureStartY =
  0;


/* =========================================================
   CONSTANTS
========================================================= */

const U9_PROFILE_PICTURE_OUTPUT_SIZE =
  512;


const U9_PROFILE_PICTURE_MIN_ZOOM =
  1;


const U9_PROFILE_PICTURE_MAX_ZOOM =
  3;


/* =========================================================
   GET LOGIN TOKEN
========================================================= */

function getProfilePictureToken() {

  try {

    const token =
      localStorage.getItem(
        "u9_token"
      );

    return token || null;

  }
  catch {

    return null;

  }

}


/* =========================================================
   CHECK LOGIN
========================================================= */

function isProfilePictureLoggedIn() {

  try {

    if (
      window.U9User &&
      typeof window.U9User.isLoggedIn ===
        "function"
    ) {

      return window.U9User.isLoggedIn();

    }

  }
  catch {
    /* ignore */
  }


  return !!getProfilePictureToken();

}


/* =========================================================
   GET AUTHORIZATION TOKEN
========================================================= */

function getProfilePictureAuthorizationToken() {

  const token =
    getProfilePictureToken();


  if (!token) {

    return null;

  }


  return `Bearer ${token}`;

}


/* =========================================================
   GET OUTPUT FORMAT
========================================================= */

function getProfilePictureOutputFormat() {

  const type =
    (
      profilePictureFile?.type ||
      ""
    )
      .toLowerCase()
      .trim();


  /* =========================
     JPEG
  ========================= */

  if (
    type ===
      "image/jpeg" ||
    type ===
      "image/jpg"
  ) {

    return {

      mimeType:
        "image/jpeg",

      extension:
        "jpg",

      quality:
        0.92

    };

  }


  /* =========================
     PNG
  ========================= */

  if (
    type ===
    "image/png"
  ) {

    return {

      mimeType:
        "image/png",

      extension:
        "png",

      quality:
        undefined

    };

  }


  /* =========================
     WEBP
  ========================= */

  if (
    type ===
    "image/webp"
  ) {

    return {

      mimeType:
        "image/webp",

      extension:
        "webp",

      quality:
        0.92

    };

  }


  /* =========================
     GIF
     Canvas cannot preserve
     GIF animation.
  ========================= */

  if (
    type ===
    "image/gif"
  ) {

    return {

      mimeType:
        "image/png",

      extension:
        "png",

      quality:
        undefined

    };

  }


  /* =========================
     FALLBACK
  ========================= */

  return {

    mimeType:
      "image/png",

    extension:
      "png",

    quality:
      undefined

  };

}


/* =========================================================
   GET EXTENSION FROM MIME
========================================================= */

function getProfilePictureExtensionFromMimeType(
  mimeType
) {

  const type =
    (
      mimeType ||
      ""
    )
      .toLowerCase()
      .trim();


  if (
    type ===
      "image/jpeg" ||
    type ===
      "image/jpg"
  ) {

    return "jpg";

  }


  if (
    type ===
    "image/webp"
  ) {

    return "webp";

  }


  return "png";

}


/* =========================================================
   SHOW MESSAGE
========================================================= */

function showProfilePictureMessage(
  message,
  type = "error"
) {

  if (
    !profilePictureMessage
  ) {

    return;

  }


  profilePictureMessage.textContent =
    message;


  profilePictureMessage.dataset.type =
    type;


  profilePictureMessage.style.display =
    "block";

}


/* =========================================================
   HIDE MESSAGE
========================================================= */

function hideProfilePictureMessage() {

  if (
    !profilePictureMessage
  ) {

    return;

  }


  profilePictureMessage.textContent =
    "";


  profilePictureMessage.style.display =
    "none";


  delete profilePictureMessage.dataset.type;

}


/* =========================================================
   SET LOADING
========================================================= */

function setProfilePictureLoading(
  loading,
  text = "Uploading..."
) {

  if (
    profilePictureLoading
  ) {

    profilePictureLoading.style.display =
      loading
        ? "flex"
        : "none";

  }


  if (
    profilePictureLoadingText
  ) {

    profilePictureLoadingText.textContent =
      text;

  }


  if (
    profilePictureConfirm
  ) {

    profilePictureConfirm.disabled =
      loading;

  }


  if (
    profilePictureChange
  ) {

    profilePictureChange.disabled =
      loading;

  }


  if (
    profilePictureSelectButton
  ) {

    profilePictureSelectButton.disabled =
      loading;

  }

}


/* =========================================================
   CALCULATE BASE SCALE
========================================================= */

function calculateProfilePictureBaseScale() {

  if (
    !profilePictureCropArea ||
    !profilePictureNaturalWidth ||
    !profilePictureNaturalHeight
  ) {

    return 1;

  }


  const cropWidth =
    profilePictureCropArea.clientWidth;


  const cropHeight =
    profilePictureCropArea.clientHeight;


  if (
    cropWidth <= 0 ||
    cropHeight <= 0
  ) {

    return 1;

  }


  const scaleX =
    cropWidth /
    profilePictureNaturalWidth;


  const scaleY =
    cropHeight /
    profilePictureNaturalHeight;


  return Math.max(
    scaleX,
    scaleY
  );

}


/* =========================================================
   GET CURRENT IMAGE SIZE
========================================================= */

function getProfilePictureCurrentSize() {

  const scale =
    profilePictureBaseScale *
    profilePictureZoom;


  return {

    width:
      profilePictureNaturalWidth *
      scale,

    height:
      profilePictureNaturalHeight *
      scale

  };

}


/* =========================================================
   GET POSITION LIMITS
========================================================= */

function getProfilePicturePositionLimits() {

  if (
    !profilePictureCropArea
  ) {

    return {

      minX: 0,
      maxX: 0,
      minY: 0,
      maxY: 0

    };

  }


  const cropWidth =
    profilePictureCropArea.clientWidth;


  const cropHeight =
    profilePictureCropArea.clientHeight;


  const imageSize =
    getProfilePictureCurrentSize();


  const maxOffsetX =
    Math.max(
      0,
      (
        imageSize.width -
        cropWidth
      ) / 2
    );


  const maxOffsetY =
    Math.max(
      0,
      (
        imageSize.height -
        cropHeight
      ) / 2
    );


  return {

    minX:
      -maxOffsetX,

    maxX:
      maxOffsetX,

    minY:
      -maxOffsetY,

    maxY:
      maxOffsetY

  };

}


/* =========================================================
   CLAMP POSITION
========================================================= */

function clampProfilePicturePosition() {

  const limits =
    getProfilePicturePositionLimits();


  profilePictureX =
    Math.max(
      limits.minX,
      Math.min(
        limits.maxX,
        profilePictureX
      )
    );


  profilePictureY =
    Math.max(
      limits.minY,
      Math.min(
        limits.maxY,
        profilePictureY
      )
    );

}


/* =========================================================
   UPDATE IMAGE TRANSFORM
========================================================= */

function updateProfilePictureTransform() {

  if (
    !profilePictureImage
  ) {

    return;

  }


  clampProfilePicturePosition();


  const scale =
    profilePictureBaseScale *
    profilePictureZoom;


  profilePictureImage.style.transform =
    `translate3d(
      calc(-50% + ${profilePictureX}px),
      calc(-50% + ${profilePictureY}px),
      0
    ) scale(${scale})`;

}


/* =========================================================
   UPDATE ZOOM UI
========================================================= */

function updateProfilePictureZoomUI() {

  if (
    profilePictureZoomRange
  ) {

    profilePictureZoomRange.min =
      String(
        U9_PROFILE_PICTURE_MIN_ZOOM
      );


    profilePictureZoomRange.max =
      String(
        U9_PROFILE_PICTURE_MAX_ZOOM
      );


    profilePictureZoomRange.step =
      "0.01";


    profilePictureZoomRange.value =
      String(
        profilePictureZoom
      );

  }

}


/* =========================================================
   RESET POSITION
========================================================= */

function resetProfilePictureEditor() {

  profilePictureZoom =
    U9_PROFILE_PICTURE_MIN_ZOOM;


  profilePictureX =
    0;


  profilePictureY =
    0;


  profilePictureBaseScale =
    calculateProfilePictureBaseScale();


  updateProfilePictureZoomUI();


  updateProfilePictureTransform();

}


/* =========================================================
   UPDATE BASE SCALE
========================================================= */

function updateProfilePictureBaseScale() {

  profilePictureBaseScale =
    calculateProfilePictureBaseScale();


  updateProfilePictureTransform();

}


/* =========================================================
   FILE VALIDATION
========================================================= */

function isValidProfilePictureFile(
  file
) {

  if (
    !file
  ) {

    return false;

  }


  const type =
    (
      file.type ||
      ""
    )
      .toLowerCase()
      .trim();


  if (
    type ===
      "image/png" ||
    type ===
      "image/jpeg" ||
    type ===
      "image/jpg" ||
    type ===
      "image/webp" ||
    type ===
      "image/gif"
  ) {

    return true;

  }


  return false;

}


/* =========================================================
   SELECT FILE
========================================================= */

function selectProfilePictureFile() {

  if (
    profilePictureFileInput
  ) {

    profilePictureFileInput.value =
      "";

    profilePictureFileInput.click();

  }

}


/* =========================================================
   LOAD IMAGE
========================================================= */

function loadProfilePictureImage(
  file
) {

  return new Promise(
    function (
      resolve,
      reject
    ) {

      if (
        profilePictureObjectURL
      ) {

        URL.revokeObjectURL(
          profilePictureObjectURL
        );

        profilePictureObjectURL =
          null;

      }


      profilePictureObjectURL =
        URL.createObjectURL(
          file
        );


      const image =
        new Image();


      image.onload =
        function () {

          profilePictureNaturalWidth =
            image.naturalWidth ||
            image.width;


          profilePictureNaturalHeight =
            image.naturalHeight ||
            image.height;


          if (
            profilePictureImage
          ) {

            profilePictureImage.src =
              profilePictureObjectURL;

          }


          resolve();

        };


      image.onerror =
        function () {

          reject(
            new Error(
              "Unable to load image"
            )
          );

        };


      image.src =
        profilePictureObjectURL;

    }
  );

}


/* =========================================================
   HANDLE FILE
========================================================= */

async function handleProfilePictureFile(
  file
) {

  hideProfilePictureMessage();


  if (
    !file
  ) {

    return;

  }


  if (
    !isValidProfilePictureFile(
      file
    )
  ) {

    showProfilePictureMessage(
      "Please select a PNG, JPG, JPEG, WebP, or GIF image.",
      "error"
    );

    return;

  }


  const maxInputSize =
    20 * 1024 * 1024;


  if (
    file.size >
    maxInputSize
  ) {

    showProfilePictureMessage(
      "Image file is too large. Maximum size is 20 MB.",
      "error"
    );

    return;

  }


  try {

    profilePictureFile =
      file;


    await loadProfilePictureImage(
      file
    );


    profilePictureZoom =
      U9_PROFILE_PICTURE_MIN_ZOOM;


    profilePictureX =
      0;


    profilePictureY =
      0;


    profilePictureBaseScale =
      calculateProfilePictureBaseScale();


    updateProfilePictureZoomUI();


    updateProfilePictureTransform();


    if (
      profilePictureSelect
    ) {

      profilePictureSelect.style.display =
        "none";

    }


    if (
      profilePictureEditor
    ) {

      profilePictureEditor.style.display =
        "block";

    }


    if (
      profilePictureConfirm
    ) {

      profilePictureConfirm.disabled =
        false;

    }

  }
  catch (error) {

    console.error(
      "PROFILE PICTURE IMAGE LOAD ERROR:",
      error
    );


    profilePictureFile =
      null;


    showProfilePictureMessage(
      "Unable to load this image.",
      "error"
    );

  }

}


/* =========================================================
   CREATE CROPPED IMAGE
========================================================= */

function createCroppedProfilePicture() {

  return new Promise(
    function (
      resolve,
      reject
    ) {

      if (
        !profilePictureImage ||
        !profilePictureCropArea ||
        !profilePictureFile
      ) {

        reject(
          new Error(
            "No profile picture selected"
          )
        );

        return;

      }


      const cropWidth =
        profilePictureCropArea.clientWidth;


      const cropHeight =
        profilePictureCropArea.clientHeight;


      if (
        cropWidth <= 0 ||
        cropHeight <= 0
      ) {

        reject(
          new Error(
            "Invalid crop area"
          )
        );

        return;

      }


      const outputSize =
        U9_PROFILE_PICTURE_OUTPUT_SIZE;


      const canvas =
        document.createElement(
          "canvas"
        );


      canvas.width =
        outputSize;


      canvas.height =
        outputSize;


      const context =
        canvas.getContext(
          "2d",
          {
            alpha: true
          }
        );


      if (
        !context
      ) {

        reject(
          new Error(
            "Unable to create canvas"
          )
        );

        return;

      }


      /* =========================
         CURRENT SCALE
      ========================= */

      const currentScale =
        profilePictureBaseScale *
        profilePictureZoom;


      if (
        currentScale <= 0
      ) {

        reject(
          new Error(
            "Invalid image scale"
          )
        );

        return;

      }


      /* =========================
         IMAGE SIZE
      ========================= */

      const displayedImageWidth =
        profilePictureNaturalWidth *
        currentScale;


      const displayedImageHeight =
        profilePictureNaturalHeight *
        currentScale;


      /* =========================
         IMAGE TOP LEFT
      ========================= */

      const imageLeft =
        (
          cropWidth -
          displayedImageWidth
        ) / 2 +
        profilePictureX;


      const imageTop =
        (
          cropHeight -
          displayedImageHeight
        ) / 2 +
        profilePictureY;


      /* =========================
         CROP RECTANGLE
      ========================= */

      const cropSourceX =
        Math.max(
          0,
          -imageLeft
        ) /
        currentScale;


      const cropSourceY =
        Math.max(
          0,
          -imageTop
        ) /
        currentScale;


      const cropSourceWidth =
        cropWidth /
        currentScale;


      const cropSourceHeight =
        cropHeight /
        currentScale;


      /* =========================
         DRAW
      ========================= */

      context.clearRect(
        0,
        0,
        outputSize,
        outputSize
      );


      context.imageSmoothingEnabled =
        true;


      context.imageSmoothingQuality =
        "high";


      context.drawImage(

        profilePictureImage,

        cropSourceX,
        cropSourceY,

        cropSourceWidth,
        cropSourceHeight,

        0,
        0,

        outputSize,
        outputSize

      );


      /* =========================
         OUTPUT FORMAT
      ========================= */

      const requestedFormat =
        getProfilePictureOutputFormat();


      const requestedMimeType =
        requestedFormat.mimeType;


      const requestedQuality =
        requestedFormat.quality;


      /* =========================
         CONVERT CANVAS
      ========================= */

      canvas.toBlob(

        function (
          blob
        ) {

          if (
            blob &&
            blob.size > 0
          ) {

            const actualMimeType =
              (
                blob.type ||
                requestedMimeType
              )
                .toLowerCase()
                .trim();


            const actualExtension =
              getProfilePictureExtensionFromMimeType(
                actualMimeType
              );


            resolve({

              blob:
                blob,

              mimeType:
                actualMimeType,

              extension:
                actualExtension

            });


            return;

          }


          /* =========================
             PNG FALLBACK
          ========================= */

          canvas.toBlob(

            function (
              fallbackBlob
            ) {

              if (
                !fallbackBlob ||
                fallbackBlob.size <= 0
              ) {

                reject(
                  new Error(
                    "Unable to create cropped image"
                  )
                );

                return;

              }


              resolve({

                blob:
                  fallbackBlob,

                mimeType:
                  "image/png",

                extension:
                  "png"

              });

            },

            "image/png"

          );

        },

        requestedMimeType,

        requestedQuality

      );

    }
  );

}


/* =========================================================
   UPLOAD PROFILE PICTURE
========================================================= */

async function uploadProfilePicture() {

  if (
    !isProfilePictureLoggedIn()
  ) {

    showProfilePictureMessage(
      "Please log in first.",
      "error"
    );

    return;

  }


  if (
    !profilePictureFile
  ) {

    showProfilePictureMessage(
      "Please select an image first.",
      "error"
    );

    return;

  }


  hideProfilePictureMessage();


  setProfilePictureLoading(
    true,
    "Preparing image..."
  );


  try {

    /* =========================
       CREATE CROPPED IMAGE
    ========================= */

    const croppedImage =
      await createCroppedProfilePicture();


    if (
      !croppedImage ||
      !croppedImage.blob
    ) {

      throw new Error(
        "Unable to create cropped image"
      );

    }


    /* =========================
       FILE SIZE
    ========================= */

    if (
      croppedImage.blob.size >
      2 * 1024 * 1024
    ) {

      throw new Error(
        "Cropped image is too large"
      );

    }


    /* =========================
       FORM DATA
    ========================= */

    const formData =
      new FormData();


    const filename =
      `avatar.${croppedImage.extension}`;


    const croppedFile =
      new File(

        [
          croppedImage.blob
        ],

        filename,

        {

          type:
            croppedImage.mimeType,

          lastModified:
            Date.now()

        }

      );


    formData.append(

      "avatar",

      croppedFile,

      filename

    );


    /* =========================
       AUTHORIZATION
    ========================= */

    const authorizationToken =
      getProfilePictureAuthorizationToken();


    const headers = {};


    if (
      authorizationToken
    ) {

      headers.Authorization =
        authorizationToken;

    }


    /* =========================
       UPLOAD
    ========================= */

    setProfilePictureLoading(
      true,
      "Uploading avatar..."
    );


    const response =
      await fetch(

        U9_PROFILE_PICTURE_UPLOAD_API,

        {

          method:
            "POST",

          headers:
            headers,

          body:
            formData,

          credentials:
            "include"

        }

      );


    /* =========================
       READ RESPONSE
    ========================= */

    let result =
      null;


    try {

      result =
        await response.json();

    }
    catch {

      result =
        null;

    }


    /* =========================
       ERROR
    ========================= */

    if (
      !response.ok ||
      !result?.success
    ) {

      const errorMessage =
        result?.error ||
        result?.message ||
        `Upload failed (${response.status})`;


      throw new Error(
        errorMessage
      );

    }


    /* =========================
       GET AVATAR URL
    ========================= */

    const avatarURL =
      result?.avatar_url ||
      result?.avatar?.url ||
      result?.data?.avatar_url ||
      result?.data?.avatar?.url ||
      null;


    /* =========================
       UPDATE CURRENT USER
    ========================= */

    try {

      if (
        window.U9User &&
        typeof window.U9User.refresh ===
          "function"
      ) {

        await window.U9User.refresh();

      }

    }
    catch (error) {

      console.warn(
        "U9User refresh failed:",
        error
      );

    }


    /* =========================
       UPDATE PROFILE AVATAR
    ========================= */

    try {

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

    }
    catch (error) {

      console.warn(
        "U9Profile avatar refresh failed:",
        error
      );

    }


    /* =========================
       DIRECT IMAGE UPDATE
    ========================= */

    if (
      avatarURL
    ) {

      const avatarImage =
        document.getElementById(
          "U9-profile-avatar-image"
        );


      if (
        avatarImage
      ) {

        avatarImage.src =
          avatarURL +
          (
            avatarURL.includes("?")
              ? "&"
              : "?"
          ) +
          "t=" +
          Date.now();

      }

    }


    /* =========================
       SUCCESS MESSAGE
    ========================= */

    showProfilePictureMessage(
      "Profile picture uploaded successfully.",
      "success"
    );


    /* =========================
       SUCCESS
       AUTO REFRESH
    ========================= */

    setProfilePictureLoading(
      true,
      "Upload successful. Refreshing..."
    );


    setTimeout(
      function () {

        window.location.reload();

      },
      500
    );

  }
  catch (error) {

    console.error(
      "PROFILE PICTURE UPLOAD ERROR:",
      error
    );


    const message =
      error instanceof Error
        ? error.message
        : "Failed to upload profile picture";


    showProfilePictureMessage(
      message,
      "error"
    );


    setProfilePictureLoading(
      false
    );

  }

}


/* =========================================================
   OPEN MODAL
========================================================= */

function openProfilePictureModal() {

  if (
    !profilePictureModal
  ) {

    return;

  }


  hideProfilePictureMessage();


  setProfilePictureLoading(
    false
  );


  if (
    profilePictureFileInput
  ) {

    profilePictureFileInput.value =
      "";

  }


  profilePictureModal.style.display =
    "flex";


  requestAnimationFrame(
    function () {

      profilePictureModal.classList.add(
        "U9-profile-picture-modal-open"
      );


      if (
        profilePictureCropArea &&
        profilePictureFile
      ) {

        updateProfilePictureBaseScale();

      }

    }
  );

}


/* =========================================================
   CLOSE MODAL
========================================================= */

function closeProfilePictureModal() {

  if (
    !profilePictureModal
  ) {

    return;

  }


  if (
    profilePictureDragging
  ) {

    profilePictureDragging =
      false;

  }


  profilePictureModal.classList.remove(
    "U9-profile-picture-modal-open"
  );


  setTimeout(
    function () {

      if (
        profilePictureModal
      ) {

        profilePictureModal.style.display =
          "none";

      }

    },
    200
  );


  hideProfilePictureMessage();


  setProfilePictureLoading(
    false
  );


  if (
    profilePictureObjectURL
  ) {

    URL.revokeObjectURL(
      profilePictureObjectURL
    );

    profilePictureObjectURL =
      null;

  }


  profilePictureFile =
    null;


  profilePictureNaturalWidth =
    0;


  profilePictureNaturalHeight =
    0;


  profilePictureBaseScale =
    1;


  profilePictureZoom =
    1;


  profilePictureX =
    0;


  profilePictureY =
    0;


  if (
    profilePictureImage
  ) {

    profilePictureImage.removeAttribute(
      "src"
    );

  }


  if (
    profilePictureSelect
  ) {

    profilePictureSelect.style.display =
      "";

  }


  if (
    profilePictureEditor
  ) {

    profilePictureEditor.style.display =
      "";

  }

}


/* =========================================================
   CHANGE IMAGE
========================================================= */

function changeProfilePicture() {

  if (
    profilePictureFileInput
  ) {

    profilePictureFileInput.value =
      "";

    profilePictureFileInput.click();

  }

}


/* =========================================================
   ZOOM OUT
========================================================= */

function zoomOutProfilePicture() {

  profilePictureZoom =
    Math.max(

      U9_PROFILE_PICTURE_MIN_ZOOM,

      profilePictureZoom -
        0.1

    );


  updateProfilePictureZoomUI();


  updateProfilePictureTransform();

}


/* =========================================================
   ZOOM IN
========================================================= */

function zoomInProfilePicture() {

  profilePictureZoom =
    Math.min(

      U9_PROFILE_PICTURE_MAX_ZOOM,

      profilePictureZoom +
        0.1

    );


  updateProfilePictureZoomUI();


  updateProfilePictureTransform();

}


/* =========================================================
   ZOOM RANGE
========================================================= */

function handleProfilePictureZoomRange(
  event
) {

  const value =
    Number(
      event.target.value
    );


  if (
    Number.isNaN(
      value
    )
  ) {

    return;

  }


  profilePictureZoom =
    Math.max(

      U9_PROFILE_PICTURE_MIN_ZOOM,

      Math.min(
        U9_PROFILE_PICTURE_MAX_ZOOM,
        value
      )

    );


  updateProfilePictureZoomUI();


  updateProfilePictureTransform();

}


/* =========================================================
   POINTER DOWN
========================================================= */

function handleProfilePicturePointerDown(
  event
) {

  if (
    !profilePictureFile
  ) {

    return;

  }


  if (
    event.button !== undefined &&
    event.button !== 0
  ) {

    return;

  }


  profilePictureDragging =
    true;


  profilePictureDragStartX =
    event.clientX;


  profilePictureDragStartY =
    event.clientY;


  profilePictureStartX =
    profilePictureX;


  profilePictureStartY =
    profilePictureY;


  if (
    profilePictureImageContainer
  ) {

    profilePictureImageContainer.classList.add(
      "U9-profile-picture-dragging"
    );

  }


  if (
    profilePictureCropArea
  ) {

    profilePictureCropArea.setPointerCapture?.(
      event.pointerId
    );

  }


  event.preventDefault();

}


/* =========================================================
   POINTER MOVE
========================================================= */

function handleProfilePicturePointerMove(
  event
) {

  if (
    !profilePictureDragging
  ) {

    return;

  }


  const deltaX =
    event.clientX -
    profilePictureDragStartX;


  const deltaY =
    event.clientY -
    profilePictureDragStartY;


  profilePictureX =
    profilePictureStartX +
    deltaX;


  profilePictureY =
    profilePictureStartY +
    deltaY;


  updateProfilePictureTransform();


  event.preventDefault();

}


/* =========================================================
   POINTER UP
========================================================= */

function handleProfilePicturePointerUp(
  event
) {

  if (
    !profilePictureDragging
  ) {

    return;

  }


  profilePictureDragging =
    false;


  if (
    profilePictureImageContainer
  ) {

    profilePictureImageContainer.classList.remove(
      "U9-profile-picture-dragging"
    );

  }


  if (
    profilePictureCropArea
  ) {

    try {

      profilePictureCropArea.releasePointerCapture?.(
        event.pointerId
      );

    }
    catch {
      /* ignore */
    }

  }


  updateProfilePictureTransform();

}


/* =========================================================
   TOUCH / POINTER CANCEL
========================================================= */

function handleProfilePicturePointerCancel(
  event
) {

  handleProfilePicturePointerUp(
    event
  );

}


/* =========================================================
   FILE INPUT CHANGE
========================================================= */

function handleProfilePictureFileInput(
  event
) {

  const input =
    event.target;


  if (
    !input ||
    !input.files ||
    !input.files.length
  ) {

    return;

  }


  const file =
    input.files[0];


  handleProfilePictureFile(
    file
  );

}


/* =========================================================
   WINDOW RESIZE
========================================================= */

function handleProfilePictureResize() {

  if (
    !profilePictureFile
  ) {

    return;

  }


  updateProfilePictureBaseScale();


  updateProfilePictureTransform();

}


/* =========================================================
   KEYBOARD
========================================================= */

function handleProfilePictureKeyboard(
  event
) {

  if (
    !profilePictureModal
  ) {

    return;

  }


  if (
    profilePictureModal.style.display ===
    "none"
  ) {

    return;

  }


  if (
    event.key ===
    "Escape"
  ) {

    closeProfilePictureModal();

  }

}


/* =========================================================
   EVENT LISTENERS
========================================================= */

if (
  profilePictureClose
) {

  profilePictureClose.addEventListener(
    "click",
    closeProfilePictureModal
  );

}


if (
  profilePictureOverlay
) {

  profilePictureOverlay.addEventListener(
    "click",
    closeProfilePictureModal
  );

}


if (
  profilePictureSelectButton
) {

  profilePictureSelectButton.addEventListener(
    "click",
    selectProfilePictureFile
  );

}


if (
  profilePictureSelect
) {

  profilePictureSelect.addEventListener(
    "click",
    selectProfilePictureFile
  );

}


if (
  profilePictureFileInput
) {

  profilePictureFileInput.addEventListener(
    "change",
    handleProfilePictureFileInput
  );

}


if (
  profilePictureChange
) {

  profilePictureChange.addEventListener(
    "click",
    changeProfilePicture
  );

}


if (
  profilePictureConfirm
) {

  profilePictureConfirm.addEventListener(
    "click",
    uploadProfilePicture
  );

}


if (
  profilePictureReset
) {

  profilePictureReset.addEventListener(
    "click",
    resetProfilePictureEditor
  );

}


if (
  profilePictureZoomOut
) {

  profilePictureZoomOut.addEventListener(
    "click",
    zoomOutProfilePicture
  );

}


if (
  profilePictureZoomIn
) {

  profilePictureZoomIn.addEventListener(
    "click",
    zoomInProfilePicture
  );

}


if (
  profilePictureZoomRange
) {

  profilePictureZoomRange.addEventListener(
    "input",
    handleProfilePictureZoomRange
  );

}


/* =========================================================
   POINTER EVENTS
========================================================= */

if (
  profilePictureCropArea
) {

  profilePictureCropArea.addEventListener(
    "pointerdown",
    handleProfilePicturePointerDown
  );


  profilePictureCropArea.addEventListener(
    "pointermove",
    handleProfilePicturePointerMove
  );


  profilePictureCropArea.addEventListener(
    "pointerup",
    handleProfilePicturePointerUp
  );


  profilePictureCropArea.addEventListener(
    "pointercancel",
    handleProfilePicturePointerCancel
  );

}


/* =========================================================
   WINDOW EVENTS
========================================================= */

window.addEventListener(
  "resize",
  handleProfilePictureResize
);


document.addEventListener(
  "keydown",
  handleProfilePictureKeyboard
);


/* =========================================================
   INITIAL STATE
========================================================= */

if (
  profilePictureModal
) {

  profilePictureModal.style.display =
    "none";

}


if (
  profilePictureEditor
) {

  profilePictureEditor.style.display =
    "none";

}


if (
  profilePictureLoading
) {

  profilePictureLoading.style.display =
    "none";

}


if (
  profilePictureMessage
) {

  profilePictureMessage.style.display =
    "none";

}


updateProfilePictureZoomUI();


/* =========================================================
   GLOBAL API
========================================================= */

window.U9ProfilePictureModal = {

  open:
    openProfilePictureModal,

  close:
    closeProfilePictureModal,

  select:
    selectProfilePictureFile,

  reset:
    resetProfilePictureEditor

};
