from google.adk.agents import Agent
from google.adk.sessions import Session, InMemorySessionService
from google.adk.runners import Runner

session_id = "123"
user_id = "user_123"
app_name = "testapp"


root_agent = Agent(
    name="chatbot",
    description="This is a test app agent for testing purposes.",
    model="gemini-2.0-flash",
    instruction="You are a chatbot"
)
session_service = InMemorySessionService()
session: Session = session_service.create_session(app_name=app_name, session_id=session_id, user_id=user_id)
runner = Runner(
    agent=root_agent,
    session_service=session_service,
    app_name=app_name,
)