const THEME_KEY = "theme";

function detectTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY);
  if (savedTheme === "light" || savedTheme === "dark") return savedTheme;

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyHighlightTheme(theme) {
  const lightThemeLink = document.querySelector("link[href*='highlight.js'][href*='github.min.css']");
  const darkThemeLink = document.querySelector("link[href*='highlight.js'][href*='github-dark.min.css']");

  if (lightThemeLink) {
    lightThemeLink.disabled = theme === "dark";
  }

  if (darkThemeLink) {
    darkThemeLink.disabled = theme !== "dark";
  }
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  applyHighlightTheme(theme);

  const button = document.getElementById("theme-toggle");
  if (button) {
    const nextThemeLabel = theme === "dark" ? "ライトモード" : "ダークモード";
    button.textContent = nextThemeLabel;
    button.setAttribute("aria-label", `${nextThemeLabel}に切り替え`);
    button.setAttribute("title", `${nextThemeLabel}に切り替え`);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  console.log("main.js : loaded");

  const currentTheme = detectTheme();
  applyTheme(currentTheme);

  const button = document.getElementById("theme-toggle");
  if (!button) return;

  button.addEventListener("click", () => {
    const theme = document.documentElement.getAttribute("data-theme") === "dark"
      ? "light"
      : "dark";

    applyTheme(theme);
    localStorage.setItem(THEME_KEY, theme);
  });
});

