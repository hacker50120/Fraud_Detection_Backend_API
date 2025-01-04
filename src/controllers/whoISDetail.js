const whois = require('whois');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const Bottleneck = require('bottleneck');

// Create a limiter to limit concurrent tasks
const limiter = new Bottleneck({
    maxConcurrent: 10, // Limit to 10 concurrent tasks
    minTime: 1000, // Minimum 1-second delay between tasks
});

function extractDomainWithoutSubdomains(inputString) {
    const domainRegex = /^[^.]+\.(?:[^.]+\.)*([^.]+\.[^.]+)$/;
    const match = inputString.match(domainRegex);
    return match ? match[1] : inputString;
}


async function getWhoisDetails(domain) {
    domain = extractDomainWithoutSubdomains(domain);

    // console.log('Top level domain:', domain);
    return new Promise(async(resolve, reject) => {
        const whoIsDetail = {
            creationDate: '',
            updatedDate: '',
            expiryDate: '',
            registrantOrganization: '',
            registrantEmail: '',
            nameServers: [],
        };

        try {
            const whoisData = await lookupUsingWhois(domain);
            if (whoisData) {
                const lines = whoisData.split('\n');
                for (const line of lines) {
                    if (line.startsWith('Creation Date:')) {
                        whoIsDetail.creationDate = line.substring('Creation Date:'.length).trim();
                    } else if (line.startsWith('Updated Date:')) {
                        whoIsDetail.updatedDate = line.substring('Updated Date:'.length).trim();
                    } else if (line.startsWith('Registrar Registration Expiration Date:') || line.startsWith('Registry Expiry Date:')) {
                        if (line.startsWith('Registry Expiry Date:')) {
                            whoIsDetail.expiryDate = line.substring('Registry Expiry Date:'.length).trim();
                        } else { whoIsDetail.expiryDate = line.substring('Registrar Registration Expiration Date:'.length).trim(); }
                    } else if (line.startsWith('Registrant Organization:')) {
                        whoIsDetail.registrantOrganization = line.substring('Registrant Organization:'.length).trim();
                    } else if (line.startsWith('Registrant Email:')) {
                        whoIsDetail.registrantEmail = line.substring('Registrant Email:'.length).trim();
                    } else if (line.startsWith('Name Server:')) {
                        const nameServer = line.substring('Name Server:'.length).trim();
                        whoIsDetail.nameServers.push(nameServer);
                    }
                }

                resolve(whoIsDetail);
            } else {
                // Fallback to using the 'whois' command
                const whoisInfo = await lookupUsingWhoisCommand(domain);
                // resolve(whoisInfo);
                // const whoisData = await lookupUsingWhois(domain);
                if (whoisInfo) {
                    const parsedInfo = parseWhoisOutput(whoisInfo);
                    resolve(parsedInfo);
                }
            }

        } catch (error) {
            console.error(`Failed to fetch WHOIS data for ${domain}: ${error}`);
            reject(error);
        }
    });
}

async function lookupUsingWhois(domain) {
    return new Promise((resolve) => {
        whois.lookup(domain, (err, data) => {
            if (err) {
                resolve(null); // Return null if 'whois' lookup fails
            } else {
                resolve(data);
            }
        });
    });
}

async function lookupUsingWhoisCommand(domain) {
    const whoisCommand = `whois ${domain}`;
    try {
        const { stdout } = await exec(whoisCommand);
        return stdout;
    } catch (error) {
        throw error;
    }
}

function parseWhoisOutput(whoisOutput) {
    const whoisInfo = {
        _creationDate: '',
        updatedDate: '',
        expiryDate: '',
        registrantOrganization: '',
        registrantEmail: '',
        nameServers: [],
        // Add more fields as needed
    };

    // Split the output into lines and process each line
    const lines = whoisOutput.split('\n');
    for (const line of lines) {
        const parts = line.split(':');
        if (parts.length >= 2) {
            const key = parts[0].trim().toLowerCase(); // Normalize to lowercase
            const value = parts.slice(1).join(':').trim();

            // Update the corresponding field in the whoisInfo object
            //Keep it in a small caps
            if (key === 'creation date') {
                whoisInfo._creationDate = value;
            } else if (key === 'updated date') {
                whoisInfo.updatedDate = value;
            } else if (key === 'registry expiry date' || key === 'registrar registration expiration date') {
                whoisInfo.expiryDate = value;
            } else if (key === 'registrant organization') {
                whoisInfo.registrantOrganization = value;
            } else if (key === 'registrant email') {
                whoisInfo.registrantEmail = value;
            } else if (key === 'name server') {
                whoisInfo.nameServers.push(value);
            }
        }
    }

    return whoisInfo;
}

module.exports = {
    getWhoisDetails: limiter.wrap(getWhoisDetails),
};