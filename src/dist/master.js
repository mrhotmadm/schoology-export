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

    injectUI();

    const functions = {
        'schoology-export:open-all-folders': openAllFolders,
        'schoology-export:scrape-trigger': async () => {
            const data = await scrapeCourseMaterials(util);
            sessionStorage.setItem('schoology-export:data', JSON.stringify(data));

            console.log('[schoology-export] Scraped data:', data);
        },
        'schoology-export:export-trigger': async selector => {
            const courseName = document.querySelector('#main-content-wrapper .page-title')?.innerText?.trim() || 'Course';
            const data = JSON.parse(sessionStorage.getItem('schoology-export:data') || '[]');
            if (!data || data.length === 0) {
                alert('No data found. Please scrape the course materials first using the middle button.');
                return console.warn('[schoology-export] No data found. Please scrape the course materials first.');
            };

            const fileCount = await exportCourse({ name: courseName, materialData: data });

            // const btn = document.querySelector(`#${selector}`);
            // btn.style.backgroundColor = '#FFFFFF';
            // btn.style.color = 'rgba(0, 0, 0, 0.85)';

            sessionStorage.removeItem('schoology-export:data');
            console.log(`[schoology-export] Exported ${fileCount} files to ${name}.zip`);
        }
    };

    // Listen for messages from the content script.
    window.addEventListener('message', async event => {
        if (event.source !== window || !event.data?.type?.startsWith('schoology-export')) return;
        const { type } = event.data;

        await functions[type](type);
        
        const btn = document.querySelector(`#${type.replace(':', '\\:')}`);
        btn.disabled = false;
        btn.innerText = btn.getAttribute('original-text');
        btn.style.filter = 'brightness(1)';
    });
})();