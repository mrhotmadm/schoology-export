// import { fetchPageHTML } from './util';
export default async (util, selector = '#course-profile-materials-folders tbody') => {
    console.log('[schoology-export] Scraper initialized.');

    const courseMaterialList = document.querySelector(selector);
    return await scrapeFolder(courseMaterialList, util);
};

// Can also be applied to the initial course material list.
export const scrapeFolder = async (folderMaterialList, { fetchPageHTML, extractElement }) => {
    const materialElements = [...folderMaterialList.children];

    const folderData = [];

    for (const material of materialElements) {
        // Class names:
        // type-document: a document (usually a PDF)
        // type-assignment: an assignment
        // material-row-folder: a folder with materials and possibly subfolders
        const type = material.classList.contains('type-document') ? 'document' :
            material.classList.contains('type-assignment') ? 'assignment':
            material.classList.contains('material-row-folder') ? 'folder' : 'other';
        const titleElement = material.querySelector(
            (type === 'folder' ? '.folder-title' : type === 'document' ? '.attachments-file-name' : '.item-title') + ' a'
        )

        const materialData = {
            type, title: titleElement.innerText.trimEnd(), href: titleElement.href,
        };

        // Handle document source/download links
        if (type === 'document') {
            await fetchPageHTML(materialData.href, async docPageHTML => {
                if (!docPageHTML) return;
                
                // Handle images or other media types.
                const potentialImage = extractElement(docPageHTML, '#content-wrapper img');
                if (potentialImage) {
                    // The document is an image, set the download link to the image source.
                    materialData.downloadLink = potentialImage.src;
                    materialData.ext = potentialImage.src.split('.').pop();
                    materialData.title = materialData.title.replace(materialData.ext, ''); // Remove any existing file extension: /\.[a-zA-Z0-9]+$/
                    return;
                };

                const docViewerEmbed = extractElement(docPageHTML, 'iframe.docviewer-iframe');
                if (!docViewerEmbed) return console.warn('No document viewer found for', materialData.title);

                // Handle document viewers (sidenote: they use PDFTron.js) source pages.
                await fetchPageHTML(docViewerEmbed.src, async docViewerHTML => {
                    if (!docViewerHTML) return;
                    
                    const docViewerDataScript = extractElement(docViewerHTML, '#main-content-wrapper script');

                    // Extract the "custom" metadata from the script tag.
                    const match = docViewerDataScript.innerText.match(/"custom"\s*:\s*"((?:\\.|[^"\\])*)"/);
                    if (!match) return;

                    const rawObject = match[1]
                        .replace(/\\"/g, '"')
                        .replace(/\\\\/g, '\\')
                        .replace(/\\\//g, '/');
                    
                    // Parse the JSON object to extract the download link.
                    const { downloadLink } = JSON.parse(rawObject);
                    materialData.downloadLink = downloadLink;
                    materialData.ext = downloadLink.split('.').pop();

                    const duplicateFileExtension = new RegExp(/\.([a-zA-Z0-9]+)\.\1$/g);
                    if (duplicateFileExtension.test(`${materialData.title}.${materialData.ext}`))
                        materialData.title = materialData.title.replace(`.${materialData.ext}`, '');
                });
            });
        }
        
        // Handle folder/subfolder data
        if (type === 'folder') {
            const subFolderMaterialList = material.querySelector('tbody');
            materialData.children = subFolderMaterialList ? await scrapeFolder(material.querySelector('tbody'), { fetchPageHTML, extractElement }) : 'Folder has not been opened yet.';
        };

        folderData.push(materialData);
    };

    return folderData;
};