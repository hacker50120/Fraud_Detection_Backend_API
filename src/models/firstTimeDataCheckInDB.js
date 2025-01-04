const hashUrl = require('../controllers/hashUrl');
const cleanUrl = require('../controllers/cleanUrl');
const insertData = require('./insertIntoDB');
const { connectToDatabase } = require('../../config/dbConnection');


// Connect to the database
const dbName = 'user_input_data';
const collectionName = ['realBankData', 'messages', 'userInputOnlyBankNames', 'userInputOnlyBankURLs'];
let cleanedUrl, URLhash
async function firstTimeDataCheckInDB(bankName, resolvedUrl) {
    try {

        const isConnected = await connectToDatabase(dbName);
        const messagesCollection = isConnected.collection(collectionName[1]);

        // console.log('-----------------------------------------------------------------------------');

        if (resolvedUrl) {
            //Advanced Clean URL
            cleanedUrl = cleanUrl.cleanUrlAdvanced(resolvedUrl);
            console.log(`Clean URL is firstTimeDataCheckInDB: ${cleanedUrl}`);

            //Step -4) Converting the URL into MD5 Hash value 
            URLhash = hashUrl(cleanedUrl);
            console.log(`Md5 Hased URL firstTimeDataCheckInDB: ${URLhash}`);

        }
        let riskmsg, riskScore // Add this counter
            // Find all documents in the "messages" collection with the same hash
        const matchingDocuments = await messagesCollection.find({ 'userInputData.hashedUrl': URLhash }).toArray();
        for (const document of matchingDocuments) {
            if (document.userInputData.msgBankName == bankName) {
                console.log(`Data already exists in the ${document._id} collection`);
                console.log('----------', document.userInputData.msgBankName)
                    // console.log('DB Data: ', document);
                riskmsg = document.userInputData.riskmsg;
                riskScore = document.userInputData.riskScore;
                console.log(riskmsg, '*(*****************8', riskScore);
            }

        }
        return { riskmsg: riskmsg, riskScore: riskScore };

    } catch (e) {
        console.error('Error:', e);
        return { riskmsg: false, riskScore: false };
    }
}


async function BankURLDirectCheckInDB(bankName, resolvedUrl) {
    try {

        const isConnected = await connectToDatabase(dbName);
        const realBankDataCollection = isConnected.collection(collectionName[0]);

        console.log(bankName);
        // console.log('-----------------------------------------------------------------------------');

        if (resolvedUrl) {
            //Advanced Clean URL
            cleanedUrl = cleanUrl.cleanUrlAdvanced(resolvedUrl);
            console.log(`Clean URL is firstTimeDataCheckInDB.BankURLDirectCheckInDB: ${cleanedUrl}`);

            //Step -4) Converting the URL into MD5 Hash value 
            URLhash = hashUrl(cleanedUrl);
            console.log(`Md5 Hased URL firstTimeDataCheckInDB.BankURLDirectCheckInDB: ${URLhash}`);

        }
        let riskmsg, riskScore // Add this counter
            // Find all documents in the "realBankData" collection with the same hash
        const matchingDocuments = await realBankDataCollection.find({ 'bank_short_endpoint_hashed_form_md5': URLhash }).toArray();
        // console.log("----->", matchingDocuments[0].bank_name_denoter);
        // for (const document of matchingDocuments) {
        const document = matchingDocuments[0];
        if (document.bank_name_denoter === bankName) {
            console.log(`Data already exists in the ${document._id} collection`);
            riskmsg = `This ${document.bank_full_name} is Geniune Bank`;
            riskScore = 0;
            // }
        }
        return { riskmsg, riskScore };

    } catch (e) {
        console.error('Error:', e);
        return { riskmsg: false, riskScore: false };
    }
}



module.exports = { firstTimeDataCheckInDB, BankURLDirectCheckInDB };




// async function main() {
//     bankName = "IOBBK"
//     resolvedUrl = "https://www.iob.in"

//     await BankURLDirectCheckInDB(bankName, resolvedUrl);
//     // console.log(value);

// }

// main();