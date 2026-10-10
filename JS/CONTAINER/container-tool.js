

/* =========================
   CONTAINER TOOL
========================= */

const tool =
  document.getElementById(
    "U9-page-container-tool"
  );

const menuButton =
  document.getElementById(
    "U9-page-container-tool-menu"
  );


/* =========================
   HEADER TOOL TOGGLE
========================= */

// 注意：使用独立变量名，避免与 header.js 冲突
const containerToolHeaderToggle =
  document.getElementById(
    "U9-page-header-tool-toggle"
  );

if (tool) {
  // 工具栏默认展开
  tool.classList.remove(
    "container-tool-collapsed"
  );

  // 默认显示 PAGE MENU
  tool.classList.add(
    "menu-open"
  );
}

if (
  containerToolHeaderToggle &&
  tool
) {
  containerToolHeaderToggle.textContent = "˄";

  containerToolHeaderToggle.setAttribute(
    "aria-expanded",
    "true"
  );

  containerToolHeaderToggle.setAttribute(
    "aria-label",
    "Hide toolbar"
  );

  containerToolHeaderToggle.addEventListener(
    "click",
    function () {
      const collapsed =
        tool.classList.toggle(
          "container-tool-collapsed"
        );

      const homePage =
        document.getElementById("U9-page-home");

      if (homePage) {
        homePage.classList.toggle(
          "home-toolbar-collapsed",
          collapsed
        );
      }

      const shopPage =
        document.getElementById("U9-page-shop");

      if (shopPage) {
        shopPage.classList.toggle(
          "shop-toolbar-collapsed",
          collapsed
        );
      }

      const auctionPage =
        document.getElementById("U9-page-auction");

      if (auctionPage) {
        auctionPage.classList.toggle(
          "auction-toolbar-collapsed",
          collapsed
        );
      }

      const test1Page =
        document.getElementById("U9-page-test1");

      if (test1Page) {
        test1Page.classList.toggle(
          "test1-toolbar-collapsed",
          collapsed
        );
      }

      const test2Page =
        document.getElementById("U9-page-test2");

      if (test2Page) {
        test2Page.classList.toggle(
          "test2-toolbar-collapsed",
          collapsed
        );
      }

      const historyModal =
        document.getElementById(
          "U9-history-normal-modal"
        );

      if (historyModal) {
        historyModal.classList.toggle(
          "history-toolbar-collapsed",
          collapsed
        );
      }

      const giftModal =
        document.getElementById(
          "U9-gift-normal-modal"
        );

      if (giftModal) {
        giftModal.classList.toggle(
          "gift-toolbar-collapsed",
          collapsed
        );
      }

      const inboxModal =
        document.getElementById(
          "U9-inbox-normal-modal"
        );

      if (inboxModal) {
        inboxModal.classList.toggle(
          "inbox-toolbar-collapsed",
          collapsed
        );
      }

      const messageModal =
        document.getElementById(
          "U9-message-normal-modal"
        );

      if (messageModal) {
        messageModal.classList.toggle(
          "message-toolbar-collapsed",
          collapsed
        );
      }
      containerToolHeaderToggle.textContent =
        collapsed ? "˅" : "˄";

      containerToolHeaderToggle.setAttribute(
        "aria-expanded",
        String(!collapsed)
      );

      containerToolHeaderToggle.setAttribute(
        "aria-label",
        collapsed
          ? "Show toolbar"
          : "Hide toolbar"
      );
    }
  );
}


/* =========================
   PROFILE BUTTON
========================= */

const profileButton =
  document.getElementById(
    "U9-page-container-tool-profile"
  );


/* =========================
   NORMAL TOOL BUTTONS
========================= */

const messageButton =
  document.getElementById(
    "U9-page-container-tool-message"
  );

const inboxButton =
  document.getElementById(
    "U9-page-container-tool-inbox"
  );

const giftButton =
  document.getElementById(
    "U9-page-container-tool-gift"
  );

const historyButton =
  document.getElementById(
    "U9-page-container-tool-history"
  );


/* =========================
   PAGE BUTTONS
========================= */

const homeButton =
  document.getElementById(
    "U9-page-container-tool-home"
  );

const shopButton =
  document.getElementById(
    "U9-page-container-tool-shop-page"
  );

const auctionButton =
  document.getElementById(
    "U9-page-container-tool-auction"
  );

const test1Button =
  document.getElementById(
    "U9-page-container-tool-test1"
  );

const test2Button =
  document.getElementById(
    "U9-page-container-tool-test2"
  );


/* =========================
   PAGE ARROWS
========================= */

const pagePrevButton =
  document.getElementById(
    "U9-page-container-tool-pages-prev"
  );

const pageNextButton =
  document.getElementById(
    "U9-page-container-tool-pages-next"
  );


/* =========================
   WINDOW MANAGER
========================= */

function getWindowManager() {
  return window.U9WindowManager || null;
}


/* =========================
   CLOSE CURRENT WINDOW
========================= */

async function closeCurrentWindow() {
  const manager =
    getWindowManager();

  if (!manager) {
    return true;
  }

  return await manager.closeCurrent();
}


/* =========================
   OPEN WINDOW
========================= */

async function openContainerWindow(
  windowName
) {
  const manager =
    getWindowManager();

  if (!manager) {
    return false;
  }

  return await manager.open(
    windowName
  );
}


/* =========================
   TOOL BUTTON ANIMATION
========================= */

function playToolAnimation(
  button,
  animation
) {
  if (
    !button ||
    !animation
  ) {
    return;
  }

  button.classList.remove(
    animation
  );

  void button.offsetWidth;

  button.classList.add(
    animation
  );
}


/* =========================
   MESSAGE BUTTON
========================= */

if (messageButton) {
  messageButton.addEventListener(
    "click",
    function () {
      playToolAnimation(
        messageButton,
        "message-bounce"
      );

      openContainerWindow(
        "message"
      );
    }
  );
}


/* =========================
   INBOX BUTTON
========================= */

if (inboxButton) {
  inboxButton.addEventListener(
    "click",
    function () {
      playToolAnimation(
        inboxButton,
        "inbox-shake"
      );

      openContainerWindow(
        "inbox"
      );
    }
  );
}


/* =========================
   GIFT BUTTON
========================= */

if (giftButton) {
  giftButton.addEventListener(
    "click",
    function () {
      playToolAnimation(
        giftButton,
        "gift-bounce"
      );

      openContainerWindow(
        "gift"
      );
    }
  );
}


/* =========================
   HISTORY BUTTON
========================= */

if (historyButton) {
  historyButton.addEventListener(
    "click",
    function () {
      playToolAnimation(
        historyButton,
        "history-shake"
      );

      openContainerWindow(
        "history"
      );
    }
  );
}


/* =========================
   MENU
========================= */

if (menuButton) {
  menuButton.addEventListener(
    "click",
    async function () {
      const manager =
        getWindowManager();

      /*
         If a Window is open,
         close it first.
      */

      if (
        manager &&
        manager.getCurrent()
      ) {
        const closed =
          await closeCurrentWindow();

        if (!closed) {
          return;
        }
      }

      /*
         Open / close menu
      */

      if (tool) {
        tool.classList.toggle(
          "menu-open"
        );
      }

      /*
         Menu animation
      */

      menuButton.classList.remove(
        "menu-heartbeat"
      );

      void menuButton.offsetWidth;

      menuButton.classList.add(
        "menu-heartbeat"
      );
    }
  );
}


/* =========================
   PROFILE
========================= */

/*
   Logged in:
   → Open Profile Window

   Not logged in:
   → Open Login Modal
*/

async function openProfileFromContainerTool() {
  /*
     Check U9 user state
  */

  if (
    window.U9User &&
    typeof window.U9User.isLoggedIn ===
      "function"
  ) {
    const loggedIn =
      window.U9User.isLoggedIn();

    /*
       NOT LOGGED IN
    */

    if (!loggedIn) {
      /*
         Prefer the existing
         Login Modal function.
      */

      if (
        typeof window.openLoginModal ===
        "function"
      ) {
        window.openLoginModal();
        return;
      }

      /*
         Fallback:
         click the existing Header
         Login button.
      */

      const loginButton =
        document.getElementById(
          "U9-page-header-login"
        );

      if (loginButton) {
        loginButton.click();
      }

      return;
    }
  }

  /*
     LOGGED IN
     → Open Profile Window
  */

  const manager =
    getWindowManager();

  if (!manager) {
    return;
  }

  await manager.open(
    "profile"
  );
}


/* =========================
   PROFILE BUTTON EVENT
========================= */

if (profileButton) {
  profileButton.addEventListener(
    "click",
    function () {
      openProfileFromContainerTool();
    }
  );
}


/* =========================
   PAGE WINDOW
========================= */

let pageWindowStart = 0;

const pageWindowSize = 3;


/* =========================
   PAGE BUTTON LIST
========================= */

const pageButtons = [
  homeButton,
  shopButton,
  auctionButton,
  test1Button,
  test2Button
];


/* =========================
   ACTIVE PAGE BUTTON
========================= */

function setActivePageButton(
  activeButton
) {
  pageButtons.forEach(
    function (button) {
      if (!button) {
        return;
      }

      button.classList.remove(
        "active"
      );
    }
  );

  if (activeButton) {
    activeButton.classList.add(
      "active"
    );
  }
}


/* =========================
   RENDER PAGE WINDOW
========================= */

function renderPageWindow() {
  pageButtons.forEach(
    function (
      button,
      index
    ) {
      if (!button) {
        return;
      }

      const visible =
        index >= pageWindowStart &&
        index <
          pageWindowStart +
          pageWindowSize;

      button.style.display =
        visible
          ? "flex"
          : "none";
    }
  );
}


/* =========================
   OPEN HOME PAGE
========================= */

if (homeButton) {
  homeButton.addEventListener(
    "click",
    async function () {
      const manager =
        getWindowManager();

      if (
        manager &&
        manager.getCurrent()
      ) {
        const closed =
          await closeCurrentWindow();

        if (!closed) {
          return;
        }
      }

      if (
        typeof window.openHomePage !==
        "function"
      ) {
        return;
      }

      setActivePageButton(
        homeButton
      );

      window.openHomePage();
    }
  );
}


/* =========================
   OPEN SHOP PAGE
========================= */

if (shopButton) {
  shopButton.addEventListener(
    "click",
    async function () {
      const manager =
        getWindowManager();

      if (
        manager &&
        manager.getCurrent()
      ) {
        const closed =
          await closeCurrentWindow();

        if (!closed) {
          return;
        }
      }

      if (
        typeof window.openShopPage !==
        "function"
      ) {
        return;
      }

      setActivePageButton(
        shopButton
      );

      window.openShopPage();
    }
  );
}


/* =========================
   OPEN AUCTION PAGE
========================= */

if (auctionButton) {
  auctionButton.addEventListener(
    "click",
    async function () {
      const manager =
        getWindowManager();

      if (
        manager &&
        manager.getCurrent()
      ) {
        const closed =
          await closeCurrentWindow();

        if (!closed) {
          return;
        }
      }

      if (
        typeof window.openAuctionPage !==
        "function"
      ) {
        return;
      }

      setActivePageButton(
        auctionButton
      );

      window.openAuctionPage();
    }
  );
}


/* =========================
   OPEN TEST 1 PAGE
========================= */

if (test1Button) {
  test1Button.addEventListener(
    "click",
    async function () {
      const manager =
        getWindowManager();

      if (
        manager &&
        manager.getCurrent()
      ) {
        const closed =
          await closeCurrentWindow();

        if (!closed) {
          return;
        }
      }

      if (
        typeof window.openTest1Page !==
        "function"
      ) {
        return;
      }

      setActivePageButton(
        test1Button
      );

      window.openTest1Page();
    }
  );
}


/* =========================
   OPEN TEST 2 PAGE
========================= */

if (test2Button) {
  test2Button.addEventListener(
    "click",
    async function () {
      const manager =
        getWindowManager();

      if (
        manager &&
        manager.getCurrent()
      ) {
        const closed =
          await closeCurrentWindow();

        if (!closed) {
          return;
        }
      }

      if (
        typeof window.openTest2Page !==
        "function"
      ) {
        return;
      }

      setActivePageButton(
        test2Button
      );

      window.openTest2Page();
    }
  );
}


/* =========================
   INITIAL PAGE WINDOW
========================= */

renderPageWindow();


/* =========================
   INITIAL ACTIVE PAGE
========================= */

setActivePageButton(
  homeButton
);


/* =========================
   NEXT PAGE WINDOW
========================= */

if (pageNextButton) {
  pageNextButton.addEventListener(
    "click",
    function () {
      if (
        pageWindowStart <
        pageButtons.length -
          pageWindowSize
      ) {
        pageWindowStart++;

        renderPageWindow();
      }
    }
  );
}


/* =========================
   PREVIOUS PAGE WINDOW
========================= */

if (pagePrevButton) {
  pagePrevButton.addEventListener(
    "click",
    function () {
      if (pageWindowStart > 0) {
        pageWindowStart--;

        renderPageWindow();
      }
    }
  );
}
