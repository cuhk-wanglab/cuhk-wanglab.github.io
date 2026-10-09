const heroFigure = document.querySelector(".hero-figure");
if (heroFigure) {
  fetch("/data/homepage-content.json")
    .then((response) => response.ok ? response.json() : null)
    .then((content) => {
      const hero = content?.hero;
      const image = heroFigure.querySelector("[data-hero-image]");
      const citation = heroFigure.querySelector("[data-hero-citation]");
      const caption = heroFigure.querySelector("[data-hero-caption-text]");
      const summary = document.querySelector("[data-hero-summary]");
      if (!hero || !image || !citation || !caption) return;

      image.src = hero.src;
      image.alt = hero.alt;
      image.width = hero.width;
      image.height = hero.height;
      citation.href = hero.citation;
      caption.textContent = `${hero.caption} · ${hero.journal} · ${hero.year}`;
      if (summary) summary.textContent = hero.summary;
    })
    .catch(() => {});
}

const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#site-navigation");

if (menuButton && navigation) {
  const closeMenu = (returnFocus = false) => {
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Open navigation");
    navigation.classList.remove("is-open");
    if (returnFocus) menuButton.focus();
  };

  menuButton.addEventListener("click", () => {
    const isOpen = menuButton.getAttribute("aria-expanded") === "true";
    menuButton.setAttribute("aria-expanded", String(!isOpen));
    menuButton.setAttribute("aria-label", isOpen ? "Open navigation" : "Close navigation");
    navigation.classList.toggle("is-open", !isOpen);
  });

  navigation.addEventListener("click", (event) => {
    if (event.target.closest("a")) closeMenu();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menuButton.getAttribute("aria-expanded") === "true") {
      closeMenu(true);
    }
  });

  document.addEventListener("pointerdown", (event) => {
    if (!navigation.contains(event.target) && !menuButton.contains(event.target)) closeMenu();
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 880) closeMenu();
  });
}
