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
    });

    browser.scripting.executeScript({
        target: { tabId },
        files: ["common.js", "main.js"]
    });
});

// ツールバーのアイコン変更
const ICON_URL = 'https://media.discordapp.net/attachments/604687467387420676/1472095632737964082/icon128.png?ex=6992a4e5&is=69915365&hm=026c9b37e9e086a5cee11bfd55f959c81472bd3b3388a899f275beaa68e15cd6&=&format=webp&quality=lossless&width=102&height=102';
const SIZES = [16, 32, 48, 128];

// URLの画像をBitmapに変換
async function fetchAsBitmap(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`fetch failed: ${res.status}`);
    const blob = await res.blob();
    return await createImageBitmap(blob);
}

// 指定サイズのImageDataを作る
async function makeImageData(bitmap, size) {
    const canvas = new OffscreenCanvas(size, size);
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.clearRect(0, 0, size, size);
    // 必要に応じて背景透明/丸角などの加工をここで実施
    ctx.drawImage(bitmap, 0, 0, size, size);
    return ctx.getImageData(0, 0, size, size);
}

// URLからactionアイコンを一括更新
async function setActionIconsFromUrl(url) {
    const bmp = await fetchAsBitmap(url);
    const dict = {};
    for (const size of SIZES) {
        dict[size] = await makeImageData(bmp, size);
    }
    await browser.action.setIcon({ imageData: dict });
}

// 拡張のインストール/起動時に設定
browser.runtime.onInstalled.addListener(() => {
    setActionIconsFromUrl(ICON_URL).catch(console.error);
});
browser.runtime.onStartup.addListener(() => {
    setActionIconsFromUrl(ICON_URL).catch(console.error);
});
