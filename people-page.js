const personNode = (tag, className, text) => {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined && text !== null) element.textContent = text;
  return element;
};

function personLink(url, label, className = "") {
  const link = personNode("a", className, label);
  link.href = url;
  if (!url.startsWith("mailto:")) {
    link.target = "_blank";
    link.rel = "noopener noreferrer";
  }
  return link;
}

function portraitFigure(person, className) {
  if (!person.image) return null;
  const figure = personNode("figure", className);
  const frame = personNode("div", "portrait-frame");
  const image = personNode("img");
  image.src = person.image;
  image.alt = `Portrait of ${person.name}.`;
  image.width = person.image_width;
  image.height = person.image_height;
  image.loading = "lazy";
  image.decoding = "async";
  frame.append(image);
  figure.append(frame);
  return figure;
}

function renderPrincipalInvestigator(person, site) {
  const root = document.querySelector("#pi-content");
  const section = personNode("div", "pi-profile");
  section.setAttribute("aria-labelledby", "pi-title");

  const pi = site.principal_investigator;
  const portrait = portraitFigure({ ...person, name: pi.name }, "pi-portrait");
  if (portrait) {
    const caption = personNode("figcaption", "figure-caption", "Principal Investigator");
    portrait.append(caption);
    section.append(portrait);
  }

  const copy = personNode("div", "pi-copy");
  copy.append(personNode("p", "eyebrow", "Scientific leadership"));
  const title = personNode("h2", "pi-name", pi.name);
  title.id = "pi-title";
  copy.append(title, personNode("p", "pi-role", pi.role));

  const affiliations = personNode("ul", "pi-affiliations");
  [site.institution.department, site.institution.institute, site.institution.university]
    .forEach((affiliation) => affiliations.append(personNode("li", "", affiliation)));
  copy.append(affiliations);

  const links = personNode("div", "pi-links");
  if (pi.email) links.append(personLink(`mailto:${pi.email}`, pi.email));
  links.append(personLink(pi.profile_url, `${pi.profile_label} ↗`));
  copy.append(links);

  if (person.career_timeline?.length || person.career?.length) {
    const career = personNode("div", "pi-career");
    career.append(personNode("h3", "pi-career-title", "Education and appointments"));
    const list = personNode("ol", "pi-timeline");
    if (person.career_timeline?.length) {
      person.career_timeline.forEach((record) => {
        const item = personNode("li", "pi-timeline-entry");
        item.append(personNode("span", "pi-timeline-year", record.year ?? "Appointment"));
        const description = personNode("div", "pi-timeline-copy");
        description.append(personNode("span", "pi-timeline-position", record.position));
        description.append(personNode("span", "pi-timeline-institution", record.institution));
        if (record.detail) description.append(personNode("span", "pi-timeline-detail", record.detail));
        item.append(description);
        list.append(item);
      });
    } else {
      person.career.forEach((record) => list.append(personNode("li", "pi-timeline-entry pi-timeline-entry--legacy", record)));
    }
    career.append(list);
    copy.append(career);
  }

  section.append(copy);
  root.replaceChildren(section);
}

function renderMember(person) {
  const article = personNode("article", "member-entry");
  article.setAttribute("aria-labelledby", `${person.id}-name`);
  const portrait = portraitFigure(person, "member-portrait");
  if (portrait) article.append(portrait);
  const copy = personNode("div", "member-copy");
  const name = personNode("h4", "member-name", person.name);
  name.id = `${person.id}-name`;
  copy.append(name, personNode("p", "member-role", person.role));
  if (person.research_interest) copy.append(personNode("p", "member-interest", person.research_interest));
  if (person.email) copy.append(personLink(`mailto:${person.email}`, person.email));
  article.append(copy);
  return article;
}

function renderMemberGroups(members) {
  const container = document.querySelector("#member-groups");
  container.replaceChildren();
  const groups = new Map();
  members.forEach((member) => {
    if (!groups.has(member.group)) groups.set(member.group, []);
    groups.get(member.group).push(member);
  });

  groups.forEach((people, label) => {
    const section = personNode("section", "member-group");
    const heading = personNode("h3", "member-group-title", label);
    heading.id = `member-group-${people[0].id}`;
    section.setAttribute("aria-labelledby", heading.id);
    const grid = personNode("div", "member-grid");
    people.sort((a, b) => a.order - b.order).forEach((person) => grid.append(renderMember(person)));
    section.append(heading, grid);
    container.append(section);
  });
}

function renderAlumni(alumni) {
  const list = document.querySelector("#alumni-list");
  list.replaceChildren();
  alumni.sort((a, b) => a.order - b.order).forEach((person) => {
    const item = personNode("li", "alumni-entry");
    const name = personNode("span", "alumni-name", person.name);
    const details = personNode("span", "alumni-details", [person.role, person.period].filter(Boolean).join(" · "));
    item.append(name, details);
    if (person.current_affiliation) {
      item.append(personNode("span", "alumni-affiliation", `Source-era affiliation: ${person.current_affiliation}`));
    }
    list.append(item);
  });
}

async function renderPeoplePage() {
  const root = document.querySelector("#pi-content");
  if (!root) return;
  try {
    const [peopleResponse, siteResponse] = await Promise.all([
      fetch("/data/people.json"),
      fetch("/data/site.json")
    ]);
    if (!peopleResponse.ok || !siteResponse.ok) throw new Error("People or site data could not be loaded");
    const [people, site] = await Promise.all([peopleResponse.json(), siteResponse.json()]);
    renderPrincipalInvestigator(people.principal_investigator, site);
    renderMemberGroups(people.members);
    renderAlumni(people.alumni);
  } catch {
    const message = personNode("p", "content-error", "The people directory could not be loaded from the local content file.");
    root.replaceChildren(message);
  }
}

renderPeoplePage();
