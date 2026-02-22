const browser = self.browser || self.chrome;

// ID run のボタンが押されたら
document.getElementById("run").addEventListener("click", async () => {
    // アクティブタブ取得
    const [tab] = await browser.tabs.query({
        active: true,
        currentWindow: true
    });
    if (!tab?.id) return;

    // jsにメッセージ
    browser.tabs.sendMessage(tab.id, {
        type: "START_SCROLL"
    });
});