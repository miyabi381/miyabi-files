// グループ一覧 設定ボタン
const itiranSetteiBtn = document.createElement("button");
itiranSetteiBtn.textContent = "設定";
itiranSetteiBtn.className = "itiran-btn";
itiranSetteiBtn.addEventListener("click", () => {
	// 削除
	const kanshiTag = kanshi("#ここにグループ一覧 > div:nth-child(2) > div", () => delChildren(document.querySelector("#ここにグループ一覧 > div:nth-child(2)")));
	kanshiTag.start();
	kanshiTag.stop();
	itiranSetteiBtn.remove();
	// スケジュール表リセット
	delChildren(document.querySelector("#kari-Scheduler > tbody > tr:nth-child(6)"), "me");
	delChildren(document.querySelector("#kari-Scheduler > tbody > tr:nth-child(5)"), "me");
	delChildren(document.querySelector("#kari-Scheduler > tbody > tr:nth-child(4)"), "me");
	delChildren(document.querySelector("#kari-Scheduler > tbody > tr:nth-child(3)"), "me");
	// 生成
	showGroupList.forEach(val => showGroup(val));

});

// 選択されてるグループボタンの格納
const showGroupList = [];

//　一覧ボタンの処理
const itiranBTN = document.querySelector('body > div > div:nth-child(4) > button');
itiranBTN.addEventListener('click', () => {
	const target = document.querySelector('#ここにグループ一覧 > div:nth-child(2)');
	if (delChildren(target)) {
		itiranSetteiBtn.remove()
		return;
	}
	// グループ一覧の生成
	const groupList = document.createElement("div");
	groupList.setAttribute("name", "グループ一覧");
	groupList.setAttribute("class", "overlay");
	const groups = [
		"グループ１(にんじん,ぴーまん)",
		"グループ２(きゅうり,なす)",
		"グループ３(ぴーまん,きゅうり)",
		"グループ４(にんじん,きゅうり)",
		"グループ５(全部)"
	];
	const i = 0;

	// 設定ボタン追加
	groupList.appendChild(itiranSetteiBtn);

	groups.forEach(text => {
		const div = document.createElement("div");
		const span = document.createElement("span");
		span.textContent = text;

		div.addEventListener("click", () => {
			// ボタン名格納
			if (div.classList.toggle("isActive")) {
				if (!showGroupList.some(val => val === text)) showGroupList.push(text);
			} else {
				const indexGroup = showGroupList.indexOf(text);
				if (indexGroup !== -1) showGroupList.splice(indexGroup, 1);
			};
			// cLog(showGroupList);
		});

		// ボタンが選択されている場合処理
		if (showGroupList.some(val => val === text)) {
			div.className = "solid-box isActive";
		} else {
			div.className = "solid-box";
		};

		div.style.cursor = "pointer";

		div.appendChild(span);
		groupList.appendChild(div);
	});

	target.appendChild(groupList);
});


//グループ生成
const times = [6, 7, 8, 9, 10, 11]; // 時間
const ninjin = [{ name: "にんじん", items: { 6: "みじん切り" } }];
const piiman = [{ name: "ぴーまん", items: { 8: "輪切り", 10: "肉詰め" } }];
const kyuri = [{ name: "きゅうり", items: { 6: "輪切り", 7: "千切り" } }];
const nasu = [{ name: "なす", items: { 9: "揚げびたし", 10: "まーぼー", 11: "天ぷら" } }];

// 各種グループ行追加
function showGroup(text) {
	switch (text) {
		case "グループ１(にんじん,ぴーまん)":
			addTr(ninjin, times);
			addTr(piiman, times);
			break;
		case "グループ２(きゅうり,なす)":
			addTr(kyuri, times);
			addTr(nasu, times);
			break;
		case "グループ３(ぴーまん,きゅうり)":
			addTr(piiman, times);
			addTr(kyuri, times);
			break;
		case "グループ４(にんじん,きゅうり)":
			addTr(ninjin, times);
			addTr(kyuri, times);
			break;
		case "グループ５(全部)":
			addTr(ninjin, times);
			addTr(piiman, times);
			addTr(kyuri, times);
			addTr(nasu, times);
			break;
		default:
		// cLog("グループが存在しない！");
	};
}

// テーブルに行追加
// 行情報の配列 / 列数(配列)
function addTr(rows, times) {

	// すべてのthを取得
	const thList = Array.from(document.querySelectorAll("th"));
	// 追加したいthがすでに存在してるか
	const matched = thList.find(th => th.textContent.includes(rows[0].name));
	// 存在してたら消去
	if (matched) { matched.closest("tr").remove(); };

	const table = document.querySelector("#kari-Scheduler > tbody");
	rows.forEach(row => {

		const tr = document.createElement("tr");
		// 左端の野菜名
		const th = document.createElement("th");
		th.textContent = row.name;
		tr.appendChild(th);

		// 時間ごとのセル
		times.forEach(time => {
			const td = document.createElement("td");

			if (row.items[time]) {
				td.className = "cell-padding";

				const ber = document.createElement("ber");
				ber.className = "cell-item";
				ber.textContent = row.items[time];

				td.appendChild(ber);
			}

			tr.appendChild(td);
		});

		table.appendChild(tr);
	});
}

// 引数の文字列をログ出力
function cLog(text) {
	console.log(text);
}

// 引数の要素を非表示に
function hideElement(tag) {
	const targetElement = document.querySelector(tag);
	targetElement.style.display = "none";
}

// 引数の要素をすべて消す
function delChildren(target, me = "") {
	if (!target) {
		// cLog("delChildren : 要素が見つかりません");
		return;
	};
	if (me != "") {
		target.remove();
		// cLog("delChildren : " + target.textContent + " を削除");
		return;
	};
	if (target.childElementCount > 0) {
		target.replaceChildren();
		// cLog("delChildren : " + target.textContent + " 配下を削除");
		return true;
	} else {
		// cLog("delChildren:要素なし");
		return false;
	}
}

// 監視関数
function kanshi(target, callback, options = {}) {
	const root = options.root || document.body;
	const once = options.once ?? false;

	let observer = null;
	let done = false;

	const resolveTarget = () => {
		if (typeof target === 'string') {
			return document.querySelector(target);
		}
		if (target instanceof HTMLElement) {
			return target;
		}
		return null;
	};

	const detect = () => {
		const el = resolveTarget();
		if (!el) return;

		if (!once || !done) {
			done = true;
			callback(el);   // ← 外部関数をそのまま実行するだけ
			if (once) stop();
		}
	};

	const start = () => {
		if (observer) return; // すでに監視中なら何もしない
		detect(); // 既に存在している場合も拾う

		observer = new MutationObserver(() => {
			detect();
		});

		observer.observe(root, {
			childList: true,
			subtree: true,
		});
	};

	const stop = () => {
		observer?.disconnect();
		observer = null;
	};

	return { start, stop };
}
