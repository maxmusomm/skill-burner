# Skill Burner

A WebSocket-based streaming application that helps users learn new skills through AI-powered consultation and personalized learning plans.

## Features

- Real-time WebSocket streaming communication
- AI-powered skill consultation using Google ADK
- Personalized learning plan generation
- Interactive chat interface
- PDF generation for courses and roadmaps

## Architecture

- **Backend**: FastAPI server with WebSocket streaming
- **Frontend**: HTML/JavaScript client with real-time chat interface
- **AI Agent**: Google ADK-based skill consultant agent
- **Session Management**: In-memory session service

## Setup

1. Navigate to the agent directory:
```bash
cd agent
```

2. Create and activate virtual environment:
```bash
python -m venv .venv
source .venv/bin/activate  # On Linux/Mac
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your Google API credentials
```

5. Run the server:
```bash
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

6. Open your browser and navigate to `http://localhost:8000`

## Usage

1. Connect to the WebSocket streaming interface
2. Ask about skills you want to learn
3. Answer clarifying questions from the AI consultant
4. Receive personalized learning plans and resources
5. Download generated course PDFs and roadmaps

## Project Structure

```
skill-burner/
├── agent/
│   ├── app/
│   │   ├── SkillConsultantAgent/
│   │   │   ├── agent.py          # Main agent logic
│   │   │   ├── instructions.py   # Agent instructions
│   │   │   └── __init__.py
│   │   └── main.py              # FastAPI server with WebSocket
│   ├── requirements.txt
│   └── Dockerfile
├── client/
│   └── index.html              # Frontend interface
└── README.md
```

## Technologies Used

- **Backend**: FastAPI, WebSocket, Google ADK
- **Frontend**: HTML5, JavaScript, CSS3
- **AI**: Google Gemini 2.0 Flash
- **PDF Generation**: WeasyPrint
- **Search**: Google Search API
