function activateHomepageSection(sectionName) {
  const section = sectionName || "home";
  const panels = document.querySelectorAll("[data-section-panel]");
  const navLinks = document.querySelectorAll("[data-section-target]");

  panels.forEach((panel) => {
    panel.classList.toggle("is-active", panel.dataset.sectionPanel === section);
  });

  navLinks.forEach((link) => {
    const isActive = link.dataset.sectionTarget === section;
    link.classList.toggle("is-active", isActive);
    if (isActive) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

function getHomepageSectionFromHash() {
  const section = window.location.hash.replace("#", "");
  const panel = Array.from(document.querySelectorAll("[data-section-panel]")).find(
    (item) => item.dataset.sectionPanel === section
  );
  return panel ? section : "home";
}

document.addEventListener("DOMContentLoaded", () => {
  activateHomepageSection(getHomepageSectionFromHash());

  document.querySelectorAll("[data-section-target]").forEach((link) => {
    link.addEventListener("click", () => {
      activateHomepageSection(link.dataset.sectionTarget);
    });
  });
});

window.addEventListener("hashchange", () => {
  activateHomepageSection(getHomepageSectionFromHash());
});
