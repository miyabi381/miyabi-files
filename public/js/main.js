document.addEventListener("DOMContentLoaded", () => {
  console.log("loaded");

  // fetch the list of files from the server endpoint we just created
  fetch('/api/files')
    .then((res) => {
      if (!res.ok) throw new Error(`status ${res.status}`);
      return res.json();
    })
    .then((data) => {
      console.log('files in loadfiles:', data.files);
      // TODO: integrate with the page UI if desired
      const container = document.getElementById('file-list');
      if (container && Array.isArray(data.files)) {
        container.innerHTML = data.files.map(f => `<li>${f}</li>`).join('');
      }
    })
    .catch((err) => {
      console.error('failed to fetch file list', err);
    });
});

