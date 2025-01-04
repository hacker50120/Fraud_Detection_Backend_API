const fs = require('fs');
const bankNameExtractor = require('./bankNameExtractor');
const blankBankNameANDURLInserter = require('./blankBankNameANDURLInserter')
const cleanUrl = require('./cleanUrl');
const hashUrl = require('./hashUrl');
const checkDuplicateHash = require('./checkDuplicateHash');
const URLresolver = require('./urlResolver'); // Import the URL resolver module
const msgExtratAndReplacer = require('./msgExtratAndReplacer');
const whoISDetail = require('./whoISDetail');
const wordPressCheck = require('./wordPressCheck');
const fraudDetectionOperations = require('./fraudDetectionOperations');
const rediAndHTTPSCheck = require('./redirectionANDHTTPSCheck')
const sslChecker = require('./sslChecker');
const portScanning = require('./portScanning');
const { abort, exit } = require('process');
const firstTimeDataCheckInDBModule = require('../models/firstTimeDataCheckInDB');


async function main_function(inputMessage, smsHeader) {
    try {
        //My Scopes and Variables
        let SMSHeader, cleanedUrl, cleanUrlWWW, URLhash, bankName, isWordPressUsing, isHTTPS, isRedirection, whoIsData, portScannerRes, certificateInfo
        console.log('\n-------------New API Hit Found----------------> \n');


        // Allow only alphanumeric characters and safe symbols like underscore and hyphen
        SMSHeader = smsHeader.replace(/[^\w\s\-]/gi, '');
        if (!SMSHeader.length > 0) {
            SMSHeader = "NULL";
        }
        console.log("SMS Header:", SMSHeader);

        //Step-0) Extracting bank Name from the messages
        //Cleaning URL from the MSG 
        const msgReplacerURL = await msgExtratAndReplacer.replaceUrls(inputMessage, "")
        const bkName = await bankNameExtractor(msgReplacerURL);
        if (bkName.matchedWords.length > 0) {
            bankName = bkName.matchedBanks[0];
            console.log("Matched Banks:", bkName.matchedBanks);
        }

        //Step -1) Url Extraction from the Message
        const extractURL = await msgExtratAndReplacer.URLExtractor(inputMessage);

        if (bankName == "NULLBANKNAME" && extractURL == null) {
            // console.log("Message does not contain any bank name and URL!!");
            const riskmsg = "Error: Incomplete Message - Missing Bank Name and URL";
            const riskScore = 100;
            // Create a JavaScript object
            const jsonDataForNullBankDetails = {
                result: {
                    riskmsg: riskmsg,
                    riskScore: riskScore
                }
            };
            // Convert the object to a JSON-formatted string
            const jsonDataForNullBankDetailsString = JSON.stringify(jsonDataForNullBankDetails);
            // Log or return the JSON string
            console.log(jsonDataForNullBankDetailsString);
            // or return jsonString; // if you want to use it in a function
            return { riskmsg, riskScore }
        } else if (!(bankName == "NULLBANKNAME") && extractURL == null) {
            //If only bank URL is null, but found bank name
            // console.log("This Bank is Geniune Bank");
            const riskmsg = "Provided Bank is Genuine.";
            const riskScore = 0;
            // Create a JavaScript object
            const jsonDataForBankDetails = {
                result: {
                    riskmsg: riskmsg,
                    riskScore: riskScore
                }
            };
            // Convert the object to a JSON-formatted string
            const jsonDataForBankDetailsString = JSON.stringify(jsonDataForBankDetails);
            // Log or return the JSON string
            console.log(jsonDataForBankDetailsString);
            return { riskmsg, riskScore }
        } else if (!(extractURL == null)) {
            //If the URL is not null, Even could be possible, either the bank name could be null or valid bank name 
            console.log("Running The Block where URL is not Null");

            //Checking DO we have previously saved data in our DB
            await blankBankNameANDURLInserter.blankBankNameInserter(SMSHeader, bankName, inputMessage, extractURL);
            // return 'No such URLs found in the message';

            //If URL does not resolved then other code will not work and only insert the extracted Data
            //Step -2) Resolving the URL 
            const resolvedUrl = await URLresolver.mainBlockForURLResolver(SMSHeader, extractURL, inputMessage); // Resolve the short URL (assuming you want the first URL found)
            console.log('Resolved URL is: ', resolvedUrl);

            //Checking the URL & bank Name exist in DB or Not
            const isInDB = await firstTimeDataCheckInDBModule.firstTimeDataCheckInDB(bankName, resolvedUrl)
            if (isInDB.riskmsg && isInDB.riskScore) {
                // console.log('Data Already Exist in DB, No need to run the modules..');
                return { riskmsg: isInDB.riskmsg, riskScore: isInDB.riskScore };
            } else {
                let { riskmsg, riskScore } = await firstTimeDataCheckInDBModule.BankURLDirectCheckInDB(bankName, URLhash);
                if (riskmsg) {
                    //For sometime adding the code to detect bank url in per defined DB
                    riskmsg = riskmsg;
                    riskScore = riskScore;
                    // Create a JavaScript object
                    const jsonDataForBankDetails = {
                        result: {
                            riskmsg: riskmsg,
                            riskScore: riskScore
                        }
                    };
                    // Convert the object to a JSON-formatted string
                    const jsonDataForBankDetailsString = JSON.stringify(jsonDataForBankDetails);
                    // Log or return the JSON string
                    console.log(jsonDataForBankDetailsString);
                    console.log("Direct Ans:");
                    return { riskmsg, riskScore }
                } else {
                    console.log("sorry");
                    //Step -3) Now Cleaning the URL to convert into hash form
                    try {
                        if (resolvedUrl) {
                            //Advanced Clean URL
                            cleanedUrl = cleanUrl.cleanUrlAdvanced(resolvedUrl);
                            console.log(`Clean URL is: ${cleanedUrl}`);
                            //Basic Clean URL
                            cleanUrlWWW = cleanUrl.cleanUrlWWW(resolvedUrl);
                            console.log('basicCleanURL ', cleanUrlWWW);


                            //Step -4) Converting the URL into MD5 Hash value 
                            URLhash = hashUrl(cleanedUrl);
                            console.log(`Md5 Hased URL: ${URLhash}`);


                            //Step -5)HTTPS CHeck | it will retr 3 times if fail
                            isHTTPS = await rediAndHTTPSCheck.checkHttpsConnection(cleanUrlWWW, 3, (error, isHttps) => {
                                if (error) {
                                    console.error('Error:', error);
                                } else {
                                    return isHttps
                                }
                            });
                            console.log('Is Website using HTTPS:', isHTTPS);


                            console.log('cleanUrlWWW', cleanUrlWWW);
                            //Step -6) Redirection Check 
                            try {
                                isRedirection = await rediAndHTTPSCheck.checkRedirection(cleanUrlWWW);
                                console.log(`Redirection Status: ${isRedirection}`);
                            } catch (err) {
                                console.log("Getting error on Redirection Check");
                            }


                            //Step -7) sslChecker
                            certificateInfo = await sslChecker(cleanUrlWWW)
                            if (certificateInfo) {
                                console.log('sslCertInfo:', certificateInfo);
                            }



                            //Step -7)whois Detail checkup
                            whoIsData = await whoISDetail.getWhoisDetails(cleanedUrl);
                            if (whoIsData) {
                                console.log('Whois Detail:', whoIsData);
                            }



                            //Step -8) OpenPort Check 
                            portScannerRes = await portScanning(cleanedUrl);
                            console.log('Open Ports Detail: ', portScannerRes);




                            // Check if the website is using WordPress
                            isWordPressUsing = await wordPressCheck(resolvedUrl);

                            if (isWordPressUsing) {
                                console.log(`The website ${resolvedUrl} is using WordPress.`);
                            } else {
                                console.log(`The website ${resolvedUrl} is not using WordPress.`);
                            }
                        }



                    } catch (error) {
                        console.log('Error: Unable to resolve the provided URL in the message');
                        return { riskmsg: 'Error: Unable to resolve the provided URL in the message', riskScore: 100 }
                    }

                    // //Step -7) API One --Checking the URL is geniune or not based on AI provided_bank_matches_url parameter
                    const { riskmsg, riskScore } = await fraudDetectionOperations(URLhash, bankName, cleanedUrl, isHTTPS, isWordPressUsing, isRedirection, portScannerRes[0])
                    console.log(`Risk Score is: ${riskScore} , Risk MSG: ${riskmsg}`);

                    //Step -5) Prepraing Object of Data for DB if hash not found this data will be inseterd
                    const dataForDB = ({
                        SMSHeader: SMSHeader || "NULL",
                        msgBankName: bankName || "fraud",
                        originalUrl: extractURL[0],
                        cleanedUrl: cleanedUrl,
                        resolvedUrl: resolvedUrl,
                        hashedUrl: URLhash,
                        spamMsg: inputMessage,
                        isUsingWordPress: isWordPressUsing,
                        isUsingHTTPS: isHTTPS,
                        isRedirection: isRedirection,
                        sslCertInfo: certificateInfo,
                        portScannerRes: portScannerRes[0],
                        whoISDetail: whoIsData,
                        riskmsg: riskmsg,
                        riskScore: riskScore
                    });

                    //Checking the stored hased for the resolved url In DB and if not found dataForDB it will be inserted
                    await checkDuplicateHash.forMainMessageDB(URLhash, bankName, dataForDB);
                    console.log(dataForDB);
                    return { riskmsg, riskScore };
                }
            }
        }
    } catch (error) {
        console.log(error);
        return "Error: An error occurred in the function"
    }
}


// module.exports = { main_function };
module.exports = main_function;

// message = "Here are some URLs: Dear Customer, Your Facebook Account https://facebook.com has been locked due to incomplete KYC. Kindly download our mobile app from the following URL to update your details:"
// main_function(message)




//For AI ------------------------------------->
//Step -6) Checking Do we have already stored the msg data before calling the GPT AI for the any URL
// const aIReturnDataElementCheckvalue = await aIReturnDataElementCheck(URLhash);
// if (aIReturnDataElementCheckvalue) {
//     console.log("For this URL AI already returend some data");
//     // return ("For this URL AI already returend some data");
// } else {
//     console.log("AI never ran for this message");
//     //Passing message to the chatGPT API with predefine sytax
//     const prompt_msg = await msgExtratAndReplacer.replaceUrls(inputMessage, resolvedUrl)
//     console.log(`The old message was ${inputMessage}, \n now after the resolved URL Msg is : \n ${prompt_msg}`)

//Sending the resolved URL messages to GPT model
// const aiResponseobj = await codiAIModule.runAndStoreAIStringToObj(prompt_msg);
// console.log(aiResponseobj)
//Savingh ChatGPT data into DB for future refernces, require two param -hash, update_data_obj
// await saveAIDataToDataBase.updateDataForAI(URLhash, aiResponseobj)
// const a = console.log(inputMessage);

// }
// //Step -7) AI One --Checking the URL is geniune or not based on AI provided_bank_matches_url parameter
// const operationsOnDBDataFuncBool = await operationsOnDBData(URLhash)
// if (operationsOnDBDataFuncBool) {
//     console.log("50 Percentage Chances URL is Geniune..")
//     return "50 Percentage Chances URL is Geniune.."
// } else {
//     console.log("Risk Ahead!!")
//     return "Risk Ahead!!"
// }




























// async function main() {
//     const response = await chatGPTModule.chatWithGPT('Translate the following English text to French: "Hello, how are you?"');
//     console.log('ChatGPT Response:', response);
// }

// main();


// module.exports = processInput;


// const inputMessage = "Here are some URLs: https://shorturl.at/foN03"
// processUrls(inputMessage)
// processInput(inputMessage)
// console.log(b, a);
// Example usage:
// const inputMessage = "https://shorturl.at/foN03";
// processUrls(inputMessage)
//     .then(result => {
//         console.log(result);
//     })
//     .catch(error => {
//         console.error(`An error occurred: ${error}`);
//     });


// =================Code -1 +===============

// const fs = require('fs');
// const cleanUrl = require('./cleanUrl');
// const hashUrl = require('./hashUrl');
// const checkDuplicate = require('./checkDuplicate');
// const insertData = require('./insertIntoDB');


// async function processUrls(inputMessage) {
//     const regex = /(?:https?:\/\/)?(?:www\d{0,3}\.)?([a-z0-9.\-]+[.][a-z]{2,4}(?:\/\S*)?)/gi;

//     const matches = inputMessage.match(regex);

//     if (matches) {
//         const cleanedUrls = matches.map(cleanUrl);
//         const hashedUrls = cleanedUrls.map(hashUrl);

//         const data = matches.map((url, index) => ({
//             originalUrl: url,
//             cleanedUrl: cleanedUrls[index],
//             hashedUrl: hashedUrls[index]
//         }));

//         const jsonData = JSON.stringify(data, null, 2);

//         fs.writeFileSync('output.json', jsonData, 'utf8');

//         // const hash = hashUrl(jsonData);

//         const hash = hashUrl(cleanedUrls.join(',')); //        Create a hash from cleaned URLs

//         console.log('Cleaned URLs Hash:', hash);
//         // checkDuplicate(hash)

//         // checkDuplicate(hash)
//         //     .then(isDuplicate => {
//         //         if (isDuplicate) {
//         //             console.log('Entry is already in the database.');
//         //         } else {
//         //             console.log('No entry in the database. Inserting...');
//         //             return insertData(jsonData);
//         //         }
//         //     })
//         //     // .then(() => {
//         //     //     console.log('Operation complete.');
//         //     // })
//         //     .catch(error => {
//         //         console.error('Error:', error);
//         //     });


//         const isDuplicate = await checkDuplicate(hash);
//         console.log(isDuplicate);
//         if (isDuplicate) {
//             return 'Entry is already in the database.';
//         } else {
//             insertData(jsonData);
//             return 'Data inserted into the database.';
//         }
//     } else {
//         return 'No URLs found.';
//     }
// }

// module.exports = processUrls;


// ==============================================
// Code -2

// // const regex = /\b((?:https?:\/\/|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}\/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()\[\]{};:'\".,<>?«»“”‘’]))/gi;

// const fs = require('fs');
// const cleanUrl = require('./cleanUrl');
// const hashUrl = require('./hashUrl');
// const checkDuplicate = require('./checkDuplicate');
// const insertData = require('./insertIntoDB');

// const inputMessage = "Here are some URLs: https://qwww.bing.com";
// const regex = /(?:https?:\/\/)?(?:www\d{0,3}\.)?([a-z0-9.\-]+[.][a-z]{2,4}(?:\/\S*)?)/gi;

// const matches = inputMessage.match(regex);

// if (!matches || matches.length === 0) {
//     console.log("No URLs found.");
//     process.exit(0);
// }

// const cleanedUrls = matches.map(cleanUrl);
// const hashedUrls = cleanedUrls.map(hashUrl);

// const data = matches.map((url, index) => ({
//     originalUrl: url,
//     cleanedUrl: cleanedUrls[index],
//     hashedUrl: hashedUrls[index]
// }));

// const jsonData = JSON.stringify(data, null, 2);

// fs.writeFileSync('output.json', jsonData, 'utf8');

// const hash = hashUrl(cleanedUrls.join(',')); // Create a hash from cleaned URLs

// console.log('Cleaned URLs Hash:', hash);
// // checkDuplicate(hash)

// checkDuplicate(hash)
//     .then(isDuplicate => {
//         if (isDuplicate) {
//             console.log('Entry is already in the database.');
//         } else {
//             console.log('No entry in the database. Inserting...');
//             return insertData(jsonData);
//         }
//     })
//     // .then(() => {
//     //     console.log('Operation complete.');
//     // })
//     .catch(error => {
//         console.error('Error:', error);
//     });