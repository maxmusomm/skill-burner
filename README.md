# Skill Burner

A comprehensive learning platform that leverages AI technology to provide personalized skill development through interactive conversations, dynamic content generation, and progress tracking. The platform combines real-time communication with intelligent learning assistance to create an engaging and effective learning experience.

## Features

- **Interactive Chat Interface**: Engage with an AI learning consultant in real-time through a modern, user-friendly interface.
- **AI-Powered Learning**: Powered by Google's Gemini model to provide intelligent, context-aware learning guidance.
- **Personalized Learning Plans**: Receive customized skill development roadmaps based on your goals and current knowledge.
- **PDF Document Generation**: Automatically generate and view course materials and assessments in PDF format.
- **Session Management**: Persistent conversations with context retention across sessions.
- **User Authentication**: Secure access with user authentication and session tracking.
- **Progress Tracking**: Monitor your learning journey with built-in progress tracking.
- **Real-time Updates**: Seamless communication using Socket.IO for instant responses.
- **Multi-User Support**: Designed to handle multiple concurrent users with isolated sessions.
- **MongoDB Integration**: Robust data persistence for user data, sessions, and learning materials.

## Architecture

The project is composed of three main components working together to deliver a comprehensive learning experience:

1.  **Frontend (Next.js Client)**:

    - Built with Next.js, React, and TailwindCSS for a modern, responsive UI
    - Features an interactive chat interface with real-time updates
    - Implements user authentication and session management
    - Includes a PDF viewer for course materials and assessments
    - Manages WebSocket connections via Socket.IO for real-time communication
    - Located in the `client/` directory

2.  **Backend (Node.js Server)**:

    - Node.js application using Express and Socket.IO
    - Handles real-time WebSocket connections and message routing
    - Manages user sessions and authentication
    - Integrates with MongoDB for persistent data storage
    - Coordinates communication between client and AI agent
    - Handles PDF document storage and retrieval
    - Located in the `server/` directory

3.  **AI Agent (Python Service)**:
    - Python-based service using FastAPI
    - Implements Google's Gemini model for intelligent responses
    - Creates personalized learning plans and roadmaps
    - Generates course materials and assessments
    - Converts learning content to PDF format
    - Maintains conversation context for personalized learning
    - Located in the `agent/` directory

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

    - Docker installed
    - Docker Compose installed

2.  **Environment Variables (for AI Agent)**:

    - Navigate to the `agent/` directory.
    - If there's an `.env.example` file, copy it to `.env`:
      ```bash
      cd agent
      cp .env.example .env
      ```
    - Edit the `.env` file with any necessary API keys or configuration for the AI agent service (e.g., Google API credentials).

3.  **Build and Run with Docker Compose**:

    - From the root `skill-burner/` directory, run:
      ```bash
      docker-compose up --build
      ```
    - This command will build the Docker images for the client, server, and agent services (if they don't exist or have changed) and then start them.

4.  **Accessing the Application**:
    - **Frontend (Chat Interface)**: Open your browser and navigate to `http://localhost:3000` (or the port specified for the client service in `compose.yaml`).
    - **Backend Server (Socket.IO)**: Runs on port `9000` (as configured in `server/server.js` and potentially `compose.yaml`).
    - **AI Agent Service**: Runs on port `8000` (as configured in `agent/` and potentially `compose.yaml`).

## Usage

1.  Once the application is running, open the chat interface in your browser (`http://localhost:3000`).
2.  Type messages into the input field and send them.
3.  The messages will be sent to the Node.js backend, then to the AI agent, and the agent's response will be displayed in the chat.
4.  The chat history is maintained on the server for the duration of the session.

## Technologies Used

- **Frontend**:

  - Next.js 14+
  - React
  - TailwindCSS
  - Socket.IO Client
  - PDF.js for document viewing

- **Backend**:

  - Node.js
  - Express
  - Socket.IO
  - MongoDB
  - JSON Web Tokens (JWT)

- **AI Service**:

  - Python
  - FastAPI
  - Google Gemini
  - PDF generation libraries

- **Development & Deployment**:
  - Docker
  - Docker Compose
  - Git
  - Environment-based configuration

* **Frontend**:
  - Next.js
  - React
  - Socket.IO Client
  - Tailwind CSS (based on class names)
* **Backend**:
  - Node.js
  - Express (implicitly, as `http.createServer()` is often used with it, though not explicitly shown in `server.js` for Socket.IO standalone)
  - Socket.IO
* **AI Agent**:
  - Python
  - FastAPI (assumption based on common practices and `agent/` structure)
  - Google ADK/Gemini (or a similar AI model/platform)
* **Containerization**:
  - Docker
  - Docker Compose

---

_This README provides a general overview. Specific configurations and details can be found within the respective service directories and code files._
