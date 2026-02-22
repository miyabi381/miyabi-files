// path
// 一覧ボタン
const pathItiranBtn = "body > div > div:nth-child(4) > button";
// グループ一覧
const pathGroupItiran = "#ここにグループ一覧 > div:nth-child(2) > div";
// 設定ボタン
const pathSetteiBtn = "#ここにグループ一覧 > div:nth-child(2) > div > button";
// 表示グループ切替ボタン追加
const pathAddGroupBtn = "body > div > div:nth-child(4)";
// グループ一覧　タイトルspan
const pathGroupTitle = "#ここにグループ一覧 > div:nth-child(2) > div";


(async () => {
	cLog("NS-Extension : 読み込み完了");
	// 一覧表示ボタン
	const itiranbtn = await waitFor(pathItiranBtn);
	humanClick(itiranbtn);

	// グループ一覧が生成されたとき
	const groupItiran = await waitFor(pathGroupItiran);
	groupItiran.style.display = "none";

	// グループ一覧のグループ名取得
	const spanList = Array.from(document.querySelector(pathGroupTitle).querySelectorAll("span"));
	spanList.forEach((title, index) => {
		// 表示グループ切り替えボタン生成
		const btn = createBtn(pathAddGroupBtn, title.textContent, "groupBtn");
		btn.onclick = () => {
			btn.classList.toggle("isActive");
			groupBtnOnclick(index);
		}
	});

	// 設定ボタンが見つかったら
	const groupBtn = await waitFor(pathSetteiBtn);
	humanClick(groupBtn);

	// 表示グループ切り替えボタン処理
	async function groupBtnOnclick(index) {
		humanClick(itiranbtn);
		const groupItiran = await waitFor(pathGroupItiran);
		groupItiran.style.display = "none";
		const target = await waitFor("#ここにグループ一覧 > div:nth-child(2) > div > div:nth-child(" + (index + 2) + ")");
		humanClick(target);
		const groupBtn = await waitFor(pathSetteiBtn);
		humanClick(groupBtn);
	}
})();