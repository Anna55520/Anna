
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


  if (
    !manager
  ) {

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


  if (
    !manager
  ) {

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

if (
  messageButton
) {

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

if (
  inboxButton
) {

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

if (
  giftButton
) {

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

if (
  historyButton
) {

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

if (
  menuButton
) {

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


        if (
          !closed
        ) {

          return;

        }

      }


      /*
         Open / close menu
      */

      if (
        tool
      ) {

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
   PROFILE MODAL
========================= */

async function openProfileFromContainerTool() {

  const manager =
    getWindowManager();


  if (
    !manager
  ) {

    return;

  }


  await manager.open(
    "profile"
  );

}


/* =========================
   PROFILE BUTTON
========================= */

if (
  profileButton
) {

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

      if (
        !button
      ) {

        return;

      }


      button.classList.remove(
        "active"
      );

    }
  );


  if (
    activeButton
  ) {

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

      if (
        !button
      ) {

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

if (
  homeButton
) {

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


        if (
          !closed
        ) {

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

if (
  shopButton
) {

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


        if (
          !closed
        ) {

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

if (
  auctionButton
) {

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


        if (
          !closed
        ) {

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

if (
  test1Button
) {

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


        if (
          !closed
        ) {

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

if (
  test2Button
) {

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


        if (
          !closed
        ) {

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

if (
  pageNextButton
) {

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

if (
  pagePrevButton
) {

  pagePrevButton.addEventListener(
    "click",
    function () {

      if (
        pageWindowStart >
        0
      ) {

        pageWindowStart--;

        renderPageWindow();

      }

    }
  );

}
