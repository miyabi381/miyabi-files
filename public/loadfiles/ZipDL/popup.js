const browser = self.browser || self.chrome;

async function sendMessage(type) {

    const [tab] = await browser.tabs.query({
        active: true,
        currentWindow: true
    });

    if (!tab?.id) return;

    browser.tabs.sendMessage(tab.id, { type });
}

// 10回
document.getElementById("run").addEventListener("click", () => {
    sendMessage("START_SCROLL");
});

// 1回
document.getElementById("once").addEventListener("click", () => {
    sendMessage("START_ONCE");
});

// 画像
document.getElementById("images").addEventListener("click", () => {
    sendMessage("START_IMAGE_DL");
});