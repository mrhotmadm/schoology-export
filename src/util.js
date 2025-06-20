let requests = []

export const checkRateLimit = async () => {
    requests.push(Date.now())
    if (requests.length <= 15) return; // Less than 15 requests in history
    const fifteenRequestsAgo = Date.now() - requests.shift();
    if (fifteenRequestsAgo < 5000) return; // Less than 15 requests in last 5 seconds
    // Wait until 15th request made is older than 5 seconds => less than 15 requests in last 5 seconds
    await new Promise(resolve => setTimeout(resolve, 5000 - fifteenRequestsAgo)); 
};

export const fetchPageHTML = async (url, callback = () => {}, delayMs = 250) => {
    await new Promise(resolve => setTimeout(resolve, delayMs));

    // Avoid 429 response
    await checkRateLimit();

    try {
        const response = await fetch(url, {
            method: 'GET',
            // credentials: 'include'
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
