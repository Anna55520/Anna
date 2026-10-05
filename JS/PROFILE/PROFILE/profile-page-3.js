
/* =================================================
   PROFILE PAGE 3

   AVATAR
   FREE AVATAR FRAME
   PAID AVATAR FRAME
================================================= */


/* =================================================
   API
================================================= */


/* =========================
   AVATAR
========================= */

const U9_PROFILE_PAGE3_FREE_AVATAR_API =
  "https://tvtakmswbzawaweytimx.supabase.co/functions/v1/avatar-free";


const U9_PROFILE_PAGE3_SET_AVATAR_API =
  "https://tvtakmswbzawaweytimx.supabase.co/functions/v1/avatar-set";



/* =========================
   FREE FRAME
========================= */

const U9_PROFILE_PAGE3_FREE_FRAME_API =
  "https://tvtakmswbzawaweytimx.supabase.co/functions/v1/avatar-frame-free";



/* =========================
   PAID FRAME
========================= */

const U9_PROFILE_PAGE3_PAID_FRAME_API =
  "https://tvtakmswbzawaweytimx.supabase.co/functions/v1/avatar-frame-paid";



const U9_PROFILE_PAGE3_PAID_FRAME_PURCHASE_API =
  "https://tvtakmswbzawaweytimx.supabase.co/functions/v1/avatar-frame-paid-purchase";



/* =========================
   FRAME EQUIP
========================= */

const U9_PROFILE_PAGE3_FRAME_EQUIP_API =
  "https://tvtakmswbzawaweytimx.supabase.co/functions/v1/avatar-frame-equip";





/* =================================================
   ELEMENTS
================================================= */

const profilePage3Content =
  document.getElementById(
    "U9-profile-page3-content"
  );





/* =================================================
   STATE
================================================= */


/* =========================
   PAGE
========================= */

let profilePage3CurrentTab =
  "avatar";



/* =========================
   CURRENT AVATAR
========================= */

let currentAvatarId =
  null;



/* =========================
   CURRENT FRAME
========================= */

let currentFrameType =
  "default";


let currentFrameId =
  null;



/* =========================
   FRAME DATA
========================= */

let freeFrames =
  [];


let paidFrames =
  [];





/* =================================================
   TOKEN
================================================= */

function getProfilePage3Token(){

  return localStorage.getItem(
    "u9_token"
  );

}





/* =================================================
   AUTH HEADERS
================================================= */

function getProfilePage3AuthHeaders(){

  const token =
    getProfilePage3Token();


  const headers = {
    "Content-Type":
      "application/json"
  };


  if(token){

    headers.Authorization =
      `Bearer ${token}`;

  }


  return headers;

}





/* =================================================
   LOAD CURRENT USER
================================================= */

async function loadCurrentUserData(){

  try{

    /*
       如果 U9User 已经存在，
       直接读取当前用户。
    */

    if(
      window.U9User &&
      typeof window.U9User.get ===
      "function"
    ){

      const user =
        window.U9User.get();


      if(user){

        /* =========================
           AVATAR
        ========================= */

        const avatarId =
          user?.avatar?.id ||
          user?.avatar?.avatar_id ||
          user?.avatar_id ||
          null;


        if(avatarId !== null){

          currentAvatarId =
            String(
              avatarId
            );

        }



        /* =========================
           FRAME
        ========================= */

        currentFrameType =
          user?.avatar_frame_type ||
          "default";


        currentFrameId =
          user?.avatar_frame_id ||
          null;


        if(currentFrameId !== null){

          currentFrameId =
            String(
              currentFrameId
            );

        }

      }

    }



    console.log(
      "PAGE3 CURRENT USER DATA:",
      {
        avatarId:
          currentAvatarId,

        frameType:
          currentFrameType,

        frameId:
          currentFrameId
      }
    );


  }
  catch(error){

    console.error(
      "LOAD CURRENT USER DATA ERROR:",
      error
    );

  }

}





/* =================================================
   REFRESH USER
================================================= */

async function refreshPage3User(){

  try{

    if(
      window.U9User &&
      typeof window.U9User.refresh ===
      "function"
    ){

      const user =
        await window.U9User.refresh();


      if(user){

        /* =========================
           AVATAR
        ========================= */

        const avatarId =
          user?.avatar?.id ||
          user?.avatar?.avatar_id ||
          user?.avatar_id ||
          null;


        currentAvatarId =
          avatarId !== null
            ? String(avatarId)
            : null;



        /* =========================
           FRAME
        ========================= */

        currentFrameType =
          user?.avatar_frame_type ||
          "default";


        currentFrameId =
          user?.avatar_frame_id ||
          null;


        if(currentFrameId !== null){

          currentFrameId =
            String(
              currentFrameId
            );

        }


        return user;

      }

    }


    return null;

  }
  catch(error){

    console.error(
      "REFRESH PAGE3 USER ERROR:",
      error
    );


    return null;

  }

}





/* =================================================
   REFRESH PROFILE AFTER CHANGE
================================================= */

async function refreshProfileAfterChange(){

  try{

    /*
       先重新取得 /me
    */

    await refreshPage3User();



    /*
       优先使用专门的头像刷新
    */

    if(
      window.U9Profile &&
      typeof window.U9Profile.refreshAvatar ===
      "function"
    ){

      await window.U9Profile.refreshAvatar();

      return true;

    }



    /*
       如果没有 refreshAvatar，
       使用完整 refresh。
    */

    if(
      window.U9Profile &&
      typeof window.U9Profile.refresh ===
      "function"
    ){

      await window.U9Profile.refresh();

      return true;

    }


    return false;

  }
  catch(error){

    console.error(
      "REFRESH PROFILE ERROR:",
      error
    );


    return false;

  }

}





/* =================================================
   CREATE TAB BUTTONS
================================================= */

function createPage3Tabs(){

  if(
    !profilePage3Content
  ){

    return;

  }



  /*
     避免重复创建
  */

  let tabs =
    document.getElementById(
      "U9-profile-page3-tabs"
    );



  if(tabs){

    return;

  }



  tabs =
    document.createElement(
      "div"
    );


  tabs.id =
    "U9-profile-page3-tabs";


  tabs.className =
    "U9-profile-page3-tabs";



  /* =========================
     AVATAR
  ========================= */

  const avatarButton =
    document.createElement(
      "button"
    );


  avatarButton.type =
    "button";


  avatarButton.dataset.tab =
    "avatar";


  avatarButton.className =
    "U9-profile-page3-tab";


  avatarButton.textContent =
    "头像";



  /* =========================
     FREE FRAME
  ========================= */

  const freeFrameButton =
    document.createElement(
      "button"
    );


  freeFrameButton.type =
    "button";


  freeFrameButton.dataset.tab =
    "free-frame";


  freeFrameButton.className =
    "U9-profile-page3-tab";


  freeFrameButton.textContent =
    "免费头像框";



  /* =========================
     PAID FRAME
  ========================= */

  const paidFrameButton =
    document.createElement(
      "button"
    );


  paidFrameButton.type =
    "button";


  paidFrameButton.dataset.tab =
    "paid-frame";


  paidFrameButton.className =
    "U9-profile-page3-tab";


  paidFrameButton.textContent =
    "付费头像框";



  /* =========================
     EVENTS
  ========================= */

  avatarButton.addEventListener(
    "click",
    function(){

      switchPage3Tab(
        "avatar"
      );

    }
  );



  freeFrameButton.addEventListener(
    "click",
    function(){

      switchPage3Tab(
        "free-frame"
      );

    }
  );



  paidFrameButton.addEventListener(
    "click",
    function(){

      switchPage3Tab(
        "paid-frame"
      );

    }
  );



  tabs.appendChild(
    avatarButton
  );


  tabs.appendChild(
    freeFrameButton
  );


  tabs.appendChild(
    paidFrameButton
  );



  /*
     插入到 content 最前面
  */

  profilePage3Content.prepend(
    tabs
  );

}





/* =================================================
   UPDATE TAB ACTIVE
================================================= */

function updatePage3Tabs(){

  const tabs =
    document.querySelectorAll(
      ".U9-profile-page3-tab"
    );



  tabs.forEach(
    function(button){

      if(
        button.dataset.tab ===
        profilePage3CurrentTab
      ){

        button.classList.add(
          "active"
        );

      }
      else{

        button.classList.remove(
          "active"
        );

      }

    }
  );

}





/* =================================================
   SWITCH TAB
================================================= */

async function switchPage3Tab(
  tab
){

  profilePage3CurrentTab =
    tab;



  updatePage3Tabs();



  /*
     清除旧列表
  */

  const oldList =
    profilePage3Content.querySelector(
      ".U9-profile-page3-list-container"
    );



  if(oldList){

    oldList.remove();

  }



  /* =========================
     AVATAR
  ========================= */

  if(
    tab ===
    "avatar"
  ){

    await renderFreeAvatars();

    return;

  }



  /* =========================
     FREE FRAME
  ========================= */

  if(
    tab ===
    "free-frame"
  ){

    await renderFreeFrames();

    return;

  }



  /* =========================
     PAID FRAME
  ========================= */

  if(
    tab ===
    "paid-frame"
  ){

    await renderPaidFrames();

    return;

  }

}





/* =================================================
   CREATE LIST CONTAINER
================================================= */

function createListContainer(){

  const container =
    document.createElement(
      "div"
    );


  container.className =
    "U9-profile-page3-list-container";


  return container;

}





/* =================================================
   CREATE LOADING
================================================= */

function createLoading(){

  const loading =
    document.createElement(
      "div"
    );


  loading.className =
    "U9-profile-page3-loading";


  loading.textContent =
    "加载中...";


  return loading;

}





/* =================================================
   CREATE EMPTY
================================================= */

function createEmpty(
  text
){

  const empty =
    document.createElement(
      "div"
    );


  empty.className =
    "U9-profile-page3-empty";


  empty.textContent =
    text;


  return empty;

}





/* =================================================
   CREATE ERROR
================================================= */

function createError(
  text
){

  const error =
    document.createElement(
      "div"
    );


  error.className =
    "U9-profile-page3-error";


  error.textContent =
    text;


  return error;

}





/* =================================================
   AVATAR CARD
================================================= */

function createAvatarCard(
  avatar
){

  const card =
    document.createElement(
      "div"
    );


  card.className =
    "U9-profile-page3-avatar-card";



  /* =========================
     IMAGE
  ========================= */

  const img =
    document.createElement(
      "img"
    );


  img.className =
    "U9-profile-page3-avatar-image";


  img.src =
    avatar.svg;


  img.alt =
    avatar.name ||
    "avatar";


  img.draggable =
    false;



  /* =========================
     NAME
  ========================= */

  const name =
    document.createElement(
      "div"
    );


  name.className =
    "U9-profile-page3-avatar-name";


  name.textContent =
    avatar.name ||
    "";



  /* =========================
     BUTTON
  ========================= */

  const button =
    document.createElement(
      "button"
    );


  button.type =
    "button";


  button.className =
    "U9-profile-page3-avatar-button";


  button.dataset.avatarId =
    String(
      avatar.id
    );



  if(
    String(avatar.id) ===
    String(currentAvatarId)
  ){

    button.textContent =
      "正在使用";


    button.classList.add(
      "active"
    );


    button.disabled =
      true;

  }
  else{

    button.textContent =
      "使用";

  }



  button.addEventListener(
    "click",
    function(){

      setFreeAvatar(
        avatar.id,
        button
      );

    }
  );



  card.appendChild(
    img
  );


  card.appendChild(
    name
  );


  card.appendChild(
    button
  );


  return card;

}





/* =================================================
   LOAD FREE AVATARS
================================================= */

async function loadFreeAvatars(){

  const response =
    await fetch(
      U9_PROFILE_PAGE3_FREE_AVATAR_API,
      {
        method:
          "GET",

        cache:
          "no-store"
      }
    );



  if(!response.ok){

    throw new Error(
      `Free avatar request failed (${response.status})`
    );

  }



  const result =
    await response.json();



  if(
    !result.success
  ){

    throw new Error(
      result.error ||
      "Free avatar failed"
    );

  }



  return result.avatars || [];

}





/* =================================================
   RENDER FREE AVATARS
================================================= */

async function renderFreeAvatars(){

  const oldList =
    profilePage3Content.querySelector(
      ".U9-profile-page3-list-container"
    );


  if(oldList){

    oldList.remove();

  }



  const container =
    createListContainer();


  const loading =
    createLoading();


  container.appendChild(
    loading
  );


  profilePage3Content.appendChild(
    container
  );



  try{

    const avatars =
      await loadFreeAvatars();



    container.innerHTML =
      "";



    if(
      avatars.length ===
      0
    ){

      container.appendChild(
        createEmpty(
          "暂无免费头像"
        )
      );


      return;

    }



    const list =
      document.createElement(
        "div"
      );


    list.className =
      "U9-profile-page3-avatar-list";



    avatars.forEach(
      function(avatar){

        list.appendChild(
          createAvatarCard(
            avatar
          )
        );

      }
    );



    container.appendChild(
      list
    );

  }
  catch(error){

    console.error(
      "FREE AVATAR ERROR:",
      error
    );


    container.innerHTML =
      "";


    container.appendChild(
      createError(
        "加载免费头像失败"
      )
    );

  }

}





/* =================================================
   SET FREE AVATAR
================================================= */

async function setFreeAvatar(
  avatarId,
  button
){

  if(
    !button ||
    button.classList.contains(
      "loading"
    )
  ){

    return;

  }



  const token =
    getProfilePage3Token();



  if(!token){

    alert(
      "登录已失效，请重新登录"
    );

    return;

  }



  try{

    button.classList.add(
      "loading"
    );


    button.disabled =
      true;


    button.textContent =
      "加载中...";



    const response =
      await fetch(
        U9_PROFILE_PAGE3_SET_AVATAR_API,
        {

          method:
            "POST",

          credentials:
            "include",

          headers:
            getProfilePage3AuthHeaders(),

          body:
            JSON.stringify({

              type:
                "free",

              avatar_id:
                avatarId

            })

        }
      );



    const result =
      await response.json();



    console.log(
      "SET AVATAR RESULT:",
      result
    );



    if(
      !response.ok ||
      !result?.success
    ){

      throw new Error(
        result?.error ||
        result?.message ||
        `Set avatar failed (${response.status})`
      );

    }



    currentAvatarId =
      String(
        avatarId
      );



    await refreshProfileAfterChange();



    await renderFreeAvatars();



    console.log(
      "AVATAR SET SUCCESS:",
      avatarId
    );

  }
  catch(error){

    console.error(
      "SET AVATAR ERROR:",
      error
    );


    button.textContent =
      "失败";


    setTimeout(
      function(){

        if(button){

          button.classList.remove(
            "loading"
          );


          button.disabled =
            false;


          button.textContent =
            "使用";

        }

      },
      1200
    );


    return;

  }

}





/* =================================================
   LOAD FREE FRAMES
================================================= */

async function loadFreeFrames(){

  const response =
    await fetch(
      U9_PROFILE_PAGE3_FREE_FRAME_API,
      {
        method:
          "GET",

        cache:
          "no-store"
      }
    );



  if(!response.ok){

    throw new Error(
      `Free frame request failed (${response.status})`
    );

  }



  const result =
    await response.json();



  if(
    result?.error
  ){

    throw new Error(
      result.error
    );

  }



  freeFrames =
    result.frames || [];


  return freeFrames;

}





/* =================================================
   FRAME CARD
================================================= */

function createFrameCard(
  frame,
  type,
  owned = true
){

  const card =
    document.createElement(
      "div"
    );


  card.className =
    "U9-profile-page3-frame-card";



  if(
    String(frame.id) ===
    String(currentFrameId) &&
    currentFrameType ===
    type
  ){

    card.classList.add(
      "equipped"
    );

  }



  /* =========================
     IMAGE
  ========================= */

  const imageBox =
    document.createElement(
      "div"
    );


  imageBox.className =
    "U9-profile-page3-frame-image-box";



  const img =
    document.createElement(
      "img"
    );


  img.className =
    "U9-profile-page3-frame-image";


  img.src =
    frame.svg;


  img.alt =
    frame.name ||
    "frame";


  img.draggable =
    false;



  imageBox.appendChild(
    img
  );



  /* =========================
     NAME
  ========================= */

  const name =
    document.createElement(
      "div"
    );


  name.className =
    "U9-profile-page3-frame-name";


  name.textContent =
    frame.name ||
    "头像框";



  /* =========================
     BUTTON
  ========================= */

  const button =
    document.createElement(
      "button"
    );


  button.type =
    "button";


  button.className =
    "U9-profile-page3-frame-button";



  const isEquipped =
    (
      String(frame.id) ===
      String(currentFrameId)
    ) &&
    (
      currentFrameType ===
      type
    );



  if(isEquipped){

    button.textContent =
      "正在使用";


    button.classList.add(
      "active"
    );


    button.disabled =
      true;

  }
  else if(
    owned
  ){

    button.textContent =
      "使用";

  }
  else{

    button.textContent =
      "购买";

  }



  /* =========================
     PRICE
  ========================= */

  if(
    type ===
    "paid"
  ){

    const price =
      document.createElement(
        "div"
      );


    price.className =
      "U9-profile-page3-frame-price";


    price.textContent =
      `${frame.coins_price || 0} Coins`;


    card.appendChild(
      imageBox
    );


    card.appendChild(
      name
    );


    card.appendChild(
      price
    );

  }
  else{

    card.appendChild(
      imageBox
    );


    card.appendChild(
      name
    );

  }



  card.appendChild(
    button
  );



  /* =========================
     BUTTON EVENT
  ========================= */

  button.addEventListener(
    "click",
    async function(){

      if(
        button.disabled ||
        button.classList.contains(
          "loading"
        )
      ){

        return;

      }



      if(
        type ===
        "free"
      ){

        await equipFrame(
          "free",
          frame.id,
          button
        );

        return;

      }



      if(
        type ===
        "paid"
      ){

        if(owned){

          await equipFrame(
            "paid",
            frame.id,
            button
          );

        }
        else{

          await purchasePaidFrame(
            frame.id,
            button
          );

        }

      }

    }
  );



  return card;

}





/* =================================================
   EQUIP FRAME
================================================= */

async function equipFrame(
  frameType,
  frameId,
  button
){

  const token =
    getProfilePage3Token();



  if(!token){

    alert(
      "登录已失效，请重新登录"
    );

    return;

  }



  try{

    button.classList.add(
      "loading"
    );


    button.disabled =
      true;


    button.textContent =
      "加载中...";



    const response =
      await fetch(
        U9_PROFILE_PAGE3_FRAME_EQUIP_API,
        {

          method:
            "POST",

          credentials:
            "include",

          headers:
            getProfilePage3AuthHeaders(),

          body:
            JSON.stringify({

              frame_type:
                frameType,

              frame_id:
                frameId

            })

        }
      );



    const result =
      await response.json();



    console.log(
      "EQUIP FRAME RESULT:",
      result
    );



    if(
      !response.ok ||
      !result?.success
    ){

      throw new Error(
        result?.message ||
        result?.error ||
        `Equip frame failed (${response.status})`
      );

    }



    currentFrameType =
      frameType;


    currentFrameId =
      String(
        frameId
      );



    /*
       重新获取 /me
    */

    await refreshPage3User();



    /*
       更新 Profile
    */

    await refreshProfileAfterChange();



    /*
       重新绘制当前页面
    */

    if(
      profilePage3CurrentTab ===
      "free-frame"
    ){

      await renderFreeFrames();

    }
    else if(
      profilePage3CurrentTab ===
      "paid-frame"
    ){

      await renderPaidFrames();

    }



    console.log(
      "FRAME EQUIPPED:",
      {
        frameType:
          frameType,

        frameId:
          frameId
      }
    );

  }
  catch(error){

    console.error(
      "EQUIP FRAME ERROR:",
      error
    );


    button.classList.remove(
      "loading"
    );


    button.disabled =
      false;


    button.textContent =
      "失败";


    setTimeout(
      function(){

        if(button){

          button.textContent =
            "使用";

        }

      },
      1200
    );

  }

}





/* =================================================
   RENDER FREE FRAMES
================================================= */

async function renderFreeFrames(){

  const oldList =
    profilePage3Content.querySelector(
      ".U9-profile-page3-list-container"
    );


  if(oldList){

    oldList.remove();

  }



  const container =
    createListContainer();


  container.appendChild(
    createLoading()
  );


  profilePage3Content.appendChild(
    container
  );



  try{

    await loadFreeFrames();



    container.innerHTML =
      "";



    if(
      freeFrames.length ===
      0
    ){

      container.appendChild(
        createEmpty(
          "暂无免费头像框"
        )
      );


      return;

    }



    const list =
      document.createElement(
        "div"
      );


    list.className =
      "U9-profile-page3-frame-list";



    freeFrames.forEach(
      function(frame){

        list.appendChild(
          createFrameCard(
            frame,
            "free",
            true
          )
        );

      }
    );



    container.appendChild(
      list
    );

  }
  catch(error){

    console.error(
      "FREE FRAME ERROR:",
      error
    );


    container.innerHTML =
      "";


    container.appendChild(
      createError(
        "加载免费头像框失败"
      )
    );

  }

}





/* =================================================
   LOAD PAID FRAMES
================================================= */

async function loadPaidFrames(){

  const token =
    getProfilePage3Token();



  if(!token){

    throw new Error(
      "请先登录"
    );

  }



  const response =
    await fetch(
      U9_PROFILE_PAGE3_PAID_FRAME_API,
      {

        method:
          "GET",

        credentials:
          "include",

        headers:
          getProfilePage3AuthHeaders(),

        cache:
          "no-store"

      }
    );



  const result =
    await response.json();



  console.log(
    "PAID FRAME RESULT:",
    result
  );



  if(
    !response.ok ||
    !result?.success
  ){

    throw new Error(
      result?.message ||
      result?.error ||
      `Paid frame request failed (${response.status})`
    );

  }



  paidFrames =
    result.frames || [];


  return paidFrames;

}





/* =================================================
   PURCHASE PAID FRAME
================================================= */

async function purchasePaidFrame(
  frameId,
  button
){

  const token =
    getProfilePage3Token();



  if(!token){

    alert(
      "登录已失效，请重新登录"
    );

    return;

  }



  try{

    button.classList.add(
      "loading"
    );


    button.disabled =
      true;


    button.textContent =
      "购买中...";



    const response =
      await fetch(
        U9_PROFILE_PAGE3_PAID_FRAME_PURCHASE_API,
        {

          method:
            "POST",

          credentials:
            "include",

          headers:
            getProfilePage3AuthHeaders(),

          body:
            JSON.stringify({

              frame_id:
                frameId

            })

        }
      );



    const result =
      await response.json();



    console.log(
      "PURCHASE FRAME RESULT:",
      result
    );



    if(
      !response.ok ||
      !result?.success
    ){

      throw new Error(
        result?.message ||
        result?.error ||
        "购买失败"
      );

    }



    /*
       购买成功后重新加载
       付费头像框。

       服务器会返回 owned=true。
    */

    await refreshPage3User();


    await renderPaidFrames();



    console.log(
      "PAID FRAME PURCHASE SUCCESS:",
      frameId
    );

  }
  catch(error){

    console.error(
      "PURCHASE PAID FRAME ERROR:",
      error
    );


    button.classList.remove(
      "loading"
    );


    button.disabled =
      false;


    button.textContent =
      "购买";


    alert(
      error.message ||
      "购买失败"
    );

  }

}





/* =================================================
   RENDER PAID FRAMES
================================================= */

async function renderPaidFrames(){

  const oldList =
    profilePage3Content.querySelector(
      ".U9-profile-page3-list-container"
    );


  if(oldList){

    oldList.remove();

  }



  const container =
    createListContainer();


  container.appendChild(
    createLoading()
  );


  profilePage3Content.appendChild(
    container
  );



  try{

    await loadPaidFrames();



    container.innerHTML =
      "";



    if(
      paidFrames.length ===
      0
    ){

      container.appendChild(
        createEmpty(
          "暂无付费头像框"
        )
      );


      return;

    }



    const list =
      document.createElement(
        "div"
      );


    list.className =
      "U9-profile-page3-frame-list";



    paidFrames.forEach(
      function(frame){

        list.appendChild(
          createFrameCard(
            frame,
            "paid",
            !!frame.owned
          )
        );

      }
    );



    container.appendChild(
      list
    );

  }
  catch(error){

    console.error(
      "PAID FRAME ERROR:",
      error
    );


    container.innerHTML =
      "";


    container.appendChild(
      createError(
        error.message ||
        "加载付费头像框失败"
      )
    );

  }

}





/* =================================================
   LOAD PAGE
================================================= */

async function loadProfilePage3(){

  console.log(
    "PROFILE PAGE 3 LOADED"
  );



  /* =========================
     USER
  ========================= */

  await loadCurrentUserData();



  /* =========================
     CREATE TABS
  ========================= */

  createPage3Tabs();



  updatePage3Tabs();



  /* =========================
     DEFAULT TAB
  ========================= */

  await renderFreeAvatars();

}





/* =================================================
   START
================================================= */

loadProfilePage3();
