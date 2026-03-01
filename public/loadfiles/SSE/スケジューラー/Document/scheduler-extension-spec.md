# ウェブスケジューラー拡張機能 設計・仕様書

## 1. 概要
このプロジェクトは、対象スケジューラー画面に対して UI 操作を補助する Chrome/Edge 拡張機能（Manifest V3）です。
主目的は次の 2 点です。

- グループ単位の表示切り替えボタンをツールバーに追加する
- 会議室表示の一括 ON/OFF ボタンを追加する

## 2. 構成
- manifest.json: 拡張機能定義（権限、注入対象ホスト、サービスワーカー、アイコン）
- background.js: サービスワーカー。対象 URL で CSS/JS を注入し、重複注入を防止
- common.js: 画面操作ユーティリティ（疑似クリック、要素待機、ラベル検索など）
- main.js: 機能本体（ボタン生成、設定モーダル操作、再試行制御）
- main.css: 注入ボタンのスタイル

## 3. 拡張機能メタ情報（manifest）
- manifest_version: 3
- name: スケジューラを簡単に操作したい！
- version: 2026.02.25
- permissions: scripting, tabs
- host_permissions:
  - https://miyabi381.github.io/*
  - https://web.drm.ddreams.jp/*
- background.service_worker: background.js（module）

## 4. 動作アーキテクチャ
1. タブ更新イベント（tabs.onUpdated）を監視
2. `loading` 時点でタブの注入済み状態をクリア
3. `complete` 到達後、対象 URL を判定
4. 同一 tabId + 同一 URL への再注入をスキップ
5. `main.css` を先に注入
6. `common.js` -> `main.js` の順で注入

この順序は依存関係（main.js が common.js を利用）を満たすため必須です。

## 5. URL 対象仕様
`background.js` の `TARGETS` 先頭一致（startsWith）で判定:
- https://miyabi381.github.io/Scheduler-test.html
- https://web.drm.ddreams.jp/drm/page2/schedule
- https://web.drm.ddreams.jp/drm/api/schedule

## 6. 初期化仕様（main.js）
- IIFE で起動し、`window.__schedulerExtInitialized` により多重初期化を防止
- `initializeWithRetry(3)` で最大 3 回リトライ
- 失敗時は 500ms, 1000ms, 1500ms の待機を挟んで再試行

## 7. 追加 UI 仕様
### 7.1 グループ表示トグル
- 初回に設定画面からグループ見出しを収集
- `#GroupViewToggleBottons` コンテナを `.fc-toolbar-chunk` に生成
- 各グループに `groupBtn` を生成し、クリックで `isActive` をトグル
- 実処理は設定画面を非表示で開き、該当グループ項目（`.mb-5 > div:nth-child(n) span`）を疑似クリック

### 7.2 会議室表示トグル
- ID `KaigiToggleButton` のボタンを作成（重複作成防止あり）
- ON 時:
  - 設定画面を表示して会議室タブを開く
  - 「全てを選択/全選択」を押下
  - 保存
- OFF 時:
  - 会議室検索画面で解除系操作（検索/解除/全解除/リセット系ラベル）を実行
  - 保存
- 実行中に例外が出た場合は `isActive` を元に戻す

## 8. DOM 探索・待機仕様
- ラベル依存探索を採用（例: 一覧表示、設定、会議室、全てを選択 など）
- `waitFor(selector, root, timeout)`:
  - 即時探索 -> MutationObserver 監視 -> timeout reject
  - 同一 root+selector の同時待機は Promise キャッシュ共有
- `waitUntil(getter)` はポーリング型の待機

## 9. スタイル仕様（main.css）
- 対象は `.groupBtn` に限定
- 通常色: `#3092d9`
- Active 色: `#1f74b1` + inset shadow
- FullCalendar ボタン群に合わせて `font-size: 11px`, `margin: 1.5px`

## 10. アイコン生成仕様
- インストール時（runtime.onInstalled）に外部画像を取得
- OffscreenCanvas で 16/32/48/128 の ImageData を生成
- `browser.action.setIcon` で設定
- 取得元: https://web.drm.ddreams.jp/drm/static/asset/img/icon_Essentials.png

## 11. 既知の制約と注意点
- ラベル文字列依存が強いため、対象サイトの文言変更で機能停止する可能性がある
- DOM 構造（ID/class/nth-child）変化にも脆弱
- 設定モーダル遷移が遅い環境では timeout 調整が必要になる場合がある

## 12. 想定ユースケース
- 日々のスケジュール閲覧時に、複数グループ表示の ON/OFF を素早く切り替える
- 会議室表示を一括で表示/解除し、操作手数を削減する
