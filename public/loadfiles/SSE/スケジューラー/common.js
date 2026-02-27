// このファイルは main.js から利用する共通ユーティリティ群です。
// 目的:
// - 画面操作の疑似クリックを統一する
// - 動的DOMの出現待ちを安全に行う
// - ラベル文字列で要素探索しやすくする

// 共通ログ出力。
function cLog(text) {
	console.log(text);
}

// waitFor の重複待機をまとめるためのキャッシュ。
// 同じ root + selector の待機が同時に走った場合、1つの Promise を共有します。
const waitForCache = new Map();
const waitForRootIds = new WeakMap();
let waitForRootSeq = 0;

// 人がクリックした時に近いイベント順でマウスイベントを発火します。
function click(target) {
	if (!target) {
		throw new Error("click target is null or undefined");
	}
	const events = ["mousedown", "mouseup", "click"];
	events.forEach((type) =>
		target.dispatchEvent(
			new MouseEvent(type, {
				bubbles: true,
				cancelable: true,
				view: window
			})
		)
	);
}

// target に要素またはセレクタ文字列を受け取り、クリック処理を実行します。
async function humanClick(target) {
	if (!target) {
		throw new Error("humanClick target is null or undefined");
	}
	if (typeof target === "object") {
		click(target);
		return;
	}
	const el = await waitFor(target);
	click(el);
}

// クリック後に対象情報をログ出力するデバッグ用関数です。
async function humanClick_Log(target) {
	await humanClick(target);
	cLog(typeof target === "object" ? target : await waitFor(target));
}

// 任意の非同期処理の実行時間を測定します。
async function pTime(text, callback) {
	const start = performance.now();
	await callback();
	const end = performance.now();
	cLog(`${text} - elapsed ${end - start} ms`);
}

// 指定親要素(id)配下から、タグとラベル文字列で目的要素を検索します。
function getEl(id, tag, title) {
	const parent = document.getElementById(id);
	if (!parent) return null;
	return [...parent.querySelectorAll(tag)].find((el) => el.textContent.includes(title)) || null;
}

// 要素が新規に生成されたタイミングでコールバックを1回実行します。
function onElementCreated(selector, callback) {
	const existing = document.querySelector(selector);
	if (existing) {
		callback(existing);
		return;
	}

	const observer = new MutationObserver(() => {
		const el = document.querySelector(selector);
		if (el) {
			callback(el);
			observer.disconnect();
		}
	});

	observer.observe(document.documentElement, {
		childList: true,
		subtree: true
	});
}

// ボタン要素を作成し、指定位置へ挿入して返します。
// target は要素そのもの、または querySelector 文字列を受け付けます。
function createBtn(target, btnName, addPos = "appendChild") {
	const btn = document.createElement("button");
	btn.textContent = btnName;
	if (typeof target === "object") {
		target[addPos](btn);
	} else {
		document.querySelector(target)[addPos](btn);
	}
	return btn;
}

// waitFor キャッシュキー生成用に root ノードへ一意IDを割り当てます。
function getRootId(root) {
	const existing = waitForRootIds.get(root);
	if (existing) return existing;
	const id = String(++waitForRootSeq);
	waitForRootIds.set(root, id);
	return id;
}

// 要素出現待ち:
// - すぐ見つかれば即 resolve
// - 見つからなければ MutationObserver で監視
// - timeout 超過で reject
// - 同一条件の待機は Promise を共有
function waitFor(selector, root = document.documentElement, timeout = 3000) {
	const cacheKey = `${getRootId(root)}::${selector}`;
	if (waitForCache.has(cacheKey)) return waitForCache.get(cacheKey);

	const promise = new Promise((resolve, reject) => {
		let timerId;
		let observer;

		const safeQuery = () => {
			try {
				return root.querySelector(selector);
			} catch (e) {
				reject(e);
				return null;
			}
		};

		const existing = safeQuery();
		if (existing) {
			resolve(existing);
			return;
		}

		observer = new MutationObserver(() => {
			const el = safeQuery();
			if (!el) return;
			observer.disconnect();
			if (timerId) clearTimeout(timerId);
			resolve(el);
		});

		observer.observe(root, { childList: true, subtree: true });

		timerId = setTimeout(() => {
			observer.disconnect();
			const err = new Error(`${selector} : Timeout`);
			cLog(err.message);
			reject(err);
		}, timeout);
	}).finally(() => {
		waitForCache.delete(cacheKey);
	});

	waitForCache.set(cacheKey, promise);
	return promise;
}
