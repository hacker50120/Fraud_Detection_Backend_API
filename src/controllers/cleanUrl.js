const { URL } = require('url');

function cleanUrlAdvanced(url) {
    try {
        // Remove any garbage or invalid characters from the URL
        const cleanedUrl = url.trim().replace(/[^\w\d:/.-]/g, '');

        const parsedUrl = new URL(cleanedUrl);
        let cleanedHostname = parsedUrl.hostname;

        // If the hostname starts with "www.", remove it
        cleanedHostname = cleanedHostname.replace(/^www\./i, '');

        // Count the occurrences of "www" in the hostname
        const wwwCount = (cleanedUrl.match(/www/g) || []).length;

        // console.log(wwwCount)
        // Remove the "www" prefix only if there are exactly 3 occurrences
        if (wwwCount === 0) {
            cleanedHostname = cleanedHostname.replace(/^www\./i, '');
        }
        // cleanedHostname = cleanedHostname.replace(/^\w+\./, '');
        // If the cleaned hostname is still empty, return null
        if (!cleanedHostname) {
            throw new Error('Invalid URL');
        }

        return cleanedHostname;
    } catch (error) {
        console.error('Error cleaning in Advanced URL:', error.message);
        return null; // Return null for invalid URLs
    }
}

function cleanUrlWWW(url) {
    try {
        // Remove any garbage or invalid characters from the URL
        const cleanedUrl = url.trim().replace(/[^\w\d:/.-]/g, '');
        const parsedUrl = new URL(cleanedUrl);
        let cleanedHostname = parsedUrl.hostname;

        if (!cleanedHostname) {
            throw new Error('Invalid URL');
        }

        return cleanedHostname;
    } catch (error) {
        console.error('Error cleaning in WWW URL:', error.message, "Return URL is: ", url);
        // return null; // Return null for invalid URLs
        return url; // Return null for invalid URLs
    }
}

module.exports = { cleanUrlAdvanced, cleanUrlWWW };