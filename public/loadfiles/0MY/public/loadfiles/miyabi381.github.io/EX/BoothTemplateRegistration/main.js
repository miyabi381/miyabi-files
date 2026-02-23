cLog("Booth Template Registration : 読み込み完了");
const browser = self.browser || self.chrome;
const testVal = "🐾発売記念Sale🐾\n8/22～8/29まで"

// メニューからのメッセージで処理
browser.runtime.onMessage.addListener((message) => {
	switch (message.type) {
		case "REFLECT":
			// Boothに値代入
			setValue("#name", "input", "《商品名》");
			setValue("#description", "textarea", message.inNaiyou);
			cLog("REFLECT-BTN");
			break;

		case "EXFILE-IN":
			browser.runtime.sendMessage({
				type: "EXFILE-OUT",
				filename: "BTR/BTR-Config.json",
				content: JSON.stringify({
					data: [
						{
							id: "001",
							code: "tomato",
							name: testVal
						}
					]

				}, null, 2),
				mime: "application/json"
			});

			cLog("EXFILE-BTN");
			break;

		default:
			break;
	}
});


// テキストファイルの出力
function exportFile(filename, content, type = "text/plain") {
	const blob = new Blob([content], { type });
	const url = URL.createObjectURL(blob);

	const a = document.createElement("a");
	a.href = url;
	a.download = filename;
	a.click();

	URL.revokeObjectURL(url);
}









