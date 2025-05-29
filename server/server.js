const http = require('http');
const { Server } = require('socket.io');
const axios = require('axios'); // Keep axios for potential future use or alternative methods

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
        const response = await axios.post("http://localhost:8000/apps/SkillConsultantAgent/users/user_123/sessions/123", payload, {
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

    socket.on('send_message', async (data) => {
        console.log('Message received from client:', data.message);

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
            const response = await axios.post('http://localhost:8000/run', payload, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            agentResponse = response.data[0].content.parts[0].text;


            while (response.data[0].author !== "SkillConsultantAgent") {
                console.log(`Response from ${response.data[0].author}:`, agentResponse);
            }
            socket.emit('receive_response', agentResponse);

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

httpServer.listen(9000, () => {
    console.log('Socket.IO server running on port 9000');
});
const beans = [{ "content": { "parts": [{ "functionCall": { "id": "af-e75e946d-c02a-4aad-931e-49e4ab859838", "args": { "city": "new york" }, "name": "get_weather" } }], "role": "model" }, "invocationId": "e-71353f1e-aea1-4821-aa4b-46874a766853", "author": "weather_time_agent", "actions": { "stateDelta": {}, "artifactDelta": {}, "requestedAuthConfigs": {} }, "longRunningToolIds": [], "id": "2Btee6zW", "timestamp": 1743712220.385936 }, { "content": { "parts": [{ "functionResponse": { "id": "af-e75e946d-c02a-4aad-931e-49e4ab859838", "name": "get_weather", "response": { "status": "success", "report": "The weather in New York is sunny with a temperature of 25 degrees Celsius (41 degrees Fahrenheit)." } } }], "role": "user" }, "invocationId": "e-71353f1e-aea1-4821-aa4b-46874a766853", "author": "weather_time_agent", "actions": { "stateDelta": {}, "artifactDelta": {}, "requestedAuthConfigs": {} }, "id": "PmWibL2m", "timestamp": 1743712221.895042 }, { "content": { "parts": [{ "text": "OK. The weather in New York is sunny with a temperature of 25 degrees Celsius (41 degrees Fahrenheit).\n" }], "role": "model" }, "invocationId": "e-71353f1e-aea1-4821-aa4b-46874a766853", "author": "weather_time_agent", "actions": { "stateDelta": {}, "artifactDelta": {}, "requestedAuthConfigs": {} }, "id": "sYT42eVC", "timestamp": 1743712221.899018 }]

beans[0].author