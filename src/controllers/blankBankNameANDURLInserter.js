const { connectToDatabase } = require('../../config/dbConnection');
const checkDuplicateHash = require('./checkDuplicateHash');
const cleanUrl = require('./cleanUrl');
const hashUrl = require('./hashUrl');
// Connect to the database
const dbName = 'user_input_data';
const collectionName = ['realBankData', 'messages', 'userInputOnlyBankNames', 'userInputOnlyBankURLs', 'loggingErrorURLs'];


//Checking if the letter is greater than 30 then onl insert the data.
function countLetters(inputString) {
    // Remove spaces and any non-alphabet characters
    const cleanString = inputString.replace(/[^a-zA-Z]/g, '');
    const letterCount = cleanString.length;
    return letterCount;
}


async function blankBankNameInserter(SMSHeader, userInputDataMsgBankName, inputMsg, inputURL) {
    try {

        const isConnected = await connectToDatabase(dbName)
        const userInputOnlyBankNames = isConnected.collection(collectionName[2]);

        //Advanced Clean URL
        const cleanedUrl = cleanUrl.cleanUrlAdvanced(inputURL[0]);

        //Converting the URL into MD5 Hash value 
        const URLhash = hashUrl(cleanedUrl);

        const numberOfLetters = countLetters(inputMsg);
        if (numberOfLetters >= 30) {
            const dataFound = await checkDuplicateHash.foruserInputOnlyBankNames(URLhash);
            if (dataFound) {
                console.log(`Data already in the userInputOnlyBankNames Collection | [For blank Bank Name] `)
                return 'Data already in the userInputOnlyBankNames Collection | [For blank Bank Name]';
            } else {
                const insertResult = await userInputOnlyBankNames.insertOne({ 'SMSHeader': SMSHeader, 'UserinputURL': inputURL, 'hashedURL': URLhash, 'userInputbankName': userInputDataMsgBankName, 'userInputMsg': inputMsg });
                if (insertResult) {
                    console.log(`Data inserted Sucessfully in userInputOnlyBankNames Collection | [For blank Bank Name]`)
                    return 'Data inserted Sucessfully in userInputOnlyBankNames Collection | [For blank Bank Name]';
                }
            }
        } else {
            console.log(`Data not inserted in userInputOnlyBankNames Collection, Msg length is less than 30 char | [For blank Bank Name]`)
            return 'Data not inserted in userInputOnlyBankNames Collection, Msg length is less than 30 char | [For blank Bank Name]';
        }

    } catch (error) {
        return error;
    }
}


async function blankBankURLInserter(inputMsg, dataObj) {
    try {
        const isConnected = await connectToDatabase(dbName)
        const userInputOnlyBankURLs = isConnected.collection(collectionName[3]);

        const numberOfLetters = countLetters(inputMsg);
        if (numberOfLetters >= 30) {
            const insertResult = await userInputOnlyBankURLs.insertOne({ userInputData: dataObj });
            if (insertResult) {
                console.log(`Data inserted Sucessfully in userInputOnlyBankURLs Collection`)
                return 'Data inserted Sucessfully in userInputOnlyBankURLs Collection';
            }
        } else {
            console.log(`Data not inserted in userInputOnlyBankURLs Collection`)
            return 'Data not inserted in userInputOnlyBankURLs Collection, Something Went Wrong';
        }

    } catch (error) {
        return error;
    }
}

async function loggingErrorURLs(SMSHeader, userInputURL, inputMsg) {
    try {
        const isConnected = await connectToDatabase(dbName)
        const loggingErrorURLs = isConnected.collection(collectionName[4]);

        const insertResult = await loggingErrorURLs.insertOne({ 'SMSHeader': SMSHeader, 'userInputURLs': userInputURL, 'userInputMsg': inputMsg });
        if (insertResult) {
            console.log(`Errro URL logged`)
            return 'Errro URL logged';

        } else {
            console.log(`Errro URL doen not logged`)
            return 'Errro URL does not logged';
        }

    } catch (error) {
        return error;
    }
}


module.exports = { blankBankNameInserter, blankBankURLInserter, loggingErrorURLs };

// blankBankNameANDURLInserter('SBIBK', 'Dearnk c1s123sustomre here to help you');