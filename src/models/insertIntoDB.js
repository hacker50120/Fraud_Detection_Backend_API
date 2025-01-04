// insertIntoDB.js
const { connectToDatabase } = require('../../config/dbConnection');

// Connect to the database
const dbName = 'user_input_data';
const collectionName = ['realBankData', 'messages', 'userInputOnlyBankNames', 'userInputOnlyBankURLs', 'excelData'];


async function insert_user_input_data(data) {
    try {
        const isConnected = await connectToDatabase(dbName)
        const messagesCollection = isConnected.collection(collectionName[1]);

        const insertResult = await messagesCollection.insertOne({ 'userInputData': data });
        if (insertResult) {
            console.log('Data inserted Sucessfully')
            return 'Data inserted Sucessfully';
        } else {
            console.log('Data Not inserted, Something Went Wrong')
            return 'Data Not inserted, Something Went Wrong';
        }
    } catch (e) {
        console.error('Error:', e);
    }
}

module.exports = insert_user_input_data;
// insert_user_input_data("Hiiii")