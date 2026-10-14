const headlineCandidates = {
  "1": ["Decoding Muscle", "Regeneration and Aging"],
  "2": ["Understanding Muscle Aging.", "Advancing Regenerative Biology."],
  "3": ["How Muscle Repairs Itself", "and Why Aging Changes It."],
};

const candidate = new URLSearchParams(window.location.search).get("headline");
const selectedHeadline = headlineCandidates[candidate] || headlineCandidates["1"];
const heroTitle = document.querySelector("#hero-title");
if (heroTitle) {
  heroTitle.replaceChildren(...selectedHeadline.map((line, index) => {
    const span = document.createElement("span");
    span.textContent = line;
    if (index === 1) span.classList.add("accent-line");
    return span;
  }));
  heroTitle.dataset.candidate = candidate || "1";
}

const menuToggle = document.querySelector("[data-menu-toggle]");
const navigation = document.querySelector("[data-navigation]");

function closeMenu() {
  if (!menuToggle || !navigation) return;
  menuToggle.setAttribute("aria-expanded", "false");
  navigation.classList.remove("is-open");
}

if (menuToggle && navigation) {
  menuToggle.addEventListener("click", () => {
    const opening = menuToggle.getAttribute("aria-expanded") !== "true";
    menuToggle.setAttribute("aria-expanded", String(opening));
    navigation.classList.toggle("is-open", opening);
  });
  navigation.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) closeMenu();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });
  document.addEventListener("click", (event) => {
    if (!navigation.contains(event.target) && !menuToggle.contains(event.target)) closeMenu();
  });
}
