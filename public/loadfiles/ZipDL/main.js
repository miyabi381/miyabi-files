var browser = self.browser || self.chrome;
const mainPanel = "#main > section > main";


// メニューからのメッセージで処理
browser.runtime.onMessage.addListener((message) => {

	if (message.type === "START_SCROLL") {
		startAutoLoop(10, true);
	}

	if (message.type === "START_ONCE") {
		startAutoLoop(1, false);
	}

	if (message.type === "START_IMAGE_DL") {
		startImageDownload();
	}
});

// 画像DL
async function startImageDownload() {

	await startAutoScrollAsync();
	await sleep(800);

	const root = document.querySelector(mainPanel);
	if (!root) return;

	const anchors = [
		...root.querySelectorAll("div._imageContainer_44cfe6e a")
	];

	const urls = anchors
		.map(a => a.href)
		.filter(href => /\.(jpg|jpeg|png|webp|gif)$/i.test(href));

	const uniqueUrls = urls.filter(
		(url, index) => urls.indexOf(url) === index
	);

	for (let i = 0; i < uniqueUrls.length; i++) {
		const url = uniqueUrls[i];

		const number = String(i + 1).padStart(5, "0");
		const extMatch = url.match(/\.(jpg|jpeg|png|webp|gif)(?=$|\?)/i);
		const ext = extMatch ? extMatch[0] : ".jpg";

		const filename = `${number}${ext}`;

		await browser.runtime.sendMessage({
			type: "DOWNLOAD_IMAGE",
			url,
			filename
		});

		await sleep(1000);
	}
}

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

//ループ処理
async function startAutoLoop(loopCount, movePage) {

	for (let i = 0; i < loopCount; i++) {

		console.log("Loop:", i + 1);

		// 現在選択中の <a aria-current="page">
		const currentLink = document.querySelector('a[aria-current="page"]');
		if (!currentLink) {
			console.warn("active link not found");
			break;
		}

		const currentLi = currentLink.closest("li");
		if (!currentLi) break;

		if (movePage) {

			const prevLi = currentLi.previousElementSibling;
			if (!prevLi) {
				console.warn("no previous item");
				break;
			}

			const prevLink = prevLi.querySelector("a");
			if (!prevLink) break;

			humanClick(prevLink);

			await waitForZip();
		}

		// スクロール＋DL
		await startAutoScrollAsync();

		// 安定待機
		await sleep(800);
	}
}


// zip出現待ち
function waitForZip(timeout = 3000) {
	return new Promise(resolve => {

		const existing = document.querySelector("a[href*='zip']");
		if (existing) return resolve(true);

		const observer = new MutationObserver(() => {
			const zip = document.querySelector("a[href*='zip']");
			if (zip) {
				observer.disconnect();
				resolve(true);
			}
		});

		observer.observe(document.body, {
			childList: true,
			subtree: true
		});

		setTimeout(() => {
			observer.disconnect();
			resolve(false);
		}, timeout);
	});
}

// Promise版スクロールDL
function startAutoScrollAsync() {

	return new Promise(resolve => {

		const scrollEl = document.querySelector(mainPanel);
		if (!scrollEl) return resolve();

		let lastHeight = 0;
		let stableCount = 0;

		const interval = setInterval(() => {

			const height = scrollEl.scrollHeight;
			scrollEl.scrollTop = Math.max(
				0,
				height - scrollEl.clientHeight - 200
			);

			if (height !== lastHeight) {
				lastHeight = height;
				stableCount = 0;
			} else {
				stableCount++;
			}

			if (stableCount >= 5) {

				clearInterval(interval);

				searchTag(mainPanel, "a", "zip").forEach(el => {

					const url = el.href;
					const filename = url.split("/").pop();

					browser.runtime.sendMessage({
						type: "DOWNLOAD_ZIP",
						url,
						filename
					});
				});

				resolve();
			}
		}, 200);
	});
}

// sleep関数
function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}
