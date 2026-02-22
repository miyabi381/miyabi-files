// cLog("NetflixAutoSkip : 読み込み完了");

const browser = self.browser || self.chrome;

// 監視宣言
// 前回のあらすじスキップボタンが見つかったら
const arasujiSkip = onElementCreated("#appMountPoint > div > div > div > div > div.watch-video > div > div > div.default-ltr-iqcdef-cache-1m81c36 > div.watch-video--skip-content.default-ltr-iqcdef-cache-gpipej > button", (btn) => {
	humanClick(btn);
});
// イントロスキップボタンが見つかったら
const introSkip = onElementCreated("div > div.watch-video--skip-content.default-ltr-iqcdef-cache-gpipej > button", (btn) => {
	humanClick(btn);
});

// 視聴を続けるボタンが見つかったら
const keepWatching = onElementCreated("#appMountPoint > div > div > div > div > div.watch-video > div > div > div.watch-video--interrupt-autoplay.default-ltr-iqcdef-cache-1m81c36 > div > div > button:nth-child(1)", (btn) => {
	humanClick(btn);
	cLog("視聴続けるボタン押した！");
})

// メニューからのメッセージで処理
browser.storage.onChanged.addListener((changes, area) => {
	if (area !== 'local') return;
	// スキップボタンの処理
	if ("toggleSkipState" in changes) {
		if (changes.toggleSkipState.newValue) {
			arasujiSkip.start();
			introSkip.start();
		} else {
			arasujiSkip.stop();
			introSkip.stop();
		}
	} else {
		// 視聴継続ボタンの処理
		if (changes.toggleWatchState.newValue) {
			keepWatching.start();
			cLog("toggleWatchState - ON - onChanged");
		} else {
			keepWatching.stop();
			cLog("toggleWatchState - OFF - onChanged");
		}
	}
});

// 初期処理
browser.storage.local.get(
	{
		toggleSkipState: false,
		toggleWatchState: false
	},
	result => {
		if (result.toggleSkipState) {
			arasujiSkip.start();
			introSkip.start();
		} else {
			arasujiSkip.stop();
			introSkip.stop();
		}
		if (result.toggleWatchState) {
			keepWatching.start();
			cLog("toggleWatchState - ON");
		} else {
			keepWatching.stop();
			cLog("toggleWatchState - OFF");
		}
	}
);