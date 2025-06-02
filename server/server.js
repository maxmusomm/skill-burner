const http = require('http');
const { Server } = require('socket.io');
const axios = require('axios');
const { connectToMongoDB, getDB } = require('./lib/db');
const { createOrUpdateUser } = require('./lib/userController');
const { createOrGetSession, addMessageToSession, getSessionMessages } = require('./lib/sessionController');
const { createAgentSession } = require('./lib/agentController');


const db = []; // This in-memory db can be removed if not needed for backward compatibility

// MongoDB connection
connectToMongoDB().catch(error => {
    console.error("Failed to connect to MongoDB on startup:", error);
    process.exit(1); // Exit if DB connection fails
});

const httpServer = http.createServer();
const io = new Server(httpServer, {
    cors: {
        origin: '*',
    },
});

io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    // createSession(); // Removed original call here

    let currentUser = null;
    let currentSessionId = null; // This will also serve as the current room name for the socket
    let currentAppSessionMongoId = null; // MongoDB _id of the current app session document

    // Handle user authentication data
    socket.on('user_authenticated', async (userData) => {
        console.log('User authentication data received:', userData);
        try {
            const user = await createOrUpdateUser(userData);
            currentUser = user;
            socket.emit('user_processed', { success: true, user });
            console.log('User processed successfully:', user);
        } catch (error) {
            console.error('Error processing user:', error);
            socket.emit('user_processed', { success: false, error: error.message });
        }
    });

    // Handle session creation
    socket.on('create_session', async (data) => {
        const { sessionId: newSessionId } = data; // Renamed to avoid confusion
        console.log('Session creation requested:', newSessionId);

        if (!currentUser) {
            socket.emit('session_error', { error: 'User not authenticated' });
            return;
        }

        try {
            const appSession = await createOrGetSession(newSessionId, currentUser._id);

            // Room management
            if (currentSessionId && currentSessionId !== newSessionId) {
                socket.leave(currentSessionId);
                console.log(`Socket ${socket.id} left room ${currentSessionId}`);
            }
            // Join the new room if not already in it or if it's a different room
            if (currentSessionId !== newSessionId) {
                socket.join(newSessionId);
                console.log(`Socket ${socket.id} joined room ${newSessionId}`);
            }
            currentSessionId = newSessionId; // Update the socket's current NextAuth session ID / room
            currentAppSessionMongoId = appSession._id.toString(); // Store the MongoDB _id of the app session

            // Send existing messages for this session
            const messages = await getSessionMessages(newSessionId);
            socket.emit('session_created', { session: appSession, messages });
            console.log('Session processed successfully:', appSession._id);

            // Create a session with the external agent using dynamic IDs
            if (currentUser && appSession) {
                createAgentSession(currentUser._id.toString(), appSession._id.toString()) // Uses imported function
                    .catch(err => console.error("Failed to initiate agent session creation:", err)); // Log errors from the async call
            }

        } catch (error) {
            console.error('Error processing session:', error);
            socket.emit('session_error', { error: error.message });
        }
    });

    socket.on('send_message', async (data) => {
        console.log('Message received from client:', data.message);

        if (!currentUser || !currentSessionId || !currentAppSessionMongoId) {
            socket.emit('error_response', { error: 'User not authenticated or session not fully established' });
            return;
        }

        // Store user message in session
        const userMessageData = {
            by: 'user',
            msg: data.message,
            timestamp: new Date()
        };

        try {
            await addMessageToSession(currentSessionId, userMessageData);
            console.log('User message stored in session:', userMessageData);
        } catch (error) {
            console.error('Error storing user message:', error);
        }

        // Keep the existing in-memory storage for backwards compatibility
        const userMessage = {
            id: Date.now(),
            text: data.message,
            sender: 'user',
            timestamp: new Date().toISOString()
        };
        db.push(userMessage);
        console.log('Stored user message in memory:', userMessage);

        // Broadcast the new user message to all clients
        io.to(currentSessionId).emit('new_message', userMessage);

        try {
            const payload = {
                app_name: "SkillConsultantAgent",
                user_id: currentUser._id.toString(),      // Use MongoDB user ID
                session_id: currentAppSessionMongoId, // Use MongoDB session document ID
                new_message: {
                    role: "user",
                    parts: [{ text: data.message }],
                },
            };

            console.log('Sending POST request to API with payload:', payload);

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

                // Store agent message in session
                const agentMessageData = {
                    by: 'agent',
                    msg: agentResponse,
                    timestamp: new Date()
                };

                try {
                    await addMessageToSession(currentSessionId, agentMessageData);
                    console.log('Agent message stored in session:', agentMessageData);
                } catch (error) {
                    console.error('Error storing agent message:', error);
                }

                // Create agent message object for backwards compatibility
                const agentMessage = {
                    id: Date.now() + 1,
                    text: agentResponse,
                    sender: 'agent',
                    timestamp: new Date().toISOString()
                };

                // Store agent message in memory
                db.push(agentMessage);
                console.log('Stored agent message in memory:', agentMessage);

                // Broadcast the agent response to all clients
                io.to(currentSessionId).emit('new_message', agentMessage);
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
                io.to(currentSessionId).emit('new_message', errorMessage);
            }

        } catch (error) {
            console.error('Error communicating with API:');
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
                io.to(currentSessionId).emit('new_message', errorMessage);
            } else if (error.request) {
                console.error('Request:', error.request);
                socket.emit('error_response', { error: 'No response from API', details: 'The server did not respond.' });

                const errorMessage = {
                    id: Date.now() + 1,
                    text: 'Sorry, the API server did not respond.',
                    sender: 'agent',
                    isError: true,
                    timestamp: new Date().toISOString()
                };
                db.push(errorMessage);
                io.to(currentSessionId).emit('new_message', errorMessage);
            } else {
                console.error('Error message:', error.message);
                socket.emit('error_response', { error: 'Error setting up request to API', details: error.message });

                const errorMessage = {
                    id: Date.now() + 1,
                    text: 'Sorry, there was an error setting up the request to the API.',
                    sender: 'agent',
                    isError: true,
                    timestamp: new Date().toISOString()
                };
                db.push(errorMessage);
                io.to(currentSessionId).emit('new_message', errorMessage);
            }
        }
    });
});

httpServer.listen(9000, '0.0.0.0', () => {
    console.log('Socket.IO server running on port 9000');
    console.log('Using in-memory storage for messages and sessions');
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('Shutting down gracefully...');
    if (mongoClient) {
        await mongoClient.close();
        console.log('MongoDB connection closed');
    }
    process.exit(0);
});


