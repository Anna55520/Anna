/* =========================================================
   PROFILE PAGE 3
   Avatar / Free Avatar Frame / Paid Avatar Frame
========================================================= */


/* =========================================================
   API
========================================================= */

const U9_PROFILE_PAGE3_FREE_AVATAR_API =
  "https://tvtakmswbzawaweytimx.supabase.co/functions/v1/avatar-free";

const U9_PROFILE_PAGE3_SET_AVATAR_API =
  "https://tvtakmswbzawaweytimx.supabase.co/functions/v1/avatar-set";

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

let currentFrameType = "default";

let currentFrameId = null;

let freeFrames = [];

let paidFrames = [];

let activePage3Tab = "avatar";

let page3Initialized = false;


/* =========================================================
   DEFAULT AVATAR
========================================================= */

const U9_PROFILE_PAGE3_DEFAULT_AVATAR =
  "SSVG/avatar/profile.svg";


/* =========================================================
   TOKEN
========================================================= */

function getPage3Token() {

  return localStorage.getItem(
    "u9_token"
  );

}


/* =========================================================
   AUTH CHECK
========================================================= */

function page3IsLoggedIn() {

  if (
    window.U9User &&
    typeof window.U9User.isLoggedIn === "function"
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
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}


/* =========================================================
   IMAGE / SVG
========================================================= */

function setPage3ImageSource(
  image,
  source
) {

  if (!image || !source) {

    return;

  }

  const value =
    String(source).trim();

  if (!value) {

    return;

  }

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
   GET CURRENT USER
========================================================= */

function getPage3CurrentUser() {

  if (
    window.U9User &&
    typeof window.U9User.get === "function"
  ) {

    return window.U9User.get();

  }

  return null;

}


/* =========================================================
   GET CURRENT USER AVATAR SOURCE
========================================================= */

function getCurrentUserAvatarSource() {

  const user =
    getPage3CurrentUser();


  /* -------------------------------------------------------
     DEFAULT AVATAR
  ------------------------------------------------------- */

  const defaultAvatar =
    U9_PROFILE_PAGE3_DEFAULT_AVATAR;


  if (!user) {

    return defaultAvatar;

  }


  /* -------------------------------------------------------
     AVATAR OBJECT
  ------------------------------------------------------- */

  const avatar =
    user?.avatar ||
    user?.profile?.avatar ||
    user?.profile?.profile_avatar ||
    user?.profile?.profileAvatar ||
    null;


  /* -------------------------------------------------------
     AVATAR IS DIRECT STRING
  ------------------------------------------------------- */

  if (
    typeof avatar === "string" &&
    avatar.trim()
  ) {

    return avatar.trim();

  }


  /* -------------------------------------------------------
     AVATAR OBJECT IMAGE SOURCE
  ------------------------------------------------------- */

  const avatarSource =
    avatar?.url ||
    avatar?.image_url ||
    avatar?.imageUrl ||
    avatar?.image ||
    avatar?.src ||
    avatar?.avatar_url ||
    avatar?.avatarUrl ||
    avatar?.file_url ||
    avatar?.fileUrl ||
    avatar?.public_url ||
    avatar?.publicUrl ||
    avatar?.photo_url ||
    avatar?.photoUrl ||
    avatar?.picture ||
    avatar?.profile_image_url ||
    avatar?.profileImageUrl ||
    null;


  if (
    typeof avatarSource === "string" &&
    avatarSource.trim()
  ) {

    return avatarSource.trim();

  }


  /* -------------------------------------------------------
     USER TOP LEVEL AVATAR SOURCE
  ------------------------------------------------------- */

  const userAvatarSource =
    user?.avatar_url ||
    user?.avatarUrl ||
    user?.profile_avatar_url ||
    user?.profileAvatarUrl ||
    user?.profile_image_url ||
    user?.profileImageUrl ||
    user?.photo_url ||
    user?.photoUrl ||
    user?.picture ||
    user?.image_url ||
    user?.imageUrl ||
    user?.image ||
    user?.avatar_src ||
    user?.avatarSrc ||
    null;


  if (
    typeof userAvatarSource === "string" &&
    userAvatarSource.trim()
  ) {

    return userAvatarSource.trim();

  }


  /* -------------------------------------------------------
     NO USER AVATAR
     USE DEFAULT
  ------------------------------------------------------- */

  return defaultAvatar;

}


/* =========================================================
   UPDATE CURRENT PROFILE AVATAR IMAGE
========================================================= */

function updateCurrentProfileAvatarImage() {

  const image =
    document.querySelector(
      ".U9-profile-page3-avatar-card:first-child .U9-profile-page3-avatar-image"
    );


  if (!image) {

    return;

  }


  const source =
    getCurrentUserAvatarSource();


  image.dataset.fallbackApplied =
    "false";


  setPage3ImageSource(
    image,
    source
  );

}


/* =========================================================
   CURRENT USER EQUIPMENT
========================================================= */

function loadCurrentEquipment() {

  const user =
    getPage3CurrentUser();


  /* -------------------------------------------------------
     AVATAR
  ------------------------------------------------------- */

  currentAvatarId =
    user?.avatar?.id ||
    user?.avatar?.avatar_id ||
    user?.avatar_id ||
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
      avatarId:
        currentAvatarId,

      avatarSource:
        getCurrentUserAvatarSource(),

      frameType:
        currentFrameType,

      frameId:
        currentFrameId
    }
  );

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
      typeof window.U9User.refresh === "function"
    ) {

      user =
        await window.U9User.refresh();

    }


    /* -----------------------------------------------------
       UPDATE LOCAL STATE
    ----------------------------------------------------- */

    if (user) {

      currentAvatarId =
        user?.avatar?.id ||
        user?.avatar?.avatar_id ||
        user?.avatar_id ||
        currentAvatarId;


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
       UPDATE PAGE 3 PROFILE AVATAR
    ----------------------------------------------------- */

    updateCurrentProfileAvatarImage();


    /* -----------------------------------------------------
       REFRESH PROFILE AVATAR
    ----------------------------------------------------- */

    if (
      window.U9Profile &&
      typeof window.U9Profile.refreshAvatar === "function"
    ) {

      await window.U9Profile.refreshAvatar();

    }

    else if (
      window.U9Profile &&
      typeof window.U9Profile.refresh === "function"
    ) {

      await window.U9Profile.refresh();

    }


    return true;

  }

  catch (error) {

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

  if (!profilePage3Content) {

    console.error(
      "U9-profile-page3-content not found."
    );

    return;

  }


  profilePage3Content.innerHTML = "";


  /* =======================================================
     TABS
  ======================================================= */

  const tabs =
    document.createElement("div");

  tabs.className =
    "U9-profile-page3-tabs";


  const avatarTab =
    createPage3Tab(
      "avatar",
      "Avatar"
    );


  const freeFrameTab =
    createPage3Tab(
      "free-frame",
      "Free Avatar Frame"
    );


  const paidFrameTab =
    createPage3Tab(
      "paid-frame",
      "Paid Avatar Frame"
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
    document.createElement("div");

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
    document.createElement("button");

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
    async function () {

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
    function (tab) {

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


  /* -------------------------------------------------------
     REFRESH USER BEFORE AVATAR PAGE
  ------------------------------------------------------- */

  if (
    tabName === "avatar" &&
    window.U9User &&
    typeof window.U9User.refresh === "function"
  ) {

    try {

      await window.U9User.refresh();

      loadCurrentEquipment();

    }

    catch (error) {

      console.error(
        "PAGE3 AVATAR USER REFRESH ERROR:",
        error
      );

    }

  }


  panel.innerHTML = "";


  /* -------------------------------------------------------
     AVATAR
  ------------------------------------------------------- */

  if (
    tabName === "avatar"
  ) {

    await renderFreeAvatars(
      panel
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


  panel.innerHTML = "";


  const messageElement =
    document.createElement("div");

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
    "Please log in before using this feature.",
    "error"
  );


  return false;

}


/* =========================================================
   CREATE SELECT AVATAR CARD
========================================================= */

function createSelectAvatarCard() {

  const card =
    document.createElement("div");

  card.className =
    "U9-profile-page3-avatar-card";


  /* -------------------------------------------------------
     IMAGE
  ------------------------------------------------------- */

  const image =
    document.createElement("img");

  image.className =
    "U9-profile-page3-avatar-image";

  image.alt =
    "Profile Avatar";


  /* -------------------------------------------------------
     GET CURRENT USER AVATAR
  ------------------------------------------------------- */

  const avatarSource =
    getCurrentUserAvatarSource();


  setPage3ImageSource(
    image,
    avatarSource
  );


  /* -------------------------------------------------------
     IMAGE FALLBACK
  ------------------------------------------------------- */

  image.dataset.fallbackApplied =
    "false";


  image.addEventListener(
    "error",
    function () {

      if (
        image.dataset.fallbackApplied ===
        "true"
      ) {

        return;

      }


      image.dataset.fallbackApplied =
        "true";


      image.src =
        U9_PROFILE_PAGE3_DEFAULT_AVATAR;

    }
  );


  card.appendChild(
    image
  );


  /* -------------------------------------------------------
     NAME
  ------------------------------------------------------- */

  const name =
    document.createElement("div");

  name.className =
    "U9-profile-page3-avatar-name";

  name.textContent =
    "Profile Avatar";


  card.appendChild(
    name
  );


  /* -------------------------------------------------------
     BUTTON
  ------------------------------------------------------- */

  const button =
    document.createElement("button");

  button.type =
    "button";

  button.className =
    "U9-profile-page3-avatar-button";

  button.textContent =
    "Select Avatar";


  /*
   * IMPORTANT:
   *
   * This button is NOT a free avatar button.
   * Therefore it does not receive
   * data-avatar-id.
   *
   * This prevents updateAvatarButtons()
   * from modifying this button.
   */


  button.addEventListener(
    "click",
    function () {

      if (
        window.U9ProfilePictureModal &&
        typeof window.U9ProfilePictureModal.open === "function"
      ) {

        window.U9ProfilePictureModal.open();

        return;

      }


      console.error(
        "U9ProfilePictureModal.open() is not available."
      );


      alert(
        "Profile picture is not available yet."
      );

    }
  );


  card.appendChild(
    button
  );


  return card;

}


/* =========================================================
   AVATAR
========================================================= */

async function renderFreeAvatars(
  panel
) {

  if (!panel) {

    return;

  }


  panel.innerHTML = "";


  const loading =
    document.createElement("div");

  loading.className =
    "U9-profile-page3-loading";

  loading.textContent =
    "Loading avatars...";


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
        "Failed to load avatars."
      );

    }


    const avatars =
      Array.isArray(
        result?.avatars
      )
        ? result.avatars
        : [];


    panel.innerHTML = "";


    const list =
      document.createElement("div");

    list.className =
      "U9-profile-page3-avatar-list";


    /* -----------------------------------------------------
       SELECT AVATAR CARD
    ----------------------------------------------------- */

    list.appendChild(
      createSelectAvatarCard()
    );


    if (!avatars.length) {

      panel.appendChild(
        list
      );

      return;

    }


    avatars.forEach(
      function (avatar) {

        const card =
          document.createElement("div");

        card.className =
          "U9-profile-page3-avatar-card";


        /* -------------------------------------------------
           IMAGE
        ------------------------------------------------- */

        const image =
          document.createElement("img");

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
          document.createElement("div");

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
          document.createElement("button");

        button.type =
          "button";

        button.className =
          "U9-profile-page3-avatar-button";


        button.dataset.avatarId =
          avatar?.id || "";


        button.textContent =
          String(
            currentAvatarId
          ) ===
          String(
            avatar?.id
          )
            ? "Using"
            : "Use";


        if (
          String(
            currentAvatarId
          ) ===
          String(
            avatar?.id
          )
        ) {

          button.classList.add(
            "active"
          );

          button.disabled =
            true;

        }


        button.addEventListener(
          "click",
          function () {

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

  catch (error) {

    console.error(
      "FREE AVATAR ERROR:",
      error
    );


    showPage3Message(
      panel,
      error?.message ||
      "Failed to load free avatars.",
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
      "Please log in first."
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
      "Processing...";

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

          body: JSON.stringify({
            type:
              "free",

            avatar_id:
              avatarId
          })
        }
      );


    const result =
      await response.json()
        .catch(
          () => ({})
        );


    console.log(
      "SET AVATAR RESULT:",
      result
    );


    if (
      response.status === 401 ||
      response.status === 403
    ) {

      throw new Error(
        "Your login session has expired. Please log in again."
      );

    }


    if (!response.ok) {

      throw new Error(
        result?.message ||
        "Failed to set avatar."
      );

    }


    if (
      result?.success === false
    ) {

      throw new Error(
        result?.message ||
        "Failed to set avatar."
      );

    }


    currentAvatarId =
      result?.avatar?.id ||
      avatarId;


    updateAvatarButtons();


    await refreshProfileAfterChange();


    console.log(
      "AVATAR SET SUCCESS:",
      currentAvatarId
    );


  }

  catch (error) {

    console.error(
      "SET AVATAR ERROR:",
      error
    );


    alert(
      error?.message ||
      "Failed to set avatar. Please try again later."
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
      ".U9-profile-page3-avatar-button[data-avatar-id]"
    );


  buttons.forEach(
    function (button) {

      const avatarId =
        button.dataset.avatarId;


      const active =
        String(
          avatarId
        ) ===
        String(
          currentAvatarId
        );


      button.classList.toggle(
        "active",
        active
      );


      button.disabled =
        active;


      if (active) {

        button.textContent =
          "Using";

      }

      else if (
        !button.classList.contains(
          "loading"
        )
      ) {

        button.textContent =
          "Use";

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


  panel.innerHTML = "";


  const loading =
    document.createElement("div");

  loading.className =
    "U9-profile-page3-loading";

  loading.textContent =
    "Loading free avatar frames...";


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
        "Failed to load free avatar frames."
      );

    }


    freeFrames =
      Array.isArray(
        result?.frames
      )
        ? result.frames
        : [];


    panel.innerHTML = "";


    if (!freeFrames.length) {

      showPage3Message(
        panel,
        "No free avatar frames available.",
        "empty"
      );

      return;

    }


    const list =
      document.createElement("div");

    list.className =
      "U9-profile-page3-frame-list";


    freeFrames.forEach(
      function (frame) {

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

  catch (error) {

    console.error(
      "FREE FRAME ERROR:",
      error
    );


    showPage3Message(
      panel,
      error?.message ||
      "Failed to load free avatar frames.",
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
      "Please log in to view paid avatar frames."
    );

  }


  const response =
    await fetch(
      U9_PROFILE_PAGE3_PAID_FRAME_API,
      {
        method: "GET",

        /*
         * IMPORTANT:
         * DO NOT use credentials:"include"
         *
         * Authorization header is enough.
         * This fixes the CORS error.
         */

        headers: {
          Authorization:
            `Bearer ${token}`
        },

        cache: "no-store"
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
      "Your login session has expired. Please log in again."
    );

  }


  if (!response.ok) {

    throw new Error(
      result?.message ||
      "Failed to load paid avatar frames."
    );

  }


  if (
    result?.success === false
  ) {

    throw new Error(
      result?.message ||
      "Failed to load paid avatar frames."
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


  panel.innerHTML = "";


  const loading =
    document.createElement("div");

  loading.className =
    "U9-profile-page3-loading";

  loading.textContent =
    "Loading paid avatar frames...";


  panel.appendChild(
    loading
  );


  try {

    await loadPaidFrames();


    panel.innerHTML = "";


    if (!paidFrames.length) {

      showPage3Message(
        panel,
        "No paid avatar frames available.",
        "empty"
      );

      return;

    }


    const list =
      document.createElement("div");

    list.className =
      "U9-profile-page3-frame-list";


    paidFrames.forEach(
      function (frame) {

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

  catch (error) {

    console.error(
      "PAID FRAME ERROR:",
      error
    );


    showPage3Message(
      panel,
      error?.message ||
      "Failed to load paid avatar frames.",
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
    document.createElement("div");

  card.className =
    "U9-profile-page3-frame-card";


  card.dataset.frameId =
    frame?.id || "";


  /* -------------------------------------------------------
     IMAGE
  ------------------------------------------------------- */

  const image =
    document.createElement("img");

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
    document.createElement("div");

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
    frameType === "paid"
  ) {

    const price =
      document.createElement("div");

    price.className =
      "U9-profile-page3-frame-price";


    const coins =
      Number(
        frame?.coins_price
      );


    price.textContent =
      Number.isFinite(coins)
        ? `${coins} Coins`
        : "Paid Avatar Frame";


    card.appendChild(
      price
    );

  }


  /* -------------------------------------------------------
     BUTTON
  ------------------------------------------------------- */

  const button =
    document.createElement("button");

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
    String(
      currentFrameId
    ) ===
    String(
      frame?.id
    );


  /* =======================================================
     FREE FRAME
  ======================================================= */

  if (
    frameType === "free"
  ) {

    if (equipped) {

      button.textContent =
        "Using";

      button.classList.add(
        "active"
      );

      button.disabled =
        true;

    }

    else {

      button.textContent =
        "Use";


      button.addEventListener(
        "click",
        function () {

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
    frameType === "paid"
  ) {

    const owned =
      frame?.owned === true ||
      frame?.purchased === true ||
      frame?.is_owned === true;


    if (equipped) {

      button.textContent =
        "Using";

      button.classList.add(
        "active"
      );

      button.disabled =
        true;

    }

    else if (owned) {

      button.textContent =
        "Use";

      button.classList.add(
        "use"
      );


      button.addEventListener(
        "click",
        function () {

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
          ? `Buy ${coins}`
          : "Buy";


      button.classList.add(
        "buy"
      );


      button.addEventListener(
        "click",
        function () {

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
      "Please log in first."
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
      "Processing...";

  }


  try {

    const response =
      await fetch(
        U9_PROFILE_PAGE3_EQUIP_FRAME_API,
        {
          method: "POST",

          /*
           * IMPORTANT:
           * No credentials:"include".
           *
           * Authentication is sent through
           * Authorization header.
           */

          headers: {
            Authorization:
              `Bearer ${token}`,

            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({
            frame_type:
              frameType,

            frame_id:
              frameId
          })
        }
      );


    const result =
      await response.json()
        .catch(
          () => ({})
        );


    console.log(
      "EQUIP FRAME RESULT:",
      result
    );


    if (
      response.status === 401 ||
      response.status === 403
    ) {

      throw new Error(
        result?.message ||
        "Your login session has expired. Please log in again."
      );

    }


    if (!response.ok) {

      throw new Error(
        result?.message ||
        "Failed to equip avatar frame."
      );

    }


    if (
      result?.success === false
    ) {

      throw new Error(
        result?.message ||
        "Failed to equip avatar frame."
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


    console.log(
      "FRAME EQUIPPED:",
      {
        frameType:
          currentFrameType,

        frameId:
          currentFrameId
      }
    );


    /*
     * Re-render current frame page
     * so buttons immediately update.
     */

    if (
      activePage3Tab ===
      "free-frame"
    ) {

      const panel =
        document.getElementById(
          "U9-profile-page3-panel"
        );


      if (panel) {

        await renderFreeFrames(
          panel
        );

      }

    }


    if (
      activePage3Tab ===
      "paid-frame"
    ) {

      const panel =
        document.getElementById(
          "U9-profile-page3-panel"
        );


      if (panel) {

        await renderPaidFrames(
          panel
        );

      }

    }

  }

  catch (error) {

    console.error(
      "EQUIP FRAME ERROR:",
      error
    );


    alert(
      error?.message ||
      "Failed to equip avatar frame. Please try again later."
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
    function (button) {

      const frameType =
        button.dataset.frameType;


      const frameId =
        button.dataset.frameId;


      const active =
        currentFrameType ===
          frameType &&
        String(
          currentFrameId
        ) ===
        String(
          frameId
        );


      button.classList.toggle(
        "active",
        active
      );


      if (active) {

        button.textContent =
          "Using";

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
      "Please log in first."
    );

    return;

  }


  const frame =
    paidFrames.find(
      function (item) {

        return String(
          item?.id
        ) ===
        String(
          frameId
        );

      }
    );


  if (!frame) {

    alert(
      "Avatar frame not found."
    );

    return;

  }


  const price =
    Number(
      frame?.coins_price
    );


  const confirmMessage =
    Number.isFinite(price)
      ? `Are you sure you want to purchase "${frame?.name || "Avatar Frame"}"?\nIt costs ${price} Coins.`
      : `Are you sure you want to purchase "${frame?.name || "Avatar Frame"}"?`;


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
      "Purchasing...";

  }


  try {

    const response =
      await fetch(
        U9_PROFILE_PAGE3_PURCHASE_FRAME_API,
        {
          method: "POST",

          /*
           * IMPORTANT:
           * No credentials:"include".
           */

          headers: {
            Authorization:
              `Bearer ${token}`,

            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({
            frame_id:
              frameId
          })
        }
      );


    const result =
      await response.json()
        .catch(
          () => ({})
        );


    console.log(
      "PURCHASE FRAME RESULT:",
      result
    );


    if (
      response.status === 401 ||
      response.status === 403
    ) {

      throw new Error(
        result?.message ||
        "Your login session has expired. Please log in again."
      );

    }


    if (!response.ok) {

      throw new Error(
        result?.message ||
        "Failed to purchase avatar frame."
      );

    }


    if (
      result?.success === false
    ) {

      throw new Error(
        result?.message ||
        "Failed to purchase avatar frame."
      );

    }


    /* -----------------------------------------------------
       UPDATE LOCAL OWNERSHIP
    ----------------------------------------------------- */

    const purchasedFrame =
      paidFrames.find(
        function (item) {

          return String(
            item?.id
          ) ===
          String(
            frameId
          );

        }
      );


    if (purchasedFrame) {

      purchasedFrame.owned =
        true;

    }


    console.log(
      "FRAME PURCHASE SUCCESS:",
      frameId
    );


    /*
     * Automatically equip after purchase.
     *
     * This means:
     * Buy -> immediately use
     */

    await equipFrame(
      "paid",
      frameId,
      null
    );


    /*
     * Reload paid frames from server
     * to make sure ownership is correct.
     */

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

  catch (error) {

    console.error(
      "PURCHASE FRAME ERROR:",
      error
    );


    alert(
      error?.message ||
      "Failed to purchase avatar frame. Please try again later."
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

  if (!profilePage3Content) {

    console.error(
      "PROFILE PAGE 3 CONTENT NOT FOUND"
    );

    return;

  }


  try {

    /* -----------------------------------------------------
       LOAD CURRENT USER
    ----------------------------------------------------- */

    if (
      window.U9User &&
      typeof window.U9User.refresh === "function"
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

  catch (error) {

    console.error(
      "PROFILE PAGE 3 LOAD ERROR:",
      error
    );

  }

}


/* =========================================================
   AVATAR UPDATED EVENT
========================================================= */

window.addEventListener(
  "U9ProfileAvatarUpdated",
  async function () {

    try {

      if (
        window.U9User &&
        typeof window.U9User.refresh === "function"
      ) {

        await window.U9User.refresh();

      }


      loadCurrentEquipment();


      updateCurrentProfileAvatarImage();

    }

    catch (error) {

      console.error(
        "PAGE3 AVATAR UPDATE EVENT ERROR:",
        error
      );

    }

  }
);


/* =========================================================
   PUBLIC PAGE 3 API
========================================================= */

window.U9ProfilePage3 =
  window.U9ProfilePage3 ||
  {};


window.U9ProfilePage3.refreshAvatar =
  async function () {

    try {

      if (
        window.U9User &&
        typeof window.U9User.refresh === "function"
      ) {

        await window.U9User.refresh();

      }


      loadCurrentEquipment();


      updateCurrentProfileAvatarImage();


      return true;

    }

    catch (error) {

      console.error(
        "PAGE3 AVATAR REFRESH ERROR:",
        error
      );

      return false;

    }

  };


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
