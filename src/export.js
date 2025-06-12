const clientZip = window.clientZip || {};
(async () => {
    const { downloadZip } = await import('https://cdn.jsdelivr.net/npm/client-zip/index.js');
    clientZip.downloadZip = downloadZip;
})();

export default exportCourse = async ({ name, materialData }) => {
    const files = [];

    const accumulateFiles = async (materials, directory='') => {
        for (const material of materials) {
            const { type, title: name, downloadLink: url, ext: extension, children } = material;
    
            if (type === 'document') {
                files.push({
                    name: `${directory}${name}.${extension}`, input: await fetch(url),
                });
            } else if (type === 'folder') {
                // Accumulate files from subfolders
                await accumulateFiles(children, `${directory}${name}/`);
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
};