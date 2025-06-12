export const openAllFolders = async () => {
    while (true) {
        const folderElements = document.querySelectorAll('.material-row-folder');
        let allOpened = true;
        for (const folder of folderElements) {
            if (!folder.classList.contains('schoology-export-opened')) {
                folder.classList.add('schoology-export-opened');
                folder.querySelector('.folder-expander').click();
                allOpened = false;
                // Wait for the folder to open before continuing
                await new Promise(resolve => setTimeout(resolve, 1000));
            };
        };

        if (allOpened) break;
    }
};