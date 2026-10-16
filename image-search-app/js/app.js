const formEl = document.querySelector("form");
const searchInputEl = document.getElementById("search-input");
const searchResultsEl = document.querySelector(".search-results");
const showMoreButtonEl = document.getElementById("show-more-button");
const searchButtonEl = document.getElementById("search-button");
const searchStatusEl = document.querySelector(".search-status");
const topicButtons = document.querySelectorAll(".topic-chip");

let inputData = "";
let page = 1;

const blockSearch = [
  "xxx",
  "sex",
  "sexy",
  "girls",
  "girl",
  "model",
  "models",
  "porn",
  "porno",
  "pornography",
  "nude",
  "nudes",
  "nudity",
  "naked",
  "nsfw",
  "hentai",
  "erotic",
  "erotica",
  "blowjob",
  "handjob",
  "masturbation",
  "masturbate",
  "orgasm",
  "bdsm",
  "fetish",
  "onlyfans",
  "stripper",
  "prostitute",
  "escort",
  "vagina",
  "penis",
  "dick",
  "cock",
  "pussy",
  "boobs",
  "breasts",
  "tits",
  "anal",
  "cum",
  "creampie",
];


function containsBlockedTerm(query) {
  if (typeof query !== "string") {
    return false;
  }

  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return false;
  }

  return blockSearch.some((term) => normalizedQuery.includes(term.toLowerCase()));
}

function setStatus(message, state = "") {
  searchStatusEl.textContent = message;
  if (state) {
    searchStatusEl.dataset.state = state;
  } else {
    delete searchStatusEl.dataset.state;
  }
}

function createSearchMessage(message) {
  const element = document.createElement("p");
  element.classList.add("search-message");
  element.textContent = message;
  return element;
}

function setLoading(isLoading) {
  searchButtonEl.disabled = isLoading;
  searchButtonEl.querySelector("span:first-child").textContent = isLoading
    ? "Finding..."
    : "Explore";
  showMoreButtonEl.disabled = isLoading;
  topicButtons.forEach((button) => {
    button.disabled = isLoading;
  });
}

function createImageCard(result, index) {
  if (!result.urls?.regular && !result.urls?.small) {
    return null;
  }

  const imageWrapper = document.createElement("article");
  imageWrapper.classList.add("search-result");

  const imageFrame = document.createElement("div");
  imageFrame.classList.add("image-frame");

  const image = document.createElement("img");
  image.src = result.urls.regular ?? result.urls.small;
  image.alt = result.alt_description ?? result.description ?? "Unsplash photograph";
  image.loading = "lazy";
  image.decoding = "async";

  const imageLink = document.createElement("a");
  imageLink.classList.add("photo-open");
  imageLink.href = result.links?.html ?? "https://unsplash.com";
  imageLink.target = "_blank";
  imageLink.rel = "noopener noreferrer";
  imageLink.setAttribute("aria-label", `View photo: ${image.alt}`);
  imageLink.textContent = "↗";

  imageFrame.append(image, imageLink);

  const info = document.createElement("div");
  info.classList.add("photo-info");
  const copy = document.createElement("div");
  copy.style.minWidth = "0";

  const title = document.createElement("div");
  title.classList.add("photo-title");
  title.textContent = result.description ?? result.alt_description ?? "Untitled photograph";

  const credit = document.createElement("div");
  credit.classList.add("photo-credit");
  const photographer = result.user?.name ?? "Unsplash contributor";
  credit.textContent = `Photograph by ${photographer}`;

  const count = document.createElement("span");
  count.classList.add("photo-count");
  count.textContent = String(index).padStart(2, "0");

  copy.append(title, credit);
  info.append(copy, count);
  imageWrapper.append(imageFrame, info);

  return imageWrapper;
}

async function searchImages() {
  if (searchButtonEl.disabled) {
    return;
  }

  inputData = searchInputEl.value.trim();

  if (!inputData) {
    searchResultsEl.textContent = "";
    searchResultsEl.appendChild(createSearchMessage("Start with a word, place, or feeling."));
    showMoreButtonEl.classList.remove("is-visible");
    setStatus("What would you like to discover?", "error");
    return;
  }

  if (containsBlockedTerm(inputData)) {
    searchResultsEl.textContent = "";
    searchResultsEl.appendChild(createSearchMessage("Try a different search to explore the collection."));
    showMoreButtonEl.classList.remove("is-visible");
    setStatus("This search can't be displayed. Try another idea.", "error");
    return;
  }

  if (page === 1) {
    searchResultsEl.textContent = "";
    showMoreButtonEl.classList.remove("is-visible");
  }

  const url = `http://localhost:4001/api/search?page=${page}&query=${encodeURIComponent(inputData)}`;
  const requestedPage = page;
  setLoading(true);
  setStatus(
    requestedPage === 1
      ? `Looking for ${inputData}...`
      : `Finding more ${inputData.toLowerCase()}...`,
  );

  try {
    const response = await fetch(url);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Image search request failed.");
    }

    const results = Array.isArray(data.results) ? data.results : [];
    const cards = results
      .map((result, index) => createImageCard(result, searchResultsEl.children.length + index + 1))
      .filter(Boolean);

    if (!cards.length) {
      if (requestedPage === 1) {
        searchResultsEl.appendChild(createSearchMessage("No images found just yet. Try another search."));
        setStatus("Nothing found this time. Try a different search.");
      } else {
        setStatus("You've reached the end of these results.");
      }
      showMoreButtonEl.classList.remove("is-visible");
      return;
    }

    searchResultsEl.append(...cards);
    page = requestedPage + 1;
    setStatus(`Showing inspiration for “${inputData}”.`);

    if (!data.total_pages || requestedPage < data.total_pages) {
      showMoreButtonEl.classList.add("is-visible");
    } else {
      showMoreButtonEl.classList.remove("is-visible");
    }
  } catch {
    if (requestedPage === 1) {
      searchResultsEl.textContent = "";
      searchResultsEl.appendChild(createSearchMessage("Please try your search again in a moment."));
    }
    setStatus("We couldn't load the images. Check your connection and try again.", "error");
    showMoreButtonEl.classList.remove("is-visible");
  } finally {
    setLoading(false);
  }
}

formEl.addEventListener("submit", (e) => {
  e.preventDefault();
  page = 1;
  searchImages();
});

showMoreButtonEl.addEventListener("click", () => {
  searchImages();
});

topicButtons.forEach((button) => {
  button.addEventListener("click", () => {
    searchInputEl.value = button.dataset.query;
    page = 1;
    searchImages();
  });
});
