// =========================================================
// main.js (機能本体)
// ---------------------------------------------------------
// このファイルは、スケジューラー画面に次の2機能を追加します。
//
// 1. グループ表示トグルボタン群
//    - 各グループを個別に ON/OFF できる
//
// 2. 会議室表示トグルボタン
//    - 会議室を一括で表示/非表示にできる
//
// 実装方針:
// - 既存画面の設定 UI を「自動操作」して実現する
// - 文言ラベル(例: "会議室", "保存")で要素を見つける
// - 動的画面に対応するため waitFor/waitUntil で待機する
// =========================================================

// 画面上のボタンやリンクの文言定義です。
// サイト側文言が変わった場合はここを更新するのが基本です。
const LABELS = {
	allView: "一覧表示",
	save: "設定",
	saveAlt: "保存",
	day: "日",
	meetingRoom: "会議室",
	selectAll: "全てを選択",
	selectAllAlt: "全選択",
	clearSelect: "選択を解除",
	clearSelectAlt: "選択解除",
	clearAlt: "解除",
	clearMeetingRoom: "会議室を解除",
	clearMeetingRoomAlt: "会議室解除",
	searchMeetingRoom: "会議室を検索",
	clearAll: "全てを解除",
	clearAllShort: "全解除",
	resetDisplay: "表示スケジュールをリセット",
	reset: "リセット"
};

// 取得したい要素のセレクタ群です。
// 1つに固定せず候補を複数持つことで、軽微な DOM 変更に耐えやすくします。
const SELECTORS = {
	allViewCandidates: [
		`[data-original-title='${LABELS.allView}']`,
		".fc-showScheduleOfOtherMember-button",
		"[class*='showScheduleOfOtherMember']"
	],
	calendarSetting: "#calendarSetting",
	groupTitle: "#calendarSetting .titleHeadline",
	toolbarChunk: ".fc-toolbar-chunk",
	seriesFacility: ".containerSeriesFacility, .seriesFacility.input-group"
};

// 画面内で使う主な ID です。
// モーダル内の要素探索時に「どの領域を探すか」を明確にするために使います。
const IDS = {
	calendarSetting: "calendarSetting",
	calendarModal: "containerRegisterSchedule_0-ModalCalensarSetting",
	meetingSearchModal: "containerRegisterSchedule_1-meetingRoomSearchFromCalendarSetting"
};

// 「解除」操作に該当するラベル群。
// 画面によって文言揺れがあるため、複数候補をまとめて扱います。
const CLEAR_LABELS = [
	LABELS.clearSelect,
	LABELS.clearSelectAlt,
	LABELS.clearAlt,
	LABELS.clearAll,
	LABELS.clearAllShort,
	LABELS.resetDisplay,
	LABELS.reset
];

// 「一覧表示」ボタンを候補セレクタから探します。
// 画面差分により class 名が変わる可能性があるため候補を列挙しています。
function findAllViewButton() {
	for (const selector of SELECTORS.allViewCandidates) {
		const el = document.querySelector(selector);
		if (el) return el;
	}
	return null;
}

// 設定画面を開く共通処理です。
//
// display 引数:
// - "none"  : 非表示のまま裏で操作する
// - "block" : 表示して操作する
async function openCalendarSetting(display = "none") {
	// まずツールバーの「一覧表示」ボタンが出るまで待ちます。
	// このボタンを押すことで設定パネルを開ける想定です。
	const allViewBtn = await waitUntil(
		() => findAllViewButton(),
		12000,
		120,
		"一覧表示ボタンの待機タイムアウト"
	);
	await humanClick(allViewBtn);
	// 設定パネル本体が DOM に出るまで待機します。
	const setting = await waitFor(SELECTORS.calendarSetting, document.documentElement, 12000);
	// 必要に応じて表示/非表示を切り替えます。
	setting.style.display = display;
	return setting;
}

// 設定画面を閉じる共通処理です。
// 「設定」または「保存」ボタンを探して押します。
async function closeCalendarSetting() {
	const saveBtn = findInId(IDS.calendarSetting, ["button"], [LABELS.save, LABELS.saveAlt]);
	if (saveBtn) await humanClick(saveBtn);
}

// ---------------------------------------------------------
// 機能1: グループ表示トグルボタン群のセットアップ
// ---------------------------------------------------------
// 流れ:
// 1. 設定画面を開いてグループ名一覧を取得
// 2. ツールバーにボタンコンテナを作る
// 3. グループ名ごとにボタン生成
// 4. ボタンクリック時に対応グループを切り替える
async function setupGroupToggleButtons() {
	// 背景で設定を開いて、グループ見出し(.titleHeadline)が出るまで待ちます。
	await openCalendarSetting("none");
	await waitFor(SELECTORS.groupTitle, document.documentElement, 12000);

	// 見出しテキストをボタン名として使います。
	const titles = Array.from(document.querySelectorAll(SELECTORS.groupTitle), (el) => el.textContent.trim());

	// 既存コンテナがあれば再利用、なければ新規作成。
	let container = document.getElementById("GroupViewToggleBottons");
	if (!container) {
		container = document.createElement("div");
		container.id = "GroupViewToggleBottons";
		(await waitFor(SELECTORS.toolbarChunk, document.documentElement, 12000)).appendChild(container);
	}

	// child が無いときだけボタンを作成し、重複追加を防ぎます。
	if (!container.childElementCount) {
		titles.forEach((title, index) => {
			const btn = createBtn(container, title);
			btn.className = "groupBtn";
			btn.onclick = async () => {
				// 見た目上のON/OFF状態を先に切り替えます。
				btn.classList.toggle("isActive");
				// index + 3 は既存画面のDOM構造に合わせたオフセットです。
				// (先頭に別要素があるため、グループ行が3番目から始まる想定)
				await toggleGroup(index + 3);
			};
		});
	}

	// セットアップ後は設定画面を閉じます。
	await closeCalendarSetting();

	// 実際のグループ切り替え実行関数です。
	// 毎回設定画面を開いて対象行をクリックし、保存して閉じます。
	async function toggleGroup(childNum) {
		await openCalendarSetting("none");
		await humanClick(await waitFor(`.mb-5 > div:nth-child(${childNum}) span`, document.documentElement, 12000));
		await closeCalendarSetting();
	}
}

// ---------------------------------------------------------
// 機能2: 会議室表示トグルボタンのセットアップ
// ---------------------------------------------------------
// ON/OFF で以下を自動実行します。
// - ON : 会議室を全選択して保存
// - OFF: 会議室選択を解除して保存
async function setupKaigiToggleButton() {
	// ツールバーがない状態でボタン追加すると失敗するため先に待機します。
	await waitFor(SELECTORS.toolbarChunk, document.documentElement, 12000);
	// すでに作成済みなら何もしません。
	if (document.getElementById("KaigiToggleButton")) return;

	// 「日」ボタンの周辺に会議室ボタンを差し込みます。
	const dayBtn = getEl("calendarMain", "button", LABELS.day);
	if (!dayBtn?.parentElement?.parentElement) return;

	const kaigiBtn = createBtn(dayBtn.parentElement.parentElement, LABELS.meetingRoom, "prepend");
	kaigiBtn.id = "KaigiToggleButton";
	kaigiBtn.className = "groupBtn";

	kaigiBtn.onclick = async () => {
		// 現在OFFなら次はON、現在ONなら次はOFFという判定です。
		const willShow = !kaigiBtn.classList.contains("isActive");
		kaigiBtn.classList.toggle("isActive", willShow);
		try {
			if (willShow) {
				// ON 処理: 会議室を表示
				await kaigiShow();
			} else {
				// OFF 処理: 会議室を非表示
				await kaigiHide();
			}
		} catch (e) {
			// 途中失敗時は見た目状態を元へ戻して整合性を保ちます。
			kaigiBtn.classList.toggle("isActive", !willShow);
			throw e;
		}
	};

	// 会議室表示 ON の実処理です。
	async function kaigiShow() {
		// 設定画面を表示状態で開きます(ユーザーが状態確認しやすい)。
		await openCalendarSetting("block");
		// 「会議室」タブ/リンクを開きます。
		await clickInId(IDS.calendarSetting, ["a"], [LABELS.meetingRoom], 12000);
		// 会議室一覧UIが出るまで待機します。
		await waitFor(SELECTORS.seriesFacility, document.documentElement, 12000);
		// 一括選択を実行します。
		await clickInId(IDS.calendarSetting, ["button"], [LABELS.selectAll, LABELS.selectAllAlt], 12000);
		// 会議室検索モーダル側の保存を押します。
		await clickInId(IDS.meetingSearchModal, ["button"], [LABELS.save, LABELS.saveAlt], 12000);
		// 設定画面を閉じて確定します。
		await closeCalendarSetting();
	}

	// 会議室表示 OFF の実処理です。
	async function kaigiHide() {
		await openCalendarSetting("block");
		await clickInId(IDS.calendarSetting, ["a"], [LABELS.meetingRoom], 12000);
		// 画面によっては「検索」「解除」など文言が異なるため、
		// 候補ラベルをまとめて対象ボタンを押します。
		await clickInId(
			IDS.calendarModal,
			["button"],
			[LABELS.searchMeetingRoom, LABELS.clearMeetingRoom, LABELS.clearMeetingRoomAlt],
			12000
		);
		await waitFor(SELECTORS.seriesFacility, document.documentElement, 12000);
		// 解除系ラベル群を「会議室検索モーダル内のみ」で探して実行します。
		await clickInId(IDS.meetingSearchModal, ["button", "a", "span"], CLEAR_LABELS, 12000);
		await clickInId(IDS.meetingSearchModal, ["button"], [LABELS.save, LABELS.saveAlt], 12000);
		await closeCalendarSetting();
	}
}

// 初期化全体のリトライ制御です。
// 動的ページでは読み込み順で失敗することがあるため、短い間隔で再試行します。
async function initializeWithRetry(maxRetries = 3) {
	let lastError;
	for (let i = 0; i < maxRetries; i++) {
		try {
			// 2機能のボタンを順にセットアップします。
			await setupGroupToggleButtons();
			await setupKaigiToggleButton();
			return;
		} catch (e) {
			lastError = e;
			// 失敗回数が増えるほど待機を少し長くして再試行します。
			await new Promise((resolve) => setTimeout(resolve, 500 * (i + 1)));
		}
	}
	// すべて失敗した場合は最後のエラーを投げます。
	throw lastError;
}

// 拡張機能の実行開始点です。
(function initSchedulerExtension() {
	// 二重実行防止フラグ。
	// 同ページで script が再評価されても 1 回しか初期化しません。
	if (window.__schedulerExtInitialized) return;
	window.__schedulerExtInitialized = true;

	(async () => {
		try {
			await initializeWithRetry(3);
		} catch (e) {
			// 失敗してもページ全体を止めないため、ログ出力に留めます。
			console.error(e);
		}
	})();
})();
