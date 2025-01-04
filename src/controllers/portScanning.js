const { exec } = require('child_process');
const dns = require('dns');
const fs = require('fs');
const os = require('os');
const async = require('async');

// Maximum number of concurrent scans
const maxConcurrency = 2;

// Initialize an object to store scan results
const scanResults = {};

// Function to resolve hostnames to IP addresses
function resolveHostnamesToIPs(hostnames) {
    return new Promise((resolve, reject) => {
        async.mapLimit(
            hostnames,
            maxConcurrency,
            (hostname, resolveCallback) => {
                dns.resolve4(hostname, (err, addresses) => {
                    if (err) {
                        resolveCallback(err);
                    } else {
                        resolveCallback(null, { hostname, addresses });
                    }
                });
            },
            (err, resolvedHosts) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(resolvedHosts);
                }
            }
        );
    });
}

// Create a temporary file and write IP addresses to it
function createTempFileWithIPs(ipAddresses) {
    return new Promise((resolve, reject) => {
        const tempFileName = os.tmpdir() + '/temp-ips.txt';

        fs.writeFile(tempFileName, ipAddresses.join('\n'), (err) => {
            if (err) {
                reject(err);
            } else {
                resolve(tempFileName);
            }
        });
    });
}

// Execute the port scanning command with the temporary file
function runPortScan(tempFileName, hostname) {
    return new Promise((resolve, reject) => {
        const command = `nrich ${tempFileName} --output json`;
        const nrichProcess = exec(command);

        let stdoutData = '';

        nrichProcess.stdout.on('data', (data) => {
            // Accumulate stdout data
            stdoutData += data.toString();
        });

        nrichProcess.stderr.on('data', (data) => {
            // Handle stderr if needed
            console.error(data.toString());
        });

        nrichProcess.on('close', (code) => {
            if (code === 0) {
                // Parse the nrich output and store it in the scanResults object
                const result = JSON.parse(stdoutData);
                scanResults[hostname] = result;
                resolve();
            } else {
                reject(new Error(`nrich process exited with code ${code}`));
            }
        });
    });
}

// Main function to perform the tasks
async function portScanner(hostname) {
    try {
        const hostnames = [hostname];
        const resolvedHosts = await resolveHostnamesToIPs(hostnames);

        const ipAddresses = resolvedHosts.map((host) => host.addresses[0]);
        const tempFileName = await createTempFileWithIPs(ipAddresses);

        await Promise.all(
            resolvedHosts.map(async(host) => {
                await runPortScan(tempFileName, host.hostname);
            })
        );

        console.log('All port scans completed.');

        // Extract the desired information from scanResults
        const extractedResults = resolvedHosts.map((host) => {
            const scanResult = scanResults[host.hostname];
            return {
                hostnames: [host.hostname],
                ip: host.addresses[0],
                ports: scanResult ? scanResult[0].ports : [],
            };
        });
        return extractedResults;
        // console.log('Extracted results:', extractedResults);
    } catch (error) {
        console.error('Error:', error);
    }
}

module.exports = portScanner;


// Run the main function
// portScanner('icicibank.com');