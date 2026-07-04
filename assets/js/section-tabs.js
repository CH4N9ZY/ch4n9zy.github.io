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
  const panel = Array.from(document.querySelectorAll("[data-section-panel]")).find(
    (item) => item.dataset.sectionPanel === section
  );
  return panel ? section : "home";
}

function sortPublicationList(list, sortType) {
  const items = Array.from(list.querySelectorAll(".publication-item"));
  const pairs = items.map((item) => ({
    item,
    spacer: item.nextElementSibling && item.nextElementSibling.tagName === "BR" ? item.nextElementSibling : null
  }));

  pairs.sort((a, b) => {
    if (sortType === "type") {
      return a.item.dataset.type.localeCompare(b.item.dataset.type) || Number(b.item.dataset.year) - Number(a.item.dataset.year);
    }

    if (sortType === "default") {
      return Number(a.item.dataset.originalIndex) - Number(b.item.dataset.originalIndex);
    }

    return Number(b.item.dataset.year) - Number(a.item.dataset.year);
  });

  pairs.forEach((pair) => {
    list.appendChild(pair.item);
    if (pair.spacer) {
      list.appendChild(pair.spacer);
    }
  });
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
}

function initPublicationControls() {
  document.querySelectorAll("[data-topic-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      filterPublications(button.dataset.topicFilter);
    });
  });

  document.querySelectorAll("[data-publication-sort]").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll("[data-publication-sort]").forEach((item) => {
        item.classList.toggle("is-active", item === button);
      });

      document.querySelectorAll(".publications ol.bibliography").forEach((list) => {
        sortPublicationList(list, button.dataset.publicationSort);
      });
    });
  });

  document.querySelectorAll("[data-publication-jump]").forEach((button) => {
    button.addEventListener("click", () => {
      const target = document.getElementById(button.dataset.publicationJump);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  document.querySelectorAll("[data-year-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      const year = button.dataset.yearFilter;
      document.querySelectorAll(".publication-item").forEach((item) => {
        item.hidden = item.dataset.year !== year;
      });

      document.querySelectorAll("[data-topic-filter]").forEach((item) => item.classList.remove("is-active"));
      document.querySelectorAll("[data-year-filter]").forEach((item) => {
        item.classList.toggle("is-active", item === button);
      });
      const heading = document.querySelector("[data-publication-heading]");
      if (heading) {
        heading.textContent = `Research Publications - ${year}`;
      }

      const fullPublications = document.getElementById("full-publications");
      if (fullPublications) {
        fullPublications.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setTheme(getInitialTheme());
  activateHomepageSection(getHomepageSectionFromHash());
  initPublicationControls();

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
});
