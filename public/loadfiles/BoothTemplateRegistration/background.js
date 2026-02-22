const browser = self.browser || self.chrome;
const TARGETS = [
    "https://manage.booth.pm/items/"
];

// ページ更新時の処理
browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status !== "complete") return;
    if (!tab.url || !tab.url.startsWith("http")) return;
    if (!TARGETS.some(url => tab.url.startsWith(url))) return;

    browser.scripting.executeScript({
        target: { tabId },
        files: ["common.js", "main.js"]
    });
});


// jsからのメッセージ処理
browser.runtime.onMessage.addListener((msg, sender) => {
    switch (msg.type) {
        case "EXFILE-OUT":
            const base64 = btoa(unescape(encodeURIComponent(msg.content)));
            const url = `data:${msg.mime};base64,${base64}`;
            browser.downloads.download({
                url,
                filename: msg.filename, // パスみたいなもん拡張子設定
                saveAs: false // 保存しますか？
            });
            break;

        case "tmp":

            break;
        default:
            return;
    }


});
