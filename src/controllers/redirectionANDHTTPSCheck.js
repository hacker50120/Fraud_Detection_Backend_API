const http = require('http');
const https = require('https');
const request = require('request');

async function checkRedirection(passurl, timeout = 3000) {
    const urlString = passurl.toString();

    url = `http://${urlString}/`
    return new Promise((resolve, reject) => {
        // Determine the HTTP or HTTPS module to use
        const httpModule = url.startsWith('https://') ? https : http;

        // Send a request to the URL
        const req = httpModule.get(url, (res) => {
            // Check for redirection status codes (301 or 302)
            if (res.statusCode === 301 || res.statusCode === 302) {
                const locationHeader = res.headers['location'];

                // Check if the redirection URL starts with http://
                if (locationHeader.startsWith('http://')) {
                    console.log('[Danger-100] - Redirection happening to HTTP, which may not be safe.');
                    resolve('[Danger-100]');
                } else if (locationHeader.startsWith('https://')) {
                    // Check if the redirection URL is the same as the input URL
                    if (url === locationHeader) {
                        console.log('[Safe-70] - Redirection to HTTPS is happening.');
                        resolve('[Safe-70]');
                    } else {
                        console.log(`[Safe-100] - Redirection happening, [Redirection endpoint: ${locationHeader}]`);
                        resolve(`[Safe-100]`);
                    }
                } else {
                    console.log('[Fail] - Unknown redirection location.');
                    resolve('[Fail]');
                }
            } else if (res.statusCode === 200) {
                console.log('[Danger-10] - Redirect is not happening.');
                resolve('[Danger-10]');
            } else {
                console.log('[Danger-0] - Unknown response or redirection status.');
                resolve('[Danger-0]');
            }
        });

        req.on('error', (error) => {
            reject(`Error: ${error.message}`);
        });

        // Set a timeout for the request
        const timeoutId = setTimeout(() => {
            req.abort(); // Abort the request if it takes too long
            resolve(false); // Return false in case of a timeout
        }, timeout);

        req.on('end', () => {
            clearTimeout(timeoutId); // Clear the timeout if the request completes successfully
        });

        req.end();
    });
}



function checkHttpsConnection(cleanurl, retryCount) {
    return new Promise((resolve, reject) => {
        const urlToCheck = `https://${cleanurl}/`;
        console.log(urlToCheck);
        const requestOptions = {
            url: urlToCheck,
            method: 'GET',
            timeout: 2000, // Set the timeout to 2 seconds
            maxRedirects: 3, // Allow up to 3 redirects
        };

        request(requestOptions, (error, response) => {
            if (error) {
                // An error occurred, indicating that the website is not reachable or there was another issue
                if (retryCount > 0) {
                    // Retry the request if there are retries left
                    checkHttpsConnection(cleanurl, retryCount - 1)
                        .then(resolve)
                        .catch(reject);
                } else {
                    // No more retries left, return false
                    resolve(false);
                }
            } else {
                // Check the response status code
                if (response.statusCode === 200) {
                    // The website is using HTTPS
                    resolve(true);
                } else {
                    // The website is not using HTTPS
                    resolve(false);
                }
            }
        });
    });
}


module.exports = { checkRedirection, checkHttpsConnection };


// async function cal() {
//     const isRedirection = await checkRedirection('www.sbi.co.in');
//     console.log(`Redirection Status: ${isRedirection}`);
// }

// cal()