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

document.addEventListener("DOMContentLoaded", () => {
  setTheme(getInitialTheme());
  activateHomepageSection(getHomepageSectionFromHash());

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
