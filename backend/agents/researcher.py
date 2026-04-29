import os
from crewai import Agent, Task, Crew, Process
from config import GEMINI_API_KEY, GEMINI_MODEL
from graph.state import StartupState

def researcher_node(state: StartupState) -> dict:
    # CrewAI uses LiteLLM under the hood. 
    # For Gemini, the model string should be "gemini/gemini-1.5-flash" (or your specific model)
    # And the API key must be in the environment variable GOOGLE_API_KEY
    os.environ["GOOGLE_API_KEY"] = GEMINI_API_KEY
    
    # Map the model name if it's just the plain name
    model_name = GEMINI_MODEL
    if not model_name.startswith("gemini/"):
        model_name = f"gemini/{model_name}"

    # Define specialized agents
    market_analyst = Agent(
        role='Market Analyst',
        goal=f'Analyze the market potential and trends for the startup idea: {state["idea"]}',
        backstory='You are a seasoned market researcher with experience in identifying high-growth opportunities.',
        allow_delegation=False,
        llm=model_name,
        verbose=True
    )

    competitor_researcher = Agent(
        role='Competitor Specialist',
        goal=f'Identify and analyze 3 key competitors for the idea: {state["idea"]}',
        backstory='You are an expert at finding hidden competitors and understanding their market positioning.',
        allow_delegation=False,
        llm=model_name,
        verbose=True
    )

    # Define tasks
    analysis_task = Task(
        description=f'Provide a detailed market analysis for {state["idea"]}. Focus on size, growth, and key trends.',
        agent=market_analyst,
        expected_output='A structured report on market size, growth potential, and top 3 trends.'
    )

    competitor_task = Task(
        description=f'List the top 3 competitors for {state["idea"]} and highlight their main strengths and weaknesses.',
        agent=competitor_researcher,
        expected_output='A comparative analysis of 3 competitors with clear pros and cons for each.'
    )

    # Form the Crew
    research_crew = Crew(
        agents=[market_analyst, competitor_researcher],
        tasks=[analysis_task, competitor_task],
        process=Process.sequential
    )

    # Execute the crew
    # In a real app, this might be slow, but for a "Deep Researcher" it's expected.
    try:
        result = research_crew.kickoff()
        
        # Use the actual result text for the boardroom feed
        text_content = str(result)
        
        step_log = {
            "agent": "Researcher",
            "type": "crewai",
            "text": text_content
        }
        
        return {
            "research_data": text_content,
            "steps": [step_log]
        }
    except Exception as e:
        print(f"Researcher Crew Error: {e}")
        return {
            "research_data": "Research failed, but proceeding with baseline estimates.",
            "steps": [{"agent": "Researcher", "type": "error", "text": "Research crew encountered an issue."}]
        }
