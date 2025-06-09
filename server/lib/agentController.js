const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

const AGENT_API_URL = process.env.AGENT_API_URL || 'http://localhost:8000';

// Renamed and modified function to create a session with the external agent
const createAgentSession = async (appUserId, appSessionId, userName) => {
    const payload = {
        state: {
            user_id: appUserId, // Use passed appUserId
            session_id: appSessionId, // Use passed appSessionId
            user_name: userName, // Use passed userName
        } // Or any other relevant initial state for the agent
    }

    try {
        // Use the dynamic appUserId and appSessionId in the URL
        const response = await axios.post(`${AGENT_API_URL}/apps/SkillConsultantAgent/users/${appUserId}/sessions/${appSessionId}`, payload, {
            headers: {
                'Content-Type': 'application/json',
            },
        })

        console.log('Agent session created successfully for user:', appUserId, 'app session:', appSessionId, response.data);
    }
    catch (error) {
        console.error('Error creating agent session for user:', appUserId, 'app session:', appSessionId);
        if (error.response) {
            console.error('Data:', error.response.data);
            console.error('Status:', error.response.status);
            console.error('Headers:', error.response.headers);
        } else if (error.request) {
            console.error('Request:', error.request);
        } else {
            console.error('Error message:', error.message);
        }
        // Depending on requirements, you might want to throw the error or return a status
    }
}

// Function to call the agent's delete session endpoint
const deleteAgentSession = async (appUserId, appSessionId) => {
    try {
        const response = await axios.delete(`${AGENT_API_URL}/apps/SkillConsultantAgent/users/${appUserId}/sessions/${appSessionId}`);
        console.log('Agent session deleted successfully via agent endpoint for user:', appUserId, 'app session:', appSessionId, response.data);
        return response.data;
    } catch (error) {
        console.error('Error deleting agent session via agent endpoint for user:', appUserId, 'app session:', appSessionId);
        if (error.response) {
            console.error('Data:', error.response.data);
            console.error('Status:', error.response.status);
            console.error('Headers:', error.response.headers);
        } else if (error.request) {
            console.error('Request:', error.request);
        } else {
            console.error('Error message:', error.message);
        }
        // Depending on requirements, you might want to throw the error or return a status
        throw error; // Re-throw the error to be caught by the caller in server.js
    }
};

module.exports = { createAgentSession, deleteAgentSession };
