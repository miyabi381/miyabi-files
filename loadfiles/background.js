const browser = self.browser || self.chrome;
const TARGETS = [
    "https://www.netflix.com/"
];


browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status !== "complete") return;
    if (!tab.url || !tab.url.startsWith("http")) return;
    if (!TARGETS.some(url => tab.url.startsWith(url))) return;

    browser.scripting.executeScript({
        target: { tabId },
        files: ["common.js", "main.js"]
    });
});
