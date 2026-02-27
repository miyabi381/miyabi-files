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

const IDS = {
	calendarSetting: "calendarSetting",
	calendarModal: "containerRegisterSchedule_0-ModalCalensarSetting",
	meetingSearchModal: "containerRegisterSchedule_1-meetingRoomSearchFromCalendarSetting"
};

const CLEAR_LABELS = [
	LABELS.clearSelect,
	LABELS.clearSelectAlt,
	LABELS.clearAlt,
	LABELS.clearAll,
	LABELS.clearAllShort,
	LABELS.resetDisplay,
	LABELS.reset
];

function includesAnyText(text, labels) {
	return labels.some((label) => text.includes(label));
}

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

function findInIds(idList, tagList, labels) {
	for (const id of idList) {
		const node = findInRoot(document.getElementById(id), tagList, labels);
		if (node) return node;
	}
	return null;
}

function findAllViewButton() {
	for (const selector of SELECTORS.allViewCandidates) {
		const el = document.querySelector(selector);
		if (el) return el;
	}
	return null;
}

async function waitUntil(getter, timeout = 10000, interval = 100, errorLabel = "要素待機タイムアウト") {
	const started = Date.now();
	while (Date.now() - started < timeout) {
		const node = getter();
		if (node) return node;
		await new Promise((resolve) => setTimeout(resolve, interval));
	}
	throw new Error(errorLabel);
}

async function clickById(id, tagList, labels, timeout = 8000) {
	const node = await waitUntil(
		() => findInIds([id], tagList, labels),
		timeout,
		100,
		`要素待機タイムアウト: id=${id}, labels=${labels.join("|")}`
	);
	await humanClick(node);
}

async function clickByIds(idList, tagList, labels, timeout = 8000) {
	const node = await waitUntil(
		() => findInIds(idList, tagList, labels),
		timeout,
		100,
		`要素待機タイムアウト: ids=${idList.join(",")}, labels=${labels.join("|")}`
	);
	await humanClick(node);
}

async function openCalendarSetting(display = "none") {
	const allViewBtn = await waitUntil(
		() => findAllViewButton(),
		12000,
		120,
		"一覧表示ボタンの待機タイムアウト"
	);
	await humanClick(allViewBtn);
	const setting = await waitFor(SELECTORS.calendarSetting, document.documentElement, 12000);
	setting.style.display = display;
	return setting;
}

async function closeCalendarSetting() {
	const saveBtn = findInIds([IDS.calendarSetting], ["button"], [LABELS.save, LABELS.saveAlt]);
	if (saveBtn) await humanClick(saveBtn);
}

async function setupGroupToggleButtons() {
	await openCalendarSetting("none");
	await waitFor(SELECTORS.groupTitle, document.documentElement, 12000);

	const titles = Array.from(document.querySelectorAll(SELECTORS.groupTitle), (el) => el.textContent.trim());

	let container = document.getElementById("GroupViewToggleBottons");
	if (!container) {
		container = document.createElement("div");
		container.id = "GroupViewToggleBottons";
		(await waitFor(SELECTORS.toolbarChunk, document.documentElement, 12000)).appendChild(container);
	}

	if (!container.childElementCount) {
		titles.forEach((title, index) => {
			const btn = createBtn(container, title);
			btn.className = "groupBtn";
			btn.onclick = async () => {
				btn.classList.toggle("isActive");
				await toggleGroup(index + 3);
			};
		});
	}

	await closeCalendarSetting();

	async function toggleGroup(childNum) {
		await openCalendarSetting("none");
		await humanClick(await waitFor(`.mb-5 > div:nth-child(${childNum}) span`, document.documentElement, 12000));
		await closeCalendarSetting();
	}
}

async function setupKaigiToggleButton() {
	await waitFor(SELECTORS.toolbarChunk, document.documentElement, 12000);
	if (document.getElementById("KaigiToggleButton")) return;

	const dayBtn = getEl("calendarMain", "button", LABELS.day);
	if (!dayBtn?.parentElement?.parentElement) return;

	const kaigiBtn = createBtn(dayBtn.parentElement.parentElement, LABELS.meetingRoom, "prepend");
	kaigiBtn.id = "KaigiToggleButton";
	kaigiBtn.className = "groupBtn";

	kaigiBtn.onclick = async () => {
		const willShow = !kaigiBtn.classList.contains("isActive");
		kaigiBtn.classList.toggle("isActive", willShow);
		try {
			if (willShow) {
				await kaigiShow();
			} else {
				await kaigiHide();
			}
		} catch (e) {
			kaigiBtn.classList.toggle("isActive", !willShow);
			throw e;
		}
	};

	async function kaigiShow() {
		await openCalendarSetting("block");
		await clickById(IDS.calendarSetting, ["a"], [LABELS.meetingRoom], 12000);
		await waitFor(SELECTORS.seriesFacility, document.documentElement, 12000);
		await clickById(IDS.calendarSetting, ["button"], [LABELS.selectAll, LABELS.selectAllAlt], 12000);
		await clickById(IDS.meetingSearchModal, ["button"], [LABELS.save, LABELS.saveAlt], 12000);
		await closeCalendarSetting();
	}

	async function kaigiHide() {
		await openCalendarSetting("block");
		await clickById(IDS.calendarSetting, ["a"], [LABELS.meetingRoom], 12000);
		await clickById(
			IDS.calendarModal,
			["button"],
			[LABELS.searchMeetingRoom, LABELS.clearMeetingRoom, LABELS.clearMeetingRoomAlt],
			12000
		);
		await waitFor(SELECTORS.seriesFacility, document.documentElement, 12000);
		await clickByIds(
			[IDS.meetingSearchModal, IDS.calendarModal, IDS.calendarSetting],
			["button", "a", "span"],
			CLEAR_LABELS,
			12000
		);
		await clickById(IDS.meetingSearchModal, ["button"], [LABELS.save, LABELS.saveAlt], 12000);
		await closeCalendarSetting();
	}
}

async function initializeWithRetry(maxRetries = 3) {
	let lastError;
	for (let i = 0; i < maxRetries; i++) {
		try {
			await setupGroupToggleButtons();
			await setupKaigiToggleButton();
			return;
		} catch (e) {
			lastError = e;
			await new Promise((resolve) => setTimeout(resolve, 500 * (i + 1)));
		}
	}
	throw lastError;
}

(function initSchedulerExtension() {
	if (window.__schedulerExtInitialized) return;
	window.__schedulerExtInitialized = true;

	(async () => {
		try {
			await initializeWithRetry(3);
		} catch (e) {
			console.error(e);
		}
	})();
})();
