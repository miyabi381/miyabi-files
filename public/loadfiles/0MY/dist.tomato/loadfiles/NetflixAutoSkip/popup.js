const browser = self.browser || self.chrome;

document.addEventListener('DOMContentLoaded', () => {
    const toggleSkip = document.getElementById('toggleSkip');
    const toggleWatch = document.getElementById('toggleWatch');

    // ===== 保存されている状態を読み込んで UI に反映 =====
    browser.storage.local.get(
        { // デフォルト
            toggleSkipState: false,
            toggleWatchState: false
        },
        result => {
            toggleSkip.checked = result.toggleSkipState;
            toggleWatch.checked = result.toggleWatchState;
        }
    );

    // ===== トグルスキップ =====
    toggleSkip.addEventListener('change', async () => {
        const isOn = toggleSkip.checked;

        // 状態を保存
        browser.storage.local.set({ toggleSkipState: isOn });
    });

    // ===== トグルス視聴を続ける =====
    toggleWatch.addEventListener('change', async () => {
        const isOn = toggleWatch.checked;
        // 状態を保存
        browser.storage.local.set({ toggleWatchState: isOn });
    });
});