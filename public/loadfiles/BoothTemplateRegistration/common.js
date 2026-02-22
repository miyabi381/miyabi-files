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
  let observer = null;
  let isRunning = false;

  function runIfExists() {
    document.querySelectorAll(selector).forEach(el => {
      callback(el);
    });
  }

  function start() {
    if (isRunning) return;
    isRunning = true;

    // すでに存在する要素すべてに実行
    runIfExists();

    observer = new MutationObserver(mutations => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (!(node instanceof Element)) continue;

          // 追加されたノード自身が一致
          if (node.matches(selector)) {
            callback(node);
          }

          // 追加されたノードの配下に一致するものがある
          node.querySelectorAll?.(selector).forEach(el => {
            callback(el);
          });
        }
      }
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  }

  function stop() {
    if (!isRunning) return;
    observer?.disconnect();
    observer = null;
    isRunning = false;
  }

  return {
    start,
    stop
  };
}

// ID / TAG / 入力文
// IDに含まれるInput要素にvalueを代入
function setValue(selector, tag, value) {
  const root = document.querySelector(selector);
  const input = root?.querySelector(tag);

  if (!input) return false;

  // 要素の value を取得
  let setter;
  switch (tag) {
    case "input":
      setter = Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        'value'
      ).set;

      break;
    case "textarea":
      setter = Object.getOwnPropertyDescriptor(
        HTMLTextAreaElement.prototype,
        'value'
      ).set;
      break;

    default:
      cLog("要素なし");
      return;
  }

  // valueの要素を設定する内部の処理にも入力したよ！って
  setter.call(input, value);
  input.dispatchEvent(new Event('input', { bubbles: true })); // 入れる
  input.dispatchEvent(new Event('change', { bubbles: true })); // 確定

  return true;
}

// ID から value 取得
function getValue(id) {
  const target = document.getElementById(id);
  if (!target) return;
  return target.value;
}