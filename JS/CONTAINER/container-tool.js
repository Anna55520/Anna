
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
   NORMAL MODALS
========================= */

const normalModals = [

  {
    modal:
      document.getElementById(
        "U9-message-normal-modal"
      ),

    content:
      document.getElementById(
        "U9-message-normal-modal-content"
      ),

    close:
      document.getElementById(
        "U9-message-normal-modal-close"
      ),

    button:
      document.getElementById(
        "U9-page-container-tool-message"
      ),

    animation:
      "message-bounce",

    open:
      "openMessageModal"

  },

  {
    modal:
      document.getElementById(
        "U9-inbox-normal-modal"
      ),

    content:
      document.getElementById(
        "U9-inbox-normal-modal-content"
      ),

    close:
      document.getElementById(
        "U9-inbox-normal-modal-close"
      ),

    button:
      document.getElementById(
        "U9-page-container-tool-inbox"
      ),

    animation:
      "inbox-shake",

    open:
      "openInboxModal"

  },

  {
    modal:
      document.getElementById(
        "U9-gift-normal-modal"
      ),

    content:
      document.getElementById(
        "U9-gift-normal-modal-content"
      ),

    close:
      document.getElementById(
        "U9-gift-normal-modal-close"
      ),

    button:
      document.getElementById(
        "U9-page-container-tool-gift"
      ),

    animation:
      "gift-bounce",

    open:
      "openGiftModal"

  },

  {
    modal:
      document.getElementById(
        "U9-history-normal-modal"
      ),

    content:
      document.getElementById(
        "U9-history-normal-modal-content"
      ),

    close:
      document.getElementById(
        "U9-history-normal-modal-close"
      ),

    button:
      document.getElementById(
        "U9-page-container-tool-history"
      ),

    animation:
      "history-shake",

    open:
      "openHistoryModal"

  }

];


/* =========================
   NORMAL MODAL STATE
========================= */

let normalModalActionRunning =
  false;


/* =========================
   GET ACTIVE NORMAL MODAL
========================= */

function getActiveNormalModal() {

  return normalModals.find(
    function (item) {

      return (
        item.modal &&
        (
          item.modal.classList.contains(
            "modal-open"
          ) ||

          item.modal.classList.contains(
            "modal-closing"
          )
        )
      );

    }
  );

}


/* =========================
   WAIT FOR MODAL CLOSE
========================= */

function waitForNormalModalClose(
  item,
  callback
) {

  if (
    !item ||
    !item.content
  ) {

    callback();

    return;

  }


  let finished =
    false;


  function finish() {

    if (
      finished
    ) {

      return;

    }


    finished =
      true;


    item.content.removeEventListener(
      "transitionend",
      handleTransitionEnd
    );


    callback();

  }


  function handleTransitionEnd(
    event
  ) {

    if (
      event.propertyName !==
      "transform"
    ) {

      return;

    }


    finish();

  }


  item.content.addEventListener(
    "transitionend",
    handleTransitionEnd
  );


  setTimeout(
    function () {

      finish();

    },
    500
  );

}


/* =========================
   CLOSE ACTIVE MODAL
========================= */

function closeActiveNormalModal(
  callback
) {

  const activeModal =
    getActiveNormalModal();


  if (
    !activeModal
  ) {

    callback();

    return;

  }


  /*
     ALREADY CLOSING

     Wait for the existing
     closing animation.
  */

  if (
    activeModal.modal.classList.contains(
      "modal-closing"
    )
  ) {

    waitForNormalModalClose(
      activeModal,
      callback
    );

    return;

  }


  /*
     CLOSE USING THE MODAL'S
     OWN CLOSE BUTTON
  */

  if (
    activeModal.close
  ) {

    activeModal.close.click();

  }


  waitForNormalModalClose(
    activeModal,
    callback
  );

}


/* =========================
   PLAY NORMAL TOOL ANIMATION
========================= */

function playNormalToolAnimation(
  item
) {

  if (
    !item ||
    !item.button ||
    !item.animation
  ) {

    return;

  }


  item.button.classList.remove(
    item.animation
  );


  void item.button.offsetWidth;


  item.button.classList.add(
    item.animation
  );

}


/* =========================
   OPEN NORMAL MODAL
========================= */

function openNormalModal(
  target
) {

  if (
    !target ||
    !target.open
  ) {

    return;

  }


  const openFunction =
    window[target.open];


  if (
    typeof openFunction !==
    "function"
  ) {

    return;

  }


  openFunction();

}


/* =========================
   SWITCH NORMAL MODAL
========================= */

function switchNormalModal(
  target
) {

  if (
    normalModalActionRunning
  ) {

    return;

  }


  normalModalActionRunning =
    true;


  closeActiveNormalModal(
    function () {

      openNormalModal(
        target
      );


      normalModalActionRunning =
        false;

    }
  );

}


/* =========================
   NORMAL MODAL BUTTONS
========================= */

normalModals.forEach(
  function (item) {

    if (
      !item.button
    ) {

      return;

    }


    item.button.addEventListener(
      "click",
      function (event) {


        /* =========================
           TOOL ICON ANIMATION
        ========================= */

        playNormalToolAnimation(
          item
        );


        const activeModal =
          getActiveNormalModal();


        /*
           No modal is open.

           Open this modal directly.
        */

        if (
          !activeModal
        ) {

          openNormalModal(
            item
          );

          return;

        }


        /*
           The current modal is already
           the requested modal.

           Do nothing.
        */

        if (
          activeModal.button ===
          item.button
        ) {

          return;

        }


        /*
           Another modal is open.

           Stop the normal click
           and switch modal.
        */

        event.preventDefault();

        event.stopImmediatePropagation();


        switchNormalModal(
          item
        );

      }
    );

  }
);


/* =========================
   MENU
========================= */

if (
  menuButton
) {

  menuButton.addEventListener(
    "click",
    function (event) {


      /*
         If a normal modal is open,
         close it first.

         Then open the menu.
      */

      const activeModal =
        getActiveNormalModal();


      if (
        activeModal &&
        !normalModalActionRunning
      ) {

        event.preventDefault();

        event.stopImmediatePropagation();


        normalModalActionRunning =
          true;


        closeActiveNormalModal(
          function () {


            tool.classList.add(
              "menu-open"
            );


            /*
               MENU ANIMATION
            */

            menuButton.classList.remove(
              "menu-heartbeat"
            );


            void menuButton.offsetWidth;


            menuButton.classList.add(
              "menu-heartbeat"
            );


            normalModalActionRunning =
              false;

          }
        );


        return;

      }


      /*
         Normal menu behavior
         when no modal is open.
      */

      tool.classList.toggle(
        "menu-open"
      );


      menuButton.classList.remove(
        "menu-heartbeat"
      );


      void menuButton.offsetWidth;


      menuButton.classList.add(
        "menu-heartbeat"
      );

    },
    true
  );

}


/* =========================
   PROFILE MODAL
========================= */

function openProfileFromContainerTool() {

  if (
    typeof window.openProfileModal !==
    "function"
  ) {

    return;

  }


  window.openProfileModal();

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
    function () {

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
    function () {

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
    function () {

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
    function () {

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
    function () {

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