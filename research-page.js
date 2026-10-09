const node = (tag, className, text) => {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
};

function createExternalLink(url, label, className = "") {
  const link = node("a", className, label);
  link.href = url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  return link;
}

function renderSequence(sequence) {
  const list = document.querySelector("#research-sequence");
  list.replaceChildren();
  const targets = [
    "muscle-stem-cells", "muscle-stem-cells", "muscle-stem-cells",
    "muscle-aging", "senescence-niche", "genome-regulation",
    "computation-intervention", "computation-intervention"
  ];

  sequence.forEach((stage, index) => {
    const item = node("li", "research-sequence-item");
    const link = node("a", "research-sequence-link");
    link.href = `#${targets[index] || targets[targets.length - 1]}`;
    link.append(
      node("span", "research-sequence-index", String(index + 1).padStart(2, "0")),
      node("span", "research-sequence-label", stage)
    );
    const arrow = node("span", "research-sequence-arrow", index === sequence.length - 1 ? "" : "→");
    arrow.setAttribute("aria-hidden", "true");
    item.append(
      link,
      arrow
    );
    list.append(item);
  });
}

function renderFigure(figure, publication) {
  const element = node("figure", "research-figure");
  const image = node("img");
  image.src = figure.src;
  image.alt = figure.alt;
  image.width = figure.width;
  image.height = figure.height;
  image.loading = "lazy";
  image.decoding = "async";
  const caption = node("figcaption", "figure-caption");
  const citation = publication ? `${figure.caption} · ${publication.journal} · ${publication.year}` : figure.caption;
  caption.append(node("span", "research-figure-caption", citation));
  const url = publication?.doi ? `https://doi.org/${publication.doi}` : publication?.links?.[0]?.url;
  if (url) caption.append(createExternalLink(url, "View publication ↗", "research-figure-link"));
  element.append(image, caption);
  return element;
}

function renderFacts(theme) {
  const facts = node("dl", "research-facts");
  const groups = [
    ["Key concepts", theme.concepts],
    ["Approaches", theme.approaches]
  ];

  groups.forEach(([label, values]) => {
    if (!values?.length) return;
    const group = node("div", "research-fact");
    group.append(node("dt", "research-fact-label", label));
    const list = node("dd", "research-fact-values");
    values.forEach((value, index) => {
      if (index) list.append(document.createTextNode(" · "));
      list.append(document.createTextNode(value));
    });
    group.append(list);
    facts.append(group);
  });

  return facts;
}

function renderPublications(publicationIds, publicationMap, themeId) {
  const section = node("section", "chapter-related");
  const heading = node("h3", "chapter-related-title", "Selected publications");
  heading.id = `${themeId}-publications-title`;
  const list = node("ol", "publication-list related-publications");
  list.setAttribute("aria-labelledby", heading.id);

  publicationIds.map((id) => publicationMap.get(id)).filter(Boolean).forEach((publication) => {
    const item = node("li", "related-publication");
    item.append(node("p", "publication-meta", `${publication.year} · ${publication.journal}`));
    const title = node("h4", "related-publication-title");
    const url = publication.doi ? `https://doi.org/${publication.doi}` : publication.links?.[0]?.url;
    if (url) title.append(createExternalLink(url, `${publication.title} ↗`));
    else title.textContent = publication.title;
    item.append(title);
    list.append(item);
  });

  section.append(heading, list);
  return section;
}

function renderTheme(theme, publicationMap) {
  const article = node("article", `research-chapter${theme.figure ? ` research-chapter--figure-${theme.figure_side}` : " research-chapter--text"}`);
  article.id = theme.id;
  if (theme.id === "muscle-aging") article.classList.add("research-chapter--figure-led");
  if (theme.id === "genome-regulation") article.classList.add("research-chapter--narrow-reading");
  article.setAttribute("aria-labelledby", `${theme.id}-title`);

  const content = node("div", "research-chapter-copy");
  const eyebrow = node("p", "theme-number");
  eyebrow.append(node("span", "research-chapter-index", theme.number));
  eyebrow.append(document.createTextNode(` ${theme.eyebrow}`));
  const title = node("h2", "research-chapter-title", theme.title);
  title.id = `${theme.id}-title`;
  content.append(eyebrow, title, node("p", "theme-question", theme.question));
  theme.paragraphs.forEach((paragraph) => content.append(node("p", "research-chapter-paragraph", paragraph)));
  content.append(renderFacts(theme));
  content.append(renderPublications(theme.publication_ids || [], publicationMap, theme.id));

  article.append(content);
  if (theme.figure) article.append(renderFigure(theme.figure, publicationMap.get(theme.figure.publication_id)));
  return article;
}

async function renderResearchPage() {
  const container = document.querySelector("#research-themes");
  if (!container) return;
  container.setAttribute("aria-busy", "true");

  try {
    const [researchResponse, publicationResponse] = await Promise.all([
      fetch("/data/research.json"),
      fetch("/data/publications.json")
    ]);
    if (!researchResponse.ok || !publicationResponse.ok) throw new Error("Research or publication data could not be loaded");
    const [research, publicationData] = await Promise.all([researchResponse.json(), publicationResponse.json()]);
    const publicationMap = new Map((publicationData.publications || []).map((publication) => [publication.id, publication]));
    document.querySelector("#page-title").textContent = research.title;
    document.querySelector("#research-intro").textContent = research.intro;
    renderSequence(research.sequence);
    container.replaceChildren(...research.themes.map((theme) => renderTheme(theme, publicationMap)));
    container.setAttribute("aria-busy", "false");
  } catch {
    container.replaceChildren(node("p", "content-error", "The research chapters could not be loaded from the local content file."));
    container.setAttribute("aria-busy", "false");
  }
}

renderResearchPage();
