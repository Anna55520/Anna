
/* =========================================================
   U9 PROFILE PAGE 3
   Avatar / Free Avatar Frame / Paid Avatar Frame

   Loading improvements:
   - Reuse loaded tab data
   - Keep existing panel content during loading
   - Display a compact loading status
   - Prevent stale requests from replacing the selected tab
========================================================= */

/* =========================================================
   API
========================================================= */

const U9_PROFILE_PAGE3_FREE_AVATAR_API =
  "/api/functions/avatar-free";

const U9_PROFILE_PAGE3_SET_AVATAR_API =
  "/api/functions/avatar-set";

const U9_PROFILE_PAGE3_FREE_FRAME_API =
  "/api/functions/avatar-frame-free";

const U9_PROFILE_PAGE3_PAID_FRAME_API =
  "/api/functions/avatar-frame-paid";

const U9_PROFILE_PAGE3_EQUIP_FRAME_API =
  "/api/functions/avatar-frame-equip";

const U9_PROFILE_PAGE3_PURCHASE_FRAME_API =
  "/api/functions/avatar-frame-paid-purchase";


/* =========================================================
   ELEMENTS
========================================================= */

const profilePage3Content =
  document.getElementById("U9-profile-page3-content");


/* =========================================================
   STATE
========================================================= */

let currentAvatarId = null;
let currentAvatarType = "default";
let currentCustomAvatarUrl = null;

let currentFrameType = "default";
let currentFrameId = null;

let freeAvatars = [];
let freeFrames = [];
let paidFrames = [];

let activePage3Tab = "avatar";
let page3Initialized = false;
let page3RequestVersion = 0;

const page3Loaded = {
  avatar: false,
  "free-frame": false,
  "paid-frame": false
};


/* =========================================================
   TOKEN
========================================================= */

function getPage3Token() {
  return localStorage.getItem("u9_token");
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
   IMAGE / SVG
========================================================= */

function setPage3ImageSource(image, source) {
  if (!image || !source) return;

  const value = String(source).trim();

  if (!value) return;

  if (
    value.startsWith("<svg") ||
    value.startsWith("<?xml")
  ) {
    image.src =
      "data:image/svg+xml;charset=UTF-8," +
      encodeURIComponent(value);

    return;
  }

  image.src = value;
}


/* =========================================================
   GET FIRST AVAILABLE VALUE
========================================================= */

function getPage3FirstValue(values, fallback = null) {
  for (const value of values) {
    if (
      value !== undefined &&
      value !== null &&
      value !== ""
    ) {
      return value;
    }
  }

  return fallback;
}


/* =========================================================
   CURRENT USER EQUIPMENT
========================================================= */

function loadCurrentEquipment(user = null) {
  if (!user) {
    user =
      window.U9User &&
      typeof window.U9User.get === "function"
        ? window.U9User.get()
        : null;
  }

  currentAvatarId =
    getPage3FirstValue([
      user?.avatar?.id,
      user?.avatar?.avatar_id,
      user?.avatar_id
    ]);

  currentAvatarType =
    getPage3FirstValue([
      user?.avatar_type,
      user?.avatarType,
      user?.avatar?.type,
      user?.avatar?.avatar_type,
      user?.user_avatar?.avatar_type,
      user?.userAvatar?.avatar_type
    ], "default");

  /*
   * IMPORTANT:
   *
   * avatar.url may represent the currently equipped avatar.
   * It must not be treated as the saved custom avatar URL.
   *
   * Prefer the dedicated custom avatar URL fields.
   */

  const customAvatarUrl =
    getPage3FirstValue([
      user?.avatar_url,
      user?.avatarUrl,
      user?.avatar?.custom_url,
      user?.user_avatar?.avatar_url,
      user?.userAvatar?.avatar_url
    ]);

  /*
   * Preserve the previous custom URL if the returned user
   * object temporarily does not include the custom URL.
   */

  if (customAvatarUrl !== null) {
    currentCustomAvatarUrl =
      String(customAvatarUrl).trim() || null;
  }

  currentFrameType =
    getPage3FirstValue([
      user?.avatar_frame_type,
      user?.avatarFrameType,
      user?.frame_type
    ], "default");

  currentFrameId =
    getPage3FirstValue([
      user?.avatar_frame_id,
      user?.avatarFrameId,
      user?.frame_id
    ]);

  console.log("PAGE3 CURRENT USER DATA:", {
    avatarId: currentAvatarId,
    avatarType: currentAvatarType,
    customAvatarUrl: currentCustomAvatarUrl,
    frameType: currentFrameType,
    frameId: currentFrameId
  });
}


/* =========================================================
   REFRESH USER + PROFILE
========================================================= */

async function refreshProfileAfterChange() {
  try {
    let user = null;

    if (
      window.U9User &&
      typeof window.U9User.refresh === "function"
    ) {
      user = await window.U9User.refresh();
    }

    if (user) {
      loadCurrentEquipment(user);
    }

    updateAvatarButtons();
    updateFrameButtons();

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

    return true;
  } catch (error) {
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

  /*
   * Build the tabs and panel only once.
   * Do not recreate the whole page when switching tabs.
   */

  if (
    page3Initialized &&
    document.getElementById("U9-profile-page3-panel") &&
    profilePage3Content.querySelector(
      ".U9-profile-page3-tabs"
    )
  ) {
    return;
  }

  profilePage3Content.innerHTML = "";

  const tabs = document.createElement("div");
  tabs.className = "U9-profile-page3-tabs";

  tabs.append(
    createPage3Tab("avatar", "Avatar"),
    createPage3Tab("free-frame", "Free Avatar Frame"),
    createPage3Tab("paid-frame", "Paid Avatar Frame")
  );

  const status = document.createElement("div");
  status.id = "U9-profile-page3-status";
  status.className = "U9-profile-page3-status";
  status.setAttribute("aria-live", "polite");
  status.hidden = true;

  const panel = document.createElement("div");
  panel.id = "U9-profile-page3-panel";
  panel.className = "U9-profile-page3-panel";

  profilePage3Content.append(
    tabs,
    status,
    panel
  );

  page3Initialized = true;
}


/* =========================================================
   CREATE TAB
========================================================= */

function createPage3Tab(tabName, label) {
  const button = document.createElement("button");

  button.type = "button";
  button.className = "U9-profile-page3-tab";
  button.dataset.tab = tabName;
  button.textContent = label;
  button.setAttribute("aria-selected", "false");

  button.addEventListener("click", function () {
    switchPage3Tab(tabName);
  });

  return button;
}


/* =========================================================
   UPDATE TAB STATE
========================================================= */

function updatePage3Tabs() {
  document
    .querySelectorAll(".U9-profile-page3-tab")
    .forEach(function (tab) {
      const active =
        tab.dataset.tab === activePage3Tab;

      tab.classList.toggle("active", active);
      tab.setAttribute(
        "aria-selected",
        String(active)
      );
    });
}


/* =========================================================
   LOADING STATUS
========================================================= */

function setPage3Status(
  message = "",
  type = "loading"
) {
  const status = document.getElementById(
    "U9-profile-page3-status"
  );

  if (!status) return;

  if (!message) {
    status.hidden = true;
    status.textContent = "";
    status.className = "U9-profile-page3-status";
    return;
  }

  status.hidden = false;
  status.textContent = message;
  status.className =
    "U9-profile-page3-status " + type;
}


/* =========================================================
   MESSAGE
========================================================= */

function showPage3Message(
  panel,
  message,
  type = "info"
) {
  if (!panel) return;

  panel.innerHTML = "";

  const messageElement =
    document.createElement("div");

  messageElement.className =
    "U9-profile-page3-message " + type;

  messageElement.textContent = message;

  panel.appendChild(messageElement);
}


/* =========================================================
   LOGIN MESSAGE
========================================================= */

function requirePage3Login(panel) {
  if (page3IsLoggedIn()) {
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
   FETCH JSON
========================================================= */

async function fetchPage3Json(
  url,
  options = {},
  defaultMessage = "Request failed."
) {
  const response = await fetch(url, options);

  const result = await response
    .json()
    .catch(() => ({}));

  if (
    response.status === 401 ||
    response.status === 403
  ) {
    throw new Error(
      result?.message ||
      "Your login session has expired. Please log in again."
    );
  }

  if (
    !response.ok ||
    result?.success === false
  ) {
    throw new Error(
      result?.message || defaultMessage
    );
  }

  return result;
}


/* =========================================================
   SWITCH TAB
========================================================= */

async function switchPage3Tab(
  tabName,
  options = {}
) {
  if (
    ![
      "avatar",
      "free-frame",
      "paid-frame"
    ].includes(tabName)
  ) {
    return;
  }

  activePage3Tab = tabName;

  const requestVersion =
    ++page3RequestVersion;

  updatePage3Tabs();

  const panel = document.getElementById(
    "U9-profile-page3-panel"
  );

  if (!panel) return;

  /*
   * Already loaded:
   * render immediately without another request.
   */

  if (
    page3Loaded[tabName] &&
    !options.force
  ) {
    setPage3Status("");
    renderPage3Tab(tabName, panel);
    return;
  }

  /*
   * Keep existing content visible while loading.
   * Only the small status row changes.
   */

  const loadingText = {
    avatar: "Loading avatars…",
    "free-frame": "Loading free frames…",
    "paid-frame": "Loading paid frames…"
  };

  setPage3Status(
    loadingText[tabName],
    "loading"
  );

  try {
    if (tabName === "avatar") {
      await loadFreeAvatars();
    } else if (tabName === "free-frame") {
      await loadFreeFrames();
    } else {
      if (!requirePage3Login(panel)) {
        setPage3Status("");
        return;
      }

      await loadPaidFrames();
    }

    /*
     * If another tab was selected while the request
     * was running, do not let this old request render.
     */

    if (
      requestVersion !== page3RequestVersion ||
      activePage3Tab !== tabName
    ) {
      return;
    }

    page3Loaded[tabName] = true;

    setPage3Status("");

    renderPage3Tab(tabName, panel);
  } catch (error) {
    if (
      requestVersion !== page3RequestVersion ||
      activePage3Tab !== tabName
    ) {
      return;
    }

    console.error(
      "PAGE3 " + tabName.toUpperCase() + " LOAD ERROR:",
      error
    );

    setPage3Status("");

    showPage3Message(
      panel,
      error?.message ||
      "Unable to load this section. Please try again.",
      "error"
    );
  }
}


/* =========================================================
   RENDER CURRENT TAB
========================================================= */

function renderPage3Tab(tabName, panel) {
  if (!panel) return;

  if (tabName === "avatar") {
    renderFreeAvatarsIntoPanel(panel);
  } else if (tabName === "free-frame") {
    renderFreeFramesIntoPanel(panel);
  } else if (tabName === "paid-frame") {
    renderPaidFramesIntoPanel(panel);
  }
}


/* =========================================================
   CREATE CUSTOM AVATAR CARD
========================================================= */

function createSelectAvatarCard() {
  const card = document.createElement("div");
  card.className = "U9-profile-page3-avatar-card";

  const image = document.createElement("img");
  image.className = "U9-profile-page3-avatar-image";

  image.alt = currentCustomAvatarUrl
    ? "Custom Avatar"
    : "Select Avatar";

  image.src =
    currentCustomAvatarUrl ||
    "SSVG/avatar/profile.svg";

  image.onerror = function () {
    if (!image.dataset.fallbackUsed) {
      image.dataset.fallbackUsed = "1";
      image.src = "SSVG/avatar/profile.svg";
    }
  };

  card.appendChild(image);

  const name = document.createElement("div");
  name.className = "U9-profile-page3-avatar-name";

  name.textContent = currentCustomAvatarUrl
    ? "Custom Avatar"
    : "Select Avatar";

  card.appendChild(name);

  const button = document.createElement("button");
  button.type = "button";
  button.className = "U9-profile-page3-avatar-button";

  if (!currentCustomAvatarUrl) {
    button.textContent = "Select Avatar";

    button.addEventListener("click", function () {
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

      alert("Profile picture is not available yet.");
    });
  } else {
    button.dataset.avatarType = "custom";

    const active =
      currentAvatarType === "custom";

    button.textContent = active ? "Using" : "Use";

    if (active) {
      button.classList.add("active");
      button.disabled = true;
    } else {
      button.addEventListener("click", function () {
        setCustomAvatar(
          currentCustomAvatarUrl,
          button
        );
      });
    }
  }

  card.appendChild(button);

  return card;
}


/* =========================================================
   LOAD FREE AVATARS
========================================================= */

async function loadFreeAvatars() {
  if (page3Loaded.avatar) {
    return freeAvatars;
  }

  const result = await fetchPage3Json(
    U9_PROFILE_PAGE3_FREE_AVATAR_API,
    {
      method: "GET",
      cache: "no-store"
    },
    "Failed to load avatars."
  );

  freeAvatars = Array.isArray(result?.avatars)
    ? result.avatars
    : [];

  return freeAvatars;
}


/* =========================================================
   RENDER FREE AVATARS
========================================================= */

function renderFreeAvatarsIntoPanel(panel) {
  if (!panel) return;

  panel.innerHTML = "";

  const list = document.createElement("div");
  list.className = "U9-profile-page3-avatar-list";

  list.appendChild(createSelectAvatarCard());

  freeAvatars.forEach(function (avatar) {
    const card = document.createElement("div");
    card.className = "U9-profile-page3-avatar-card";

    const image = document.createElement("img");
    image.className = "U9-profile-page3-avatar-image";
    image.alt = avatar?.name || "Avatar";

    setPage3ImageSource(
      image,
      avatar?.svg ||
      avatar?.image ||
      avatar?.url
    );

    card.appendChild(image);

    const name = document.createElement("div");
    name.className = "U9-profile-page3-avatar-name";
    name.textContent = avatar?.name || "Avatar";

    card.appendChild(name);

    const button = document.createElement("button");
    button.type = "button";
    button.className = "U9-profile-page3-avatar-button";
    button.dataset.avatarId = avatar?.id || "";

    const active =
      String(currentAvatarId) === String(avatar?.id) &&
      currentAvatarType === "free";

    button.textContent = active ? "Using" : "Use";

    if (active) {
      button.classList.add("active");
      button.disabled = true;
    }

    button.addEventListener("click", function () {
      setFreeAvatar(avatar?.id, button);
    });

    card.appendChild(button);
    list.appendChild(card);
  });

  panel.appendChild(list);
}


/* =========================================================
   SET FREE AVATAR
========================================================= */

async function setFreeAvatar(
  avatarId,
  button
) {
  if (!avatarId) return;

  const token = getPage3Token();

  if (!token) {
    alert("Please log in first.");
    return;
  }

  setPage3ButtonBusy(button, "Processing...");

  try {
    const result = await fetchPage3Json(
      U9_PROFILE_PAGE3_SET_AVATAR_API,
      {
        method: "POST",
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          type: "free",
          avatar_id: avatarId
        })
      },
      "Failed to set avatar."
    );

    currentAvatarId =
      result?.avatar?.id ||
      result?.updatedUser?.avatar_id ||
      avatarId;

    currentAvatarType = "free";

    /*
     * Do not clear currentCustomAvatarUrl.
     * The uploaded avatar should remain saved even when
     * the user switches to a free avatar.
     */

    await refreshProfileAfterChange();

    updateAvatarButtons();

    page3Loaded.avatar = true;

    if (activePage3Tab === "avatar") {
      renderFreeAvatarsIntoPanel(
        document.getElementById(
          "U9-profile-page3-panel"
        )
      );
    }

    console.log("AVATAR SET SUCCESS:", {
      avatarId: currentAvatarId,
      avatarType: currentAvatarType,
      customAvatarUrl: currentCustomAvatarUrl
    });
  } catch (error) {
    console.error("SET AVATAR ERROR:", error);

    alert(
      error?.message ||
      "Failed to set avatar. Please try again later."
    );

    if (button) {
      button.disabled = false;
      button.textContent = "Use";
    }
  } finally {
    if (button) {
      button.classList.remove("loading");
    }
  }
}


/* =========================================================
   SET CUSTOM AVATAR
========================================================= */

async function setCustomAvatar(
  avatarUrl,
  button
) {
  if (!avatarUrl) return;

  const token = getPage3Token();

  if (!token) {
    alert("Please log in first.");
    return;
  }

  setPage3ButtonBusy(button, "Processing...");

  try {
    const result = await fetchPage3Json(
      U9_PROFILE_PAGE3_SET_AVATAR_API,
      {
        method: "POST",
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          type: "custom",
          avatar_url: avatarUrl
        })
      },
      "Failed to use custom avatar."
    );

    currentAvatarType = "custom";
    currentAvatarId = null;
    currentCustomAvatarUrl = String(avatarUrl).trim();

    const returnedUrl = getPage3FirstValue([
      result?.avatar?.custom_url,
      result?.avatar?.avatar_url,
      result?.updatedUser?.avatar_url,
      result?.avatar?.url
    ]);

    if (returnedUrl) {
      currentCustomAvatarUrl =
        String(returnedUrl).trim();
    }

    await refreshProfileAfterChange();

    updateAvatarButtons();

    page3Loaded.avatar = true;

    if (activePage3Tab === "avatar") {
      renderFreeAvatarsIntoPanel(
        document.getElementById(
          "U9-profile-page3-panel"
        )
      );
    }

    console.log("CUSTOM AVATAR SET SUCCESS:", {
      avatarType: currentAvatarType,
      avatarId: currentAvatarId,
      avatarUrl: currentCustomAvatarUrl
    });
  } catch (error) {
    console.error("SET CUSTOM AVATAR ERROR:", error);

    alert(
      error?.message ||
      "Failed to use custom avatar. Please try again later."
    );

    if (button) {
      button.disabled = false;
      button.textContent = "Use";
    }
  } finally {
    if (button) {
      button.classList.remove("loading");
    }
  }
}


/* =========================================================
   UPDATE AVATAR BUTTONS
========================================================= */

function updateAvatarButtons() {
  document
    .querySelectorAll(".U9-profile-page3-avatar-button")
    .forEach(function (button) {
      if (button.dataset.avatarType === "custom") {
        const active =
          currentAvatarType === "custom";

        button.classList.toggle("active", active);

        if (active) {
          button.textContent = "Using";
          button.disabled = true;
        } else if (
          !button.classList.contains("loading")
        ) {
          button.textContent = "Use";
          button.disabled = false;
        }

        return;
      }

      const active =
        currentAvatarType === "free" &&
        String(button.dataset.avatarId) ===
          String(currentAvatarId);

      button.classList.toggle("active", active);
      button.disabled = active;

      if (active) {
        button.textContent = "Using";
      } else if (
        !button.classList.contains("loading")
      ) {
        button.textContent = "Use";
      }
    });
}


/* =========================================================
   LOAD FREE FRAMES
========================================================= */

async function loadFreeFrames() {
  if (page3Loaded["free-frame"]) {
    return freeFrames;
  }

  const result = await fetchPage3Json(
    U9_PROFILE_PAGE3_FREE_FRAME_API,
    {
      method: "GET",
      cache: "no-store"
    },
    "Failed to load free avatar frames."
  );

  freeFrames = Array.isArray(result?.frames)
    ? result.frames
    : [];

  return freeFrames;
}


/* =========================================================
   LOAD PAID FRAMES
========================================================= */

async function loadPaidFrames() {
  const token = getPage3Token();

  if (!token) {
    throw new Error(
      "Please log in to view paid avatar frames."
    );
  }

  const result = await fetchPage3Json(
    U9_PROFILE_PAGE3_PAID_FRAME_API,
    {
      method: "GET",
      headers: {
        Authorization: "Bearer " + token
      },
      cache: "no-store"
    },
    "Failed to load paid avatar frames."
  );

  paidFrames = Array.isArray(result?.frames)
    ? result.frames
    : [];

  return paidFrames;
}


/* =========================================================
   RENDER FREE FRAMES
========================================================= */

function renderFreeFramesIntoPanel(panel) {
  if (!panel) return;

  panel.innerHTML = "";

  if (!freeFrames.length) {
    showPage3Message(
      panel,
      "No free avatar frames available.",
      "empty"
    );

    return;
  }

  const list = document.createElement("div");
  list.className = "U9-profile-page3-frame-list";

  freeFrames.forEach(function (frame) {
    list.appendChild(
      createFrameCard(frame, "free")
    );
  });

  panel.appendChild(list);
}


/* =========================================================
   RENDER PAID FRAMES
========================================================= */

function renderPaidFramesIntoPanel(panel) {
  if (!panel) return;

  panel.innerHTML = "";

  if (!paidFrames.length) {
    showPage3Message(
      panel,
      "No paid avatar frames available.",
      "empty"
    );

    return;
  }

  const list = document.createElement("div");
  list.className = "U9-profile-page3-frame-list";

  paidFrames.forEach(function (frame) {
    list.appendChild(
      createFrameCard(frame, "paid")
    );
  });

  panel.appendChild(list);
}


/* =========================================================
   CREATE FRAME CARD
========================================================= */

function createFrameCard(
  frame,
  frameType
) {
  const card = document.createElement("div");
  card.className = "U9-profile-page3-frame-card";
  card.dataset.frameId = frame?.id || "";

  const image = document.createElement("img");
  image.className = "U9-profile-page3-frame-image";
  image.alt = frame?.name || "Avatar Frame";

  setPage3ImageSource(
    image,
    frame?.svg ||
    frame?.image ||
    frame?.url
  );

  card.appendChild(image);

  const name = document.createElement("div");
  name.className = "U9-profile-page3-frame-name";
  name.textContent = frame?.name || "Avatar Frame";

  card.appendChild(name);

  if (frameType === "paid") {
    const price = document.createElement("div");
    price.className = "U9-profile-page3-frame-price";

    const coins = Number(frame?.coins_price);

    price.textContent = Number.isFinite(coins)
      ? coins + " Coins"
      : "Paid Avatar Frame";

    card.appendChild(price);
  }

  const button = document.createElement("button");

  button.type = "button";
  button.className = "U9-profile-page3-frame-button";
  button.dataset.frameId = frame?.id || "";
  button.dataset.frameType = frameType;

  const equipped =
    currentFrameType === frameType &&
    String(currentFrameId) === String(frame?.id);

  if (equipped) {
    button.textContent = "Using";
    button.classList.add("active");
    button.disabled = true;
  } else if (frameType === "free") {
    button.textContent = "Use";

    button.addEventListener("click", function () {
      equipFrame("free", frame?.id, button);
    });
  } else {
    const owned =
      frame?.owned === true ||
      frame?.purchased === true ||
      frame?.is_owned === true;

    if (owned) {
      button.textContent = "Use";
      button.classList.add("use");

      button.addEventListener("click", function () {
        equipFrame("paid", frame?.id, button);
      });
    } else {
      const coins = Number(frame?.coins_price);

      button.textContent = Number.isFinite(coins)
        ? "Buy " + coins
        : "Buy";

      button.classList.add("buy");

      button.addEventListener("click", function () {
        purchasePaidFrame(frame?.id, button);
      });
    }
  }

  card.appendChild(button);

  return card;
}


/* =========================================================
   BUTTON LOADING
========================================================= */

function setPage3ButtonBusy(
  button,
  label
) {
  if (!button) return;

  button.classList.add("loading");
  button.disabled = true;
  button.textContent = label;
}


/* =========================================================
   UPDATE FRAME BUTTONS
========================================================= */

function updateFrameButtons() {
  document
    .querySelectorAll(".U9-profile-page3-frame-button")
    .forEach(function (button) {
      const active =
        currentFrameType === button.dataset.frameType &&
        String(currentFrameId) ===
          String(button.dataset.frameId);

      button.classList.toggle("active", active);

      if (active) {
        button.textContent = "Using";
        button.disabled = true;
      }
    });
}


/* =========================================================
   EQUIP FRAME
========================================================= */

async function equipFrame(
  frameType,
  frameId,
  button
) {
  if (!frameId) return;

  const token = getPage3Token();

  if (!token) {
    alert("Please log in first.");
    return;
  }

  setPage3ButtonBusy(button, "Processing...");

  try {
    const result = await fetchPage3Json(
      U9_PROFILE_PAGE3_EQUIP_FRAME_API,
      {
        method: "POST",
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          frame_type: frameType,
          frame_id: frameId
        })
      },
      "Failed to equip avatar frame."
    );

    currentFrameType = frameType;

    currentFrameId =
      result?.frame?.id ||
      result?.updatedUser?.avatar_frame_id ||
      frameId;

    await refreshProfileAfterChange();

    updateFrameButtons();

    if (activePage3Tab === "free-frame") {
      renderFreeFramesIntoPanel(
        document.getElementById(
          "U9-profile-page3-panel"
        )
      );
    } else if (activePage3Tab === "paid-frame") {
      /*
       * Refresh the paid-frame list so the equipped state
       * and ownership state can be checked again.
       */

      page3Loaded["paid-frame"] = false;

      await switchPage3Tab(
        "paid-frame",
        { force: true }
      );
    }

    console.log("FRAME EQUIPPED:", {
      frameType: currentFrameType,
      frameId: currentFrameId
    });
  } catch (error) {
    console.error("EQUIP FRAME ERROR:", error);

    alert(
      error?.message ||
      "Failed to equip avatar frame. Please try again later."
    );

    if (button) {
      button.disabled = false;
      button.textContent = "Use";
    }
  } finally {
    if (button) {
      button.classList.remove("loading");
    }
  }
}


/* =========================================================
   PURCHASE PAID FRAME
========================================================= */

async function purchasePaidFrame(
  frameId,
  button
) {
  if (!frameId) return;

  const token = getPage3Token();

  if (!token) {
    alert("Please log in first.");
    return;
  }

  const frame = paidFrames.find(function (item) {
    return String(item?.id) === String(frameId);
  });

  if (!frame) {
    alert("Avatar frame not found.");
    return;
  }

  const price = Number(frame?.coins_price);

  const confirmMessage = Number.isFinite(price)
    ? 'Are you sure you want to purchase "' +
      (frame?.name || "Avatar Frame") +
      '"?\nIt costs ' + price + " Coins."
    : 'Are you sure you want to purchase "' +
      (frame?.name || "Avatar Frame") +
      '"?';

  if (!window.confirm(confirmMessage)) {
    return;
  }

  setPage3ButtonBusy(button, "Purchasing...");

  try {
    await fetchPage3Json(
      U9_PROFILE_PAGE3_PURCHASE_FRAME_API,
      {
        method: "POST",
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          frame_id: frameId
        })
      },
      "Failed to purchase avatar frame."
    );

    /*
     * Refresh profile data after the purchase.
     * The server remains the source of truth for ownership
     * and the user's coin balance.
     */

    await refreshProfileAfterChange();

    console.log(
      "FRAME PURCHASE SUCCESS:",
      frameId
    );

    /*
     * Preserve the original behavior:
     * purchase -> automatically equip.
     */

    await equipFrame(
      "paid",
      frameId,
      null
    );

    /*
     * Reload the paid-frame list from the server so the
     * ownership state is not based only on local changes.
     */

    page3Loaded["paid-frame"] = false;

    await loadPaidFrames();

    page3Loaded["paid-frame"] = true;

    const panel = document.getElementById(
      "U9-profile-page3-panel"
    );

    if (
      panel &&
      activePage3Tab === "paid-frame"
    ) {
      renderPaidFramesIntoPanel(panel);
    }
  } catch (error) {
    console.error(
      "PURCHASE FRAME ERROR:",
      error
    );

    alert(
      error?.message ||
      "Failed to purchase avatar frame. Please try again later."
    );

    if (button) {
      button.disabled = false;

      button.textContent = Number.isFinite(price)
        ? "Buy " + price
        : "Buy";
    }
  } finally {
    if (button) {
      button.classList.remove("loading");
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
    createPage3UI();

    setPage3Status(
      "Loading your profile settings…",
      "loading"
    );

    /*
     * Refresh the current user first, if this method exists.
     */

    if (
      window.U9User &&
      typeof window.U9User.refresh === "function"
    ) {
      const user = await window.U9User.refresh();

      if (user) {
        loadCurrentEquipment(user);
      } else {
        loadCurrentEquipment();
      }
    } else {
      loadCurrentEquipment();
    }

    /*
     * Display the default Avatar tab.
     */

    await switchPage3Tab("avatar");

    console.log("PROFILE PAGE 3 LOADED");
  } catch (error) {
    console.error(
      "PROFILE PAGE 3 LOAD ERROR:",
      error
    );

    setPage3Status("");

    showPage3Message(
      document.getElementById(
        "U9-profile-page3-panel"
      ),
      error?.message ||
      "Unable to load profile settings. Please refresh and try again.",
      "error"
    );
  }
}


/* =========================================================
   PUBLIC REFRESH METHOD
========================================================= */

window.U9ProfilePage3 =
  window.U9ProfilePage3 || {};

window.U9ProfilePage3.refresh = async function () {
  page3Loaded.avatar = false;
  page3Loaded["free-frame"] = false;
  page3Loaded["paid-frame"] = false;

  freeAvatars = [];
  freeFrames = [];
  paidFrames = [];

  try {
    if (
      window.U9User &&
      typeof window.U9User.refresh === "function"
    ) {
      const user = await window.U9User.refresh();

      if (user) {
        loadCurrentEquipment(user);
      } else {
        loadCurrentEquipment();
      }
    } else {
      loadCurrentEquipment();
    }

    await switchPage3Tab(
      activePage3Tab,
      { force: true }
    );
  } catch (error) {
    console.error(
      "PROFILE PAGE 3 REFRESH ERROR:",
      error
    );

    throw error;
  }
};


/* =========================================================
   INIT
========================================================= */

if (document.readyState === "loading") {
  document.addEventListener(
    "DOMContentLoaded",
    loadProfilePage3,
    { once: true }
  );
} else {
  loadProfilePage3();
}
