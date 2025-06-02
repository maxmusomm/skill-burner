const { MongoClient } = require('mongodb');

const mongodbURI = 'mongodb://localhost:27017';
const dbName = 'skill-burner';

let mongoClient;
let mongoDB;

const connectToMongoDB = async () => {
    try {
        mongoClient = new MongoClient(mongodbURI);
        await mongoClient.connect();
        mongoDB = mongoClient.db(dbName);
        console.log('Connected to MongoDB successfully');

        // Create indexes for better performance
        await mongoDB.collection('users').createIndex({ email: 1 }, { unique: true });
        await mongoDB.collection('sessions').createIndex({ sessionId: 1 }, { unique: true });
        await mongoDB.collection('sessions').createIndex({ userId: 1 });

    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        // Propagate the error to allow server.js to handle it or exit
        throw error;
    }
};

const getDB = () => {
    if (!mongoDB) {
        throw new Error('MongoDB not connected. Call connectToMongoDB first.');
    }
    return mongoDB;
};

const getClient = () => {
    if (!mongoClient) {
        throw new Error('MongoDB client not initialized. Call connectToMongoDB first.');
    }
    return mongoClient;
};

module.exports = {
    connectToMongoDB,
    getDB,
    getClient
};
