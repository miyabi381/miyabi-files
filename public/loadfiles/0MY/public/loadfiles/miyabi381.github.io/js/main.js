/**
 * ページtopボタン表示
 */
window.onload = () => {
    const buttons = document.querySelectorAll('.up');

    const onScroll = () => {
        buttons.forEach(btn => {
            btn.classList.toggle('show', window.scrollY > 10);
        });
    };

    window.addEventListener('scroll', onScroll);

}

/**
* ファイル読み込み
*/
document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("pre[data-src]").forEach(pre => {
        fetch(pre.dataset.src)
            .then(res => {
                if (!res.ok) {
                    throw new Error(`読み込み失敗: ${pre.dataset.src}`);
                }
                return res.text();
            })
            .then(text => {
                pre.textContent = text;
            })
            .catch(err => {
                pre.textContent = err.message;
                console.error(err);
            });
    });
});

/**
 * PhasmoPhobia ゴースト証拠表示
 * 引数１：証拠のID
 * 引数２：チェックボックスのID
 */
function PPEvidencText(idName, idNameCheck) {
    let obj = document.getElementById(idName);
    let objCheck = document.getElementById(idNameCheck);
    if (obj.className == "none-underline" && objCheck.className == "square") {  // yes
        objCheck.classList.remove("square");
        objCheck.classList.add("checkbox");

    } else if (objCheck.className == "checkbox") {  // no
        objCheck.classList.remove("checkbox");
        objCheck.classList.add("square");
        obj.classList.remove("none-underline");
        obj.classList.add("line-through");

    } else {
        obj.classList.remove("line-through");  // none
        obj.classList.add("none-underline");
    }
}

/**
 * PhasmoPhobia ゴーストテーブル表示
 * 引数：ID
 */
function PPGhostName(idName) {
    let obj = document.getElementById(idName);
    if (obj.className == "none-underline") { // yes
        obj.classList.remove("none-underline");
        obj.classList.add("border-radius");

    } else if (obj.className == "border-radius") {  // no
        obj.classList.remove("border-radius");
        obj.classList.add("line-through");

    } else {
        obj.classList.remove("line-through");  // none
        obj.classList.add("none-underline");
    }
}

/**
 * PhasmoPhobia 証拠によるゴーストの判定
 * 引数１：証拠ID
 * 引数２：ゴーストID
 */
function PPGhostJudge(eviID) {
    let objEvi = document.getElementById(eviID);
    if (objEvi.className == "line-through") {  //  証拠なし
        for (i = 0; i < 2; i++) {
            alert(i);
            for (const gName of PPGN) {
                var count = 0;
                alert(PPGNEvi.spirit);
                alert(gName + "  1");
                alert(PPGNEvi.gName + "  2");
                for (const gEvi of PPGNEvi.gName) {
                    alert(gEvi);
                    if (gEvi == eviID) {  // ゴーストに証拠がある
                        count++;
                    }
                }
                if (count != 0) {  // 証拠が一つでもあれば
                    const objGhost = document.getElementById(gName);
                    objGhost.style.color = "#ccc9c4";  // 文字グレー
                    objGhost.style.borderColor = "#ccc9c4";
                }
            }
        }

    } else {
        for (const val of PPGN) {
            const objGhost = document.getElementById(val);
            objGhost.style.color = "";  // 文字黒
            objGhost.style.border = "";
        }
    }
}

/**
 * PhasmoPhobia 証拠によるゴーストの判定
 * 引数１：証拠ID
 * 引数２：ゴーストID
 */
function PPtestGhost(eviID) {
    const testObj = spiritEvi;
    let objEvi = document.getElementById(eviID);

    if (objEvi.className == "line-through") {
        for (const val of testObj) {
            if (eviID == val) {
                const objGhost = document.getElementById("spirit");
                objGhost.style.color = "#ccc9c4";  // no
                objGhost.style.borderColor = "#ccc9c4";
                return;
            }
        }
    } else {
        const objGhost = document.getElementById("spirit");
        objGhost.style.color = "";  // none
        objGhost.style.borderColor = "";
    }
}

/**
 * PhasmoPhobia 証拠フラグ切り替え
 */
function PPGhostFlag(val) {
    if (val == 0) {

    } else {

    }
}

/**
 * PhasmoPhobia 証拠フラグ
 */
const emfFlag = 0;  // EMFレベル５
const dotsFlag = 0;  // D.O.T.S プロジェクター
const shimonFlag = 0;  // 指紋
const orbFlag = 0;  // ゴーストオーブ
const bookFlag = 0;  // ゴーストライティング
const boxFlag = 0;  // スピリットボックス
const iceFlag = 0;  // 氷点下の温度

/**
 * PhasmoPhobia ゴースト名配列
 * 
 */
// let PPGN = ["spirit", "wraith", "phantom", "polter", "banshee", "jinn"
//     , "mare", "revenant", "shade", "demon", "yurei", "oni", "yokai"
//     , "hantu", "goryo", "myling", "onryo", "twins", "raiju", "obake"
//     , "mimic", "moroi", "deogen", "thaye"];

let PPGN = ["spirit", "wraith"];


/**
 * PhasmoPhobia ゴースト名証拠用配列
 * 
*/

// let PPGNEvi = [spiritEvi, wraithEvi, phantomEvi, polterEvi, bansheeEvi, jinn
//     , mareEvi, revenantEvi, shadeEvi, demonEvi, yureiEvi, oniEvi, yokai
//     , hantuEvi, goryoEvi, mylingEvi, onryoEvi, twinsEvi, raijuEvi, obake
//     , mimicEvi, moroiEvi, deogenEvi, thayeEvi];

let PPGNEvi = { spirit: ["emf", "box", "book"], wraith: ["emf", "box", "dots"] };


/**
 * PhasmoPhobia ゴースト別証拠配列
 */
// // スピリット
// let spiritEvi = ["emf", "box", "book"];
// // レイス
// let wraithEvi = ["emf", "box", "dots"];
// ファントム
let phantomEvi = ["box", "shimon", "dots"];
// ポルターガイスト
let polterEvi = ["box", "shimon", "book"];
// バンシー
let bansheeEvi = ["shimon", "orb", "dots"];
// ジン
let jinnEvi = ["emf", "shimon", "ice"];
// メアー
let mareEvi = ["box", "orb", "book"];
// レヴナント
let revenantEvi = ["orb", "book", "ice"];
// シェード
let shadeEvi = ["emf", "book", "ice"];
// デーモン
let demonEvi = ["shimon", "book", "ice"];
// 幽霊
let yureiEvi = ["orb", "ice", "dots"];
// 鬼
let oniEvi = ["emf", "ice", "dots"];
// 妖怪
let yokaiEvi = ["box", "orb", "dots"];
// ハントゥ
let hantuEvi = ["shimon", "orb", "ice"];
// 御霊
let goryoEvi = ["emf", "shimon", "dots"];
// マイリング
let mylingEvi = ["emf", "shimon", "book"];
// 怨霊
let onryoEvi = ["box", "orb", "ice"];
// ツインズ
let twinsEvi = ["emf", "box", "ice"];
// 雷獣
let raijuEvi = ["emf", "orb", "dots"];
// 化け狐
let obakeEvi = ["emf", "shimon", "orb"];
// ミミック
let mimicEvi = ["box", "shimon", "ice"];
// モーロイ
let moroiEvi = ["box", "book", "ice"];
// デオヘン
let deogenEvi = ["box", "book", "dots"];
// セーイ
let thayeEvi = ["orb", "book", "dots"];


/**
 * PhasmoPhobia 証拠別ゴースト配列
 */
// EMFレベル５
let emfEvi = [
    "spirit", "wraith", "jinn", "shade", "oni", "goryo", "myling", "twins", "raiju", "obake"
];

// D.O.T.S プロジェクター
let dotsEvi = [
    "wraith", "phantom", "banshee", "yurei", "oni", "yokai", "goryo", "raiju", "deogen", "thaye"
];

// 指紋
let shimonEvi = [
    "phantom", "polter", "banshee", "jinn", "demon", "hantu", "goryo", "myling", "obake", "mimic"
];

// ゴーストオーブ
let orbEvi = [
    "banshee", "mare", "revenant", "yurei", "hontu", "yokai", "onryo", "raiju", "obake", "thaye"
];

// ゴーストライティング
let bookEvi = [
    "spirit", "polter", "mare", "revenant", "shade", "demon", "myling", "moroi", "deogen", "thaye"
];

// スピリットボックス
let boxEvi = [
    "spirit", "wraith", "phantom", "polter", "mare", "yokai", "onryo", "twins", "moroi", "deogen", "mimic"
];

// 氷点下の温度
let iceEvi = [
    "jinn", "revenant", "shade", "demon", "yurei", "oni", "hantu", "onryo", "twins", "moroi", "mimic"
];


/**
 * アラートテスト
 * 引数：表示したい文字(変数)
 * 
 */
function test(val) {
    alert(val);
}

/**
 * 引数に対応した文字配列でテーブル出力
 * 引数：表示したい文字列(数値)
 * １：MOD名
 */
function assenMokujiTable(val) {
    data = [];
    switch (val) {
        case 1: // ark
            data = [
                "Death Recovery Mod (v1.12.1)",
                "Extra Large Storage Box",
                "Upgrade Station v1.8i",
                "Swim Clear Scuba Mask",
                "Super Spyglass (Open Source)",
                "Egg N Poop Collector / Incubator",
                "Breedable Creatures Bundle",
                "Auto Run - Func+",
                "Dino Aid",
                "Meat Spoiler",
                "HG Stacking Mod 10000-90 V315",
                "Creature Finder Deluxe",
                "EZTame",
                "All Dinos Allow Guns"
            ];
            break;
        case 2:
            data = [
                "建築"
                , "火源"
                , "食料"
                , "溶解炉"
                , "鉄溶鉱炉"
                , "ゲーム難易度"
                , "ショートカットキー"
                , "アイテム"
                , "HUD"
                , "採取"
                , "炭焼き窯"
                , "地図"
                , "プレイヤー"
                , "スタミナ(基礎)"
                , "スタミナ(武器・道具)"
                , "作業台"
                , "インベントリ"
                , "風車"
                , "糸車"
                , "チャット"
            ];
            break;
        default:
            break;
    }
    mokujiTable(data);
}

/**
 * テーブルの出力
 * 引数：文字配列
 */
function mokujiTable(data) {
    // table要素を生成
    var table = document.createElement('table');
    table.id = "modTable";
    table.className = "mokuji";
    // tr部分のループ
    for (var i = 0; i < data.length; i++) {
        // tr要素を生成
        var tr = document.createElement('tr');
        // class指定
        tr.classList = "nospace";
        tr.style.height = "1em";
        // td要素を生成
        var td = document.createElement('td');
        // td要素内にテキストを追加
        const aTag = document.createElement("a");
        aTag.href = "#" + data[i];
        aTag.innerText = data[i];
        aTag.className = "mokuji";
        td.appendChild(aTag);
        // td要素をtr要素の子要素に追加
        tr.appendChild(td);
        // tr要素をtable要素の子要素に追加
        table.appendChild(tr);
    }
    // 生成したtable要素を追加する
    document.getElementById('modlist').appendChild(table);
    document.getElementById('modTable').style.display = "none";

}

/**
 * 目次・MOD名の表示/非表示切り替え
 */
function hidemodList(table, Text) {

    if (document.getElementById(table).style.display == "block") {
        document.getElementById(table).style.display = "none";
        document.getElementById(Text).innerText = "表示";
    } else {
        document.getElementById(table).style.display = "block";
        document.getElementById(Text).innerText = "非表示";
    }

}

/**
 * ページURL取得・ページIDに変換
 */
function getTitle() {
    let title = document.title;
    //alert(title == "しおりぴのもりARK:設定" ? 1 : 2);
    // 1: ark
    // 2: valheim
    switch (title == "しおりぴのもりARK:設定" ? 1 : 2) {
        case 1:
            assenMokujiTable(1);
            break;
        case 2:
            assenMokujiTable(2);
            break;
        default:
            break;
    }
}

