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
        const type = (material.classList.contains('type-document') && material.querySelector('.attachments-link')) ? 'link':
            material.classList.contains('type-document') ? 'document' :
            material.classList.contains('type-assignment') ? 'assignment' :
            material.classList.contains('material-row-folder') ? 'folder' : 'other';
        const titleElement = material.querySelector(
            (type === 'folder' ? '.folder-title' : type === 'document' ? '.attachments-file-name' :  type === 'link' ? '.attachments-link' : '.item-title') + ' a'
        );

        const materialData = {
            type, title: titleElement?.innerText.trimEnd(), href: titleElement?.href,
        };

        // Handle embedded pages
        if (!materialData.title && material.innerText.includes('Embedded Page')) {
            const elem = material.querySelector('.document-body-title a');
            if (!elem) return console.warn(`[schoology-export] No embedded page link found for material: ${material}`);

            materialData.type = 'embedded_page';
            materialData.title = elem.innerText.trimEnd();
            materialData.href = elem.href;

            await fetchPageHTML(materialData.href, async docPageHTML => {
                if (!docPageHTML) return console.warn(`[schoology-export] Failed to fetch embedded page HTML for: ${materialData.title}`);
                
                // Extract the content of the embedded page.
                const iframeEmbed = extractElement(docPageHTML.replaceAll('<!--', '').replaceAll('-->', ''), 'iframe'); // Remove all HTML comments (done by Schoology frontend).
                if (!iframeEmbed) return console.warn(`[schoology-export] No content found in embedded page: ${materialData.title}`);

                materialData.href = iframeEmbed.src; // The actual source of the embedded page.
            });
        } else if (materialData.title === null) return console.warn(`[schoology-export] Unsupported material: ${material}`);

        // Handle document source/download links (includes PDFs, images, links, etc.)
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

        // Handle links
        if (type === 'link') {
            const linkElement = material.querySelector('.attachments-link a'); // The literal redirect/link to the resource.
            const searchParams = new URLSearchParams(linkElement.href);
            materialData.href = searchParams.get('path') || linkElement.href; // The actual resource URL.
        };

        folderData.push(materialData);
    };

    return folderData;
};