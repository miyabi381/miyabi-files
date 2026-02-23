const browser = self.browser || self.chrome;

// ページがロードされたらスクリプト挿入
browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status !== "complete") return;
    if (!tab.url || !tab.url.startsWith("http")) return;
    browser.scripting.executeScript({
        target: { tabId },
        files: ["common.js", "main.js"]
    });
});
