/* =========================================================
   PROFILE PAGE 3
   3-page3.js
   FREE FRAME + PAID FRAME
   ========================================================= */

(function () {
  "use strict";


  /* =========================================================
     API
     ========================================================= */

  const U9_PROFILE_PAGE3_FREE_FRAME_API =
    "https://tvtakmswbzawaweytimx.supabase.co/functions/v1/avatar-frame-free";

  const U9_PROFILE_PAGE3_PAID_FRAME_API =
    "https://tvtakmswbzawaweytimx.supabase.co/functions/v1/avatar-frame-paid";

  const U9_PROFILE_PAGE3_EQUIP_FRAME_API =
    "https://tvtakmswbzawaweytimx.supabase.co/functions/v1/avatar-frame-equip";

  const U9_PROFILE_PAGE3_PURCHASE_FRAME_API =
    "https://tvtakmswbzawaweytimx.supabase.co/functions/v1/avatar-frame-paid-purchase";


  /* =========================================================
     STATE
     ========================================================= */

  let currentFrameType =
    "default";

  let currentFrameId =
    null;

  let currentFrameUrl =
    null;

  let freeFrames =
    [];

  let paidFrames =
    [];

  let selectedFrameType =
    null;

  let selectedFrameId =
    null;

  let frameInitialized =
    false;


  /* =========================================================
     TOKEN
     ========================================================= */

  function getFrameToken() {

    try {
      return localStorage.getItem("u9_token");
    } catch (error) {
      return null;
    }
  }


  /* =========================================================
     LOGIN
     ========================================================= */

  function isFrameLoggedIn() {

    return !!getFrameToken();
  }


  /* =========================================================
     ESCAPE HTML
     ========================================================= */

  function escapeFrameHTML(value) {

    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }


  /* =========================================================
     IMAGE SOURCE
     ========================================================= */

  function setFrameImageSource(
    image,
    url
  ) {

    if (!image) {
      return;
    }


    if (!url) {

      image.removeAttribute("src");

      return;
    }


    image.src =
      url;
  }


  /* =========================================================
     NORMALIZE FRAME
     ========================================================= */

  function normalizeFrame(item) {

    if (!item) {
      return null;
    }


    const id =
      item.id ??
      item.frame_id ??
      item.frameId ??
      null;


    const url =
      item.url ||
      item.frame_url ||
      item.frameUrl ||
      item.image ||
      item.image_url ||
      null;


    if (
      id === null &&
      !url
    ) {
      return null;
    }


    return {
      id,

      url,

      name:
        item.name ||
        item.title ||
        `Frame ${id ?? ""}`,

      type:
        item.type ||
        item.frame_type ||
        "free",

      price:
        item.price ??
        item.cost ??
        item.coins ??
        0,

      owned:
        Boolean(
          item.owned ||
          item.is_owned ||
          item.purchased
        ),

      equipped:
        Boolean(
          item.equipped ||
          item.is_equipped ||
          item.active
        )
    };
  }


  /* =========================================================
     EXTRACT FRAME LIST
     ========================================================= */

  function extractFrameList(data) {

    if (!data) {
      return [];
    }


    let source = null;


    if (Array.isArray(data)) {

      source = data;

    } else if (
      Array.isArray(data.frames)
    ) {

      source = data.frames;

    } else if (
      Array.isArray(data.items)
    ) {

      source = data.items;

    } else if (
      Array.isArray(data.data)
    ) {

      source = data.data;

    } else if (
      data.data &&
      Array.isArray(data.data.frames)
    ) {

      source =
        data.data.frames;
    }


    if (!Array.isArray(source)) {
      return [];
    }


    return source
      .map(normalizeFrame)
      .filter(Boolean);
  }


  /* =========================================================
     LOAD CURRENT FRAME
     ========================================================= */

  function loadCurrentFrame(user) {

    if (!user) {
      return;
    }


    const frame =
      user.avatar_frame ||
      user.frame ||
      user.avatar?.frame ||
      null;


    if (!frame) {

      currentFrameType =
        "default";

      currentFrameId =
        null;

      currentFrameUrl =
        null;

      selectedFrameType =
        null;

      selectedFrameId =
        null;

      return;
    }


    currentFrameType =
      frame.type ||
      frame.frame_type ||
      "default";


    currentFrameId =
      frame.id ??
      frame.frame_id ??
      null;


    currentFrameUrl =
      frame.url ||
      frame.frame_url ||
      null;


    selectedFrameType =
      currentFrameType;


    selectedFrameId =
      currentFrameId;
  }


  /* =========================================================
     REFRESH USER
     ========================================================= */

  async function refreshFrameUser() {

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

        loadCurrentFrame(user);
      }


      return true;

    } catch (error) {

      console.error(
        "Failed to refresh frame state:",
        error
      );

      return false;
    }
  }


  /* =========================================================
     LOAD FREE FRAMES
     ========================================================= */

  async function loadFreeFrames() {

    if (!isFrameLoggedIn()) {

      return {
        success: false,
        frames: [],
        error:
          "Please sign in first."
      };
    }


    const token =
      getFrameToken();


    try {

      const response =
        await fetch(
          U9_PROFILE_PAGE3_FREE_FRAME_API,
          {
            method: "GET",

            headers: {
              Authorization:
                `Bearer ${token}`,

              Accept:
                "application/json"
            },

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

        const message =
          data &&
          (
            data.error ||
            data.message
          )
            ? (
                data.error ||
                data.message
              )
            : `Unable to load free frames (${response.status}).`;


        throw new Error(
          message
        );
      }


      freeFrames =
        extractFrameList(data);


      return {
        success: true,
        frames:
          freeFrames,
        data
      };

    } catch (error) {

      console.error(
        "Failed to load free frames:",
        error
      );


      return {
        success: false,
        frames: [],
        error:
          error.message ||
          "Unable to load free frames."
      };
    }
  }


  /* =========================================================
     LOAD PAID FRAMES
     ========================================================= */

  async function loadPaidFrames() {

    if (!isFrameLoggedIn()) {

      return {
        success: false,
        frames: [],
        error:
          "Please sign in first."
      };
    }


    const token =
      getFrameToken();


    try {

      const response =
        await fetch(
          U9_PROFILE_PAGE3_PAID_FRAME_API,
          {
            method: "GET",

            headers: {
              Authorization:
                `Bearer ${token}`,

              Accept:
                "application/json"
            },

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

        const message =
          data &&
          (
            data.error ||
            data.message
          )
            ? (
                data.error ||
                data.message
              )
            : `Unable to load paid frames (${response.status}).`;


        throw new Error(
          message
        );
      }


      paidFrames =
        extractFrameList(data);


      return {
        success: true,
        frames:
          paidFrames,
        data
      };

    } catch (error) {

      console.error(
        "Failed to load paid frames:",
        error
      );


      return {
        success: false,
        frames: [],
        error:
          error.message ||
          "Unable to load paid frames."
      };
    }
  }


  /* =========================================================
     EQUIP FRAME
     ========================================================= */

  async function equipFrame(
    frameType,
    frameId,
    button = null
  ) {

    if (!isFrameLoggedIn()) {

      window.alert(
        "Please sign in before selecting a frame."
      );

      return false;
    }


    if (
      frameId === null ||
      frameId === undefined ||
      frameId === ""
    ) {

      window.alert(
        "Please select a frame."
      );

      return false;
    }


    const token =
      getFrameToken();


    const originalButtonText =
      button
        ? button.textContent
        : "";


    try {

      if (button) {

        button.disabled = true;

        button.textContent =
          "Saving...";
      }


      const response =
        await fetch(
          U9_PROFILE_PAGE3_EQUIP_FRAME_API,
          {
            method: "POST",

            headers: {
              Authorization:
                `Bearer ${token}`,

              "Content-Type":
                "application/json",

              Accept:
                "application/json"
            },

            body: JSON.stringify({
              frame_id:
                frameId,

              frame_type:
                frameType
            }),

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

        const message =
          data &&
          (
            data.error ||
            data.message
          )
            ? (
                data.error ||
                data.message
              )
            : `Unable to equip frame (${response.status}).`;


        window.alert(
          message
        );

        return false;
      }


      if (
        data &&
        data.success === false
      ) {

        window.alert(
          data.error ||
          data.message ||
          "Unable to equip this frame."
        );

        return false;
      }


      currentFrameType =
        frameType;


      currentFrameId =
        frameId;


      selectedFrameType =
        frameType;


      selectedFrameId =
        frameId;


      const frame =
        findFrame(
          frameType,
          frameId
        );


      if (frame) {

        currentFrameUrl =
          frame.url ||
          null;
      }


      await refreshFrameUser();


      if (
        window.U9Profile &&
        typeof window.U9Profile.refreshAvatar === "function"
      ) {

        await window.U9Profile.refreshAvatar();
      }


      refreshFrameSelectionUI();


      window.alert(
        "Frame equipped successfully."
      );


      return true;

    } catch (error) {

      console.error(
        "Failed to equip frame:",
        error
      );


      window.alert(
        error.message ||
        "Unable to equip this frame."
      );


      return false;

    } finally {

      if (button) {

        button.disabled = false;

        button.textContent =
          originalButtonText ||
          "Equip";
      }
    }
  }


  /* =========================================================
     PURCHASE PAID FRAME
     ========================================================= */

  async function purchasePaidFrame(
    frameId,
    button = null
  ) {

    if (!isFrameLoggedIn()) {

      window.alert(
        "Please sign in before purchasing a frame."
      );

      return false;
    }


    if (
      frameId === null ||
      frameId === undefined ||
      frameId === ""
    ) {

      window.alert(
        "Please select a frame."
      );

      return false;
    }


    const token =
      getFrameToken();


    const originalButtonText =
      button
        ? button.textContent
        : "";


    try {

      if (button) {

        button.disabled = true;

        button.textContent =
          "Purchasing...";
      }


      const response =
        await fetch(
          U9_PROFILE_PAGE3_PURCHASE_FRAME_API,
          {
            method: "POST",

            headers: {
              Authorization:
                `Bearer ${token}`,

              "Content-Type":
                "application/json",

              Accept:
                "application/json"
            },

            body: JSON.stringify({
              frame_id:
                frameId
            }),

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

        const message =
          data &&
          (
            data.error ||
            data.message
          )
            ? (
                data.error ||
                data.message
              )
            : `Unable to purchase frame (${response.status}).`;


        window.alert(
          message
        );

        return false;
      }


      if (
        data &&
        data.success === false
      ) {

        window.alert(
          data.error ||
          data.message ||
          "Unable to purchase this frame."
        );

        return false;
      }


      /* =====================================================
         REFRESH PAID FRAME LIST
         ===================================================== */

      await loadPaidFrames();


      /* =====================================================
         FIND PURCHASED FRAME
         ===================================================== */

      const purchasedFrame =
        findFrame(
          "paid",
          frameId
        );


      if (purchasedFrame) {

        purchasedFrame.owned =
          true;
      }


      /* =====================================================
         AUTO EQUIP
         ===================================================== */

      const shouldEquip =
        !data ||
        data.auto_equip !== false;


      if (shouldEquip) {

        await equipFrame(
          "paid",
          frameId
        );
      } else {

        refreshFrameSelectionUI();
      }


      window.alert(
        "Frame purchased successfully."
      );


      return true;

    } catch (error) {

      console.error(
        "Failed to purchase frame:",
        error
      );


      window.alert(
        error.message ||
        "Unable to purchase this frame."
      );


      return false;

    } finally {

      if (button) {

        button.disabled = false;

        button.textContent =
          originalButtonText ||
          "Purchase";
      }
    }
  }


  /* =========================================================
     FIND FRAME
     ========================================================= */

  function findFrame(
    frameType,
    frameId
  ) {

    const list =
      frameType === "paid"
        ? paidFrames
        : freeFrames;


    return list.find(
      (frame) =>
        String(frame.id) ===
        String(frameId)
    ) || null;
  }


  /* =========================================================
     FRAME ACTION
     ========================================================= */

  async function handleFrameAction(
    frame,
    button
  ) {

    if (!frame) {
      return false;
    }


    const frameType =
      frame.type === "paid"
        ? "paid"
        : "free";


    if (
      frameType === "paid" &&
      !frame.owned
    ) {

      return purchasePaidFrame(
        frame.id,
        button
      );
    }


    return equipFrame(
      frameType,
      frame.id,
      button
    );
  }


  /* =========================================================
     CREATE FRAME CARD
     ========================================================= */

  function createFrameCard(
    frame,
    index
  ) {

    const card =
      document.createElement("div");


    card.className =
      "U9-page3-frame-card";


    card.dataset.frameId =
      frame.id ?? "";


    card.dataset.frameType =
      frame.type || "free";


    Object.assign(card.style, {
      position: "relative",
      width: "100%",
      maxWidth: "160px",
      boxSizing: "border-box",
      padding: "10px",
      border: "1px solid #e5e5e5",
      borderRadius: "14px",
      background: "#ffffff",
      cursor: "pointer",
      transition:
        "border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease"
    });


    /* =======================================================
       PREVIEW
       ======================================================= */

    const preview =
      document.createElement("div");


    Object.assign(preview.style, {
      position: "relative",
      width: "100%",
      aspectRatio: "1 / 1",
      overflow: "hidden",
      borderRadius: "10px",
      background: "#f4f4f4",
      marginBottom: "8px"
    });


    card.appendChild(
      preview
    );


    /* =======================================================
       AVATAR PREVIEW
       ======================================================= */

    const avatarImage =
      document.createElement("img");


    avatarImage.alt =
      "Avatar preview";


    Object.assign(avatarImage.style, {
      position: "absolute",
      inset: "12%",
      width: "76%",
      height: "76%",
      objectFit: "cover",
      borderRadius: "50%",
      display: "block"
    });


    let previewAvatarUrl =
      null;


    if (
      window.U9Profile &&
      typeof window.U9Profile.getAvatarUrl === "function"
    ) {

      try {

        previewAvatarUrl =
          window.U9Profile.getAvatarUrl();

      } catch (error) {

        previewAvatarUrl =
          null;
      }
    }


    if (!previewAvatarUrl) {

      previewAvatarUrl =
        currentFrameUrl ||
        null;
    }


    if (previewAvatarUrl) {

      setFrameImageSource(
        avatarImage,
        previewAvatarUrl
      );
    }


    preview.appendChild(
      avatarImage
    );


    /* =======================================================
       FRAME IMAGE
       ======================================================= */

    const frameImage =
      document.createElement("img");


    frameImage.alt =
      frame.name ||
      `Frame ${index + 1}`;


    Object.assign(frameImage.style, {
      position: "absolute",
      inset: "0",
      width: "100%",
      height: "100%",
      objectFit: "contain",
      pointerEvents: "none"
    });


    setFrameImageSource(
      frameImage,
      frame.url
    );


    preview.appendChild(
      frameImage
    );


    /* =======================================================
       FRAME NAME
       ======================================================= */

    const name =
      document.createElement("div");


    name.textContent =
      frame.name ||
      `Frame ${index + 1}`;


    Object.assign(name.style, {
      width: "100%",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      fontSize: "13px",
      fontWeight: "600",
      color: "#222222",
      textAlign: "center",
      marginBottom: "6px"
    });


    card.appendChild(
      name
    );


    /* =======================================================
       PRICE
       ======================================================= */

    if (
      frame.type === "paid"
    ) {

      const price =
        document.createElement("div");


      price.textContent =
        frame.owned
          ? "Owned"
          : `${frame.price} Coins`;


      Object.assign(price.style, {
        textAlign: "center",
        fontSize: "12px",
        color: frame.owned
          ? "#15803d"
          : "#777777",
        marginBottom: "8px"
      });


      card.appendChild(
        price
      );
    }


    /* =======================================================
       ACTION BUTTON
       ======================================================= */

    const actionButton =
      document.createElement("button");


    actionButton.type =
      "button";


    if (
      frame.type === "paid" &&
      !frame.owned
    ) {

      actionButton.textContent =
        "Purchase";

    } else if (
      (
        String(currentFrameId) ===
        String(frame.id)
      ) &&
      (
        currentFrameType ===
        frame.type
      )
    ) {

      actionButton.textContent =
        "Equipped";

    } else {

      actionButton.textContent =
        "Equip";
    }


    Object.assign(actionButton.style, {
      width: "100%",
      border: "none",
      background: "#111111",
      color: "#ffffff",
      padding: "8px 10px",
      borderRadius: "8px",
      fontSize: "13px",
      fontWeight: "600",
      cursor: "pointer"
    });


    card.appendChild(
      actionButton
    );


    /* =======================================================
       ACTION
       ======================================================= */

    actionButton.addEventListener(
      "click",
      async (event) => {

        event.stopPropagation();


        await handleFrameAction(
          frame,
          actionButton
        );
      }
    );


    /* =======================================================
       CARD CLICK
       ======================================================= */

    card.addEventListener(
      "click",
      () => {

        selectedFrameType =
          frame.type;

        selectedFrameId =
          frame.id;


        refreshFrameSelectionUI();
      }
    );


    return card;
  }


  /* =========================================================
     REFRESH FRAME UI
     ========================================================= */

  function refreshFrameSelectionUI() {

    const cards =
      document.querySelectorAll(
        ".U9-page3-frame-card"
      );


    cards.forEach(
      (card) => {

        const frameId =
          card.dataset.frameId;


        const frameType =
          card.dataset.frameType;


        const isSelected =
          selectedFrameId !== null &&
          String(frameId) ===
            String(selectedFrameId) &&
          frameType ===
            selectedFrameType;


        const isEquipped =
          currentFrameId !== null &&
          String(frameId) ===
            String(currentFrameId) &&
          frameType ===
            currentFrameType;


        if (isSelected || isEquipped) {

          card.style.borderColor =
            "#111111";

          card.style.boxShadow =
            "0 0 0 2px rgba(17,17,17,0.12)";

        } else {

          card.style.borderColor =
            "#e5e5e5";

          card.style.boxShadow =
            "none";
        }


        const button =
          card.querySelector(
            "button"
          );


        if (!button) {
          return;
        }


        const frame =
          findFrame(
            frameType,
            frameId
          );


        if (
          frameType === "paid" &&
          frame &&
          !frame.owned
        ) {

          button.textContent =
            "Purchase";

          return;
        }


        if (isEquipped) {

          button.textContent =
            "Equipped";

          button.style.background =
            "#2f2f2f";

        } else {

          button.textContent =
            "Equip";

          button.style.background =
            "#111111";
        }
      }
    );
  }


  /* =========================================================
     RENDER FRAME LIST
     ========================================================= */

  function renderFrameList(
    panel,
    frames,
    emptyMessage
  ) {

    if (!panel) {
      return null;
    }


    panel.innerHTML =
      "";


    const grid =
      document.createElement("div");


    Object.assign(grid.style, {
      display: "grid",
      gridTemplateColumns:
        "repeat(auto-fill, minmax(120px, 1fr))",
      gap: "14px",
      width: "100%"
    });


    panel.appendChild(
      grid
    );


    if (
      !frames ||
      !frames.length
    ) {

      const empty =
        document.createElement("div");


      empty.textContent =
        emptyMessage ||
        "No frames are available right now.";


      Object.assign(empty.style, {
        gridColumn: "1 / -1",
        padding: "30px 15px",
        textAlign: "center",
        color: "#777777",
        fontSize: "14px"
      });


      grid.appendChild(
        empty
      );


      return {
        panel,
        grid
      };
    }


    frames.forEach(
      (frame, index) => {

        const card =
          createFrameCard(
            frame,
            index
          );


        grid.appendChild(
          card
        );
      }
    );


    refreshFrameSelectionUI();


    return {
      panel,
      grid
    };
  }


  /* =========================================================
     RENDER FREE FRAMES
     ========================================================= */

  function renderFreeFrames(
    panel
  ) {

    if (!panel) {
      return null;
    }


    const header =
      document.createElement("div");


    Object.assign(header.style, {
      marginBottom: "18px"
    });


    panel.innerHTML =
      "";


    panel.appendChild(
      header
    );


    const title =
      document.createElement("div");


    title.textContent =
      "Free Frames";


    Object.assign(title.style, {
      fontSize: "20px",
      fontWeight: "700",
      color: "#111111",
      marginBottom: "6px"
    });


    header.appendChild(
      title
    );


    const description =
      document.createElement("div");


    description.textContent =
      "Choose a free frame for your avatar.";


    Object.assign(description.style, {
      fontSize: "14px",
      color: "#666666",
      lineHeight: "1.5"
    });


    header.appendChild(
      description
    );


    const listContainer =
      document.createElement("div");


    panel.appendChild(
      listContainer
    );


    renderFrameList(
      listContainer,
      freeFrames,
      "No free frames are available right now."
    );


    return {
      panel,
      listContainer
    };
  }


  /* =========================================================
     RENDER PAID FRAMES
     ========================================================= */

  function renderPaidFrames(
    panel
  ) {

    if (!panel) {
      return null;
    }


    const header =
      document.createElement("div");


    Object.assign(header.style, {
      marginBottom: "18px"
    });


    panel.innerHTML =
      "";


    panel.appendChild(
      header
    );


    const title =
      document.createElement("div");


    title.textContent =
      "Paid Frames";


    Object.assign(title.style, {
      fontSize: "20px",
      fontWeight: "700",
      color: "#111111",
      marginBottom: "6px"
    });


    header.appendChild(
      title
    );


    const description =
      document.createElement("div");


    description.textContent =
      "Purchase premium frames using your available coins.";


    Object.assign(description.style, {
      fontSize: "14px",
      color: "#666666",
      lineHeight: "1.5"
    });


    header.appendChild(
      description
    );


    const listContainer =
      document.createElement("div");


    panel.appendChild(
      listContainer
    );


    renderFrameList(
      listContainer,
      paidFrames,
      "No paid frames are available right now."
    );


    return {
      panel,
      listContainer
    };
  }


  /* =========================================================
     LOAD + RENDER FREE FRAMES
     ========================================================= */

  async function loadAndRenderFreeFrames(
    panel
  ) {

    if (!panel) {
      return false;
    }


    panel.innerHTML =
      "";


    const loading =
      document.createElement("div");


    loading.textContent =
      "Loading free frames...";


    Object.assign(loading.style, {
      padding: "30px 15px",
      textAlign: "center",
      color: "#666666",
      fontSize: "14px"
    });


    panel.appendChild(
      loading
    );


    const result =
      await loadFreeFrames();


    if (!result.success) {

      panel.innerHTML =
        "";


      const error =
        document.createElement("div");


      error.textContent =
        result.error ||
        "Unable to load free frames.";


      Object.assign(error.style, {
        padding: "30px 15px",
        textAlign: "center",
        color: "#b91c1c",
        fontSize: "14px",
        lineHeight: "1.5"
      });


      panel.appendChild(
        error
      );


      const retry =
        document.createElement("button");


      retry.type =
        "button";


      retry.textContent =
        "Retry";


      Object.assign(retry.style, {
        display: "block",
        margin: "12px auto 0",
        border: "none",
        background: "#111111",
        color: "#ffffff",
        padding: "9px 16px",
        borderRadius: "9px",
        fontSize: "13px",
        fontWeight: "600",
        cursor: "pointer"
      });


      retry.addEventListener(
        "click",
        () => {

          loadAndRenderFreeFrames(
            panel
          );
        }
      );


      panel.appendChild(
        retry
      );


      return false;
    }


    renderFreeFrames(
      panel
    );


    frameInitialized =
      true;


    return true;
  }


  /* =========================================================
     LOAD + RENDER PAID FRAMES
     ========================================================= */

  async function loadAndRenderPaidFrames(
    panel
  ) {

    if (!panel) {
      return false;
    }


    panel.innerHTML =
      "";


    const loading =
      document.createElement("div");


    loading.textContent =
      "Loading paid frames...";


    Object.assign(loading.style, {
      padding: "30px 15px",
      textAlign: "center",
      color: "#666666",
      fontSize: "14px"
    });


    panel.appendChild(
      loading
    );


    const result =
      await loadPaidFrames();


    if (!result.success) {

      panel.innerHTML =
        "";


      const error =
        document.createElement("div");


      error.textContent =
        result.error ||
        "Unable to load paid frames.";


      Object.assign(error.style, {
        padding: "30px 15px",
        textAlign: "center",
        color: "#b91c1c",
        fontSize: "14px",
        lineHeight: "1.5"
      });


      panel.appendChild(
        error
      );


      const retry =
        document.createElement("button");


      retry.type =
        "button";


      retry.textContent =
        "Retry";


      Object.assign(retry.style, {
        display: "block",
        margin: "12px auto 0",
        border: "none",
        background: "#111111",
        color: "#ffffff",
        padding: "9px 16px",
        borderRadius: "9px",
        fontSize: "13px",
        fontWeight: "600",
        cursor: "pointer"
      });


      retry.addEventListener(
        "click",
        () => {

          loadAndRenderPaidFrames(
            panel
          );
        }
      );


      panel.appendChild(
        retry
      );


      return false;
    }


    renderPaidFrames(
      panel
    );


    frameInitialized =
      true;


    return true;
  }


  /* =========================================================
     LOAD BOTH
     ========================================================= */

  async function loadAllFrames() {

    if (!isFrameLoggedIn()) {

      return {
        success: false,
        free: [],
        paid: [],
        error:
          "Please sign in first."
      };
    }


    await refreshFrameUser();


    const [
      freeResult,
      paidResult
    ] =
      await Promise.all([
        loadFreeFrames(),
        loadPaidFrames()
      ]);


    return {
      success:
        freeResult.success ||
        paidResult.success,

      free:
        freeFrames,

      paid:
        paidFrames,

      freeResult,

      paidResult
    };
  }


  /* =========================================================
     INITIALIZE
     ========================================================= */

  async function initFrames(
    freePanel = null,
    paidPanel = null
  ) {

    if (!isFrameLoggedIn()) {

      const message =
        "Please sign in to manage avatar frames.";


      if (freePanel) {

        freePanel.innerHTML =
          "";

        const element =
          document.createElement("div");

        element.textContent =
          message;

        Object.assign(element.style, {
          padding: "30px 15px",
          textAlign: "center",
          color: "#666666",
          fontSize: "14px"
        });

        freePanel.appendChild(
          element
        );
      }


      if (paidPanel) {

        paidPanel.innerHTML =
          "";

        const element =
          document.createElement("div");

        element.textContent =
          message;

        Object.assign(element.style, {
          padding: "30px 15px",
          textAlign: "center",
          color: "#666666",
          fontSize: "14px"
        });

        paidPanel.appendChild(
          element
        );
      }


      return false;
    }


    await refreshFrameUser();


    const result =
      await loadAllFrames();


    if (freePanel) {

      if (result.freeResult.success) {

        renderFreeFrames(
          freePanel
        );

      } else {

        freePanel.textContent =
          result.freeResult.error ||
          "Unable to load free frames.";
      }
    }


    if (paidPanel) {

      if (result.paidResult.success) {

        renderPaidFrames(
          paidPanel
        );

      } else {

        paidPanel.textContent =
          result.paidResult.error ||
          "Unable to load paid frames.";
      }
    }


    frameInitialized =
      true;


    return result.success;
  }


  /* =========================================================
     PUBLIC API
     ========================================================= */

  window.U9ProfilePage3Frames = {

    init:
      initFrames,

    loadAll:
      loadAllFrames,

    loadFree:
      loadFreeFrames,

    loadPaid:
      loadPaidFrames,

    renderFree:
      renderFreeFrames,

    renderPaid:
      renderPaidFrames,

    refreshFree:
      loadAndRenderFreeFrames,

    refreshPaid:
      loadAndRenderPaidFrames,

    equip:
      equipFrame,

    purchase:
      purchasePaidFrame,

    getState() {

      return {
        currentType:
          currentFrameType,

        currentId:
          currentFrameId,

        currentUrl:
          currentFrameUrl,

        selectedType:
          selectedFrameType,

        selectedId:
          selectedFrameId,

        free:
          freeFrames.slice(),

        paid:
          paidFrames.slice(),

        initialized:
          frameInitialized
      };
    },

    setCurrentFrameState:
      loadCurrentFrame
  };


  /* =========================================================
     OPTIONAL GLOBAL HELPERS
     ========================================================= */

  window.U9ProfilePage3LoadFreeFrames =
    loadFreeFrames;


  window.U9ProfilePage3LoadPaidFrames =
    loadPaidFrames;


  window.U9ProfilePage3EquipFrame =
    equipFrame;


  window.U9ProfilePage3PurchaseFrame =
    purchasePaidFrame;


  window.U9ProfilePage3RenderFreeFrames =
    renderFreeFrames;


  window.U9ProfilePage3RenderPaidFrames =
    renderPaidFrames;


})();
