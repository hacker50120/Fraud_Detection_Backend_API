// const fetch_req = require('fetch');
async function main() {
    const clean_url = "https://infinity.icicibank.com/"
    const request = new Request("https://www.paytmbank.com/");

    try {
        const response = await fetch(clean_url, { redirect: 'follow' });
        if (response.ok) {
            const finalUrl = response.url;
            console.log("Final URL:", finalUrl);
        } else {
            console.error("Request failed with status:", response.status);
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

// main()
async function extractTLDAndHostnameFromURL(url) {
    try {
        const response = await fetch(url);

        if (response.ok) {
            const finalUrl = response.url;
            const parsedUrl = new URL(finalUrl);
            const hostname = parsedUrl.hostname;
            const parts = hostname.split('.');
            const tld = parts[parts.length - 1];
            const hostnameWithoutSubdomain = parts.slice(parts.length - 2).join('.');
            console.log("Hostname (without subdomain):", hostnameWithoutSubdomain);
            console.log("Top-Level Domain:", tld);
        } else {
            console.error("Request failed with status:", response.status);
        }
    } catch (error) {
        console.error("Error:", error);
    }
}


const url = 'https://infinity.icicibank.com/'; // Replace with your URL
// extractTLDAndHostnameFromURL(url);


function extractTLDAndHostname(inputUrl) {
    const parsedUrl = new URL(inputUrl);
    const parts = parsedUrl.hostname.split('.');

    if (parts[0] === 'www' && parts.length >= 3) {
        // Remove 'www' if it's the first subdomain
        return parts.slice(1).join('.');
    } else {
        return parsedUrl.hostname;
    }
}

const inputUrl1 = 'https://www.example.com'; // Should return 'example.com'
const inputUrl2 = 'https://www.www.asdsd.asdasd.asdasd.sub.example.com'; // Should return 'sub.example.com'
const inputUrl3 = 'https://sub.example.com'; // Should return 'sub.example.com'

console.log(extractTLDAndHostname(inputUrl1));
console.log(extractTLDAndHostname(inputUrl2));
console.log(extractTLDAndHostname(inputUrl3));




// fetch(request)
//     .then((response) => {
//         if (response.status === 200) {
//             return response.json();
//         } else {
//             throw new Error("Something went wrong on API server!");
//         }
//     })
//     .then((response) => {
//         console.debug(response);
//         // …
//     })
//     .catch((error) => {
//         console.error(error);
//     });