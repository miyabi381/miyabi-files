const browser = self.browser || self.chrome;


// 自動入力ボタン処理
document.getElementById("reflect").addEventListener("click", async () => {
    // アクティブタブ取得
    const [tab] = await browser.tabs.query({
        active: true,
        currentWindow: true
    });
    if (!tab?.id) return;
    // jsにメッセージ
    browser.tabs.sendMessage(tab.id, {
        type: "REFLECT",
        inNaiyou: getValue("itemName")
    });
});

// エクスポートボタン処理
document.getElementById("exfile").addEventListener("click", async () => {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
    browser.tabs.sendMessage(tab.id, { type: "EXFILE-IN" });
});


