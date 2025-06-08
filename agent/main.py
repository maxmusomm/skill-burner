import asyncio
from dotenv import load_dotenv
from os import eventfd
from fastapi import FastAPI
from google.adk.events.event import Event
from google.adk.sessions.session import Session
from pydantic import BaseModel
from typing import AsyncGenerator, Dict, Any, List, Optional # Added List, Optional

load_dotenv()  # Load environment variables from .env file

from SkillConsultantAgent.agent import root_agent
from google.adk.sessions import DatabaseSessionService
from google.adk.runners import Runner
from google.genai import types

app = FastAPI()

@app.get("/")
async def read_root():
    return {"message": "Agent server is running"}

db_url = "sqlite:///./my_agent_data.db"
# db_url = "postgresql://postgres:mysecretpassword@localhost:5432/skill-burner-pg"
session_service = DatabaseSessionService(db_url=db_url)


class SessionRequest(BaseModel):
    state: Dict[str, Any] = {}

# Updated Pydantic models for the /run endpoint request
class MessagePartModel(BaseModel):
    text: Optional[str] = None

class NewMessageModel(BaseModel):
    role: str
    parts: List[MessagePartModel]
    
class RunRequest(BaseModel):
    app_name: str
    user_id: str
    session_id: str
    new_message: NewMessageModel # Changed from query


@app.post("/apps/{app_name}/users/{user_id}/sessions/{session_id}")
async def create_session_endpoint(app_name: str, user_id: str, session_id: str, request_body: SessionRequest) -> Session:
    session: Session = await session_service.create_session(
        app_name=app_name,
        user_id=user_id,
        session_id=session_id,
        state=request_body.state
    )
    return session

@app.post("/run")
async def run_agent_endpoint(request_body: RunRequest) -> List[Dict[str, Any]]: # Return type changed
    runner = Runner(agent=root_agent, session_service=session_service, app_name=request_body.app_name) # Use app_name from request

    user_message_text = ""
    if request_body.new_message.parts:
        # Assuming the first part contains the text, as per server.js structure
        user_message_text = request_body.new_message.parts[0].text or ""

    user_content = types.Content(
        role=request_body.new_message.role,
        parts=[types.Part(text=user_message_text)]
    )

    event_generator: AsyncGenerator[Event, None] = runner.run_async(
        user_id=request_body.user_id,
        session_id=request_body.session_id,
        new_message=user_content
    )

    response_events: List[Dict[str, Any]] = []
    async for event_obj in event_generator:
        event_dict: Dict[str, Any] = {}
        if hasattr(event_obj, 'model_dump'): # Pydantic v2+
            event_dict = event_obj.model_dump(by_alias=True, exclude_none=False)
        elif hasattr(event_obj, 'dict'): # Pydantic v1
            event_dict = event_obj.dict(by_alias=True, exclude_none=False)
        else:
            # Fallback if not a Pydantic model - this might not perfectly match the nested structure
            # This part is a simplified fallback and might need adjustment if Event is not Pydantic
            # and has complex nested objects that don't auto-serialize well.
            event_dict = {
                "id": getattr(event_obj, 'id', None),
                "author": getattr(event_obj, 'author', None),
                "timestamp": getattr(event_obj, 'timestamp', None),
                "invocationId": getattr(event_obj, 'invocation_id', None), # Assuming ADK model uses invocation_id
                "content": None, # Placeholder, will be populated below
                "actions": getattr(event_obj, 'actions', None),
                "longRunningToolIds": getattr(event_obj, 'long_running_tool_ids', None),
            }
            if hasattr(event_obj, 'content') and event_obj.content:
                content_data = event_obj.content
                serialized_parts = []
                if hasattr(content_data, 'parts') and content_data.parts:
                    for part_item in content_data.parts:
                        if hasattr(part_item, 'model_dump'):
                            serialized_parts.append(part_item.model_dump(by_alias=True))
                        elif hasattr(part_item, 'dict'):
                            serialized_parts.append(part_item.dict(by_alias=True))
                        elif isinstance(part_item, dict):
                             serialized_parts.append(part_item)
                        else: # Very basic serialization for unknown part types
                            serialized_parts.append(vars(part_item) if not isinstance(part_item, (str, int, float, bool, list, tuple, dict)) else part_item)
                event_dict["content"] = {
                    "role": getattr(content_data, 'role', None),
                    "parts": serialized_parts
                }

        # Ensure 'actions' and 'longRunningToolIds' conform to the example (empty dict/list if None)
        if event_dict.get("actions") is None:
            event_dict["actions"] = {}
        if event_dict.get("longRunningToolIds") is None:
            event_dict["longRunningToolIds"] = []
        
        response_events.append(event_dict)
    
    return response_events
    
# async def main_async() -> None:
#     session: Session = await create_session_endpoint('max', 'server User', 'session1', SessionRequest(state={"user_id": "server User", "session_id": "session1","user_name": "mko"}))
#     print(session)
    
#     event = await run_agent_endpoint("Hello, how are you?")
#     print(f"event: {event}")


# if __name__ == "__main__":
#     asyncio.run(main_async())