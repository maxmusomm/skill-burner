const axios = require('axios');

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
        const response = await axios.post(`http://localhost:8000/apps/SkillConsultantAgent/users/${appUserId}/sessions/${appSessionId}`, payload, {
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

module.exports = { createAgentSession };
