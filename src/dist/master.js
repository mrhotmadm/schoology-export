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
    const util = await loadModule('src/util.js');

    // Modules
    const { default: injectUI } = await loadModule('src/inject.js');
    const { openAllFolders } = await loadModule('src/navigation.js');
    const { default: scrapeCourseMaterials } = await loadModule('src/scraper.js');
    const { default: exportCourse } = await loadModule('src/export.js');

    const {
        openAllFoldersButton,
        scrapeButton,
        exportButton
    } = injectUI();

    const buttons = {
        'schoology-export:open-all-folders': openAllFoldersButton,
        'schoology-export:scrape-trigger': scrapeButton,
        'schoology-export:export-trigger': exportButton
    };

    const functions = {
        'schoology-export:open-all-folders': openAllFolders,
        'schoology-export:scrape-trigger': async () => {
            const data = await scrapeCourseMaterials(util);
            sessionStorage.setItem('schoology-export:data', JSON.stringify(data));

            console.log('[schoology-export] Scraped data:', data);
        },
        'schoology-export:export-trigger': async () => {
            const courseName = document.querySelector('.course-title')?.textContent?.trim() || 'Course';
            const data = JSON.parse(sessionStorage.getItem('schoology-export:data') || '[]');
            if (!data || data.length === 0)
                return console.warn('[schoology-export] No data found. Please scrape the course materials first.');

            await exportCourse({ name: courseName, materialData: data });

            sessionStorage.removeItem('schoology-export:data');
            console.log('[schoology-export] Exported course data:', courseData);
        }
    };

    // Listen for messages from the content script.
    window.addEventListener('message', async event => {
        if (event.source !== window || !event.data?.type?.startsWith('schoology-export')) return;
        const { type } = event.data;

        // const data = event.data?.data;
        // console.log('[schoology-export] Received data:', data);

        await functions[type]();

        buttons[type].disabled = false;
    });
})();