/* =========================
   U9 WINDOW MANAGER
========================= */


/* =========================
   WINDOW REGISTRY
========================= */

/*
   All U9 windows are registered
   here.

   Example:

   U9WindowManager.register(
     "profile",
     {
       open: openProfileModal,
       close: closeProfileModal
     }
   );
*/

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

/*
   Prevent multiple window
   open / close actions from
   running at the same time.
*/

let windowActionRunning =
  false;


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


  /*
     Save window configuration
  */

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


  /*
     Do not unregister
     the currently open window.
  */

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


  /*
     Use custom isOpen()
     when provided.
  */

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
     First check registered
     windows.

     This makes the manager
     compatible even if the
     currentWindow variable
     has not been updated yet.
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


  /*
     If no registered window
     is currently open.
  */

  if (
    currentWindow &&
    !isWindowOpen(
      currentWindow
    )
  ) {

    currentWindow =
      null;

  }


  return currentWindow;

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


  /*
     If no isOpen() method exists,
     assume close() has finished
     after a short delay.
  */

  if (
    typeof windowConfig.isOpen !==
    "function"
  ) {

    await wait(
      50
    );

    return true;

  }


  /*
     Already closed
  */

  if (
    !windowConfig.isOpen()
  ) {

    return true;

  }


  /*
     Wait until the window
     reports closed.
  */

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


  /*
     Timeout reached.

     Do not leave the manager
     permanently locked.
  */

  return !isWindowOpen(
    name
  );

}


/* =========================
   CLOSE WINDOW
========================= */

async function closeWindow(
  name
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
     Already closed
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


  /*
     No close function
  */

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
       Close the window.
    */

    const result =
      windowConfig.close();


    /*
       Support async close()
    */

    if (
      result &&
      typeof result.then ===
      "function"
    ) {

      await result;

    }


    /*
       Wait for CSS close
       animation to finish.
    */

    await waitForWindowClose(
      name
    );


    /*
       Clear current window.
    */

    if (
      currentWindow ===
      name
    ) {

      currentWindow =
        null;

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


  /*
     Custom permission check
  */

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

  /*
     Prevent multiple
     simultaneous operations.
  */

  if (
    windowActionRunning
  ) {

    return false;

  }


  const targetWindow =
    getWindow(
      name
    );


  /*
     Window not registered
  */

  if (
    !targetWindow
  ) {

    console.error(
      `U9WindowManager: Window "${name}" is not registered.`
    );


    return false;

  }


  /*
     Window cannot open
  */

  if (
    !canOpenWindow(
      name
    )
  ) {

    return false;

  }


  /*
     Already open
  */

  const activeWindow =
    findCurrentWindow();


  if (
    activeWindow ===
    name
  ) {

    return true;

  }


  /*
     Target must have
     an open function.
  */

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

    /* =========================
       CLOSE CURRENT WINDOW
    ========================= */

    if (
      activeWindow
    ) {

      const closed =
        await closeWindow(
          activeWindow
        );


      /*
         If old window could
         not close, do not open
         the new window.

         This guarantees:

         ONE WINDOW ONLY
      */

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


    /*
       Support async open()
    */

    if (
      result &&
      typeof result.then ===
      "function"
    ) {

      await result;

    }


    /*
       Set current window
       only after open request.
    */

    currentWindow =
      name;


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

    /*
       Get all currently open
       registered windows.
    */

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


    /*
       Close every open window.
    */

    for (
      const name
      of openWindows
    ) {

      await closeWindow(
        name
      );

    }


    currentWindow =
      null;


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

  /*
     Registration
  */

  register:
    registerWindow,

  unregister:
    unregisterWindow,


  /*
     Window information
  */

  get:
    getWindow,

  getCurrent:
    getCurrentWindow,

  getRegistered:
    getRegisteredWindows,


  /*
     State
  */

  isOpen:
    isWindowOpen,

  isBusy:
    isBusy,


  /*
     Permission
  */

  canOpen:
    canOpenWindow,


  /*
     Actions
  */

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
