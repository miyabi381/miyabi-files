document.addEventListener("DOMContentLoaded", () => {
  console.log("viewfiles.js : loaded");

  const detail = document.getElementById("file-detail");
  const list = document.getElementById("file-list");

  if (list && detail) {
    list.addEventListener("click", (evt) => {
      const a = evt.target.closest("a");
      if (!a || !list.contains(a)) return;
      evt.preventDefault();
      const url = a.href;
      fetch(url)
        .then((res) => {
          if (!res.ok) throw new Error(`status ${res.status}`);
          console.log("response received", res.headers.get("Content-Type"));

          // 画像の場合
          if (res.headers.get("Content-Type").startsWith("image/")) {
            detail.innerHTML = `
              <h1>${a.textContent}</h1>
              <img src="${url}" style="max-width:100%; height:auto;" />
            `;
            return null; // ここで終了
          }

          // 画像以外はテキストとして処理
          return res.text();
        })
        .then((text) => {
          if (text === null) return; // 画像時はスキップ

          detail.innerHTML = `
            <h1>${a.textContent}</h1>
            <pre>${text.replace(/</g, "&lt;")}</pre>
          `;
        })
        .catch((err) => {
          detail.innerHTML = `<p>読み込みエラー: ${err.message}</p>`;
          console.error("failed to load file", err);
        });
    });
  }
});

