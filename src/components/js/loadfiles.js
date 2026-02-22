document.addEventListener("DOMContentLoaded", () => {
    console.log("loadfiles.js : loaded");

    // API呼び出し fetchは非同期なので、thenでレスポンスを受け取る
    fetch('/api/files')
        // ステータスチェック
        .then((res) => {
            if (!res.ok) throw new Error(`status ${res.status}`);
            return res.json(); // JSONとしてパースして次のthenに渡す
        })
        .then((data) => {
            console.log('files in loadfiles:', data.files);
            const container = document.getElementById('file-list');
            // 挿入先が存在しdata.filesが配列であれば
            if (container && Array.isArray(data.files)) {
                container.replaceChildren(...data.files.map((f) => {
                    const li = document.createElement('li');
                    const a = document.createElement('a');
                    a.textContent = f;
                    a.href = `src/loadfiles/${f}`;
                    li.appendChild(a);
                    return li;
                }));
            }
        })
        .catch((err) => {
            console.error('failed to fetch file list', err);
        });


});