const cleanUrl = require('./cleanUrl');
const validator = require('validator');
const { http, https } = require('follow-redirects');
const { exec } = require('child_process');
const { exit } = require('process');
const loggingErrorURLFunction = require('./blankBankNameANDURLInserter')

//Fetching follow-redirects url For HTTPS
function fetchDataHTTPS(URL) {
    return new Promise((resolve, reject) => {
        const request = https.get(URL, response => {
            let data = '';

            response.on('data', chunk => {
                data += chunk;
            });

            response.on('end', () => {
                resolve({ data, responseUrl: response.responseUrl });
            });
        });

        request.on('error', error => {
            reject(error);
        });
    });


}
//Fetching follow-redirects url For HTTP
function fetchDataHTTP(URL) {
    return new Promise((resolve, reject) => {
        const request = http.get(URL, response => {
            let data = '';

            response.on('data', chunk => {
                data += chunk;
            });

            response.on('end', () => {
                resolve({ data, responseUrl: response.responseUrl });
            });
        });

        request.on('error', error => {
            reject(error);
        });
    });


}

async function fetchDataAndHandleErrors(URL) {
    try {
        // console.log("fetchDataAndHandleErrors URL: ", URL);
        const result = await fetchDataHTTPS(URL);
        return result.responseUrl;
    } catch (error) {
        let HTTPS_URL
        if (URL.startsWith('https://')) {
            const url = URL.replace(/^https:\/\//, ''); // Remove "https://"
            HTTPS_URL = `http://${url}`;
        }
        const result = await fetchDataHTTP(HTTPS_URL);
        console.log('Response URL ->HTTP:', result.responseUrl);
        return result.responseUrl;
    }
}




function removeSpacesAtStart(inputString) {
    return inputString.trimStart();
}

function removeSpacesAtEnd(inputString) {
    return inputString.trim();
}
//Checking And Adding the https
async function addHTTPS(userInputURL) {
    // console.log("I Am UserINput URL", userInputURL);
    const ConvertedStringURL = userInputURL.toString();
    //Checking is the uRL is Valid or Not using validator.js\
    let isValidURL = validator.isURL(ConvertedStringURL); //=> true
    console.log(isValidURL);
    switch (isValidURL) {
        case true:
            // console.log("Found Valid URL, Working Further..");
            let HTTPS_URL;
            if (ConvertedStringURL.startsWith('http://')) {
                const url = ConvertedStringURL.replace(/^http:\/\//, ''); // Remove "http://"
                HTTPS_URL = `https://${url}`;
                console.log(HTTPS_URL);
                return HTTPS_URL;
            } else if (ConvertedStringURL.startsWith('https://')) {
                const url = ConvertedStringURL.replace(/^https:\/\//, ''); // Remove "https://"
                HTTPS_URL = `https://${url}`;
                return HTTPS_URL;
            } else {
                // cleanUrlWWW = cleanUrl.cleanUrlWWW(ConvertedStringURL);
                HTTPS_URL = `https://${ConvertedStringURL}`;
                return HTTPS_URL;
            }
        case false:
            console.log("User Input URL is not a valid URL!!");
            return ("User Input URL is not a valid URL!!");
        default:
            console.log("URL has som issues.");
    }


}


async function LinuxCURLCommand(originalUrl) {
    try {
        const sanitizedUrl = originalUrl.replace(/['"`$]/g, '');
        console.log("I am Curl");
        const curlCommand = `curl -k -I ${sanitizedUrl}`;

        console.log("Executing Curl");

        function fetchData() {
            return new Promise((resolve, reject) => {
                exec(curlCommand, (error, stdout, stderr) => {
                    if (error) {
                        console.error(`Error executing curl command: ${error.message}`);
                        reject(error);
                        return;
                    }

                    // Split the response headers into an array
                    const headersArray = stdout.split('\n');

                    // Find the 'Location' header
                    const locationHeader = headersArray.find(header => header.toLowerCase().startsWith('location'));

                    if (locationHeader) {
                        const locationUrl = locationHeader.split(': ')[1];
                        console.log(`Location URL: ${locationUrl}`);
                        resolve({ locationUrl });
                    } else {
                        console.log('Location header not found');
                        resolve({ locationUrl: null });
                    }
                });
            });
        }

        // Usage with async/await

        const data = await fetchData();
        const ConvertedStringURL = data.locationUrl.toString();
        const stringWithoutSpaceStart = removeSpacesAtStart(ConvertedStringURL);
        const stringWithoutSpaceEnd = removeSpacesAtEnd(stringWithoutSpaceStart);
        return stringWithoutSpaceEnd;

    } catch (error) {
        console.log("I am error cath block in CURL");
        return originalUrl;

    }
}






async function resolverStreamLine(shortUrl) {

    console.log("Input URL IS:", shortUrl);
    //Checking And Adding the https inside the function
    const HTTPSAddedURL = await addHTTPS(shortUrl)
    console.log("Task -1: ", HTTPSAddedURL);


    //After unsort checking the new node module follow redirect for shorten url and some sbi endpoints- save from errors if fetch wont able to get teh url so uisng before fecth to get the short urls
    const followRedirectResolveUnShortURL = await fetchDataAndHandleErrors(HTTPSAddedURL);
    console.log("Task -2: For followed Redirection URL: ", followRedirectResolveUnShortURL);

    //Removing/Cleaning the Https/Http from the URL
    const cleanUrlWWW = cleanUrl.cleanUrlWWW(followRedirectResolveUnShortURL);
    console.log("Task -3: Cleaning the URL: ", cleanUrlWWW);

    //Now Resolving the top level domain and extracting the domain only
    const { TLDParser } = await
    import ('./tld.mjs');
    TLDresult = await TLDParser(cleanUrlWWW);
    console.log("Task -4: Resolving the TLD: ", TLDresult);

    //Again addinh https to the url so that it could resolve and can be solved 
    const TLDresultHTTPSAddedURL = await addHTTPS(TLDresult)
    console.log("Task -5: Addinh https in the TLD URL", TLDresultHTTPSAddedURL);

    //Final Block to resolve the URL
    let finalUrl
    const response = await fetch(TLDresultHTTPSAddedURL, { redirect: 'follow' });
    if (response.ok) {
        finalUrl = response.url;
        console.log("Final URL:", finalUrl);
    } else {
        // console.error("Request failed with status:", response.status);
        const result = await fetchDataHTTPS(TLDresultHTTPSAddedURL);
        console.error("if fetch module failed then will call the fetchDataHTTPS:", result.responseUrl);
        finalUrl = result.responseUrl;
    }
    return finalUrl;
}

async function mainBlockForURLResolver(SMSHeader, shortUrl, inputMessage) {
    // console.log("----------------[Starting] Resolver Console Logs Detail--------------------- ");
    try {
        const FinalResolvedURL = await resolverStreamLine(shortUrl);
        return FinalResolvedURL;
    } catch (error) {
        // LinuxCURLCommand('https://f49.bz/jgLIZq');
        try {
            const arraytoStringURL = shortUrl.toString();
            const CURLResolvedURL = await LinuxCURLCommand(arraytoStringURL);
            console.log("CURL Response: ", CURLResolvedURL);
            const FinalResolvedURLCURL = await resolverStreamLine(CURLResolvedURL);
            return FinalResolvedURLCURL;
        } catch (error) {
            console.error(error)
            await loggingErrorURLFunction.loggingErrorURLs(SMSHeader, shortUrl, inputMessage);
            return shortUrl;
        }
    }

    // console.log("----------------[Ending] Resolver Console Logs Detail--------------------- ");
}

module.exports = { mainBlockForURLResolver };


// async function main2() {
//     // let url = 'https://surl.li/lzwtp';
//     // let urlf = followRedirects(url)
//     // console.log(urlf);

//     const as = await resolveShortUrl('http://f49.bz/jgLIZq')
//         // const as = await resolveShortUrl('https://www.paisabazaar.com/digital-lending/?bank_type=289&utm_title=mv_pre_approved_offer&utm_medium=mva&&utm_source=crmsms&tum_campaign=02Dec20&pbguid=dpadaQ7XJ8|4B3yzCQ4cX5jc41mSMZE-KpWR_zabzEcpPG&is_auto=true')

// }
// // main2()




// let originalUrl = 'https://f49.bz/jgLIZq';
// LinuxCURLCommand(originalUrl)