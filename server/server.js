const http = require('http');
const { Server } = require('socket.io');
const axios = require('axios');
const generateUniqueId = require('generate-unique-id');
const { connectToMongoDB, getDB } = require('./lib/db');
const { createOrUpdateUser } = require('./lib/userController');
const { createOrGetSession, addMessageToSession, getSessionMessages, getUserSessions, deleteSessionFromDB } = require('./lib/sessionController');
const { createAgentSession, deleteAgentSession } = require('./lib/agentController');
const dotenv = require('dotenv');
dotenv.config();

const PORT = process.env.PORT || 9000;

// MongoDB connection
connectToMongoDB().catch(error => {
    console.error("Failed to connect to MongoDB on startup:", error);
    process.exit(1); // Exit if DB connection fails
});

const httpServer = http.createServer();
const io = new Server(httpServer, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
        credentials: true,
    },
});

// Agent API URL
const AGENT_API_URL = process.env.AGENT_API_URL || 'http://localhost:8000';

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

            // Get existing sessions for this user
            const existingSessions = await getUserSessions(user._id);

            socket.emit('user_processed', {
                success: true,
                user,
                existingSessions: existingSessions.map(session => ({
                    sessionId: session.sessionId,
                    createdDate: session.createdDate,
                    lastActivity: session.lastActivity,
                    messageCount: session.messages ? session.messages.length : 0
                }))
            });
            console.log('User processed successfully:', user);
            console.log('Found existing sessions:', existingSessions.length);
        } catch (error) {
            console.error('Error processing user:', error);
            socket.emit('user_processed', { success: false, error: error.message });
        }
    });

    // Handle session creation
    socket.on('create_session', async (data) => {
        console.log('Session creation requested');

        if (!currentUser) {
            socket.emit('session_error', { error: 'User not authenticated' });
            return;
        }

        try {
            // Generate a unique session ID instead of using AuthJS session ID
            const newSessionId = generateUniqueId({
                length: 32,
                useLetters: true,
                useNumbers: true
            });

            console.log('Generated new unique session ID:', newSessionId);

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
            currentSessionId = newSessionId; // Update the socket's current session ID / room
            currentAppSessionMongoId = appSession._id.toString(); // Store the MongoDB _id of the app session

            // Send existing messages for this session
            const messages = await getSessionMessages(newSessionId);
            socket.emit('session_created', { session: appSession, messages });
            console.log('Session processed successfully:', appSession._id);

            // Create a session with the external agent using dynamic IDs
            if (currentUser && appSession) {
                createAgentSession(currentUser._id.toString(), appSession.sessionId, currentUser.name) // Use the actual sessionId, not MongoDB _id
                    .catch(err => console.error("Failed to initiate agent session creation:", err)); // Log errors from the async call
            }

        } catch (error) {
            console.error('Error processing session:', error);
            socket.emit('session_error', { error: error.message });
        }
    });

    // Handle joining existing session
    socket.on('join_session', async (data) => {
        console.log('Join session requested for sessionId:', data.sessionId);

        if (!currentUser) {
            socket.emit('session_error', { error: 'User not authenticated' });
            return;
        }

        if (!data.sessionId) {
            socket.emit('session_error', { error: 'Session ID is required' });
            return;
        }

        try {
            // Verify session belongs to current user
            const sessionsCollection = getDB().collection('sessions');
            const session = await sessionsCollection.findOne({
                sessionId: data.sessionId,
                userId: currentUser._id
            });

            if (!session) {
                socket.emit('session_error', { error: 'Session not found or access denied' });
                return;
            }

            // Room management
            if (currentSessionId && currentSessionId !== data.sessionId) {
                socket.leave(currentSessionId);
                console.log(`Socket ${socket.id} left room ${currentSessionId}`);
            }

            if (currentSessionId !== data.sessionId) {
                socket.join(data.sessionId);
                console.log(`Socket ${socket.id} joined room ${data.sessionId}`);
            }

            currentSessionId = data.sessionId;
            currentAppSessionMongoId = session._id.toString();

            // Send existing messages for this session
            const messages = await getSessionMessages(data.sessionId);
            socket.emit('session_joined', { session, messages });
            console.log('Session joined successfully:', session._id);

        } catch (error) {
            console.error('Error joining session:', error);
            socket.emit('session_error', { error: error.message });
        }
    });

    socket.on('send_message', async (data) => {
        console.log('Message received from client:', data.message);

        if (!currentUser || !currentSessionId) {
            socket.emit('error_response', { error: 'User not authenticated or session not fully established' });
            return;
        }

        // Store user message in session
        const messageId = Date.now();
        const userMessageData = {
            id: messageId,
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
            id: messageId,
            text: data.message,
            sender: 'user',
            timestamp: new Date().toISOString()
        };
        console.log('User message (formerly in-memory):', userMessage);

        // Broadcast the new user message to all clients
        io.to(currentSessionId).emit('new_message', userMessage);

        try {
            const payload = {
                app_name: "SkillConsultantAgent",
                user_id: currentUser._id.toString(),      // Use MongoDB user ID
                session_id: currentSessionId, // Use the generated unique session ID
                new_message: {
                    role: "user",
                    parts: [{ text: data.message }],
                },
            };

            console.log('Sending POST request to API with payload:', payload);


            const agentResponse = await axios.post(`${AGENT_API_URL}/run`, payload, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            console.log('API Response:', agentResponse);

            // Extract the agent response - handle variable position and filter by author
            if (agentResponse) {

                if (agentResponse) {
                    // Store agent message in session
                    const agentMessageId = Date.now() + 1;
                    const agentMessageData = {
                        id: agentMessageId,
                        by: 'agent',
                        msg: agentResponse.data,
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
                        id: agentMessageId,
                        text: agentResponse.data,
                        sender: 'agent',
                        timestamp: new Date().toISOString()
                    };

                    // Store agent message in memory
                    console.log('Agent message (formerly in-memory):', agentMessage);

                    // Broadcast the agent response to all clients
                    io.to(currentSessionId).emit('new_message', agentMessage);
                } else {
                    console.log('No valid text response found from SkillConsultantAgent');
                }
            } else {
                console.error('Invalid response format from API');
                const errorMessage = {
                    id: Date.now() + 1,
                    text: 'Sorry, I received an invalid response from the API.',
                    sender: 'agent',
                    isError: true,
                    timestamp: new Date().toISOString()
                };
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
                io.to(currentSessionId).emit('new_message', errorMessage);
            }
        }
    });

    socket.on('delete_session', async (data) => {
        console.log('Delete session requested for sessionId:', data.sessionId);

        if (!currentUser) {
            socket.emit('session_delete_error', { error: 'User not authenticated' });
            return;
        }

        if (!data.sessionId) {
            socket.emit('session_delete_error', { error: 'Session ID is required for deletion' });
            return;
        }

        try {
            // 1. Delete from Agent
            await deleteAgentSession(currentUser._id.toString(), data.sessionId);
            console.log(`Agent session ${data.sessionId} deleted successfully for user ${currentUser._id.toString()}.`);

            // 2. Delete from Server's DB (MongoDB)
            const deleteDBResult = await deleteSessionFromDB(data.sessionId, currentUser._id);
            if (deleteDBResult.deletedCount === 0) {
                console.warn(`Session ${data.sessionId} not found in DB for user ${currentUser._id.toString()} or already deleted.`);
                // Optionally, still emit success if agent deletion was the primary goal
            }
            console.log(`Session ${data.sessionId} deleted from DB for user ${currentUser._id.toString()}.`);

            // 3. If the deleted session was the current one, clear it
            if (currentSessionId === data.sessionId) {
                currentSessionId = null;
                currentAppSessionMongoId = null;
                console.log('Cleared current session context as it was deleted.');
            }

            // 4. Notify client of success
            socket.emit('session_deleted_successfully', { sessionId: data.sessionId });
            console.log(`Successfully processed delete request for session ${data.sessionId}`);

        } catch (error) {
            console.error('Error processing delete_session request for session:', data.sessionId, error);
            socket.emit('session_delete_error', { sessionId: data.sessionId, error: error.message || 'Failed to delete session' });
        }
    });
});

httpServer.listen(PORT, '0.0.0.0', () => {
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
