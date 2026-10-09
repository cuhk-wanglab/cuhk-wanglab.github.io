const newsNode = (tag, className, text) => {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined && text !== null) element.textContent = text;
  return element;
};

function newsDateTime(record) {
  const months = {
    January: "01", February: "02", March: "03", April: "04", May: "05", June: "06",
    July: "07", August: "08", September: "09", October: "10", November: "11", December: "12"
  };
  const match = String(record.date || "").match(/^([A-Za-z]+)\s+(\d{4})$/);
  return match && months[match[1]] ? `${match[2]}-${months[match[1]]}` : String(record.year || "");
}

function renderNewsItem(record, featured = false) {
  const item = newsNode("li", featured ? "news-latest-entry" : "news-archive-entry");
  if (!featured) item.id = record.id;
  const metadata = newsNode("div", "news-entry-meta");
  const time = newsNode("time", "", record.date || String(record.year || "Date not listed"));
  time.dateTime = newsDateTime(record);
  metadata.append(time);
  if (record.category) metadata.append(newsNode("span", "news-category", record.category));
  const heading = newsNode("h3", "news-entry-title");
  if (featured) {
    const jump = newsNode("a", "", record.title);
    jump.href = `#${encodeURIComponent(record.id)}`;
    heading.append(jump);
  } else if (record.external_url && record.external_url !== "#") {
    const link = newsNode("a", "", record.title);
    link.href = record.external_url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    heading.append(link);
  } else {
    heading.textContent = record.title;
  }
  item.append(metadata, heading);
  if (record.summary) item.append(newsNode("p", "news-entry-summary", record.summary));
  return item;
}

function renderNewsArchive(records) {
  const groupsRoot = document.querySelector("[data-news-groups]");
  const yearsRoot = document.querySelector("[data-news-years]");
  const groups = new Map();
  records.forEach((record) => {
    const year = String(record.year || "Year not listed");
    if (!groups.has(year)) groups.set(year, []);
    groups.get(year).push(record);
  });
  const years = [...groups.keys()].sort((a, b) => Number(b) - Number(a));

  yearsRoot.replaceChildren(...years.map((year) => {
    const link = newsNode("a", "", year);
    link.href = `#news-${year}`;
    return link;
  }));
  groupsRoot.replaceChildren(...years.map((year) => {
    const section = newsNode("section", "news-year-group");
    section.id = `news-${year}`;
    section.setAttribute("aria-labelledby", `news-${year}-title`);
    const heading = newsNode("h3", "news-year-heading", year);
    heading.id = `news-${year}-title`;
    const list = newsNode("ol", "news-archive-list");
    list.append(...groups.get(year).map((record) => renderNewsItem(record)));
    section.append(heading, list);
    return section;
  }));
  groupsRoot.setAttribute("aria-busy", "false");
}

async function renderNewsPage() {
  try {
    const response = await fetch("/data/news.json");
    if (!response.ok) throw new Error(`News data returned ${response.status}`);
    const data = await response.json();
    const records = data.records || [];
    const latest = records.filter((record) => record.homepage_featured).slice(0, 3);
    document.querySelector("[data-news-latest]").replaceChildren(...latest.map((record) => renderNewsItem(record, true)));
    renderNewsArchive(records);
  } catch {
    document.querySelector("[data-news-error]").hidden = false;
    document.querySelector("[data-news-groups]").setAttribute("aria-busy", "false");
  }
}

renderNewsPage();
