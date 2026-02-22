var browser = self.browser || self.chrome;

// ページがロードされたらスクリプト挿入
browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status !== "complete") return;
  if (!tab.url || !tab.url.startsWith("http")) return;
  browser.scripting.executeScript({
    target: { tabId },
    files: ["common.js", "main.js"]
  });
});

browser.runtime.onMessage.addListener(async (message, sender) => {
  switch (message.type) {
    case "DOWNLOAD_ZIP":
      browser.downloads.download({
        url: message.url,
        filename: "Zip-DL/" + message.filename,
        saveAs: false
      });
      break;

    case "DOWNLOAD_IMAGE":
      (async () => {
        try {
          const response = await fetch(message.url);
          const blob = await response.blob();
          // Blob → base64変換
          const reader = new FileReader();
          reader.onloadend = async () => {
            const dataUrl = reader.result;
            await browser.downloads.download({
              url: dataUrl,
              filename: "Image-DL/" + message.filename,
              conflictAction: "overwrite",
              saveAs: false
            });
          };
          reader.readAsDataURL(blob);
        } catch (err) {
          console.error("Image download failed:", err);
        }
      })();
      break;

    default:
      break;
  }

});