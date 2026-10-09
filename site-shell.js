const shellNode = (tag, className, text) => {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined && text !== null) element.textContent = text;
  return element;
};

function shellExternalLink(url, label) {
  const link = shellNode("a", "", label);
  link.href = url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  return link;
}

function renderNavigation(site) {
  const navigation = document.querySelector("#site-navigation");
  if (!navigation) return;
  const path = window.location.pathname.replace(/index\.html$/, "");
  const current = path.endsWith("/") ? path : `${path}/`;
  site.navigation.forEach((item) => {
    let link = [...navigation.children].find((candidate) => candidate.dataset.route === item.route);
    if (!link) {
      link = shellNode("a", "", item.label);
      navigation.append(link);
    }
    link.href = item.href;
    link.dataset.route = item.route;
    link.textContent = item.label;
    if (current === item.route) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
}

function renderFooter(site) {
  const footer = document.querySelector(".site-footer");
  if (!footer) return;
  const { institution, principal_investigator: pi, footer: footerContent, navigation } = site;
  footer.replaceChildren();
  footer.id = "contact";
  footer.setAttribute("aria-labelledby", "footer-title");

  const main = shellNode("div", "shell footer-main");
  const identity = shellNode("div", "footer-identity");
  const eyebrow = shellNode("p", "eyebrow", `${institution.lab_name} / CUHK`);
  const heading = shellNode("h2", "", institution.university);
  heading.id = "footer-title";
  const affiliation = shellNode("p");
  affiliation.append(
    document.createTextNode(institution.department),
    document.createElement("br"),
    document.createTextNode(institution.institute)
  );
  identity.append(eyebrow, heading, affiliation);

  const contact = shellNode("div", "footer-contact");
  contact.append(
    shellNode("p", "footer-label", "Principal Investigator"),
    shellNode("p", "footer-name", pi.display_name)
  );
  const email = shellNode("a", "", pi.email);
  email.href = `mailto:${pi.email}`;
  contact.append(email);
  contact.append(shellExternalLink(pi.profile_url, `${pi.profile_label} ↗`));

  const nav = shellNode("nav", "footer-nav");
  nav.setAttribute("aria-label", "Footer navigation");
  nav.append(shellNode("p", "footer-label", footerContent.label));
  navigation.forEach((item) => {
    const link = shellNode("a", "", item.label);
    link.href = item.href;
    nav.append(link);
  });
  main.append(identity, contact, nav);

  const bottom = shellNode("div", "shell footer-bottom");
  bottom.append(
    shellNode("span", "", `© ${footerContent.copyright_year} ${institution.lab_name}`),
    shellNode("span", "", institution.location_label)
  );
  const top = shellNode("a", "", footerContent.back_to_top);
  top.href = "#main";
  bottom.append(top);
  footer.append(main, bottom);
}

function renderJoinUs(site) {
  const root = document.querySelector("[data-join-content]");
  if (!root) return;
  const content = site.join_us;
  const lead = shellNode("section", "join-us-lead section-pad");
  lead.append(
    shellNode("p", "eyebrow", content.eyebrow),
    shellNode("h2", "join-us-title", content.title),
    shellNode("p", "body-large", content.intro)
  );

  const sections = content.sections.map((section) => {
    const article = shellNode("article", "join-us-section");
    article.append(
      shellNode("p", "theme-number", section.label),
      shellNode("h2", "join-us-section-title", section.title),
      shellNode("p", "", section.body)
    );
    return article;
  });

  const contact = shellNode("section", "join-us-contact section-pad");
  contact.append(
    shellNode("p", "eyebrow", "Next steps"),
    shellNode("h2", "join-us-section-title", content.contact_title),
    shellNode("p", "", content.contact_text)
  );
  const link = shellNode("a", "text-link text-link--strong", `${content.cta_label} ↗`);
  link.href = "/contact/";
  contact.append(link);
  root.replaceChildren(lead, ...sections, contact);
  root.setAttribute("aria-busy", "false");
}

function renderContact(site) {
  const root = document.querySelector("[data-contact-details]");
  if (!root) return;
  const { institution, principal_investigator: pi, contact: contactCopy } = site;

  const enquiries = shellNode("section", "contact-group contact-group--enquiries");
  enquiries.setAttribute("aria-labelledby", "contact-enquiries-title");
  const enquiriesTitle = shellNode("h2", "contact-group-title", contactCopy.research_title);
  enquiriesTitle.id = "contact-enquiries-title";
  enquiries.append(enquiriesTitle, shellNode("p", "contact-intro", contactCopy.intro));

  const identity = shellNode("div", "contact-identity");
  identity.append(
    shellNode("h3", "contact-name", pi.name),
    shellNode("p", "contact-role", pi.role)
  );
  const links = shellNode("div", "contact-links");
  const email = shellNode("a", "text-link text-link--strong", pi.email);
  email.href = `mailto:${pi.email}`;
  links.append(email, shellExternalLink(pi.profile_url, `${pi.profile_label} ↗`));
  identity.append(links);
  enquiries.append(identity);

  const join = shellNode("section", "contact-group contact-group--join");
  join.setAttribute("aria-labelledby", "contact-join-title");
  const joinTitle = shellNode("h2", "contact-group-title", contactCopy.join_title);
  joinTitle.id = "contact-join-title";
  const joinLink = shellNode("a", "text-link text-link--strong", `${contactCopy.join_link_label} →`);
  joinLink.href = "/join-us/";
  join.append(joinTitle, shellNode("p", "contact-group-copy", contactCopy.join_intro), joinLink);

  const affiliationGroup = shellNode("section", "contact-group contact-group--affiliation");
  affiliationGroup.setAttribute("aria-labelledby", "contact-affiliation-title");
  const affiliationTitle = shellNode("h2", "contact-group-title", contactCopy.affiliation_title);
  affiliationTitle.id = "contact-affiliation-title";
  const affiliation = shellNode("address", "contact-affiliation");
  affiliation.append(
    shellNode("span", "", institution.department),
    shellNode("span", "", institution.institute),
    shellNode("span", "", institution.university)
  );
  affiliationGroup.append(affiliationTitle, affiliation);

  root.classList.add("contact-details-grid");
  root.replaceChildren(enquiries, join, affiliationGroup);
  root.setAttribute("aria-busy", "false");
}

function renderHomePublications(records) {
  const list = document.querySelector("[data-home-publications]");
  if (!list) return;
  const selected = records.filter((record) => record.homepage_selected).sort((a, b) => a.order - b.order);
  list.replaceChildren(...selected.map((record) => {
    const item = shellNode("li");
    item.append(shellNode("p", "publication-meta", `${record.legacy_year_group || record.year} · ${record.journal || "Journal metadata unavailable"}`));
    const heading = shellNode("h3");
    const target = record.doi ? `https://doi.org/${record.doi}` : record.links?.[0]?.url;
    if (target) heading.append(shellExternalLink(target, `${record.title} ↗`));
    else heading.textContent = record.title;
    item.append(heading, shellNode("p", "publication-authors", record.authors || "Author details unavailable in source record."));
    if (record.doi) {
      const doi = shellExternalLink(`https://doi.org/${record.doi}`, `${record.doi} ↗`);
      doi.className = "doi-link";
      item.append(doi);
    }
    return item;
  }));
}

function renderHomeNews(records) {
  const list = document.querySelector("[data-home-news]");
  if (!list) return;
  const latest = records.filter((record) => record.homepage_featured).slice(0, 3);
  list.replaceChildren(...latest.map((record) => {
    const item = shellNode("li");
    const time = shellNode("time", "", record.date);
    time.dateTime = `${record.year}`;
    item.append(time);
    if (record.category) item.append(shellNode("p", "news-category", record.category));
    const heading = shellNode("h3");
    const link = shellNode("a", "", record.title);
    link.href = `/news/#${encodeURIComponent(record.id)}`;
    heading.append(link);
    item.append(heading);
    return item;
  }));
}

async function renderSiteShell() {
  try {
    const response = await fetch("/data/site.json");
    if (!response.ok) throw new Error(`Site metadata returned ${response.status}`);
    const site = await response.json();
    renderNavigation(site);
    renderFooter(site);
    renderJoinUs(site);
    renderContact(site);
    const homeTasks = [];
    if (document.querySelector("[data-home-publications]")) {
      homeTasks.push(fetch("/data/publications.json").then(async (result) => {
        if (result.ok) renderHomePublications((await result.json()).publications || []);
      }));
    }
    if (document.querySelector("[data-home-news]")) {
      homeTasks.push(fetch("/data/news.json").then(async (result) => {
        if (result.ok) renderHomeNews((await result.json()).records || []);
      }));
    }
    await Promise.all(homeTasks);
    document.querySelectorAll('link[rel="canonical"][data-canonical-route]').forEach((link) => {
      const route = link.dataset.canonicalRoute || window.location.pathname;
      link.href = new URL(route.replace(/^\//, ""), site.canonical_base).href;
    });
  } catch (error) {
    console.error("The shared site content could not be loaded.", error);
  }
}

renderSiteShell();
