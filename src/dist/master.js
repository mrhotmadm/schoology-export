// Return the URL of a path that is relative to the current script's location.
const getModulePath = (path) => 'https://raw.githubusercontent.com/mrhotmadm/schoology-export/refs/heads/main/' + path.replace('./', '');

const loadModule = async (url, isRawURL = false) => {
    const codeString = await fetch(isRawURL ? url : getModulePath(url)).then(response => response.text());

    // Turn string into a Blob and get an object URL
    const blob = new Blob([codeString], { type: 'text/javascript' });
    const objectURL = URL.createObjectURL(blob);
    
    const fetchedModule = await import(objectURL);
    URL.revokeObjectURL(objectURL);

    return fetchedModule;
};


(async () => {
    // Utilities
    const { fetchPageHTML, extractElement, downloadFile } = await loadModule('src/util.js');

    // Modules
    const { default: injectUI } = await loadModule('src/inject.js');
    const { default: scrapeCourseMaterials } = await loadModule('src/scraper.js');
    const { default: exportCourse } = await loadModule('src/export.js');

    injectUI();

    // Listen for messages from the content script.
    window.addEventListener('message', event => {
        if (event.source !== window || event.data?.type?.startsWith('schoology-export')) return;

        // const data = event.data?.data;
        // console.log('[schoology-export] Received data:', data);

        if (event.data.type === 'schoology-export-open-all-folders') {
            openAllFoldersButton.textContent = 'Opening Folders...';
            openAllFoldersButton.disabled = true;
        };

        if (event.data.type === 'schoology-export-scrape-trigger') {
            scrapeButton.textContent = 'Scraping...';
            scrapeButton.disabled = true;
        };

        if (event.data.type === 'schoology-export-export-trigger') {
            exportButton.textContent = 'Exporting...';
            exportButton.disabled = true;
        };
    });
})();