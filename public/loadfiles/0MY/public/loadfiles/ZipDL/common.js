//　ログ出力
function cLog(text) {
  console.log(text);
}

// クリックイベント
function humanClick(target) {
  const events = ['mousedown', 'mouseup', 'click'];
  events.forEach(type =>
    target.dispatchEvent(new MouseEvent(type, {
      bubbles: true, // 子要素まで
      cancelable: true, // デフォルト処理実行可
      view: window // ウィンドウ内で
    }))
  );
}

/**
 * 指定したセレクタの要素がDOMに生成されたら callback を実行する
 * @param {string} selector - 監視したい要素のセレクタ
 * @param {function} callback - 要素生成時に実行する関数
 */
function onElementCreated(selector, callback) {
  // すでに存在する場合は即実行
  const existing = document.querySelector(selector);
  if (existing) {
    callback(existing);
    return;
  }

  const observer = new MutationObserver(() => {
    const el = document.querySelector(selector);
    if (el) {
      callback(el);
      observer.disconnect(); // 1回で監視終了
    }
  });

  // DOM全体を監視（確実に存在するNode）
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });
}


