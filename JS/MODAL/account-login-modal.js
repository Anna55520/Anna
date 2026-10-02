/* =========================
   LOGIN ELEMENTS
========================= */

const loginButton =
  document.getElementById(
    "U9-page-header-login"
  );


const loginModal =
  document.getElementById(
    "U9-login-modal"
  );


const loginClose =
  document.getElementById(
    "U9-login-modal-close"
  );


const loginForm =
  document.getElementById(
    "U9-login-form"
  );


/* =========================
   OPEN LOGIN
========================= */

loginButton.addEventListener(
  "click",
  () => {

    loginModal.style.display =
      "flex";

  }
);


/* =========================
   CLOSE LOGIN
========================= */

loginClose.addEventListener(
  "click",
  () => {

    loginModal.style.display =
      "none";

  }
);


/* =========================
   LOGIN PASSWORD
   SHOW / HIDE
========================= */

const loginPassword =
  document.getElementById(
    "U9-login-password"
  );


const loginPasswordToggle =
  document.getElementById(
    "U9-login-password-toggle"
  );


loginPasswordToggle.addEventListener(
  "click",
  () => {

    if (
      loginPassword.type ===
      "password"
    ) {

      loginPassword.type =
        "text";

      loginPasswordToggle.textContent =
        "Hide";

    } else {

      loginPassword.type =
        "password";

      loginPasswordToggle.textContent =
        "Show";

    }

  }
);


/* =========================
   LOGIN FORM
========================= */

loginForm.addEventListener(
  "submit",
  async (event) => {

    event.preventDefault();


    /* =========================
       GET FORM DATA
    ========================= */

    const email =
      document
        .getElementById(
          "U9-login-email"
        )
        .value
        .trim();


    const password =
      document
        .getElementById(
          "U9-login-password"
        )
        .value;


    /* =========================
       LOGIN REQUEST
    ========================= */

    try {

      const response =
        await fetch(
          "https://tvtakmswbzawaweytimx.supabase.co/functions/v1/login",
          {
            method: "POST",

            credentials: "include",

            headers: {
              "Content-Type":
                "application/json"
            },

            body: JSON.stringify({

              email:
                email,

              password:
                password

            })

          }
        );


      const result =
        await response.json();


      /* =========================
         LOGIN ERROR
      ========================= */

      if (!response.ok) {

        alert(
          result.error ||
          "Login failed."
        );

        return;

      }


      /* =========================
         LOGIN SUCCESS
      ========================= */

      alert(
        "Login successful."
      );


      loginForm.reset();


      loginModal.style.display =
        "none";


      /* =========================
         SAVE SESSION TOKEN
      ========================= */

      localStorage.setItem(
        "u9_session",
        result.session.token
      );


      /* =========================
         UPDATE HEADER
      ========================= */

      await getCurrentUser();


      /* =========================
         DEBUG
      ========================= */

      console.log(
        "Login session:",
        result.session
      );


    } catch (error) {

      console.error(
        "Login error:",
        error
      );


      alert(
        "Unable to connect to the server."
      );

    }

  }
);
