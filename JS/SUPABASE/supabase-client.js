/* =========================================================
   U9 SUPABASE CLIENT
========================================================= */

(function () {
  "use strict";

  const SUPABASE_URL =
    "https://tvtakmswbzawaweytimx.supabase.co";

  /*
    IMPORTANT:
    这里必须使用 Supabase 的 ANON/PUBLISHABLE KEY。

    不要放：
      SUPABASE_SERVICE_ROLE_KEY

    Service Role Key 绝对不能放在浏览器 JS。
  */

  const SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2dGFrbXN3Ynphd2F3ZXl0aW14Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk5NTIzNTYsImV4cCI6MjEwNTUyODM1Nn0.Q8iMQyAW2maDcH5uDKIFBZ1ZDdNWX5mFOK01zx9N9fI";


  /*
    supabase-js CDN
  */

  const script =
    document.createElement("script");

  script.src =
    "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";

  script.async = false;


  script.onload =
    function () {

      if (
        !window.supabase ||
        !window.supabase.createClient
      ) {

        console.error(
          "U9: Supabase library loaded but createClient is missing."
        );

        return;
      }


      window.supabaseClient =
        window.supabase.createClient(
          SUPABASE_URL,
          SUPABASE_ANON_KEY
        );


      console.log(
        "U9: Supabase client initialized."
      );

    };


  script.onerror =
    function () {

      console.error(
        "U9: Failed to load Supabase JS library."
      );

    };


  document.head.appendChild(
    script
  );

})();
