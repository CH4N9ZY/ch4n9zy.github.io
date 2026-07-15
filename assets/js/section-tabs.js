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

function setTheme(theme) {
  const nextTheme = theme === "dark" ? "dark" : "light";
  const root = document.documentElement;
  const toggle = document.querySelector("[data-theme-toggle]");
  const icon = toggle ? toggle.querySelector("i") : null;

  root.setAttribute("data-theme", nextTheme);
  try {
    localStorage.setItem("theme", nextTheme);
  } catch (error) {
    root.setAttribute("data-theme", nextTheme);
  }

  if (toggle) {
    toggle.setAttribute("aria-label", nextTheme === "dark" ? "Switch to light mode" : "Switch to dark mode");
    toggle.setAttribute("title", nextTheme === "dark" ? "Switch to light mode" : "Switch to dark mode");
  }

  if (icon) {
    icon.className = nextTheme === "dark" ? "fa-solid fa-sun" : "fa-solid fa-moon";
  }
}

function getInitialTheme() {
  try {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light" || savedTheme === "dark") {
      return savedTheme;
    }
  } catch (error) {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getHomepageSectionFromHash() {
  const section = window.location.hash.replace("#", "");
  if (section.indexOf("pub-") === 0) {
    return "publication";
  }

  const panel = Array.from(document.querySelectorAll("[data-section-panel]")).find(
    (item) => item.dataset.sectionPanel === section
  );
  return panel ? section : "home";
}

function resetPublicationFilters() {
  const heading = document.querySelector("[data-publication-heading]");

  document.querySelectorAll(".publication-item").forEach((item) => {
    item.hidden = false;
  });

  document.querySelectorAll("[data-topic-filter]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.topicFilter === "all");
  });
  document.querySelectorAll("[data-year-filter]").forEach((button) => button.classList.remove("is-active"));

  if (heading) {
    heading.textContent = "Research Publications - All";
  }
}

function filterPublications(topic) {
  const selectedTopic = topic || "all";
  const heading = document.querySelector("[data-publication-heading]");
  const label = selectedTopic === "all" ? "All" : selectedTopic.replace(/\b\w/g, (letter) => letter.toUpperCase());

  document.querySelectorAll(".publication-item").forEach((item) => {
    const topics = item.dataset.topics || "";
    item.hidden = selectedTopic !== "all" && !topics.includes(selectedTopic);
  });

  document.querySelectorAll("[data-topic-filter]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.topicFilter === selectedTopic);
  });
  document.querySelectorAll("[data-year-filter]").forEach((button) => button.classList.remove("is-active"));

  if (heading) {
    heading.textContent = `Research Publications - ${label}`;
  }

  scrollToPublicationResults();
}

function filterPublicationsByYear(year) {
  const selectedYear = year || "all";
  const heading = document.querySelector("[data-publication-heading]");

  document.querySelectorAll(".publication-item").forEach((item) => {
    item.hidden = selectedYear !== "all" && item.dataset.year !== selectedYear;
  });

  document.querySelectorAll("[data-year-filter]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.yearFilter === selectedYear);
  });
  document.querySelectorAll("[data-topic-filter]").forEach((button) => button.classList.remove("is-active"));

  if (heading) {
    heading.textContent = `Research Publications - ${selectedYear === "all" ? "All" : selectedYear}`;
  }

  scrollToPublicationResults();
}

function scrollToPublicationResults() {
  const results = document.getElementById("full-publications");
  if (results) {
    results.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function scrollToPublicationItem(publicationId) {
  const target = document.getElementById(publicationId);
  if (target) {
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function openPublicationItem(publicationId) {
  if (!publicationId) {
    return;
  }

  activateHomepageSection("publication");
  resetPublicationFilters();
  history.pushState(null, "", `#${publicationId}`);
  window.requestAnimationFrame(() => {
    scrollToPublicationItem(publicationId);
  });
}

function initPublicationControls() {
  document.querySelectorAll("[data-topic-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      filterPublications(button.dataset.topicFilter);
    });
  });

  document.querySelectorAll("[data-year-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      filterPublicationsByYear(button.dataset.yearFilter);
    });
  });

  document.querySelectorAll("[data-publication-target]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      openPublicationItem(link.dataset.publicationTarget);
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setTheme(getInitialTheme());
  activateHomepageSection(getHomepageSectionFromHash());
  initPublicationControls();

  const initialPublicationId = window.location.hash.replace("#", "");
  if (initialPublicationId.indexOf("pub-") === 0) {
    resetPublicationFilters();
    window.requestAnimationFrame(() => {
      scrollToPublicationItem(initialPublicationId);
    });
  }

  document.querySelectorAll("[data-section-target]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const section = link.dataset.sectionTarget;
      activateHomepageSection(section);
      history.pushState(null, "", `#${section}`);
    });
  });

  const themeToggle = document.querySelector("[data-theme-toggle]");
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const currentTheme = document.documentElement.getAttribute("data-theme") || getInitialTheme();
      setTheme(currentTheme === "dark" ? "light" : "dark");
    });
  }
});

window.addEventListener("hashchange", () => {
  activateHomepageSection(getHomepageSectionFromHash());
  const publicationId = window.location.hash.replace("#", "");
  if (publicationId.indexOf("pub-") === 0) {
    resetPublicationFilters();
    window.requestAnimationFrame(() => {
      scrollToPublicationItem(publicationId);
    });
  }
});
