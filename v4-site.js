const el = (tag, className = "", text) => {
  const item = document.createElement(tag);
  if (className) item.className = className;
  if (text !== undefined && text !== null) item.textContent = String(text);
  return item;
};

const appendText = (parent, text) => parent.append(document.createTextNode(text));

function externalLink(url, label, className = "") {
  if (!url) return null;
  let parsed;
  try {
    parsed = new URL(url, window.location.origin);
  } catch {
    return null;
  }
  if (!['http:', 'https:', 'mailto:'].includes(parsed.protocol)) return null;
  const link = el("a", className, label);
  link.href = parsed.href;
  if (parsed.protocol !== "mailto:") {
    link.target = "_blank";
    link.rel = "noopener noreferrer";
  }
  return link;
}

async function readJSON(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`Could not load ${path}`);
  return response.json();
}

function renderHeader(currentPage) {
  const root = document.querySelector("#site-header");
  const header = el("header", "hero-header");
  const wordmark = el("a", "wordmark");
  wordmark.href = "/";
  wordmark.setAttribute("aria-label", "Wang Lab Homepage V4 preview");
  wordmark.append(el("span", "wordmark-name", "WANG LAB"), el("span", "wordmark-subtitle", "Skeletal Muscle Biology · CUHK"));

  const toggle = el("button", "menu-toggle");
  toggle.type = "button";
  toggle.setAttribute("aria-expanded", "false");
  toggle.setAttribute("aria-controls", "primary-navigation");
  toggle.setAttribute("data-menu-toggle", "");
  toggle.append(el("span", "", "Menu"));
  const icon = el("span", "menu-icon");
  icon.setAttribute("aria-hidden", "true");
  icon.append(el("i"), el("i"));
  toggle.append(icon);

  const nav = el("nav", "primary-navigation");
  nav.id = "primary-navigation";
  nav.setAttribute("aria-label", "Primary navigation");
  nav.setAttribute("data-navigation", "");
  const links = [
    ["Research", "/research/", "research"],
    ["People", "/people/", "people"],
    ["Publications", "/publications/", "publications"],
    ["Funded Projects", "/funded-projects/", "funded-projects"],
    ["News", "/news/", "news"],
    ["Fun", "/fun/", "fun"],
  ];
  links.forEach(([label, href, key]) => {
    const link = el("a", "", label);
    link.href = href;
    if (currentPage === key) link.setAttribute("aria-current", "page");
    nav.append(link);
  });
  const join = el("a", "nav-join");
  join.href = "/join-us/";
  appendText(join, "Join the lab ");
  const arrow = el("span", "", "↗");
  arrow.setAttribute("aria-hidden", "true");
  join.append(arrow);
  if (currentPage === "join-us") join.setAttribute("aria-current", "page");
  nav.append(join);

  header.append(wordmark, toggle, nav);
  root.replaceChildren(header);

  const closeMenu = (restoreFocus = false) => {
    toggle.setAttribute("aria-expanded", "false");
    nav.classList.remove("is-open");
    if (restoreFocus) toggle.focus();
  };
  toggle.addEventListener("click", () => {
    const opening = toggle.getAttribute("aria-expanded") !== "true";
    toggle.setAttribute("aria-expanded", String(opening));
    nav.classList.toggle("is-open", opening);
  });
  nav.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) closeMenu();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") closeMenu(true);
  });
  document.addEventListener("click", (event) => {
    if (!nav.contains(event.target) && !toggle.contains(event.target)) closeMenu();
  });
}

function renderFooter(site, currentPage) {
  const root = document.querySelector("#site-footer");
  const footer = el("footer", "site-footer");
  footer.id = "contact";
  const main = el("div", "content-width footer-main");

  const institution = el("div");
  institution.append(el("p", "footer-kicker", "WANG LAB · CUHK"), el("h2", "", "The Chinese University of Hong Kong"));
  const affiliations = el("p");
  affiliations.append(document.createTextNode(`${site.institution.department}\n${site.institution.institute}`));
  institution.append(affiliations);

  const contact = el("div", "footer-contact");
  contact.append(el("p", "footer-kicker", "Contact"), el("p", "", site.principal_investigator.display_name));
  const email = el("a", "", site.principal_investigator.email);
  email.href = `mailto:${site.principal_investigator.email}`;
  contact.append(email);
  const profile = externalLink(site.principal_investigator.profile_url, "CUHK profile ↗");
  if (profile) contact.append(profile);

  const nav = el("nav", "footer-navigation");
  nav.setAttribute("aria-label", "Footer navigation");
  nav.append(el("p", "footer-kicker", site.footer.label));
  [
    ["Research", "/research/"], ["People", "/people/"],
    ["Publications", "/publications/"], ["Funded Projects", "/funded-projects/"],
    ["News", "/news/"], ["Fun", "/fun/"], ["Join Us", "/join-us/"], ["Contact", "/contact/"],
  ].forEach(([label, href]) => {
    const link = el("a", "", label);
    link.href = href;
    if (href === `/${currentPage}/`) link.setAttribute("aria-current", "page");
    nav.append(link);
  });
  main.append(institution, contact, nav);

  const bottom = el("div", "content-width footer-bottom");
  bottom.append(el("span", "", `© ${site.footer.copyright_year} Wang Lab · CUHK · Hong Kong`));
  const top = el("a", "", site.footer.back_to_top);
  top.href = "#main";
  const contactPage = el("a", "", "Contact page ↗");
  contactPage.href = "/contact/";
  if (currentPage === "contact") contactPage.setAttribute("aria-current", "page");
  bottom.append(top, contactPage);
  footer.append(main, bottom);
  root.replaceChildren(footer);
}

const heroCopy = {
  research: {
    lines: ["Skeletal Muscle", "Regeneration and Aging"],
    kicker: "Wang Lab · Research",
    cue: "Explore the research",
  },
  people: {
    lines: ["The People Behind", "the Science"],
    kicker: "Wang Lab · People",
    cue: "Meet the team",
    intro: "A collaborative research community studying muscle regeneration and aging at CUHK.",
  },
  publications: {
    lines: ["Our", "Publications"],
    kicker: "Wang Lab · Publications",
    cue: "Browse the archive",
    intro: "Published work from the Wang Lab across skeletal muscle biology, regeneration, aging and related methods.",
  },
  news: {
    lines: ["News &", "Updates"],
    kicker: "Wang Lab · News archive",
    cue: "Browse the archive",
    intro: "Research, events and milestones from the Wang Lab community.",
  },
  "funded-projects": {
    lines: ["Research,", "Supported"],
    kicker: "Wang Lab · Funded Projects",
    cue: "Explore funding records",
    intro: "A record of competitive grants and collaborative research projects listed by the Wang Lab.",
  },
  fun: {
    lines: ["The Lab,", "Beyond the Bench"],
    kicker: "Wang Lab · Fun",
    cue: "Explore lab life",
    intro: "Field trips, celebrations and shared moments from the Wang Lab photo archive.",
  },
  "join-us": {
    lines: ["Join Us in Decoding", "Muscle Biology"],
    kicker: "Wang Lab · Opportunities",
    cue: "Explore the lab",
  },
  contact: {
    lines: ["Let's", "Connect"],
    kicker: "Wang Lab · Contact",
    cue: "Contact information",
  },
};

function renderHero(page, intro) {
  const config = heroCopy[page];
  const hero = el("section", "page-hero");
  hero.setAttribute("aria-labelledby", "page-title");
  const glow = el("div", "hero-glow");
  glow.setAttribute("aria-hidden", "true");
  const tissue = el("div", "hero-tissue");
  tissue.setAttribute("aria-hidden", "true");
  const content = el("div", "hero-content");
  const kicker = el("p", "hero-kicker");
  const dot = el("span");
  dot.setAttribute("aria-hidden", "true");
  kicker.append(dot, document.createTextNode(` ${config.kicker}`));
  const title = el("h1");
  title.id = "page-title";
  config.lines.forEach((line, index) => {
    const span = el("span", index === config.lines.length - 1 ? "accent-line" : "", line);
    title.append(span);
  });
  content.append(kicker, title);
  if (intro) content.append(el("p", "hero-copy", intro));
  const cue = el("a", "hero-cue");
  cue.href = "#page-content";
  cue.append(el("span", "", config.cue));
  const cueArrow = el("span", "", "↓");
  cueArrow.setAttribute("aria-hidden", "true");
  cue.append(cueArrow);
  hero.append(glow, tissue, content, cue);
  return hero;
}

function sectionLabel(number, label) {
  const p = el("p", "section-label");
  const index = el("span", "", number);
  p.append(index, document.createTextNode(` ${label}`));
  return p;
}

function recordUrl(record) {
  return record.doi ? `https://doi.org/${record.doi}` : record.links?.find((link) => link.url)?.url || null;
}

function renderResearchFigure(figure, publication) {
  const imageFigure = el("figure", "research-figure");
  const frame = el("div", "research-figure-frame");
  const image = el("img");
  image.src = figure.src;
  image.alt = figure.alt;
  image.width = figure.width;
  image.height = figure.height;
  image.loading = "lazy";
  image.decoding = "async";
  frame.append(image);
  const caption = el("figcaption");
  const citation = publication ? `${figure.caption} · ${publication.journal} · ${publication.year}` : figure.caption;
  caption.append(el("span", "research-figure-caption", citation));
  const url = publication && recordUrl(publication);
  const link = externalLink(url, "View publication ↗", "research-figure-link");
  if (link) caption.append(link);
  imageFigure.append(frame, caption);
  return imageFigure;
}

function renderResearchFacts(theme) {
  const facts = el("dl", "research-facts");
  [["Key concepts", theme.concepts], ["Approaches", theme.approaches]].forEach(([label, values]) => {
    if (!values?.length) return;
    const row = el("div", "research-fact");
    row.append(el("dt", "research-fact-label", label));
    row.append(el("dd", "research-fact-values", values.join(" · ")));
    facts.append(row);
  });
  return facts;
}

function renderResearchPublications(publicationIds, publicationMap, themeId) {
  const section = el("section", "chapter-related");
  const heading = el("h3", "chapter-related-title", "Selected publications");
  heading.id = `${themeId}-publications-title`;
  const list = el("ol", "related-publications");
  list.setAttribute("aria-labelledby", heading.id);
  publicationIds.map((id) => publicationMap.get(id)).filter(Boolean).forEach((publication) => {
    const item = el("li", "related-publication");
    item.append(el("p", "publication-meta", `${publication.year} · ${publication.journal}`));
    const title = el("h4", "related-publication-title");
    const link = externalLink(recordUrl(publication), `${publication.title} ↗`);
    if (link) title.append(link);
    else title.textContent = publication.title;
    item.append(title);
    list.append(item);
  });
  section.append(heading, list);
  return section;
}

function renderResearchTheme(theme, publicationMap) {
  const article = el("article", `research-chapter${theme.figure ? ` research-chapter--figure-${theme.figure_side}` : " research-text-only"}`);
  article.id = theme.id;
  article.setAttribute("aria-labelledby", `${theme.id}-title`);
  const inner = el("div", "content-width research-chapter-inner");
  const copy = el("div", "research-chapter-copy");
  const eyebrow = el("p", "theme-number");
  eyebrow.append(el("span", "research-chapter-index", theme.number), document.createTextNode(` ${theme.eyebrow}`));
  const title = el("h2", "research-chapter-title", theme.title);
  title.id = `${theme.id}-title`;
  copy.append(eyebrow, title, el("p", "theme-question", theme.question));
  theme.paragraphs.forEach((paragraph) => copy.append(el("p", "research-chapter-paragraph", paragraph)));
  copy.append(renderResearchFacts(theme));
  copy.append(renderResearchPublications(theme.publication_ids || [], publicationMap, theme.id));
  inner.append(copy);
  if (theme.figure) inner.append(renderResearchFigure(theme.figure, publicationMap.get(theme.figure.publication_id)));
  article.append(inner);
  return article;
}

function renderResearchPage(research, publicationData) {
  const content = el("div", "page-content");
  content.id = "page-content";
  const index = el("section", "research-index");
  index.setAttribute("aria-labelledby", "research-index-title");
  const indexInner = el("div", "content-width");
  const indexHead = el("div", "research-index-head");
  indexHead.append(sectionLabel("01", "Research sequence"));
  const indexTitle = el("h2", "", "Questions from muscle biology to regeneration and aging.");
  indexTitle.id = "research-index-title";
  indexHead.append(indexTitle);
  const sequence = el("ol", "research-sequence");
  const targets = ["muscle-stem-cells", "muscle-stem-cells", "muscle-stem-cells", "muscle-aging", "senescence-niche", "genome-regulation", "computation-intervention", "computation-intervention"];
  research.sequence.forEach((stage, indexNumber) => {
    const item = el("li", "research-sequence-item");
    const link = el("a", "research-sequence-link", undefined);
    link.href = `#${targets[indexNumber] || targets[targets.length - 1]}`;
    link.append(el("span", "research-sequence-index", String(indexNumber + 1).padStart(2, "0")), el("span", "research-sequence-label", stage));
    const arrow = el("span", "research-sequence-arrow", indexNumber === research.sequence.length - 1 ? "" : "→");
    arrow.setAttribute("aria-hidden", "true");
    item.append(link, arrow);
    sequence.append(item);
  });
  indexInner.append(indexHead, sequence);
  index.append(indexInner);
  content.append(index);
  const publicationMap = new Map((publicationData.publications || []).map((record) => [record.id, record]));
  (research.themes || []).forEach((theme) => content.append(renderResearchTheme(theme, publicationMap)));
  return content;
}

function makePortrait(person, className, label) {
  if (!person.image) return null;
  const figure = el("figure", className);
  const frame = el("div", className === "pi-portrait" ? "pi-portrait-frame" : "member-portrait-frame");
  const image = el("img");
  image.src = person.image;
  image.alt = `Portrait of ${person.name}.`;
  image.width = person.image_width || 800;
  image.height = person.image_height || 1000;
  image.loading = "lazy";
  image.decoding = "async";
  frame.append(image);
  figure.append(frame);
  if (label) figure.append(el("figcaption", "", label));
  return figure;
}

function renderPrincipalInvestigator(person, site) {
  const profile = el("div", "pi-profile");
  const portrait = makePortrait({ ...person, name: site.principal_investigator.name }, "pi-portrait", "Principal Investigator");
  if (portrait) profile.append(portrait);
  const copy = el("div", "pi-copy");
  const pi = site.principal_investigator;
  const title = el("h2", "pi-name", pi.name);
  title.id = "pi-title";
  copy.append(el("p", "eyebrow", "Scientific leadership"), title, el("p", "pi-role", pi.role));
  const affiliations = el("ul", "pi-affiliations");
  [site.institution.department, site.institution.institute, site.institution.university].forEach((item) => affiliations.append(el("li", "", item)));
  copy.append(affiliations);
  const links = el("div", "pi-links");
  const email = el("a", "", pi.email);
  email.href = `mailto:${pi.email}`;
  links.append(email);
  const profileLink = externalLink(pi.profile_url, `${pi.profile_label} ↗`);
  if (profileLink) links.append(profileLink);
  copy.append(links);

  if (person.career_timeline?.length || person.career?.length) {
    const career = el("div", "pi-career");
    career.append(el("h3", "pi-career-title", "Education and appointments"));
    const timeline = el("ol", "pi-timeline");
    if (person.career_timeline?.length) {
      person.career_timeline.forEach((record) => {
        const item = el("li", "pi-timeline-entry");
        item.append(el("span", "pi-timeline-year", record.year ?? "Appointment"));
        const description = el("div", "pi-timeline-copy");
        description.append(el("span", "pi-timeline-position", record.position), el("span", "pi-timeline-institution", record.institution));
        if (record.detail) description.append(el("span", "pi-timeline-detail", record.detail));
        item.append(description);
        timeline.append(item);
      });
    } else {
      person.career.forEach((record) => timeline.append(el("li", "pi-timeline-entry", record)));
    }
    career.append(timeline);
    copy.append(career);
  }
  profile.append(copy);
  return profile;
}

function renderMember(person) {
  const article = el("article", "member-entry");
  article.setAttribute("aria-labelledby", `${person.id}-name`);
  const portrait = makePortrait(person, "member-portrait");
  if (portrait) article.append(portrait);
  const copy = el("div", "member-copy");
  const name = el("h4", "member-name", person.name);
  name.id = `${person.id}-name`;
  copy.append(name, el("p", "member-role", person.role));
  if (person.research_interest) copy.append(el("p", "member-interest", person.research_interest));
  if (person.email) {
    const email = el("a", "member-email", person.email);
    email.href = `mailto:${person.email}`;
    copy.append(email);
  }
  if (person.external_links?.length) {
    const links = el("div", "member-links");
    person.external_links.forEach((record) => {
      const link = externalLink(record.url, `${record.label || record.url} ↗`);
      if (link) links.append(link);
    });
    if (links.childElementCount) copy.append(links);
  }
  article.append(copy);
  return article;
}

function renderPeoplePage(people, site) {
  const content = el("div", "page-content");
  content.id = "page-content";
  const intro = el("section", "section-pad people-intro content-width");
  intro.setAttribute("aria-labelledby", "people-intro-title");
  intro.append(sectionLabel("01", "Our community"));
  const introCopy = el("div");
  const introTitle = el("h2", "section-heading", "Researchers working across muscle biology.");
  introTitle.id = "people-intro-title";
  introCopy.append(introTitle, el("p", "lede", "The Wang Lab research community at The Chinese University of Hong Kong brings together researchers, trainees and staff working across skeletal muscle biology."));
  intro.append(introCopy);
  content.append(intro);

  const piSection = el("section", "section-pad pi-section");
  piSection.setAttribute("aria-labelledby", "pi-title");
  const piInner = el("div", "content-width");
  piInner.append(sectionLabel("02", "Principal Investigator"), renderPrincipalInvestigator(people.principal_investigator, site));
  piSection.append(piInner);
  content.append(piSection);

  const membersSection = el("section", "section-pad members-section");
  membersSection.setAttribute("aria-labelledby", "members-title");
  const membersInner = el("div", "content-width");
  const membersHead = el("div", "members-heading");
  membersHead.append(sectionLabel("03", "Current members"));
  const membersTitle = el("h2", "", "The people advancing the work.");
  membersTitle.id = "members-title";
  membersHead.append(membersTitle);
  membersInner.append(membersHead);

  const groups = new Map();
  [...(people.members || [])].sort((a, b) => a.order - b.order).forEach((person) => {
    if (!groups.has(person.group)) groups.set(person.group, []);
    groups.get(person.group).push(person);
  });
  groups.forEach((members, label) => {
    const group = el("section", "member-group");
    const heading = el("h3", "member-group-title", label);
    heading.id = `member-group-${members[0].id}`;
    group.setAttribute("aria-labelledby", heading.id);
    const grid = el("div", "member-grid");
    members.forEach((person) => grid.append(renderMember(person)));
    group.append(heading, grid);
    membersInner.append(group);
  });
  membersSection.append(membersInner);
  content.append(membersSection);

  const alumniSection = el("section", "section-pad alumni-section");
  alumniSection.setAttribute("aria-labelledby", "alumni-title");
  const alumniInner = el("div", "content-width");
  const alumniHead = el("div", "alumni-heading");
  alumniHead.append(sectionLabel("04", "Alumni"));
  const alumniTitle = el("h2", "", "Former members of the lab.");
  alumniTitle.id = "alumni-title";
  alumniHead.append(alumniTitle);
  const alumniList = el("ul", "alumni-list");
  [...(people.alumni || [])].sort((a, b) => a.order - b.order).forEach((person) => {
    const item = el("li", "alumni-entry");
    item.append(el("span", "alumni-name", person.name));
    item.append(el("span", "alumni-details", [person.role, person.period].filter(Boolean).join(" · ")));
    if (person.current_affiliation) item.append(el("span", "alumni-affiliation", `Source-era affiliation: ${person.current_affiliation}`));
    alumniList.append(item);
  });
  alumniInner.append(alumniHead, alumniList);
  alumniSection.append(alumniInner);
  content.append(alumniSection);
  return content;
}

function safePublicationUrl(record) {
  const candidate = record.doi ? `https://doi.org/${record.doi}` : record.links?.find((item) => item.url)?.url;
  if (!candidate) return null;
  try {
    const parsed = new URL(candidate, window.location.origin);
    return ["https:", "http:"].includes(parsed.protocol) ? parsed.href : null;
  } catch {
    return null;
  }
}

function renderPublicationHighlight(record, highlight) {
  const item = el("li", "publication-highlight-entry");
  item.append(el("p", "publication-meta", `${record.legacy_year_group || record.year} · ${record.journal || "Journal metadata unavailable"}`));
  const heading = el("h3", "publication-highlight-title");
  const link = externalLink(safePublicationUrl(record), `${record.title} ↗`);
  if (link) heading.append(link);
  else heading.textContent = record.title;
  item.append(heading, el("p", "publication-authors", record.authors || "Author details unavailable in source record."));
  if (highlight?.abstract) {
    const details = el("details", "publication-abstract-details");
    details.append(el("summary", "", "Abstract from the legacy page"), el("p", "publication-abstract", highlight.abstract));
    item.append(details);
  }
  return item;
}

function publicationRecordSearchText(record) {
  const consortium = Array.isArray(record.consortium_authors) ? record.consortium_authors.join(" ") : record.consortium_authors;
  return [record.title, record.authors, consortium, record.journal, record.doi, record.pubmed, record.pmc, record.legacy_record]
    .filter(Boolean).join(" ").toLocaleLowerCase();
}

function renderPublicationRecord(record) {
  const item = el("li", "publication-record");
  const year = String(record.legacy_year_group || record.year || "Year not listed");
  item.dataset.year = year;
  item.dataset.search = publicationRecordSearchText(record);
  const metadata = [record.journal, record.volume, record.issue, record.pages].filter(Boolean).join(" · ");
  item.append(el("p", "publication-meta", metadata || "Journal details not listed in source"));
  const title = el("h4", "publication-record-title");
  const link = externalLink(safePublicationUrl(record), `${record.title} ↗`);
  if (link) title.append(link);
  else title.textContent = record.title;
  item.append(title);
  if (record.authors) item.append(el("p", "publication-authors", record.authors));
  if (record.consortium_authors && record.consortium_authors !== record.authors) {
    const consortium = el("details", "publication-consortium");
    consortium.append(el("summary", "", "Consortium author record"));
    const text = Array.isArray(record.consortium_authors) ? record.consortium_authors.join("; ") : String(record.consortium_authors);
    consortium.append(el("p", "publication-authors", text));
    item.append(consortium);
  }
  const links = el("div", "publication-record-links");
  if (record.doi) {
    const doi = externalLink(`https://doi.org/${record.doi}`, `DOI ${record.doi} ↗`, "doi-link");
    if (doi) links.append(doi);
  }
  if (record.pubmed) {
    const url = String(record.pubmed).startsWith("http") ? record.pubmed : `https://pubmed.ncbi.nlm.nih.gov/${record.pubmed}/`;
    const pubmed = externalLink(url, "PubMed ↗", "doi-link");
    if (pubmed) links.append(pubmed);
  }
  if (record.pmc) {
    const url = String(record.pmc).startsWith("http") ? record.pmc : `https://pmc.ncbi.nlm.nih.gov/articles/${record.pmc}/`;
    const pmc = externalLink(url, "PMC ↗", "doi-link");
    if (pmc) links.append(pmc);
  }
  if (links.childElementCount) item.append(links);
  return item;
}

function yearSlug(year) {
  return String(year).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function renderPublicationArchive(records, select) {
  const groupsRoot = el("div");
  const groups = new Map();
  records.forEach((record) => {
    const year = String(record.legacy_year_group || record.year || "Year not listed");
    if (!groups.has(year)) groups.set(year, []);
    groups.get(year).push(record);
  });
  const sortedYears = [...groups.keys()].sort((a, b) => {
    if (a === "Before 2010") return 1;
    if (b === "Before 2010") return -1;
    if (a === "Year not listed") return 1;
    if (b === "Year not listed") return -1;
    return Number(b) - Number(a);
  });
  select.replaceChildren(new Option("All years", "all"));
  sortedYears.forEach((year) => select.append(new Option(year, year)));
  sortedYears.forEach((year) => {
    const section = el("section", "publication-year-group");
    section.dataset.year = year;
    section.id = `publications-${yearSlug(year)}`;
    const heading = el("h3", "publication-year-heading", year);
    heading.id = `${section.id}-title`;
    const list = el("ol", "publication-record-list");
    list.setAttribute("aria-labelledby", heading.id);
    list.append(...groups.get(year).map(renderPublicationRecord));
    section.append(heading, list);
    groupsRoot.append(section);
  });
  return groupsRoot;
}

function renderPublicationsPage(data) {
  const records = data.publications || [];
  const highlights = data.highlights || [];
  const highlightByDoi = new Map(highlights.map((highlight) => [highlight.doi, highlight]));
  const featuredResearchDoiOrder = [
    "10.1016/j.ymthe.2026.04.032",
    "10.1038/s41467-025-61403-y",
    "10.1038/s41467-025-56474-w",
    "10.1186/s13059-025-03753-w",
  ];
  const content = el("div", "page-content");
  content.id = "page-content";

  const featuredSection = el("section", "section-pad publication-featured");
  featuredSection.setAttribute("aria-labelledby", "featured-publications-title");
  const featuredInner = el("div", "content-width");
  const featureHead = el("div", "publication-feature-heading");
  featureHead.append(sectionLabel("01", "Featured research"));
  const featureTitle = el("h2", "", "Selected work from the publication record.");
  featureTitle.id = "featured-publications-title";
  featureHead.append(featureTitle);
  const featureList = el("ol", "publication-highlight-list");
  const recordByDoi = new Map(records.map((record) => [record.doi, record]));
  featuredResearchDoiOrder.forEach((doi) => {
    const record = recordByDoi.get(doi);
    if (record) featureList.append(renderPublicationHighlight(record, highlightByDoi.get(doi)));
  });
  featuredInner.append(featureHead, featureList);
  featuredSection.append(featuredInner);
  content.append(featuredSection);

  const archive = el("section", "section-pad publication-archive");
  archive.setAttribute("aria-labelledby", "publication-archive-title");
  const archiveInner = el("div", "content-width");
  const archiveHead = el("div", "publication-archive-heading");
  archiveHead.append(sectionLabel("02", "Complete archive"));
  const archiveTitle = el("h2", "", "Published work, by year.");
  archiveTitle.id = "publication-archive-title";
  archiveHead.append(archiveTitle);
  const controls = el("div", "publication-controls");
  const searchLabel = el("label", "field-label", "Search publications");
  const search = el("input", "publication-search");
  search.id = "publication-search";
  search.type = "search";
  search.placeholder = "Title, author, journal, DOI…";
  search.autocomplete = "off";
  searchLabel.append(search);
  const yearLabel = el("label", "field-label", "Filter by year");
  const yearSelect = el("select", "publication-year-select");
  yearSelect.id = "publication-year";
  yearLabel.append(yearSelect);
  controls.append(searchLabel, yearLabel);
  const count = el("p", "publication-count");
  count.setAttribute("aria-live", "polite");
  count.setAttribute("data-publication-count", "");
  const groups = renderPublicationArchive(records, yearSelect);
  groups.setAttribute("data-publication-groups", "");
  groups.setAttribute("aria-busy", "false");
  archiveInner.append(archiveHead, controls, count, groups);
  archive.append(archiveInner);
  content.append(archive);

  const applyFilter = () => {
    const query = search.value.trim().toLocaleLowerCase();
    const selectedYear = yearSelect.value;
    let visibleCount = 0;
    groups.querySelectorAll(".publication-year-group").forEach((group) => {
      const yearMatches = selectedYear === "all" || group.dataset.year === selectedYear;
      let groupCount = 0;
      group.querySelectorAll(".publication-record").forEach((item) => {
        const visible = yearMatches && (!query || item.dataset.search.includes(query));
        item.hidden = !visible;
        if (visible) groupCount += 1;
      });
      group.hidden = groupCount === 0;
      visibleCount += groupCount;
    });
    count.textContent = `${visibleCount} of ${records.length} publications shown`;
  };
  search.addEventListener("input", applyFilter);
  yearSelect.addEventListener("change", applyFilter);
  applyFilter();
  return content;
}

function newsDateTime(record) {
  const year = String(record.year || "");
  return /^\d{4}$/.test(year) ? year : undefined;
}

function renderNewsEntry(record) {
  const item = el("li", "news-archive-entry");
  item.id = record.id;
  const meta = el("div", "news-entry-meta");
  const date = el("time", "", record.date);
  const machineDate = newsDateTime(record);
  if (machineDate) date.dateTime = machineDate;
  meta.append(date);
  if (record.category) meta.append(el("span", "news-category", record.category));
  const title = el("h4", "news-entry-title");
  if (record.external_url) {
    const link = externalLink(record.external_url, record.title);
    if (link) title.append(link);
    else title.textContent = record.title;
  } else {
    title.textContent = record.title;
  }
  item.append(meta, title);
  if (record.images?.length) {
    const gallery = el("div", "news-entry-gallery");
    gallery.setAttribute("aria-label", `Photos for ${record.title}`);
    record.images.forEach((photo) => {
      const link = el("a", "news-entry-photo");
      link.href = photo.src;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.setAttribute("aria-label", `Open photo: ${photo.alt}`);
      const image = el("img");
      image.src = photo.src;
      image.alt = photo.alt;
      image.loading = "lazy";
      image.decoding = "async";
      link.append(image);
      gallery.append(link);
    });
    item.append(gallery);
  }
  return item;
}

function renderNewsPage(data) {
  const records = data.records || [];
  const years = [...new Set(records.map((record) => Number(record.year)).filter(Number.isFinite))].sort((a, b) => b - a);
  const content = el("div", "page-content");
  content.id = "page-content";
  const section = el("section", "section-pad news-archive");
  section.setAttribute("aria-labelledby", "news-archive-title");
  const inner = el("div", "content-width");
  const head = el("div", "news-archive-heading");
  head.append(sectionLabel("01", "Archive"));
  const title = el("h2", "", "From the Wang Lab community.");
  title.id = "news-archive-title";
  head.append(title);
  inner.append(head);
  years.forEach((year) => {
    const group = el("section", "news-year-group");
    group.id = `news-${year}`;
    const yearHeading = el("h3", "news-year-heading", year);
    yearHeading.id = `news-${year}-title`;
    group.setAttribute("aria-labelledby", yearHeading.id);
    const list = el("ol", "news-archive-list");
    list.append(...records.filter((record) => Number(record.year) === year).map(renderNewsEntry));
    group.append(yearHeading, list);
    inner.append(group);
  });
  section.append(inner);
  content.append(section);
  return content;
}

function renderFundedProjectsPage(data) {
  const content = el("div", "page-content");
  content.id = "page-content";
  const section = el("section", "section-pad funded-archive");
  const inner = el("div", "content-width");
  const heading = el("div", "funded-archive-heading");
  heading.append(sectionLabel("01", "Funding record"));
  const headingCopy = el("div");
  headingCopy.append(
    el("h2", "", "Research supported across the years."),
    el("p", "lede", "Project names, roles, periods and amounts are transcribed from the lab’s public funding archive."),
  );
  heading.append(headingCopy);
  inner.append(heading);

  const items = data.items || [];
  const sections = [...new Set(items.map((item) => item.source_section))];
  sections.forEach((sectionName, sectionIndex) => {
    const sectionGroup = el("section", "funded-period");
    sectionGroup.setAttribute("aria-labelledby", `funded-period-${sectionIndex}`);
    const sectionHeading = el("h3", "funded-period-heading", sectionName);
    sectionHeading.id = `funded-period-${sectionIndex}`;
    sectionGroup.append(sectionHeading);
    const roleNames = [...new Set(items.filter((item) => item.source_section === sectionName).map((item) => item.source_group))];
    roleNames.forEach((roleName, roleIndex) => {
      const roleGroup = el("section", "funded-role-group");
      const roleHeading = el("h4", "funded-role-heading", roleName);
      roleHeading.id = `funded-period-${sectionIndex}-role-${roleIndex}`;
      roleGroup.setAttribute("aria-labelledby", roleHeading.id);
      roleGroup.append(roleHeading);
      const list = el("ol", "funded-record-list");
      items.filter((item) => item.source_section === sectionName && item.source_group === roleName).forEach((record) => {
        const row = el("li", "funded-record");
        row.append(el("p", "", record.source_text));
        list.append(row);
      });
      roleGroup.append(list);
      sectionGroup.append(roleGroup);
    });
    inner.append(sectionGroup);
  });
  section.append(inner);
  content.append(section);
  return content;
}

function renderFunPage(data) {
  const content = el("div", "page-content");
  content.id = "page-content";
  const section = el("section", "section-pad lab-life-archive");
  section.setAttribute("aria-labelledby", "lab-life-title");
  const inner = el("div", "content-width");
  const heading = el("div", "lab-life-heading");
  heading.append(sectionLabel("01", "Fun / Lab life"));
  const headingCopy = el("div");
  const title = el("h2", "", "Good science, good company.");
  title.id = "lab-life-title";
  headingCopy.append(title, el("p", "lede", "A photo archive of Wang Lab outings, celebrations and shared moments. Select any image to open it larger."));
  heading.append(headingCopy);
  const albums = el("div", "lab-album-list");
  (data.albums || []).forEach((album) => {
    const item = el("article", "lab-album");
    const albumHeading = el("div", "lab-album-heading");
    if (album.year) albumHeading.append(el("p", "lab-album-year", album.year));
    albumHeading.append(el("h3", "lab-album-title", album.title));
    const photos = album.photos?.length ? album.photos : (album.src ? [{ src: album.src, alt: album.alt }] : []);
    if (photos.length) albumHeading.append(el("span", "lab-album-count", `${photos.length} photos`));
    item.append(albumHeading);

    if (photos.length) {
      const photoGrid = el("div", "lab-album-photos");
      photoGrid.setAttribute("aria-label", `Photos from ${album.title}`);
      photos.forEach((photo, index) => {
        const link = el("a", "lab-album-photo");
        link.href = photo.src;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.setAttribute("aria-label", `Open photo ${index + 1} of ${photos.length} from ${album.title}`);
        const image = el("img");
        image.src = photo.src;
        image.alt = photo.alt || `${album.title} — photo ${index + 1}`;
        image.loading = "lazy";
        image.decoding = "async";
        link.append(image);
        photoGrid.append(link);
      });
      item.append(photoGrid);
    } else if (album.external_url) {
      const slideshow = externalLink(album.external_url, "View birthday slideshow ↗");
      if (slideshow) {
        slideshow.className = "lab-album-external";
        item.append(slideshow);
      }
    }
    albums.append(item);
  });
  inner.append(heading, albums);
  section.append(inner);
  content.append(section);
  return content;
}

function renderJoinPage(joinData) {
  const content = el("div", "page-content");
  content.id = "page-content";
  const main = el("section", "section-pad join-content");
  main.setAttribute("aria-labelledby", "join-overview-title");
  const inner = el("div", "content-width");
  const statement = el("div", "join-statement");
  statement.append(sectionLabel("01", joinData.eyebrow));
  const copy = el("div");
  const title = el("h2", "", joinData.title);
  title.id = "join-overview-title";
  copy.append(title, el("p", "lede", joinData.intro));
  statement.append(copy);
  const sections = el("div", "join-sections");
  joinData.sections.forEach((record) => {
    const article = el("article", "join-section");
    article.append(el("p", "join-section-label", record.label));
    const sectionCopy = el("div");
    sectionCopy.append(el("h3", "", record.title), el("p", "", record.body));
    article.append(sectionCopy);
    sections.append(article);
  });
  inner.append(statement, sections);
  main.append(inner);
  content.append(main);

  const cta = el("section", "join-cta");
  cta.setAttribute("aria-labelledby", "join-contact-title");
  const ctaInner = el("div", "content-width join-cta-inner");
  ctaInner.append(sectionLabel("02", "Next steps"));
  const ctaCopy = el("div");
  const ctaTitle = el("h2", "", joinData.contact_title);
  ctaTitle.id = "join-contact-title";
  ctaCopy.append(ctaTitle, el("p", "", joinData.contact_text));
  const link = el("a", "section-link");
  link.href = "/contact/";
  link.append(document.createTextNode(joinData.cta_label));
  const arrow = el("span", "", "↗");
  arrow.setAttribute("aria-hidden", "true");
  link.append(arrow);
  ctaCopy.append(link);
  ctaInner.append(ctaCopy);
  cta.append(ctaInner);
  content.append(cta);
  return content;
}

function renderContactPage(site) {
  const contactData = site.contact;
  const pi = site.principal_investigator;
  const institution = site.institution;
  const content = el("div", "page-content");
  content.id = "page-content";
  const section = el("section", "section-pad contact-main");
  section.setAttribute("aria-labelledby", "contact-information-title");
  const inner = el("div", "content-width contact-layout");
  inner.append(sectionLabel("01", contactData.eyebrow));
  const copy = el("div", "contact-content");
  const introTitle = el("h2", "visually-hidden", "Contact information");
  introTitle.id = "contact-information-title";
  copy.append(introTitle, el("p", "contact-intro", contactData.intro));

  const enquiries = el("section", "contact-block");
  enquiries.append(el("h2", "", contactData.research_title), el("h3", "contact-name", pi.name), el("p", "contact-role", pi.role));
  const links = el("div", "contact-links");
  const email = el("a", "", pi.email);
  email.href = `mailto:${pi.email}`;
  links.append(email);
  const profile = externalLink(pi.profile_url, "CUHK profile ↗");
  if (profile) links.append(profile);
  enquiries.append(links);

  const join = el("section", "contact-block");
  join.append(el("h2", "", contactData.join_title), el("p", "contact-intro", contactData.join_intro));
  const opportunities = el("a", "section-link");
  opportunities.href = "/join-us/";
  opportunities.append(document.createTextNode(contactData.join_link_label));
  const arrow = el("span", "", "↗");
  arrow.setAttribute("aria-hidden", "true");
  opportunities.append(arrow);
  join.append(opportunities);

  const affiliation = el("section", "contact-block");
  affiliation.append(el("h2", "", contactData.affiliation_title));
  const address = el("address", "contact-affiliation");
  [institution.department, institution.institute, institution.university].forEach((line) => address.append(el("span", "", line)));
  affiliation.append(address);
  copy.append(enquiries, join, affiliation);
  inner.append(copy);
  section.append(inner);
  content.append(section);
  return content;
}

async function start() {
  const page = document.body.dataset.v4Page;
  const main = document.querySelector("#main");
  if (!heroCopy[page] || !main) return;
  main.setAttribute("aria-busy", "true");
  renderHeader(page);
  try {
    const site = await readJSON("/data/site.json");
    renderFooter(site, page);
    let intro = heroCopy[page].intro;
    let content;
    if (page === "research") {
      const [research, publicationData] = await Promise.all([readJSON("/data/research.json"), readJSON("/data/publications.json")]);
      intro = research.intro;
      content = renderResearchPage(research, publicationData);
    } else if (page === "people") {
      const people = await readJSON("/data/people.json");
      content = renderPeoplePage(people, site);
    } else if (page === "publications") {
      const publicationData = await readJSON("/data/publications.json");
      content = renderPublicationsPage(publicationData);
    } else if (page === "news") {
      const news = await readJSON("/data/news.json");
      content = renderNewsPage(news);
    } else if (page === "funded-projects") {
      const projects = await readJSON("/data/funded-projects.json");
      content = renderFundedProjectsPage(projects);
    } else if (page === "fun") {
      const fun = await readJSON("/data/fun.json");
      content = renderFunPage(fun);
    } else if (page === "join-us") {
      intro = site.join_us.intro;
      content = renderJoinPage(site.join_us);
    } else if (page === "contact") {
      intro = site.contact.intro;
      content = renderContactPage(site);
    }
    main.replaceChildren(renderHero(page, intro), content);
    main.setAttribute("aria-busy", "false");
  } catch {
    renderFooter(await readJSON("/data/site.json").catch(() => ({
      institution: { department: "", institute: "" },
      principal_investigator: { display_name: "Wang Lab", email: "", profile_url: "" },
      footer: { label: "Explore", copyright_year: "", back_to_top: "Back to top ↑" },
    })), page);
    const error = el("p", "content-width page-error", "This page content could not be loaded from the local data files.");
    main.replaceChildren(error);
    main.setAttribute("aria-busy", "false");
  }
}

start();
