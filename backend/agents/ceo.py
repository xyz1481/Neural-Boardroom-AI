import os
from dotenv import load_dotenv
from crewai import Agent, Task, Crew, Process
from langchain_groq import ChatGroq
from .researcher import researcher_agent

load_dotenv()

# Setup LLM
llm = ChatGroq(
    api_key=os.getenv("GROQ_API_KEY"),
    model_name="llama3-70b-8192"
)

# Agents
ceo_agent = Agent(
    role='CEO',
    goal='Lead the startup strategy and coordinate all departments.',
    backstory='A visionary leader with a background in scaling tech startups.',
    llm=llm,
    verbose=True
)

cto_agent = Agent(
    role='CTO',
    goal='Define the technical architecture and innovation roadmap.',
    backstory='A veteran engineer who builds scalable and future-proof systems.',
    llm=llm,
    verbose=True
)

cfo_agent = Agent(
    role='CFO',
    goal='Manage financial planning and risk assessment.',
    backstory='An expert in fundraising, burn rates, and financial sustainability.',
    llm=llm,
    verbose=True
)

cmo_agent = Agent(
    role='CMO',
    goal='Drive market growth and brand positioning.',
    backstory='A creative marketer who turns complex tech into mass-market appeal.',
    llm=llm,
    verbose=True
)

def run_startup_simulation(objective):
    # Tasks
    research_task = Task(description=f'Research the market for {objective}', agent=researcher_agent)
    tech_task = Task(description=f'Design the tech stack for {objective}', agent=cto_agent)
    finance_task = Task(description=f'Financial plan for {objective}', agent=cfo_agent)
    marketing_task = Task(description=f'Marketing strategy for {objective}', agent=cmo_agent)
    ceo_task = Task(description=f'Finalize the strategy for {objective}', agent=ceo_agent)

    # Crew
    crew = Crew(
        agents=[researcher_agent, cto_agent, cfo_agent, cmo_agent, ceo_agent],
        tasks=[research_task, tech_task, finance_task, marketing_task, ceo_task],
        process=Process.sequential,
        verbose=True
    )

    return crew.kickoff()
