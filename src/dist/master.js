(async () => {
    const { fetchPageHTML, extractElement, downloadFile } = await import('https://raw.githubusercontent.com/mrhotmadm/schoology-export/refs/heads/main/src/util.js');

    console.log(fetchPageHTML, extractElement, downloadFile);
})();