const publicationNode = (tag, className, text) => {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined && text !== null) element.textContent = text;
  return element;
};

function publicationUrl(record) {
  const candidate = record.doi ? `https://doi.org/${record.doi}` : record.links?.find((link) => link.url)?.url;
  if (!candidate) return null;
  try {
    const parsed = new URL(candidate, window.location.origin);
    return ["https:", "http:"].includes(parsed.protocol) ? parsed.href : null;
  } catch {
    return null;
  }
}

function appendPublicationLink(parent, url, label, className = "") {
  const link = publicationNode("a", className, label);
  link.href = url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  parent.append(link);
  return link;
}

function renderHighlight(record, highlight) {
  const item = publicationNode("li", "publication-highlight-entry");
  item.append(publicationNode("p", "publication-meta", `${record.legacy_year_group || record.year} · ${record.journal || "Journal metadata unavailable"}`));
  const heading = publicationNode("h3", "publication-highlight-title");
  const url = publicationUrl(record);
  if (url) appendPublicationLink(heading, url, `${record.title} ↗`);
  else heading.textContent = record.title;
  item.append(heading, publicationNode("p", "publication-authors", record.authors || "Author details unavailable in source record."));
  if (highlight.abstract) {
    const details = publicationNode("details", "publication-abstract-details");
    details.append(publicationNode("summary", "", "Abstract from the legacy page"));
    details.append(publicationNode("p", "publication-abstract", highlight.abstract));
    item.append(details);
  }
  return item;
}

function renderPublication(record) {
  const item = publicationNode("li", "publication-record");
  item.dataset.year = String(record.legacy_year_group || record.year || "unknown");
  item.dataset.search = [record.title, record.authors, record.consortium_authors, record.journal, record.doi, record.pubmed, record.pmc, record.legacy_record]
    .filter(Boolean).join(" ").toLocaleLowerCase();

  const metadata = [record.journal, record.volume, record.issue, record.pages].filter(Boolean).join(" · ");
  item.append(publicationNode("p", "publication-meta", metadata || "Journal details not listed in source"));
  const heading = publicationNode("h3", "publication-record-title");
  const url = publicationUrl(record);
  if (url) appendPublicationLink(heading, url, `${record.title} ↗`);
  else heading.textContent = record.title;
  item.append(heading);

  if (record.authors) item.append(publicationNode("p", "publication-authors", record.authors));
  if (record.consortium_authors && record.consortium_authors !== record.authors) {
    const consortium = publicationNode("details", "publication-consortium");
    consortium.append(publicationNode("summary", "", "Consortium author record"));
    const text = Array.isArray(record.consortium_authors) ? record.consortium_authors.join("; ") : String(record.consortium_authors);
    consortium.append(publicationNode("p", "publication-authors", text));
    item.append(consortium);
  }

  const links = publicationNode("div", "publication-record-links");
  if (record.doi) appendPublicationLink(links, `https://doi.org/${record.doi}`, `DOI ${record.doi} ↗`, "doi-link");
  if (record.pubmed) appendPublicationLink(links, record.pubmed.startsWith("http") ? record.pubmed : `https://pubmed.ncbi.nlm.nih.gov/${record.pubmed}/`, "PubMed ↗", "doi-link");
  if (record.pmc) appendPublicationLink(links, record.pmc.startsWith("http") ? record.pmc : `https://pmc.ncbi.nlm.nih.gov/articles/${record.pmc}/`, "PMC ↗", "doi-link");
  if (links.childElementCount) item.append(links);
  return item;
}

function yearLabel(year) {
  return year === "Before 2010" ? year : year;
}

function renderPublicationArchive(records) {
  const groupsRoot = document.querySelector("[data-publication-groups]");
  const yearsRoot = document.querySelector("[data-publication-years]");
  const yearSelect = document.querySelector("#publication-year");
  const select = document.querySelector("#publication-year");
  const groups = new Map();
  records.forEach((record) => {
    const year = String(record.legacy_year_group || record.year || "Year not listed");
    if (!groups.has(year)) groups.set(year, []);
    groups.get(year).push(record);
  });
  const sortedYears = [...groups.keys()].sort((a, b) => {
    if (a === "Before 2010") return 1;
    if (b === "Before 2010") return -1;
    return Number(b) - Number(a);
  });

  yearsRoot.replaceChildren();
  yearSelect.replaceChildren(new Option("All years", "all"));
  sortedYears.forEach((year) => {
    const id = `publications-${year.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
    const link = publicationNode("a", "", yearLabel(year));
    link.href = `#${id}`;
    yearsRoot.append(link);
    yearSelect.append(new Option(yearLabel(year), year));
  });

  groupsRoot.replaceChildren(...sortedYears.map((year) => {
    const section = publicationNode("section", "publication-year-group");
    section.dataset.year = year;
    section.id = `publications-${year.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
    const heading = publicationNode("h3", "publication-year-heading", yearLabel(year));
    heading.id = `${section.id}-title`;
    const list = publicationNode("ol", "publication-record-list");
    list.append(...groups.get(year).map(renderPublication));
    section.append(heading, list);
    return section;
  }));

  const search = document.querySelector("#publication-search");
  const count = document.querySelector("[data-publication-count]");
  const applyFilter = () => {
    const query = search.value.trim().toLocaleLowerCase();
    const selectedYear = select.value;
    let visibleCount = 0;
    groupsRoot.querySelectorAll(".publication-year-group").forEach((group) => {
      const yearMatches = selectedYear === "all" || group.dataset.year === selectedYear;
      let groupCount = 0;
      group.querySelectorAll(".publication-record").forEach((item) => {
        const visible = yearMatches && (!query || item.dataset.search.includes(query));
        item.hidden = !visible;
        if (visible) groupCount += 1;
      });
      group.hidden = !groupCount;
      visibleCount += groupCount;
    });
    count.textContent = `${visibleCount} of ${records.length} publications shown`;
  };
  search.addEventListener("input", applyFilter);
  select.addEventListener("change", applyFilter);
  applyFilter();
  groupsRoot.setAttribute("aria-busy", "false");
}

async function renderPublicationsPage() {
  try {
    const response = await fetch("/data/publications.json");
    if (!response.ok) throw new Error(`Publication data returned ${response.status}`);
    const data = await response.json();
    const records = data.publications || [];
    const highlights = data.highlights || [];
    const highlightsRoot = document.querySelector("[data-publication-highlights]");
    const featured = records.filter((record) => record.featured);
    const highlightByDoi = new Map(highlights.map((highlight) => [highlight.doi, highlight]));
    highlightsRoot.replaceChildren(...featured.map((record) => renderHighlight(record, highlightByDoi.get(record.doi) || {})));
    renderPublicationArchive(records);
  } catch {
    document.querySelector("[data-publication-error]").hidden = false;
    document.querySelector("[data-publication-groups]").setAttribute("aria-busy", "false");
  }
}

renderPublicationsPage();
