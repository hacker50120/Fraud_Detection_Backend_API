const { connectToDatabase } = require('../../config/dbConnection');
const bankNameExtractor = require('./bankNameExtractor');

// Score System
const BankNameScore = 25
let bankURLScore = 25
const URLLengthScore = 5
const SSLChcekScore = 10
const HTTPSSScore = 5
const wordpressCheckScore = 5
const RedirectioCheckScore = 5
const PortCheckScore = 10
const whoisScore = 5
const SharedServerCheckScore = 5
let riskEight_portCheck = 0
    // const webSiteRepoScore = 5
    // const DomainAuthScore = 5


const dbName = 'user_input_data';
const collectionName = ['realBankData', 'messages'];
// Connect to the database
async function fraudDetectionOperations(hash, userInputDataMsgBankName, userInputDataMsgURL, isHTTPS, isWordpress, isRedirection, portScannerRes) {
    try {
        const isConnected = await connectToDatabase(dbName)
        const realBankDataCollection = isConnected.collection(collectionName[0]);
        // const messagesCollection = isConnected.collection(collectionName[1]);
        // console.log(collectionName[1]);

        //OP-1) Chceking the user input and DB saved bank name

        // console.log('For Realbank Collection:', unqIDForRealbank);



        // const matchedHashMessages = await messagesCollection.findOne({ 'userInputData.hashedUrl': hash })
        // const unqIDFormessages = matchedHashMessages;
        // console.log('For Message Collection:', unqIDFormessages);


        //Match -1)bank Name matching
        async function bankNameMatching() {
            try {
                if (userInputDataMsgBankName == "NULLBANKNAME") {
                    console.log('=============NULLBANKNAME CHECK==============');
                    const bkcheck = await bankURLMatching()
                    if (bkcheck == 25) {
                        console.log('NULLBANKNAME Bankscore: ', BankNameScore);
                        return BankNameScore
                    } else {
                        return 0
                    }
                } else {
                    const matchedHashBankDataBankname = await realBankDataCollection.findOne({
                        $or: [
                            { 'bank_short_endpoint_hashed_form_md5': hash }, // Check for the first field value
                            { 'bank_short_endpoint_hashed_form_md5': '136b3cda187a6253f7222a6aa9a9c01b' } // Check for the second field value if the first is not found
                        ]
                    })
                    const unqIDForRealbankName = matchedHashBankDataBankname;
                    if (unqIDForRealbankName.bank_name_denoter === userInputDataMsgBankName) {
                        console.log(`Bank Name Match Sucessfully.. || Real bank name: ${unqIDForRealbankName.bank_name_denoter} & userInput bank Name: ${userInputDataMsgBankName}`);
                        // return the risk score
                        return BankNameScore
                    } else {
                        console.log(`Bank Name does not Matched.. || Real bank name: ${unqIDForRealbankName.bank_name_denoter} & userInput bank Name: ${userInputDataMsgBankName}`);
                        // return the risk score
                        return (0)
                    }
                }
            } catch (error) {
                return 0;
            }
        }

        //Add Null data prevention in future
        //Match -1)bank Name matching
        async function bankURLMatching() {
            try {
                const matchedHashBankDataURL = await realBankDataCollection.findOne({
                    $or: [
                        { 'bank_short_endpoint_hashed_form_md5': hash }, // Check for the first field value
                        { 'bank_short_endpoint_hashed_form_md5': '136b3cda187a6253f7222a6aa9a9c01b' } // Check for the second field value if the first is not found
                    ]
                })
                console.log("------------->", matchedHashBankDataURL);
                const unqIDForRealbankURL = matchedHashBankDataURL;
                console.log("------------------------------->>>>", unqIDForRealbankURL.bank_short_endpoint);
                if (unqIDForRealbankURL.bank_short_endpoint === userInputDataMsgURL) {
                    console.log(`Bank URL Match Sucessfully.. || Real bank URL: ${unqIDForRealbankURL.bank_short_endpoint} & userInput bank URL: ${userInputDataMsgURL}`);
                    // return the risk score
                    riskEight_portCheck = await portCheck() || 0;
                    console.log(riskEight_portCheck);
                    return bankURLScore
                } else {
                    console.log(`Bank URL does not Matched.. || Real bank URL: ${unqIDForRealbankURL.bank_short_endpoint} & userInput bank URL: ${userInputDataMsgURL}`);
                    // return the risk score
                    return (0)
                }
            } catch (error) {
                return 0;
            }
        }


        //bankURL Length Matching
        async function bankURLLenMatching() {
            try {
                const userInputDataMsgURLLen = userInputDataMsgURL.length;
                const matchedHashBankDataURLLen = await realBankDataCollection.findOne({
                    $or: [
                        { 'bank_short_endpoint_hashed_form_md5': hash }, // Check for the first field value
                        { 'bank_short_endpoint_hashed_form_md5': '136b3cda187a6253f7222a6aa9a9c01b' } // Check for the second field value if the first is not found
                    ]
                })
                const unqIDForRealbankURLLen = matchedHashBankDataURLLen;
                if (unqIDForRealbankURLLen.bank_domain_length === userInputDataMsgURLLen) {
                    console.log(`Bank URL Length Match Sucessfully.. || Real bank URL: ${unqIDForRealbankURLLen.bank_domain_length} & userInput bank URL: ${userInputDataMsgURLLen}`);
                    // return the risk score
                    return URLLengthScore
                } else {
                    console.log(`Bank URL Length does not Matched.. || Real bank URL: ${unqIDForRealbankURLLen.bank_domain_length} & userInput bank URL: ${userInputDataMsgURLLen}`);
                    // return the risk score
                    return (0)
                }
            } catch (error) {
                return 0;
            }
        }


        //bank SSL Cert CName Matching
        async function bankSSLMatching() {
            try {
                const matchedHashBankDataSSL = await realBankDataCollection.findOne({
                    $or: [
                        { 'bank_short_endpoint_hashed_form_md5': hash }, // Check for the first field value
                        { 'bank_short_endpoint_hashed_form_md5': '136b3cda187a6253f7222a6aa9a9c01b' } // Check for the second field value if the first is not found
                    ]
                })
                const unqIDForRealbankSSL = matchedHashBankDataSSL;
                // console.log(unqIDForRealbankSSL.sslCertInfo.validFor);
                const validURLs = unqIDForRealbankSSL.sslCertInfo.validFor;

                function isURLValid(userInput) {
                    // Normalize the user input by removing leading "www." and "http://"
                    const normalizedInput = userInput.replace(/^www\./i, '').replace(/^http:\/\//i, '');
                    // Check if the normalized input exists in the array
                    return validURLs.includes(normalizedInput);
                }

                const isValid = isURLValid(userInputDataMsgURL);

                if (isValid) {
                    console.log(`Bank SSL Cert URL Match Sucessfully.. || ${userInputDataMsgURL} is a valid URL.`);
                    return SSLChcekScore
                } else {
                    console.log(`Bank SSL Cert URL does not Matched.. || ${userInputDataMsgURL} is not a valid URL.`);
                    return (0)
                }

            } catch (error) {
                return 0;
            }
        }



        //HTTPS Check
        async function bankHTTPSCheck() {
            try {
                const matchedHTTPSCheck = await realBankDataCollection.findOne({
                    $or: [
                        { 'bank_short_endpoint_hashed_form_md5': hash }, // Check for the first field value
                        { 'bank_short_endpoint_hashed_form_md5': '136b3cda187a6253f7222a6aa9a9c01b' } // Check for the second field value if the first is not found
                    ]
                })
                const matchediSHTTPSCheck = matchedHTTPSCheck;
                if (matchediSHTTPSCheck.is_running_on_https === isHTTPS) {
                    console.log(`Bank URL ${userInputDataMsgURL} is USing HTTPS ${isHTTPS}`);
                    // return the risk score
                    return HTTPSSScore
                } else {
                    console.log(`Bank URL ${userInputDataMsgURL} is not USing HTTPS`);
                    // return the risk score
                    return (0)
                }
            } catch (error) {
                return 0;
            }
        }


        //Is using wordpress

        async function isWordpressCheck() {
            try {
                if (isWordpress) {
                    console.log(`${userInputDataMsgURL} Website is using Wordpress.`);
                    // return the risk score
                    return (0)
                } else {
                    console.log(`${userInputDataMsgURL} Website is notusing Wordpress.`);
                    // return the risk score
                    return wordpressCheckScore
                }
            } catch (error) {
                return 0;
            }
        }


        //RedirectionCheck Checking 
        async function isRedirectionCheck() {
            try {
                const isR = isRedirection.toString()
                if (isR === '[Safe-100]') {
                    console.log(isR);
                    return RedirectioCheckScore
                } else if (isR === '[Safe - 70]') {
                    console.log(isR);
                    return (RedirectioCheckScore - 1)
                } else if (isR === '[Danger-100]' || 'isR === [Fail]') {
                    console.log(isR);
                    return (0)
                } else if (isR === '[Danger-10]' || isR === '[Danger-0]') {
                    console.log(isR);
                    return (RedirectioCheckScore - 3)
                } else {
                    console.log(isR);
                    return (0)
                }
            } catch (error) {
                return 0;
            }
        }



        //Port Checking 
        async function portCheck() {
            const portRes = portScannerRes.ports
            try {
                const port80 = portRes.includes(80);
                const port443 = portRes.includes(443);
                if (port80 && port443) {
                    if (portRes.length >= 2) {
                        console.log('Wesbite has only port 80 and 433 Open');
                        return PortCheckScore
                    } else if (portRes.length >= 3) {
                        console.log(`Wesbite has port 80, 433 & one more Open Port: ${portRes}`);
                        return (PortCheckScore - 2)
                    } else if (portRes.length >= 4 && portRes.length <= 8) {
                        console.log(`Wesbite has port 80, 433 & one multiple Open Port: ${portRes}`);
                        return (PortCheckScore - 7)
                    }
                } else if (port80 || port443) {
                    if (port80) {
                        console.log('Wesbite has only port 80');
                        return (PortCheckScore - 7)
                    } else if (port443) {
                        console.log(`Wesbite has only port 443 `);
                        return (PortCheckScore - 3)
                    }
                } else {
                    console.log('Wesbite does not has port 80 and 433 Open');
                    return (0)
                }

            } catch (error) {
                console.log('error');
                return 0;
            }
        }


        async function riskCalculation() {
            const riskOne_BankNameScore = await bankNameMatching() || 0;
            console.log(riskOne_BankNameScore);
            const riskTwo_bankURLScore = await bankURLMatching() || 0;
            console.log(riskTwo_bankURLScore);
            const riskThree_URLLengthScore = await bankURLLenMatching() || 0;
            console.log(riskThree_URLLengthScore);
            const riskForth_SSLChcekScore = await bankSSLMatching() || 0;
            console.log(riskForth_SSLChcekScore);
            const riskFive_HTTPSSScore = await bankHTTPSCheck() || 0;
            console.log(riskFive_HTTPSSScore);
            const riskSix_isWordpressCheck = await isWordpressCheck() || 0;
            console.log(riskSix_isWordpressCheck);
            const riskSeven_isRedirectionCheck = await isRedirectionCheck() || 0;
            console.log(riskSeven_isRedirectionCheck);
            const TotalRisk = (100 - (riskOne_BankNameScore + riskTwo_bankURLScore + riskThree_URLLengthScore + riskForth_SSLChcekScore + riskFive_HTTPSSScore + riskSix_isWordpressCheck + riskSeven_isRedirectionCheck + riskEight_portCheck))
            console.log(`TotalRisk is : ${TotalRisk}`);
            //If bank URL Mathch
            if (riskTwo_bankURLScore == 25) {
                if (userInputDataMsgBankName == "NULLBANKNAME" && riskOne_BankNameScore == 25) {
                    return {
                        riskmsg: (`This: ${userInputDataMsgURL}, is a geniune bank URL, Risk Score is ${TotalRisk}`),
                        riskScore: TotalRisk
                    };
                }
                //if bank Name match with the Bank URL
                else if (riskOne_BankNameScore == 25) {
                    return {
                        riskmsg: (`Bank Name and Bank URL Matched!!, Risk Score is: ${TotalRisk} | - Possibly a Geniune bank URL`),
                        riskScore: TotalRisk
                    };
                }
                //if bank Name Does not match
                else {
                    return {
                        riskmsg: (`Bank URL Matched, but Bank Name does not matched!!, Risk Score is: ${TotalRisk} | Possibly a Geniune bank URL`),
                        riskScore: TotalRisk
                    };
                }
            } else {
                //If URL Does not match, but bank Name Match
                if (riskOne_BankNameScore == 25) {
                    //If Bank Name Match
                    return {
                        riskmsg: (`Bank Name Matched!!, Risk Score is: ${TotalRisk} | - Possibly URL Looks Suspecious!!`),
                        riskScore: TotalRisk
                    };

                } else {
                    return {
                        riskmsg: (`[DANGER] - Alert!!, It didn't come from the bank. Risk Score is: ${TotalRisk} | -[POSSIBILY A SPAM ON BEHALF OF BANK]`),
                        riskScore: TotalRisk
                    };
                }
            }

            // return TotalRisk;
        }

        return riskCalculation()
    } catch (error) {
        return error;
    }
}



module.exports = fraudDetectionOperations;

// const bk = 'PNBBK'
const bk = 'NULLBANKNAME'
const url = ['axisbank.com', 'google.com']
const hash = ['37af332d2546669487a890b2b81268f5', '1d5920f4b44b27a802bd77c4f0536f5a']
const userin = 's'
    // fraudDetectionOperations(hash[1], bk, url[1], userin, true)



// const hash = 'sss'; // Replace with your actual hash value or keep it falsy for testing
// const query = hash ? { 'bank_short_endpoint_hashed_form_md5': hash } : { 'bank_short_endpoint_hashed_form_md5': '136b3cda187a6253f7222a6aa9a9c01b' };

// console.log(query);