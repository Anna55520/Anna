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
