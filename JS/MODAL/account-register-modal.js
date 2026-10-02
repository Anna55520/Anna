/* =========================
   REGISTER ELEMENTS
========================= */

const registerButton =
  document.getElementById(
    "U9-page-header-register"
  );


const registerModal =
  document.getElementById(
    "U9-register-modal"
  );


const registerClose =
  document.getElementById(
    "U9-register-modal-close"
  );


const registerForm =
  document.getElementById(
    "U9-register-form"
  );


/* =========================
   OPEN REGISTER
========================= */

registerButton.addEventListener(
  "click",
  () => {

    registerModal.style.display =
      "flex";

  }
);


/* =========================
   CLOSE REGISTER
========================= */

registerClose.addEventListener(
  "click",
  () => {

    registerModal.style.display =
      "none";

  }
);


/* =========================
   REGISTER PASSWORD
   SHOW / HIDE
========================= */

const registerPassword =
  document.getElementById(
    "U9-register-password"
  );


const registerPasswordToggle =
  document.getElementById(
    "U9-register-password-toggle"
  );


registerPasswordToggle.addEventListener(
  "click",
  () => {

    if (
      registerPassword.type ===
      "password"
    ) {

      registerPassword.type =
        "text";

      registerPasswordToggle.textContent =
        "Hide";

    } else {

      registerPassword.type =
        "password";

      registerPasswordToggle.textContent =
        "Show";

    }

  }
);


/* =========================
   CONFIRM PASSWORD
   SHOW / HIDE
========================= */

const registerConfirmPassword =
  document.getElementById(
    "U9-register-confirm-password"
  );


const registerConfirmPasswordToggle =
  document.getElementById(
    "U9-register-confirm-password-toggle"
  );


registerConfirmPasswordToggle.addEventListener(
  "click",
  () => {

    if (
      registerConfirmPassword.type ===
      "password"
    ) {

      registerConfirmPassword.type =
        "text";

      registerConfirmPasswordToggle.textContent =
        "Hide";

    } else {

      registerConfirmPassword.type =
        "password";

      registerConfirmPasswordToggle.textContent =
        "Show";

    }

  }
);


/* =========================
   REGISTER FORM
========================= */

registerForm.addEventListener(
  "submit",
  async (event) => {

    event.preventDefault();


    /* =========================
       GET FORM DATA
    ========================= */

    const username =
      document
        .getElementById(
          "U9-register-username"
        )
        .value
        .trim();


    const email =
      document
        .getElementById(
          "U9-register-email"
        )
        .value
        .trim();


    const password =
      document.getElementById(
        "U9-register-password"
      ).value;


    const confirmPassword =
      document.getElementById(
        "U9-register-confirm-password"
      ).value;


    /* =========================
       CHECK PASSWORD
    ========================= */

    if (
      password !==
      confirmPassword
    ) {

      alert(
        "Passwords do not match."
      );

      return;

    }


    /* =========================
       REGISTER REQUEST
    ========================= */

    try {

      const response =
        await fetch(
          "https://tvtakmswbzawaweytimx.supabase.co/functions/v1/register",
          {
            method: "POST",

            credentials: "include",

            headers: {
              "Content-Type":
                "application/json"
            },

            body: JSON.stringify({

              username:
                username,

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
         REGISTER ERROR
      ========================= */

      if (!response.ok) {

        alert(
          result.error ||
          "Registration failed."
        );

        return;

      }


      /* =========================
         REGISTER SUCCESS
      ========================= */

      alert(
        "Registration successful."
      );


      registerForm.reset();


      registerModal.style.display =
        "none";


      /* =========================
         UPDATE HEADER
      ========================= */

      localStorage.setItem(
        "u9_session",
        result.session.token
      );


      await getCurrentUser();


    } catch (error) {

      console.error(
        "Register error:",
        error
      );


      alert(
        "Unable to connect to the server."
      );

    }

  }
);
