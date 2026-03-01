const EXT_TO_LANG = {
  js: "javascript",
  mjs: "javascript",
  cjs: "javascript",
  jsx: "jsx",
  ts: "typescript",
  tsx: "tsx",
  html: "xml",
  htm: "xml",
  css: "css",
  scss: "scss",
  sass: "sass",
  json: "json",
  md: "markdown",
  astro: "xml",
  xml: "xml",
  yml: "yaml",
  yaml: "yaml",
  sh: "bash",
  bash: "bash",
  py: "python",
  java: "java",
  php: "php",
  rb: "ruby",
  go: "go",
  rs: "rust",
  c: "c",
  h: "c",
  cpp: "cpp",
  hpp: "cpp",
  cs: "csharp",
  sql: "sql",
  txt: "plaintext",
};

let hljsPromise;

function getHljs() {
  if (!hljsPromise) {
    hljsPromise = import("https://cdn.jsdelivr.net/npm/highlight.js@11.11.1/+esm")
      .then((m) => m.default || m)
      .catch((err) => {
        console.error("highlight.js load failed", err);
        return null;
      });
  }
  return hljsPromise;
}

function inferLanguage(fileUrl) {
  const pathname = new URL(fileUrl, window.location.origin).pathname;
  const ext = pathname.split(".").pop()?.toLowerCase() || "";
  return EXT_TO_LANG[ext] || "plaintext";
}

function renderImage(detail, title, url) {
  detail.innerHTML = "";

  const h1 = document.createElement("h1");
  h1.textContent = title;

  const img = document.createElement("img");
  img.src = url;
  img.style.maxWidth = "100%";
  img.style.height = "auto";

  detail.append(h1, img);
}

async function renderCode(detail, title, url, text) {
  const language = inferLanguage(url);
  const hljs = await getHljs();

  detail.innerHTML = "";

  const h1 = document.createElement("h1");
  h1.textContent = title;

  const pre = document.createElement("pre");
  const code = document.createElement("code");
  code.textContent = text;

  if (hljs) {
    code.classList.add(`language-${language}`);
    hljs.highlightElement(code);
  }

  pre.appendChild(code);
  detail.append(h1, pre);
}

document.addEventListener("DOMContentLoaded", () => {
  console.log("viewfiles.js : loaded");

  const detail = document.getElementById("file-detail");
  const list = document.getElementById("file-list");

  if (!(list && detail)) return;

  list.addEventListener("click", async (evt) => {
    const a = evt.target.closest("a");
    if (!a || !list.contains(a)) return;

    evt.preventDefault();
    const url = a.href;

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`status ${res.status}`);

      const contentType = res.headers.get("Content-Type") || "";
      console.log("response received", contentType);

      if (contentType.startsWith("image/")) {
        renderImage(detail, a.textContent || "", url);
        return;
      }

      const text = await res.text();
      await renderCode(detail, a.textContent || "", url, text);
    } catch (err) {
      detail.innerHTML = `<p>読み込みエラー: ${err.message}</p>`;
      console.error("failed to load file", err);
    }
  });
});

