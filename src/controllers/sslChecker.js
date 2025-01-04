const sslChecker = require('ssl-checker');

async function getSslDetails(hostname) {
    try {
        console.log(hostname);
        const certificateInfo = await sslChecker(hostname);
        console.log("\n" + hostname);
        return certificateInfo;
    } catch (error) {
        // console.error(`Error fetching SSL certificate for ${hostname}: ${error.message}`);
        // return null; // Return null in case of an error
        console.error(`-----------------> ${hostname}`);
    }
}

module.exports = getSslDetails;