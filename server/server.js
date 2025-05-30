const http = require('http');
const { Server } = require('socket.io');
const axios = require('axios'); // Keep axios for potential future use or alternative methods

const db = []

const httpServer = http.createServer();
const io = new Server(httpServer, {
    cors: {
        origin: '*',
    },
});

const creaeteSession = async () => {
    const payload = {
        state: {}
    }

    try {
        const response = await axios.post("http://agent:8000/apps/SkillConsultantAgent/users/user_123/sessions/123", payload, {
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
    creaeteSession();

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

            // Changed URL from http://agent:8080/run to http://agent:8000/run
            const response = await axios.post('http://agent:8000/run', payload, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            agentResponse = response.data[0].content.parts[0].text;


            while (response.data[0].author !== "SkillConsultantAgent") {
                console.log(`Response from ${response.data[0].author}:`, agentResponse);
            }
            socket.emit('receive_response', agentResponse); // This line might be redundant if agent messages are also sent via 'new_message'
            const agentMessage = {
                id: Date.now() + 1, // Ensure unique ID
                text: agentResponse,
                sender: 'agent',
                timestamp: new Date().toISOString()
            };
            db.push(agentMessage);
            console.log('Stored agent message:', agentMessage);
            // Broadcast the new agent message to all clients
            io.emit('new_message', agentMessage);

        } catch (error) {
            console.error('Error communicating with API:'); // Updated log message
            if (error.response) {

                console.error('Data:', error.response.data);
                console.error('Status:', error.response.status);
                console.error('Headers:', error.response.headers);
                socket.emit('error_response', {
                    error: 'Failed to get response from API', // Updated error message
                    details: error.response.data || 'Server responded with an error'
                });
            } else if (error.request) {
                // The request was made but no response was received
                console.error('Request:', error.request);
                socket.emit('error_response', { error: 'No response from API', details: 'The server did not respond.' }); // Updated error message
            } else {
                // Something happened in setting up the request that triggered an Error
                console.error('Error message:', error.message);
                socket.emit('error_response', { error: 'Error setting up request to API', details: error.message }); // Updated error message
            }
        }
    });
});

httpServer.listen(9000, '0.0.0.0', () => {
    console.log('Socket.IO server running on port 9000');
});
