const insertData = require('../models/insertIntoDB');
const { connectToDatabase } = require('../../config/dbConnection');

// Connect to the database
const dbName = 'user_input_data';
const collectionName = ['realBankData', 'messages', 'userInputOnlyBankNames', 'userInputOnlyBankURLs'];

async function forMainMessageDB(hash, bankName, dataForDB) {
    try {
        const isConnected = await connectToDatabase(dbName);
        const messagesCollection = isConnected.collection('messages');

        // Find all documents in the "messages" collection with the same hash
        const matchingDocuments = await messagesCollection.find({ 'userInputData.hashedUrl': hash }).toArray();
        // console.log('----------', matchingDocuments);
        for (const document of matchingDocuments) {
            try {
                if (document.userInputData.msgBankName === bankName) {
                    console.log(`Data already exists in the ${document._id} message collection`);
                    return true; // Data already exists in this collection
                }
            } catch (err) {
                return false;
            }
        }

        // If the hash doesn't exist in any document, insert the data
        console.log("Data Insertion Sucessfully!!");
        insertData(dataForDB);

        return false; // Data doesn't exist in any document
    } catch (e) {
        console.error('Error:', e);
    }
}



async function foruserInputOnlyBankNames(hashURL) {
    try {
        const isConnected = await connectToDatabase(dbName);
        const messagesCollection = isConnected.collection('userInputOnlyBankNames');

        // Find all documents in the "userInputOnlyBankNames" collection with the same hash
        const matchingDocuments = await messagesCollection.find({ 'hashedURL': hashURL }).toArray();
        // console.log('----------', matchingDocuments);
        for (const document of matchingDocuments) {
            try {
                if (document.hashedURL === hashURL) {
                    // console.log(`Data already exists in the ${document._id} - userInputOnlyBankNames collection`);
                    return true; // Data already exists in this collection
                }
            } catch (err) {
                console.log(`Data does not exists in userInputOnlyBankNames collection`);
                return false;
            }
        }
        return false; // Data doesn't exist in any document
    } catch (e) {
        console.error('Error:', e);
    }
}

module.exports = { forMainMessageDB, foruserInputOnlyBankNames };