
/*====== ▼ パス ▼ =========================================================*/
// 一覧ボタン
const pathItiranBtn = "#calendarMain > div.fc-header-toolbar.fc-toolbar.fc-toolbar-ltr > div:nth-child(1) > div > button.fc-showScheduleOfOtherMember-button.fc-button.fc-button-primary";
// グループ一覧
const pathGroupItiran = "#calendarSetting";
// 設定ボタン
const pathSetteiBtn = "#containerRegisterSchedule_0-ModalCalensarSetting > div.fullscreenOverlay-0 > div.ess-local-header.header.headerFullscreenOverlay > div > div.containerHeaderTitle-btMenu > div > button";
// 表示グループ切替ボタン追加
const pathAddGroupBtn = "#calendarMain > div.fc-header-toolbar.fc-toolbar.fc-toolbar-ltr > div:nth-child(1)";
// グループ一覧　タイトルspan
const pathGroupTitle = "#containerRegisterSchedule_0-ModalCalensarSetting > div.fullscreenOverlay-0 > div.bodyFullscreenOverlay > div > div > div.mb-5 > div:nth-child(3) > div > a > div > span > div.titleHeadline";


(() => {
	/*====== ▼ ページ読み込み時 ▼ ======================================================*/
	// 一覧表示ボタンクリック
	if (!document.querySelector(pathItiranBtn)) {
		// cLog("firstItiranBtn nasi");
		return;
	}
	const firstItiranBtn = document.querySelector(pathItiranBtn);
	humanClick(firstItiranBtn);

	// グループ一覧非表示
	onElementCreated(pathGroupItiran, (div) => {
		div.style.display = "none";
	});

	// グループ一覧表示名取得
	onElementCreated(pathGroupTitle, () => {
		const root = document.querySelector('#containerRegisterSchedule_0-ModalCalensarSetting');
		var gTitles = Array.from(
			root.querySelectorAll('.accordionWithIndication .titleHeadline'),
			el => el.textContent.trim()
		);
		// グループの数だけボタン生成
		gTitles.forEach((title, index) => {
			const btn = createBtn(pathAddGroupBtn, title);
			btn.onclick = () => {
				gXBtn(index + 3);
				btn.className = swapValue(btn.className, "groupBtn", "groupBtn isActive");
			};
			btn.className = "groupBtn";
		});
	});


	// 設定ボタンクリック
	onElementCreated(pathSetteiBtn, (btn) => {
		humanClick(btn);
	});

	/*====== ▼ グループ選択ボタン処理 ▼ ===================================================*/
	function gXBtn(childNum) {
		const itiranbtn = document.querySelector(pathItiranBtn);
		humanClick(itiranbtn);
		onElementCreated(pathGroupItiran, (div) => { div.style.display = "none"; });
		onElementCreated('#containerRegisterSchedule_0-ModalCalensarSetting > div.fullscreenOverlay-0 > div.bodyFullscreenOverlay > div > div > div.mb-5 > div:nth-child(' + childNum + ') > div > a > div > span', (area) => { humanClick(area); });
		onElementCreated(pathSetteiBtn, (btn) => { humanClick(btn); });
	}


	/*====== ▼ 会議室ボタン ▼ =========================================================*/

	// 会議室表示切替ボタン追加
	const addKaigiBtn = "#calendarMain > div.fc-header-toolbar.fc-toolbar.fc-toolbar-ltr > div:nth-child(3)"
	// 会議室タブ
	const pathKaigiTab = "#containerRegisterSchedule_0-ModalCalensarSetting > div.fullscreenOverlay-0 > div.bodyFullscreenOverlay > div > div > ul > li:nth-child(2) > a";
	// 会議室＞全て選択.選択解除
	const pathKaigiSelect = "#containerRegisterSchedule_1-meetingRoomSearchFromCalendarSetting > div.fullscreenOverlay-1 > div.bodyFullscreenOverlay > div > div > div > div:nth-child(3) > div > div > div:nth-child(2) > button";
	// 会議室＞設定
	const pathKaigiSettei = "#containerRegisterSchedule_1-meetingRoomSearchFromCalendarSetting > div.fullscreenOverlay-1 > div.ess-local-header.header.headerFullscreenOverlay > div > div.containerHeaderTitle-btMenu > div > button";
	// 会議室＞会議室を検索
	const pathKaigiSearch = "#containerRegisterSchedule_0-ModalCalensarSetting > div.fullscreenOverlay-0 > div.bodyFullscreenOverlay > div > div > div:nth-child(5) > div > div > div:nth-child(2) > div > button";

	// ボタン生成
	onElementCreated(addKaigiBtn, () => {
		const kaigiBTN = createBtn(addKaigiBtn, "会議室", "prepend");
		kaigiBTN.onclick = () => {
			kaigiBtn(kaigiBTN.className);
			kaigiBTN.className = swapValue(kaigiBTN.className, "groupBtn", "groupBtn isActive");
		}
		kaigiBTN.className = "groupBtn";
	});


	/*====== ▼ 会議室ボタン処理 ▼ =========================================================*/
	// 表示　 一覧ボタン＞会議室＞全てを選択＞設定＞設定s
	function kaigiShow() {
		const itiranbtn = document.querySelector(pathItiranBtn);
		humanClick(itiranbtn);
		onElementCreated(pathGroupItiran, (div) => { div.style.display = "none"; });
		onElementCreated(pathKaigiTab, (tab) => {
			humanClick(tab);
			onElementCreated("#containerRegisterSchedule_1-meetingRoomSearchFromCalendarSetting > div.fullscreenOverlay-1 > div.bodyFullscreenOverlay > div > div > div > div:nth-child(4) > div > div:nth-child(1) > ul > li > div", () => {
				humanClick(document.querySelector(pathKaigiSelect));
				onElementCreated(pathKaigiSettei, (ksettei) => {
					humanClick(ksettei);
					onElementCreated(pathSetteiBtn, (btn) => { humanClick(btn); });
				});
			});
		});
	}

	// 非表示　 一覧ボタン＞会議室＞会議室を検索＞選択を解除＞設定＞設定
	function kaigiHide() {
		const itiranbtn = document.querySelector(pathItiranBtn);
		humanClick(itiranbtn);
		onElementCreated(pathGroupItiran, (div) => { div.style.display = "none"; });
		onElementCreated("#containerRegisterSchedule_0-ModalCalensarSetting > div.fullscreenOverlay-0 > div.bodyFullscreenOverlay > div > div > div:nth-child(3) > div > div > div > div > div > div > div > div.-personArea > div", (tab) => {
			const kaitiTab = document.querySelector(pathKaigiTab);
			humanClick(kaitiTab);
			onElementCreated(pathKaigiSearch, (btn) => { humanClick(btn); });
			onElementCreated("#containerRegisterSchedule_1-meetingRoomSearchFromCalendarSetting > div.fullscreenOverlay-1 > div.bodyFullscreenOverlay > div > div > div > div:nth-child(4) > div > div:nth-child(1) > ul > li > div", () => {
				const ksbtn = document.querySelector(pathKaigiSelect);
				humanClick(ksbtn);
				onElementCreated(pathKaigiSettei, (ksettei) => { humanClick(ksettei); });
				onElementCreated(pathSetteiBtn, (btn) => { humanClick(btn); });
			});
		});
	}

	// トグル風
	function kaigiBtn(className) {
		if (className == "groupBtn") {
			kaigiShow();
		} else {
			kaigiHide();
		};
	};

	/*====== ▼ 会議人選択 ▼ ===================================================*/
	// 人ボタン挿入場所
	const addSearchHumanBtn = "";
	// 会議招集ボタン
	const pathKaigiShosyuBtn = "";
	//　大画面 自分の予定のところD＆Dで選択　＞　会議招集　＞　人を検索　＞　名前検索>☑　＞ 設定

	/*====== ▼ 仕上げ ▼ ===================================================*/
	console.log("TEST-END");
})();