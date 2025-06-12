export const fetchPageHTML = async (url, callback = () => {}, delayMs = 250) => {
    await new Promise(resolve => setTimeout(resolve, delayMs));

    const response = await fetch(url, {
        method: 'GET',
        // credentials: 'include'
    });

    if (!response.ok) {
        console.error(`Failed to fetch ${url}: ${response.statusText}`);
        return callback(null);
    };

    const text = await response.text();
    return callback(text);
};

export const extractElement = (html, selector) => {
    // Using DOMParser to extract elements from the HTML
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.querySelector(selector);
};

export const downloadFile = (url, filename) => {
    window.open(url, filename);
};