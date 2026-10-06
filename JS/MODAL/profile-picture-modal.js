
/* =========================================================
   PROFILE PICTURE MODAL
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


const profilePictureModalOverlay =
  document.getElementById(
    "U9-profile-picture-modal-overlay"
  );


const profilePictureModalClose =
  document.getElementById(
    "U9-profile-picture-modal-close"
  );


const profilePictureModalSelect =
  document.getElementById(
    "U9-profile-picture-modal-select"
  );


const profilePictureModalSelectButton =
  document.getElementById(
    "U9-profile-picture-modal-select-button"
  );


const profilePictureModalFile =
  document.getElementById(
    "U9-profile-picture-modal-file"
  );


const profilePictureModalEditor =
  document.getElementById(
    "U9-profile-picture-modal-editor"
  );


const profilePictureModalCropArea =
  document.getElementById(
    "U9-profile-picture-modal-crop-area"
  );


const profilePictureModalImageContainer =
  document.getElementById(
    "U9-profile-picture-modal-image-container"
  );


const profilePictureModalImage =
  document.getElementById(
    "U9-profile-picture-modal-image"
  );


const profilePictureModalZoomOut =
  document.getElementById(
    "U9-profile-picture-modal-zoom-out"
  );


const profilePictureModalZoomIn =
  document.getElementById(
    "U9-profile-picture-modal-zoom-in"
  );


const profilePictureModalZoomRange =
  document.getElementById(
    "U9-profile-picture-modal-zoom-range"
  );


const profilePictureModalReset =
  document.getElementById(
    "U9-profile-picture-modal-reset"
  );


const profilePictureModalChange =
  document.getElementById(
    "U9-profile-picture-modal-change"
  );


const profilePictureModalConfirm =
  document.getElementById(
    "U9-profile-picture-modal-confirm"
  );


const profilePictureModalLoading =
  document.getElementById(
    "U9-profile-picture-modal-loading"
  );


const profilePictureModalLoadingText =
  document.getElementById(
    "U9-profile-picture-modal-loading-text"
  );


const profilePictureModalMessage =
  document.getElementById(
    "U9-profile-picture-modal-message"
  );


/* =========================================================
   STATE
========================================================= */

let profilePictureFile = null;

let profilePictureObjectURL = null;

let profilePictureNaturalWidth = 0;

let profilePictureNaturalHeight = 0;

let profilePictureBaseScale = 1;

let profilePictureZoom = 1;

let profilePictureX = 0;

let profilePictureY = 0;

let profilePictureDragging = false;

let profilePictureDragStartX = 0;

let profilePictureDragStartY = 0;

let profilePictureStartX = 0;

let profilePictureStartY = 0;


/* =========================================================
   CONSTANTS
========================================================= */

const U9_PROFILE_PICTURE_OUTPUT_SIZE = 512;

const U9_PROFILE_PICTURE_MIN_ZOOM = 1;

const U9_PROFILE_PICTURE_MAX_ZOOM = 3;


/* =========================================================
   TOKEN
========================================================= */

function getProfilePictureToken() {

  return (
    localStorage.getItem(
      "u9_token"
    ) || ""
  );

}


/* =========================================================
   LOGIN
========================================================= */

function profilePictureIsLoggedIn() {

  if (
    window.U9User &&
    typeof window.U9User.isLoggedIn === "function"
  ) {

    return window.U9User.isLoggedIn();

  }

  return !!getProfilePictureToken();

}


/* =========================================================
   MESSAGE
========================================================= */

function showProfilePictureMessage(
  message,
  type = ""
) {

  if (!profilePictureModalMessage) {
    return;
  }


  profilePictureModalMessage.textContent =
    message || "";


  profilePictureModalMessage.className = "";


  if (type) {

    profilePictureModalMessage.classList.add(
      `U9-${type}`
    );

  }

}


/* =========================================================
   LOADING
========================================================= */

function setProfilePictureLoading(
  loading,
  text = "Uploading..."
) {

  if (!profilePictureModalLoading) {
    return;
  }


  profilePictureModalLoading.hidden =
    !loading;


  if (
    profilePictureModalLoadingText
  ) {

    profilePictureModalLoadingText.textContent =
      text;

  }


  if (
    profilePictureModalConfirm
  ) {

    profilePictureModalConfirm.disabled =
      loading;

  }


  if (
    profilePictureModalChange
  ) {

    profilePictureModalChange.disabled =
      loading;

  }


  if (
    profilePictureModalReset
  ) {

    profilePictureModalReset.disabled =
      loading;

  }

}


/* =========================================================
   OPEN
========================================================= */

function openProfilePictureModal() {

  if (!profilePictureModal) {
    return;
  }


  if (!profilePictureIsLoggedIn()) {

    showProfilePictureMessage(
      "Please log in before changing your profile picture.",
      "error"
    );

  } else {

    showProfilePictureMessage("");

  }


  profilePictureModal.classList.add(
    "U9-profile-picture-modal-open"
  );


  profilePictureModal.setAttribute(
    "aria-hidden",
    "false"
  );


  document.body.style.overflow =
    "hidden";


  if (
    profilePictureModalSelect
  ) {

    profilePictureModalSelect.hidden =
      false;

  }


  if (
    profilePictureModalEditor
  ) {

    profilePictureModalEditor.hidden =
      true;

  }


  if (
    profilePictureModalFile
  ) {

    profilePictureModalFile.value =
      "";

  }


  setTimeout(
    function () {

      if (
        profilePictureModalClose
      ) {

        profilePictureModalClose.focus();

      }

    },
    0
  );

}


/* =========================================================
   CLOSE
========================================================= */

function closeProfilePictureModal() {

  if (!profilePictureModal) {
    return;
  }


  if (
    profilePictureLoadingIsActive()
  ) {

    return;

  }


  /*
     Remove focus before applying aria-hidden.
     This prevents the browser accessibility warning.
  */

  if (
    document.activeElement &&
    profilePictureModal.contains(
      document.activeElement
    )
  ) {

    document.activeElement.blur();

  }


  profilePictureModal.classList.remove(
    "U9-profile-picture-modal-open"
  );


  profilePictureModal.setAttribute(
    "aria-hidden",
    "true"
  );


  document.body.style.overflow =
    "";


  resetProfilePictureEditor();


  showProfilePictureMessage("");

}


/* =========================================================
   LOADING STATE
========================================================= */

function profilePictureLoadingIsActive() {

  return (
    profilePictureModalLoading &&
    !profilePictureModalLoading.hidden
  );

}


/* =========================================================
   SELECT FILE
========================================================= */

function selectProfilePictureFile() {

  if (!profilePictureIsLoggedIn()) {

    showProfilePictureMessage(
      "Please log in before changing your profile picture.",
      "error"
    );

    return;

  }


  if (
    profilePictureModalFile
  ) {

    profilePictureModalFile.value =
      "";

    profilePictureModalFile.click();

  }

}


/* =========================================================
   FILE CHANGE
========================================================= */

function handleProfilePictureFileChange(
  event
) {

  const files =
    event.target.files;


  if (
    !files ||
    !files.length
  ) {

    return;

  }


  const file =
    files[0];


  if (
    !file.type ||
    !file.type.startsWith("image/")
  ) {

    showProfilePictureMessage(
      "Please select a valid image file.",
      "error"
    );

    return;

  }


  loadProfilePictureFile(
    file
  );

}


/* =========================================================
   LOAD FILE
========================================================= */

function loadProfilePictureFile(
  file
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


  profilePictureFile =
    file;


  profilePictureObjectURL =
    URL.createObjectURL(
      file
    );


  const image =
    new Image();


  image.onload =
    function () {

      profilePictureNaturalWidth =
        image.naturalWidth;


      profilePictureNaturalHeight =
        image.naturalHeight;


      /*
         IMPORTANT

         The editor is hidden when the file is selected.

         Therefore we must show the editor FIRST,
         wait for the browser to calculate its layout,
         and ONLY THEN calculate the image scale.
      */

      if (
        profilePictureModalSelect
      ) {

        profilePictureModalSelect.hidden =
          true;

      }


      if (
        profilePictureModalEditor
      ) {

        profilePictureModalEditor.hidden =
          false;

      }


      /*
         Clear old transform before rendering
         the new image.
      */

      profilePictureX =
        0;


      profilePictureY =
        0;


      profilePictureZoom =
        U9_PROFILE_PICTURE_MIN_ZOOM;


      if (
        profilePictureModalZoomRange
      ) {

        profilePictureModalZoomRange.value =
          String(
            profilePictureZoom
          );

      }


      /*
         Put the image into the editor.

         We wait one animation frame so the browser
         has already displayed the editor and calculated
         the crop area's real width and height.
      */

      requestAnimationFrame(
        function () {

          requestAnimationFrame(
            function () {

              profilePictureImageLoaded();

            }
          );

        }
      );

    };


  image.onerror =
    function () {

      showProfilePictureMessage(
        "Unable to load this image.",
        "error"
      );


      profilePictureFile =
        null;


      if (
        profilePictureObjectURL
      ) {

        URL.revokeObjectURL(
          profilePictureObjectURL
        );

        profilePictureObjectURL =
          null;

      }

    };


  image.src =
    profilePictureObjectURL;

}


/* =========================================================
   IMAGE LOADED
========================================================= */

function profilePictureImageLoaded() {

  if (
    !profilePictureModalImage ||
    !profilePictureObjectURL
  ) {

    return;

  }


  /*
     Set the actual image source.
  */

  profilePictureModalImage.src =
    profilePictureObjectURL;


  /*
     Make sure the image itself is loaded
     before calculating its final position.
  */

  if (
    profilePictureModalImage.complete &&
    profilePictureModalImage.naturalWidth > 0
  ) {

    finishProfilePictureImageSetup();

    return;

  }


  profilePictureModalImage.onload =
    function () {

      finishProfilePictureImageSetup();

    };


  profilePictureModalImage.onerror =
    function () {

      showProfilePictureMessage(
        "Unable to display this image.",
        "error"
      );

    };

}


/* =========================================================
   FINISH IMAGE SETUP
========================================================= */

function finishProfilePictureImageSetup() {

  /*
     Wait one more frame.

     This is especially important on mobile
     because the modal may still be finishing
     its layout.
  */

  requestAnimationFrame(
    function () {

      if (
        !profilePictureModalCropArea
      ) {

        return;

      }


      /*
         Make sure the crop area has a real size.
      */

      const cropWidth =
        profilePictureModalCropArea.clientWidth;


      const cropHeight =
        profilePictureModalCropArea.clientHeight;


      if (
        cropWidth <= 0 ||
        cropHeight <= 0
      ) {

        /*
           If the browser still has not finished
           calculating the layout, try again.
        */

        setTimeout(
          function () {

            finishProfilePictureImageSetup();

          },
          30
        );

        return;

      }


      profilePictureCalculateBaseScale();


      profilePictureX =
        0;


      profilePictureY =
        0;


      limitProfilePicturePosition();

      updateProfilePictureTransform();


      showProfilePictureMessage("");

    }
  );

}


/* =========================================================
   BASE SCALE
========================================================= */

function profilePictureCalculateBaseScale() {

  if (
    !profilePictureModalCropArea ||
    !profilePictureNaturalWidth ||
    !profilePictureNaturalHeight
  ) {

    return;

  }


  const cropWidth =
    profilePictureModalCropArea.clientWidth;


  const cropHeight =
    profilePictureModalCropArea.clientHeight;


  if (
    cropWidth <= 0 ||
    cropHeight <= 0
  ) {

    return;

  }


  const scaleX =
    cropWidth /
    profilePictureNaturalWidth;


  const scaleY =
    cropHeight /
    profilePictureNaturalHeight;


  /*
     Cover the complete crop area.

     This guarantees that there is never
     an empty black area inside the crop frame.
  */

  profilePictureBaseScale =
    Math.max(
      scaleX,
      scaleY
    );

}


/* =========================================================
   CURRENT SCALE
========================================================= */

function getProfilePictureScale() {

  return (
    profilePictureBaseScale *
    profilePictureZoom
  );

}


/* =========================================================
   UPDATE TRANSFORM
========================================================= */

function updateProfilePictureTransform() {

  if (
    !profilePictureModalImage ||
    !profilePictureNaturalWidth ||
    !profilePictureNaturalHeight
  ) {

    return;

  }


  const scale =
    getProfilePictureScale();


  const imageWidth =
    profilePictureNaturalWidth *
    scale;


  const imageHeight =
    profilePictureNaturalHeight *
    scale;


  /*
     The image is positioned relative
     to the center of the crop area.
  */

  profilePictureModalImage.style.width =
    `${imageWidth}px`;


  profilePictureModalImage.style.height =
    `${imageHeight}px`;


  profilePictureModalImage.style.left =
    `calc(50% + ${profilePictureX}px)`;


  profilePictureModalImage.style.top =
    `calc(50% + ${profilePictureY}px)`;


  profilePictureModalImage.style.transform =
    "translate(-50%, -50%)";

}


/* =========================================================
   LIMIT POSITION
========================================================= */

function limitProfilePicturePosition() {

  if (
    !profilePictureModalCropArea ||
    !profilePictureNaturalWidth ||
    !profilePictureNaturalHeight
  ) {

    return;

  }


  const cropWidth =
    profilePictureModalCropArea.clientWidth;


  const cropHeight =
    profilePictureModalCropArea.clientHeight;


  if (
    cropWidth <= 0 ||
    cropHeight <= 0
  ) {

    return;

  }


  const scale =
    getProfilePictureScale();


  const imageWidth =
    profilePictureNaturalWidth *
    scale;


  const imageHeight =
    profilePictureNaturalHeight *
    scale;


  const maxX =
    Math.max(
      0,
      (
        imageWidth -
        cropWidth
      ) / 2
    );


  const maxY =
    Math.max(
      0,
      (
        imageHeight -
        cropHeight
      ) / 2
    );


  profilePictureX =
    Math.max(
      -maxX,
      Math.min(
        maxX,
        profilePictureX
      )
    );


  profilePictureY =
    Math.max(
      -maxY,
      Math.min(
        maxY,
        profilePictureY
      )
    );

}


/* =========================================================
   ZOOM
========================================================= */

function setProfilePictureZoom(
  zoom
) {

  const oldZoom =
    profilePictureZoom;


  profilePictureZoom =
    Math.max(
      U9_PROFILE_PICTURE_MIN_ZOOM,
      Math.min(
        U9_PROFILE_PICTURE_MAX_ZOOM,
        zoom
      )
    );


  if (
    profilePictureModalZoomRange
  ) {

    profilePictureModalZoomRange.value =
      String(
        profilePictureZoom
      );

  }


  if (
    oldZoom !== profilePictureZoom
  ) {

    limitProfilePicturePosition();

    updateProfilePictureTransform();

  }

}


/* =========================================================
   RESET EDITOR
========================================================= */

function resetProfilePictureEditor() {

  profilePictureFile =
    null;


  if (
    profilePictureObjectURL
  ) {

    URL.revokeObjectURL(
      profilePictureObjectURL
    );

    profilePictureObjectURL =
      null;

  }


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


  profilePictureDragging =
    false;


  if (
    profilePictureModalImage
  ) {

    profilePictureModalImage.onload =
      null;


    profilePictureModalImage.onerror =
      null;


    profilePictureModalImage.src =
      "";

    profilePictureModalImage.style.width =
      "";

    profilePictureModalImage.style.height =
      "";

    profilePictureModalImage.style.left =
      "";

    profilePictureModalImage.style.top =
      "";

  }


  if (
    profilePictureModalZoomRange
  ) {

    profilePictureModalZoomRange.value =
      "1";

  }


  if (
    profilePictureModalSelect
  ) {

    profilePictureModalSelect.hidden =
      false;

  }


  if (
    profilePictureModalEditor
  ) {

    profilePictureModalEditor.hidden =
      true;

  }


  if (
    profilePictureModalImageContainer
  ) {

    profilePictureModalImageContainer.classList.remove(
      "U9-dragging"
    );

  }


  setProfilePictureLoading(
    false
  );

}


/* =========================================================
   POINTER DOWN
========================================================= */

function startProfilePictureDrag(
  event
) {

  if (
    !profilePictureFile ||
    profilePictureLoadingIsActive()
  ) {

    return;

  }


  event.preventDefault();


  profilePictureDragging =
    true;


  if (
    profilePictureModalImageContainer
  ) {

    profilePictureModalImageContainer.classList.add(
      "U9-dragging"
    );

  }


  const point =
    getProfilePicturePointerPosition(
      event
    );


  profilePictureDragStartX =
    point.x;


  profilePictureDragStartY =
    point.y;


  profilePictureStartX =
    profilePictureX;


  profilePictureStartY =
    profilePictureY;


  if (
    event.pointerId !== undefined &&
    profilePictureModalCropArea &&
    profilePictureModalCropArea.setPointerCapture
  ) {

    try {

      profilePictureModalCropArea.setPointerCapture(
        event.pointerId
      );

    } catch (error) {}

  }

}


/* =========================================================
   POINTER MOVE
========================================================= */

function moveProfilePictureDrag(
  event
) {

  if (
    !profilePictureDragging
  ) {

    return;

  }


  event.preventDefault();


  const point =
    getProfilePicturePointerPosition(
      event
    );


  profilePictureX =
    profilePictureStartX +
    (
      point.x -
      profilePictureDragStartX
    );


  profilePictureY =
    profilePictureStartY +
    (
      point.y -
      profilePictureDragStartY
    );


  limitProfilePicturePosition();

  updateProfilePictureTransform();

}


/* =========================================================
   POINTER UP
========================================================= */

function endProfilePictureDrag(
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
    profilePictureModalImageContainer
  ) {

    profilePictureModalImageContainer.classList.remove(
      "U9-dragging"
    );

  }


  if (
    event &&
    event.pointerId !== undefined &&
    profilePictureModalCropArea &&
    profilePictureModalCropArea.releasePointerCapture
  ) {

    try {

      profilePictureModalCropArea.releasePointerCapture(
        event.pointerId
      );

    } catch (error) {}

  }

}


/* =========================================================
   POINTER POSITION
========================================================= */

function getProfilePicturePointerPosition(
  event
) {

  return {

    x:
      event.clientX,

    y:
      event.clientY

  };

}


/* =========================================================
   WHEEL ZOOM
========================================================= */

function handleProfilePictureWheel(
  event
) {

  if (
    !profilePictureFile ||
    profilePictureLoadingIsActive()
  ) {

    return;

  }


  event.preventDefault();


  const step =
    event.deltaY < 0
      ? 0.08
      : -0.08;


  setProfilePictureZoom(
    profilePictureZoom +
    step
  );

}


/* =========================================================
   CHANGE IMAGE
========================================================= */

function changeProfilePicture() {

  if (
    profilePictureLoadingIsActive()
  ) {

    return;

  }


  selectProfilePictureFile();

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
        !profilePictureFile ||
        !profilePictureObjectURL
      ) {

        reject(
          new Error(
            "No image selected."
          )
        );

        return;

      }


      if (
        !profilePictureModalCropArea
      ) {

        reject(
          new Error(
            "Crop area is unavailable."
          )
        );

        return;

      }


      const cropWidth =
        profilePictureModalCropArea.clientWidth;


      const cropHeight =
        profilePictureModalCropArea.clientHeight;


      const cropSize =
        Math.min(
          cropWidth,
          cropHeight
        );


      if (
        cropSize <= 0
      ) {

        reject(
          new Error(
            "Crop area is not ready."
          )
        );

        return;

      }


      const image =
        new Image();


      image.onload =
        function () {

          const canvas =
            document.createElement(
              "canvas"
            );


          canvas.width =
            U9_PROFILE_PICTURE_OUTPUT_SIZE;


          canvas.height =
            U9_PROFILE_PICTURE_OUTPUT_SIZE;


          const context =
            canvas.getContext(
              "2d"
            );


          if (!context) {

            reject(
              new Error(
                "Unable to create image canvas."
              )
            );

            return;

          }


          const scale =
            getProfilePictureScale();


          const imageWidth =
            image.naturalWidth *
            scale;


          const imageHeight =
            image.naturalHeight *
            scale;


          /*
             Calculate the actual image position
             inside the crop area.
          */

          const imageLeft =
            (
              cropWidth -
              imageWidth
            ) / 2 +
            profilePictureX;


          const imageTop =
            (
              cropHeight -
              imageHeight
            ) / 2 +
            profilePictureY;


          /*
             Convert crop coordinates
             into original image coordinates.
          */

          const sourceX =
            Math.max(
              0,
              -imageLeft
            ) / scale;


          const sourceY =
            Math.max(
              0,
              -imageTop
            ) / scale;


          const visibleLeft =
            Math.max(
              0,
              imageLeft
            );


          const visibleTop =
            Math.max(
              0,
              imageTop
            );


          const visibleRight =
            Math.min(
              cropSize,
              imageLeft +
              imageWidth
            );


          const visibleBottom =
            Math.min(
              cropSize,
              imageTop +
              imageHeight
            );


          const visibleWidth =
            Math.max(
              0,
              visibleRight -
              visibleLeft
            );


          const visibleHeight =
            Math.max(
              0,
              visibleBottom -
              visibleTop
            );


          const sourceWidth =
            visibleWidth /
            scale;


          const sourceHeight =
            visibleHeight /
            scale;


          const destinationX =
            visibleLeft;


          const destinationY =
            visibleTop;


          const outputScale =
            U9_PROFILE_PICTURE_OUTPUT_SIZE /
            cropSize;


          /*
             Draw the exact crop.
          */

          context.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
          );


          context.drawImage(

            image,

            sourceX,

            sourceY,

            sourceWidth,

            sourceHeight,

            destinationX *
              outputScale,

            destinationY *
              outputScale,

            visibleWidth *
              outputScale,

            visibleHeight *
              outputScale

          );


          /*
             The upload API currently receives
             the cropped avatar as WebP.
          */

          canvas.toBlob(
            function (blob) {

              if (!blob) {

                reject(
                  new Error(
                    "Unable to create cropped image."
                  )
                );

                return;

              }


              resolve(
                blob
              );

            },
            "image/webp",
            0.92
          );

        };


      image.onerror =
        function () {

          reject(
            new Error(
              "Unable to process image."
            )
          );

        };


      image.src =
        profilePictureObjectURL;

    }
  );

}


/* =========================================================
   UPLOAD
========================================================= */

async function uploadProfilePicture() {

  if (
    !profilePictureIsLoggedIn()
  ) {

    showProfilePictureMessage(
      "Please log in before changing your profile picture.",
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


  try {

    setProfilePictureLoading(
      true,
      "Preparing image..."
    );


    const croppedBlob =
      await createCroppedProfilePicture();


    setProfilePictureLoading(
      true,
      "Uploading..."
    );


    const token =
      getProfilePictureToken();


    if (!token) {

      throw new Error(
        "Your login session has expired. Please log in again."
      );

    }


    const formData =
      new FormData();


    formData.append(
      "avatar",
      croppedBlob,
      "avatar.webp"
    );


    const response =
      await fetch(
        U9_PROFILE_PICTURE_UPLOAD_API,
        {

          method:
            "POST",

          headers: {

            Authorization:
              `Bearer ${token}`

          },

          body:
            formData

        }
      );


    let result =
      null;


    try {

      result =
        await response.json();

    } catch (error) {

      result =
        null;

    }


    if (
      response.status === 401 ||
      response.status === 403
    ) {

      throw new Error(
        "Your login session has expired. Please log in again."
      );

    }


    if (
      !response.ok
    ) {

      throw new Error(
        result?.message ||
        result?.error ||
        "Failed to upload profile picture."
      );

    }


    if (
      result &&
      result.success === false
    ) {

      throw new Error(
        result.message ||
        result.error ||
        "Failed to upload profile picture."
      );

    }


    /*
       Refresh current user data.
    */

    if (
      window.U9User &&
      typeof window.U9User.refresh === "function"
    ) {

      await window.U9User.refresh();

    }


    /*
       Refresh profile avatar.
    */

    if (
      window.U9Profile &&
      typeof window.U9Profile.refreshAvatar === "function"
    ) {

      await window.U9Profile.refreshAvatar();

    } else if (
      window.U9Profile &&
      typeof window.U9Profile.refresh === "function"
    ) {

      await window.U9Profile.refresh();

    }


    /*
       Update avatar image directly
       when the API returns an avatar URL.
    */

    const avatarURL =
      result?.avatar_url ||
      result?.avatar?.url ||
      result?.data?.avatar_url ||
      result?.data?.avatar?.url ||
      null;


    if (
      avatarURL
    ) {

      const mainAvatar =
        document.getElementById(
          "U9-profile-avatar-image"
        );


      if (
        mainAvatar
      ) {

        mainAvatar.src =
          avatarURL;

      }

    }


    showProfilePictureMessage(
      "Profile picture updated successfully.",
      "success"
    );


    setProfilePictureLoading(
      false
    );


    setTimeout(
      function () {

        closeProfilePictureModal();

      },
      500
    );


  } catch (error) {

    console.error(
      "PROFILE PICTURE UPLOAD ERROR:",
      error
    );


    setProfilePictureLoading(
      false
    );


    showProfilePictureMessage(
      error?.message ||
      "Failed to upload profile picture.",
      "error"
    );

  }

}


/* =========================================================
   OPEN PROFILE PICTURE MODAL
========================================================= */

function bindProfileAvatarButton() {

  const profileAvatar =
    document.getElementById(
      "U9-profile-avatar"
    );


  if (!profileAvatar) {

    return;

  }


  profileAvatar.addEventListener(
    "click",
    function () {

      openProfilePictureModal();

    }
  );

}


/* =========================================================
   EVENTS
========================================================= */

if (
  profilePictureModalClose
) {

  profilePictureModalClose.addEventListener(
    "click",
    closeProfilePictureModal
  );

}


if (
  profilePictureModalOverlay
) {

  profilePictureModalOverlay.addEventListener(
    "click",
    closeProfilePictureModal
  );

}


if (
  profilePictureModalSelectButton
) {

  profilePictureModalSelectButton.addEventListener(
    "click",
    selectProfilePictureFile
  );

}


if (
  profilePictureModalFile
) {

  profilePictureModalFile.addEventListener(
    "change",
    handleProfilePictureFileChange
  );

}


if (
  profilePictureModalChange
) {

  profilePictureModalChange.addEventListener(
    "click",
    changeProfilePicture
  );

}


if (
  profilePictureModalReset
) {

  profilePictureModalReset.addEventListener(
    "click",
    function () {

      if (
        !profilePictureFile
      ) {

        return;

      }


      profilePictureZoom =
        U9_PROFILE_PICTURE_MIN_ZOOM;


      if (
        profilePictureModalZoomRange
      ) {

        profilePictureModalZoomRange.value =
          String(
            profilePictureZoom
          );

      }


      /*
         Recalculate the base scale
         using the current crop area's
         real dimensions.
      */

      profilePictureCalculateBaseScale();


      profilePictureX =
        0;


      profilePictureY =
        0;


      limitProfilePicturePosition();

      updateProfilePictureTransform();

    }
  );

}


if (
  profilePictureModalConfirm
) {

  profilePictureModalConfirm.addEventListener(
    "click",
    uploadProfilePicture
  );

}


/* =========================================================
   ZOOM BUTTONS
========================================================= */

if (
  profilePictureModalZoomOut
) {

  profilePictureModalZoomOut.addEventListener(
    "click",
    function () {

      setProfilePictureZoom(
        profilePictureZoom -
        0.1
      );

    }
  );

}


if (
  profilePictureModalZoomIn
) {

  profilePictureModalZoomIn.addEventListener(
    "click",
    function () {

      setProfilePictureZoom(
        profilePictureZoom +
        0.1
      );

    }
  );

}


if (
  profilePictureModalZoomRange
) {

  profilePictureModalZoomRange.addEventListener(
    "input",
    function () {

      setProfilePictureZoom(
        Number(
          profilePictureModalZoomRange.value
        )
      );

    }
  );

}


/* =========================================================
   DRAG EVENTS
========================================================= */

if (
  profilePictureModalCropArea
) {

  profilePictureModalCropArea.addEventListener(
    "pointerdown",
    startProfilePictureDrag
  );


  profilePictureModalCropArea.addEventListener(
    "pointermove",
    moveProfilePictureDrag
  );


  profilePictureModalCropArea.addEventListener(
    "pointerup",
    endProfilePictureDrag
  );


  profilePictureModalCropArea.addEventListener(
    "pointercancel",
    endProfilePictureDrag
  );


  profilePictureModalCropArea.addEventListener(
    "pointerleave",
    function (event) {

      /*
         Keep the drag active even when
         the pointer briefly leaves the area.
      */

      if (
        profilePictureDragging
      ) {

        moveProfilePictureDrag(
          event
        );

      }

    }
  );


  profilePictureModalCropArea.addEventListener(
    "wheel",
    handleProfilePictureWheel,
    {
      passive: false
    }
  );

}


/* =========================================================
   KEYBOARD
========================================================= */

document.addEventListener(
  "keydown",
  function (event) {

    if (
      !profilePictureModal ||
      !profilePictureModal.classList.contains(
        "U9-profile-picture-modal-open"
      )
    ) {

      return;

    }


    if (
      event.key === "Escape"
    ) {

      closeProfilePictureModal();

    }

  }
);


/* =========================================================
   RESIZE
========================================================= */

window.addEventListener(
  "resize",
  function () {

    if (
      !profilePictureModal ||
      !profilePictureModal.classList.contains(
        "U9-profile-picture-modal-open"
      )
    ) {

      return;

    }


    if (
      !profilePictureFile
    ) {

      return;

    }


    /*
       Wait for the new mobile/desktop layout
       to finish before recalculating.
    */

    requestAnimationFrame(
      function () {

        profilePictureCalculateBaseScale();

        limitProfilePicturePosition();

        updateProfilePictureTransform();

      }
    );

  }
);


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


/* =========================================================
   INIT
========================================================= */

function initProfilePictureModal() {

  bindProfileAvatarButton();

}


/* =========================================================
   DOM READY
========================================================= */

if (
  document.readyState === "loading"
) {

  document.addEventListener(
    "DOMContentLoaded",
    initProfilePictureModal
  );

} else {

  initProfilePictureModal();

}
