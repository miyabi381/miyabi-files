// =========================================================
// common.js (共有ユーティリティ)
// ---------------------------------------------------------
// main.js から呼び出される「部品関数」を集めたファイルです。
//
// ここで扱う主題:
// - 人の操作に近いクリックイベント発火
// - 非同期で追加される DOM 要素の待機
// - テキストラベルを使った要素検索の補助
//
// 初心者向け:
// 画面操作コードは「対象要素がまだ無い」問題で失敗しやすいため、
// waitFor / MutationObserver がとても重要です。
// =========================================================

// 共通ログ関数。
// 将来ログ形式を統一したくなったときに、ここだけ変更すれば済みます。
function cLog(text) {
	console.log(text);
}

// waitFor の重複待機をまとめるキャッシュ群です。
// 同じ root + selector を同時に待つとき、1つの Promise を共有します。
const waitForCache = new Map();
const waitForRootIds = new WeakMap();
let waitForRootSeq = 0;

// 人のクリックに近い順序でイベントを発火します。
// 多くの UI ライブラリは click だけでなく mousedown/up を前提にするため、
// 3つまとめて送るほうが安定します。
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

// target に「要素」または「CSSセレクタ文字列」を受け取れる便利関数です。
// - 要素が来た: そのまま click()
// - 文字列が来た: waitFor で要素出現を待ってから click()
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

// デバッグ用: humanClick 後に対象要素をログへ出します。
async function humanClick_Log(target) {
	await humanClick(target);
	cLog(typeof target === "object" ? target : await waitFor(target));
}

// 任意処理の実行時間(ms)を測る関数です。
// パフォーマンス確認やタイムアウト値調整の目安に使えます。
async function pTime(text, callback) {
	const start = performance.now();
	await callback();
	const end = performance.now();
	cLog(`${text} - elapsed ${end - start} ms`);
}

// 指定 ID の親要素配下から、タグ + 含有文字で要素を探します。
// 例:
//   getEl("calendarMain", "button", "日")
//   -> #calendarMain 内にある「日」を含む button を返す
function getEl(id, tag, title) {
	const parent = document.getElementById(id);
	if (!parent) return null;
	return [...parent.querySelectorAll(tag)].find((el) => el.textContent.includes(title)) || null;
}

// selector の要素が現れたタイミングで callback を1回だけ実行します。
// すでに存在していれば即時実行します。
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
// target:
// - DOM要素: その要素へ挿入
// - 文字列 : querySelector で取得した要素へ挿入
//
// addPos:
// - "appendChild" (末尾追加)
// - "prepend"     (先頭追加)
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

// text に labels のどれか1つでも含まれているか判定します。
function includesAnyText(text, labels) {
	return labels.some((label) => text.includes(label));
}

// root 要素内をタグ別に探索し、ラベル一致した最初の要素を返します。
function findInRoot(root, tagList, labels) {
	if (!root) return null;
	for (const tag of tagList) {
		for (const node of root.querySelectorAll(tag)) {
			const text = (node.textContent || "").trim();
			if (includesAnyText(text, labels)) return node;
		}
	}
	return null;
}

// 指定した単一 ID 領域だけを探索し、最初に見つかった要素を返します。
function findInId(id, tagList, labels) {
	return findInRoot(document.getElementById(id), tagList, labels);
}

// 任意条件 getter が真になるまでポーリング待機します。
async function waitUntil(getter, timeout = 10000, interval = 100, errorLabel = "要素待機タイムアウト") {
	const started = Date.now();
	while (Date.now() - started < timeout) {
		const node = getter();
		if (node) return node;
		await new Promise((resolve) => setTimeout(resolve, interval));
	}
	throw new Error(errorLabel);
}

// 単一 ID 領域内で対象要素を待機して humanClick します。
async function clickInId(id, tagList, labels, timeout = 8000) {
	const node = await waitUntil(
		() => findInId(id, tagList, labels),
		timeout,
		100,
		`要素待機タイムアウト: id=${id}, labels=${labels.join("|")}`
	);
	await humanClick(node);
}

// root ノードに一意 ID を割り当てます。
// WeakMap を使う理由:
// root が不要になったら GC で回収され、メモリリークしにくいからです。
function getRootId(root) {
	const existing = waitForRootIds.get(root);
	if (existing) return existing;
	const id = String(++waitForRootSeq);
	waitForRootIds.set(root, id);
	return id;
}

// 要素出現待ちの中核関数です。
//
// 挙動:
// 1. まず即時に querySelector して見つかれば resolve
// 2. 無ければ MutationObserver で DOM 変化を監視
// 3. timeout 経過で reject
// 4. 同条件(root+selector)の多重待機は Promise を共有
//
// 返り値:
// Promise<Element>
function waitFor(selector, root = document.documentElement, timeout = 3000) {
	const cacheKey = `${getRootId(root)}::${selector}`;
	if (waitForCache.has(cacheKey)) return waitForCache.get(cacheKey);

	const promise = new Promise((resolve, reject) => {
		let timerId;
		let observer;

		// 不正セレクタなどで querySelector が例外を投げる可能性があるため、
		// 例外を握りつぶさず reject へ流します。
		const safeQuery = () => {
			try {
				return root.querySelector(selector);
			} catch (e) {
				reject(e);
				return null;
			}
		};

		// 監視前に「今もうあるか」を必ず確認します。
		const existing = safeQuery();
		if (existing) {
			resolve(existing);
			return;
		}

		// DOM が変わるたびに再探索し、見つかった瞬間に完了します。
		observer = new MutationObserver(() => {
			const el = safeQuery();
			if (!el) return;
			observer.disconnect();
			if (timerId) clearTimeout(timerId);
			resolve(el);
		});

		observer.observe(root, { childList: true, subtree: true });

		// 見つからないまま timeout を超えたときはエラーにします。
		timerId = setTimeout(() => {
			observer.disconnect();
			const err = new Error(`${selector} : Timeout`);
			cLog(err.message);
			reject(err);
		}, timeout);
	}).finally(() => {
		// 終了した Promise はキャッシュから削除し、
		// 次回呼び出しで新しい待機を作れるようにします。
		waitForCache.delete(cacheKey);
	});

	waitForCache.set(cacheKey, promise);
	return promise;
}
