# --- Imports ---
from google.adk.agents import LlmAgent, SequentialAgent, LoopAgent, ParallelAgent, BaseAgent
from google.adk.sessions import InMemorySessionService, DatabaseSessionService, Session
from google.adk.runners import Runner
from google.adk.tools import google_search, ToolContext, FunctionTool, agent_tool
from google.adk.events.event import Event
from weasyprint import HTML
from . import instructions
from typing import AsyncGenerator

# --- Constants and Configuration ---
APP_NAME = "app"
SESSION_ID = "123"
USER_ID = "user123"

DRAFTED_POINTS = "drafted_points"
SEARCH_QUERIES = "search_queries"
RESOURCES_STATE = "resources_search"
PLAN = "plan"

##Static Values##
GEMINI_MODEL = "gemini-2.0-flash-lite"

# --- Session Management ---
# DB version
# session_service = DatabaseSessionService(db_url="sqlite:///app.db")
session_service = InMemorySessionService()
session: Session = session_service.create_session_sync(
    app_name=APP_NAME, user_id=USER_ID, session_id=SESSION_ID, state={DRAFTED_POINTS: "No points"}
)

# --- Tool Definitions ---

# Tool: exit_loop
def exit_loop(tool_context: ToolContext) -> dict:
    """Call this function ONLY when the critique indicates no further changes are needed, signaling the iterative process should end.
    Args:
        A dict {"status": "loop_exited"} is returned to indicate the loop should exit.
    """
    tool_context.actions.escalate = True
    return {"status": "loop_exited"}

exit_loop_tool = FunctionTool(func=exit_loop)

# Tool: set_drafted_points
def set_drafted_points(drafted_points_text: str, tool_context: ToolContext) -> dict:
    """Saves the provided text as drafted points into the drafted_points session state key.

    Args:
        drafted_points_text (str): The text content of the drafted points to be saved.
    """
    print(
        f"  [Tool Call] set_drafted_points triggered by {tool_context.agent_name} with points: {{drafted_points_text[:100]}}..."
    )  # Log snippet
    tool_context.state[DRAFTED_POINTS] = drafted_points_text
    return {
        "status": f"Drafted points successfully saved to state key '{DRAFTED_POINTS}'.",
        DRAFTED_POINTS: tool_context.state.get(DRAFTED_POINTS),
    }

set_drafted_points_tool = FunctionTool(func=set_drafted_points)

# Tool: html_to_pdf
def html_to_pdf_course(html_content: str, tool_context: ToolContext) -> dict:
    """A tool that converts HTML content to a PDF file and returns the file path.
    Args:
        html_content (str): The HTML content to convert to PDF.
        tool_context (ToolContext): The context in which the tool is called, including session state.
    Returns:
        dict: A dictionary containing the path to the generated PDF file.
    """
    HTML(string=html_content).write_pdf('course.pdf')
    pdf_path = 'course.pdf'
    return {"pdf_path": pdf_path}
html_to_pdf_course_tool = FunctionTool(func=html_to_pdf_course)

def html_to_pdf_roadmap(html_content: str, tool_context: ToolContext) -> dict:
    """A tool that converts HTML content to a PDF file and returns the file path.
    Args:
        html_content (str): The HTML content to convert to PDF.
        tool_context (ToolContext): The context in which the tool is called, including session state.
    Returns:
        dict: A dictionary containing the path to the generated PDF file.
    """
    HTML(string=html_content).write_pdf('roadmap.pdf')
    pdf_path = 'roadmap.pdf'
    return {"pdf_path": pdf_path}

html_to_pdf__roadmap_tool = FunctionTool(func=html_to_pdf_roadmap)


# --- Agent Definitions ---

# Agent: search_query_agent
search_query_agent = LlmAgent(
    name="search_query_agent",
    description="Agent that creates the search queries from search_queries state key for the research_agent to use",
    model=GEMINI_MODEL,
    instruction=f"""
        **Role**:
            You are a highly skilled Content Strategist. Your job is to create a JSON string of search queries for the research_agent to use.
        **Specifics**:
            - Formulate and Output Search Queries JSON: Based on the {DRAFTED_POINTS}, create a JSON string of search queries. This JSON should map descriptive keys to specific search terms.
                    **This JSON string MUST be your primary textual and only output.** It must saved to the '{SEARCH_QUERIES}' state.
                    **Example of the JSON you MUST output (raw string, no markdown fences):**
                    `{{\"Effective dating communication\": \"how to communicate effectively for dating beginners\", \"Summarized learning resources for dating\": \"summarized guides for dating skills\"}}` base on all the points you have in the {DRAFTED_POINTS} state to be searched on.
                - **Do NOT include any other text or explanations.** The JSON string is the only output. The agent next downstream will use this JSON string to search the web for the topics that the user wants to learn.
                
            **Note**:
            Don't give the user show the user anything. All processes must be kept in the background. The user will only see the final output of the plan and the resources that were found for them to learn the skill they want to learn.
            """,
    output_key=SEARCH_QUERIES,
)

# Agent: research_agent
research_agent = LlmAgent(
    name="research_agent",
    description="Agent that searches the web for the topics that the user wants to learn",
    model=GEMINI_MODEL,
    instruction=f"""
        **Role**:
            You are a professional researcher. Your job is to get and use the 'search_queries' state. You will search the web for the topics that the user wants to learn using the 'google_search' tool.
            You must search the web for the topics, books, courses and any other relevant resources on the topic that the user wants to learn and create a list of resources for them to use following the json values to be searched on.
        **Context**:
            You are in a loop with the analysis_agent. and with it in a sequencial flow with it and other agents. These are drafted points that the user wants to learn about. You will find them in the {DRAFTED_POINTS} state.
        **Specifics**:
            - The json string of search queries will be found in the "{{search_queries}}" state key. For example: ```json{{\"Dating conversation starters\": \"conversation starters for dating beginners\", \"Dating communication skills summary\": \"dating communication skills summarized guide\", \"Dating skills for beginners\": \"dating skills for beginners reading materials\"}}```.
            - **For EACH search query in the `search_queries` state, you MUST call the `google_search` tool.**
            - After executing the searches, compile ALL relevant results (URLs, snippets) into a single JSON string.
            - The JSON should have a key "resources" which contains a list of dictionaries, where each dictionary has "query" and "result" keys.
            - Update the {RESOURCES_STATE} state key with this resources JSON string (without code fence markdown).
            
            **INPUT**: JSON string from {SEARCH_QUERIES} like {{"communication styles": "understanding effective communication"}}
            **OUTPUT Example**:
            {{
                "resources": [
                    {{"query": "understanding effective communication", "result": "https://www.example.com/comm-guide-1"}},
                    {{"query": "best sales books", "result": "https://www.goodreads.com/sales-books"}}
                ]
            }}
            
            **Next Step**:
                Transfer control to the analysis_agent for review.
            
            **Note**:
                The analysis_agent is very strict. Be thorough with your search and resource compilation. 
                Don't give the user show the user anything. All processes must be kept in the background. The user will only see the final output of the plan and the resources that were found for them to learn the skill they want to learn.
    """,
    tools=[google_search],
    output_key=RESOURCES_STATE,
)

# Agent: analysis_agent
analysis_agent = LlmAgent(
    name="analysis_agent",
    description="Agent that analyses the resources that the research_agent has found.",
    model=GEMINI_MODEL,
    instruction=f"""
        **Role**:
            You are a strict agent that analyses the resources that the research_agent has found in the {RESOURCES_STATE} state. Check the "{SEARCH_QUERIES}" state for the original search queries the 'research_agent' had to fulfill. You are very strict and want the best resources for the user to learn the skill they want to learn.
        **Context**:
            These are drafted points that the user wants to learn about. You will find them in the {DRAFTED_POINTS} state.
        **Specifics**:
            - Review the resources in the {RESOURCES_STATE} state.
            - Compare them against the original search queries in {SEARCH_QUERIES}.
            - If the resources are **comprehensive and high-quality for ALL original search queries**, you MUST call the `exit_loop` tool. Do not output any text.
            - If the resources are **NOT sufficient or comprehensive**, then output *only* a concise message indicating which search queries need more robust results (e.g., "Need more resources for 'communication styles' and 'negotiation tactics'."). **Do NOT call any tools.** This signals the loop to continue.
            - You have a maximum of 2 iterations (including this one) to ensure quality. If after two iterations the resources are still not perfect, but *generally acceptable*, you can call `exit_loop`. The user expects reasonable results, not perfection after only two tries.
            
            **Example of insufficient critique**: "More research needed for Python basics."
            
            **Note**:
            Don't give the user show the user anything. All processes must be kept in the background. The user will only see the final output of the plan and the resources that were found for them to learn the skill they want to learn.
    """,
    tools=[exit_loop_tool],
)

# Agent: search_analysis_loop (LoopAgent)
search_analysis_loop = LoopAgent(
    name="search_analysis_loop_agents",
    description="Loop agent that loops between the research_agent and the analysis_agent until the analysis_agent is satisfied with the resources that the research_agent has found",
    sub_agents=[research_agent, analysis_agent],
)

# Agent: question_challenge_agent (Tool Agent)
question_challenge_agent = LlmAgent(
    name="question_challenge_agent",
    description="Agent that creates questions and challenges for the user to learn the skill they want to learn",
    model=GEMINI_MODEL,
    instruction="You are an agent tool for a plan_creation_agent. You will be given a instructions to create questions and or challenges for a user to learn skills. Some context on the user's situation are in the 'drafted_points' state. You must create what the plan_creation_agent tells you to do without any comments or explanations from you.",
)
question_challenge_tool = agent_tool.AgentTool(agent=question_challenge_agent)


# Agent: plan_creation_agent
plan_creation_agent = LlmAgent(
    name="plan_creation_agent",
    description="Agent that creates a plan for the user to learn the skill they want to learn",
    model=GEMINI_MODEL,
    instruction=f"""
        Your job is to create a plan for the user for the skill they want to learn.
        **State** to help you and give context:
            - '{DRAFTED_POINTS}' state: These are the drafted points that were taken on the user. They will help you understand what the user wants to learn and their needs.
            - '{RESOURCES_STATE}' state: These are the resources that the research_agent has found for the user to learn the skill they want to learn. Use them to create a plan for the user and any thing else you fill should be included in the plan.
        **Specifics**:
            - Create a plan from the resources of the skill that they want to learn.
            - The plan should be a list of steps that can be followed by two other agents which will execute the steps:
                1. The first agent will be responsible for create a pdf document of the plan.
                2. The second agent will be responsible for creating a road map for the user.
            - If there are any questions or challenges you want to create for the user, use you agent tool 'question_challenge_agent' to create them. This agent will create the questions and or challenges for you depending on what you asked it. It is not a must that you need to use it but if you feel like the user needs to be challenged or asked questions, use it.
            - The plan should have a title and a JSON string containing the steps. You can use whatever naming convention for the different parts of the plan you want. The JSON string should be a list of steps that can be followed by two other agents.
            
        **Output**:
            - The output should be a JSON string with the following keys:
                - "title": The title of the plan.
                - "steps": A JSON string containing the steps of the plan. This should be a list of steps that can be followed by two other agents. within each step, include the quesstion and or challenge you created for that step using the 'question_challenge_agent'.
                - "questions_and_challenges": A JSON string containing the questions and or challenges you created from the  for the user to learn the skill they want to learn. This is optional, you can leave it empty if you don't want to create any questions or challenges.
        **Example**:
            {instructions.plan_state_key_exmaple}
            
        **Note**:
            Don't give the user show the user anything. All processes must be kept in the background. The user will only see the final output of the plan and the resources that were found for them to learn the skill they want to learn.

    """,
    output_key=PLAN,
    tools=[question_challenge_tool],
)

# Agent: skill_course_pdf_creation_agent
skill_course_pdf_creation_agent = LlmAgent(
    name="skill_course_pdf_creation_agent",
    description="Agent that creates a PDF document of the plan for the user to learn the skill they want to learn",
    model=GEMINI_MODEL,
    instruction=f"""
        **Role**:
            Your role is a PDF document creator but you will not create the PDFs directly. Instead, you will call the `html_to_pdf` tool to convert HTML content into a PDF file.
        **Context**:
            You are in a team of agents that create a road map, plan and play book for the user to learn the skill which the asked/told you to help them learn.
            Look through the state keys to gain some more context: '{DRAFTED_POINTS}', '{RESOURCES_STATE}', and the '{PLAN}' state keys.
        **Specifics**:
            - You will analysis the 'plan' state and use it to create an HTML string with nice css in a CV styled way. 
            - This string will be passed to the `html_to_pdf` tool to convert it into a PDF file.
            - Return the output of the `html_to_pdf` tool, which will contain the path to the generated PDF file.
        **Example**: 
            This is an example of how the 'plan' state key will look like:
            {instructions.plan_state_key_exmaple}
        **HTML Example**:
            This is for the roadmap but i want you to use the same styling for the course PDF:
            {instructions.html_roadmap_example}
        
                   
    """,
    tools=[html_to_pdf_course_tool],
)

# Agent: roadmap_creation_agent
roadmap_creation_agent = LlmAgent(
    name="roadmap_creation_agent",
    description="Agent that creates a roadmap for the user to learn the skill they want to learn",
    model=GEMINI_MODEL,
    instruction=f"""
        **Role**:
            Your role is a road map creating agent done by creating pdfs but you will not create the PDFs directly. Instead, you will call the `html_to_pdf` tool to convert HTML content into a PDF file.
        **Context**:
            You are in a team of agents that create a road map, plan and play book for the user to learn the skill which the asked/told you to help them learn.
            Look through the state keys to gain some more context: '{DRAFTED_POINTS}', '{RESOURCES_STATE}', and the '{PLAN}' state keys.
        **Specifics**:
            - You will analysis the '{PLAN}' state and use it to create an HTML string in a nice styled way like the EXAMPLE I will give you. 
            - This string will be passed to the `html_to_pdf` tool to convert it into a PDF file.
            - Return the output of the `html_to_pdf` tool, which will contain the path to the generated PDF file.
        **Example**: 
            This is an example of how the 'plan' state key will look like:

            {instructions.plan_state_key_exmaple}
        
        **HTML Example**:
        {instructions.html_roadmap_example}
        
        **Note**:
            Don't give the user show the user anything. All processes must be kept in the background. The user will only see the final output of the plan and the resources that were found for them to learn the skill they want to learn.

    """,
    tools=[html_to_pdf__roadmap_tool],
)

# Agent: parallel_course_and_roadmap_creation (ParallelAgent)
parallel_course_and_roadmap_creation = ParallelAgent(
    name="parallel_course_and_roadmap_creation",
    description="Parallel agent that creates a PDF document of the plan and a roadmap for the user to learn the skill they want to learn",
    sub_agents=[skill_course_pdf_creation_agent, roadmap_creation_agent],
)

# Agent: finalizing_agent
finalizing_agent = LlmAgent(
    name="finalizing_agent",
    description="Agent that finalizes the learning plan and resources for the user",
    model=GEMINI_MODEL,
    instruction=f"""
        **Role**:
            Your role is to let the user know that their skill course is ready.
        """,
)

cr_and_finalizing_pipline = SequentialAgent(
    name="cr_and_finalizing_agent",
    description="Sequential agent that creates a PDF document of the plan and a roadmap for the user to learn the skill they want to learn and finalizes the learning plan and resources for the user",
    sub_agents=[parallel_course_and_roadmap_creation, finalizing_agent],
)

# --- Agent Team Definitions ---

# Agent Team: skill_learning_agent_team (SequentialAgent)
skill_learning_agent_team = SequentialAgent(
    name="SkillLearningAgentTeam",
    description="Agent team that creates a road map, plan and play book for the user to learn the skill which the asked/told you to help them learn.",
    sub_agents=[search_query_agent, search_analysis_loop, plan_creation_agent, cr_and_finalizing_pipline],
)

# --- Root Agent Definition ---
root_agent = LlmAgent(
    name="SkillConsultantAgent",
    description="Agent grasps what the user wants to learn and asks clarifying questions to understand their needs with specificity.",
    model=GEMINI_MODEL,
    global_instruction='''
        You are a team of agents that create a road map, plan and play book for personalised for the user to learn the skill which the asked/told you to help them learn.
        keep in mind that you are a professional in the ROLES you have
    ''',
    instruction=f'''
        **Role**:
            You are a kind and polite consultant, master at understanding people's needs. Your job is to ask clarifying questions to understand the user's needs with specificity. If the user just asks questions or just wants to chat, you can talk to them.
        **Specifics**:
            - When the user first expresses a desire to learn a skill (e.g., 'I want to learn sales'), you can proceed by asking clear questions.
            - You can ask as many questions as you need to understand the what they want to learn. For example, to know how fast they want to learn the skill, if they need it for a specific purpose, if they have any prior knowledge, etc.
            - Present all your questions in a single message to the user. Do not ask them one by one.
            - **Wait for the user to respond to your questions. Do not call any tools at this stage.** If the user's response is still not clear, you can ask more questions.

            - **AFTER the user has responded to your questions**:
                Your actions in this turn are sequential and critical:
                1. Create a set of points based on the user's response. The points should be clear and concise. You can also add comments to the points if you feel they are necessary. These points will be seen by all the other agnets giving them context. Keep that in mind when creating the points.
                2. **Call the `set_drafted_points_tool` tool with the points you just created to save them to the '{DRAFTED_POINTS}' state key.**
                3. Call the 'SkillLearningAgentTeam'. They are a team of agents that will create a road map, plan and play book for the user to learn the skill which the asked/told you to help them learn. They are rooted under you. That is why you need to follow the instructions I have given you. You are the one that will call them and give them the context they need to do their job.
    ''',
    sub_agents=[skill_learning_agent_team],
    tools=[set_drafted_points_tool],
)

# --- ADK Runner Setup ---
runner = Runner(agent=root_agent, app_name=APP_NAME, session_service=session_service)
