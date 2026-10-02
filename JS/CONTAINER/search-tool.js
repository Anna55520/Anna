/* =========================
   SEARCH
========================= */

const searchInput =
  document.getElementById(
    "U9-page-container-tool-search-input"
  );


const searchButton =
  document.getElementById(
    "U9-page-container-tool-search-button"
  );


/* =========================
   CHECK SEARCH INPUT
========================= */

function updateSearchButton() {

  if (
    searchInput.value.trim() === ""
  ) {

    searchButton.style.backgroundColor =
      "#abacb2";

    return;

  }


  searchButton.style.backgroundColor =
    "#30bff1";

}


/* =========================
   INPUT
========================= */

searchInput.addEventListener(
  "input",
  updateSearchButton
);


/* =========================
   SEARCH BUTTON
========================= */

searchButton.addEventListener(
  "click",
  function () {

    const keyword =
      searchInput.value.trim();


    /* Empty */

    if (keyword === "") {

      return;

    }


    /* Animation */

    searchButton.classList.remove(
      "search-effect"
    );

    void searchButton.offsetWidth;

    searchButton.classList.add(
      "search-effect"
    );


    /* Search */

    console.log(
      "Search:",
      keyword
    );

  }
);


/* =========================
   INITIAL STATE
========================= */

updateSearchButton();
