let previousRequestTime = null;
let requestCount = 0;

export const checkRateLimit = async () => {
    if (previousRequestTime) {
        const timeSinceLastRequest = Date.now() - previousRequestTime;
        
        if (timeSinceLastRequest > 5000) {
            // Reset if last request was more than 5 seconds ago
            previousRequestTime = null;
            requestCount = 0;
        } else if (requestCount >= 10) { // max 10 requests for precaution
            console.warn(`[schoology-export] Cautionary rate limit exceeded. Waiting for 5 seconds...`);
            await new Promise(resolve => setTimeout(resolve, 5000));
            requestCount = 0;
        };
        console.log({timeSinceLastRequest, requestCount});
    };
};

export const fetchPageHTML = async (url, callback = () => {}, delayMs = 250) => {
    await new Promise(resolve => setTimeout(resolve, delayMs));

    // Rate limiting to avoid overwhelming the server (prediction: 15 requests per 5 seconds)
    await checkRateLimit();

    try {
        const response = await fetch(url, {
            method: 'GET',
            // credentials: 'include'
        }).finally(() => {
            requestCount++;
            previousRequestTime = Date.now();
        });

        const text = await response.text();
        return callback(text);
    } catch (error) {
        console.error(`[schoology-export] Error fetching page HTML from ${url}:`, error);
        return callback(null);
    };
};

export const extractElement = (html, selector) => {
    // Using DOMParser to extract elements from the HTML
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.querySelector(selector);
};

export const downloadFile = (url, filename) => {
    window.open(url, filename);
};