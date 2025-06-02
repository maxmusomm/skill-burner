const { getDB } = require('./db');

// Session management functions
const createOrGetSession = async (sessionId, userId) => {
    try {
        const sessionsCollection = getDB().collection('sessions');

        // Check if session exists
        const existingSession = await sessionsCollection.findOne({ sessionId });

        if (existingSession) {
            console.log('Existing session found:', existingSession._id);
            return existingSession;
        } else {
            // Create new session
            const newSession = {
                sessionId,
                userId,
                messages: [],
                createdDate: new Date(),
                lastActivity: new Date()
            };

            const result = await sessionsCollection.insertOne(newSession);
            console.log('New session created:', result.insertedId);
            return { ...newSession, _id: result.insertedId };
        }
    } catch (error) {
        console.error('Error creating/getting session:', error);
        throw error;
    }
};

const addMessageToSession = async (sessionId, messageData) => {
    try {
        const sessionsCollection = getDB().collection('sessions');

        const result = await sessionsCollection.updateOne(
            { sessionId },
            {
                $push: { messages: messageData },
                $set: { lastActivity: new Date() }
            }
        );

        console.log('Message added to session:', result);
        return result;
    } catch (error) {
        console.error('Error adding message to session:', error);
        throw error;
    }
};

const getSessionMessages = async (sessionId) => {
    try {
        const sessionsCollection = getDB().collection('sessions');
        const session = await sessionsCollection.findOne({ sessionId });

        return session ? session.messages : [];
    } catch (error) {
        console.error('Error getting session messages:', error);
        throw error;
    }
};

module.exports = { createOrGetSession, addMessageToSession, getSessionMessages };
