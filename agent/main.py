import json
import asyncio
import os
from dotenv import load_dotenv
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
from utils import process_agent_response


# --- JSON SERIALIZATION PATCH FOR GROUNDINGMETADATA ---
# This patch ensures that any GroundingMetadata or related objects are converted to dicts before being stored in the DB.
from google.genai import types as genai_types
import dataclasses

_original_json_encoder_default = json.JSONEncoder.default

def custom_json_encoder_default(self, o) ->  Any | dict[str, Any] | Any:
    # Handle GroundingMetadata and related types
    if hasattr(o, 'model_dump'):
        try:
            return o.model_dump(mode='json')
        except Exception:
            pass
    if hasattr(o, 'dict'):
        try:
            return o.dict()
        except Exception:
            pass
    if dataclasses.is_dataclass(o) and not isinstance(o, type):
        return dataclasses.asdict(o)
    # Fallback to original
    return _original_json_encoder_default(self, o)

json.JSONEncoder.default = custom_json_encoder_default
# --- END PATCH ---


app = FastAPI()

@app.get("/")
async def read_root():
    return {"message": "Agent server is running"}

db_url = "sqlite:///./my_agent_data.db"
# db_url: str | None = os.getenv("POSTGRES_DB_URI", "postgresql://postgres:mysecretpassword@postgres:5432/postgres")
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

@app.delete("/apps/{app_name}/users/{user_id}/sessions/{session_id}")
async def delete_session_endpoint(app_name: str, user_id: str, session_id: str) -> None:
    await session_service.delete_session(app_name=app_name, user_id=user_id, session_id=session_id)

@app.post("/run")
async def run_agent_endpoint(request_body: RunRequest) -> str | None: # Return type changed
    runner = Runner(agent=root_agent, session_service=session_service, app_name=request_body.app_name) # Use app_name from request

    user_message_text = ""
    if request_body.new_message.parts:
        # Assuming the first part contains the text, as per server.js structure
        user_message_text: str = request_body.new_message.parts[0].text or ""

    user_content = types.Content(
        role=request_body.new_message.role,
        parts=[types.Part(text=user_message_text)]
    )

    print(f"AGENT_LOG: /run endpoint called for user: {request_body.user_id}, session: {request_body.session_id}, message: '{user_message_text}'") # Debug log

    final_response = ""
        
        # Log the author and content of the serialized event_dict
        # Using json.dumps for content part to handle complex structures cleanly in logs
    try:
        async for event in runner.run_async(
            user_id=request_body.user_id,
            session_id=request_body.session_id,
            new_message=user_content
        ):
            response: str | None = await process_agent_response(event)
            if response:
                final_response: str = response
    except Exception as e:
        print(f"Error during agent call: {e}")
        
        
    return final_response


    
# async def main_async() -> None:
#     session: Session = await create_session_endpoint('max', 'server User', 'session1', SessionRequest(state={"user_id": "server User", "session_id": "session1","user_name": "mko"}))
#     print(session)
    
#     event = await run_agent_endpoint("Hello, how are you?")
#     print(f"event: {event}")


# if __name__ == "__main__":
#     asyncio.run(main_async())