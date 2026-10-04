
/* =========================
   U9 WINDOW MANAGER
========================= */


/* =========================
   WINDOW REGISTRY
========================= */

const u9Windows =
  new Map();


/* =========================
   CURRENT WINDOW
========================= */

let currentWindow =
  null;


/* =========================
   ACTION LOCK
========================= */

let windowActionRunning =
  false;


/* =========================
   PAGE SCROLL LOCK
========================= */

/*
   Window Manager is the ONLY
   place that controls page
   scroll locking.

   Individual windows must NOT
   unlock the page themselves.

   This prevents:

   Window A
      ↓
   unlock
      ↓
   Window B
      ↓
   lock

   which can cause a visual
   flash / layout reflow.
*/

let windowScrollLocked =
  false;


function lockWindowPageScroll() {

  if (
    windowScrollLocked
  ) {

    return;

  }


  document.documentElement.style.overflow =
    "hidden";


  document.body.style.overflow =
    "hidden";


  windowScrollLocked =
    true;

}


function unlockWindowPageScroll() {

  if (
    !windowScrollLocked
  ) {

    return;

  }


  document.documentElement.style.overflow =
    "";


  document.body.style.overflow =
    "";


  windowScrollLocked =
    false;

}


/* =========================
   REGISTER WINDOW
========================= */

function registerWindow(
  name,
  config = {}
) {

  if (
    !name
  ) {

    console.error(
      "U9WindowManager: Window name is required."
    );

    return false;

  }


  u9Windows.set(
    name,
    {

      name,

      open:
        typeof config.open ===
        "function"
          ? config.open
          : null,

      close:
        typeof config.close ===
        "function"
          ? config.close
          : null,

      isOpen:
        typeof config.isOpen ===
        "function"
          ? config.isOpen
          : null,

      canOpen:
        typeof config.canOpen ===
        "function"
          ? config.canOpen
          : null

    }
  );


  return true;

}


/* =========================
   UNREGISTER WINDOW
========================= */

function unregisterWindow(
  name
) {

  if (
    !u9Windows.has(
      name
    )
  ) {

    return false;

  }


  if (
    currentWindow ===
    name
  ) {

    return false;

  }


  return u9Windows.delete(
    name
  );

}


/* =========================
   GET WINDOW
========================= */

function getWindow(
  name
) {

  return (
    u9Windows.get(
      name
    ) ||
    null
  );

}


/* =========================
   CHECK WINDOW OPEN
========================= */

function isWindowOpen(
  name
) {

  const windowConfig =
    getWindow(
      name
    );


  if (
    !windowConfig
  ) {

    return false;

  }


  if (
    typeof windowConfig.isOpen ===
    "function"
  ) {

    try {

      return !!windowConfig.isOpen();

    }

    catch (
      error
    ) {

      console.error(
        `U9WindowManager: isOpen failed for "${name}".`,
        error
      );

      return false;

    }

  }


  return (
    currentWindow ===
    name
  );

}


/* =========================
   FIND CURRENT OPEN WINDOW
========================= */

function findCurrentWindow() {

  /*
     Prefer the currentWindow
     reference first.

     A window can still be in
     modal-closing state while
     another window is being
     opened.
  */

  if (
    currentWindow &&
    isWindowOpen(
      currentWindow
    )
  ) {

    return currentWindow;

  }


  /*
     Search registered windows
     when currentWindow is not
     available.
  */

  for (
    const [
      name,
      windowConfig
    ]
    of u9Windows
  ) {

    if (
      typeof windowConfig.isOpen ===
      "function"
    ) {

      try {

        if (
          windowConfig.isOpen()
        ) {

          currentWindow =
            name;

          return name;

        }

      }

      catch (
        error
      ) {

        console.error(
          `U9WindowManager: Failed to check "${name}".`,
          error
        );

      }

    }

  }


  currentWindow =
    null;


  return null;

}


/* =========================
   GET CURRENT WINDOW
========================= */

function getCurrentWindow() {

  return findCurrentWindow();

}


/* =========================
   WAIT
========================= */

function wait(
  milliseconds
) {

  return new Promise(
    resolve => {

      setTimeout(
        resolve,
        milliseconds
      );

    }
  );

}


/* =========================
   WAIT FOR WINDOW CLOSE
========================= */

async function waitForWindowClose(
  name,
  timeout = 700
) {

  const windowConfig =
    getWindow(
      name
    );


  if (
    !windowConfig
  ) {

    return true;

  }


  if (
    typeof windowConfig.isOpen !==
    "function"
  ) {

    await wait(
      50
    );

    return true;

  }


  if (
    !windowConfig.isOpen()
  ) {

    return true;

  }


  const startTime =
    Date.now();


  while (
    Date.now() -
      startTime <
    timeout
  ) {

    await wait(
      20
    );


    try {

      if (
        !windowConfig.isOpen()
      ) {

        return true;

      }

    }

    catch (
      error
    ) {

      console.error(
        `U9WindowManager: Close check failed for "${name}".`,
        error
      );

      return true;

    }

  }


  return !isWindowOpen(
    name
  );

}


/* =========================
   CLOSE WINDOW
========================= */

async function closeWindow(
  name,
  options = {}
) {

  const windowConfig =
    getWindow(
      name
    );


  if (
    !windowConfig
  ) {

    return true;

  }


  /*
     Already closed.
  */

  if (
    !isWindowOpen(
      name
    )
  ) {

    if (
      currentWindow ===
      name
    ) {

      currentWindow =
        null;

    }


    return true;

  }


  if (
    typeof windowConfig.close !==
    "function"
  ) {

    console.warn(
      `U9WindowManager: "${name}" has no close function.`
    );


    return false;

  }


  try {

    /*
       Tell the page that a
       Window is still active.

       Never unlock here when
       another Window is going
       to open.
    */

    lockWindowPageScroll();


    const result =
      windowConfig.close();


    if (
      result &&
      typeof result.then ===
      "function"
    ) {

      await result;

    }


    /*
       When this is a normal
       standalone close, wait
       for the CSS animation.
    */

    if (
      options.waitForAnimation !==
      false
    ) {

      await waitForWindowClose(
        name
      );

    }


    if (
      currentWindow ===
      name
    ) {

      currentWindow =
        null;

    }


    /*
       Only unlock when there is
       really no Window remaining.
    */

    if (
      !findCurrentWindow()
    ) {

      unlockWindowPageScroll();

    }


    return true;

  }

  catch (
    error
  ) {

    console.error(
      `U9WindowManager: Failed to close "${name}".`,
      error
    );


    return false;

  }

}


/* =========================
   CLOSE CURRENT WINDOW
========================= */

async function closeCurrentWindow() {

  const activeWindow =
    findCurrentWindow();


  if (
    !activeWindow
  ) {

    currentWindow =
      null;


    unlockWindowPageScroll();


    return true;

  }


  return await closeWindow(
    activeWindow
  );

}


/* =========================
   CAN OPEN WINDOW
========================= */

function canOpenWindow(
  name
) {

  const windowConfig =
    getWindow(
      name
    );


  if (
    !windowConfig
  ) {

    console.error(
      `U9WindowManager: Window "${name}" is not registered.`
    );


    return false;

  }


  if (
    typeof windowConfig.canOpen ===
    "function"
  ) {

    try {

      return !!windowConfig.canOpen();

    }

    catch (
      error
    ) {

      console.error(
        `U9WindowManager: canOpen failed for "${name}".`,
        error
      );

      return false;

    }

  }


  return true;

}


/* =========================
   OPEN WINDOW
========================= */

async function openWindow(
  name
) {

  if (
    windowActionRunning
  ) {

    return false;

  }


  const targetWindow =
    getWindow(
      name
    );


  if (
    !targetWindow
  ) {

    console.error(
      `U9WindowManager: Window "${name}" is not registered.`
    );


    return false;

  }


  if (
    !canOpenWindow(
      name
    )
  ) {

    return false;

  }


  const activeWindow =
    findCurrentWindow();


  /*
     Already active.
  */

  if (
    activeWindow ===
    name
  ) {

    return true;

  }


  if (
    typeof targetWindow.open !==
    "function"
  ) {

    console.error(
      `U9WindowManager: Window "${name}" has no open function.`
    );


    return false;

  }


  windowActionRunning =
    true;


  try {

    /*
       Lock BEFORE doing any
       Window transition.

       This is important because
       the old Window must never
       unlock the page while the
       new Window is opening.
    */

    lockWindowPageScroll();


    /* =========================
       CLOSE CURRENT WINDOW
    ========================= */

    if (
      activeWindow
    ) {

      /*
         Start closing the old
         Window.

         DO NOT wait for the
         closing animation here.

         The new Window will open
         immediately.

         This creates a smooth
         Window-to-Window switch
         instead of a visible gap.
      */

      const closed =
        await closeWindow(
          activeWindow,
          {
            waitForAnimation:
              false
          }
        );


      if (
        !closed
      ) {

        return false;

      }

    }


    /* =========================
       OPEN TARGET WINDOW
    ========================= */

    const result =
      targetWindow.open();


    if (
      result &&
      typeof result.then ===
      "function"
    ) {

      await result;

    }


    /*
       Set current Window
       immediately after the
       new Window has opened.
    */

    currentWindow =
      name;


    /*
       Keep scroll locked.
    */

    lockWindowPageScroll();


    return true;

  }

  catch (
    error
  ) {

    console.error(
      `U9WindowManager: Failed to open "${name}".`,
      error
    );


    return false;

  }

  finally {

    windowActionRunning =
      false;

  }

}


/* =========================
   SWITCH WINDOW
========================= */

async function switchWindow(
  name
) {

  return await openWindow(
    name
  );

}


/* =========================
   CLOSE ALL WINDOWS
========================= */

async function closeAllWindows() {

  if (
    windowActionRunning
  ) {

    return false;

  }


  windowActionRunning =
    true;


  try {

    const openWindows =
      [];


    for (
      const [
        name
      ]
      of u9Windows
    ) {

      if (
        isWindowOpen(
          name
        )
      ) {

        openWindows.push(
          name
        );

      }

    }


    for (
      const name
      of openWindows
    ) {

      await closeWindow(
        name,
        {
          waitForAnimation:
            true
        }
      );

    }


    currentWindow =
      null;


    unlockWindowPageScroll();


    return true;

  }

  catch (
    error
  ) {

    console.error(
      "U9WindowManager: Failed to close all windows.",
      error
    );


    return false;

  }

  finally {

    windowActionRunning =
      false;

  }

}


/* =========================
   IS BUSY
========================= */

function isBusy() {

  return (
    windowActionRunning
  );

}


/* =========================
   GET REGISTERED WINDOWS
========================= */

function getRegisteredWindows() {

  return Array.from(
    u9Windows.keys()
  );

}


/* =========================
   EXPORT
========================= */

window.U9WindowManager = {

  register:
    registerWindow,

  unregister:
    unregisterWindow,

  get:
    getWindow,

  getCurrent:
    getCurrentWindow,

  getRegistered:
    getRegisteredWindows,

  isOpen:
    isWindowOpen,

  isBusy:
    isBusy,

  canOpen:
    canOpenWindow,

  open:
    openWindow,

  switch:
    switchWindow,

  close:
    closeWindow,

  closeCurrent:
    closeCurrentWindow,

  closeAll:
    closeAllWindows

};


/* =========================
   READY
========================= */

console.log(
  "U9 Window Manager ready."
);
