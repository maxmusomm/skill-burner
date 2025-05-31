const http = require('http');
const { Server } = require('socket.io');
const axios = require('axios');

const db = [];

const httpServer = http.createServer();
const io = new Server(httpServer, {
    cors: {
        origin: '*',
    },
});

const createSession = async () => {
    const payload = {
        state: {}
    }

    try {
        const response = await axios.post(`http://localhost:8000/apps/SkillConsultantAgent/users/user_123/sessions/123`, payload, {
            headers: {
                'Content-Type': 'application/json',
            },
        })

        console.log('Session created successfully:', response.data);
    }
    catch (error) {
        console.error('Error creating session:', error);
        if (error.response) {
            console.error('Data:', error.response.data);
            console.error('Status:', error.response.status);
            console.error('Headers:', error.response.headers);
        } else if (error.request) {
            console.error('Request:', error.request);
        } else {
            console.error('Error message:', error.message);
        }
    }
}

io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    createSession();

    // Send existing messages to the newly connected client
    socket.emit('initial_messages', db);

    socket.on('send_message', async (data) => {
        console.log('Message received from client:', data.message);
        const userMessage = {
            id: Date.now(),
            text: data.message,
            sender: 'user',
            timestamp: new Date().toISOString()
        };
        db.push(userMessage);
        console.log('Stored user message:', userMessage);
        // Broadcast the new user message to all clients
        io.emit('new_message', userMessage);

        try {
            const payload = {
                app_name: "SkillConsultantAgent",
                user_id: "user_123",
                session_id: "123",
                new_message: {
                    role: "user",
                    parts: [{ text: data.message }], // Use the client's message directly
                },
                // streaming: false, // Removed as it's not in the new cURL command
            };

            console.log('Sending POST request to API with payload:', payload);

            // Changed URL from http://localhost:8080/run to http://localhost:8000/run
            const response = await axios.post('http://localhost:8000/run', payload, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            console.log('API Response:', response.data);

            // Extract the agent response
            if (response.data && response.data.length > 0) {
                const agentResponse = response.data[0].content.parts[0].text;
                console.log(`Response from ${response.data[0].author}:`, agentResponse);

                // Create agent message object
                const agentMessage = {
                    id: Date.now() + 1, // Ensure unique ID
                    text: agentResponse,
                    sender: 'agent',
                    timestamp: new Date().toISOString()
                };

                // Store agent message in database
                db.push(agentMessage);
                console.log('Stored agent message:', agentMessage);

                // Broadcast the agent response to all clients
                io.emit('new_message', agentMessage);
            } else {
                console.error('Invalid response format from API');
                const errorMessage = {
                    id: Date.now() + 1,
                    text: 'Sorry, I received an invalid response from the API.',
                    sender: 'agent',
                    isError: true,
                    timestamp: new Date().toISOString()
                };
                db.push(errorMessage);
                io.emit('new_message', errorMessage);
            }

        } catch (error) {
            console.error('Error communicating with API:'); // Updated log message
            if (error.response) {
                console.error('Data:', error.response.data);
                console.error('Status:', error.response.status);
                console.error('Headers:', error.response.headers);
                socket.emit('error_response', {
                    error: 'Failed to get response from API',
                    details: error.response.data || 'Server responded with an error'
                });

                // Store error message in database
                const errorMessage = {
                    id: Date.now() + 1,
                    text: 'Sorry, there was an error getting a response from the API.',
                    sender: 'agent',
                    isError: true,
                    timestamp: new Date().toISOString()
                };
                db.push(errorMessage);
                io.emit('new_message', errorMessage);
            } else if (error.request) {
                // The request was made but no response was received
                console.error('Request:', error.request);
                socket.emit('error_response', { error: 'No response from API', details: 'The server did not respond.' });

                // Store error message in database
                const errorMessage = {
                    id: Date.now() + 1,
                    text: 'Sorry, the API server did not respond.',
                    sender: 'agent',
                    isError: true,
                    timestamp: new Date().toISOString()
                };
                db.push(errorMessage);
                io.emit('new_message', errorMessage);
            } else {
                // Something happened in setting up the request that triggered an Error
                console.error('Error message:', error.message);
                socket.emit('error_response', { error: 'Error setting up request to API', details: error.message });

                // Store error message in database
                const errorMessage = {
                    id: Date.now() + 1,
                    text: 'Sorry, there was an error setting up the request to the API.',
                    sender: 'agent',
                    isError: true,
                    timestamp: new Date().toISOString()
                };
                db.push(errorMessage);
                io.emit('new_message', errorMessage);
            }
        }
    });
});

httpServer.listen(9000, '0.0.0.0', () => {
    console.log('Socket.IO server running on port 9000');
    console.log('Using in-memory storage for messages and sessions');
});
