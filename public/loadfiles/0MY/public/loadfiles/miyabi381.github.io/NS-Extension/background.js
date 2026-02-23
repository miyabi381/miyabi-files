const browser = self.browser || self.chrome;
const TARGETS = [
    "https://miyabi381.github.io/Scheduler-test.html",
    "https://web.drm.ddreams.jp/drm/page2/schedule",
    "https://web.drm.ddreams.jp/drm/api/schedule"
];


browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status !== "complete" || tab.discarded) return;
    if (!tab.url || !tab.url.startsWith("http")) return;
    if (!TARGETS.some(url => tab.url.startsWith(url))) return;
    
    browser.scripting.insertCSS({
        target: { tabId },
        files: ["main.css"]
    }).catch(console.error);
    browser.scripting.executeScript({
        target: { tabId },
        files: ["common.js", "main.js"]
    }).catch(console.error);
});