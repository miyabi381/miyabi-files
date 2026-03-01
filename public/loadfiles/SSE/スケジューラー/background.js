// =========================================================
// background.js (Service Worker)
// ---------------------------------------------------------
// このファイルは「画面に直接表示されない裏方」です。
// ブラウザ拡張のイベント(タブ更新/インストール)を受け取り、
// 必要なタイミングで CSS / JS を対象ページへ注入します。
//
// 初心者向けポイント:
// - Service Worker は常駐アプリではなく、必要時に起動されます。
// - そのため「どのイベントで何をするか」を明示することが重要です。
// =========================================================

// Firefox系は self.browser、Chrome系は self.chrome を使います。
// 両方に対応できるように、存在する方を browser として扱います。
const browser = self.browser || self.chrome;

// 注入対象 URL の先頭文字列一覧です。
// 例: tab.url が "https://web.drm.ddreams.jp/drm/page2/schedule/..." でも
//     startsWith が true なので対象になります。
const TARGETS = [
	"https://miyabi381.github.io/Scheduler-test.html",
	"https://web.drm.ddreams.jp/drm/page2/schedule",
	"https://web.drm.ddreams.jp/drm/api/schedule"
];

// 「同じタブ・同じ URL への重複注入」を防ぐ管理表です。
// キー: tabId (タブ番号)
// 値  : 最後に注入した URL
//
// なぜ必要か:
// tabs.onUpdated は1回の画面表示中にも複数回呼ばれる場合があるため、
// そのままでは main.js が重複実行されることがあります。
const injectedByTab = new Map();

browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
	// ページ読み込み開始時("loading"):
	// 次のページでは再注入できるよう、前回の注入記録を消します。
	if (changeInfo.status === "loading") {
		injectedByTab.delete(tabId);
		return;
	}

	// 読み込み完了("complete")以外は処理しません。
	if (changeInfo.status !== "complete") return;
	// 破棄済みタブ(discarded)は非アクティブ状態なので処理不要です。
	if (tab.discarded) return;
	// URL 不明、または http/https 以外(chrome:// など)は対象外です。
	if (!tab.url || !tab.url.startsWith("http")) return;
	// 対象 URL に一致しない場合は注入しません。
	if (!TARGETS.some((url) => tab.url.startsWith(url))) return;
	// 同じ tabId + URL の組み合わせに注入済みなら再実行を避けます。
	if (injectedByTab.get(tabId) === tab.url) return;

	// ここまで来たら「このタブURLには注入した」と記録します。
	injectedByTab.set(tabId, tab.url);

	// 1) CSS を先に注入:
	//    ボタン生成より前に見た目定義を入れて、ちらつきを減らします。
	browser.scripting
		.insertCSS({
			target: { tabId },
			files: ["main.css"]
		})
		.catch(console.error);

	// 2) JS を注入:
	//    common.js は main.js から呼ばれる関数を定義しているため、
	//    必ず common.js -> main.js の順序で注入します。
	browser.scripting
		.executeScript({
			target: { tabId },
			files: ["common.js", "main.js"]
		})
		.catch(console.error);
});

// タブが閉じられたら、Map に残った記録を削除してメモリリークを防ぎます。
browser.tabs.onRemoved.addListener((tabId) => {
	injectedByTab.delete(tabId);
});

// 拡張機能アイコンの元画像 URL と、生成するサイズ一覧です。
const ICON_URL = "https://web.drm.ddreams.jp/drm/static/asset/img/icon_Essentials.png";
const SIZES = [16, 32, 48, 128];

// URL から画像をダウンロードし、描画しやすい ImageBitmap に変換します。
async function fetchAsBitmap(url) {
	const res = await fetch(url);
	// fetch は HTTP エラー(404等)でも reject しないため、明示チェックします。
	if (!res.ok) throw new Error(`fetch failed: ${res.status}`);
	const blob = await res.blob();
	return createImageBitmap(blob);
}

// 指定サイズの ImageData を1つ作る関数です。
// Service Worker は通常の <canvas> が使えないため、OffscreenCanvas を使います。
async function makeImageData(bitmap, size) {
	const canvas = new OffscreenCanvas(size, size);
	const ctx = canvas.getContext("2d", { willReadFrequently: true });
	// 念のためキャンバスをクリアしてから描画します。
	ctx.clearRect(0, 0, size, size);
	// 元画像を size x size にリサイズして描き込みます。
	ctx.drawImage(bitmap, 0, 0, size, size);
	// setIcon へ渡せる ImageData 形式で返します。
	return ctx.getImageData(0, 0, size, size);
}

// すべてのサイズ分を作って、ブラウザアクションのアイコンへ設定します。
async function setActionIconsFromUrl(url) {
	const bmp = await fetchAsBitmap(url);
	// setIcon({ imageData }) は { 16: ImageData, 32: ImageData, ... } の辞書形式です。
	const dict = {};
	for (const size of SIZES) {
		dict[size] = await makeImageData(bmp, size);
	}
	await browser.action.setIcon({ imageData: dict });
}

// 拡張機能のインストール時/更新時に呼ばれます。
// ここで一度アイコンを生成しておけば、通常利用時は余計な処理が不要です。
browser.runtime.onInstalled.addListener(() => {
	setActionIconsFromUrl(ICON_URL).catch(console.error);
});
