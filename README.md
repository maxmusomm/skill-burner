# Skill Burner

A dynamic, interactive learning application designed to help users acquire new skills through an AI-powered chat interface. It features real-time communication and personalized learning assistance.

## Features

- **Interactive Chat Interface**: Users can communicate with an AI agent in real-time.
- **AI-Powered Skill Consultation**: The backend leverages an AI agent (potentially Google ADK or similar) to understand user queries and provide learning guidance.
- **Real-time Communication**: Utilizes Socket.IO for seamless, bidirectional communication between the client and server.
- **Message Persistence**: The server stores chat messages in an in-memory database for the session.
- **Scalable Architecture**: Built with a separate frontend (Next.js) and backend (Node.js), allowing for independent development and scaling.

## Architecture

The project is composed of three main parts:

1.  **Frontend (Client)**:
    *   Built with Next.js and React.
    *   Provides the user interface for the chat application.
    *   Connects to the backend server via Socket.IO to send and receive messages.
    *   Located in the `client/` directory.

2.  **Backend (Server)**:
    *   A Node.js application using Express and Socket.IO.
    *   Manages WebSocket connections and communication with clients.
    *   Stores chat messages in an in-memory array (`db`).
    *   Forwards user messages to an AI agent service and relays the agent's responses back to the client.
    *   Located in the `server/` directory.

3.  **AI Agent (Agent Service)**:
    *   A separate Python service (likely using FastAPI or a similar framework, as suggested by the `agent/` directory structure).
    *   Receives messages from the Node.js backend.
    *   Processes the messages using an AI model (e.g., Google ADK/Gemini) to generate relevant responses.
    *   Returns responses to the Node.js backend.
    *   Located in the `agent/` directory.

## Project Structure

```
skill-burner/
├── agent/                  # Python-based AI Agent service
│   ├── app/
│   │   ├── SkillConsultantAgent/
│   │   │   ├── agent.py          # Main agent logic
│   │   │   ├── instructions.py   # Agent instructions
│   │   │   └── __init__.py
│   │   └── main.py              # FastAPI server (assumption)
│   ├── requirements.txt
│   └── Dockerfile
├── client/                 # Next.js Frontend Application
│   ├── app/
│   │   ├── page.js             # Main chat page component
│   │   └── layout.js           # Layout component
│   ├── public/               # Static assets
│   ├── package.json
│   └── next.config.mjs
├── server/                 # Node.js Backend Server
│   ├── server.js             # Express and Socket.IO server logic
│   └── package.json
├── compose.yaml            # Docker Compose configuration
└── README.md               # This file
```

## Setup and Running the Application

This project is designed to be run using Docker Compose for ease of setup and orchestration of the different services.

1.  **Prerequisites**:
    *   Docker installed
    *   Docker Compose installed

2.  **Environment Variables (for AI Agent)**:
    *   Navigate to the `agent/` directory.
    *   If there's an `.env.example` file, copy it to `.env`:
        ```bash
        cd agent
        cp .env.example .env
        ```
    *   Edit the `.env` file with any necessary API keys or configuration for the AI agent service (e.g., Google API credentials).

3.  **Build and Run with Docker Compose**:
    *   From the root `skill-burner/` directory, run:
        ```bash
        docker-compose up --build
        ```
    *   This command will build the Docker images for the client, server, and agent services (if they don't exist or have changed) and then start them.

4.  **Accessing the Application**:
    *   **Frontend (Chat Interface)**: Open your browser and navigate to `http://localhost:3000` (or the port specified for the client service in `compose.yaml`).
    *   **Backend Server (Socket.IO)**: Runs on port `9000` (as configured in `server/server.js` and potentially `compose.yaml`).
    *   **AI Agent Service**: Runs on port `8000` (as configured in `agent/` and potentially `compose.yaml`).

## Usage

1.  Once the application is running, open the chat interface in your browser (`http://localhost:3000`).
2.  Type messages into the input field and send them.
3.  The messages will be sent to the Node.js backend, then to the AI agent, and the agent's response will be displayed in the chat.
4.  The chat history is maintained on the server for the duration of the session.

## Technologies Used

*   **Frontend**:
    *   Next.js
    *   React
    *   Socket.IO Client
    *   Tailwind CSS (based on class names)
*   **Backend**:
    *   Node.js
    *   Express (implicitly, as `http.createServer()` is often used with it, though not explicitly shown in `server.js` for Socket.IO standalone)
    *   Socket.IO
*   **AI Agent**:
    *   Python
    *   FastAPI (assumption based on common practices and `agent/` structure)
    *   Google ADK/Gemini (or a similar AI model/platform)
*   **Containerization**:
    *   Docker
    *   Docker Compose

---

*This README provides a general overview. Specific configurations and details can be found within the respective service directories and code files.*
