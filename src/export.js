const clientZip = window.clientZip || {};
(async () => {
    const { downloadZip } = await import('https://cdn.jsdelivr.net/npm/client-zip/index.js');
    clientZip.downloadZip = downloadZip;
})();

export default async ({ name, materialData }) => {
    const files = [];

    const accumulateFiles = async (materials, directory='') => {
        for (const material of materials) {
            const { type, title: name, href, downloadLink: url, ext: extension, children } = material;
    
            if (type === 'document') {
                files.push({
                    name: `${directory}${name}.${extension}`, input: await fetch(url),
                });

                console.log(`[schoology-export] Adding document: ${name} (${url}) in directory: ${directory}`);
            } else if (type === 'folder') {
                // Accumulate files from subfolders
                console.log(`[schoology-export] Entering folder: ${name}`);
                await accumulateFiles(children, `${directory}${name}/`);
            } else if (type === 'link') {
                // For links, we can just add the URL as a file with a .url extension (Windows shortcut format, works on Mac too).
                files.push({
                    name: `${directory}${name}.url`,
                    input: new Blob([`[InternetShortcut]\nURL=${href}`], { type: 'text/plain' }),
                });
            
                console.log(`[schoology-export] Adding link: ${name} (${href}) in directory: ${directory}`);
            } else if (type === 'embedded_page') {
                // For embedded pages, we can just add the URL as a file with a .html extension.
                files.push({
                    name: `${directory}${name}.html`,
                    input: new Blob([`<html><head><title>${name}</title></head><body><iframe src="${href}" style="width:100%; height:100%;"></iframe></body></html>`], { type: 'text/html' }),
                });
                
                console.log(`[schoology-export] Adding embedded page: ${name} (${href}) in directory: ${directory}`);
            } else {
                console.warn(`[schoology-export] Unsupported material type: ${type} for ${name}`);
            };
        };
    };

    await accumulateFiles(materialData);

    const zippedFiles = await clientZip.downloadZip(files).blob();

    const link = document.createElement('a');
    link.href = URL.createObjectURL(zippedFiles);
    link.download = `${name}.zip`;
    link.click();

    link.remove();
    URL.revokeObjectURL(link.href);

    return files.length;
};