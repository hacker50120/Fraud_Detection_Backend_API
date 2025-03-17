const { MongoClient } = require('mongodb');
require('dotenv').config();

const MongoDB_USER = process.env.MongoDB_USER;
const MongoDB_PASSWORD = process.env.MongoDB_PASSWORD;
const MongoDB_URL = process.env.MongoDB_URL;

class MongoConnectionManager {
    constructor(url, options) {
        this.url = url;
        this.options = options;
        this.client = new MongoClient(url, options);
        this.connected = false;
    }

    async connect() {
        try {
            await this.client.connect();
            this.connected = true;
            console.log('Connected to MongoDB');
        } catch (error) {
            console.error('Failed to connect to MongoDB:', error);
            throw error;
        }
    }

    async ensureConnection() {
        if (!this.connected || !this.client.isConnected()) {
            console.log('Reconnecting to MongoDB...');
            await this.connect();
        }
    }

    async performDatabaseOperation(databaseName, operation) {
        try {
            await this.ensureConnection();
            const database = this.client.db(databaseName);
            return await operation(database);
        } catch (error) {
            console.error('Error performing database operation:', error);
            throw error;
        }
    }

    async close() {
        if (this.connected) {
            await this.client.close();
            this.connected = false;
            console.log('Connection closed');
        }
    }
}

// Example usage:
const mongoURL = `mongodb://${MongoDB_USER}:${MongoDB_PASSWORD}@${MongoDB_URL}`;
const mongoOptions = { useNewUrlParser: true, useUnifiedTopology: true };

const connectionManager = new MongoConnectionManager(mongoURL, mongoOptions);

async function connectToDatabase(databaseName) {
    try {
        await connectionManager.connect();
        const database = connectionManager.client.db(databaseName);
        return database;
    } catch (error) {
        throw error;
    }
}

module.exports = {
    connectToDatabase,
};
