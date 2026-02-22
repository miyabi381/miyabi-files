const browser = self.browser || self.chrome;
const mainPanel = "#main > section > main";


// メニューからのメッセージで処理
browser.runtime.onMessage.addListener((message) => {
	if (message.type === "START_SCROLL") {
		startAutoScroll();
	}
});

// zip要素取得
function searchTag(rootSelector, targetSelector, target) {
	const rootElement = document.querySelector(rootSelector);
	if (!rootElement) return [];
	const targetElements = rootElement.querySelectorAll(targetSelector);
	const elementsWithZipText = [...targetElements].filter(element =>
		element.href.includes(target)
	);
	return elementsWithZipText;
}




// 下までスクロール
function startAutoScroll() {

	cLog("zip-dl-start");
	const scrollEl = document.querySelector(mainPanel);

	if (!scrollEl) {
		console.warn("scroll target not found");
		return;
	}

	let lastHeight = 0;
	let stableCount = 0;

	const interval = setInterval(() => {
		const height = scrollEl.scrollHeight;

		// 200px 手前までスクロール
		scrollEl.scrollTop = Math.max(0, height - scrollEl.clientHeight - 200);

		if (height !== lastHeight) {
			lastHeight = height;
			stableCount = 0;
		} else {
			stableCount++;
		}

		if (stableCount >= 5) {
			clearInterval(interval);
			searchTag(mainPanel, "a", "zip").forEach(el =>{
				// cLog(el)
				el.setAttribute("target","_blank");
				humanClick(el);
			});
		}
	}, 200);
}



