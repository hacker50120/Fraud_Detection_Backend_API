// init-script.js

// Connect to the MongoDB server
conn = new Mongo();

// Switch to the 'user_input_data' database
db = db.getSiblingDB('user_input_data');

// Create collections
db.createCollection('messages');
db.createCollection('realBankData');

print("Executing script for userInputOnlyBankNames");

db.createCollection('userInputOnlyBankNames');
db.createCollection('userInputOnlyBankURLs');

// Load CSV data into collections
loadCSV('/docker-entrypoint-initdb.d/messages.csv', 'messages');
loadCSV('/docker-entrypoint-initdb.d/realBankData.csv', 'realBankData');

function loadCSV(filePath, collectionName) {
    const fileContent = cat(filePath);
    const lines = fileContent.split('\n');
    const headers = lines[0].split(',');

    const data = [];
    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        const entry = {};
        for (let j = 0; j < headers.length; j++) {
            entry[headers[j]] = values[j];
        }
        data.push(entry);
    }

    // Insert data into the specified collection
    db[collectionName].insertMany(data);
}