// このファイルは拡張機能のサービスワーカーです。
// 主な役割:
// 1. 対象URLのタブ読み込み完了時に、CSSとコンテンツスクリプトを注入する。
// 2. 同一タブ・同一URLへの二重注入を防止する。
// 3. 拡張機能インストール時に、外部画像からアクションアイコンを生成して設定する。

const browser = self.browser || self.chrome;

// 注入対象となるURLプレフィックス一覧。
// startsWith で判定するため、配下のパスも対象になります。
const TARGETS = [
	"https://miyabi381.github.io/Scheduler-test.html",
	"https://web.drm.ddreams.jp/drm/page2/schedule",
	"https://web.drm.ddreams.jp/drm/api/schedule"
];

// 注入済み管理:
// - キー: tabId
// - 値  : 最後に注入したURL
// 同じURLへ onUpdated が複数回来ても再注入しないために使います。
const injectedByTab = new Map();

browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
	// ページ遷移開始時:
	// 次の complete で再注入できるよう、注入済み情報をクリアします。
	if (changeInfo.status === "loading") {
		injectedByTab.delete(tabId);
		return;
	}

	// 読み込み完了以外は無視。
	if (changeInfo.status !== "complete") return;
	// 破棄タブは処理不要。
	if (tab.discarded) return;
	// URL不明またはHTTP系以外は対象外。
	if (!tab.url || !tab.url.startsWith("http")) return;
	// 対象URLでなければ注入しない。
	if (!TARGETS.some((url) => tab.url.startsWith(url))) return;
	// すでに同じURLへ注入済みならスキップ。
	if (injectedByTab.get(tabId) === tab.url) return;

	injectedByTab.set(tabId, tab.url);

	// スタイルを先に注入して、UIちらつきを減らします。
	browser.scripting
		.insertCSS({
			target: { tabId },
			files: ["main.css"]
		})
		.catch(console.error);

	// 共通関数(common.js) → 本体(main.js) の順で注入します。
	browser.scripting
		.executeScript({
			target: { tabId },
			files: ["common.js", "main.js"]
		})
		.catch(console.error);
});

// タブクローズ時にメモリ上の注入管理情報を掃除します。
browser.tabs.onRemoved.addListener((tabId) => {
	injectedByTab.delete(tabId);
});

// 外部アイコン画像のURLと、生成するサイズ一覧。
const ICON_URL = "https://web.drm.ddreams.jp/drm/static/asset/img/icon_Essentials.png";
const SIZES = [16, 32, 48, 128];

// 指定URLの画像を取得し、ImageBitmapへ変換します。
// 以降のリサイズ描画で再利用しやすくする目的です。
async function fetchAsBitmap(url) {
	const res = await fetch(url);
	if (!res.ok) throw new Error(`fetch failed: ${res.status}`);
	const blob = await res.blob();
	return createImageBitmap(blob);
}

// 1サイズ分の ImageData を生成します。
// OffscreenCanvas を使うことでサービスワーカーでも描画処理できます。
async function makeImageData(bitmap, size) {
	const canvas = new OffscreenCanvas(size, size);
	const ctx = canvas.getContext("2d", { willReadFrequently: true });
	ctx.clearRect(0, 0, size, size);
	ctx.drawImage(bitmap, 0, 0, size, size);
	return ctx.getImageData(0, 0, size, size);
}

// 全サイズのアイコン画像データを生成し、拡張機能のアクションアイコンに設定します。
async function setActionIconsFromUrl(url) {
	const bmp = await fetchAsBitmap(url);
	const dict = {};
	for (const size of SIZES) {
		dict[size] = await makeImageData(bmp, size);
	}
	await browser.action.setIcon({ imageData: dict });
}

// インストール時にアイコンを一度だけ生成設定します。
browser.runtime.onInstalled.addListener(() => {
	setActionIconsFromUrl(ICON_URL).catch(console.error);
});
