//　ログ出力
function cLog(text) {
	console.log(text);
}

// クリックイベント
function humanClick(target) {
	const events = ['mousedown', 'mouseup', 'click'];
	events.forEach(type =>
		target.dispatchEvent(new MouseEvent(type, {
			bubbles: true, // 子要素まで
			cancelable: true, // デフォルト処理実行可
			view: window // ウィンドウ内で
		}))
	);
}


/**
 * 指定したセレクタの要素がDOMに生成されたら callback を実行する
 * @param {string} selector - 監視したい要素のセレクタ
 * @param {function} callback - 要素生成時に実行する関数
 */
function onElementCreated(selector, callback) {
	// すでに存在する場合は即実行
	const existing = document.querySelector(selector);
	if (existing) {
		callback(existing);
		return;
	}

	const observer = new MutationObserver(() => {
		const el = document.querySelector(selector);
		if (el) {
			callback(el);
			observer.disconnect(); // 1回で監視終了
		}
	});

	// DOM全体を監視（確実に存在するNode）
	observer.observe(document.documentElement, {
		childList: true,
		subtree: true
	});
}

// ボタン生成
function createBtn(path, btnName, addPos = "") {
	if (!document.querySelector(path)) return;
	addPos = addPos || "appendChild";
	const btn = document.createElement("button");
	btn.textContent = btnName;
	document.querySelector(path)[addPos](btn);
	return btn;
}

// トグルボタン風処理
function swapValue(target, firstValue, secondValue) {
	if (target == firstValue) {
		return secondValue;
	} else if (target == secondValue) {
		return firstValue;
	} else {
		return firstValue;
	}
}

// 同期処理
function waitFor(selector) {
	// プロミス生成 保留 ->　成功・失敗
	return new Promise((resolve, reject) => {

		// すでに存在する場合終了
		const existing = document.querySelector(selector);
		if (existing) return resolve(existing);

		// 監視処理　１回のみ
		const observer = new MutationObserver(() => {
			const el = document.querySelector(selector);
			if (el) {
				observer.disconnect();
				resolve(el);
			}
		});

		// body以下監視開始
		observer.observe(document.body, {
			childList: true,
			subtree: true
		});

		// 例外
		setTimeout(() => {
			observer.disconnect();
			reject(new Error("Timeout"));
		}, 10000);
	});
}
